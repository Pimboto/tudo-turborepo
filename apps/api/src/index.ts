// src/index.ts - CORREGIDO con inicialización de métricas
import dotenv from 'dotenv';
import { createApp } from './app';
import { prisma } from './prisma/client';
import { log } from '@repo/logger';
import { MetricsService } from './services/metrics.service';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT ?? 3001;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    log('✅ Database connected successfully');

    // NUEVO: Inicializar sistema de métricas
    try {
      if (process.env.NODE_ENV === 'production') {
        // En producción, solo iniciar el cron job
        MetricsService.startMetricsCron();
        log('📊 Metrics cron job started for production');
      } else {
        // En desarrollo, inicializar datos históricos si no existen
        const existingMetrics = await prisma.systemMetrics.count();
        if (existingMetrics === 0) {
          log('📊 Initializing historical metrics for development...');
          await MetricsService.initializeHistoricalMetrics();
        }
        
        // Iniciar cron job
        MetricsService.startMetricsCron();
        log('📊 Metrics system initialized for development');
      }
    } catch (metricsError) {
      console.error('⚠️ Metrics initialization failed:', metricsError);
      // No detener el servidor por esto
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(PORT, () => {
      log(`🚀 Server is running on port ${PORT}`);
      log(`📍 Health check: http://localhost:${PORT}/health`);
      log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      log('🛑 Shutting down gracefully...');
      
      // Stop metrics cron job
      MetricsService.stopMetricsCron();
      log('📊 Metrics cron job stopped');
      
      server.close(() => {
        log('🛑 HTTP server closed');
      });

      await prisma.$disconnect();
      log('🛑 Database connection closed');
      
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
