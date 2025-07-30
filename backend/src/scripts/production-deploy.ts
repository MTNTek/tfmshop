import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { config } from '../config/env';
import { validateProductionConfig, initializeProductionOptimizations } from '../config/production';
import { logger } from '../utils/logger';
import CacheService from '../services/CacheService';
import fs from 'fs/promises';
import path from 'path';

/**
 * Production deployment checklist
 */
interface DeploymentCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

/**
 * Production deployment utility
 */
class ProductionDeployment {
  private checks: DeploymentCheck[] = [];

  /**
   * Run all pre-deployment checks
   */
  async runPreDeploymentChecks(): Promise<boolean> {
    console.log('🚀 Running pre-deployment checks...\n');

    // Environment validation
    await this.checkEnvironmentVariables();
    
    // Database checks
    await this.checkDatabaseConnection();
    await this.checkDatabaseMigrations();
    await this.checkDatabaseIndexes();
    
    // Cache checks
    await this.checkCacheConnection();
    
    // Security checks
    await this.checkSecurityConfiguration();
    
    // Performance checks
    await this.checkPerformanceConfiguration();
    
    // File system checks
    await this.checkFileSystemPermissions();
    
    // Dependencies check
    await this.checkDependencies();

    // Print results
    this.printCheckResults();

    const failedChecks = this.checks.filter(c => c.status === 'fail');
    return failedChecks.length === 0;
  }

  /**
   * Check environment variables
   */
  private async checkEnvironmentVariables(): Promise<void> {
    const validation = validateProductionConfig();
    
    if (validation.valid) {
      this.addCheck('Environment Variables', 'pass', 'All required environment variables are set');
    } else {
      this.addCheck('Environment Variables', 'fail', 'Missing required environment variables', {
        errors: validation.errors,
      });
    }

    // Check for development values
    const devValues = [];
    if (process.env.JWT_SECRET?.includes('secret')) {
      devValues.push('JWT_SECRET contains default/weak value');
    }
    if (process.env.DB_PASSWORD === 'password') {
      devValues.push('DB_PASSWORD is using default value');
    }
    if (process.env.CORS_ORIGIN?.includes('localhost')) {
      devValues.push('CORS_ORIGIN includes localhost');
    }

    if (devValues.length > 0) {
      this.addCheck('Development Values', 'warning', 'Some values appear to be development defaults', {
        warnings: devValues,
      });
    } else {
      this.addCheck('Development Values', 'pass', 'No development values detected');
    }
  }

  /**
   * Check database connection
   */
  private async checkDatabaseConnection(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Test connection with a simple query
      const result = await AppDataSource.query('SELECT version()');
      
      this.addCheck('Database Connection', 'pass', 'Database connection successful', {
        version: result[0]?.version?.substring(0, 50) + '...',
      });
    } catch (error) {
      this.addCheck('Database Connection', 'fail', 'Database connection failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check database migrations
   */
  private async checkDatabaseMigrations(): Promise<void> {
    try {
      const pendingMigrations = await AppDataSource.showMigrations();
      
      if (pendingMigrations && Array.isArray(pendingMigrations) && pendingMigrations.length > 0) {
        this.addCheck('Database Migrations', 'warning', 'Pending migrations detected', {
          pendingCount: pendingMigrations.length,
        });
      } else {
        this.addCheck('Database Migrations', 'pass', 'All migrations are up to date');
      }
    } catch (error) {
      this.addCheck('Database Migrations', 'fail', 'Failed to check migrations', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check database indexes
   */
  private async checkDatabaseIndexes(): Promise<void> {
    try {
      // Check if performance indexes exist
      const indexQuery = `
        SELECT schemaname, tablename, indexname 
        FROM pg_indexes 
        WHERE indexname LIKE 'IDX_%' 
        ORDER BY tablename, indexname
      `;
      
      const indexes = await AppDataSource.query(indexQuery);
      
      if (indexes.length > 20) { // Assuming we have many performance indexes
        this.addCheck('Database Indexes', 'pass', `Performance indexes are in place (${indexes.length} indexes)`);
      } else {
        this.addCheck('Database Indexes', 'warning', `Limited indexes found (${indexes.length} indexes)`, {
          suggestion: 'Consider running performance index migrations',
        });
      }
    } catch (error) {
      this.addCheck('Database Indexes', 'fail', 'Failed to check database indexes', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check cache connection
   */
  private async checkCacheConnection(): Promise<void> {
    try {
      const stats = await CacheService.getStats();
      
      if (stats.connected) {
        this.addCheck('Cache Connection', 'pass', 'Cache connection successful', {
          keyCount: stats.keyCount,
          memoryUsage: stats.memoryUsage,
        });
      } else {
        this.addCheck('Cache Connection', 'fail', 'Cache connection failed');
      }
    } catch (error) {
      this.addCheck('Cache Connection', 'fail', 'Cache connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check security configuration
   */
  private async checkSecurityConfiguration(): Promise<void> {
    const securityIssues = [];

    // Check HTTPS
    if (!process.env.FORCE_HTTPS && config.nodeEnv === 'production') {
      securityIssues.push('HTTPS not enforced');
    }

    // Check rate limiting
    if (!config.performance.enableRateLimit) {
      securityIssues.push('Rate limiting disabled');
    }

    // Check CORS configuration
    if (config.cors.origin === '*') {
      securityIssues.push('CORS allows all origins');
    }

    if (securityIssues.length > 0) {
      this.addCheck('Security Configuration', 'warning', 'Security configuration issues found', {
        issues: securityIssues,
      });
    } else {
      this.addCheck('Security Configuration', 'pass', 'Security configuration looks good');
    }
  }

  /**
   * Check performance configuration
   */
  private async checkPerformanceConfiguration(): Promise<void> {
    const performanceIssues = [];

    if (!config.performance.enableCaching) {
      performanceIssues.push('Caching disabled');
    }

    if (!config.performance.enableCompression) {
      performanceIssues.push('Compression disabled');
    }

    if (performanceIssues.length > 0) {
      this.addCheck('Performance Configuration', 'warning', 'Performance optimizations disabled', {
        issues: performanceIssues,
      });
    } else {
      this.addCheck('Performance Configuration', 'pass', 'Performance optimizations enabled');
    }
  }

  /**
   * Check file system permissions
   */
  private async checkFileSystemPermissions(): Promise<void> {
    try {
      const uploadPath = config.upload.uploadPath;
      const logPath = config.logging.logDirectory;

      // Check upload directory
      try {
        await fs.access(uploadPath, fs.constants.W_OK);
        this.addCheck('Upload Directory', 'pass', `Upload directory writable: ${uploadPath}`);
      } catch {
        this.addCheck('Upload Directory', 'fail', `Upload directory not writable: ${uploadPath}`);
      }

      // Check log directory
      if (config.logging.enableFileLogging) {
        try {
          await fs.access(logPath, fs.constants.W_OK);
          this.addCheck('Log Directory', 'pass', `Log directory writable: ${logPath}`);
        } catch {
          this.addCheck('Log Directory', 'fail', `Log directory not writable: ${logPath}`);
        }
      } else {
        this.addCheck('Log Directory', 'pass', 'File logging disabled');
      }
    } catch (error) {
      this.addCheck('File System Permissions', 'fail', 'Failed to check file system permissions', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check dependencies
   */
  private async checkDependencies(): Promise<void> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      // Check for development dependencies in production
      const devDeps = Object.keys(packageJson.devDependencies || {});
      const prodDeps = Object.keys(packageJson.dependencies || {});
      
      this.addCheck('Dependencies', 'pass', `Dependencies loaded (${prodDeps.length} prod, ${devDeps.length} dev)`);
      
      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        this.addCheck('Node.js Version', 'pass', `Node.js version: ${nodeVersion}`);
      } else {
        this.addCheck('Node.js Version', 'warning', `Node.js version may be outdated: ${nodeVersion}`);
      }
    } catch (error) {
      this.addCheck('Dependencies', 'fail', 'Failed to check dependencies', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Add a check result
   */
  private addCheck(name: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any): void {
    this.checks.push({ name, status, message, details });
  }

  /**
   * Print check results
   */
  private printCheckResults(): void {
    console.log('\n📋 Deployment Check Results:\n');
    
    this.checks.forEach(check => {
      const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${check.name}: ${check.message}`);
      
      if (check.details) {
        console.log(`   Details: ${JSON.stringify(check.details, null, 2)}`);
      }
    });

    const passCount = this.checks.filter(c => c.status === 'pass').length;
    const warningCount = this.checks.filter(c => c.status === 'warning').length;
    const failCount = this.checks.filter(c => c.status === 'fail').length;

    console.log(`\n📊 Summary: ${passCount} passed, ${warningCount} warnings, ${failCount} failed\n`);
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    console.log('🔄 Running database migrations...');
    
    try {
      const migrations = await AppDataSource.runMigrations();
      
      if (migrations.length > 0) {
        console.log(`✅ Applied ${migrations.length} migrations:`);
        migrations.forEach(migration => {
          console.log(`  - ${migration.name}`);
        });
      } else {
        console.log('✅ No pending migrations');
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Warm up cache
   */
  async warmUpCache(): Promise<void> {
    console.log('🔥 Warming up cache...');
    
    try {
      // Clear existing cache
      await CacheService.clear();
      console.log('  ✅ Cache cleared');
      
      // Pre-populate frequently accessed data
      await this.warmUpCategories();
      await this.warmUpFeaturedProducts();
      await this.warmUpPopularProducts();
      
      console.log('✅ Cache warmed up successfully');
    } catch (error) {
      console.error('❌ Cache warm-up failed:', error);
      throw error;
    }
  }

  /**
   * Warm up categories cache
   */
  private async warmUpCategories(): Promise<void> {
    try {
      const categories = await AppDataSource.query(`
        SELECT id, name, slug, description, image_url, sort_order, parent_id
        FROM categories 
        WHERE is_active = true 
        ORDER BY sort_order
      `);
      
      // Cache all categories
      const cacheKey = CacheService.generateKey('categories', 'all');
      await CacheService.set(cacheKey, categories, 1800); // 30 minutes
      
      // Cache individual categories by slug
      for (const category of categories) {
        const slugKey = CacheService.generateKey('category', 'slug', category.slug);
        await CacheService.set(slugKey, category, 1800);
      }
      
      console.log(`  ✅ Cached ${categories.length} categories`);
    } catch (error) {
      console.warn('  ⚠️  Failed to warm up categories cache:', error);
    }
  }

  /**
   * Warm up featured products cache
   */
  private async warmUpFeaturedProducts(): Promise<void> {
    try {
      const featuredProducts = await AppDataSource.query(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true 
        AND p.stock_quantity > 0
        AND p.badge IS NOT NULL
        ORDER BY p.created_at DESC
        LIMIT 20
      `);
      
      const cacheKey = CacheService.generateKey('products', 'featured');
      await CacheService.set(cacheKey, featuredProducts, 600); // 10 minutes
      
      console.log(`  ✅ Cached ${featuredProducts.length} featured products`);
    } catch (error) {
      console.warn('  ⚠️  Failed to warm up featured products cache:', error);
    }
  }

  /**
   * Warm up popular products cache
   */
  private async warmUpPopularProducts(): Promise<void> {
    try {
      const popularProducts = await AppDataSource.query(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true 
        AND p.stock_quantity > 0
        ORDER BY p.rating DESC, p.review_count DESC
        LIMIT 50
      `);
      
      const cacheKey = CacheService.generateKey('products', 'popular');
      await CacheService.set(cacheKey, popularProducts, 600); // 10 minutes
      
      // Also cache by category
      const productsByCategory = popularProducts.reduce((acc, product) => {
        const categorySlug = product.category_slug;
        if (!acc[categorySlug]) acc[categorySlug] = [];
        acc[categorySlug].push(product);
        return acc;
      }, {} as Record<string, any[]>);
      
      for (const [categorySlug, products] of Object.entries(productsByCategory)) {
        const categoryKey = CacheService.generateKey('products', 'category', categorySlug, 'popular');
        await CacheService.set(categoryKey, products, 600);
      }
      
      console.log(`  ✅ Cached ${popularProducts.length} popular products`);
    } catch (error) {
      console.warn('  ⚠️  Failed to warm up popular products cache:', error);
    }
  }

  /**
   * Initialize production optimizations
   */
  initializeOptimizations(): void {
    console.log('⚡ Initializing production optimizations...');
    
    try {
      initializeProductionOptimizations();
      console.log('✅ Production optimizations initialized');
    } catch (error) {
      console.error('❌ Failed to initialize optimizations:', error);
      throw error;
    }
  }
}

/**
 * Main deployment function
 */
async function main(): Promise<void> {
  const command = process.argv[2];
  const deployment = new ProductionDeployment();

  try {
    switch (command) {
      case 'check':
        const checksPass = await deployment.runPreDeploymentChecks();
        process.exit(checksPass ? 0 : 1);
        break;
        
      case 'migrate':
        await deployment.runMigrations();
        break;
        
      case 'cache-warmup':
        await deployment.warmUpCache();
        break;
        
      case 'optimize':
        deployment.initializeOptimizations();
        break;
        
      case 'deploy':
        console.log('🚀 Starting production deployment...\n');
        
        // Run pre-deployment checks
        const allChecksPass = await deployment.runPreDeploymentChecks();
        if (!allChecksPass) {
          console.error('❌ Pre-deployment checks failed. Aborting deployment.');
          process.exit(1);
        }
        
        // Run migrations
        await deployment.runMigrations();
        
        // Initialize optimizations
        deployment.initializeOptimizations();
        
        // Warm up cache
        await deployment.warmUpCache();
        
        console.log('✅ Production deployment completed successfully!');
        break;
        
      default:
        console.log('Usage: npm run deploy [check|migrate|cache-warmup|optimize|deploy]');
        console.log('  check        - Run pre-deployment checks');
        console.log('  migrate      - Run database migrations');
        console.log('  cache-warmup - Warm up cache with frequently accessed data');
        console.log('  optimize     - Initialize production optimizations');
        console.log('  deploy       - Run full deployment process');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Deployment script failed:', error);
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

export { ProductionDeployment };