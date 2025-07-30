import app from './app';
import { initializeDatabase, closeDatabase } from './config/database';
import { config } from './config/env';
import { ProductionStartup } from './scripts/production-startup';
import { logger } from './utils/logger';

async function startServer() {
  try {
    // Initialize production environment if in production
    if (config.nodeEnv === 'production') {
      const startup = new ProductionStartup();
      await startup.initialize();
    } else {
      // Initialize database connection for development
      await initializeDatabase();
    }

    // Start server
    const server = app.listen(config.port, () => {
      const message = `🚀 TFMShop Backend Server started successfully!`;
      console.log(message);
      console.log(`📍 Environment: ${config.nodeEnv.toUpperCase()}`);
      console.log(`🌐 Port: ${config.port}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`📊 Metrics: http://localhost:${config.port}/metrics`);
      
      if (config.nodeEnv !== 'production') {
        console.log(`📚 API Docs: http://localhost:${config.port}/api-docs`);
      }
      
      logger.info('Server started', {
        port: config.port,
        environment: config.nodeEnv,
        pid: process.pid,
        nodeVersion: process.version,
      });
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      const shutdownMessage = `📡 Received ${signal}. Starting graceful shutdown...`;
      console.log(`\n${shutdownMessage}`);
      logger.info('Graceful shutdown initiated', { signal });
      
      // Stop accepting new connections
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        logger.info('HTTP server closed');
        
        try {
          // Close database connection
          await closeDatabase();
          console.log('🗄️  Database connection closed');
          logger.info('Database connection closed');
          
          console.log('✅ Graceful shutdown completed');
          logger.info('Graceful shutdown completed');
          process.exit(0);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('❌ Error during graceful shutdown:', errorMessage);
          logger.error('Error during graceful shutdown', { error: errorMessage });
          process.exit(1);
        }
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions in production
    if (config.nodeEnv === 'production') {
      process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception - Server will exit', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        console.error('❌ Uncaught Exception:', error);
        process.exit(1);
      });

      process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection - Server will continue', {
          reason: reason instanceof Error ? reason.message : reason,
          stack: reason instanceof Error ? reason.stack : undefined,
          promise: promise.toString(),
        });
        console.error('❌ Unhandled Rejection:', reason);
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error starting server:', errorMessage);
    logger.error('Server startup failed', { error: errorMessage });
    process.exit(1);
  }
}

// Start the server
startServer();