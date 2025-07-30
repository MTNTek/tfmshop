import Redis from 'ioredis';
import { config } from '../config/env';

/**
 * Cache service for managing Redis-based caching with in-memory fallback
 */
class CacheService {
  private redis: Redis | null = null;
  private isConnected = false;
  private memoryCache = new Map<string, { value: any; expires: number }>();
  private memoryCacheCleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
    this.startMemoryCacheCleanup();
  }

  /**
   * Initialize Redis connection
   */
  private async initialize(): Promise<void> {
    if (!config.performance.enableCaching) {
      console.log('📦 Caching is disabled');
      return;
    }

    try {
      this.redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        maxRetriesPerRequest: 2,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        enableOfflineQueue: false,
        enableReadyCheck: false,
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        console.log('✅ Redis ready for commands');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        console.warn('⚠️  Redis connection error (graceful degradation):', error.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed (graceful degradation)');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      // Try to connect, but don't fail if Redis is unavailable
      try {
        await this.redis.connect();
      } catch (connectError) {
        const errorMessage = connectError instanceof Error ? connectError.message : 'Unknown connection error';
        console.warn('⚠️  Redis connection failed, continuing without cache:', errorMessage);
        this.redis = null;
        this.isConnected = false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️  Failed to initialize Redis, continuing without cache:', errorMessage);
      this.redis = null;
      this.isConnected = false;
    }
  }

  /**
   * Start memory cache cleanup interval
   */
  private startMemoryCacheCleanup(): void {
    this.memoryCacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.memoryCache.entries()) {
        if (item.expires < now) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Get value from cache (Redis with memory fallback)
   */
  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (this.redis && this.isConnected) {
      try {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️  Redis get error for key ${key}, falling back to memory:`, errorMessage);
      }
    }

    // Fallback to memory cache
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem) {
      if (memoryItem.expires > Date.now()) {
        return memoryItem.value;
      } else {
        this.memoryCache.delete(key);
      }
    }

    return null;
  }

  /**
   * Set value in cache with TTL (Redis with memory fallback)
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    let redisSuccess = false;

    // Try Redis first
    if (this.redis && this.isConnected) {
      try {
        const serialized = JSON.stringify(value);
        await this.redis.setex(key, ttlSeconds, serialized);
        redisSuccess = true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️  Redis set error for key ${key}, falling back to memory:`, errorMessage);
      }
    }

    // Always set in memory cache as fallback
    if (!redisSuccess) {
      const expires = Date.now() + (ttlSeconds * 1000);
      this.memoryCache.set(key, { value, expires });
      
      // Limit memory cache size to prevent memory leaks
      if (this.memoryCache.size > 1000) {
        const firstKey = this.memoryCache.keys().next().value;
        if (firstKey) {
          this.memoryCache.delete(firstKey);
        }
      }
    }

    return true; // Always return true since we have fallback
  }

  /**
   * Delete value from cache (Redis with memory fallback)
   */
  async del(key: string): Promise<boolean> {
    let redisSuccess = false;

    // Try Redis first
    if (this.redis && this.isConnected) {
      try {
        await this.redis.del(key);
        redisSuccess = true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️  Redis delete error for key ${key}:`, errorMessage);
      }
    }

    // Always delete from memory cache
    this.memoryCache.delete(key);

    return true; // Always return true since we handle both caches
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`❌ Cache delete pattern error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    keyCount?: number;
    memoryUsage?: string;
    hitRate?: number;
  }> {
    if (!this.redis || !this.isConnected) {
      return { connected: false };
    }

    try {
      const info = await this.redis.info('memory');
      const keyCount = await this.redis.dbsize();
      
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';

      return {
        connected: true,
        keyCount,
        memoryUsage,
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return { connected: false };
    }
  }

  /**
   * Clear all cache (Redis with memory fallback)
   */
  async clear(): Promise<boolean> {
    let redisSuccess = false;

    // Try Redis first
    if (this.redis && this.isConnected) {
      try {
        await this.redis.flushdb();
        redisSuccess = true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('⚠️  Redis clear error:', errorMessage);
      }
    }

    // Always clear memory cache
    this.memoryCache.clear();

    return true; // Always return true since we handle both caches
  }

  /**
   * Close Redis connection and cleanup
   */
  async close(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('⚠️  Error closing Redis connection:', errorMessage);
      }
      this.redis = null;
      this.isConnected = false;
    }

    // Clear memory cache and stop cleanup interval
    this.memoryCache.clear();
    if (this.memoryCacheCleanupInterval) {
      clearInterval(this.memoryCacheCleanupInterval);
      this.memoryCacheCleanupInterval = null;
    }
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${config.redis.keyPrefix}:${prefix}:${parts.join(':')}`;
  }

  /**
   * Cache wrapper function for methods
   */
  async cached<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch and store
    const result = await fetchFunction();
    await this.set(key, result, ttlSeconds);
    return result;
  }

  /**
   * Batch get multiple keys
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (this.redis && this.isConnected) {
      try {
        const values = await this.redis.mget(...keys);
        return values.map(value => value ? JSON.parse(value) : null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('⚠️  Redis mget error, falling back to individual gets:', errorMessage);
      }
    }

    // Fallback to individual gets
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  /**
   * Batch set multiple key-value pairs
   */
  async mset(keyValuePairs: Array<{ key: string; value: any; ttl?: number }>): Promise<boolean> {
    if (this.redis && this.isConnected) {
      try {
        const pipeline = this.redis.pipeline();
        
        keyValuePairs.forEach(({ key, value, ttl = 300 }) => {
          const serialized = JSON.stringify(value);
          pipeline.setex(key, ttl, serialized);
        });
        
        await pipeline.exec();
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('⚠️  Redis mset error, falling back to individual sets:', errorMessage);
      }
    }

    // Fallback to individual sets
    const results = await Promise.all(
      keyValuePairs.map(({ key, value, ttl = 300 }) => this.set(key, value, ttl))
    );
    
    return results.every(result => result);
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string, amount: number = 1): Promise<number> {
    if (this.redis && this.isConnected) {
      try {
        return await this.redis.incrby(key, amount);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️  Redis incr error for key ${key}:`, errorMessage);
      }
    }

    // Fallback to memory cache
    const current = this.memoryCache.get(key);
    const currentValue = current ? (typeof current.value === 'number' ? current.value : 0) : 0;
    const newValue = currentValue + amount;
    
    this.memoryCache.set(key, {
      value: newValue,
      expires: Date.now() + (300 * 1000), // 5 minutes default
    });
    
    return newValue;
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (this.redis && this.isConnected) {
      try {
        const result = await this.redis.expire(key, ttlSeconds);
        return result === 1;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️  Redis expire error for key ${key}:`, errorMessage);
      }
    }

    // Update memory cache expiration
    const item = this.memoryCache.get(key);
    if (item) {
      item.expires = Date.now() + (ttlSeconds * 1000);
      return true;
    }
    
    return false;
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    if (this.redis && this.isConnected) {
      try {
        return await this.redis.ttl(key);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️  Redis ttl error for key ${key}:`, errorMessage);
      }
    }

    // Check memory cache TTL
    const item = this.memoryCache.get(key);
    if (item) {
      const remainingMs = item.expires - Date.now();
      return Math.max(0, Math.floor(remainingMs / 1000));
    }
    
    return -2; // Key doesn't exist
  }

  /**
   * Cache with automatic refresh
   */
  async cacheWithRefresh<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlSeconds: number = 300,
    refreshThreshold: number = 0.8
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      // Check if we should refresh in background
      const remainingTtl = await this.ttl(key);
      const shouldRefresh = remainingTtl > 0 && remainingTtl < (ttlSeconds * refreshThreshold);
      
      if (shouldRefresh) {
        // Refresh in background without blocking
        fetchFunction()
          .then(result => this.set(key, result, ttlSeconds))
          .catch(error => console.warn('Background cache refresh failed:', error));
      }
      
      return cached;
    }

    // Not in cache, fetch and store
    const result = await fetchFunction();
    await this.set(key, result, ttlSeconds);
    return result;
  }

  /**
   * Get cache hit/miss statistics
   */
  getCacheStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    memoryKeys: number;
  } {
    // This would need to be implemented with actual hit/miss tracking
    // For now, return basic info
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      memoryKeys: this.memoryCache.size,
    };
  }
}

// Export singleton instance
export default new CacheService();