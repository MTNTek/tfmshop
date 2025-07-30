import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env';
import CacheService from '../services/CacheService';

/**
 * Custom rate limit store using Cache service (Redis with memory fallback)
 */
class CacheStore {
  private prefix = 'rate_limit:';

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    try {
      const cacheKey = `${this.prefix}${key}`;
      const current = await CacheService.get<{ count: number; resetTime: number }>(cacheKey);
      
      if (current) {
        const newCount = current.count + 1;
        const ttl = Math.ceil((current.resetTime - Date.now()) / 1000);
        
        if (ttl > 0) {
          await CacheService.set(cacheKey, { count: newCount, resetTime: current.resetTime }, ttl);
          
          return {
            totalHits: newCount,
            resetTime: new Date(current.resetTime),
          };
        }
      }
      
      // Create new rate limit window
      const resetTime = Date.now() + (15 * 60 * 1000); // 15 minute window
      await CacheService.set(cacheKey, { count: 1, resetTime }, 15 * 60);
      
      return {
        totalHits: 1,
        resetTime: new Date(resetTime),
      };
    } catch (error) {
      console.warn('⚠️  Cache rate limit store error (allowing request):', error.message);
      // Graceful degradation: allow the request
      return { totalHits: 1, resetTime: new Date(Date.now() + 15 * 60 * 1000) };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      const cacheKey = `${this.prefix}${key}`;
      const current = await CacheService.get<{ count: number; resetTime: number }>(cacheKey);
      
      if (current && current.count > 0) {
        const newCount = current.count - 1;
        const ttl = Math.ceil((current.resetTime - Date.now()) / 1000);
        
        if (newCount <= 0 || ttl <= 0) {
          await CacheService.del(cacheKey);
        } else {
          await CacheService.set(cacheKey, { count: newCount, resetTime: current.resetTime }, ttl);
        }
      }
    } catch (error) {
      console.warn('⚠️  Cache rate limit decrement error:', error.message);
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await CacheService.del(`${this.prefix}${key}`);
    } catch (error) {
      console.warn('⚠️  Cache rate limit reset error:', error.message);
    }
  }
}

/**
 * Rate limit error handler
 */
const rateLimitHandler = (req: Request, res: Response) => {
  const retryAfter = Math.round((req as any).rateLimit?.resetTime?.getTime() || Date.now() + 60000);
  
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter: new Date(retryAfter).toISOString(),
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Skip rate limiting for certain conditions
 */
const skipRateLimit = (req: Request): boolean => {
  // Skip for health checks
  if (req.path === '/health' || req.path === '/metrics') {
    return true;
  }

  // Skip for admin users (if authenticated)
  const user = (req as any).user;
  if (user && user.role === 'admin') {
    return true;
  }

  // Skip in test environment
  if (config.nodeEnv === 'test') {
    return true;
  }

  return false;
};

/**
 * General rate limiter for all requests
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.performance.rateLimit.general, // requests per window
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  store: config.performance.enableCaching ? new CacheStore() : undefined,
  keyGenerator: (req: Request) => {
    // Use IP address and user ID if available
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id;
    return userId ? `${ip}:${userId}` : ip;
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.performance.rateLimit.auth, // requests per window
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => config.nodeEnv === 'test',
  store: config.performance.enableCaching ? new CacheStore() : undefined,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `auth:${ip}`;
  },
});

/**
 * API rate limiter for general API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.performance.rateLimit.api, // requests per window
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  store: config.performance.enableCaching ? new CacheStore() : undefined,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id;
    return userId ? `api:${ip}:${userId}` : `api:${ip}`;
  },
});

/**
 * Upload rate limiter for file uploads
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.performance.rateLimit.upload, // requests per window
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => config.nodeEnv === 'test',
  store: config.performance.enableCaching ? new CacheStore() : undefined,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id;
    return userId ? `upload:${ip}:${userId}` : `upload:${ip}`;
  },
});

/**
 * Search rate limiter for search endpoints
 */
export const searchRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: config.performance.rateLimit.search, // requests per window
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  store: config.performance.enableCaching ? new CacheStore() : undefined,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id;
    return userId ? `search:${ip}:${userId}` : `search:${ip}`;
  },
});

/**
 * Admin rate limiter for admin endpoints
 */
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.performance.rateLimit.admin, // requests per window
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => config.nodeEnv === 'test',
  store: config.performance.enableCaching ? new CacheStore() : undefined,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    return `admin:${ip}:${userId}`;
  },
});