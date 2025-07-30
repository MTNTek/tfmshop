import 'reflect-metadata';
import { config } from '../config/env';
import { validateProductionConfig, initializeProductionOptimizations } from '../config/production';
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';
import CacheService from '../services/CacheService';
import fs from 'fs/promises';
import path from 'path';

/**
 * Production startup utility
 */
class ProductionStartup {
  /**
   * Initialize production environment
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing production environment...\n');

    try {
      // 1. Validate configuration
      await this.validateConfiguration();
      
      // 2. Create required directories
      await this.createRequiredDirectories();
      
      // 3. Initialize logging
      this.initializeLogging();
      
      // 4. Initialize database (with graceful fallback)
      await this.initializeDatabase();
      
      // 5. Initialize cache (with graceful fallback)
      await this.initializeCache();
      
      // 6. Initialize production optimizations
      this.initializeOptimizations();
      
      // 7. Set up health monitoring
      this.setupHealthMonitoring();
      
      console.log('✅ Production environment initialized successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize production environment:', error);
      throw error;
    }
  }

  /**
   * Validate production configuration
   */
  private async validateConfiguration(): Promise<void> {
    console.log('🔍 Validating production configuration...');
    
    const validation = validateProductionConfig();
    
    if (validation.errors.length > 0) {
      console.error('❌ Configuration validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      throw new Error('Invalid production configuration');
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    console.log('✅ Configuration validation passed');
  }

  /**
   * Create required directories
   */
  private async createRequiredDirectories(): Promise<void> {
    console.log('📁 Creating required directories...');
    
    const directories = [
      config.upload.uploadPath,
      config.logging.logDirectory,
      path.join(process.cwd(), 'tmp'),
    ];
    
    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`  ✅ Created directory: ${dir}`);
      } catch (error) {
        if ((error as any).code !== 'EEXIST') {
          console.warn(`  ⚠️  Failed to create directory ${dir}:`, error);
        }
      }
    }
  }

  /**
   * Initialize logging
   */
  private initializeLogging(): void {
    console.log('📝 Initializing logging...');
    
    // Enable file logging in production
    if (config.nodeEnv === 'production') {
      process.env.ENABLE_FILE_LOGGING = 'true';
    }
    
    logger.info('Production logging initialized', {
      level: config.logging.level,
      fileLogging: config.logging.enableFileLogging,
      logDirectory: config.logging.logDirectory,
    });
    
    console.log('✅ Logging initialized');
  }

  /**
   * Initialize database with graceful fallback
   */
  private async initializeDatabase(): Promise<void> {
    console.log('🗄️  Initializing database...');
    
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      
      // Test connection
      await AppDataSource.query('SELECT 1');
      
      logger.info('Database connection established', {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
      });
      
      console.log('✅ Database initialized successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (config.nodeEnv === 'production') {
        logger.error('Database connection failed in production', { error: errorMessage });
        throw new Error(`Database connection required in production: ${errorMessage}`);
      } else {
        logger.warn('Database connection failed, continuing without database', { error: errorMessage });
        console.log('⚠️  Database not available, continuing without database features');
      }
    }
  }

  /**
   * Initialize cache with graceful fallback
   */
  private async initializeCache(): Promise<void> {
    console.log('💾 Initializing cache...');
    
    try {
      const stats = await CacheService.getStats();
      
      if (stats.connected) {
        logger.info('Cache connection established', {
          keyCount: stats.keyCount,
          memoryUsage: stats.memoryUsage,
        });
        console.log('✅ Cache initialized successfully');
      } else {
        logger.warn('Cache not connected, using memory fallback');
        console.log('⚠️  Cache not available, using memory fallback');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn('Cache initialization failed, using memory fallback', { error: errorMessage });
      console.log('⚠️  Cache initialization failed, using memory fallback');
    }
  }

  /**
   * Initialize production optimizations
   */
  private initializeOptimizations(): void {
    console.log('⚡ Initializing production optimizations...');
    
    try {
      if (config.nodeEnv === 'production') {
        initializeProductionOptimizations();
      }
      
      // Set process title
      process.title = 'tfmshop-backend';
      
      // Set up graceful shutdown
      this.setupGracefulShutdown();
      
      console.log('✅ Production optimizations initialized');
      
    } catch (error) {
      logger.warn('Failed to initialize some production optimizations', { error });
      console.log('⚠️  Some production optimizations failed to initialize');
    }
  }

  /**
   * Set up health monitoring
   */
  private setupHealthMonitoring(): void {
    console.log('🏥 Setting up health monitoring...');
    
    // Basic health monitoring
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      if (heapUsagePercent > 90) {
        logger.warn('High memory usage detected', {
          heapUsagePercent: heapUsagePercent.toFixed(2),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        });
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          logger.info('Forced garbage collection');
        }
      }
    }, 60000); // Check every minute
    
    console.log('✅ Health monitoring started');
  }

  /**
   * Set up graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown`);
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Close database connection
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
          logger.info('Database connection closed');
        }
        
        // Close cache connection
        await CacheService.close();
        logger.info('Cache connection closed');
        
        logger.info('Graceful shutdown completed');
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
        
      } catch (error) {
        logger.error('Error during graceful shutdown', { error });
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined,
        promise: promise.toString(),
      });
      console.error('❌ Unhandled Rejection:', reason);
    });
  }

  /**
   * Check production readiness
   */
  async checkReadiness(): Promise<boolean> {
    console.log('🔍 Checking production readiness...\n');
    
    const checks = [];
    
    // Configuration check
    const configValidation = validateProductionConfig();
    checks.push({
      name: 'Configuration',
      passed: configValidation.errors.length === 0,
      details: configValidation,
    });
    
    // Directory check
    const directories = [config.upload.uploadPath, config.logging.logDirectory];
    let directoriesOk = true;
    
    for (const dir of directories) {
      try {
        await fs.access(dir, fs.constants.W_OK);
      } catch {
        directoriesOk = false;
        break;
      }
    }
    
    checks.push({
      name: 'Directories',
      passed: directoriesOk,
      details: { directories },
    });
    
    // Database check (optional in development)
    let databaseOk = true;
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.query('SELECT 1');
      } else {
        databaseOk = config.nodeEnv !== 'production';
      }
    } catch {
      databaseOk = config.nodeEnv !== 'production';
    }
    
    checks.push({
      name: 'Database',
      passed: databaseOk,
      details: { required: config.nodeEnv === 'production' },
    });
    
    // Cache check (optional)
    const cacheStats = await CacheService.getStats();
    checks.push({
      name: 'Cache',
      passed: true, // Cache is optional with memory fallback
      details: { connected: cacheStats.connected },
    });
    
    // Print results
    console.log('📋 Readiness Check Results:');
    checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      console.log(`  ${icon} ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
    });
    
    const allPassed = checks.every(check => check.passed);
    console.log(`\n📊 Overall: ${allPassed ? '✅ READY' : '❌ NOT READY'}`);
    
    return allPassed;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const command = process.argv[2];
  const startup = new ProductionStartup();

  try {
    switch (command) {
      case 'init':
        await startup.initialize();
        break;
        
      case 'check':
        const ready = await startup.checkReadiness();
        process.exit(ready ? 0 : 1);
        break;
        
      default:
        console.log('Usage: npm run production:startup [init|check]');
        console.log('  init  - Initialize production environment');
        console.log('  check - Check production readiness');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Production startup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ProductionStartup };