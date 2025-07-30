import { Request, Response, NextFunction } from 'express';
import { JwtUtils, JwtPayload } from '../utils/jwt';
import { User, UserRole } from '../entities/User';
import { AppDataSource } from '../config/database';

/**
 * Extended Request interface to include user information
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
  tokenPayload?: JwtPayload;
}

/**
 * Authentication middleware to validate JWT tokens on protected routes
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    // Verify the token
    const payload = JwtUtils.verifyAccessToken(token);
    
    // Get user from database to ensure they still exist and are active
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.userId, isActive: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    // Attach user and payload to request
    req.user = user;
    req.tokenPayload = payload;
    
    next();
  } catch (error) {
    let errorCode = 'TOKEN_VERIFICATION_FAILED';
    let errorMessage = 'Token verification failed';

    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        errorCode = 'TOKEN_EXPIRED';
        errorMessage = 'Access token has expired';
      } else if (error.message.includes('invalid')) {
        errorCode = 'INVALID_TOKEN';
        errorMessage = 'Invalid access token';
      }
    }

    res.status(401).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
};

/**
 * Authorization middleware to check user roles
 */
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions to access this resource',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware to require customer role
 */
export const requireCustomer = requireRole(UserRole.CUSTOMER);

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Verify the token
    const payload = JwtUtils.verifyAccessToken(token);
    
    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.userId, isActive: true },
    });

    if (user) {
      req.user = user;
      req.tokenPayload = payload;
    }

    next();
  } catch (error) {
    // If token verification fails, continue without authentication
    next();
  }
};