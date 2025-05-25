// src/middleware/errorHandler.ts - CORREGIDO
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/helpers';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle known errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.message)
    );
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json(
        errorResponse('A record with this information already exists')
      );
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json(
        errorResponse('Record not found')
      );
      return;
    }
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    res.status(400).json(
      errorResponse('Validation error', errors.join(', '))
    );
    return;
  }

  // Default error
  res.status(500).json(
    errorResponse('Internal server error')
  );
};
