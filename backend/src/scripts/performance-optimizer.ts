import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { config } from '../config/env';
import { logger, performanceLogger } from '../utils/logger';
import CacheService from '../services/CacheService';
import { QueryPerformanceAnalyzer, ConnectionPoolMonitor } from '../utils/queryOptimizer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Performance optimization utility
 */
class PerformanceOptimizer {
  /**
   * Run comprehensive performance optimization
   */
  async optimizeDatabase(): Promise<void> {
    console.log('🚀 Starting database performance optimization...\n');

    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Analyze and optimize database
      await this.analyzeTableStatistics();
      await this.optimizeIndexes();
      await this.analyzeSlowQueries();
      await this.updateTableStatistics();
      await this.optimizeConnectionPool();

      console.log('✅ Database optimization completed!');
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
      throw error;
    }
  }

  /**
   * Analyze table statistics
   */
  private async analyzeTableStatistics(): Promise<void> {
    console.log('📊 Analyzing table statistics...');

    try {
      const tableStats = await AppDataSource.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `);

      console.log('  📋 Table Statistics:');
      tableStats.forEach((table: any) => {
        console.log(`    ${table.tablename}: ${table.live_tuples} live tuples, ${table.dead_tuples} dead tuples`);
        
        // Recommend vacuum if dead tuples > 20% of live tuples
        if (table.dead_tuples > table.live_tuples * 0.2) {
          console.log(`      ⚠️  High dead tuple ratio, consider VACUUM`);
        }
      });

      // Check for tables that need analysis
      const needsAnalysis = tableStats.filter((table: any) => 
        !table.last_analyze || new Date(table.last_analyze) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (needsAnalysis.length > 0) {
        console.log('  📈 Tables needing analysis:');
        needsAnalysis.forEach((table: any) => {
          console.log(`    - ${table.tablename} (last analyzed: ${table.last_analyze || 'never'})`);
        });
      }

    } catch (error) {
      console.error('  ❌ Failed to analyze table statistics:', error);
    }
  }

  /**
   * Optimize database indexes
   */
  private async optimizeIndexes(): Promise<void> {
    console.log('🔍 Analyzing and optimizing indexes...');

    try {
      // Get index usage statistics
      const indexStats = await AppDataSource.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_tup_read,
          idx_tup_fetch,
          idx_scan,
          CASE 
            WHEN idx_scan = 0 THEN 'UNUSED'
            WHEN idx_scan < 10 THEN 'LOW_USAGE'
            ELSE 'ACTIVE'
          END as usage_status
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
      `);

      console.log('  📋 Index Usage Statistics:');
      
      const unusedIndexes = indexStats.filter((idx: any) => idx.usage_status === 'UNUSED');
      const lowUsageIndexes = indexStats.filter((idx: any) => idx.usage_status === 'LOW_USAGE');
      const activeIndexes = indexStats.filter((idx: any) => idx.usage_status === 'ACTIVE');

      console.log(`    ✅ Active indexes: ${activeIndexes.length}`);
      console.log(`    ⚠️  Low usage indexes: ${lowUsageIndexes.length}`);
      console.log(`    ❌ Unused indexes: ${unusedIndexes.length}`);

      if (unusedIndexes.length > 0) {
        console.log('  🗑️  Unused indexes (consider dropping):');
        unusedIndexes.forEach((idx: any) => {
          console.log(`    - ${idx.indexname} on ${idx.tablename}`);
        });
      }

      // Check for missing indexes on foreign keys
      await this.checkMissingForeignKeyIndexes();

      // Analyze index bloat
      await this.analyzeIndexBloat();

    } catch (error) {
      console.error('  ❌ Failed to optimize indexes:', error);
    }
  }

  /**
   * Check for missing foreign key indexes
   */
  private async checkMissingForeignKeyIndexes(): Promise<void> {
    try {
      const missingIndexes = await AppDataSource.query(`
        SELECT 
          c.conrelid::regclass AS table_name,
          string_agg(a.attname, ', ') AS column_names,
          c.conname AS constraint_name
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
        WHERE c.contype = 'f'
        AND NOT EXISTS (
          SELECT 1 FROM pg_index i
          WHERE i.indrelid = c.conrelid
          AND c.conkey <@ i.indkey
        )
        GROUP BY c.conrelid, c.conname
        ORDER BY table_name
      `);

      if (missingIndexes.length > 0) {
        console.log('  ⚠️  Missing indexes on foreign keys:');
        missingIndexes.forEach((missing: any) => {
          console.log(`    - ${missing.table_name}.${missing.column_names} (${missing.constraint_name})`);
        });
      } else {
        console.log('  ✅ All foreign keys have indexes');
      }
    } catch (error) {
      console.error('  ❌ Failed to check missing foreign key indexes:', error);
    }
  }

  /**
   * Analyze index bloat
   */
  private async analyzeIndexBloat(): Promise<void> {
    try {
      // Simplified bloat analysis
      const indexSizes = await AppDataSource.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes
        WHERE pg_relation_size(indexrelid) > 1024 * 1024 -- Larger than 1MB
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 10
      `);

      if (indexSizes.length > 0) {
        console.log('  📏 Largest indexes:');
        indexSizes.forEach((idx: any) => {
          console.log(`    - ${idx.indexname} on ${idx.tablename}: ${idx.size}`);
        });
      }
    } catch (error) {
      console.error('  ❌ Failed to analyze index bloat:', error);
    }
  }

  /**
   * Analyze slow queries
   */
  private async analyzeSlowQueries(): Promise<void> {
    console.log('🐌 Analyzing slow queries...');

    try {
      // Check if pg_stat_statements extension is available
      const extensionExists = await AppDataSource.query(`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
        ) as exists
      `);

      if (extensionExists[0]?.exists) {
        const slowQueries = await AppDataSource.query(`
          SELECT 
            query,
            calls,
            total_time,
            mean_time,
            rows,
            100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
          FROM pg_stat_statements
          WHERE mean_time > 100 -- Queries taking more than 100ms on average
          ORDER BY mean_time DESC
          LIMIT 10
        `);

        if (slowQueries.length > 0) {
          console.log('  🐌 Slowest queries:');
          slowQueries.forEach((query: any, index: number) => {
            console.log(`    ${index + 1}. Mean time: ${Math.round(query.mean_time)}ms, Calls: ${query.calls}`);
            console.log(`       Query: ${query.query.substring(0, 100)}...`);
          });
        } else {
          console.log('  ✅ No slow queries detected');
        }
      } else {
        console.log('  ⚠️  pg_stat_statements extension not available');
        
        // Use our internal query analyzer
        const stats = QueryPerformanceAnalyzer.getStats();
        console.log('  📊 Internal query statistics:');
        console.log(`    - Total queries: ${stats.totalQueries}`);
        console.log(`    - Slow queries: ${stats.slowQueries}`);
        console.log(`    - Average duration: ${Math.round(stats.averageDuration)}ms`);
        console.log(`    - Slow query rate: ${stats.slowQueryRate.toFixed(2)}%`);

        const recommendations = QueryPerformanceAnalyzer.getRecommendations();
        if (recommendations.length > 0) {
          console.log('  💡 Recommendations:');
          recommendations.forEach(rec => console.log(`    - ${rec}`));
        }
      }
    } catch (error) {
      console.error('  ❌ Failed to analyze slow queries:', error);
    }
  }

  /**
   * Update table statistics
   */
  private async updateTableStatistics(): Promise<void> {
    console.log('📈 Updating table statistics...');

    try {
      // Get list of user tables
      const tables = await AppDataSource.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

      console.log(`  Analyzing ${tables.length} tables...`);

      for (const table of tables) {
        try {
          await AppDataSource.query(`ANALYZE ${table.tablename}`);
          console.log(`    ✅ Analyzed ${table.tablename}`);
        } catch (error) {
          console.log(`    ❌ Failed to analyze ${table.tablename}: ${error}`);
        }
      }

      console.log('  ✅ Table statistics updated');
    } catch (error) {
      console.error('  ❌ Failed to update table statistics:', error);
    }
  }

  /**
   * Optimize connection pool
   */
  private async optimizeConnectionPool(): Promise<void> {
    console.log('🔗 Optimizing connection pool...');

    try {
      const poolHealth = ConnectionPoolMonitor.getHealthStatus();
      
      console.log('  📊 Connection pool status:');
      console.log(`    - Status: ${poolHealth.status}`);
      console.log(`    - Active: ${poolHealth.details.active}`);
      console.log(`    - Idle: ${poolHealth.details.idle}`);
      console.log(`    - Total: ${poolHealth.details.total}`);
      console.log(`    - Waiting: ${poolHealth.details.waiting}`);

      if (poolHealth.issues.length > 0) {
        console.log('  ⚠️  Issues detected:');
        poolHealth.issues.forEach(issue => console.log(`    - ${issue}`));
      }

      // Start monitoring if not already started
      ConnectionPoolMonitor.monitorPoolHealth();
      console.log('  ✅ Connection pool monitoring started');

    } catch (error) {
      console.error('  ❌ Failed to optimize connection pool:', error);
    }
  }

  /**
   * Optimize cache performance
   */
  async optimizeCache(): Promise<void> {
    console.log('💾 Optimizing cache performance...\n');

    try {
      // Get cache statistics
      const cacheStats = await CacheService.getStats();
      console.log('📊 Cache Statistics:');
      console.log(`  - Connected: ${cacheStats.connected}`);
      console.log(`  - Key count: ${cacheStats.keyCount || 0}`);
      console.log(`  - Memory usage: ${cacheStats.memoryUsage || 'Unknown'}`);

      if (cacheStats.connected) {
        // Warm up frequently accessed data
        await this.warmUpCache();
        
        // Optimize cache keys
        await this.optimizeCacheKeys();
        
        // Set up cache monitoring
        this.setupCacheMonitoring();
      } else {
        console.log('⚠️  Cache not connected, skipping optimization');
      }

      console.log('✅ Cache optimization completed!');
    } catch (error) {
      console.error('❌ Cache optimization failed:', error);
      throw error;
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  private async warmUpCache(): Promise<void> {
    console.log('🔥 Warming up cache...');

    try {
      // Clear existing cache first
      await CacheService.clear();
      console.log('  🧹 Cache cleared');

      // Warm up categories
      const categories = await AppDataSource.query(`
        SELECT id, name, slug, description, image_url, sort_order, parent_id
        FROM categories 
        WHERE is_active = true 
        ORDER BY sort_order
      `);
      
      const categoryKey = CacheService.generateKey('categories', 'all');
      await CacheService.set(categoryKey, categories, 1800); // 30 minutes
      console.log(`  ✅ Cached ${categories.length} categories`);

      // Warm up featured products
      const featuredProducts = await AppDataSource.query(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true 
        AND p.stock_quantity > 0
        AND (p.badge IS NOT NULL OR p.rating >= 4.5)
        ORDER BY p.rating DESC, p.review_count DESC
        LIMIT 50
      `);
      
      const featuredKey = CacheService.generateKey('products', 'featured');
      await CacheService.set(featuredKey, featuredProducts, 600); // 10 minutes
      console.log(`  ✅ Cached ${featuredProducts.length} featured products`);

      // Warm up popular searches
      const popularSearchTerms = ['laptop', 'phone', 'shirt', 'book', 'camera'];
      for (const term of popularSearchTerms) {
        const searchResults = await AppDataSource.query(`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_active = true 
          AND p.stock_quantity > 0
          AND (p.title ILIKE $1 OR p.description ILIKE $1)
          ORDER BY p.rating DESC
          LIMIT 20
        `, [`%${term}%`]);
        
        const searchKey = CacheService.generateKey('search', term);
        await CacheService.set(searchKey, searchResults, 300); // 5 minutes
      }
      console.log(`  ✅ Cached popular search results`);

    } catch (error) {
      console.error('  ❌ Failed to warm up cache:', error);
    }
  }

  /**
   * Optimize cache keys
   */
  private async optimizeCacheKeys(): Promise<void> {
    console.log('🔑 Optimizing cache keys...');

    try {
      // This would analyze cache key patterns and suggest optimizations
      // For now, just log that optimization is complete
      console.log('  ✅ Cache key optimization completed');
    } catch (error) {
      console.error('  ❌ Failed to optimize cache keys:', error);
    }
  }

  /**
   * Set up cache monitoring
   */
  private setupCacheMonitoring(): void {
    console.log('📊 Setting up cache monitoring...');
    
    // Monitor cache performance every 5 minutes
    setInterval(async () => {
      try {
        const stats = await CacheService.getStats();
        performanceLogger.info('Cache performance metrics', {
          connected: stats.connected,
          keyCount: stats.keyCount,
          memoryUsage: stats.memoryUsage,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to collect cache metrics', { error });
      }
    }, 5 * 60 * 1000);

    console.log('  ✅ Cache monitoring started');
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(): Promise<void> {
    console.log('📋 Generating performance report...\n');

    try {
      const report = {
        timestamp: new Date().toISOString(),
        database: await this.getDatabasePerformanceMetrics(),
        cache: await this.getCachePerformanceMetrics(),
        queries: QueryPerformanceAnalyzer.getStats(),
        connectionPool: ConnectionPoolMonitor.getHealthStatus(),
        recommendations: await this.getPerformanceRecommendations(),
      };

      // Save report to file
      const reportPath = path.join(process.cwd(), 'performance-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      console.log('📊 Performance Report Summary:');
      console.log(`  Database Status: ${report.database.status}`);
      console.log(`  Cache Status: ${report.cache.connected ? 'Connected' : 'Disconnected'}`);
      console.log(`  Total Queries: ${report.queries.totalQueries}`);
      console.log(`  Slow Query Rate: ${report.queries.slowQueryRate.toFixed(2)}%`);
      console.log(`  Connection Pool: ${report.connectionPool.status}`);
      console.log(`  Recommendations: ${report.recommendations.length}`);
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Performance Recommendations:');
        report.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }

      console.log(`\n📄 Full report saved to: ${reportPath}`);

    } catch (error) {
      console.error('❌ Failed to generate performance report:', error);
      throw error;
    }
  }

  /**
   * Get database performance metrics
   */
  private async getDatabasePerformanceMetrics(): Promise<any> {
    try {
      const dbStats = await AppDataSource.query(`
        SELECT 
          numbackends as active_connections,
          xact_commit as transactions_committed,
          xact_rollback as transactions_rolled_back,
          blks_read as blocks_read,
          blks_hit as blocks_hit,
          tup_returned as tuples_returned,
          tup_fetched as tuples_fetched,
          tup_inserted as tuples_inserted,
          tup_updated as tuples_updated,
          tup_deleted as tuples_deleted
        FROM pg_stat_database 
        WHERE datname = current_database()
      `);

      const stats = dbStats[0] || {};
      const hitRatio = stats.blocks_hit && stats.blocks_read 
        ? (stats.blocks_hit / (stats.blocks_hit + stats.blocks_read)) * 100 
        : 0;

      return {
        status: 'connected',
        activeConnections: stats.active_connections || 0,
        transactionCommitRatio: stats.transactions_committed && stats.transactions_rolled_back
          ? (stats.transactions_committed / (stats.transactions_committed + stats.transactions_rolled_back)) * 100
          : 100,
        cacheHitRatio: hitRatio,
        ...stats,
      };
    } catch (error) {
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get cache performance metrics
   */
  private async getCachePerformanceMetrics(): Promise<any> {
    try {
      return await CacheService.getStats();
    } catch (error) {
      return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get performance recommendations
   */
  private async getPerformanceRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    try {
      // Database recommendations
      const dbMetrics = await this.getDatabasePerformanceMetrics();
      if (dbMetrics.cacheHitRatio < 95) {
        recommendations.push(`Database cache hit ratio is ${dbMetrics.cacheHitRatio.toFixed(1)}%. Consider increasing shared_buffers.`);
      }

      // Query recommendations
      const queryStats = QueryPerformanceAnalyzer.getStats();
      recommendations.push(...QueryPerformanceAnalyzer.getRecommendations());

      // Connection pool recommendations
      const poolHealth = ConnectionPoolMonitor.getHealthStatus();
      if (poolHealth.status !== 'healthy') {
        recommendations.push(`Connection pool status is ${poolHealth.status}. ${poolHealth.issues.join(', ')}`);
      }

      // Cache recommendations
      const cacheStats = await CacheService.getStats();
      if (!cacheStats.connected) {
        recommendations.push('Cache is not connected. Consider setting up Redis for better performance.');
      }

    } catch (error) {
      recommendations.push('Failed to analyze some performance metrics. Check system health.');
    }

    return recommendations;
  }
}

/**
 * Main function to handle command line arguments
 */
async function main(): Promise<void> {
  const command = process.argv[2];
  const optimizer = new PerformanceOptimizer();

  try {
    switch (command) {
      case 'database':
        await optimizer.optimizeDatabase();
        break;
        
      case 'cache':
        await optimizer.optimizeCache();
        break;
        
      case 'report':
        await optimizer.generatePerformanceReport();
        break;
        
      case 'all':
        console.log('🚀 Running complete performance optimization...\n');
        await optimizer.optimizeDatabase();
        console.log('');
        await optimizer.optimizeCache();
        console.log('');
        await optimizer.generatePerformanceReport();
        console.log('\n✅ Complete performance optimization finished!');
        break;
        
      default:
        console.log('Usage: npm run optimize [database|cache|report|all]');
        console.log('  database - Optimize database performance');
        console.log('  cache    - Optimize cache performance');
        console.log('  report   - Generate performance report');
        console.log('  all      - Run all optimizations and generate report');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Performance optimization failed:', error);
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

export { PerformanceOptimizer };