import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorFactory, isAppError, isOperationalError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
  timestamp: string;
  path: string;
  requestId?: string;
}

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Convert different error types to AppError
  if (error instanceof ZodError) {
    appError = ErrorFactory.createValidationError(error);
  } else if (isAppError(error)) {
    appError = error;
  } else if (error.name === 'QueryFailedError' || error.name === 'TypeORMError') {
    appError = ErrorFactory.createDatabaseError(error);
  } else {
    appError = ErrorFactory.createFromUnknown(error);
  }

  // Log error
  logger.error(
    `${appError.errorCode}: ${appError.message}`,
    appError,
    {
      statusCode: appError.statusCode,
      errorCode: appError.errorCode,
      isOperational: appError.isOperational,
    },
    req
  );

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: appError.errorCode,
      message: appError.message,
    },
    timestamp: appError.timestamp,
    path: req.originalUrl,
  };

  // Add details for validation errors
  if (appError.errorCode === 'VALIDATION_ERROR' && (appError as any).details) {
    errorResponse.error.details = (appError as any).details;
  }

  // Add stack trace in development
  if (config.nodeEnv === 'development' && appError.stack) {
    errorResponse.error.stack = appError.stack;
  }

  // Add request ID if available
  if ((req as any).requestId) {
    errorResponse.requestId = (req as any).requestId;
  }

  // Send error response
  res.status(appError.statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);

  next(error);
};

/**
 * Unhandled promise rejection handler
 */
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection', reason, {
      promise: promise.toString(),
    });

    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Uncaught exception handler
 */
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', error);

    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Graceful shutdown handler
 */
export const handleGracefulShutdown = (): void => {
  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Close server and database connections
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Add CSP header for API
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none';"
  );

  next();
};

/**
 * Request ID middleware
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.get('X-Request-ID') || generateRequestId();
  (req as any).requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Rate limiting error handler
 */
export const rateLimitHandler = (req: Request, res: Response): void => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.originalUrl,
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  res.status(429).json(errorResponse);
};

/**
 * Validation error formatter
 */
export const formatValidationError = (error: ZodError): any => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: err.code === 'invalid_type' ? (err as any).received : undefined,
    expected: err.code === 'invalid_type' ? (err as any).expected : undefined,
  }));
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error: any): AppError => {
  logger.error('Database error occurred', {
    code: error.code,
    detail: error.detail,
    constraint: error.constraint,
  });

  return ErrorFactory.createDatabaseError(error);
};

/**
 * Authentication error handler
 */
export const handleAuthError = (message: string, req: Request): void => {
  logger.warn(`Authentication failed: ${message}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.originalUrl,
  });
};

/**
 * Authorization error handler
 */
export const handleAuthzError = (message: string, userId: string, req: Request): void => {
  logger.warn(`Authorization failed: ${message}`, {
    userId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.originalUrl,
    requiredPermission: message,
  });
};