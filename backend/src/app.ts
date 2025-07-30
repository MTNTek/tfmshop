import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { checkDatabaseHealth, AppDataSource } from './config/database';
import { DatabaseUtils } from './utils/database';
import { swaggerSpec, swaggerUiOptions } from './config/swagger';
import apiRoutes from './routes';
import {
  globalErrorHandler,
  notFoundHandler,
  securityHeaders,
  requestId,
  handleUnhandledRejection,
  handleUncaughtException,
  handleGracefulShutdown,
} from './middleware/errorHandler';
import { requestLogger, performanceLogger } from './utils/logger';
import { sanitizeInput } from './middleware/validation';
import { generalRateLimit } from './middleware/rateLimiter';
import { 
  suspiciousActivityDetector, 
  bruteForceProtection, 
  requestTimeout,
  productionSecurityHeaders,
  corsPreflightOptimization,
} from './middleware/security';
import { performanceMonitor, HealthChecker } from './utils/monitoring';
import CacheService from './services/CacheService';

const app = express();

// Set up global error handlers
handleUnhandledRejection();
handleUncaughtException();
handleGracefulShutdown();

// Start performance monitoring
if (config.nodeEnv === 'production') {
  performanceMonitor.startMonitoring();
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(securityHeaders);
app.use(productionSecurityHeaders);
app.use(requestId);

// Request timeout
app.use(requestTimeout(30000));

// Suspicious activity detection
app.use(suspiciousActivityDetector);

// Brute force protection
app.use(bruteForceProtection());

// Compression middleware
if (config.performance.enableCompression) {
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Only compress responses larger than 1KB
  }));
}

// Rate limiting
if (config.performance.enableRateLimit) {
  app.use(generalRateLimit);
}

// Request logging and performance tracking
app.use(requestLogger);
app.use(performanceMonitor.trackRequest);

// CORS optimization and middleware
app.use(corsPreflightOptimization);
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Input sanitization
app.use(sanitizeInput);

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthCheck = await HealthChecker.performHealthCheck();
    const dbInfo = DatabaseUtils.getConnectionInfo();
    const performanceSummary = performanceMonitor.getPerformanceSummary();
    
    const healthStatus = {
      ...healthCheck,
      environment: config.nodeEnv,
      database: {
        ...healthCheck.checks.database,
        info: dbInfo ? {
          type: dbInfo.type,
          host: dbInfo.host,
          port: dbInfo.port,
          database: dbInfo.database,
        } : null,
      },
      performance: {
        caching: config.performance.enableCaching,
        compression: config.performance.enableCompression,
        rateLimit: config.performance.enableRateLimit,
        summary: performanceSummary.summary,
        alerts: performanceSummary.alerts.slice(0, 3), // Show only recent alerts
      },
    };

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      error: 'Health check failed',
      database: { connected: false },
      cache: { connected: false },
    });
  }
});

// Enhanced performance monitoring endpoint
app.get('/metrics', async (req, res) => {
  try {
    const performanceSummary = performanceMonitor.getPerformanceSummary();
    const recentMetrics = performanceMonitor.getRecentMetrics(20);
    const cacheStats = await CacheService.getStats();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      performance: performanceSummary,
      recentMetrics,
      cache: cacheStats,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

// Swagger documentation
if (config.nodeEnv !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  // Swagger JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;