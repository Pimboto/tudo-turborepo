// src/index.ts
import dotenv from 'dotenv';
import { createApp } from './app';
import { prisma } from './prisma/client';
import { log } from '@repo/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT ?? 3001;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    log('✅ Database connected successfully');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(PORT, () => {
      log(`🚀 Server is running on port ${PORT}`);
      log(`📍 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      log('🛑 Shutting down gracefully...');
      
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
