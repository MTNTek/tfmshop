import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessLogicError,
  RateLimitError,
  InternalServerError,
  DatabaseError,
  ExternalServiceError,
  ServiceUnavailableError,
  ErrorFactory,
  isOperationalError,
  isAppError,
} from '../../src/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create base error with correct properties', () => {
      class TestError extends AppError {
        constructor() {
          super('Test message', 400, 'TEST_ERROR');
        }
      }

      const error = new TestError();

      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeDefined();
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with details', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', details);

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
      expect(error.isOperational).toBe(true);
    });

    it('should create validation error without details', () => {
      const error = new ValidationError('Validation failed');

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.details).toBeUndefined();
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Token expired');

      expect(error.message).toBe('Token expired');
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('AUTHENTICATION_ERROR');
    });

    it('should create authentication error with default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with custom message', () => {
      const error = new AuthorizationError('Admin access required');

      expect(error.message).toBe('Admin access required');
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('AUTHORIZATION_ERROR');
    });

    it('should create authorization error with default message', () => {
      const error = new AuthorizationError();

      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with custom resource', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND_ERROR');
    });

    it('should create not found error with default resource', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND_ERROR');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('CONFLICT_ERROR');
    });
  });

  describe('BusinessLogicError', () => {
    it('should create business logic error', () => {
      const error = new BusinessLogicError('Cannot delete active user');

      expect(error.message).toBe('Cannot delete active user');
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe('BUSINESS_LOGIC_ERROR');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with custom message', () => {
      const error = new RateLimitError('API limit exceeded');

      expect(error.message).toBe('API limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe('RATE_LIMIT_ERROR');
    });

    it('should create rate limit error with default message', () => {
      const error = new RateLimitError();

      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.errorCode).toBe('RATE_LIMIT_ERROR');
    });
  });

  describe('InternalServerError', () => {
    it('should create internal server error with custom message', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.isOperational).toBe(false);
    });

    it('should create internal server error with default message', () => {
      const error = new InternalServerError();

      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with custom message', () => {
      const error = new DatabaseError('Connection timeout');

      expect(error.message).toBe('Connection timeout');
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.isOperational).toBe(false);
    });

    it('should create database error with default message', () => {
      const error = new DatabaseError();

      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('DATABASE_ERROR');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error with custom message', () => {
      const error = new ExternalServiceError('PaymentAPI', 'Payment processing failed');

      expect(error.message).toBe('Payment processing failed');
      expect(error.statusCode).toBe(502);
      expect(error.errorCode).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.isOperational).toBe(false);
    });

    it('should create external service error with default message', () => {
      const error = new ExternalServiceError('PaymentAPI');

      expect(error.message).toBe('External service PaymentAPI is unavailable');
      expect(error.statusCode).toBe(502);
      expect(error.errorCode).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create service unavailable error with custom message', () => {
      const error = new ServiceUnavailableError('Maintenance in progress');

      expect(error.message).toBe('Maintenance in progress');
      expect(error.statusCode).toBe(503);
      expect(error.errorCode).toBe('SERVICE_UNAVAILABLE_ERROR');
      expect(error.isOperational).toBe(false);
    });

    it('should create service unavailable error with default message', () => {
      const error = new ServiceUnavailableError();

      expect(error.message).toBe('Service temporarily unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.errorCode).toBe('SERVICE_UNAVAILABLE_ERROR');
      expect(error.isOperational).toBe(false);
    });
  });
});

describe('ErrorFactory', () => {
  describe('createValidationError', () => {
    it('should create validation error from Zod error', () => {
      const zodError = {
        errors: [
          { path: ['email'], message: 'Invalid email', code: 'invalid_string' },
          { path: ['age'], message: 'Must be at least 18', code: 'too_small' },
        ],
      };

      const error = ErrorFactory.createValidationError(zodError);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Request validation failed');
      expect(error.details).toEqual([
        { field: 'email', message: 'Invalid email', code: 'invalid_string' },
        { field: 'age', message: 'Must be at least 18', code: 'too_small' },
      ]);
    });
  });

  describe('createDatabaseError', () => {
    it('should create conflict error for unique constraint violation', () => {
      const dbError = { code: '23505', detail: 'Key already exists' };

      const error = ErrorFactory.createDatabaseError(dbError);

      expect(error).toBeInstanceOf(ConflictError);
      expect(error.message).toBe('Resource already exists');
    });

    it('should create business logic error for foreign key constraint violation', () => {
      const dbError = { code: '23503', detail: 'Foreign key violation' };

      const error = ErrorFactory.createDatabaseError(dbError);

      expect(error).toBeInstanceOf(BusinessLogicError);
      expect(error.message).toBe('Referenced resource does not exist');
    });

    it('should create validation error for not null constraint violation', () => {
      const dbError = { code: '23502', detail: 'Not null violation' };

      const error = ErrorFactory.createDatabaseError(dbError);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Required field is missing');
    });

    it('should create generic database error for unknown codes', () => {
      const dbError = { code: '99999', detail: 'Unknown error' };

      const error = ErrorFactory.createDatabaseError(dbError);

      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.message).toBe('Database operation failed');
    });
  });

  describe('createFromUnknown', () => {
    it('should return AppError as is', () => {
      const originalError = new ValidationError('Test error');

      const error = ErrorFactory.createFromUnknown(originalError);

      expect(error).toBe(originalError);
    });

    it('should create validation error for validation-related messages', () => {
      const originalError = new Error('validation failed');

      const error = ErrorFactory.createFromUnknown(originalError);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('validation failed');
    });

    it('should create not found error for not found messages', () => {
      const originalError = new Error('User not found');

      const error = ErrorFactory.createFromUnknown(originalError);

      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should create authentication error for auth-related messages', () => {
      const originalError = new Error('unauthorized access');

      const error = ErrorFactory.createFromUnknown(originalError);

      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('unauthorized access');
    });

    it('should create authorization error for permission-related messages', () => {
      const originalError = new Error('permission denied');

      const error = ErrorFactory.createFromUnknown(originalError);

      expect(error).toBeInstanceOf(AuthorizationError);
      expect(error.message).toBe('permission denied');
    });

    it('should create internal server error for generic errors', () => {
      const originalError = new Error('Something went wrong');

      const error = ErrorFactory.createFromUnknown(originalError);

      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.message).toBe('Something went wrong');
    });

    it('should create internal server error for unknown error types', () => {
      const originalError = 'string error';

      const error = ErrorFactory.createFromUnknown(originalError);

      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.message).toBe('An unexpected error occurred');
    });
  });
});

describe('Type Guards', () => {
  describe('isOperationalError', () => {
    it('should return true for operational AppError', () => {
      const error = new ValidationError('Test error');

      expect(isOperationalError(error)).toBe(true);
    });

    it('should return false for non-operational AppError', () => {
      const error = new InternalServerError('Test error');

      expect(isOperationalError(error)).toBe(false);
    });

    it('should return false for generic Error', () => {
      const error = new Error('Test error');

      expect(isOperationalError(error)).toBe(false);
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new ValidationError('Test error');

      expect(isAppError(error)).toBe(true);
    });

    it('should return false for generic Error', () => {
      const error = new Error('Test error');

      expect(isAppError(error)).toBe(false);
    });
  });
});