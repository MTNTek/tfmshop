import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { securityLogger } from '../utils/logger';

/**
 * Additional security middleware for production
 */

/**
 * IP whitelist middleware for admin endpoints
 */
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (config.nodeEnv !== 'production' || allowedIPs.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!allowedIPs.includes(clientIP)) {
      securityLogger.warn('IP not in whitelist', {
        clientIP,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'IP_NOT_ALLOWED',
          message: 'Access denied from this IP address',
        },
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * Request size limiter middleware
 */
export const requestSizeLimiter = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
      securityLogger.warn('Request size exceeded', {
        contentLength,
        maxSize,
        ip: req.ip,
        path: req.path,
      });

      return res.status(413).json({
        success: false,
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: 'Request entity too large',
        },
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * Suspicious activity detector
 */
export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\.\//g, // Path traversal
    /<script/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /drop\s+table/gi, // SQL injection
    /exec\s*\(/gi, // Command injection
    /eval\s*\(/gi, // Code injection
  ];

  const checkString = `${req.url} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      securityLogger.error('Suspicious activity detected', {
        pattern: pattern.toString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        query: req.query,
        body: req.body,
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'SUSPICIOUS_ACTIVITY',
          message: 'Request blocked due to suspicious content',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  next();
};

/**
 * Brute force protection middleware
 */
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const bruteForceProtection = (
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  blockDurationMs: number = 60 * 60 * 1000 // 1 hour
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const attempts = failedAttempts.get(key);

    // Clean up old entries
    if (attempts && now - attempts.lastAttempt > windowMs) {
      failedAttempts.delete(key);
    }

    // Check if IP is currently blocked
    if (attempts && attempts.count >= maxAttempts) {
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      if (timeSinceLastAttempt < blockDurationMs) {
        securityLogger.warn('Brute force attempt blocked', {
          ip: key,
          attempts: attempts.count,
          path: req.path,
        });

        return res.status(429).json({
          success: false,
          error: {
            code: 'TOO_MANY_ATTEMPTS',
            message: 'Too many failed attempts. Please try again later.',
            retryAfter: new Date(attempts.lastAttempt + blockDurationMs).toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        // Reset after block duration
        failedAttempts.delete(key);
      }
    }

    // Store original end method to track failed requests
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      // Track failed authentication attempts
      if (res.statusCode === 401 || res.statusCode === 403) {
        const current = failedAttempts.get(key) || { count: 0, lastAttempt: 0 };
        failedAttempts.set(key, {
          count: current.count + 1,
          lastAttempt: now,
        });
      } else if (res.statusCode >= 200 && res.statusCode < 300) {
        // Reset on successful request
        failedAttempts.delete(key);
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

/**
 * API key validation middleware
 */
export const apiKeyValidation = (req: Request, res: Response, next: NextFunction) => {
  // Skip in development
  if (config.nodeEnv === 'development') {
    return next();
  }

  const apiKey = req.get('X-API-Key');
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (validApiKeys.length > 0 && !apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'API_KEY_REQUIRED',
        message: 'API key is required',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (validApiKeys.length > 0 && !validApiKeys.includes(apiKey!)) {
    securityLogger.warn('Invalid API key used', {
      apiKey: apiKey?.substring(0, 8) + '...',
      ip: req.ip,
      path: req.path,
    });

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key',
      },
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        securityLogger.warn('Request timeout', {
          timeout: timeoutMs,
          ip: req.ip,
          path: req.path,
          method: req.method,
        });

        res.status(408).json({
          success: false,
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'Request timeout',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }, timeoutMs);

    // Clear timeout when response is sent
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      clearTimeout(timeout);
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

/**
 * Content type validation middleware
 */
export const contentTypeValidation = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONTENT_TYPE_REQUIRED',
          message: 'Content-Type header is required',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const isAllowed = allowedTypes.some(type => contentType.includes(type));
    
    if (!isAllowed) {
      return res.status(415).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: `Unsupported media type. Allowed types: ${allowedTypes.join(', ')}`,
        },
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * CORS preflight optimization
 */
export const corsPreflightOptimization = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    // Cache preflight response for 24 hours
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  next();
};

/**
 * Security headers for production
 */
export const productionSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  if (config.nodeEnv === 'production') {
    // Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'none'; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
    
    // Additional security headers
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  }
  
  next();
};