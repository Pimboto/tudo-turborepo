// src/services/user.service.ts
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { UpdateProfileDto } from '../types';

export class UserService {
  // Get user by ID
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        partner: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  // Get user by Clerk ID
  static async getUserByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profile: true,
        partner: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  // Update user profile
  static async updateProfile(userId: string, data: UpdateProfileDto) {
    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        address: data.address,
        preferences: data.preferences || undefined,
      },
    });

    return profile;
  }

  // Get user's bookings
  static async getUserBookings(userId: string, options?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(options?.status && { status: options.status }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user's notifications
  static async getUserNotifications(userId: string, options?: {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(options?.unreadOnly && { readAt: null }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        readAt: new Date(),
      },
    });

    if (notification.count === 0) {
      throw new AppError(404, 'Notification not found');
    }

    return notification;
  }

  // Get referral stats
  static async getReferralStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          select: {
            id: true,
            createdAt: true,
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      referralCode: user.referralCode,
      totalReferrals: user._count.referrals,
      totalCreditsEarned: user._count.referrals * 50,
      referrals: user.referrals,
    };
  }
}
