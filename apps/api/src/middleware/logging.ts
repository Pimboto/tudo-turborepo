// src/middleware/logging.ts
import winston from 'winston';
import expressWinston from 'express-winston';
import { RequestHandler, ErrorRequestHandler } from 'express';

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tudo-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Express Winston middleware for request logging
export const requestLogger: RequestHandler = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  ignoreRoute: (req) => {
    // Don't log health checks and docs
    return req.url === '/health' || req.url.startsWith('/api-docs');
  },
});

// Express Winston middleware for error logging
export const errorLogger: ErrorRequestHandler = expressWinston.errorLogger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} - {{err.message}}',
  // Remove expressFormat here
});
