// src/controllers/user.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { UserService } from '../services/user.service';
import { successResponse, getPagination } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  // Get user profile
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const user = await UserService.getUserById(userId);
    
    res.json(successResponse(user));
  }

  // Update user profile
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const profile = await UserService.updateProfile(userId, req.body);
    
    res.json(successResponse(profile, 'Profile updated successfully'));
  }

  // Get user bookings
  static async getBookings(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = getPagination(req.query);
    const status = req.query.status as string | undefined;

    const result = await UserService.getUserBookings(userId, {
      status,
      page,
      limit,
    });

    res.json(successResponse(result.bookings, undefined, result.pagination));
  }

  // Get user notifications
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = getPagination(req.query);
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await UserService.getUserNotifications(userId, {
      unreadOnly,
      page,
      limit,
    });

    res.json(successResponse(result.notifications, undefined, result.pagination));
  }

  // Mark notification as read
  static async markNotificationRead(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { id } = req.params;

    await UserService.markNotificationAsRead(id, userId);
    
    res.json(successResponse(null, 'Notification marked as read'));
  }

  // Mark all notifications as read
  static async markAllNotificationsRead(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
    
    res.json(successResponse(null, 'All notifications marked as read'));
  }

  // Get referral info
  static async getReferralInfo(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const stats = await UserService.getReferralStats(userId);
    
    res.json(successResponse(stats));
  }

  // Get user preferences
  static async getPreferences(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    if (!profile) {
      throw new AppError(404, 'Profile not found');
    }
    
    res.json(successResponse(profile.preferences));
  }

  // Update user preferences
  static async updatePreferences(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { amenities, classTypes, zones } = req.body;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        preferences: {
          amenities: amenities ?? [],
          classTypes: classTypes ?? [],
          zones: zones ?? [],
        },
      },
    });
    
    res.json(successResponse(profile.preferences, 'Preferences updated successfully'));
  }

  // Get booking history
  static async getBookingHistory(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = getPagination(req.query);

    const where = {
      userId,
      status: {
        in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
      },
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          session: {
            include: {
              class: {
                include: {
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

  // Get upcoming classes
  static async getUpcomingClasses(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const { page, limit } = getPagination(req.query);

    const where = {
      userId,
      status: 'CONFIRMED',
      session: {
        startTime: {
          gte: new Date(),
        },
        status: 'SCHEDULED',
      },
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          session: {
            include: {
              class: {
                include: {
                  studio: {
                    select: {
                      name: true,
                      address: true,
                      lat: true,
                      lng: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          session: {
            startTime: 'asc',
          },
        },
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

  // Get user stats
  static async getUserStats(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;

    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      totalCredits,
      favoriteStudio,
    ] = await Promise.all([
      prisma.booking.count({ where: { userId } }),
      prisma.booking.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.booking.count({ where: { userId, status: 'CANCELLED' } }),
      prisma.booking.count({ 
        where: { 
          userId, 
          status: 'CONFIRMED',
          session: {
            startTime: { gte: new Date() }
          }
        } 
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }),
      prisma.booking.groupBy({
        by: ['sessionId'],
        where: { userId, status: 'COMPLETED' },
        _count: true,
        orderBy: { _count: { sessionId: 'desc' } },
        take: 1,
      }),
    ]);

    res.json(successResponse({
      totalBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      credits: totalCredits?.credits ?? 0,
      attendanceRate: totalBookings > 0 
        ? Math.round((completedBookings / totalBookings) * 100) 
        : 0,
    }));
  }
}

// Import prisma at the top of the file
import { prisma } from '../prisma/client';
