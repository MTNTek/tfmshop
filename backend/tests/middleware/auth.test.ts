import { Response, NextFunction } from 'express';
import { authenticateToken, requireRole, requireAdmin, requireCustomer, optionalAuth, AuthenticatedRequest } from '../../src/middleware/auth';
import { JwtUtils } from '../../src/utils/jwt';
import { User, UserRole } from '../../src/entities/User';
import { AppDataSource } from '../../src/config/database';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock dependencies
jest.mock('../../src/utils/jwt');
jest.mock('../../src/config/database');

const mockJwtUtils = JwtUtils as jest.Mocked<typeof JwtUtils>;
const mockAppDataSource = AppDataSource as jest.Mocked<typeof AppDataSource>;

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockUserRepository: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      path: '/test',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockAppDataSource.getRepository = jest.fn().mockReturnValue(mockUserRepository);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should return 401 when no authorization header is provided', async () => {
      mockJwtUtils.extractTokenFromHeader.mockReturnValue(null);

      await authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required',
        },
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token extraction fails', async () => {
      mockRequest.headers!.authorization = 'InvalidFormat';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue(null);

      await authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required',
        },
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token verification fails', async () => {
      mockRequest.headers!.authorization = 'Bearer invalid-token';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue('invalid-token');
      mockJwtUtils.verifyAccessToken.mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      await authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TOKEN_VERIFICATION_FAILED',
          message: 'Token verification failed',
        },
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers!.authorization = 'Bearer invalid-token';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue('invalid-token');
      mockJwtUtils.verifyAccessToken.mockImplementation(() => {
        throw new Error('Token is invalid');
      });

      await authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid access token',
        },
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      mockRequest.headers!.authorization = 'Bearer expired-token';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue('expired-token');
      mockJwtUtils.verifyAccessToken.mockImplementation(() => {
        throw new Error('Access token has expired');
      });

      await authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
        },
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
      const mockPayload = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      mockRequest.headers!.authorization = 'Bearer valid-token';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockJwtUtils.verifyAccessToken.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(null);

      await authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive',
        },
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should authenticate successfully with valid token and user', async () => {
      const mockPayload = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        isActive: true,
      } as User;

      mockRequest.headers!.authorization = 'Bearer valid-token';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockJwtUtils.verifyAccessToken.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await authenticateToken(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBe(mockUser);
      expect(mockRequest.tokenPayload).toBe(mockPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should return 401 when user is not authenticated', () => {
      const middleware = requireRole(UserRole.ADMIN);
      
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        },
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', () => {
      const mockUser = {
        id: 'user-id',
        role: UserRole.CUSTOMER,
      } as User;

      mockRequest.user = mockUser;
      
      const middleware = requireRole(UserRole.ADMIN);
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions to access this resource',
        },
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access when user has required role', () => {
      const mockUser = {
        id: 'user-id',
        role: UserRole.ADMIN,
      } as User;

      mockRequest.user = mockUser;
      
      const middleware = requireRole(UserRole.ADMIN);
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access when user has one of multiple required roles', () => {
      const mockUser = {
        id: 'user-id',
        role: UserRole.CUSTOMER,
      } as User;

      mockRequest.user = mockUser;
      
      const middleware = requireRole([UserRole.ADMIN, UserRole.CUSTOMER]);
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin users', () => {
      const mockUser = {
        id: 'user-id',
        role: UserRole.ADMIN,
      } as User;

      mockRequest.user = mockUser;
      
      requireAdmin(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin users', () => {
      const mockUser = {
        id: 'user-id',
        role: UserRole.CUSTOMER,
      } as User;

      mockRequest.user = mockUser;
      
      requireAdmin(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireCustomer', () => {
    it('should allow access for customer users', () => {
      const mockUser = {
        id: 'user-id',
        role: UserRole.CUSTOMER,
      } as User;

      mockRequest.user = mockUser;
      
      requireCustomer(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-customer users', () => {
      const mockUser = {
        id: 'user-id',
        role: UserRole.ADMIN,
      } as User;

      mockRequest.user = mockUser;
      
      requireCustomer(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should continue without authentication when no token is provided', async () => {
      mockJwtUtils.extractTokenFromHeader.mockReturnValue(null);

      await optionalAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without authentication when token verification fails', async () => {
      mockRequest.headers!.authorization = 'Bearer invalid-token';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue('invalid-token');
      mockJwtUtils.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await optionalAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should authenticate when valid token is provided', async () => {
      const mockPayload = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        isActive: true,
      } as User;

      mockRequest.headers!.authorization = 'Bearer valid-token';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockJwtUtils.verifyAccessToken.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await optionalAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBe(mockUser);
      expect(mockRequest.tokenPayload).toBe(mockPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without authentication when user is not found', async () => {
      const mockPayload = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      mockRequest.headers!.authorization = 'Bearer valid-token';
      mockJwtUtils.extractTokenFromHeader.mockReturnValue('valid-token');
      mockJwtUtils.verifyAccessToken.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(null);

      await optionalAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});