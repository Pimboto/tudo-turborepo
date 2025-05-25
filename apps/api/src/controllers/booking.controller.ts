// src/controllers/booking.controller.ts - CORREGIDO tipos de parámetros
import { Response, Request } from 'express';
import { AuthenticatedRequest } from '../types';
import { BookingService } from '../services/booking.service';
import { successResponse } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../prisma/client';

export class BookingController {
  // Create booking
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const booking = await BookingService.createBooking(userId, req.body);
    
    res.status(201).json(
      successResponse(booking, 'Booking created successfully')
    );
  }

  // Get booking by ID
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const booking = await BookingService.getBookingById(id, userId);
    
    res.json(successResponse(booking));
  }

  // Cancel booking
  static async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const cancelled = await BookingService.cancelBooking(id, userId);
    
    res.json(successResponse(cancelled, 'Booking cancelled successfully'));
  }

  // Check-in
  static async checkIn(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const checkedIn = await BookingService.checkIn(id, userId);
    
    res.json(successResponse(checkedIn, 'Checked in successfully'));
  }

  // Get booking QR data
  static async getQRData(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const qrData = await BookingService.getBookingQRData(id, userId);
    
    res.json(successResponse(qrData));
  }

  // Get booking by code (Partner)
  static async getByCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { code } = req.params;
    
    // Verify user is a partner
    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(403, 'Partner access required');
    }

    const booking = await BookingService.getBookingByCode(code);
    
    // Verify partner owns the studio
    if (booking.session.class.studio.partnerId !== partner.id) {
      throw new AppError(403, 'Access denied');
    }
    
    res.json(successResponse(booking));
  }

  // Check-in by code (Partner)
  static async checkInByCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { code } = req.params;
    
    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(403, 'Partner access required');
    }

    const checkedIn = await BookingService.checkInByCode(code, partner.id);
    
    res.json(successResponse(checkedIn, 'Checked in successfully'));
  }

  // Mark no-shows for a session (Partner)
  static async markNoShows(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    
    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(403, 'Partner access required');
    }

    const result = await BookingService.markNoShow(sessionId, partner.id);
    
    res.json(successResponse(result, `${result.count} bookings marked as no-show`));
  }

  // Get available sessions for booking (Public)
  static async getAvailableSessions(req: Request, res: Response): Promise<void> {
    const { studioId, classId, date } = req.query;
    
    const where: Record<string, any> = {
      status: 'SCHEDULED',
      startTime: { gte: new Date() },
      class: {
        status: 'PUBLISHED',
      },
    };

    if (studioId) {
      where.class.studioId = studioId as string;
    }

    if (classId) {
      where.classId = classId as string;
    }

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.startTime = {
        gte: startDate,
        lt: endDate,
      };
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        class: {
          include: {
            studio: true,
          },
        },
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
      orderBy: { startTime: 'asc' },
      take: 20,
    });

    // Add availability info
    const sessionsWithAvailability = sessions.map(session => ({
      ...session,
      availableSpots: session.class.maxCapacity - session._count.bookings,
      isAvailable: session._count.bookings < session.class.maxCapacity,
    }));

    res.json(successResponse(sessionsWithAvailability));
  }

  // Validate booking code (Public - for QR scanning)
  static async validateCode(req: Request, res: Response): Promise<void> {
    const { code } = req.params;
    
    try {
      const booking = await prisma.booking.findUnique({
        where: { bookingCode: code },
        select: {
          id: true,
          status: true,
          checkedInAt: true,
          session: {
            select: {
              startTime: true,
              class: {
                select: {
                  title: true,
                },
              },
            },
          },
          user: {
            select: {
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Invalid booking code',
        });
        return;
      }

      res.json(successResponse({
        valid: true,
        bookingId: booking.id,
        status: booking.status,
        checkedIn: !!booking.checkedInAt,
        sessionInfo: {
          className: booking.session.class.title,
          startTime: booking.session.startTime,
        },
        userName: booking.user.profile?.fullName,
      }));
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Invalid booking code',
      });
    }
  }
}
