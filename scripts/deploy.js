#!/usr/bin/env node

/**
 * Production deployment script
 * Automates the deployment process with safety checks
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionDeployer {
  constructor(options = {}) {
    this.platform = options.platform || 'vercel'; // vercel, netlify, aws, docker
    this.environment = options.environment || 'production';
    this.skipChecks = options.skipChecks || false;
    this.dryRun = options.dryRun || false;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      deploy: '🚀'
    }[type] || '📝';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async execCommand(command, description) {
    return new Promise((resolve, reject) => {
      this.log(`${description}...`, 'info');
      
      if (this.dryRun) {
        this.log(`[DRY RUN] Would execute: ${command}`, 'warning');
        resolve({ stdout: '', stderr: '' });
        return;
      }

      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          this.log(`Failed: ${description}`, 'error');
          this.log(error.message, 'error');
          reject(error);
        } else {
          this.log(`Completed: ${description}`, 'success');
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async runPreDeploymentChecks() {
    this.log('Running pre-deployment checks...', 'info');
    
    try {
      await this.execCommand(
        'node scripts/pre-deploy-check.js',
        'Pre-deployment validation'
      );
      this.log('All pre-deployment checks passed!', 'success');
    } catch (error) {
      this.log('Pre-deployment checks failed!', 'error');
      if (!this.skipChecks) {
        throw new Error('Deployment cancelled due to failed checks');
      }
      this.log('Continuing deployment despite failed checks...', 'warning');
    }
  }

  async buildApplication() {
    this.log('Building application for production...', 'info');
    
    // Clear previous build
    await this.execCommand('rm -rf .next', 'Cleaning previous build');
    
    // Install dependencies
    await this.execCommand('npm ci', 'Installing dependencies');
    
    // Run build
    await this.execCommand('npm run build', 'Building application');
    
    // Generate static export if needed
    if (this.platform === 'static') {
      await this.execCommand('npm run export', 'Generating static export');
    }
  }

  async deployToVercel() {
    this.log('Deploying to Vercel...', 'deploy');
    
    const isProduction = this.environment === 'production';
    const deployCommand = isProduction ? 'vercel --prod' : 'vercel';
    
    await this.execCommand(deployCommand, 'Vercel deployment');
    this.log('Successfully deployed to Vercel!', 'success');
  }

  async deployToNetlify() {
    this.log('Deploying to Netlify...', 'deploy');
    
    const isProduction = this.environment === 'production';
    const deployCommand = isProduction 
      ? 'netlify deploy --prod --dir=.next' 
      : 'netlify deploy --dir=.next';
    
    await this.execCommand(deployCommand, 'Netlify deployment');
    this.log('Successfully deployed to Netlify!', 'success');
  }

  async deployToAWS() {
    this.log('Deploying to AWS...', 'deploy');
    
    // Build Docker image
    await this.execCommand('docker build -t tfmshop .', 'Building Docker image');
    
    // Tag for ECR
    const awsAccountId = process.env.AWS_ACCOUNT_ID;
    const region = process.env.AWS_REGION || 'us-east-1';
    
    if (!awsAccountId) {
      throw new Error('AWS_ACCOUNT_ID environment variable is required');
    }
    
    const ecrUri = `${awsAccountId}.dkr.ecr.${region}.amazonaws.com/tfmshop`;
    
    await this.execCommand(`docker tag tfmshop:latest ${ecrUri}:latest`, 'Tagging Docker image');
    
    // Push to ECR
    await this.execCommand(`aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${ecrUri}`, 'ECR login');
    await this.execCommand(`docker push ${ecrUri}:latest`, 'Pushing to ECR');
    
    // Deploy to ECS or EKS (simplified example)
    await this.execCommand('aws ecs update-service --cluster tfmshop --service tfmshop-service --force-new-deployment', 'Updating ECS service');
    
    this.log('Successfully deployed to AWS!', 'success');
  }

  async deployWithDocker() {
    this.log('Building Docker image...', 'deploy');
    
    await this.execCommand('docker build -t tfmshop:latest .', 'Building Docker image');
    
    if (this.environment === 'production') {
      await this.execCommand('docker-compose -f docker-compose.prod.yml up -d', 'Starting production containers');
    } else {
      await this.execCommand('docker-compose up -d', 'Starting development containers');
    }
    
    this.log('Successfully deployed with Docker!', 'success');
  }

  async runPostDeploymentTasks() {
    this.log('Running post-deployment tasks...', 'info');
    
    // Run database migrations if needed
    if (process.env.DATABASE_URL) {
      try {
        await this.execCommand('npm run db:migrate:deploy', 'Running database migrations');
      } catch (error) {
        this.log('Database migration failed (may not be needed)', 'warning');
      }
    }
    
    // Warm up the application
    const appUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
    if (appUrl && !this.dryRun) {
      try {
        await this.execCommand(`curl -s ${appUrl}/api/health > /dev/null`, 'Warming up application');
      } catch (error) {
        this.log('Application warmup failed', 'warning');
      }
    }
    
    // Send deployment notification
    await this.sendDeploymentNotification();
  }

  async sendDeploymentNotification() {
    const deploymentInfo = {
      platform: this.platform,
      environment: this.environment,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown'
    };
    
    this.log(`Deployment completed: ${JSON.stringify(deploymentInfo)}`, 'success');
    
    // Here you could send to Slack, Discord, email, etc.
    if (process.env.SLACK_WEBHOOK_URL && !this.dryRun) {
      try {
        await this.execCommand(
          `curl -X POST -H 'Content-type: application/json' --data '{"text":"🚀 TFM Shop deployed to ${this.environment} on ${this.platform}"}' ${process.env.SLACK_WEBHOOK_URL}`,
          'Sending Slack notification'
        );
      } catch (error) {
        this.log('Failed to send Slack notification', 'warning');
      }
    }
  }

  async deploy() {
    const startTime = Date.now();
    
    try {
      this.log(`Starting deployment to ${this.platform} (${this.environment})`, 'deploy');
      
      if (this.dryRun) {
        this.log('DRY RUN MODE - No actual changes will be made', 'warning');
      }
      
      // Pre-deployment checks
      if (!this.skipChecks) {
        await this.runPreDeploymentChecks();
      }
      
      // Build application
      await this.buildApplication();
      
      // Deploy based on platform
      switch (this.platform) {
        case 'vercel':
          await this.deployToVercel();
          break;
        case 'netlify':
          await this.deployToNetlify();
          break;
        case 'aws':
          await this.deployToAWS();
          break;
        case 'docker':
          await this.deployWithDocker();
          break;
        default:
          throw new Error(`Unsupported platform: ${this.platform}`);
      }
      
      // Post-deployment tasks
      await this.runPostDeploymentTasks();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.log(`Deployment completed successfully in ${duration}s!`, 'success');
      
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--platform':
        options.platform = args[++i];
        break;
      case '--environment':
        options.environment = args[++i];
        break;
      case '--skip-checks':
        options.skipChecks = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        console.log(`
Usage: node scripts/deploy.js [options]

Options:
  --platform <platform>     Deployment platform (vercel, netlify, aws, docker)
  --environment <env>       Environment (production, staging, development)
  --skip-checks            Skip pre-deployment checks
  --dry-run                Show what would be done without executing
  --help                   Show this help message

Examples:
  node scripts/deploy.js --platform vercel --environment production
  node scripts/deploy.js --platform docker --environment staging --dry-run
        `);
        process.exit(0);
        break;
    }
  }
  
  const deployer = new ProductionDeployer(options);
  deployer.deploy().catch(console.error);
}

module.exports = ProductionDeployer;
