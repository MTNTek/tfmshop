import { Request, Response, NextFunction } from 'express';
import { logger, performanceLogger, securityLogger } from './logger';
import { config } from '../config/env';
import { productionConfig } from '../config/production';
import CacheService from '../services/CacheService';
import { AppDataSource } from '../config/database';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  timestamp: string;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  databaseMetrics: {
    activeConnections: number;
    queryCount: number;
    slowQueryCount: number;
  };
  cacheMetrics: {
    hitRate: number;
    keyCount: number;
    memoryUsage: string;
  };
}

/**
 * Alert levels
 */
enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Alert interface
 */
interface Alert {
  level: AlertLevel;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
}

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private requestStats = {
    count: 0,
    errorCount: 0,
    totalResponseTime: 0,
    slowRequestCount: 0,
  };
  private queryStats = {
    count: 0,
    slowCount: 0,
  };
  private alerts: Alert[] = [];
  private lastAlertTime = new Map<string, number>();

  /**
   * Middleware to track request performance
   */
  trackRequest = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const requestId = (req as any).requestId || 'unknown';

    // Increment request count
    this.requestStats.count++;

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = (chunk?: any, encoding?: any) => {
      const duration = Date.now() - start;
      this.requestStats.totalResponseTime += duration;

      // Track errors
      if (res.statusCode >= 400) {
        this.requestStats.errorCount++;
      }

      // Track slow requests
      if (duration > productionConfig.logging.thresholds.slowRequest) {
        this.requestStats.slowRequestCount++;
        performanceLogger.warn('Slow request detected', {
          requestId,
          method: req.method,
          url: req.url,
          duration,
          statusCode: res.statusCode,
        });
      }

      // Check for performance alerts
      this.checkPerformanceAlerts(duration, res.statusCode);

      return originalEnd.call(res, chunk, encoding);
    };

    next();
  };

  /**
   * Track database query performance
   */
  trackQuery = (query: string, duration: number, parameters?: any[]) => {
    this.queryStats.count++;

    if (duration > productionConfig.logging.thresholds.slowQuery) {
      this.queryStats.slowCount++;
      performanceLogger.warn('Slow database query', {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        duration,
        parameters: parameters?.slice(0, 5), // Limit for security
      });
    }
  };

  /**
   * Collect current performance metrics
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const cacheStats = await CacheService.getStats();

    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      requestCount: this.requestStats.count,
      errorCount: this.requestStats.errorCount,
      averageResponseTime: this.requestStats.count > 0 
        ? this.requestStats.totalResponseTime / this.requestStats.count 
        : 0,
      memoryUsage: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      cpuUsage: {
        user: cpuUsage.user / 1000000, // Convert to seconds
        system: cpuUsage.system / 1000000,
      },
      databaseMetrics: {
        activeConnections: this.getDatabaseConnectionCount(),
        queryCount: this.queryStats.count,
        slowQueryCount: this.queryStats.slowCount,
      },
      cacheMetrics: {
        hitRate: 0, // Would need to implement cache hit tracking
        keyCount: cacheStats.keyCount || 0,
        memoryUsage: cacheStats.memoryUsage || '0B',
      },
    };

    // Store metrics (keep last 100 entries)
    this.metrics.push(metrics);
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    return metrics;
  };

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(responseTime: number, statusCode: number) {
    const now = Date.now();
    const alerts = productionConfig.monitoring.alerts;

    // Check response time alert
    if (responseTime > alerts.responseTime) {
      this.createAlert(
        AlertLevel.WARNING,
        'High response time detected',
        'response_time',
        responseTime,
        alerts.responseTime
      );
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (heapUsagePercent > alerts.memoryUsage) {
      this.createAlert(
        heapUsagePercent > 95 ? AlertLevel.CRITICAL : AlertLevel.WARNING,
        'High memory usage detected',
        'memory_usage',
        heapUsagePercent,
        alerts.memoryUsage
      );
    }

    // Check error rate
    const errorRate = this.requestStats.count > 0 
      ? (this.requestStats.errorCount / this.requestStats.count) * 100 
      : 0;
    
    if (errorRate > alerts.errorRate && this.requestStats.count > 10) {
      this.createAlert(
        AlertLevel.WARNING,
        'High error rate detected',
        'error_rate',
        errorRate,
        alerts.errorRate
      );
    }
  }

  /**
   * Create an alert
   */
  private createAlert(
    level: AlertLevel,
    message: string,
    metric: string,
    value: number,
    threshold: number
  ) {
    const now = Date.now();
    const alertKey = `${metric}_${level}`;
    const lastAlert = this.lastAlertTime.get(alertKey) || 0;

    // Rate limit alerts (don't send same alert more than once per 5 minutes)
    if (now - lastAlert < 5 * 60 * 1000) {
      return;
    }

    const alert: Alert = {
      level,
      message,
      metric,
      value,
      threshold,
      timestamp: new Date().toISOString(),
    };

    this.alerts.push(alert);
    this.lastAlertTime.set(alertKey, now);

    // Log alert
    const logLevel = level === AlertLevel.CRITICAL ? 'error' : 'warn';
    logger[logLevel](`Performance alert: ${message}`, {
      metric,
      value,
      threshold,
      level,
    });

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }
  }

  /**
   * Get database connection count (simplified)
   */
  private getDatabaseConnectionCount(): number {
    try {
      // This is a simplified implementation
      // In a real scenario, you'd query the database for active connections
      return AppDataSource.isInitialized ? 1 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(count: number = 10): Alert[] {
    return this.alerts.slice(-count);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const recentMetrics = this.getRecentMetrics(10);
    const recentAlerts = this.getRecentAlerts(5);

    if (recentMetrics.length === 0) {
      return {
        status: 'no_data',
        summary: 'No performance data available',
        alerts: recentAlerts,
      };
    }

    const latest = recentMetrics[recentMetrics.length - 1];
    const criticalAlerts = recentAlerts.filter(a => a.level === AlertLevel.CRITICAL);
    const warningAlerts = recentAlerts.filter(a => a.level === AlertLevel.WARNING);

    let status = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (warningAlerts.length > 0) {
      status = 'warning';
    }

    return {
      status,
      summary: {
        uptime: process.uptime(),
        requestCount: latest.requestCount,
        errorRate: latest.requestCount > 0 
          ? (latest.errorCount / latest.requestCount) * 100 
          : 0,
        averageResponseTime: latest.averageResponseTime,
        memoryUsage: latest.memoryUsage,
        databaseMetrics: latest.databaseMetrics,
        cacheMetrics: latest.cacheMetrics,
      },
      alerts: recentAlerts,
      metrics: recentMetrics,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.requestStats = {
      count: 0,
      errorCount: 0,
      totalResponseTime: 0,
      slowRequestCount: 0,
    };
    this.queryStats = {
      count: 0,
      slowCount: 0,
    };
    this.metrics = [];
    this.alerts = [];
    this.lastAlertTime.clear();
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 60000) {
    logger.info('Starting performance monitoring', { intervalMs });

    setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        logger.error('Error collecting performance metrics', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, intervalMs);
  }
}

/**
 * Health check utilities
 */
export class HealthChecker {
  /**
   * Comprehensive health check
   */
  static async performHealthCheck() {
    const checks = {
      database: await HealthChecker.checkDatabase(),
      cache: await HealthChecker.checkCache(),
      memory: HealthChecker.checkMemory(),
      disk: await HealthChecker.checkDiskSpace(),
    };

    const failedChecks = Object.entries(checks).filter(([_, check]) => !check.healthy);
    const overall = failedChecks.length === 0 ? 'healthy' : 
                   failedChecks.length <= 1 ? 'degraded' : 'unhealthy';

    return {
      status: overall,
      timestamp: new Date().toISOString(),
      checks,
      uptime: process.uptime(),
    };
  }

  /**
   * Check database health
   */
  static async checkDatabase() {
    try {
      const start = Date.now();
      await AppDataSource.query('SELECT 1');
      const responseTime = Date.now() - start;

      return {
        healthy: responseTime < 1000,
        responseTime,
        connected: AppDataSource.isInitialized,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connected: false,
      };
    }
  }

  /**
   * Check cache health
   */
  static async checkCache() {
    try {
      const start = Date.now();
      const stats = await CacheService.getStats();
      const responseTime = Date.now() - start;

      return {
        healthy: stats.connected && responseTime < 500,
        responseTime,
        connected: stats.connected,
        stats,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connected: false,
      };
    }
  }

  /**
   * Check memory usage
   */
  static checkMemory() {
    const memoryUsage = process.memoryUsage();
    const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    return {
      healthy: heapUsagePercent < 85,
      heapUsagePercent: Math.round(heapUsagePercent),
      memoryUsage: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      },
    };
  }

  /**
   * Check disk space (simplified)
   */
  static async checkDiskSpace() {
    try {
      // This is a simplified check
      // In production, you'd want to check actual disk space
      return {
        healthy: true,
        message: 'Disk space check not implemented',
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in other modules
export { PerformanceMonitor, AlertLevel };
export type { PerformanceMetrics, Alert };