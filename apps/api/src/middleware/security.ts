// src/middleware/security.ts
import helmet from 'helmet';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import compression from 'compression';
import { Express, RequestHandler } from 'express';

// Rate limiting configuration
export const createRateLimit = (windowMs: number, max: number, message?: string): RateLimitRequestHandler => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message ?? 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
export const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 1000), // 1000 requests per 15 minutes - OK
  
  // Auth endpoints - ajustado a uso realista
  auth: createRateLimit(15 * 60 * 1000, 50), // 50 requests per 15 minutes
  
  // Booking endpoints - moderate
  booking: createRateLimit(60 * 1000, 50), // 15 requests per minute
  
  // Search endpoints - más permisivo
  search: createRateLimit(60 * 1000, 100), // 100 requests per minute
};

// Security middleware setup
export const setupSecurity = (app: Express): void => {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  const compressionHandler: RequestHandler = compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
  });
  
  app.use(compressionHandler);

  // General rate limiting
  app.use('/api', rateLimits.general);
  
  // Specific rate limits
  app.use('/api/auth', rateLimits.auth);
  app.use('/api/bookings', rateLimits.booking);
  app.use('/api/studios/search', rateLimits.search);
};
