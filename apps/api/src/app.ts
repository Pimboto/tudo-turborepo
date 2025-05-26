// src/app.ts - Updated with security, monitoring, and documentation
import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
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

  // CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Clerk-User-Id'],
  }));
  
  // Request parsing
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Request timing
  app.use(morgan('combined', {
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
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // Detailed health check
  app.get('/health/detailed', async (req, res) => {
    try {
      // Add database connectivity check here if needed
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: 'connected', // You could add actual DB ping here
          clerk: 'available',
        },
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      });
    }
  });

  // Metrics endpoint
  app.get('/metrics', getMetricsHandler);

  // API routes
  app.use('/api', routes);

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
