import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { performanceMonitor, HealthChecker } from '../utils/monitoring';
import { QueryPerformanceAnalyzer, ConnectionPoolMonitor } from '../utils/queryOptimizer';
import CacheService from '../services/CacheService';
import fs from 'fs/promises';
import path from 'path';

/**
 * Monitoring dashboard for real-time system metrics
 */
class MonitoringDashboard {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the monitoring dashboard
   */
  async start(intervalSeconds: number = 30): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Monitoring dashboard is already running');
      return;
    }

    console.log('🚀 Starting monitoring dashboard...\n');
    this.isRunning = true;

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Start performance monitoring
    performanceMonitor.startMonitoring();
    ConnectionPoolMonitor.monitorPoolHealth();

    // Display initial dashboard
    await this.displayDashboard();

    // Set up periodic updates
    this.intervalId = setInterval(async () => {
      await this.displayDashboard();
    }, intervalSeconds * 1000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down monitoring dashboard...');
      this.stop();
      process.exit(0);
    });

    console.log(`📊 Monitoring dashboard started (updating every ${intervalSeconds}s)`);
    console.log('Press Ctrl+C to stop\n');
  }

  /**
   * Stop the monitoring dashboard
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('✅ Monitoring dashboard stopped');
  }

  /**
   * Display the monitoring dashboard
   */
  private async displayDashboard(): Promise<void> {
    // Clear console for fresh display
    console.clear();
    
    const timestamp = new Date().toISOString();
    console.log('═'.repeat(80));
    console.log(`🖥️  TFMShop Backend Monitoring Dashboard - ${timestamp}`);
    console.log('═'.repeat(80));

    try {
      // System Overview
      await this.displaySystemOverview();
      console.log('');

      // Health Status
      await this.displayHealthStatus();
      console.log('');

      // Performance Metrics
      await this.displayPerformanceMetrics();
      console.log('');

      // Database Metrics
      await this.displayDatabaseMetrics();
      console.log('');

      // Cache Metrics
      await this.displayCacheMetrics();
      console.log('');

      // Recent Alerts
      await this.displayRecentAlerts();

    } catch (error) {
      console.error('❌ Error displaying dashboard:', error);
    }

    console.log('═'.repeat(80));
    console.log('Press Ctrl+C to stop monitoring');
  }

  /**
   * Display system overview
   */
  private async displaySystemOverview(): Promise<void> {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    console.log('📊 SYSTEM OVERVIEW');
    console.log('─'.repeat(40));
    console.log(`Environment: ${config.nodeEnv.toUpperCase()}`);
    console.log(`Uptime: ${this.formatUptime(uptime)}`);
    console.log(`Node.js: ${process.version}`);
    console.log(`Platform: ${process.platform} ${process.arch}`);
    console.log(`PID: ${process.pid}`);
    console.log(`Memory Usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
    console.log(`RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB`);
  }

  /**
   * Display health status
   */
  private async displayHealthStatus(): Promise<void> {
    console.log('🏥 HEALTH STATUS');
    console.log('─'.repeat(40));

    try {
      const healthCheck = await HealthChecker.performHealthCheck();
      
      const statusIcon = {
        healthy: '✅',
        degraded: '⚠️',
        unhealthy: '❌',
      }[healthCheck.status];

      console.log(`Overall Status: ${statusIcon} ${healthCheck.status.toUpperCase()}`);
      
      healthCheck.checks.forEach(check => {
        const icon = {
          healthy: '✅',
          degraded: '⚠️',
          unhealthy: '❌',
        }[check.status];
        
        console.log(`${check.service}: ${icon} ${check.status} ${check.responseTime ? `(${check.responseTime}ms)` : ''}`);
      });
    } catch (error) {
      console.log('❌ Failed to get health status');
    }
  }

  /**
   * Display performance metrics
   */
  private async displayPerformanceMetrics(): Promise<void> {
    console.log('⚡ PERFORMANCE METRICS');
    console.log('─'.repeat(40));

    try {
      const performanceSummary = performanceMonitor.getPerformanceSummary();
      const summary = performanceSummary.summary;

      console.log(`Request Count: ${summary.requestCount}`);
      console.log(`Error Rate: ${summary.errorRate.toFixed(2)}%`);
      console.log(`Avg Response Time: ${Math.round(summary.averageResponseTime)}ms`);
      console.log(`Memory Usage: ${summary.memoryUsage.heapUsed}MB / ${summary.memoryUsage.heapTotal}MB`);
      
      const memoryPercent = (summary.memoryUsage.heapUsed / summary.memoryUsage.heapTotal) * 100;
      const memoryStatus = memoryPercent > 85 ? '❌' : memoryPercent > 70 ? '⚠️' : '✅';
      console.log(`Memory Utilization: ${memoryStatus} ${memoryPercent.toFixed(1)}%`);

    } catch (error) {
      console.log('❌ Failed to get performance metrics');
    }
  }

  /**
   * Display database metrics
   */
  private async displayDatabaseMetrics(): Promise<void> {
    console.log('🗄️  DATABASE METRICS');
    console.log('─'.repeat(40));

    try {
      // Connection pool status
      const poolHealth = ConnectionPoolMonitor.getHealthStatus();
      const poolIcon = {
        healthy: '✅',
        degraded: '⚠️',
        unhealthy: '❌',
      }[poolHealth.status];

      console.log(`Connection Pool: ${poolIcon} ${poolHealth.status}`);
      console.log(`Active Connections: ${poolHealth.details.active}`);
      console.log(`Idle Connections: ${poolHealth.details.idle}`);
      console.log(`Total Connections: ${poolHealth.details.total}`);
      console.log(`Waiting: ${poolHealth.details.waiting}`);

      // Query performance
      const queryStats = QueryPerformanceAnalyzer.getStats();
      console.log(`Total Queries: ${queryStats.totalQueries}`);
      console.log(`Slow Queries: ${queryStats.slowQueries}`);
      console.log(`Slow Query Rate: ${queryStats.slowQueryRate.toFixed(2)}%`);
      console.log(`Avg Query Time: ${Math.round(queryStats.averageDuration)}ms`);

      // Database statistics
      try {
        const dbStats = await AppDataSource.query(`
          SELECT 
            numbackends as active_connections,
            xact_commit as commits,
            xact_rollback as rollbacks,
            blks_read,
            blks_hit,
            tup_returned,
            tup_fetched
          FROM pg_stat_database 
          WHERE datname = current_database()
        `);

        if (dbStats[0]) {
          const stats = dbStats[0];
          const hitRatio = stats.blks_hit && stats.blks_read 
            ? ((stats.blks_hit / (stats.blks_hit + stats.blks_read)) * 100).toFixed(1)
            : '0.0';
          
          console.log(`Cache Hit Ratio: ${hitRatio}%`);
          console.log(`Transactions: ${stats.commits} commits, ${stats.rollbacks} rollbacks`);
        }
      } catch (error) {
        console.log('⚠️  Could not fetch database statistics');
      }

    } catch (error) {
      console.log('❌ Failed to get database metrics');
    }
  }

  /**
   * Display cache metrics
   */
  private async displayCacheMetrics(): Promise<void> {
    console.log('💾 CACHE METRICS');
    console.log('─'.repeat(40));

    try {
      const cacheStats = await CacheService.getStats();
      
      const connectionIcon = cacheStats.connected ? '✅' : '❌';
      console.log(`Connection: ${connectionIcon} ${cacheStats.connected ? 'Connected' : 'Disconnected'}`);
      
      if (cacheStats.connected) {
        console.log(`Key Count: ${cacheStats.keyCount || 0}`);
        console.log(`Memory Usage: ${cacheStats.memoryUsage || 'Unknown'}`);
        
        // Get cache performance stats
        const perfStats = CacheService.getCacheStats();
        console.log(`Hit Rate: ${perfStats.hitRate.toFixed(2)}%`);
        console.log(`Memory Keys: ${perfStats.memoryKeys}`);
      } else {
        console.log('Using memory fallback cache');
      }

    } catch (error) {
      console.log('❌ Failed to get cache metrics');
    }
  }

  /**
   * Display recent alerts
   */
  private async displayRecentAlerts(): Promise<void> {
    console.log('🚨 RECENT ALERTS');
    console.log('─'.repeat(40));

    try {
      const performanceSummary = performanceMonitor.getPerformanceSummary();
      const recentAlerts = performanceSummary.alerts.slice(-5); // Last 5 alerts

      if (recentAlerts.length === 0) {
        console.log('✅ No recent alerts');
      } else {
        recentAlerts.forEach(alert => {
          const levelIcon = {
            info: 'ℹ️',
            warning: '⚠️',
            critical: '🚨',
          }[alert.level] || '⚠️';
          
          const timeAgo = this.getTimeAgo(new Date(alert.timestamp));
          console.log(`${levelIcon} ${alert.message} (${timeAgo})`);
        });
      }

    } catch (error) {
      console.log('❌ Failed to get recent alerts');
    }
  }

  /**
   * Format uptime in human readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Get time ago string
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return `${diffSeconds}s ago`;
    }
  }

  /**
   * Export metrics to file
   */
  async exportMetrics(filePath?: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultPath = path.join(process.cwd(), `metrics-export-${timestamp}.json`);
    const exportPath = filePath || defaultPath;

    try {
      const healthCheck = await HealthChecker.performHealthCheck();
      const performanceSummary = performanceMonitor.getPerformanceSummary();
      const queryStats = QueryPerformanceAnalyzer.getStats();
      const poolHealth = ConnectionPoolMonitor.getHealthStatus();
      const cacheStats = await CacheService.getStats();

      const metrics = {
        timestamp: new Date().toISOString(),
        system: {
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
        },
        health: healthCheck,
        performance: performanceSummary,
        database: {
          queries: queryStats,
          connectionPool: poolHealth,
        },
        cache: cacheStats,
      };

      await fs.writeFile(exportPath, JSON.stringify(metrics, null, 2));
      console.log(`📊 Metrics exported to: ${exportPath}`);

    } catch (error) {
      console.error('❌ Failed to export metrics:', error);
      throw error;
    }
  }

  /**
   * Generate monitoring report
   */
  async generateReport(): Promise<void> {
    console.log('📋 Generating monitoring report...\n');

    try {
      const timestamp = new Date().toISOString();
      const reportPath = path.join(process.cwd(), `monitoring-report-${timestamp.split('T')[0]}.md`);

      const healthCheck = await HealthChecker.performHealthCheck();
      const performanceSummary = performanceMonitor.getPerformanceSummary();
      const queryStats = QueryPerformanceAnalyzer.getStats();
      const poolHealth = ConnectionPoolMonitor.getHealthStatus();
      const cacheStats = await CacheService.getStats();

      const report = `# TFMShop Backend Monitoring Report

Generated: ${timestamp}

## System Overview

- **Environment**: ${config.nodeEnv.toUpperCase()}
- **Uptime**: ${this.formatUptime(process.uptime())}
- **Node.js Version**: ${process.version}
- **Platform**: ${process.platform} ${process.arch}
- **Process ID**: ${process.pid}

## Health Status

- **Overall Status**: ${healthCheck.status.toUpperCase()}

### Service Health
${healthCheck.checks.map(check => 
  `- **${check.service}**: ${check.status} ${check.responseTime ? `(${check.responseTime}ms)` : ''}`
).join('\n')}

## Performance Metrics

- **Total Requests**: ${performanceSummary.summary.requestCount}
- **Error Rate**: ${performanceSummary.summary.errorRate.toFixed(2)}%
- **Average Response Time**: ${Math.round(performanceSummary.summary.averageResponseTime)}ms
- **Memory Usage**: ${performanceSummary.summary.memoryUsage.heapUsed}MB / ${performanceSummary.summary.memoryUsage.heapTotal}MB

## Database Metrics

### Connection Pool
- **Status**: ${poolHealth.status}
- **Active Connections**: ${poolHealth.details.active}
- **Idle Connections**: ${poolHealth.details.idle}
- **Total Connections**: ${poolHealth.details.total}
- **Waiting**: ${poolHealth.details.waiting}

### Query Performance
- **Total Queries**: ${queryStats.totalQueries}
- **Slow Queries**: ${queryStats.slowQueries}
- **Slow Query Rate**: ${queryStats.slowQueryRate.toFixed(2)}%
- **Average Query Time**: ${Math.round(queryStats.averageDuration)}ms

## Cache Metrics

- **Connection Status**: ${cacheStats.connected ? 'Connected' : 'Disconnected'}
- **Key Count**: ${cacheStats.keyCount || 0}
- **Memory Usage**: ${cacheStats.memoryUsage || 'Unknown'}

## Recent Alerts

${performanceSummary.alerts.length === 0 ? 'No recent alerts' : 
  performanceSummary.alerts.slice(-10).map(alert => 
    `- **${alert.level.toUpperCase()}**: ${alert.message} (${this.getTimeAgo(new Date(alert.timestamp))})`
  ).join('\n')
}

## Recommendations

${queryStats.slowQueryRate > 5 ? '- High slow query rate detected. Consider query optimization.' : ''}
${performanceSummary.summary.errorRate > 1 ? '- Error rate is elevated. Check application logs.' : ''}
${!cacheStats.connected ? '- Cache is not connected. Consider setting up Redis.' : ''}
${poolHealth.status !== 'healthy' ? `- Connection pool issues: ${poolHealth.issues.join(', ')}` : ''}

---
*Report generated by TFMShop Backend Monitoring System*
`;

      await fs.writeFile(reportPath, report);
      console.log(`📄 Monitoring report saved to: ${reportPath}`);

    } catch (error) {
      console.error('❌ Failed to generate monitoring report:', error);
      throw error;
    }
  }
}

/**
 * Main function to handle command line arguments
 */
async function main(): Promise<void> {
  const command = process.argv[2];
  const dashboard = new MonitoringDashboard();

  try {
    switch (command) {
      case 'start':
        const interval = parseInt(process.argv[3]) || 30;
        await dashboard.start(interval);
        break;
        
      case 'export':
        const filePath = process.argv[3];
        await dashboard.exportMetrics(filePath);
        break;
        
      case 'report':
        await dashboard.generateReport();
        break;
        
      default:
        console.log('Usage: npm run dashboard [start|export|report]');
        console.log('  start [interval] - Start monitoring dashboard (default: 30s interval)');
        console.log('  export [file]    - Export current metrics to JSON file');
        console.log('  report           - Generate monitoring report');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Monitoring dashboard failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MonitoringDashboard };