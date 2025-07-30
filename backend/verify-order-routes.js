const express = require('express');
const app = require('./dist/app').default;

console.log('🔍 Verifying order routes...');

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

// Filter for order routes
const orderRoutes = routes.filter(route => 
  route.path.includes('/api/orders') || route.path.includes('orders')
);

console.log('\n📋 Found order routes:');
if (orderRoutes.length === 0) {
  console.log('❌ No order routes found');
} else {
  orderRoutes.forEach(route => {
    console.log(`  ✓ ${route.methods.join(', ').toUpperCase()} ${route.path}`);
  });
}

// Check for expected routes
const expectedRoutes = [
  'POST /api/orders',
  'GET /api/orders',
  'GET /api/orders/statistics',
  'GET /api/orders/:orderId',
  'POST /api/orders/:orderId/cancel',
  'PUT /api/orders/:orderId/status',
];

console.log('\n🎯 Expected routes:');
expectedRoutes.forEach(expectedRoute => {
  const [method, path] = expectedRoute.split(' ');
  const found = orderRoutes.some(route => 
    route.methods.includes(method.toLowerCase()) && 
    (route.path === path || route.path.includes(path.replace(':orderId', '')))
  );
  
  if (found) {
    console.log(`  ✅ ${expectedRoute}`);
  } else {
    console.log(`  ❌ ${expectedRoute} - NOT FOUND`);
  }
});

console.log('\n✅ Order routes verification completed!');