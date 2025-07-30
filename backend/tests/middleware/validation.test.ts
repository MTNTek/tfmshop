import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery, validateParams } from '../../src/middleware/validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/api/test',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateBody', () => {
    const testSchema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
      name: z.string().min(1),
    });

    it('should validate and transform valid request body', () => {
      mockRequest.body = {
        email: 'test@example.com',
        age: 25,
        name: 'John Doe',
      };

      const middleware = validateBody(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        age: 25,
        name: 'John Doe',
      });
    });

    it('should return 400 for invalid request body', () => {
      mockRequest.body = {
        email: 'invalid-email',
        age: 15, // Too young
        // Missing name
      };

      const middleware = validateBody(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'Invalid email',
            }),
            expect.objectContaining({
              field: 'age',
              message: 'Number must be greater than or equal to 18',
            }),
            expect.objectContaining({
              field: 'name',
              message: 'Required',
            }),
          ]),
        },
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle schema transformation', () => {
      const transformSchema = z.object({
        email: z.string().email().transform(email => email.toLowerCase()),
        name: z.string().transform(name => name.trim()),
      });

      mockRequest.body = {
        email: 'TEST@EXAMPLE.COM',
        name: '  John Doe  ',
      };

      const middleware = validateBody(transformSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        name: 'John Doe',
      });
    });

    it('should handle unexpected validation errors', () => {
      const faultySchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      } as any;

      mockRequest.body = { test: 'data' };

      const middleware = validateBody(faultySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal validation error',
        },
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)),
      limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().max(100)),
      search: z.string().optional(),
    });

    it('should validate and transform query parameters', () => {
      mockRequest.query = {
        page: '2',
        limit: '10',
        search: 'test query',
      };

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.query).toEqual({
        page: 2,
        limit: 10,
        search: 'test query',
      });
    });

    it('should return 400 for invalid query parameters', () => {
      mockRequest.query = {
        page: '0', // Invalid: less than 1
        limit: '200', // Invalid: greater than 100
      };

      const middleware = validateQuery(querySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'page',
            }),
            expect.objectContaining({
              field: 'limit',
            }),
          ]),
        },
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });
  });

  describe('validateParams', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
      slug: z.string().min(1),
    });

    it('should validate and transform route parameters', () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-slug',
      };

      const middleware = validateParams(paramsSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.params).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-slug',
      });
    });

    it('should return 400 for invalid route parameters', () => {
      mockRequest.params = {
        id: 'invalid-uuid',
        slug: '', // Empty string
      };

      const middleware = validateParams(paramsSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parameter validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'id',
              message: 'Invalid uuid',
            }),
            expect.objectContaining({
              field: 'slug',
              message: 'String must contain at least 1 character(s)',
            }),
          ]),
        },
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });
  });

  describe('Error Response Format', () => {
    it('should include timestamp in error responses', () => {
      const schema = z.object({ required: z.string() });
      mockRequest.body = {};

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        })
      );
    });

    it('should include request path in error responses', () => {
      const schema = z.object({ required: z.string() });
      mockRequest.body = {};
      mockRequest.originalUrl = '/api/custom/path';

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/custom/path',
        })
      );
    });

    it('should format nested field errors correctly', () => {
      const nestedSchema = z.object({
        user: z.object({
          profile: z.object({
            email: z.string().email(),
          }),
        }),
      });

      mockRequest.body = {
        user: {
          profile: {
            email: 'invalid-email',
          },
        },
      };

      const middleware = validateBody(nestedSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'user.profile.email',
                message: 'Invalid email',
              }),
            ]),
          }),
        })
      );
    });
  });
});