// src/services/partner.service.ts
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreatePartnerDto } from '../types';

export class PartnerService {
  // Create partner account
  static async createPartner(userId: string, data: CreatePartnerDto) {
    // Check if user already has a partner account
    const existingPartner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (existingPartner) {
      throw new AppError(409, 'Partner account already exists');
    }

    // Update user role to PARTNER and create partner record
    const [user, partner] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: 'PARTNER' },
      }),
      prisma.partner.create({
        data: {
          userId,
          companyName: data.companyName,
          taxInfo: data.taxInfo,
        },
      }),
    ]);

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: 'admin', // We'll need to get actual admin IDs
        type: 'NEW_PARTNER_REQUEST',
        title: 'New Partner Request',
        body: `${data.companyName} has requested partner verification`,
      },
    });

    return partner;
  }

  // Get partner by user ID
  static async getPartnerByUserId(userId: string) {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        studios: {
          include: {
            _count: {
              select: {
                classes: true,
              },
            },
          },
        },
      },
    });

    if (!partner) {
      throw new AppError(404, 'Partner not found');
    }

    return partner;
  }

  // Update partner info
  static async updatePartner(partnerId: string, data: Partial<CreatePartnerDto>) {
    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        companyName: data.companyName,
        taxInfo: data.taxInfo,
      },
    });

    return partner;
  }

  // Get partner analytics
  static async getPartnerAnalytics(partnerId: string, dateRange?: { start: Date; end: Date }) {
    const start = dateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = dateRange?.end || new Date();

    // Get all studios for this partner
    const studios = await prisma.studio.findMany({
      where: { partnerId },
      select: { id: true },
    });

    const studioIds = studios.map(s => s.id);

    // Get booking stats
    const bookingStats = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        session: {
          class: {
            studioId: { in: studioIds },
          },
          startTime: { gte: start, lte: end },
        },
      },
      _count: true,
    });

    // Get revenue
    const revenue = await prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
        session: {
          class: {
            studioId: { in: studioIds },
          },
          startTime: { gte: start, lte: end },
        },
      },
      _sum: {
        amountPaid: true,
      },
    });

    // Get popular classes
    const popularClasses = await prisma.booking.groupBy({
      by: ['sessionId'],
      where: {
        session: {
          class: {
            studioId: { in: studioIds },
          },
          startTime: { gte: start, lte: end },
        },
      },
      _count: true,
      orderBy: {
        _count: {
          sessionId: 'desc',
        },
      },
      take: 5,
    });

    // Get daily bookings for chart
    const dailyBookings = await prisma.$queryRaw`
      SELECT 
        DATE(s."startTime") as date,
        COUNT(b.id) as bookings,
        SUM(CASE WHEN b.status = 'COMPLETED' THEN b."amountPaid" ELSE 0 END) as revenue
      FROM "Booking" b
      JOIN "Session" s ON b."sessionId" = s.id
      JOIN "Class" c ON s."classId" = c.id
      WHERE c."studioId" = ANY(${studioIds})
        AND s."startTime" >= ${start}
        AND s."startTime" <= ${end}
      GROUP BY DATE(s."startTime")
      ORDER BY date DESC
    `;

    return {
      summary: {
        totalBookings: bookingStats.reduce((acc, stat) => acc + stat._count, 0),
        completedBookings: bookingStats.find(s => s.status === 'COMPLETED')?._count ?? 0,
        cancelledBookings: bookingStats.find(s => s.status === 'CANCELLED')?._count ?? 0,
        totalRevenue: revenue._sum.amountPaid ?? 0,
        totalStudios: studios.length,
      },
      bookingsByStatus: bookingStats,
      popularClasses,
      dailyStats: dailyBookings,
    };
  }

  // Get partner studios
  static async getPartnerStudios(partnerId: string, options?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      partnerId,
      ...(options?.isActive !== undefined && { isActive: options.isActive }),
    };

    const [studios, total] = await Promise.all([
      prisma.studio.findMany({
        where,
        include: {
          _count: {
            select: {
              classes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.studio.count({ where }),
    ]);

    return {
      studios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Request verification
  static async requestVerification(partnerId: string) {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!partner) {
      throw new AppError(404, 'Partner not found');
    }

    if (partner.isVerified) {
      throw new AppError(400, 'Partner already verified');
    }

    // Get admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    // Create notifications for all admins
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        type: 'PARTNER_VERIFICATION_REQUEST',
        title: 'Partner Verification Request',
        body: `${partner.companyName} has requested verification`,
      })),
    });

    return { message: 'Verification request sent successfully' };
  }
}
