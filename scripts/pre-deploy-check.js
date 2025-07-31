#!/usr/bin/env node

/**
 * Pre-deployment checks script
 * Validates application readiness for production deployment
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentChecker {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
  }

  async runCheck(name, checkFn) {
    try {
      console.log(`🔍 Running check: ${name}...`);
      const result = await checkFn();
      if (result.success) {
        console.log(`✅ ${name}: PASSED`);
        if (result.message) console.log(`   ${result.message}`);
      } else {
        console.log(`❌ ${name}: FAILED`);
        this.errors.push({ check: name, message: result.message });
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR`);
      this.errors.push({ check: name, message: error.message });
    }
  }

  async runWarningCheck(name, checkFn) {
    try {
      console.log(`🔍 Running check: ${name}...`);
      const result = await checkFn();
      if (result.success) {
        console.log(`✅ ${name}: PASSED`);
        if (result.message) console.log(`   ${result.message}`);
      } else {
        console.log(`⚠️  ${name}: WARNING`);
        this.warnings.push({ check: name, message: result.message });
      }
    } catch (error) {
      console.log(`⚠️  ${name}: WARNING`);
      this.warnings.push({ check: name, message: error.message });
    }
  }

  async checkEnvironmentVariables() {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    return {
      success: missingVars.length === 0,
      message: missingVars.length > 0 
        ? `Missing environment variables: ${missingVars.join(', ')}` 
        : `All required environment variables are set`
    };
  }

  async checkDatabaseConnection() {
    return new Promise((resolve) => {
      exec('npm run db:check 2>/dev/null', (error, stdout, stderr) => {
        resolve({
          success: !error,
          message: error ? 'Database connection failed' : 'Database connection successful'
        });
      });
    });
  }

  async checkBuildSuccess() {
    return new Promise((resolve) => {
      exec('npm run build 2>/dev/null', (error, stdout, stderr) => {
        resolve({
          success: !error,
          message: error ? 'Build failed' : 'Build completed successfully'
        });
      });
    });
  }

  async checkTestSuite() {
    return new Promise((resolve) => {
      exec('npm run test:ci 2>/dev/null', (error, stdout, stderr) => {
        resolve({
          success: !error,
          message: error ? 'Tests failed' : 'All tests passed'
        });
      });
    });
  }

  async checkLinting() {
    return new Promise((resolve) => {
      exec('npm run lint 2>/dev/null', (error, stdout, stderr) => {
        resolve({
          success: !error,
          message: error ? 'Linting errors found' : 'No linting errors'
        });
      });
    });
  }

  async checkTypeScript() {
    return new Promise((resolve) => {
      exec('npx tsc --noEmit 2>/dev/null', (error, stdout, stderr) => {
        resolve({
          success: !error,
          message: error ? 'TypeScript errors found' : 'No TypeScript errors'
        });
      });
    });
  }

  async checkSecurity() {
    return new Promise((resolve) => {
      exec('npm audit --audit-level=high 2>/dev/null', (error, stdout, stderr) => {
        resolve({
          success: !error,
          message: error ? 'Security vulnerabilities found' : 'No high-risk vulnerabilities'
        });
      });
    });
  }

  async checkPackageUpdates() {
    return new Promise((resolve) => {
      exec('npm outdated --depth=0 2>/dev/null', (error, stdout, stderr) => {
        const hasOutdated = stdout && stdout.trim().length > 0;
        resolve({
          success: !hasOutdated,
          message: hasOutdated ? 'Some packages have updates available' : 'All packages are up to date'
        });
      });
    });
  }

  async checkFileStructure() {
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      '.env.example',
      'README.md'
    ];

    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );

    return {
      success: missingFiles.length === 0,
      message: missingFiles.length > 0 
        ? `Missing files: ${missingFiles.join(', ')}` 
        : 'All required files present'
    };
  }

  async checkDockerConfiguration() {
    const dockerFiles = ['Dockerfile', 'docker-compose.yml', '.dockerignore'];
    const presentFiles = dockerFiles.filter(file => 
      fs.existsSync(path.join(process.cwd(), file))
    );

    return {
      success: presentFiles.length > 0,
      message: presentFiles.length > 0 
        ? `Docker files present: ${presentFiles.join(', ')}` 
        : 'No Docker configuration found'
    };
  }

  async runAllChecks() {
    console.log('🚀 Running pre-deployment checks...\n');

    // Critical checks (must pass)
    await this.runCheck('Environment Variables', () => this.checkEnvironmentVariables());
    await this.runCheck('File Structure', () => this.checkFileStructure());
    await this.runCheck('TypeScript Compilation', () => this.checkTypeScript());
    await this.runCheck('Linting', () => this.checkLinting());
    await this.runCheck('Build Process', () => this.checkBuildSuccess());
    await this.runCheck('Test Suite', () => this.checkTestSuite());
    await this.runCheck('Security Audit', () => this.checkSecurity());

    // Warning checks (nice to have)
    await this.runWarningCheck('Database Connection', () => this.checkDatabaseConnection());
    await this.runWarningCheck('Package Updates', () => this.checkPackageUpdates());
    await this.runWarningCheck('Docker Configuration', () => this.checkDockerConfiguration());

    // Summary
    console.log('\n📊 Deployment Check Summary:');
    console.log('═'.repeat(50));

    if (this.errors.length === 0) {
      console.log('✅ All critical checks passed!');
      console.log('🚀 Application is ready for deployment!');
    } else {
      console.log('❌ Critical issues found:');
      this.errors.forEach(error => {
        console.log(`   • ${error.check}: ${error.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings (recommended to fix):');
      this.warnings.forEach(warning => {
        console.log(`   • ${warning.check}: ${warning.message}`);
      });
    }

    console.log(`\n📈 Status: ${this.errors.length} errors, ${this.warnings.length} warnings`);

    // Exit with appropriate code
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Run checks if called directly
if (require.main === module) {
  const checker = new DeploymentChecker();
  checker.runAllChecks().catch(console.error);
}

module.exports = DeploymentChecker;
