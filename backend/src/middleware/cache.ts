import { Request, Response, NextFunction } from 'express';
import CacheService from '../services/CacheService';
import { config } from '../config/env';

/**
 * Cache configuration for different endpoints
 */
export const CACHE_DURATIONS = {
  PRODUCTS_LIST: 300, // 5 minutes
  PRODUCT_DETAIL: 600, // 10 minutes
  CATEGORIES: 1800, // 30 minutes
  USER_PROFILE: 300, // 5 minutes
  SEARCH_RESULTS: 180, // 3 minutes
  ANALYTICS: 900, // 15 minutes
} as const;

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request, prefix: string): string {
  const queryString = Object.keys(req.query)
    .sort()
    .map(key => `${key}=${req.query[key]}`)
    .join('&');
  
  const pathKey = req.path.replace(/\//g, '_');
  const userId = (req as any).user?.id || 'anonymous';
  
  return CacheService.generateKey(
    prefix,
    pathKey,
    userId,
    queryString || 'no-query'
  );
}

/**
 * Cache middleware for GET requests
 */
export function cacheMiddleware(
  prefix: string,
  ttlSeconds: number = CACHE_DURATIONS.PRODUCTS_LIST,
  options: {
    skipCache?: (req: Request) => boolean;
    keyGenerator?: (req: Request) => string;
    varyByUser?: boolean;
  } = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if disabled or custom skip condition
    if (!config.performance.enableCaching || options.skipCache?.(req)) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(req)
        : generateCacheKey(req, prefix);

      // Try to get from cache
      const cachedData = await CacheService.get(cacheKey);
      
      if (cachedData) {
        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${ttlSeconds}`,
          'ETag': `"${Buffer.from(JSON.stringify(cachedData)).toString('base64')}"`,
        });
        
        return res.json(cachedData);
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data: any) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          CacheService.set(cacheKey, data, ttlSeconds).catch(error => {
            console.error('❌ Failed to cache response:', error);
          });
        }

        // Set cache headers
        res.set({
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${ttlSeconds}`,
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('❌ Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Cache invalidation middleware
 */
export function invalidateCache(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to invalidate cache on success
    const invalidateOnSuccess = function(this: Response, data: any) {
      if (this.statusCode >= 200 && this.statusCode < 300) {
        // Invalidate cache patterns asynchronously
        Promise.all(
          patterns.map(pattern => CacheService.delPattern(pattern))
        ).catch(error => {
          console.error('❌ Failed to invalidate cache:', error);
        });
      }
      return data;
    };

    res.json = function(data: any) {
      invalidateOnSuccess.call(this, data);
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      invalidateOnSuccess.call(this, data);
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Specific cache middleware for products
 */
export const cacheProducts = cacheMiddleware('products', CACHE_DURATIONS.PRODUCTS_LIST);

/**
 * Specific cache middleware for product details
 */
export const cacheProductDetail = cacheMiddleware('product', CACHE_DURATIONS.PRODUCT_DETAIL);

/**
 * Specific cache middleware for categories
 */
export const cacheCategories = cacheMiddleware('categories', CACHE_DURATIONS.CATEGORIES);

/**
 * Specific cache middleware for search results
 */
export const cacheSearch = cacheMiddleware('search', CACHE_DURATIONS.SEARCH_RESULTS);

/**
 * Cache invalidation patterns for different operations
 */
export const CACHE_INVALIDATION_PATTERNS = {
  PRODUCTS: ['*:products:*', '*:search:*'],
  CATEGORIES: ['*:categories:*', '*:products:*'],
  USERS: ['*:user:*'],
  ORDERS: ['*:orders:*', '*:analytics:*'],
};

/**
 * Invalidate product-related cache
 */
export const invalidateProductCache = invalidateCache(CACHE_INVALIDATION_PATTERNS.PRODUCTS);

/**
 * Invalidate category-related cache
 */
export const invalidateCategoryCache = invalidateCache(CACHE_INVALIDATION_PATTERNS.CATEGORIES);

/**
 * Invalidate user-related cache
 */
export const invalidateUserCache = invalidateCache(CACHE_INVALIDATION_PATTERNS.USERS);

/**
 * Invalidate order-related cache
 */
export const invalidateOrderCache = invalidateCache(CACHE_INVALIDATION_PATTERNS.ORDERS);