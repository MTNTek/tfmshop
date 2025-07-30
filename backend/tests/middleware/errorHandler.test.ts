import request from 'supertest';
import express from 'express';
import { ZodError, z } from 'zod';
import {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  securityHeaders,
  requestId,
} from '../../src/middleware/errorHandler';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessLogicError,
  InternalServerError,
} from '../../src/utils/errors';

describe('Error Handler Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(securityHeaders);
    app.use(requestId);
  });

  describe('globalErrorHandler', () => {
    it('should handle ValidationError correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new ValidationError('Invalid input', [{ field: 'email', message: 'Invalid email' }]));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Invalid input');
      expect(response.body.error.details).toEqual([{ field: 'email', message: 'Invalid email' }]);
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/test');
    });

    it('should handle AuthenticationError correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new AuthenticationError('Token expired'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('Token expired');
    });

    it('should handle AuthorizationError correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new AuthorizationError('Admin access required'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toBe('Admin access required');
    });

    it('should handle NotFoundError correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new NotFoundError('User'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND_ERROR');
      expect(response.body.error.message).toBe('User not found');
    });

    it('should handle ConflictError correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new ConflictError('Email already exists'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT_ERROR');
      expect(response.body.error.message).toBe('Email already exists');
    });

    it('should handle BusinessLogicError correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new BusinessLogicError('Cannot delete active user'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BUSINESS_LOGIC_ERROR');
      expect(response.body.error.message).toBe('Cannot delete active user');
    });

    it('should handle InternalServerError correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new InternalServerError('Database connection failed'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.body.error.message).toBe('Database connection failed');
    });

    it('should handle ZodError correctly', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      app.post('/test', (req, res, next) => {
        try {
          schema.parse({ email: 'invalid', age: 15 });
        } catch (error) {
          next(error);
        }
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .post('/test')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
      expect(Array.isArray(response.body.error.details)).toBe(true);
    });

    it('should handle generic Error correctly', async () => {
      app.get('/test', (req, res, next) => {
        next(new Error('Something went wrong'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.body.error.message).toBe('Something went wrong');
    });

    it('should include request ID in response', async () => {
      app.get('/test', (req, res, next) => {
        next(new ValidationError('Test error'));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .set('X-Request-ID', 'test-123')
        .expect(400);

      expect(response.body.requestId).toBe('test-123');
    });
  });

  describe('notFoundHandler', () => {
    it('should handle 404 routes correctly', async () => {
      app.use(notFoundHandler);
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
      expect(response.body.error.message).toBe('Route /nonexistent not found');
    });
  });

  describe('asyncHandler', () => {
    it('should catch async errors and pass to error handler', async () => {
      const asyncRoute = asyncHandler(async (req: any, res: any, next: any) => {
        throw new ValidationError('Async error');
      });

      app.get('/test', asyncRoute);
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Async error');
    });

    it('should handle successful async operations', async () => {
      const asyncRoute = asyncHandler(async (req: any, res: any, next: any) => {
        res.json({ success: true, message: 'Success' });
      });

      app.get('/test', asyncRoute);

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Success');
    });
  });

  describe('securityHeaders', () => {
    it('should add security headers to response', async () => {
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['content-security-policy']).toContain("default-src 'none'");
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('requestId', () => {
    it('should add request ID to response headers', async () => {
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should use provided request ID', async () => {
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('X-Request-ID', 'custom-id-123')
        .expect(200);

      expect(response.headers['x-request-id']).toBe('custom-id-123');
    });
  });
});