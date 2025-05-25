// src/services/booking.service.ts
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreateBookingDto } from '../types';
import { generateBookingCode, canBookSession } from '../utils/helpers';

export class BookingService {
  // Create booking
  static async createBooking(userId: string, data: CreateBookingDto) {
    const { sessionId } = data;

    // Get session with class info
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new AppError(404, 'Session not found');
    }

    // Check if user already has a booking for this session
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        sessionId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });

    if (existingBooking) {
      throw new AppError(400, 'You already have a booking for this session');
    }

    // Validate if session can be booked
    if (!canBookSession(session, session._count.bookings)) {
      throw new AppError(400, 'Session is not available for booking');
    }

    // Check if session is full
    if (session._count.bookings >= session.class.maxCapacity) {
      throw new AppError(400, 'Session is full');
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        sessionId,
        bookingCode: generateBookingCode(),
        status: 'CONFIRMED',
        amountPaid: session.class.basePrice,
      },
      include: {
        session: {
          include: {
            class: {
              include: {
                studio: true,
              },
            },
          },
        },
      },
    });

    // Update session capacity
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        actualCapacity: { increment: 1 },
      },
    });

    // Create confirmation notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        body: `Your booking for ${session.class.title} has been confirmed. Booking code: ${booking.bookingCode}`,
      },
    });

    return booking;
  }

  // Get booking by ID
  static async getBookingById(bookingId: string, userId?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        session: {
          include: {
            class: {
              include: {
                studio: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    // If userId is provided, verify ownership
    if (userId && booking.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    return booking;
  }

  // Cancel booking
  static async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      include: {
        session: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new AppError(400, 'Only confirmed bookings can be cancelled');
    }

    // Check cancellation policy (e.g., cannot cancel within 2 hours)
    const hoursUntilSession = Math.floor(
      (booking.session.startTime.getTime() - Date.now()) / (1000 * 60 * 60)
    );

    if (hoursUntilSession < 2) {
      throw new AppError(400, 'Cannot cancel booking within 2 hours of session start');
    }

    // Cancel booking
    const cancelled = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    // Update session capacity
    await prisma.session.update({
      where: { id: booking.sessionId },
      data: {
        actualCapacity: { decrement: 1 },
      },
    });

    // Create cancellation notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        body: `Your booking for ${booking.session.class.title} has been cancelled.`,
      },
    });

    // TODO: Process refund

    return cancelled;
  }

  // Check-in to session
  static async checkIn(bookingId: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      include: {
        session: true,
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new AppError(400, 'Booking is not confirmed');
    }

    if (booking.checkedInAt) {
      throw new AppError(400, 'Already checked in');
    }

    // Check if it's within check-in window (e.g., 30 minutes before to 15 minutes after)
    const now = new Date();
    const sessionStart = new Date(booking.session.startTime);
    const checkInWindowStart = new Date(sessionStart.getTime() - 30 * 60 * 1000);
    const checkInWindowEnd = new Date(sessionStart.getTime() + 15 * 60 * 1000);

    if (now < checkInWindowStart || now > checkInWindowEnd) {
      throw new AppError(400, 'Check-in is only available 30 minutes before to 15 minutes after session start');
    }

    // Update booking
    const checkedIn = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        checkedInAt: now,
        status: 'COMPLETED',
      },
    });

    return checkedIn;
  }

  // Get booking by code
  static async getBookingByCode(bookingCode: string) {
    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        session: {
          include: {
            class: {
              include: {
                studio: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    return booking;
  }

  // Check-in by code (for partners)
  static async checkInByCode(bookingCode: string, partnerId: string) {
    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        session: {
          include: {
            class: {
              include: {
                studio: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    // Verify partner owns the studio
    if (booking.session.class.studio.partnerId !== partnerId) {
      throw new AppError(403, 'Access denied');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new AppError(400, 'Booking is not confirmed');
    }

    if (booking.checkedInAt) {
      throw new AppError(400, 'Already checked in');
    }

    // Update booking
    const checkedIn = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        checkedInAt: new Date(),
        status: 'COMPLETED',
      },
    });

    return checkedIn;
  }

  // Mark no-show
  static async markNoShow(sessionId: string, partnerId: string) {
    // Verify partner owns the session
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        class: {
          studio: { partnerId },
        },
      },
    });

    if (!session) {
      throw new AppError(404, 'Session not found or access denied');
    }

    // Check if session has ended
    if (new Date() < new Date(session.endTime)) {
      throw new AppError(400, 'Session has not ended yet');
    }

    // Update all confirmed bookings that weren't checked in to NO_SHOW
    const updated = await prisma.booking.updateMany({
      where: {
        sessionId,
        status: 'CONFIRMED',
        checkedInAt: null,
      },
      data: {
        status: 'NO_SHOW',
      },
    });

    return { count: updated.count };
  }

  // Get QR code data for booking
  static async getBookingQRData(bookingId: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
      select: {
        id: true,
        bookingCode: true,
        session: {
          select: {
            startTime: true,
            class: {
              select: {
                title: true,
                studio: {
                  select: {
                    name: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new AppError(404, 'Booking not found');
    }

    return {
      bookingCode: booking.bookingCode,
      sessionInfo: {
        className: booking.session.class.title,
        studioName: booking.session.class.studio.name,
        address: booking.session.class.studio.address,
        startTime: booking.session.startTime,
      },
    };
  }
}
