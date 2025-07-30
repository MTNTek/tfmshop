import { SelectQueryBuilder } from 'typeorm';
import { logger, performanceLogger } from './logger';
import { config } from '../config/env';
import { AppDataSource } from '../config/database';

/**
 * Query optimization utilities for better database performance
 */
export class QueryOptimizer {
  /**
   * Add pagination with performance optimizations
   */
  static addPagination<T>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 20,
    maxLimit: number = 100
  ): SelectQueryBuilder<T> {
    // Ensure reasonable limits
    const safeLimit = Math.min(Math.max(limit, 1), maxLimit);
    const safePage = Math.max(page, 1);
    const offset = (safePage - 1) * safeLimit;

    return queryBuilder
      .limit(safeLimit)
      .offset(offset);
  }

  /**
   * Add optimized sorting with index hints
   */
  static addSorting<T>(
    queryBuilder: SelectQueryBuilder<T>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    allowedSortFields: string[] = []
  ): SelectQueryBuilder<T> {
    // Validate sort field to prevent SQL injection
    if (allowedSortFields.length > 0 && !allowedSortFields.includes(sortBy)) {
      logger.warn('Invalid sort field attempted', { sortBy, allowedFields: allowedSortFields });
      return queryBuilder;
    }

    // Use indexed columns for better performance
    const indexedSortFields = {
      'created_at': 'entity.createdAt',
      'updated_at': 'entity.updatedAt',
      'price': 'entity.price',
      'rating': 'entity.rating',
      'name': 'entity.name',
      'title': 'entity.title',
    };

    const sortField = indexedSortFields[sortBy as keyof typeof indexedSortFields] || `entity.${sortBy}`;
    
    return queryBuilder.orderBy(sortField, sortOrder);
  }

  /**
   * Add search with full-text search optimization
   */
  static addTextSearch<T>(
    queryBuilder: SelectQueryBuilder<T>,
    searchTerm: string,
    searchFields: string[] = ['title', 'description']
  ): SelectQueryBuilder<T> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return queryBuilder;
    }

    const cleanSearchTerm = searchTerm.trim().replace(/[^\w\s]/g, '');
    
    if (cleanSearchTerm.length < 2) {
      return queryBuilder;
    }

    // Use PostgreSQL full-text search for better performance
    const tsQuery = cleanSearchTerm
      .split(/\s+/)
      .filter(term => term.length > 1)
      .map(term => `${term}:*`)
      .join(' & ');

    if (searchFields.includes('title') && searchFields.includes('description')) {
      // Use the full-text search index
      queryBuilder.andWhere(
        `to_tsvector('english', entity.title || ' ' || entity.description) @@ to_tsquery('english', :tsQuery)`,
        { tsQuery }
      );
    } else {
      // Fallback to ILIKE for other fields
      const conditions = searchFields.map((field, index) => 
        `entity.${field} ILIKE :searchTerm${index}`
      ).join(' OR ');
      
      const parameters = searchFields.reduce((params, field, index) => {
        params[`searchTerm${index}`] = `%${cleanSearchTerm}%`;
        return params;
      }, {} as Record<string, string>);

      queryBuilder.andWhere(`(${conditions})`, parameters);
    }

    return queryBuilder;
  }

  /**
   * Add filters with index optimization
   */
  static addFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: Record<string, any>,
    allowedFilters: Record<string, string> = {}
  ): SelectQueryBuilder<T> {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      // Validate filter field
      const fieldName = allowedFilters[key] || key;
      
      if (Array.isArray(value)) {
        // Handle array filters (IN clause)
        if (value.length > 0) {
          queryBuilder.andWhere(`entity.${fieldName} IN (:...${key})`, { [key]: value });
        }
      } else if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
        // Handle range filters
        queryBuilder.andWhere(`entity.${fieldName} BETWEEN :${key}Min AND :${key}Max`, {
          [`${key}Min`]: value.min,
          [`${key}Max`]: value.max,
        });
      } else if (typeof value === 'boolean') {
        queryBuilder.andWhere(`entity.${fieldName} = :${key}`, { [key]: value });
      } else {
        queryBuilder.andWhere(`entity.${fieldName} = :${key}`, { [key]: value });
      }
    });

    return queryBuilder;
  }

  /**
   * Add performance monitoring to query
   */
  static async executeWithMonitoring<T>(
    queryBuilder: SelectQueryBuilder<T>,
    operation: string = 'query'
  ): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      const result = await queryBuilder.getMany();
      const duration = Date.now() - startTime;
      
      // Log slow queries
      if (duration > 1000) {
        performanceLogger.warn('Slow query detected', {
          operation,
          duration,
          sql: queryBuilder.getSql(),
          parameters: queryBuilder.getParameters(),
        });
      } else if (config.nodeEnv === 'development') {
        logger.debug('Query executed', {
          operation,
          duration,
          resultCount: result.length,
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Query execution failed', {
        operation,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        sql: queryBuilder.getSql(),
        parameters: queryBuilder.getParameters(),
      });
      throw error;
    }
  }

  /**
   * Execute count query with optimization
   */
  static async executeCountWithMonitoring<T>(
    queryBuilder: SelectQueryBuilder<T>,
    operation: string = 'count'
  ): Promise<number> {
    const startTime = Date.now();
    
    try {
      const count = await queryBuilder.getCount();
      const duration = Date.now() - startTime;
      
      if (duration > 500) {
        performanceLogger.warn('Slow count query detected', {
          operation,
          duration,
          sql: queryBuilder.getSql(),
          parameters: queryBuilder.getParameters(),
        });
      }

      return count;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Count query execution failed', {
        operation,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        sql: queryBuilder.getSql(),
        parameters: queryBuilder.getParameters(),
      });
      throw error;
    }
  }

  /**
   * Optimize query for large datasets
   */
  static optimizeForLargeDataset<T>(
    queryBuilder: SelectQueryBuilder<T>,
    options: {
      useStreamingCursor?: boolean;
      batchSize?: number;
      selectFields?: string[];
    } = {}
  ): SelectQueryBuilder<T> {
    const { selectFields, batchSize = 1000 } = options;

    // Select only necessary fields to reduce memory usage
    if (selectFields && selectFields.length > 0) {
      queryBuilder.select(selectFields.map(field => `entity.${field}`));
    }

    // Add reasonable limit for large datasets
    if (!queryBuilder.expressionMap.limit) {
      queryBuilder.limit(batchSize);
    }

    return queryBuilder;
  }

  /**
   * Add caching hints to query
   */
  static addCacheHint<T>(
    queryBuilder: SelectQueryBuilder<T>,
    cacheKey: string,
    cacheDuration: number = 300000 // 5 minutes
  ): SelectQueryBuilder<T> {
    if (config.performance.enableCaching) {
      queryBuilder.cache(cacheKey, cacheDuration);
    }
    return queryBuilder;
  }

  /**
   * Build optimized product search query
   */
  static buildProductSearchQuery(
    queryBuilder: SelectQueryBuilder<any>,
    searchParams: {
      search?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      brand?: string;
      inStock?: boolean;
      rating?: number;
      tags?: string[];
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      page?: number;
      limit?: number;
    }
  ): SelectQueryBuilder<any> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      inStock,
      rating,
      tags,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = searchParams;

    // Base conditions
    queryBuilder.where('entity.isActive = :isActive', { isActive: true });

    // Text search
    if (search) {
      this.addTextSearch(queryBuilder, search, ['title', 'description']);
    }

    // Category filter
    if (category) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: category });
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        queryBuilder.andWhere('entity.price BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice !== undefined) {
        queryBuilder.andWhere('entity.price >= :minPrice', { minPrice });
      } else if (maxPrice !== undefined) {
        queryBuilder.andWhere('entity.price <= :maxPrice', { maxPrice });
      }
    }

    // Brand filter
    if (brand) {
      queryBuilder.andWhere('entity.brand = :brand', { brand });
    }

    // Stock filter
    if (inStock !== undefined) {
      if (inStock) {
        queryBuilder.andWhere('entity.stockQuantity > 0');
      } else {
        queryBuilder.andWhere('entity.stockQuantity = 0');
      }
    }

    // Rating filter
    if (rating !== undefined) {
      queryBuilder.andWhere('entity.rating >= :rating', { rating });
    }

    // Tags filter
    if (tags && tags.length > 0) {
      queryBuilder.andWhere('entity.tags && :tags', { tags });
    }

    // Sorting
    this.addSorting(queryBuilder, sortBy, sortOrder, [
      'created_at',
      'price',
      'rating',
      'title',
      'review_count',
    ]);

    // Pagination
    this.addPagination(queryBuilder, page, limit, 100);

    return queryBuilder;
  }
}

/**
 * Database connection pool monitoring
 */
export class ConnectionPoolMonitor {
  private static poolStats = {
    active: 0,
    idle: 0,
    total: 0,
    waiting: 0,
    created: 0,
    destroyed: 0,
    lastUpdate: Date.now(),
  };

  /**
   * Get connection pool statistics
   */
  static getPoolStats() {
    try {
      // Try to get actual stats from TypeORM connection
      if (AppDataSource.isInitialized && AppDataSource.driver) {
        const driver = AppDataSource.driver as any;
        if (driver.master && driver.master.pool) {
          const pool = driver.master.pool;
          this.poolStats = {
            active: pool.totalCount - pool.idleCount,
            idle: pool.idleCount,
            total: pool.totalCount,
            waiting: pool.waitingCount || 0,
            created: pool.totalCount,
            destroyed: 0,
            lastUpdate: Date.now(),
          };
        }
      }
    } catch (error) {
      logger.debug('Could not get actual pool stats, using defaults');
    }
    
    return this.poolStats;
  }

  /**
   * Update pool statistics
   */
  static updateStats(stats: Partial<typeof ConnectionPoolMonitor.poolStats>) {
    this.poolStats = { ...this.poolStats, ...stats, lastUpdate: Date.now() };
  }

  /**
   * Monitor connection pool health
   */
  static monitorPoolHealth() {
    setInterval(() => {
      const stats = this.getPoolStats();
      
      // Log pool statistics periodically
      if (config.nodeEnv === 'development') {
        logger.debug('Connection pool stats', stats);
      }
      
      // Alert on high wait queue
      if (stats.waiting > 10) {
        logger.warn('High connection pool wait queue', stats);
      }
      
      // Alert on high active connection count
      if (stats.active > 40) {
        logger.warn('High active connection count', stats);
      }
      
      // Alert on pool exhaustion
      if (stats.total > 0 && stats.active / stats.total > 0.9) {
        logger.warn('Connection pool near exhaustion', {
          utilization: `${Math.round((stats.active / stats.total) * 100)}%`,
          ...stats,
        });
      }
      
      // Performance logging
      performanceLogger.info('Connection pool metrics', {
        ...stats,
        utilizationPercent: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0,
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get pool health status
   */
  static getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: typeof ConnectionPoolMonitor.poolStats;
    issues: string[];
  } {
    const stats = this.getPoolStats();
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check for issues
    if (stats.waiting > 10) {
      issues.push(`High wait queue: ${stats.waiting} connections waiting`);
      status = 'degraded';
    }

    if (stats.total > 0 && stats.active / stats.total > 0.9) {
      issues.push(`High utilization: ${Math.round((stats.active / stats.total) * 100)}%`);
      status = 'degraded';
    }

    if (stats.total === 0 || (stats.active === 0 && stats.idle === 0)) {
      issues.push('No database connections available');
      status = 'unhealthy';
    }

    if (Date.now() - stats.lastUpdate > 120000) { // 2 minutes
      issues.push('Pool statistics are stale');
      status = 'degraded';
    }

    return { status, details: stats, issues };
  }
}

/**
 * Query performance analyzer
 */
export class QueryPerformanceAnalyzer {
  private static slowQueries: Array<{
    sql: string;
    duration: number;
    timestamp: number;
    parameters?: any[];
  }> = [];

  private static queryStats = {
    totalQueries: 0,
    slowQueries: 0,
    averageDuration: 0,
    totalDuration: 0,
  };

  /**
   * Record query execution
   */
  static recordQuery(sql: string, duration: number, parameters?: any[]) {
    this.queryStats.totalQueries++;
    this.queryStats.totalDuration += duration;
    this.queryStats.averageDuration = this.queryStats.totalDuration / this.queryStats.totalQueries;

    // Record slow queries
    if (duration > 1000) { // Queries taking more than 1 second
      this.queryStats.slowQueries++;
      
      this.slowQueries.push({
        sql: sql.substring(0, 500), // Truncate for storage
        duration,
        timestamp: Date.now(),
        parameters: parameters?.slice(0, 10), // Limit parameters
      });

      // Keep only last 100 slow queries
      if (this.slowQueries.length > 100) {
        this.slowQueries.shift();
      }

      // Log slow query
      performanceLogger.warn('Slow query detected', {
        sql: sql.substring(0, 200),
        duration,
        parameters: parameters?.slice(0, 5),
      });
    }
  }

  /**
   * Get query statistics
   */
  static getStats() {
    return {
      ...this.queryStats,
      slowQueryRate: this.queryStats.totalQueries > 0 
        ? (this.queryStats.slowQueries / this.queryStats.totalQueries) * 100 
        : 0,
      recentSlowQueries: this.slowQueries.slice(-10),
    };
  }

  /**
   * Get query recommendations
   */
  static getRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getStats();

    if (stats.slowQueryRate > 5) {
      recommendations.push('High slow query rate detected. Consider adding indexes or optimizing queries.');
    }

    if (stats.averageDuration > 500) {
      recommendations.push('Average query duration is high. Review query complexity and database performance.');
    }

    if (this.slowQueries.length > 50) {
      recommendations.push('Many slow queries detected. Consider query optimization and index tuning.');
    }

    // Analyze common slow query patterns
    const commonPatterns = this.analyzeSlowQueryPatterns();
    recommendations.push(...commonPatterns);

    return recommendations;
  }

  /**
   * Analyze slow query patterns
   */
  private static analyzeSlowQueryPatterns(): string[] {
    const recommendations: string[] = [];
    const recentSlowQueries = this.slowQueries.slice(-20);

    // Check for missing indexes
    const selectQueries = recentSlowQueries.filter(q => 
      q.sql.toLowerCase().includes('select') && 
      q.sql.toLowerCase().includes('where')
    );

    if (selectQueries.length > 5) {
      recommendations.push('Multiple slow SELECT queries with WHERE clauses detected. Consider adding indexes.');
    }

    // Check for N+1 query problems
    const similarQueries = new Map<string, number>();
    recentSlowQueries.forEach(query => {
      const pattern = query.sql.replace(/\$\d+/g, '?').substring(0, 100);
      similarQueries.set(pattern, (similarQueries.get(pattern) || 0) + 1);
    });

    for (const [pattern, count] of similarQueries.entries()) {
      if (count > 3) {
        recommendations.push(`Potential N+1 query problem detected: ${count} similar queries. Consider using joins or batch loading.`);
        break;
      }
    }

    return recommendations;
  }

  /**
   * Reset statistics
   */
  static reset() {
    this.slowQueries = [];
    this.queryStats = {
      totalQueries: 0,
      slowQueries: 0,
      averageDuration: 0,
      totalDuration: 0,
    };
  }
}

export default QueryOptimizer;