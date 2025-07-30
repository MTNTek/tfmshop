import { Request, Response } from 'express';
import { AuthController } from '../../src/controllers/AuthController';
import { AuthService } from '../../src/services/AuthService';
import { UserRole } from '../../src/entities/User';

// Mock the AuthService
jest.mock('../../src/services/AuthService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create mocked AuthService
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    
    // Create controller instance
    authController = new AuthController();
    
    // Replace the service instance with our mock
    (authController as any).authService = mockAuthService;

    // Setup mock request and response
    mockRequest = {
      body: {},
      originalUrl: '/api/auth/test',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    };

    it('should register user successfully', async () => {
      const mockResult = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          role: UserRole.CUSTOMER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      mockAuthService.register.mockResolvedValue(mockResult);
      mockRequest.body = validRegistrationData;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.register).toHaveBeenCalledWith(validRegistrationData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'User registered successfully',
        timestamp: expect.any(String),
      });
    });

    it('should handle registration error with user exists', async () => {
      mockAuthService.register.mockRejectedValue(new Error('User with this email already exists'));
      mockRequest.body = validRegistrationData;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        },
        timestamp: expect.any(String),
        path: '/api/auth/test',
      });
    });

    it('should handle validation error', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Email is required'));
      mockRequest.body = validRegistrationData;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email is required',
        },
        timestamp: expect.any(String),
        path: '/api/auth/test',
      });
    });

    it('should handle generic registration error', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Database connection failed'));
      mockRequest.body = validRegistrationData;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'Database connection failed',
        },
        timestamp: expect.any(String),
        path: '/api/auth/test',
      });
    });
  });

  describe('login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const mockResult = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.CUSTOMER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      mockAuthService.login.mockResolvedValue(mockResult);
      mockRequest.body = validLoginData;

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Login successful',
        timestamp: expect.any(String),
      });
    });

    it('should handle invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid email or password'));
      mockRequest.body = validLoginData;

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        timestamp: expect.any(String),
        path: '/api/auth/test',
      });
    });

    it('should handle deactivated account', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Account is deactivated'));
      mockRequest.body = validLoginData;

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Account is deactivated',
        },
        timestamp: expect.any(String),
        path: '/api/auth/test',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await authController.logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful',
        timestamp: expect.any(String),
      });
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockTokens);
      mockRequest.body = { refreshToken: 'old-refresh-token' };

      await authController.refresh(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old-refresh-token');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { tokens: mockTokens },
        message: 'Token refreshed successfully',
        timestamp: expect.any(String),
      });
    });

    it('should handle invalid refresh token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));
      mockRequest.body = { refreshToken: 'invalid-token' };

      await authController.refresh(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token',
        },
        timestamp: expect.any(String),
        path: '/api/auth/test',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset successfully', async () => {
      const mockResetToken = {
        token: 'reset-token-123',
        expiresAt: new Date(),
      };

      mockAuthService.initiatePasswordReset.mockResolvedValue(mockResetToken);
      mockRequest.body = { email: 'test@example.com' };

      await authController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.initiatePasswordReset).toHaveBeenCalledWith('test@example.com');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'Password reset instructions sent to your email',
          resetToken: 'reset-token-123',
          expiresAt: mockResetToken.expiresAt,
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle user not found', async () => {
      mockAuthService.initiatePasswordReset.mockRejectedValue(new Error('User not found'));
      mockRequest.body = { email: 'nonexistent@example.com' };

      await authController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        timestamp: expect.any(String),
        path: '/api/auth/test',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockAuthService.resetPassword.mockResolvedValue();
      mockRequest.body = { token: 'reset-token', password: 'newpassword123' };

      await authController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('reset-token', 'newpassword123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successfully',
        timestamp: expect.any(String),
      });
    });

    it('should handle invalid reset token', async () => {
      mockAuthService.resetPassword.mockRejectedValue(new Error('Invalid or expired reset token'));
      mockRequest.body = { token: 'invalid-token', password: 'newpassword123' };

      await authController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_RESET_TOKEN',
          message: 'Invalid or expired reset token',
        },
        timestamp: expect.any(String),
        path: '/api/auth/test',
      });
    });
  });
});