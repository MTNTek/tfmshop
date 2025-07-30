#!/usr/bin/env node

/**
 * Test production readiness with production-like settings
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🧪 Testing Production Readiness');
console.log('================================\n');

// Copy production-ready environment
const envSource = path.join(__dirname, '.env.development.production-ready');
const envTarget = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envSource)) {
    fs.copyFileSync(envSource, envTarget);
    console.log('✅ Production-ready environment configuration loaded');
  } else {
    console.log('⚠️  Production-ready environment file not found, using defaults');
  }
} catch (error) {
  console.error('❌ Failed to load production-ready environment:', error.message);
  process.exit(1);
}

// Set environment variables
process.env.ENABLE_FILE_LOGGING = 'true';
process.env.LOG_LEVEL = 'info';

console.log('📝 File logging enabled');
console.log('📊 Log level set to info');

// Run production checklist
console.log('\n🔍 Running production readiness checklist...\n');

const checklist = spawn('npm', ['run', 'production:checklist'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

checklist.on('close', (code) => {
  console.log('\n' + '='.repeat(50));
  
  if (code === 0) {
    console.log('🎉 Production readiness test PASSED!');
    console.log('✅ System is ready for production deployment');
  } else if (code === 2) {
    console.log('⚠️  Production readiness test completed with WARNINGS');
    console.log('💡 System can be deployed but some optimizations are recommended');
  } else {
    console.log('❌ Production readiness test FAILED');
    console.log('🔧 Please address the issues before production deployment');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Review the checklist results above');
  console.log('2. Address any critical issues (❌)');
  console.log('3. Consider addressing warnings (⚠️) for optimal performance');
  console.log('4. Run deployment script: npm run deploy:production');
  console.log('5. Monitor the application: npm run dashboard');
  
  process.exit(code);
});

checklist.on('error', (error) => {
  console.error('❌ Failed to run production checklist:', error.message);
  process.exit(1);
});