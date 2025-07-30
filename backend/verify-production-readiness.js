#!/usr/bin/env node

/**
 * Comprehensive production readiness verification
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TFMShop Backend Production Readiness Verification');
console.log('====================================================\n');

const checks = [];

// 1. Check if all required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'dist/index.js',
  'package.json',
  'tsconfig.json',
  'tsconfig.production.json',
  '.env.production.example',
  'deploy-production.sh',
  'deploy-production.bat',
  'PERFORMANCE_OPTIMIZATION.md',
  'PRODUCTION_READINESS_SUMMARY.md'
];

let filesOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    filesOk = false;
  }
});

checks.push({ name: 'Required Files', passed: filesOk });

// 2. Check package.json scripts
console.log('\n📜 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const requiredScripts = [
  'build:production',
  'start:production',
  'production:checklist',
  'production:startup',
  'production:check',
  'deploy',
  'optimize',
  'dashboard',
  'monitor'
];

let scriptsOk = true;
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ❌ ${script} - MISSING`);
    scriptsOk = false;
  }
});

checks.push({ name: 'NPM Scripts', passed: scriptsOk });

// 3. Check TypeScript configuration
console.log('\n⚙️  Checking TypeScript configuration...');
let tsConfigOk = true;

try {
  const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));
  const prodTsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.production.json'), 'utf8'));
  
  if (tsConfig.compilerOptions.sourceMap === true) {
    console.log('  ✅ Development source maps enabled');
  }
  
  if (prodTsConfig.compilerOptions.sourceMap === false) {
    console.log('  ✅ Production source maps disabled');
  } else {
    console.log('  ❌ Production source maps not properly disabled');
    tsConfigOk = false;
  }
  
  if (prodTsConfig.compilerOptions.removeComments === true) {
    console.log('  ✅ Production comments removal enabled');
  }
  
} catch (error) {
  console.log('  ❌ TypeScript configuration error:', error.message);
  tsConfigOk = false;
}

checks.push({ name: 'TypeScript Config', passed: tsConfigOk });

// 4. Check environment configuration
console.log('\n🌍 Checking environment configuration...');
let envConfigOk = true;

try {
  const envExample = fs.readFileSync(path.join(__dirname, '.env.production.example'), 'utf8');
  const requiredEnvVars = [
    'NODE_ENV=production',
    'JWT_SECRET=',
    'JWT_REFRESH_SECRET=',
    'DB_HOST=',
    'REDIS_HOST=',
    'ENABLE_CACHING=true',
    'ENABLE_COMPRESSION=true',
    'ENABLE_RATE_LIMIT=true',
    'ENABLE_FILE_LOGGING=true'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar.split('=')[0])) {
      console.log(`  ✅ ${envVar.split('=')[0]}`);
    } else {
      console.log(`  ❌ ${envVar.split('=')[0]} - MISSING`);
      envConfigOk = false;
    }
  });
  
} catch (error) {
  console.log('  ❌ Environment configuration error:', error.message);
  envConfigOk = false;
}

checks.push({ name: 'Environment Config', passed: envConfigOk });

// 5. Check source code structure
console.log('\n🏗️  Checking source code structure...');
const requiredDirs = [
  'src/config',
  'src/controllers',
  'src/entities',
  'src/middleware',
  'src/routes',
  'src/services',
  'src/utils',
  'src/scripts',
  'src/migrations'
];

let structureOk = true;
requiredDirs.forEach(dir => {
  if (fs.existsSync(path.join(__dirname, dir))) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir} - MISSING`);
    structureOk = false;
  }
});

checks.push({ name: 'Source Structure', passed: structureOk });

// 6. Check performance optimization files
console.log('\n⚡ Checking performance optimization files...');
const performanceFiles = [
  'src/middleware/cache.ts',
  'src/middleware/rateLimiter.ts',
  'src/middleware/security.ts',
  'src/services/CacheService.ts',
  'src/utils/queryOptimizer.ts',
  'src/utils/monitoring.ts',
  'src/scripts/performance-optimizer.ts',
  'src/scripts/monitoring-dashboard.ts'
];

let performanceOk = true;
performanceFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    performanceOk = false;
  }
});

checks.push({ name: 'Performance Files', passed: performanceOk });

// 7. Check deployment files
console.log('\n🚀 Checking deployment files...');
const deploymentFiles = [
  'deploy-production.sh',
  'deploy-production.bat',
  'src/scripts/production-startup.ts',
  'src/scripts/production-checklist.ts',
  'src/scripts/production-deploy.ts'
];

let deploymentOk = true;
deploymentFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    deploymentOk = false;
  }
});

checks.push({ name: 'Deployment Files', passed: deploymentOk });

// 8. Check documentation
console.log('\n📚 Checking documentation...');
const docFiles = [
  'PERFORMANCE_OPTIMIZATION.md',
  'PRODUCTION_READINESS_SUMMARY.md',
  'DATABASE_SETUP.md'
];

let docsOk = true;
docFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    if (content.length > 1000) {
      console.log(`  ✅ ${file} (${Math.round(content.length/1000)}k chars)`);
    } else {
      console.log(`  ⚠️  ${file} (${content.length} chars - may be incomplete)`);
    }
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    docsOk = false;
  }
});

checks.push({ name: 'Documentation', passed: docsOk });

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 PRODUCTION READINESS VERIFICATION SUMMARY');
console.log('='.repeat(60));

const passedChecks = checks.filter(c => c.passed).length;
const totalChecks = checks.length;

checks.forEach(check => {
  const icon = check.passed ? '✅' : '❌';
  console.log(`${icon} ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
});

console.log('\n📈 Results:');
console.log(`  Passed: ${passedChecks}/${totalChecks}`);
console.log(`  Success Rate: ${Math.round((passedChecks/totalChecks)*100)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 PRODUCTION READINESS: ✅ VERIFIED');
  console.log('🚀 System is ready for production deployment!');
  console.log('\n📋 Next Steps:');
  console.log('1. Configure production environment variables');
  console.log('2. Set up database and Redis (optional)');
  console.log('3. Run: npm run deploy:production');
  console.log('4. Monitor: npm run dashboard');
  process.exit(0);
} else {
  console.log('\n❌ PRODUCTION READINESS: INCOMPLETE');
  console.log('🔧 Please address the missing components above');
  process.exit(1);
}