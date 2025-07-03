// apps/api/src/middleware/auth.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { requireAuth, getAuth, clerkClient } from '@clerk/express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../prisma/client';
import { AppError } from './errorHandler';

// Main authentication middleware - Usando requireAuth() como indica la documentación
export const authenticate: RequestHandler = requireAuth();

// Custom middleware to attach user data from database
export const attachUserData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId: clerkId } = getAuth(req);
    
    if (!clerkId) {
      res.status(401).json({ 
        success: false, 
        error: 'No authenticated user',
        code: 'NO_AUTH'
      });
      return;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        role: true,
        verified: true,
      },
    });

    if (!user) {
      // User exists in Clerk but not in our database
      // Return 403 with specific error code
      res.status(403).json({ 
        success: false, 
        error: 'User not registered. Please complete registration first.',
        code: 'USER_NOT_REGISTERED',
        needsRegistration: true
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ 
        success: false, 
        error: error.message 
      });
      return;
    }
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Middleware to check if user has specific role
// Como indica la guía, necesitamos obtener el rol desde los metadatos
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = getAuth(req);
      
      if (!userId) {
        res.status(401).json({ 
          success: false, 
          error: 'Not authenticated' 
        });
        return;
      }

      // Obtener el usuario de nuestra base de datos que ya tiene el rol
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true }
      });

      if (!user || !allowedRoles.includes(user.role)) {
        res.status(403).json({ 
          success: false, 
          error: 'Acceso denegado' 
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Error checking permissions' 
      });
    }
  };
};

// Middleware to check if user is verified
export const requireVerified = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.verified) {
    res.status(403).json({ 
      success: false, 
      error: 'Account not verified' 
    });
    return;
  }
  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId: clerkId } = getAuth(req);
    
    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: {
          id: true,
          clerkId: true,
          role: true,
          verified: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silent fail - optional auth
    console.error('Optional auth error:', error);
  }
  
  next();
};

// Alias for backward compatibility
export const authorize = requireRole;

// Webhook validation middleware for Clerk webhooks
export const validateClerkWebhook = (webhookSecret: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const svixId = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;

      if (!svixId || !svixTimestamp || !svixSignature) {
        res.status(400).json({ 
          success: false, 
          error: 'Missing webhook headers' 
        });
        return;
      }

      // Verify webhook signature
      // Note: You'll need to install @clerk/backend for webhook verification
      // or use svix directly
      
      next();
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid webhook signature' 
      });
    }
  };
};