/**
 * Base application error class
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  public readonly details?: any;

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class RouteNotFoundError extends AppError {
  constructor(route: string) {
    super(`Route ${route} not found`, 404, 'ROUTE_NOT_FOUND');
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * Business logic error (422)
 */
export class BusinessLogicError extends AppError {
  constructor(message: string) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR');
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR', false);
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR', false);
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service ${service} is unavailable`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      false
    );
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE_ERROR', false);
  }
}

/**
 * Error factory for creating appropriate error instances
 */
export class ErrorFactory {
  /**
   * Create validation error from Zod error
   */
  static createValidationError(zodError: any): ValidationError {
    const details = zodError.errors?.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return new ValidationError('Request validation failed', details);
  }

  /**
   * Create database error from database exception
   */
  static createDatabaseError(dbError: any): DatabaseError {
    // Handle common database errors
    if (dbError.code === '23505') {
      // Unique constraint violation
      return new ConflictError('Resource already exists');
    }

    if (dbError.code === '23503') {
      // Foreign key constraint violation
      return new BusinessLogicError('Referenced resource does not exist');
    }

    if (dbError.code === '23502') {
      // Not null constraint violation
      return new ValidationError('Required field is missing');
    }

    // Generic database error
    return new DatabaseError('Database operation failed');
  }

  /**
   * Create appropriate error from unknown error
   */
  static createFromUnknown(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      // Check for specific error patterns
      if (error.message.includes('validation')) {
        return new ValidationError(error.message);
      }

      if (error.message.includes('not found')) {
        return new NotFoundError();
      }

      if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
        return new AuthenticationError(error.message);
      }

      if (error.message.includes('forbidden') || error.message.includes('permission')) {
        return new AuthorizationError(error.message);
      }

      // Generic error
      return new InternalServerError(error.message);
    }

    // Unknown error type
    return new InternalServerError('An unexpected error occurred');
  }
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: Error): error is AppError {
  return error instanceof AppError;
}