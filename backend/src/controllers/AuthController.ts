import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types/auth';

/**
 * Authentication controller handling user registration, login, and token management
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
      const result = await this.authService.register(req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      // Determine appropriate status code based on error
      let statusCode = 500;
      let errorCode = 'REGISTRATION_ERROR';

      if (errorMessage.includes('already exists')) {
        statusCode = 409;
        errorCode = 'USER_EXISTS';
      } else if (errorMessage.includes('required') || errorMessage.includes('Invalid')) {
        statusCode = 400;
        errorCode = 'INVALID_INPUT';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Authenticate user login
   * POST /api/auth/login
   */
  login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
      const result = await this.authService.login(req.body);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Determine appropriate status code based on error
      let statusCode = 500;
      let errorCode = 'LOGIN_ERROR';

      if (errorMessage.includes('Invalid') || errorMessage.includes('required')) {
        statusCode = 401;
        errorCode = 'INVALID_CREDENTIALS';
      } else if (errorMessage.includes('deactivated')) {
        statusCode = 403;
        errorCode = 'ACCOUNT_DEACTIVATED';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Logout user (client-side token invalidation)
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response) => {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the tokens from storage. This endpoint confirms the logout action.
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refresh = async (req: Request<{}, {}, RefreshTokenRequest>, res: Response) => {
    try {
      const tokens = await this.authService.refreshToken(req.body.refreshToken);

      res.status(200).json({
        success: true,
        data: { tokens },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      // Most refresh token errors are authentication related
      let statusCode = 401;
      let errorCode = 'INVALID_REFRESH_TOKEN';

      if (errorMessage.includes('required')) {
        statusCode = 400;
        errorCode = 'MISSING_REFRESH_TOKEN';
      } else if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Initiate password reset
   * POST /api/auth/forgot-password
   */
  forgotPassword = async (req: Request<{}, {}, ForgotPasswordRequest>, res: Response) => {
    try {
      const resetToken = await this.authService.initiatePasswordReset(req.body.email);

      // In production, you would send this token via email
      // For development/testing, we return it in the response
      res.status(200).json({
        success: true,
        data: {
          message: 'Password reset instructions sent to your email',
          // Remove this in production - only for development/testing
          resetToken: resetToken.token,
          expiresAt: resetToken.expiresAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      
      let statusCode = 500;
      let errorCode = 'PASSWORD_RESET_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      } else if (errorMessage.includes('required')) {
        statusCode = 400;
        errorCode = 'INVALID_INPUT';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  resetPassword = async (req: Request<{}, {}, ResetPasswordRequest>, res: Response) => {
    try {
      await this.authService.resetPassword(req.body.token, req.body.password);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      
      let statusCode = 500;
      let errorCode = 'PASSWORD_RESET_ERROR';

      if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
        statusCode = 400;
        errorCode = 'INVALID_RESET_TOKEN';
      } else if (errorMessage.includes('required')) {
        statusCode = 400;
        errorCode = 'INVALID_INPUT';
      } else if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };
}