// src/controllers/studio.controller.ts
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../types";
import { StudioService } from "../services/studio.service";
import { successResponse, getPagination } from "../utils/helpers";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../prisma/client";

export class StudioController {
  // Create studio (Partner only)
  static async create(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    if (!partner.isVerified) {
      throw new AppError(403, "Partner must be verified to create studios");
    }

    const studio = await StudioService.createStudio(partner.id, req.body);

    res
      .status(201)
      .json(successResponse(studio, "Studio created successfully"));
  }

  // Get studio by ID (Public)
  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const studio = await StudioService.getStudioById(id);

    res.json(successResponse(studio));
  }

  // Update studio (Partner only)
  static async update(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const updated = await StudioService.updateStudio(id, partner.id, req.body);

    res.json(successResponse(updated, "Studio updated successfully"));
  }

  // Delete studio (Partner only)
  static async delete(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    const result = await StudioService.deleteStudio(id, partner.id);

    res.json(successResponse(result));
  }

  // Search studios (Public)
  static async search(req: Request, res: Response) {
    const { page, limit } = getPagination(req.query);

    const filters: any = {};

    if (req.query.lat) filters.lat = parseFloat(req.query.lat as string);
    if (req.query.lng) filters.lng = parseFloat(req.query.lng as string);
    if (req.query.radius)
      filters.radius = parseFloat(req.query.radius as string);
    if (req.query.type) filters.type = req.query.type as string;
    if (req.query.amenities)
      filters.amenities = (req.query.amenities as string).split(",");
    if (req.query.minPrice)
      filters.minPrice = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice)
      filters.maxPrice = parseFloat(req.query.maxPrice as string);
    if (req.query.startDate)
      filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate)
      filters.endDate = new Date(req.query.endDate as string);

    const result = await StudioService.searchStudios(filters, { page, limit });

    res.json(successResponse(result.studios, undefined, result.pagination));
  }

  // Get studio classes (Public)
  static async getClasses(req: Request, res: Response) {
    const { id } = req.params;
    const { page, limit } = getPagination(req.query);
    const { status, type } = req.query;

    const result = await StudioService.getStudioClasses(id, {
      page,
      limit,
      status: status as string,
      type: type as string,
    });

    res.json(successResponse(result.classes, undefined, result.pagination));
  }

  // Get studio schedule (Public)
  static async getSchedule(req: Request, res: Response) {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError(400, "Start date and end date are required");
    }

    const schedule = await StudioService.getStudioSchedule(
      id,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(successResponse(schedule));
  }

  // Get studio reviews (Public)
  static async getReviews(req: Request, res: Response) {
    const { id } = req.params;
    const { page, limit } = getPagination(req.query);

    const result = await StudioService.getStudioReviews(id, { page, limit });

    res.json(successResponse(result.reviews, undefined, result.pagination));
  }

  // Get studio analytics (Partner only)
  static async getAnalytics(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const partner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (!partner) {
      throw new AppError(404, "Partner not found");
    }

    // Verify ownership
    const studio = await prisma.studio.findFirst({
      where: { id, partnerId: partner.id },
    });

    if (!studio) {
      throw new AppError(404, "Studio not found or access denied");
    }

    const dateRange = {
      start: startDate
        ? new Date(startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date(),
    };

    // Get analytics
    const [bookingStats, revenueStats, popularClasses, peakHours] =
      await Promise.all([
        // Booking stats
        prisma.booking.groupBy({
          by: ["status"],
          where: {
            session: {
              class: {
                studioId: id,
              },
              startTime: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
          _count: true,
        }),
        // Revenue stats
        prisma.booking.aggregate({
          where: {
            status: "COMPLETED",
            session: {
              class: {
                studioId: id,
              },
              startTime: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
          _sum: {
            amountPaid: true,
          },
          _count: true,
        }),
        // Popular classes
        prisma.booking.groupBy({
          by: ["sessionId"],
          where: {
            session: {
              class: {
                studioId: id,
              },
              startTime: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            },
          },
          _count: true,
          orderBy: {
            _count: {
              sessionId: "desc",
            },
          },
          take: 5,
        }),
        // Peak hours
        prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM s."startTime") as hour,
          COUNT(b.id) as bookings
        FROM "Booking" b
        JOIN "Session" s ON b."sessionId" = s.id
        JOIN "Class" c ON s."classId" = c.id
        WHERE c."studioId" = ${id}
          AND s."startTime" >= ${dateRange.start}
          AND s."startTime" <= ${dateRange.end}
          AND b.status = 'COMPLETED'
        GROUP BY EXTRACT(HOUR FROM s."startTime")
        ORDER BY bookings DESC
      `,
      ]);

    res.json(
      successResponse({
        period: {
          start: dateRange.start,
          end: dateRange.end,
        },
        bookings: {
          total: bookingStats.reduce((acc, stat) => acc + stat._count, 0),
          byStatus: bookingStats,
        },
        revenue: {
          total: revenueStats._sum.amountPaid ?? 0,
          averagePerBooking:
            revenueStats._count > 0
              ? (revenueStats._sum.amountPaid ?? 0) / revenueStats._count
              : 0,
          bookingsCount: revenueStats._count,
        },
        popularClasses,
        peakHours,
      })
    );
  }
}
