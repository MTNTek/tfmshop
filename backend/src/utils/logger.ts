import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import path from 'path';

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

/**
 * Create transports based on configuration
 */
const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];

  // Console transport (always enabled in development)
  if (config.nodeEnv === 'development') {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
        level: config.logging.level,
      })
    );
  } else {
    transports.push(
      new winston.transports.Console({
        format: logFormat,
        level: config.logging.level,
        handleExceptions: true,
        handleRejections: true,
      })
    );
  }

  // File transports (if enabled)
  if (config.logging.enableFileLogging) {
    const logDir = config.logging.logDirectory;

    // Ensure log directory exists
    try {
      require('fs').mkdirSync(logDir, { recursive: true });
    } catch (error) {
      console.warn(`Failed to create log directory ${logDir}:`, error);
    }

    // Error log file
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
        handleExceptions: true,
        handleRejections: true,
      })
    );

    // Combined log file
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
      })
    );

    // Access log file
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, 'access-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'http',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '30d',
        zippedArchive: true,
      })
    );

    // Debug log file (only in development)
    if (config.nodeEnv === 'development') {
      transports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'debug-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'debug',
          format: logFormat,
          maxSize: '50m',
          maxFiles: '3d',
          zippedArchive: true,
        })
      );
    }

    // Application-specific log files
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        format: logFormat,
        maxSize: '50m',
        maxFiles: '30d',
        zippedArchive: true,
      })
    );
  }

  return transports;
};

/**
 * Main logger instance
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: createTransports(),
  exitOnError: false,
});

/**
 * Performance logger for tracking slow operations
 */
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: config.logging.enableFileLogging
    ? [
        new DailyRotateFile({
          filename: path.join(config.logging.logDirectory, 'performance-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '7d',
          zippedArchive: true,
        }),
      ]
    : [],
});

/**
 * Security logger for tracking security events
 */
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: config.logging.enableFileLogging
    ? [
        new DailyRotateFile({
          filename: path.join(config.logging.logDirectory, 'security-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ]
    : [],
});

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = (req as any).id || 'unknown';

  // Log request start
  logger.http('Request started', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(this: Response, chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    const contentLength = res.get('Content-Length') || 0;

    // Log request completion
    logger.http('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      contentLength,
      userId: (req as any).user?.id,
    });

    // Log slow requests
    if (duration > 1000) {
      performanceLogger.warn('Slow request detected', {
        requestId,
        method: req.method,
        url: req.url,
        duration,
        statusCode: res.statusCode,
        userId: (req as any).user?.id,
      });
    }

    // Log security events
    if (res.statusCode === 401 || res.statusCode === 403) {
      securityLogger.warn('Authentication/Authorization failure', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
      });
    }

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging helper
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

/**
 * Security event logging helper
 */
export const logSecurityEvent = (
  event: string,
  details: Record<string, any>,
  level: 'warn' | 'error' = 'warn'
) => {
  securityLogger[level](`Security event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Performance tracking helper
 */
export const trackPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) => {
  performanceLogger.info(`Performance: ${operation}`, {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...metadata,
  });

  // Log warning for slow operations
  if (duration > 5000) {
    performanceLogger.warn(`Slow operation detected: ${operation}`, {
      operation,
      duration,
      ...metadata,
    });
  }
};

/**
 * Database query logging helper
 */
export const logDatabaseQuery = (
  query: string,
  duration: number,
  parameters?: any[]
) => {
  if (config.nodeEnv === 'development') {
    logger.debug('Database query', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration,
      parameters: parameters?.slice(0, 5), // Limit parameters for security
    });
  }

  // Log slow queries
  if (duration > 1000) {
    performanceLogger.warn('Slow database query', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration,
    });
  }
};

/**
 * User activity logging helper
 */
export const logUserActivity = (
  userId: string,
  action: string,
  details?: Record<string, any>
) => {
  logger.info('User activity', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Business event logging helper
 */
export const logBusinessEvent = (
  event: string,
  details: Record<string, any>
) => {
  logger.info(`Business event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Handle uncaught exceptions and unhandled rejections
if (config.nodeEnv === 'production') {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: promise.toString(),
    });
  });
}

export default logger;