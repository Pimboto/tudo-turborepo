// src/controllers/partner.controller.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { PartnerService } from "../services/partner.service";
import { successResponse, getPagination } from "../utils/helpers";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../prisma/client";

export class PartnerController {
  // Register as partner
  static async register(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;

    // Check if user is already a partner
    if (req.user!.role === "PARTNER") {
      throw new AppError(400, "User is already a partner");
    }

    const partner = await PartnerService.createPartner(userId, req.body);

    res
      .status(201)
      .json(successResponse(partner, "Partner account created successfully"));
  }

  // Get partner profile
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const partner = await PartnerService.getPartnerByUserId(userId);

    res.json(successResponse(partner));
  }

  // Update partner profile
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const updated = await PartnerService.updatePartner(partner.id, req.body);

    res.json(successResponse(updated, "Partner profile updated successfully"));
  }

  // Get partner dashboard data
  static async getDashboard(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const [
      analytics,
      recentBookings,
      upcomingSessions,
      totalStudios,
      totalClasses,
    ] = await Promise.all([
      PartnerService.getPartnerAnalytics(partner.id),
      // Recent bookings
      prisma.booking.findMany({
        where: {
          session: {
            class: {
              studio: {
                partnerId: partner.id,
              },
            },
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
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
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Upcoming sessions
      prisma.session.findMany({
        where: {
          class: {
            studio: {
              partnerId: partner.id,
            },
          },
          startTime: {
            gte: new Date(),
          },
          status: "SCHEDULED",
        },
        include: {
          class: {
            include: {
              studio: true,
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      // Total studios
      prisma.studio.count({
        where: { partnerId: partner.id },
      }),
      // Total classes
      prisma.class.count({
        where: {
          studio: {
            partnerId: partner.id,
          },
        },
      }),
    ]);

    res.json(
      successResponse({
        partner,
        analytics,
        recentBookings,
        upcomingSessions,
        stats: {
          totalStudios,
          totalClasses,
        },
      })
    );
  }

  // Get partner analytics
  static async getAnalytics(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const analytics =
      startDate && endDate
        ? await PartnerService.getPartnerAnalytics(partner.id, {
            start: new Date(startDate as string),
            end: new Date(endDate as string),
          })
        : await PartnerService.getPartnerAnalytics(partner.id);

    res.json(successResponse(analytics));
  }

  // Get partner studios
  static async getStudios(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = getPagination(req.query);
    const options: { page: number; limit: number; isActive?: boolean } = {
      page,
      limit,
    };
    if (req.query.isActive === "true") options.isActive = true;
    if (req.query.isActive === "false") options.isActive = false;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const result = await PartnerService.getPartnerStudios(partner.id, options);

    res.json(successResponse(result.studios, undefined, result.pagination));
  }

  // Request verification
  static async requestVerification(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const result = await PartnerService.requestVerification(partner.id);

    res.json(successResponse(result));
  }

  // Get earnings
  static async getEarnings(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = getPagination(req.query);
    const { startDate, endDate } = req.query;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const studios = await prisma.studio.findMany({
      where: { partnerId: partner.id },
      select: { id: true },
    });

    const studioIds = studios.map((s) => s.id);

    const where: any = {
      session: {
        class: {
          studioId: { in: studioIds },
        },
        ...(startDate &&
          endDate && {
            startTime: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          }),
      },
    };

    const [earnings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          amountPaid: true,
          createdAt: true,
          session: {
            select: {
              startTime: true,
              class: {
                select: {
                  title: true,
                  studio: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Calculate earnings with commission
    const earningsWithCommission = earnings.map((booking) => ({
      ...booking,
      commission: booking.amountPaid * partner.commissionRate,
      netEarning: booking.amountPaid * (1 - partner.commissionRate),
    }));

    const totalAmount = await prisma.booking.aggregate({
      where,
      _sum: {
        amountPaid: true,
      },
    });

    const totalRevenue = totalAmount._sum?.amountPaid ?? 0;

    res.json(
      successResponse(
        {
          earnings: earningsWithCommission,
          summary: {
            totalRevenue,
            totalCommission: totalRevenue * partner.commissionRate,
            netEarnings: totalRevenue * (1 - partner.commissionRate),
            commissionRate: partner.commissionRate,
          },
        },
        undefined,
        {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      )
    );
  }

  // Get partner bookings
  static async getBookings(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = getPagination(req.query);
    const { status, studioId } = req.query;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const studios = await prisma.studio.findMany({
      where: {
        partnerId: partner.id,
        ...(studioId && { id: studioId as string }),
      },
      select: { id: true },
    });

    const studioIds = studios.map((s) => s.id);

    const where: any = {
      session: {
        class: {
          studioId: { in: studioIds },
        },
      },
    };

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json(
      successResponse(bookings, undefined, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  }
}
