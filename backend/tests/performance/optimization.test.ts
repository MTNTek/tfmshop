import { performanceMonitor, HealthChecker } from '../../src/utils/monitoring';
import { 
  suspiciousActivityDetector, 
  bruteForceProtection, 
  requestTimeout 
} from '../../src/middleware/security';
import { cacheMiddleware, CACHE_DURATIONS } from '../../src/middleware/cache';
import { generalRateLimit } from '../../src/middleware/rateLimiter';

describe('Performance Optimization Features', () => {
  describe('Performance Monitoring', () => {
    it('should have performance monitor instance', () => {
      expect(performanceMonitor).toBeDefined();
      expect(typeof performanceMonitor.trackRequest).toBe('function');
      expect(typeof performanceMonitor.collectMetrics).toBe('function');
      expect(typeof performanceMonitor.getPerformanceSummary).toBe('function');
    });

    it('should have health checker', () => {
      expect(HealthChecker).toBeDefined();
      expect(typeof HealthChecker.performHealthCheck).toBe('function');
      expect(typeof HealthChecker.checkDatabase).toBe('function');
      expect(typeof HealthChecker.checkCache).toBe('function');
      expect(typeof HealthChecker.checkMemory).toBe('function');
    });

    it('should collect basic metrics', async () => {
      const metrics = await performanceMonitor.collectMetrics();
      
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('requestCount');
      expect(metrics).toHaveProperty('errorCount');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('cpuUsage');
      expect(metrics).toHaveProperty('databaseMetrics');
      expect(metrics).toHaveProperty('cacheMetrics');
    });

    it('should check memory health', () => {
      const memoryCheck = HealthChecker.checkMemory();
      
      expect(memoryCheck).toHaveProperty('healthy');
      expect(memoryCheck).toHaveProperty('heapUsagePercent');
      expect(memoryCheck).toHaveProperty('memoryUsage');
      expect(typeof memoryCheck.healthy).toBe('boolean');
      expect(typeof memoryCheck.heapUsagePercent).toBe('number');
    });
  });

  describe('Security Middleware', () => {
    it('should have suspicious activity detector', () => {
      expect(suspiciousActivityDetector).toBeDefined();
      expect(typeof suspiciousActivityDetector).toBe('function');
    });

    it('should have brute force protection', () => {
      expect(bruteForceProtection).toBeDefined();
      expect(typeof bruteForceProtection).toBe('function');
    });

    it('should have request timeout middleware', () => {
      expect(requestTimeout).toBeDefined();
      expect(typeof requestTimeout).toBe('function');
    });
  });

  describe('Caching Middleware', () => {
    it('should have cache middleware', () => {
      expect(cacheMiddleware).toBeDefined();
      expect(typeof cacheMiddleware).toBe('function');
    });

    it('should have cache durations defined', () => {
      expect(CACHE_DURATIONS).toBeDefined();
      expect(CACHE_DURATIONS.PRODUCTS_LIST).toBe(300);
      expect(CACHE_DURATIONS.PRODUCT_DETAIL).toBe(600);
      expect(CACHE_DURATIONS.CATEGORIES).toBe(1800);
      expect(CACHE_DURATIONS.USER_PROFILE).toBe(300);
      expect(CACHE_DURATIONS.SEARCH_RESULTS).toBe(180);
      expect(CACHE_DURATIONS.ANALYTICS).toBe(900);
    });
  });

  describe('Rate Limiting', () => {
    it('should have rate limiting middleware', () => {
      expect(generalRateLimit).toBeDefined();
      expect(typeof generalRateLimit).toBe('function');
    });
  });

  describe('Performance Summary', () => {
    it('should generate performance summary', () => {
      const summary = performanceMonitor.getPerformanceSummary();
      
      expect(summary).toHaveProperty('status');
      expect(summary).toHaveProperty('summary');
      expect(summary).toHaveProperty('alerts');
      expect(summary).toHaveProperty('metrics');
      
      expect(['healthy', 'warning', 'critical', 'no_data']).toContain(summary.status);
    });

    it('should track recent metrics', () => {
      const recentMetrics = performanceMonitor.getRecentMetrics(5);
      expect(Array.isArray(recentMetrics)).toBe(true);
    });

    it('should track recent alerts', () => {
      const recentAlerts = performanceMonitor.getRecentAlerts(5);
      expect(Array.isArray(recentAlerts)).toBe(true);
    });
  });
});