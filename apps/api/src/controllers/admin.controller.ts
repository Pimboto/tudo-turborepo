// src/controllers/admin.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { AdminService } from '../services/admin.service';
import { successResponse, getPagination } from '../utils/helpers';
// Import dependencies at the top
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';

export class AdminController {
  // Get dashboard overview
  static async getDashboard(req: AuthenticatedRequest, res: Response) {
    const dashboard = await AdminService.getDashboardOverview();
    
    res.json(successResponse(dashboard));
  }

  // Get system metrics
  static async getMetrics(req: AuthenticatedRequest, res: Response) {
    const { startDate, endDate } = req.query;
    
    const metrics = await AdminService.getSystemMetrics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json(successResponse(metrics));
  }

  // Get pending verifications
  static async getPendingVerifications(req: AuthenticatedRequest, res: Response) {
    const { page, limit } = getPagination(req.query);
    
    const result = await AdminService.getPendingVerifications({ page, limit });
    
    res.json(successResponse(result.partners, undefined, result.pagination));
  }

  // Verify partner
  static async verifyPartner(req: AuthenticatedRequest, res: Response) {
    const adminId = req.user!.id;
    const { id } = req.params;
    
    const verified = await AdminService.verifyPartner(id, adminId);
    
    res.json(successResponse(verified, 'Partner verified successfully'));
  }

  // Reject partner verification
  static async rejectPartner(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Update partner and send notification
    const partner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new AppError(404, 'Partner not found');
    }

    // Create rejection notification
    await prisma.notification.create({
      data: {
        userId: partner.userId,
        type: 'PARTNER_REJECTED',
        title: 'Partner Verification Rejected',
        body: reason ?? 'Your partner verification request has been rejected. Please contact support for more information.',
      },
    });
    
    res.json(successResponse(null, 'Partner verification rejected'));
  }

  // Get all users
  static async getUsers(req: AuthenticatedRequest, res: Response) {
    const { page, limit } = getPagination(req.query);
    const { role, search } = req.query;
    
    const result = await AdminService.getUsers({
      page,
      limit,
      role: role as string,
      search: search as string,
    });
    
    res.json(successResponse(result.users, undefined, result.pagination));
  }

  // Get revenue report
  static async getRevenueReport(req: AuthenticatedRequest, res: Response) {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError(400, 'Start date and end date are required');
    }
    
    const report = await AdminService.getRevenueReport(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    res.json(successResponse(report));
  }

  // Update user status
  static async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { verified } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { verified },
    });
    
    res.json(successResponse(user, 'User status updated successfully'));
  }

  // Get all bookings
  static async getBookings(req: AuthenticatedRequest, res: Response) {
    const { page, limit } = getPagination(req.query);
    const { status, studioId, startDate, endDate } = req.query;
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (studioId) {
      where.session = {
        class: {
          studioId: studioId as string,
        },
      };
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);
    
    res.json(successResponse(bookings, undefined, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  }

  // Get all studios
  static async getStudios(req: AuthenticatedRequest, res: Response) {
    const { page, limit } = getPagination(req.query);
    const { isActive, partnerId } = req.query;
    
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (partnerId) {
      where.partnerId = partnerId as string;
    }
    
    const [studios, total] = await Promise.all([
      prisma.studio.findMany({
        where,
        include: {
          partner: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.studio.count({ where }),
    ]);
    
    res.json(successResponse(studios, undefined, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  }

  // Toggle studio status
  static async toggleStudioStatus(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    
    const studio = await prisma.studio.findUnique({
      where: { id },
    });
    
    if (!studio) {
      throw new AppError(404, 'Studio not found');
    }
    
    const updated = await prisma.studio.update({
      where: { id },
      data: { isActive: !studio.isActive },
    });
    
    res.json(successResponse(updated, `Studio ${updated.isActive ? 'activated' : 'deactivated'} successfully`));
  }
}


