import { config } from './env';

/**
 * Production-specific configuration and optimizations
 */
export const productionConfig = {
  // Database optimizations
  database: {
    // Connection pool settings for production
    poolSize: {
      min: 10,
      max: 50,
    },
    // Connection timeout settings
    connectionTimeout: 5000,
    idleTimeout: 30000,
    // Query timeout
    queryTimeout: 30000,
    // Enable SSL in production
    ssl: true,
    // Logging settings
    logging: ['error', 'warn'],
  },

  // Cache settings
  cache: {
    // Default TTL values for different data types
    ttl: {
      products: 600, // 10 minutes
      categories: 1800, // 30 minutes
      users: 300, // 5 minutes
      search: 180, // 3 minutes
      analytics: 900, // 15 minutes
    },
    // Redis connection pool
    redis: {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      connectTimeout: 10000,
      commandTimeout: 5000,
      lazyConnect: true,
    },
  },

  // Security settings
  security: {
    // Rate limiting (stricter in production)
    rateLimit: {
      general: 500, // Reduced from 1000
      auth: 5, // Reduced from 10
      api: 300, // Reduced from 500
      upload: 10, // Reduced from 20
      search: 50, // Reduced from 100
      admin: 100, // Reduced from 200
    },
    // CORS settings
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || false,
      credentials: true,
      optionsSuccessStatus: 200,
    },
    // Helmet security headers
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
  },

  // Performance settings
  performance: {
    // Compression settings
    compression: {
      level: 6,
      threshold: 1024,
      filter: (req: any, res: any) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return true;
      },
    },
    // Request timeout
    requestTimeout: 30000,
    // Body parser limits
    bodyParser: {
      json: { limit: '1mb' },
      urlencoded: { limit: '1mb', extended: true },
    },
    // Database connection pool optimization
    database: {
      poolSize: {
        min: 10,
        max: 50,
      },
      connectionTimeout: 5000,
      idleTimeout: 30000,
      queryTimeout: 30000,
      maxQueryExecutionTime: 5000,
      // Additional database optimizations
      acquireTimeout: 60000,
      createTimeout: 30000,
      destroyTimeout: 5000,
      reapInterval: 1000,
      createRetryInterval: 200,
    },
    // Query optimization settings
    queryOptimization: {
      enableQueryLogging: false, // Disable in production for performance
      slowQueryThreshold: 1000, // Log queries taking more than 1s
      enableQueryCache: true,
      queryCacheTTL: 300, // 5 minutes
      maxQueryCacheSize: 1000, // Maximum number of cached queries
    },
    // Memory optimization
    memory: {
      maxOldSpaceSize: 4096, // 4GB heap size
      maxSemiSpaceSize: 128, // 128MB semi-space
      gcInterval: 60000, // Force GC every minute if needed
    },
    // Response optimization
    response: {
      enableEtag: true,
      enableLastModified: true,
      maxAge: 3600, // 1 hour default cache
      staleWhileRevalidate: 86400, // 24 hours stale-while-revalidate
    },
  },

  // Logging settings
  logging: {
    level: 'info',
    enableFileLogging: true,
    logDirectory: process.env.LOG_DIRECTORY || '/var/log/tfmshop',
    // Log rotation settings
    rotation: {
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    },
    // Performance logging thresholds
    thresholds: {
      slowRequest: 1000, // ms
      slowQuery: 1000, // ms
      slowOperation: 5000, // ms
    },
  },

  // Monitoring settings
  monitoring: {
    // Health check intervals
    healthCheck: {
      interval: 60000, // 1 minute
      timeout: 5000, // 5 seconds
    },
    // Metrics collection
    metrics: {
      interval: 30000, // 30 seconds
      retention: 100, // Keep last 100 metrics
    },
    // Alerting thresholds
    alerts: {
      memoryUsage: 85, // %
      cpuUsage: 80, // %
      errorRate: 5, // %
      responseTime: 2000, // ms
    },
  },

  // File upload settings
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    uploadPath: process.env.UPLOAD_PATH || '/var/uploads/tfmshop',
  },
};

/**
 * Get production-optimized configuration
 */
export const getProductionConfig = () => {
  if (config.nodeEnv !== 'production') {
    console.warn('⚠️  Production config requested in non-production environment');
  }

  return {
    ...config,
    ...productionConfig,
    // Override specific settings for production
    database: {
      ...config.database,
      ...productionConfig.database,
    },
    performance: {
      ...config.performance,
      ...productionConfig.performance,
      rateLimit: productionConfig.security.rateLimit,
    },
    logging: {
      ...config.logging,
      ...productionConfig.logging,
    },
  };
};

/**
 * Validate production configuration
 */
export const validateProductionConfig = (): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.nodeEnv !== 'production') {
    // In non-production environments, be more lenient
    return { valid: true, errors: [], warnings: ['Running in non-production environment'] };
  }

  // Check critical environment variables
  const criticalEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  criticalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing critical environment variable: ${envVar}`);
    }
  });

  // Check recommended environment variables
  const recommendedEnvVars = [
    'DB_HOST',
    'DB_PASSWORD',
    'REDIS_HOST',
    'CORS_ORIGIN',
  ];

  recommendedEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(`Missing recommended environment variable: ${envVar}`);
    }
  });

  // Check JWT secrets are not default values
  if (process.env.JWT_SECRET?.includes('secret') && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be a strong secret (at least 32 characters)');
  }

  if (process.env.JWT_REFRESH_SECRET?.includes('secret') && process.env.JWT_REFRESH_SECRET.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be a strong secret (at least 32 characters)');
  }

  // Check database configuration (warnings only)
  if (config.database.host === 'localhost') {
    warnings.push('Database host is localhost - consider using external database in production');
  }

  // Check Redis configuration (warnings only)
  if (config.redis.host === 'localhost') {
    warnings.push('Redis host is localhost - consider using external Redis in production');
  }

  // Check CORS origin (warnings only)
  if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN.includes('localhost')) {
    warnings.push('CORS_ORIGIN should be set to production domain(s)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Initialize production optimizations
 */
export const initializeProductionOptimizations = () => {
  if (config.nodeEnv !== 'production') {
    return;
  }

  console.log('🚀 Initializing production optimizations...');

  // Validate configuration
  const validation = validateProductionConfig();
  if (!validation.valid) {
    console.error('❌ Production configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  // Set process title
  process.title = 'tfmshop-backend';

  // Set up process monitoring
  process.on('warning', (warning) => {
    console.warn('⚠️  Process warning:', warning);
  });

  // Memory usage monitoring
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (heapUsagePercent > productionConfig.monitoring.alerts.memoryUsage) {
      console.warn(`⚠️  High memory usage: ${heapUsagePercent.toFixed(2)}%`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('🗑️  Forced garbage collection');
      }
    }
  }, 60000); // Check every minute

  // CPU usage monitoring
  let lastCpuUsage = process.cpuUsage();
  setInterval(() => {
    const currentCpuUsage = process.cpuUsage(lastCpuUsage);
    const cpuPercent = (currentCpuUsage.user + currentCpuUsage.system) / 1000000; // Convert to seconds
    
    if (cpuPercent > productionConfig.monitoring.alerts.cpuUsage) {
      console.warn(`⚠️  High CPU usage: ${cpuPercent.toFixed(2)}%`);
    }
    
    lastCpuUsage = process.cpuUsage();
  }, 30000); // Check every 30 seconds

  // Set up graceful shutdown handlers
  const gracefulShutdown = (signal: string) => {
    console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
    
    // Give the application time to finish current requests
    setTimeout(() => {
      console.log('🔌 Forcing shutdown after timeout');
      process.exit(1);
    }, 30000); // 30 second timeout
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Set Node.js specific optimizations
  if (productionConfig.performance.memory.maxOldSpaceSize) {
    // This would typically be set via --max-old-space-size flag
    console.log(`📊 Max old space size: ${productionConfig.performance.memory.maxOldSpaceSize}MB`);
  }

  // Enable keep-alive for HTTP connections
  process.env.HTTP_KEEP_ALIVE = '1';

  console.log('✅ Production optimizations initialized');
};

export default productionConfig;