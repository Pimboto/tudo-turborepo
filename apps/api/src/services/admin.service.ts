// src/services/admin.service.ts
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AdminDashboardData } from '../types';

export class AdminService {
  // Get dashboard overview
  static async getDashboardOverview(): Promise<AdminDashboardData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalPartners,
      verifiedPartners,
      pendingPartners,
      totalStudios,
      totalBookings,
      revenueData,
      activeUsers,
      dailyMetrics,
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where: { role: 'CLIENT' } }),
      
      // Total partners
      prisma.partner.count(),
      
      // Verified partners
      prisma.partner.count({ where: { isVerified: true } }),
      
      // Pending partners
      prisma.partner.count({ where: { isVerified: false } }),
      
      // Total studios
      prisma.studio.count({ where: { isActive: true } }),
      
      // Total bookings
      prisma.booking.count(),
      
      // Total revenue
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amountPaid: true },
      }),
      
      // Active users (booked in last 30 days)
      prisma.user.count({
        where: {
          role: 'CLIENT',
          bookings: {
            some: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      }),
      
      // Daily metrics for last 7 days
      prisma.$queryRaw`
        SELECT 
          DATE(b."createdAt") as date,
          COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END) as bookings,
          COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b."amountPaid" END), 0) as revenue,
          COUNT(DISTINCT CASE WHEN u."createdAt" >= DATE(b."createdAt") THEN u.id END) as "newUsers"
        FROM "Booking" b
        CROSS JOIN "User" u
        WHERE b."createdAt" >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE(b."createdAt")
        ORDER BY date DESC
      `,
    ]);

    return {
      totalUsers,
      totalPartners,
      verifiedPartners,
      pendingPartners,
      totalStudios,
      totalBookings,
      totalRevenue: revenueData._sum.amountPaid ?? 0,
      activeUsers,
      recentMetrics: dailyMetrics as any,
    };
  }

  // Get system metrics
  static async getSystemMetrics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const metrics = await prisma.systemMetrics.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'desc' },
    });

    return metrics;
  }

  // Update daily metrics (should be run by a cron job)
  static async updateDailyMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalPartners,
      totalStudios,
      totalBookings,
      revenueData,
      activeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.partner.count(),
      prisma.studio.count(),
      prisma.booking.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.booking.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: today },
        },
        _sum: { amountPaid: true },
      }),
      prisma.user.count({
        where: {
          bookings: {
            some: {
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
          },
        },
      }),
    ]);

    await prisma.systemMetrics.upsert({
      where: { date: today },
      create: {
        date: today,
        totalUsers,
        totalPartners,
        totalStudios,
        totalBookings,
        totalRevenue: revenueData._sum.amountPaid ?? 0,
        activeUsers,
      },
      update: {
        totalUsers,
        totalPartners,
        totalStudios,
        totalBookings,
        totalRevenue: revenueData._sum.amountPaid ?? 0,
        activeUsers,
      },
    });
  }

  // Get pending partner verifications
  static async getPendingVerifications(options?: {
    page?: number;
    limit?: number;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where: { isVerified: false },
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
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.partner.count({ where: { isVerified: false } }),
    ]);

    return {
      partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Verify partner
  static async verifyPartner(partnerId: string, adminId: string) {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new AppError(404, 'Partner not found');
    }

    if (partner.isVerified) {
      throw new AppError(400, 'Partner already verified');
    }

    const verified = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: partner.userId,
        type: 'PARTNER_VERIFIED',
        title: 'Partner Account Verified',
        body: 'Congratulations! Your partner account has been verified. You can now create studios and classes.',
      },
    });

    return verified;
  }

  // Get all users with filters
  static async getUsers(options?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (options?.role) {
      where.role = options.role;
    }

    if (options?.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { profile: { fullName: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          partner: true,
          _count: {
            select: {
              bookings: true,
              referrals: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get revenue reports
  static async getRevenueReport(startDate: Date, endDate: Date) {
    const [totalRevenue, revenueByStudio, revenueByDay, topClasses] = await Promise.all([
      // Total revenue
      prisma.booking.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amountPaid: true },
      }),

      // Revenue by studio
      prisma.$queryRaw`
        SELECT 
          s.id,
          s.name,
          COUNT(DISTINCT b.id) as bookings,
          SUM(b."amountPaid") as revenue,
          AVG(b."amountPaid") as "avgBookingValue"
        FROM "Studio" s
        JOIN "Class" c ON c."studioId" = s.id
        JOIN "Session" se ON se."classId" = c.id
        JOIN "Booking" b ON b."sessionId" = se.id
        WHERE b.status = 'COMPLETED'
          AND b."createdAt" >= ${startDate}
          AND b."createdAt" <= ${endDate}
        GROUP BY s.id, s.name
        ORDER BY revenue DESC
        LIMIT 10
      `,

      // Revenue by day
      prisma.$queryRaw`
        SELECT 
          DATE(b."createdAt") as date,
          COUNT(*) as bookings,
          SUM(b."amountPaid") as revenue
        FROM "Booking" b
        WHERE b.status = 'COMPLETED'
          AND b."createdAt" >= ${startDate}
          AND b."createdAt" <= ${endDate}
        GROUP BY DATE(b."createdAt")
        ORDER BY date
      `,

      // Top performing classes
      prisma.$queryRaw`
        SELECT 
          c.id,
          c.title,
          s.name as "studioName",
          COUNT(DISTINCT b.id) as bookings,
          SUM(b."amountPaid") as revenue
        FROM "Class" c
        JOIN "Studio" s ON c."studioId" = s.id
        JOIN "Session" se ON se."classId" = c.id
        JOIN "Booking" b ON b."sessionId" = se.id
        WHERE b.status = 'COMPLETED'
          AND b."createdAt" >= ${startDate}
          AND b."createdAt" <= ${endDate}
        GROUP BY c.id, c.title, s.name
        ORDER BY revenue DESC
        LIMIT 10
      `,
    ]);

    return {
      totalRevenue: totalRevenue._sum.amountPaid ?? 0,
      revenueByStudio,
      revenueByDay,
      topClasses,
    };
  }
}
