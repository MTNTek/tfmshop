import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/User';
import { AuthenticatedRequest } from './auth';

/**
 * Middleware to ensure user has admin privileges
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
      return;
    }

    // Check if user has admin role
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_ACCESS_REQUIRED',
          message: 'Admin privileges required to access this resource',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
      return;
    }

    // Check if admin account is active
    if (!req.user.isActive) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Admin account is inactive',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Error checking admin privileges',
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }
};

/**
 * Middleware to ensure user has admin or specific user access
 * Allows admins to access any user's data, or users to access their own data
 */
export const requireAdminOrOwner = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
        return;
      }

      const targetUserId = req.params[userIdParam];
      
      // Allow if user is admin
      if (req.user.role === UserRole.ADMIN && req.user.isActive) {
        next();
        return;
      }

      // Allow if user is accessing their own data
      if (req.user.id === targetUserId && req.user.isActive) {
        next();
        return;
      }

      // Deny access
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied: You can only access your own data or need admin privileges',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Error checking access privileges',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };
};

/**
 * Middleware to log admin actions for audit purposes
 */
export const logAdminAction = (action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Log admin action (in production, this would go to a proper logging system)
    console.log(`[ADMIN ACTION] ${new Date().toISOString()} - User: ${req.user?.email} (${req.user?.id}) - Action: ${action} - Path: ${req.originalUrl} - IP: ${req.ip}`);
    
    // Store action in request for potential use in controllers
    req.adminAction = {
      action,
      timestamp: new Date(),
      userId: req.user?.id,
      userEmail: req.user?.email,
      path: req.originalUrl,
      ip: req.ip,
    };

    next();
  };
};

/**
 * Extend AuthenticatedRequest to include admin action logging
 */
declare global {
  namespace Express {
    interface Request {
      adminAction?: {
        action: string;
        timestamp: Date;
        userId?: string;
        userEmail?: string;
        path: string;
        ip?: string;
      };
    }
  }
}