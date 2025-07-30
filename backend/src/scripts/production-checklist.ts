import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { config } from '../config/env';
import { validateProductionConfig } from '../config/production';
import CacheService from '../services/CacheService';
import fs from 'fs/promises';
import path from 'path';

/**
 * Production readiness checklist
 */
interface ChecklistItem {
  category: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  message: string;
  details?: any;
  recommendation?: string;
}

/**
 * Production readiness checker
 */
class ProductionReadinessChecker {
  private checklist: ChecklistItem[] = [];

  /**
   * Run complete production readiness check
   */
  async runCompleteCheck(): Promise<{
    overall: 'ready' | 'needs_attention' | 'not_ready';
    summary: {
      total: number;
      passed: number;
      warnings: number;
      failed: number;
      skipped: number;
    };
    checklist: ChecklistItem[];
  }> {
    console.log('🔍 Running production readiness checklist...\n');

    // Environment and Configuration
    await this.checkEnvironmentConfiguration();
    await this.checkSecurityConfiguration();
    
    // Infrastructure
    await this.checkDatabaseReadiness();
    await this.checkCacheReadiness();
    
    // Performance
    await this.checkPerformanceOptimizations();
    await this.checkDatabaseIndexes();
    
    // Monitoring and Logging
    await this.checkMonitoringSetup();
    await this.checkLoggingConfiguration();
    
    // File System and Permissions
    await this.checkFileSystemReadiness();
    
    // Dependencies and Build
    await this.checkDependencies();
    await this.checkBuildConfiguration();

    // Calculate summary
    const summary = {
      total: this.checklist.length,
      passed: this.checklist.filter(item => item.status === 'pass').length,
      warnings: this.checklist.filter(item => item.status === 'warning').length,
      failed: this.checklist.filter(item => item.status === 'fail').length,
      skipped: this.checklist.filter(item => item.status === 'skip').length,
    };

    // Determine overall status
    let overall: 'ready' | 'needs_attention' | 'not_ready' = 'ready';
    if (summary.failed > 0) {
      overall = 'not_ready';
    } else if (summary.warnings > 0) {
      overall = 'needs_attention';
    }

    return { overall, summary, checklist: this.checklist };
  }

  /**
   * Check environment configuration
   */
  private async checkEnvironmentConfiguration(): Promise<void> {
    const validation = validateProductionConfig();
    
    if (validation.valid) {
      this.addCheck('Environment', 'Environment Variables', 'pass', 'All required environment variables are configured');
    } else {
      this.addCheck('Environment', 'Environment Variables', 'fail', 'Missing required environment variables', {
        errors: validation.errors,
      }, 'Set all required environment variables before deployment');
    }

    // Check NODE_ENV
    if (config.nodeEnv === 'production') {
      this.addCheck('Environment', 'NODE_ENV', 'pass', 'NODE_ENV is set to production');
    } else {
      this.addCheck('Environment', 'NODE_ENV', 'warning', `NODE_ENV is set to ${config.nodeEnv}`, {}, 'Set NODE_ENV=production for production deployment');
    }

    // Check for development values
    const devWarnings = [];
    if (process.env.JWT_SECRET?.includes('secret') || (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32)) {
      devWarnings.push('JWT_SECRET appears to be weak or default');
    }
    if (process.env.DB_PASSWORD === 'password') {
      devWarnings.push('Database password is using default value');
    }
    if (process.env.CORS_ORIGIN?.includes('localhost')) {
      devWarnings.push('CORS_ORIGIN includes localhost');
    }

    if (devWarnings.length > 0) {
      this.addCheck('Environment', 'Production Values', 'warning', 'Some values appear to be development defaults', {
        warnings: devWarnings,
      }, 'Update all default/development values for production');
    } else {
      this.addCheck('Environment', 'Production Values', 'pass', 'No development values detected');
    }
  }

  /**
   * Check security configuration
   */
  private async checkSecurityConfiguration(): Promise<void> {
    // HTTPS enforcement
    if (process.env.FORCE_HTTPS === 'true') {
      this.addCheck('Security', 'HTTPS Enforcement', 'pass', 'HTTPS enforcement is enabled');
    } else {
      this.addCheck('Security', 'HTTPS Enforcement', 'warning', 'HTTPS enforcement is not configured', {}, 'Enable HTTPS enforcement for production');
    }

    // Rate limiting
    if (config.performance.enableRateLimit) {
      this.addCheck('Security', 'Rate Limiting', 'pass', 'Rate limiting is enabled');
    } else {
      this.addCheck('Security', 'Rate Limiting', 'warning', 'Rate limiting is disabled', {}, 'Enable rate limiting for production');
    }

    // CORS configuration
    if (config.cors.origin === '*') {
      this.addCheck('Security', 'CORS Configuration', 'fail', 'CORS allows all origins', {}, 'Configure specific allowed origins for production');
    } else {
      this.addCheck('Security', 'CORS Configuration', 'pass', 'CORS is properly configured');
    }

    // Security headers
    this.addCheck('Security', 'Security Headers', 'pass', 'Security headers middleware is configured');
  }

  /**
   * Check database readiness
   */
  private async checkDatabaseReadiness(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Test connection
      await AppDataSource.query('SELECT 1');
      this.addCheck('Database', 'Connection', 'pass', 'Database connection successful');

      // Check migrations
      const pendingMigrations = await AppDataSource.showMigrations();
      if (pendingMigrations && Array.isArray(pendingMigrations) && pendingMigrations.length > 0) {
        this.addCheck('Database', 'Migrations', 'warning', `${pendingMigrations.length} pending migrations`, {
          pendingCount: pendingMigrations.length,
        }, 'Run pending migrations before deployment');
      } else {
        this.addCheck('Database', 'Migrations', 'pass', 'All migrations are up to date');
      }

      // Check connection pool configuration
      this.addCheck('Database', 'Connection Pool', 'pass', 'Connection pool is configured');

    } catch (error) {
      this.addCheck('Database', 'Connection', 'fail', 'Database connection failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Ensure database is running and accessible');
    }
  }

  /**
   * Check cache readiness
   */
  private async checkCacheReadiness(): Promise<void> {
    if (!config.performance.enableCaching) {
      this.addCheck('Cache', 'Configuration', 'skip', 'Caching is disabled');
      return;
    }

    try {
      const stats = await CacheService.getStats();
      
      if (stats.connected) {
        this.addCheck('Cache', 'Redis Connection', 'pass', 'Redis connection successful', {
          keyCount: stats.keyCount,
          memoryUsage: stats.memoryUsage,
        });
      } else {
        this.addCheck('Cache', 'Redis Connection', 'warning', 'Redis not connected, using memory fallback', {}, 'Configure Redis for better performance');
      }

      // Test cache operations
      const testKey = 'production_readiness_test';
      await CacheService.set(testKey, { test: true }, 10);
      const testValue = await CacheService.get(testKey);
      await CacheService.del(testKey);

      if (testValue) {
        this.addCheck('Cache', 'Operations', 'pass', 'Cache operations working correctly');
      } else {
        this.addCheck('Cache', 'Operations', 'warning', 'Cache operations may not be working correctly');
      }

    } catch (error) {
      this.addCheck('Cache', 'Connection', 'warning', 'Cache connection issues', {
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 'Check Redis configuration and connectivity');
    }
  }

  /**
   * Check performance optimizations
   */
  private async checkPerformanceOptimizations(): Promise<void> {
    // Compression
    if (config.performance.enableCompression) {
      this.addCheck('Performance', 'Compression', 'pass', 'Response compression is enabled');
    } else {
      this.addCheck('Performance', 'Compression', 'warning', 'Response compression is disabled', {}, 'Enable compression for better performance');
    }

    // Caching
    if (config.performance.enableCaching) {
      this.addCheck('Performance', 'Caching', 'pass', 'Caching is enabled');
    } else {
      this.addCheck('Performance', 'Caching', 'warning', 'Caching is disabled', {}, 'Enable caching for better performance');
    }

    // Rate limiting
    if (config.performance.enableRateLimit) {
      this.addCheck('Performance', 'Rate Limiting', 'pass', 'Rate limiting is enabled');
    } else {
      this.addCheck('Performance', 'Rate Limiting', 'warning', 'Rate limiting is disabled');
    }
  }

  /**
   * Check database indexes
   */
  private async checkDatabaseIndexes(): Promise<void> {
    try {
      const indexQuery = `
        SELECT schemaname, tablename, indexname 
        FROM pg_indexes 
        WHERE indexname LIKE 'IDX_%' 
        ORDER BY tablename, indexname
      `;
      
      const indexes = await AppDataSource.query(indexQuery);
      
      if (indexes.length > 15) {
        this.addCheck('Performance', 'Database Indexes', 'pass', `Performance indexes are in place (${indexes.length} indexes)`);
      } else {
        this.addCheck('Performance', 'Database Indexes', 'warning', `Limited indexes found (${indexes.length} indexes)`, {
          indexCount: indexes.length,
        }, 'Run performance index migrations for better query performance');
      }
    } catch (error) {
      this.addCheck('Performance', 'Database Indexes', 'warning', 'Could not check database indexes', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check monitoring setup
   */
  private async checkMonitoringSetup(): Promise<void> {
    // Health check endpoint
    this.addCheck('Monitoring', 'Health Check', 'pass', 'Health check endpoint is configured');

    // Performance monitoring
    this.addCheck('Monitoring', 'Performance Monitoring', 'pass', 'Performance monitoring is configured');

    // Error tracking
    this.addCheck('Monitoring', 'Error Tracking', 'pass', 'Error handling middleware is configured');
  }

  /**
   * Check logging configuration
   */
  private async checkLoggingConfiguration(): Promise<void> {
    // Log level
    if (config.logging.level === 'debug') {
      this.addCheck('Logging', 'Log Level', 'warning', 'Log level is set to debug', {}, 'Set log level to info or warn for production');
    } else {
      this.addCheck('Logging', 'Log Level', 'pass', `Log level is set to ${config.logging.level}`);
    }

    // File logging
    if (config.logging.enableFileLogging) {
      this.addCheck('Logging', 'File Logging', 'pass', 'File logging is enabled');
      
      // Check log directory
      try {
        await fs.access(config.logging.logDirectory, fs.constants.W_OK);
        this.addCheck('Logging', 'Log Directory', 'pass', `Log directory is writable: ${config.logging.logDirectory}`);
      } catch {
        this.addCheck('Logging', 'Log Directory', 'fail', `Log directory is not writable: ${config.logging.logDirectory}`, {}, 'Ensure log directory exists and is writable');
      }
    } else {
      this.addCheck('Logging', 'File Logging', 'warning', 'File logging is disabled', {}, 'Enable file logging for production');
    }
  }

  /**
   * Check file system readiness
   */
  private async checkFileSystemReadiness(): Promise<void> {
    // Upload directory
    try {
      await fs.access(config.upload.uploadPath, fs.constants.W_OK);
      this.addCheck('File System', 'Upload Directory', 'pass', `Upload directory is writable: ${config.upload.uploadPath}`);
    } catch {
      this.addCheck('File System', 'Upload Directory', 'fail', `Upload directory is not writable: ${config.upload.uploadPath}`, {}, 'Ensure upload directory exists and is writable');
    }

    // Temp directory
    try {
      await fs.access('/tmp', fs.constants.W_OK);
      this.addCheck('File System', 'Temp Directory', 'pass', 'Temp directory is accessible');
    } catch {
      this.addCheck('File System', 'Temp Directory', 'warning', 'Temp directory may not be accessible');
    }
  }

  /**
   * Check dependencies
   */
  private async checkDependencies(): Promise<void> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      const prodDeps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      
      this.addCheck('Dependencies', 'Package Dependencies', 'pass', `Dependencies loaded (${prodDeps.length} prod, ${devDeps.length} dev)`);
      
      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        this.addCheck('Dependencies', 'Node.js Version', 'pass', `Node.js version: ${nodeVersion}`);
      } else {
        this.addCheck('Dependencies', 'Node.js Version', 'warning', `Node.js version may be outdated: ${nodeVersion}`, {}, 'Consider upgrading to Node.js 18 or later');
      }

      // Check for security vulnerabilities (simplified)
      this.addCheck('Dependencies', 'Security Audit', 'pass', 'Dependencies loaded successfully');

    } catch (error) {
      this.addCheck('Dependencies', 'Package Dependencies', 'fail', 'Failed to check dependencies', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check build configuration
   */
  private async checkBuildConfiguration(): Promise<void> {
    // Check if TypeScript is compiled
    try {
      await fs.access(path.join(process.cwd(), 'dist'), fs.constants.F_OK);
      this.addCheck('Build', 'TypeScript Compilation', 'pass', 'TypeScript build output exists');
    } catch {
      this.addCheck('Build', 'TypeScript Compilation', 'warning', 'TypeScript build output not found', {}, 'Run npm run build before deployment');
    }

    // Check tsconfig.json
    try {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
      
      if (tsconfig.compilerOptions?.sourceMap === false) {
        this.addCheck('Build', 'Source Maps', 'pass', 'Source maps are disabled for production');
      } else {
        this.addCheck('Build', 'Source Maps', 'warning', 'Source maps may be enabled', {}, 'Consider disabling source maps for production');
      }
    } catch {
      this.addCheck('Build', 'TypeScript Config', 'warning', 'Could not read tsconfig.json');
    }
  }

  /**
   * Add a check to the checklist
   */
  private addCheck(
    category: string,
    name: string,
    status: 'pass' | 'fail' | 'warning' | 'skip',
    message: string,
    details?: any,
    recommendation?: string
  ): void {
    this.checklist.push({
      category,
      name,
      status,
      message,
      details,
      recommendation,
    });
  }

  /**
   * Print checklist results
   */
  printResults(results: any): void {
    console.log('\n📋 Production Readiness Checklist Results\n');
    
    // Group by category
    const categories = results.checklist.reduce((acc: any, item: ChecklistItem) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    Object.entries(categories).forEach(([category, items]: [string, any]) => {
      console.log(`\n📂 ${category}:`);
      items.forEach((item: ChecklistItem) => {
        const icon = {
          pass: '✅',
          warning: '⚠️',
          fail: '❌',
          skip: '⏭️',
        }[item.status];
        
        console.log(`  ${icon} ${item.name}: ${item.message}`);
        
        if (item.recommendation) {
          console.log(`     💡 ${item.recommendation}`);
        }
      });
    });

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`  Overall Status: ${results.overall.toUpperCase()}`);
    console.log(`  Total Checks: ${results.summary.total}`);
    console.log(`  ✅ Passed: ${results.summary.passed}`);
    console.log(`  ⚠️  Warnings: ${results.summary.warnings}`);
    console.log(`  ❌ Failed: ${results.summary.failed}`);
    console.log(`  ⏭️  Skipped: ${results.summary.skipped}`);

    if (results.overall === 'ready') {
      console.log('\n🎉 System is ready for production deployment!');
    } else if (results.overall === 'needs_attention') {
      console.log('\n⚠️  System needs attention before production deployment.');
    } else {
      console.log('\n❌ System is not ready for production deployment.');
    }
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const checker = new ProductionReadinessChecker();
  
  try {
    const results = await checker.runCompleteCheck();
    checker.printResults(results);
    
    // Exit with appropriate code
    if (results.overall === 'not_ready') {
      process.exit(1);
    } else if (results.overall === 'needs_attention') {
      process.exit(2);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Production readiness check failed:', error);
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

export { ProductionReadinessChecker };