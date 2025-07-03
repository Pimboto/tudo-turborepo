// apps/api/src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { clerkMiddleware } from '@clerk/express';
import { errorHandler } from './middleware/errorHandler';
import { setupSecurity } from './middleware/security';
import { requestLogger, errorLogger } from './middleware/logging';
import { metricsMiddleware, getMetricsHandler } from './middleware/monitoring';
import { setupSwagger } from './config/swagger';
import routes from './routes';

export const createApp = (): Express => {
  const app = express();

  // Security and performance middleware (before everything else)
  setupSecurity(app);

  // Request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

  // CORS - Configure for your domains
  app.use(cors({
    origin: [
      process.env.CLIENT_URL ?? 'http://localhost:3000',
      'http://localhost:3000',
      process.env.PARTNER_URL ?? 'http://localhost:3002', 
      process.env.ADMIN_URL ?? 'http://localhost:3003',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
  // Request parsing (before Clerk middleware)
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));



  // Clerk middleware configuration
  const clerkConfig: any = {
    // Authorized parties for multi-domain SSO
    authorizedParties: [
      'http://localhost:3000',
      'http://localhost:3001',
      ...(process.env.CLERK_AUTHORIZED_PARTIES?.split(',') || [])
    ],
    // Enable debug mode for development
    debug: process.env.NODE_ENV === 'development'
  };

  // Add publishable key if available
  if (process.env.CLERK_PUBLISHABLE_KEY) {
    clerkConfig.publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
  }

  // Clerk middleware - MUST come after body parser
  app.use(clerkMiddleware(clerkConfig));

  // Request timing
  app.use(morgan('tiny', {
    skip: (req) => req.url === '/health' || req.url.startsWith('/api-docs'),
  }));

  // Metrics middleware
  app.use(metricsMiddleware);

  // API Documentation
  setupSwagger(app);

  // Health check endpoints
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
    });
  });

  // Detailed health check
  app.get('/health/detailed', async (req, res) => {
    try {
      // Test database connection
      const { prisma } = await import('./prisma/client');
      await prisma.$queryRaw`SELECT 1`;

      // Test Clerk connection
      const { clerkClient } = await import('@clerk/express');
      const clerkStatus = await clerkClient.users.getCount()
        .then(() => 'connected')
        .catch(() => 'error');

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? 'development',
        version: process.env.npm_package_version ?? '1.0.0',
        services: {
          database: 'connected',
          clerk: clerkStatus,
        },
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  });

  // Metrics endpoint
  app.get('/metrics', getMetricsHandler);

  // API routes
  app.use('/api', routes);

  // Clerk webhooks endpoint (if needed)
  app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      // Handle Clerk webhooks here
      // You'll need to verify the webhook signature
      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: 'Webhook error' });
    }
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      success: false, 
      error: 'Route not found',
      availableEndpoints: {
        documentation: '/api-docs',
        health: '/health',
        metrics: '/metrics',
        api: '/api',
      },
    });
  });

  // Error logging middleware
  app.use(errorLogger);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
