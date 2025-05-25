// src/services/class.service.ts
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreateClassDto, CreateSessionDto } from '../types';
import { calculateEndTime } from '../utils/helpers';

export class ClassService {
  // Create class
  static async createClass(studioId: string, partnerId: string, data: CreateClassDto) {
    // Verify studio belongs to partner
    const studio = await prisma.studio.findFirst({
      where: { id: studioId, partnerId },
    });

    if (!studio) {
      throw new AppError(404, 'Studio not found or access denied');
    }

    const newClass = await prisma.class.create({
      data: {
        studioId,
        title: data.title,
        description: data.description,
        type: data.type,
        durationMinutes: data.durationMinutes,
        maxCapacity: data.maxCapacity,
        basePrice: data.basePrice,
        photos: data.photos,
        amenities: data.amenities,
        status: 'DRAFT',
      },
    });

    return newClass;
  }

  // Get class by ID
  static async getClassById(classId: string) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        studio: {
          include: {
            partner: {
              select: {
                isVerified: true,
              },
            },
          },
        },
        sessions: {
          where: {
            status: 'SCHEDULED',
            startTime: { gte: new Date() },
          },
          orderBy: { startTime: 'asc' },
          take: 10,
          include: {
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
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    if (!classData) {
      throw new AppError(404, 'Class not found');
    }

    return classData;
  }

  // Update class
  static async updateClass(classId: string, partnerId: string, data: Partial<CreateClassDto>) {
    // Verify ownership
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        studio: { partnerId },
      },
    });

    if (!classData) {
      throw new AppError(404, 'Class not found or access denied');
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        durationMinutes: data.durationMinutes,
        maxCapacity: data.maxCapacity,
        basePrice: data.basePrice,
        photos: data.photos,
        amenities: data.amenities,
      },
    });

    return updated;
  }

  // Delete class
  static async deleteClass(classId: string, partnerId: string) {
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        studio: { partnerId },
      },
    });

    if (!classData) {
      throw new AppError(404, 'Class not found or access denied');
    }

    // Check for upcoming sessions
    const upcomingSessions = await prisma.session.count({
      where: {
        classId,
        startTime: { gte: new Date() },
        status: 'SCHEDULED',
      },
    });

    if (upcomingSessions > 0) {
      throw new AppError(400, 'Cannot delete class with upcoming sessions');
    }

    // Archive instead of delete
    await prisma.class.update({
      where: { id: classId },
      data: { status: 'ARCHIVED' },
    });

    return { message: 'Class archived successfully' };
  }

  // Update class status
  static async updateClassStatus(classId: string, partnerId: string, status: string) {
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        studio: { partnerId },
      },
    });

    if (!classData) {
      throw new AppError(404, 'Class not found or access denied');
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: { status: status as any },
    });

    return updated;
  }

  // Create session
  static async createSession(classId: string, partnerId: string, data: CreateSessionDto) {
    // Verify ownership
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        studio: { partnerId },
      },
    });

    if (!classData) {
      throw new AppError(404, 'Class not found or access denied');
    }

    if (classData.status !== 'PUBLISHED') {
      throw new AppError(400, 'Class must be published to create sessions');
    }

    const startTime = new Date(data.startTime);
    const endTime = calculateEndTime(startTime, classData.durationMinutes);

    // Check for conflicting sessions
    const conflict = await prisma.session.findFirst({
      where: {
        class: {
          studioId: classData.studioId,
        },
        status: 'SCHEDULED',
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
        ],
      },
    });

    if (conflict) {
      throw new AppError(400, 'Session conflicts with existing session');
    }

    const session = await prisma.session.create({
      data: {
        classId,
        startTime,
        endTime,
        instructorName: data.instructorName,
        status: 'SCHEDULED',
      },
    });

    return session;
  }

  // Get sessions for a class
  static async getClassSessions(classId: string, options?: {
    page?: number;
    limit?: number;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      classId,
      ...(options?.status && { status: options.status }),
      ...(options?.fromDate && options?.toDate && {
        startTime: {
          gte: options.fromDate,
          lte: options.toDate,
        },
      }),
    };

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
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
        skip,
        take: limit,
      }),
      prisma.session.count({ where }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Cancel session
  static async cancelSession(sessionId: string, partnerId: string) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        class: {
          studio: { partnerId },
        },
      },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!session) {
      throw new AppError(404, 'Session not found or access denied');
    }

    if (session.status !== 'SCHEDULED') {
      throw new AppError(400, 'Only scheduled sessions can be cancelled');
    }

    // Cancel all bookings and notify users
    if (session.bookings.length > 0) {
      await prisma.$transaction([
        // Cancel all bookings
        prisma.booking.updateMany({
          where: {
            sessionId,
            status: 'CONFIRMED',
          },
          data: { status: 'CANCELLED' },
        }),
        // Create notifications
        prisma.notification.createMany({
          data: session.bookings.map(booking => ({
            userId: booking.userId,
            type: 'SESSION_CANCELLED',
            title: 'Session Cancelled',
            body: 'Your booked session has been cancelled. You will receive a full refund.',
          })),
        }),
      ]);
    }

    // Update session status
    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'CANCELLED' },
    });

    return updated;
  }

  // Duplicate class
  static async duplicateClass(classId: string, partnerId: string) {
    const original = await prisma.class.findFirst({
      where: {
        id: classId,
        studio: { partnerId },
      },
    });

    if (!original) {
      throw new AppError(404, 'Class not found or access denied');
    }

    const duplicate = await prisma.class.create({
      data: {
        studioId: original.studioId,
        title: `${original.title} (Copy)`,
        description: original.description,
        type: original.type,
        durationMinutes: original.durationMinutes,
        maxCapacity: original.maxCapacity,
        basePrice: original.basePrice,
        photos: original.photos as any,
        amenities: original.amenities as any,
        status: 'DRAFT',
      },
    });

    return duplicate;
  }

  // Get class attendees for a session
  static async getSessionAttendees(sessionId: string, partnerId: string) {
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

    const bookings = await prisma.booking.findMany({
      where: {
        sessionId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return bookings;
  }
}
