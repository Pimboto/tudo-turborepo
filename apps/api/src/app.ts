// src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  }));
  
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      success: false, 
      error: 'Route not found' 
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
