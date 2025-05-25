// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { successResponse, generateReferralCode } from '../utils/helpers';
import { CreateUserDto } from '../types';
import { UserRole } from '@prisma/client';

export class AuthController {
  // Register a new user
  static async register(req: Request, res: Response) {
    const { email, clerkId, role = 'CLIENT', referralCode } = req.body as CreateUserDto;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (existingUser) {
      throw new AppError(409, 'User already exists');
    }

    // Validate referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!referrer) {
        throw new AppError(400, 'Invalid referral code');
      }

      referredBy = referrer.id;
    }

    // Create user with profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          clerkId,
          role: role as UserRole,
          referralCode: generateReferralCode(),
          referredById: referredBy,
          credits: referredBy ? 50 : 0, // Bonus credits for using referral
        },
      });

      // Create empty profile
      await tx.profile.create({
        data: {
          userId: newUser.id,
          fullName: '',
          preferences: {
            amenities: [],
            classTypes: [],
            zones: [],
          },
        },
      });

      // Give credits to referrer
      if (referredBy) {
        await tx.user.update({
          where: { id: referredBy },
          data: { credits: { increment: 50 } },
        });

        // Create notification for referrer
        await tx.notification.create({
          data: {
            userId: referredBy,
            type: 'REFERRAL_BONUS',
            title: 'Referral Bonus!',
            body: `You earned 50 credits for referring a new user!`,
          },
        });
      }

      return newUser;
    });

    res.status(201).json(
      successResponse({
        id: user.id,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        credits: user.credits,
      }, 'User registered successfully')
    );
  }

  // Verify user email/phone
  static async verify(req: Request, res: Response) {
    const { clerkId } = req.body;

    const user = await prisma.user.update({
      where: { clerkId },
      data: { verified: true },
    });

    res.json(
      successResponse({
        id: user.id,
        verified: user.verified,
      }, 'User verified successfully')
    );
  }

  // Get current user info
  static async me(req: Request, res: Response) {
    const clerkId = req.headers['x-clerk-user-id'] as string;

    if (!clerkId) {
      throw new AppError(401, 'No user ID provided');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
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
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(successResponse(user));
  }

  // Delete user account
  static async deleteAccount(req: Request, res: Response) {
    const clerkId = req.headers['x-clerk-user-id'] as string;

    await prisma.user.delete({
      where: { clerkId },
    });

    res.json(successResponse(null, 'Account deleted successfully'));
  }
}
