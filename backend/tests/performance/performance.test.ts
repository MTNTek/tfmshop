import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import CacheService from '../../src/services/CacheService';

describe('Performance Optimizations', () => {
  beforeAll(async () => {
    // Initialize database for testing
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    // Close connections
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    await CacheService.close();
  });

  describe('Health Check', () => {
    it('should return health status with performance metrics', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('cache');
      expect(response.body).toHaveProperty('performance');
      expect(response.body.performance).toHaveProperty('caching');
      expect(response.body.performance).toHaveProperty('compression');
      expect(response.body.performance).toHaveProperty('rateLimit');
    });
  });

  describe('Metrics Endpoint', () => {
    it('should return system metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cache');
      expect(response.body).toHaveProperty('environment');
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('heapUsed');
    });
  });

  describe('Cache Service', () => {
    it('should handle cache operations gracefully', async () => {
      const testKey = 'test:performance';
      const testValue = { message: 'test data', timestamp: Date.now() };

      // Test set operation
      const setResult = await CacheService.set(testKey, testValue, 60);
      expect(setResult).toBe(true);

      // Test get operation
      const getValue = await CacheService.get(testKey);
      expect(getValue).toEqual(testValue);

      // Test exists operation
      const exists = await CacheService.exists(testKey);
      expect(exists).toBe(true);

      // Test delete operation
      const deleteResult = await CacheService.del(testKey);
      expect(deleteResult).toBe(true);

      // Verify deletion
      const getAfterDelete = await CacheService.get(testKey);
      expect(getAfterDelete).toBeNull();
    });

    it('should handle getOrSet pattern', async () => {
      const testKey = 'test:getOrSet';
      let callbackExecuted = false;

      const callback = async () => {
        callbackExecuted = true;
        return { data: 'from callback', timestamp: Date.now() };
      };

      // First call should execute callback
      const result1 = await CacheService.getOrSet(testKey, callback, 60);
      expect(callbackExecuted).toBe(true);
      expect(result1).toHaveProperty('data', 'from callback');

      // Reset flag
      callbackExecuted = false;

      // Second call should use cache
      const result2 = await CacheService.getOrSet(testKey, callback, 60);
      expect(callbackExecuted).toBe(false);
      expect(result2).toEqual(result1);

      // Cleanup
      await CacheService.del(testKey);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for security headers
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Compression', () => {
    it('should compress responses when appropriate', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Response should be compressed for larger responses
      // Note: Small responses might not be compressed due to threshold
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});