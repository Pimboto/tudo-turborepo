// src/middleware/auth.ts - CORREGIDO
import { Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../prisma/client';
import { AppError } from './errorHandler';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify with Clerk
    const verifiedToken = await clerkClient.verifyToken(token);
    
    if (!verifiedToken || !verifiedToken.sub) {
      throw new AppError(401, 'Invalid token');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: verifiedToken.sub },
      select: {
        id: true,
        clerkId: true,
        role: true,
        verified: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
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
    res.status(401).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

// Middleware to check if user has specific role
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
      return;
    }

    next();
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
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const verifiedToken = await clerkClient.verifyToken(token);
    
    if (verifiedToken?.sub) {
      const user = await prisma.user.findUnique({
        where: { clerkId: verifiedToken.sub },
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
  }
  
  next();
};
