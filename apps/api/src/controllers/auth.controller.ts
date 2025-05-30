// apps/api/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import { prisma } from '../prisma/client';
import { AppError } from '../middleware/errorHandler';
import { successResponse, generateReferralCode } from '../utils/helpers';
import { UserRole } from '@prisma/client';

interface RegisterRequest {
  clerkId: string;
  email: string;
  role: 'CLIENT' | 'PARTNER';
  referralCode?: string;
  // Partner specific fields
  companyName?: string;
  taxInfo?: string;
  // Profile fields
  fullName: string;
  phone?: string;
}

export class AuthController {
  /**
   * Register a new user after Clerk signup
   * This is called after the user has successfully signed up with Clerk
   */
  static async register(req: Request, res: Response): Promise<void> {
    const {
      clerkId,
      email,
      role = 'CLIENT',
      referralCode,
      companyName,
      taxInfo,
      fullName,
      phone,
    } = req.body as RegisterRequest;

    // Validate required fields
    if (!clerkId || !email || !fullName) {
      throw new AppError(400, 'Missing required fields');
    }

    // Validate role
    if (!['CLIENT', 'PARTNER'].includes(role)) {
      throw new AppError(400, 'Invalid role. Must be CLIENT or PARTNER');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (existingUser) {
      throw new AppError(409, 'User already exists');
    }

    // Validate referral code if provided
    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!referrer) {
        throw new AppError(400, 'Invalid referral code');
      }

      referredBy = referrer.id;
    }

    // Start transaction to create user and related data
    const result = await prisma.$transaction(async (tx) => {
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

      // Create profile
      await tx.profile.create({
        data: {
          userId: newUser.id,
          fullName,
          phone: phone ?? null,
          preferences: {
            amenities: [],
            classTypes: [],
            zones: [],
          },
        },
      });

      // If registering as PARTNER, create partner record
      if (role === 'PARTNER') {
        if (!companyName) {
          throw new AppError(400, 'Company name is required for partners');
        }

        await tx.partner.create({
          data: {
            userId: newUser.id,
            companyName,
            taxInfo: taxInfo ?? null,
          },
        });

        // Notify admins about new partner
        const admins = await tx.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        if (admins.length > 0) {
          await tx.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              type: 'NEW_PARTNER_REQUEST',
              title: 'New Partner Registration',
              body: `${companyName} has registered as a partner and requires verification.`,
            })),
          });
        }
      }

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

      // Update Clerk user metadata como indica la guía
      try {
        await clerkClient.users.updateUser(clerkId, {
          publicMetadata: {
            role,
            userId: newUser.id,
          },
          privateMetadata: {
            dbUserId: newUser.id,
            registeredAt: new Date().toISOString(),
          },
        });
      } catch (clerkError) {
        console.error('Failed to update Clerk metadata:', clerkError);
        // Don't fail the registration if Clerk update fails
      }

      return newUser;
    });

    res.status(201).json(
      successResponse(
        {
          id: result.id,
          email: result.email,
          role: result.role,
          referralCode: result.referralCode,
          credits: result.credits,
        },
        'User registered successfully'
      )
    );
  }

  /**
   * Complete user profile after initial registration
   */
  static async completeProfile(req: Request, res: Response): Promise<void> {
    const { clerkId } = req.body;
    const profileData = req.body.profile;

    if (!clerkId) {
      throw new AppError(400, 'Clerk ID is required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        fullName: profileData.fullName ?? user.profile?.fullName,
        phone: profileData.phone,
        address: profileData.address,
        avatarUrl: profileData.avatarUrl,
        preferences: profileData.preferences ?? user.profile?.preferences,
      },
    });

    res.json(
      successResponse(updatedProfile, 'Profile updated successfully')
    );
  }

  /**
   * Sync user data with Clerk
   * Called when user signs in to ensure our database is in sync
   */
  static async syncUser(req: Request, res: Response): Promise<void> {
    const { clerkId } = req.body;

    if (!clerkId) {
      throw new AppError(400, 'Clerk ID is required');
    }

    // Get user from Clerk
    let clerkUser;
    try {
      clerkUser = await clerkClient.users.getUser(clerkId);
    } catch (error) {
      throw new AppError(404, 'User not found in Clerk');
    }

    // Check if user exists in our database
    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profile: true,
        partner: true,
      },
    });

    if (!user) {
      // User exists in Clerk but not in our database
      // This might happen if registration wasn't completed
      res.status(404).json({
        success: false,
        error: 'User not found',
        needsRegistration: true,
      });
      return;
    }

    // Update email if changed in Clerk
    if (clerkUser.emailAddresses[0]?.emailAddress !== user.email) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: clerkUser.emailAddresses[0]?.emailAddress,
        },
        include: {
          profile: true,
          partner: true,
        },
      });
    }

    res.json(
      successResponse({
        ...user,
        clerkUser: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        },
      })
    );
  }

  /**
   * Get current user info based on Clerk ID from auth
   */
  static async me(req: Request, res: Response): Promise<void> {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      throw new AppError(401, 'Not authenticated');
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
      res.status(404).json({
        success: false,
        error: 'User not found',
        needsRegistration: true,
      });
      return;
    }

    res.json(successResponse(user));
  }

  /**
   * Delete user account
   * This will delete the user from our database and Clerk
   */
  static async deleteAccount(req: Request, res: Response): Promise<void> {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Delete from our database first
    await prisma.user.delete({
      where: { clerkId },
    });

    // Then delete from Clerk
    try {
      await clerkClient.users.deleteUser(clerkId);
    } catch (error) {
      console.error('Failed to delete user from Clerk:', error);
      // User is already deleted from our database, so we continue
    }

    res.json(successResponse(null, 'Account deleted successfully'));
  }

  /**
   * Handle Clerk webhook events
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const { type, data } = req.body;

    switch (type) {
      case 'user.created':
        // User was created in Clerk but might not be in our database yet
        console.log('New user created in Clerk:', data.id);
        break;

      case 'user.updated':
        // Update user data in our database if needed
        const user = await prisma.user.findUnique({
          where: { clerkId: data.id },
        });

        if (user && data.email_addresses[0]?.email_address !== user.email) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              email: data.email_addresses[0]?.email_address,
            },
          });
        }
        break;

      case 'user.deleted':
        // Delete user from our database
        await prisma.user.deleteMany({
          where: { clerkId: data.id },
        });
        break;

      default:
        console.log('Unhandled webhook type:', type);
    }

    res.json({ received: true });
  }
}
