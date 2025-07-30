const express = require('express');
const app = require('./dist/app').default;

console.log('🔍 Verifying user routes...');

// Get the router from the app
const router = app._router;

if (!router) {
  console.log('❌ No router found in app');
  process.exit(1);
}

// Check if routes are registered
const routes = [];
function extractRoutes(middleware, basePath = '') {
  if (middleware.route) {
    // Direct route
    const methods = Object.keys(middleware.route.methods);
    routes.push({
      path: basePath + middleware.route.path,
      methods: methods,
    });
  } else if (middleware.name === 'router') {
    // Nested router
    const routerPath = middleware.regexp.source
      .replace('\\', '')
      .replace('(?=\\/|$)', '')
      .replace('^', '');
    
    if (middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach(layer => {
        extractRoutes(layer, basePath + routerPath);
      });
    }
  }
}

if (router.stack) {
  router.stack.forEach(layer => {
    extractRoutes(layer);
  });
}

// Filter for user routes
const userRoutes = routes.filter(route => 
  route.path.includes('/api/users') || route.path.includes('users')
);

console.log('\n📋 Found user routes:');
if (userRoutes.length === 0) {
  console.log('❌ No user routes found');
} else {
  userRoutes.forEach(route => {
    console.log(`  ✓ ${route.methods.join(', ').toUpperCase()} ${route.path}`);
  });
}

// Check for expected routes
const expectedRoutes = [
  'GET /api/users/profile',
  'PUT /api/users/profile',
  'GET /api/users/statistics',
  'GET /api/users/addresses',
  'POST /api/users/addresses',
  'GET /api/users/addresses/:addressId',
  'PUT /api/users/addresses/:addressId',
  'DELETE /api/users/addresses/:addressId',
  'POST /api/users/addresses/:addressId/default',
];

console.log('\n🎯 Expected routes:');
expectedRoutes.forEach(expectedRoute => {
  const [method, path] = expectedRoute.split(' ');
  const found = userRoutes.some(route => 
    route.methods.includes(method.toLowerCase()) && 
    (route.path === path || route.path.includes(path.replace(':addressId', '')))
  );
  
  if (found) {
    console.log(`  ✅ ${expectedRoute}`);
  } else {
    console.log(`  ❌ ${expectedRoute} - NOT FOUND`);
  }
});

console.log('\n✅ User routes verification completed!');