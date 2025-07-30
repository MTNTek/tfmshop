import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { config } from '../config/env';
import CacheService from '../services/CacheService';
import { logger, performanceLogger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

/**
 * System health check interface
 */
interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  details?: Record<string, any>;
  error?: string;
}

/**
 * System metrics interface
 */
interface SystemMetrics {
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  database: {
    connected: boolean;
    connectionCount?: number;
    queryCount?: number;
    slowQueries?: number;
  };
  cache: {
    connected: boolean;
    keyCount?: number;
    memoryUsage?: string;
    hitRate?: number;
  };
  requests: {
    total: number;
    errors: number;
    averageResponseTime: number;
  };
}

/**
 * Monitor class for system health and performance
 */
class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private requestStats = {
    total: 0,
    errors: 0,
    totalResponseTime: 0,
  };

  /**
   * Check database health
   */
  async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Simple query to test connection
      await AppDataSource.query('SELECT 1');
      
      const responseTime = Date.now() - start;
      
      return {
        service: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        details: {
          type: 'postgresql',
          host: config.database.host,
          port: config.database.port,
          database: config.database.database,
        },
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check cache health
   */
  async checkCache(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      const stats = await CacheService.getStats();
      const responseTime = Date.now() - start;
      
      return {
        service: 'cache',
        status: stats.connected ? 'healthy' : 'unhealthy',
        responseTime,
        details: stats,
      };
    } catch (error) {
      return {
        service: 'cache',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check disk space
   */
  async checkDiskSpace(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      const stats = await fs.stat(process.cwd());
      const responseTime = Date.now() - start;
      
      return {
        service: 'disk',
        status: 'healthy', // Simplified check
        responseTime,
        details: {
          path: process.cwd(),
          // Note: Getting actual disk space requires platform-specific code
        },
      };
    } catch (error) {
      return {
        service: 'disk',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check memory usage
   */
  checkMemory(): HealthCheck {
    const start = Date.now();
    const memoryUsage = process.memoryUsage();
    const responseTime = Date.now() - start;
    
    // Convert to MB
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (heapUsagePercent > 90) {
      status = 'unhealthy';
    } else if (heapUsagePercent > 75) {
      status = 'degraded';
    }
    
    return {
      service: 'memory',
      status,
      responseTime,
      details: {
        heapUsed: Math.round(heapUsedMB),
        heapTotal: Math.round(heapTotalMB),
        heapUsagePercent: Math.round(heapUsagePercent),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
    };
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    timestamp: string;
  }> {
    logger.info('Starting system health check');
    
    const checks: HealthCheck[] = [];
    
    // Run all health checks
    checks.push(await this.checkDatabase());
    checks.push(await this.checkCache());
    checks.push(await this.checkDiskSpace());
    checks.push(this.checkMemory());
    
    // Determine overall status
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;
    
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    }
    
    const result = {
      overall,
      checks,
      timestamp: new Date().toISOString(),
    };
    
    logger.info('Health check completed', { overall, checksCount: checks.length });
    
    // Log any issues
    checks.forEach(check => {
      if (check.status !== 'healthy') {
        logger.warn(`Health check issue: ${check.service}`, {
          status: check.status,
          error: check.error,
          responseTime: check.responseTime,
        });
      }
    });
    
    return result;
  }

  /**
   * Collect system metrics
   */
  async collectMetrics(): Promise<SystemMetrics> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Database metrics
    const dbCheck = await this.checkDatabase();
    const cacheStats = await CacheService.getStats();
    
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024),
      },
      cpu: {
        user: cpuUsage.user / 1000000, // Convert to seconds
        system: cpuUsage.system / 1000000,
      },
      database: {
        connected: dbCheck.status === 'healthy',
      },
      cache: {
        connected: cacheStats.connected,
        keyCount: cacheStats.keyCount,
        memoryUsage: cacheStats.memoryUsage,
      },
      requests: {
        total: this.requestStats.total,
        errors: this.requestStats.errors,
        averageResponseTime: this.requestStats.total > 0 
          ? this.requestStats.totalResponseTime / this.requestStats.total 
          : 0,
      },
    };
    
    // Store metrics (keep last 100 entries)
    this.metrics.push(metrics);
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
    
    performanceLogger.info('System metrics collected', metrics);
    
    return metrics;
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    logger.info('Starting system monitoring', { intervalMs });
    
    setInterval(async () => {
      try {
        await this.collectMetrics();
        
        // Perform health check every 5 minutes
        if (Date.now() % (5 * 60 * 1000) < intervalMs) {
          await this.performHealthCheck();
        }
      } catch (error) {
        logger.error('Error during monitoring', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, intervalMs);
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 10): SystemMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Update request statistics
   */
  updateRequestStats(responseTime: number, isError: boolean = false): void {
    this.requestStats.total++;
    this.requestStats.totalResponseTime += responseTime;
    
    if (isError) {
      this.requestStats.errors++;
    }
  }

  /**
   * Generate monitoring report
   */
  async generateReport(): Promise<{
    summary: {
      uptime: number;
      totalRequests: number;
      errorRate: number;
      averageResponseTime: number;
    };
    healthCheck: {
      overall: 'healthy' | 'degraded' | 'unhealthy';
      checks: HealthCheck[];
      timestamp: string;
    };
    recentMetrics: SystemMetrics[];
  }> {
    const healthCheck = await this.performHealthCheck();
    const recentMetrics = this.getRecentMetrics(10);
    
    return {
      summary: {
        uptime: process.uptime(),
        totalRequests: this.requestStats.total,
        errorRate: this.requestStats.total > 0 
          ? (this.requestStats.errors / this.requestStats.total) * 100 
          : 0,
        averageResponseTime: this.requestStats.total > 0 
          ? this.requestStats.totalResponseTime / this.requestStats.total 
          : 0,
      },
      healthCheck,
      recentMetrics,
    };
  }
}

// Create singleton instance
const systemMonitor = new SystemMonitor();

/**
 * Main function to handle command line arguments
 */
async function main(): Promise<void> {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'check':
        const healthCheck = await systemMonitor.performHealthCheck();
        console.log(JSON.stringify(healthCheck, null, 2));
        break;
        
      case 'metrics':
        const metrics = await systemMonitor.collectMetrics();
        console.log(JSON.stringify(metrics, null, 2));
        break;
        
      case 'report':
        const report = await systemMonitor.generateReport();
        console.log(JSON.stringify(report, null, 2));
        break;
        
      case 'start':
        console.log('Starting continuous monitoring...');
        systemMonitor.startMonitoring();
        
        // Keep process alive
        process.on('SIGINT', () => {
          console.log('\nStopping monitoring...');
          process.exit(0);
        });
        break;
        
      default:
        console.log('Usage: npm run monitor [check|metrics|report|start]');
        console.log('  check   - Perform one-time health check');
        console.log('  metrics - Collect current system metrics');
        console.log('  report  - Generate comprehensive monitoring report');
        console.log('  start   - Start continuous monitoring');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Monitoring script failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Export for use in other modules
export { SystemMonitor, systemMonitor };

// Run if called directly
if (require.main === module) {
  main();
}