import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './env';
import { productionConfig } from './production';
import { logDatabaseQuery } from '../utils/logger';
import path from 'path';

/**
 * Get optimized database configuration based on environment
 */
const getDatabaseConfig = (): DataSourceOptions => {
  const baseConfig: DataSourceOptions = {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: config.nodeEnv === 'development' || config.nodeEnv === 'test',
    entities: [
      config.nodeEnv === 'production' 
        ? path.join(__dirname, '../entities/**/*.js')
        : path.join(__dirname, '../entities/**/*.ts')
    ],
    migrations: [
      config.nodeEnv === 'production'
        ? path.join(__dirname, '../migrations/**/*.js')
        : path.join(__dirname, '../migrations/**/*.ts')
    ],
    subscribers: [
      config.nodeEnv === 'production'
        ? path.join(__dirname, '../subscribers/**/*.js')
        : path.join(__dirname, '../subscribers/**/*.ts')
    ],
  };

  if (config.nodeEnv === 'production') {
    return {
      ...baseConfig,
      logging: productionConfig.performance.queryOptimization.enableQueryLogging ? ['query', 'error', 'warn'] : ['error', 'warn'],
      ssl: { rejectUnauthorized: false },
      // Production connection pool settings
      extra: {
        max: productionConfig.performance.database.poolSize.max,
        min: productionConfig.performance.database.poolSize.min,
        connectionTimeoutMillis: productionConfig.performance.database.connectionTimeout,
        idleTimeoutMillis: productionConfig.performance.database.idleTimeout,
        query_timeout: productionConfig.performance.database.queryTimeout,
        // PostgreSQL specific optimizations
        application_name: 'tfmshop-backend',
        // Additional pool settings
        acquireTimeoutMillis: 10000,
        createTimeoutMillis: 10000,
        destroyTimeoutMillis: 5000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
        // PostgreSQL performance settings
        statement_timeout: productionConfig.performance.database.maxQueryExecutionTime,
        idle_in_transaction_session_timeout: 30000,
      },
      // Query result caching
      cache: productionConfig.performance.queryOptimization.enableQueryCache ? {
        duration: productionConfig.performance.queryOptimization.queryCacheTTL * 1000,
        type: 'redis',
        options: {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          db: config.redis.db + 1, // Use different DB for query cache
        },
      } : false,
      // Custom logger for slow queries
      logger: {
        logQuery: (query: string, parameters?: any[], queryRunner?: any) => {
          const start = Date.now();
          return () => {
            const duration = Date.now() - start;
            if (duration > productionConfig.performance.queryOptimization.slowQueryThreshold) {
              logDatabaseQuery(query, duration, parameters);
            }
          };
        },
        logQueryError: (error: string, query: string, parameters?: any[]) => {
          console.error('Database query error:', { error, query: query.substring(0, 200), parameters });
        },
        logQuerySlow: (time: number, query: string, parameters?: any[]) => {
          logDatabaseQuery(query, time, parameters);
        },
        logSchemaBuild: (message: string) => {
          console.log('Schema build:', message);
        },
        logMigration: (message: string) => {
          console.log('Migration:', message);
        },
        log: (level: 'log' | 'info' | 'warn', message: any) => {
          console[level]('Database:', message);
        },
      },
    };
  } else {
    return {
      ...baseConfig,
      logging: ['query', 'error', 'warn'],
      ssl: false,
      // Development settings
      extra: {
        max: 10,
        min: 2,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        query_timeout: 30000,
      },
      // Enable query cache in development for testing
      cache: {
        duration: 30000, // 30 seconds
      },
    };
  }
};

/**
 * Database configuration options
 */
const dataSourceOptions: DataSourceOptions = getDatabaseConfig();

/**
 * TypeORM DataSource instance
 */
export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Initialize database connection with error handling
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');
      
      // Run migrations in production
      if (config.nodeEnv === 'production') {
        await AppDataSource.runMigrations();
        console.log('✅ Database migrations completed');
      }
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Close database connection gracefully
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error during database disconnection:', error);
    throw new Error(`Database disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check database connection health
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!AppDataSource.isInitialized) {
      return false;
    }
    
    // Simple query to check connection
    await AppDataSource.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};