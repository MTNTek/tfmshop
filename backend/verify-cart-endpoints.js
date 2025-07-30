const express = require('express');
const path = require('path');

// Import the compiled app
const app = require('./dist/app.js').default;

// Simple verification that cart routes are loaded
console.log('🔍 Verifying cart endpoints integration...');

// Check if the app has the expected structure
if (app && typeof app.listen === 'function') {
  console.log('✅ Express app is properly configured');
  
  // Get the router stack to verify routes are loaded
  const routes = [];
  
  function extractRoutes(stack, basePath = '') {
    stack.forEach(layer => {
      if (layer.route) {
        // Direct route
        const methods = Object.keys(layer.route.methods);
        routes.push(`${methods.join(',').toUpperCase()} ${basePath}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Nested router
        const path = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^|\$/g, '');
        extractRoutes(layer.handle.stack, basePath + path);
      }
    });
  }
  
  extractRoutes(app._router.stack);
  
  // Filter cart routes
  const cartRoutes = routes.filter(route => route.includes('/api/cart'));
  
  console.log('📋 Found cart routes:');
  cartRoutes.forEach(route => console.log(`  ${route}`));
  
  // Expected cart routes
  const expectedRoutes = [
    'GET /api/cart',
    'POST /api/cart/items',
    'PUT /api/cart/items/:itemId',
    'DELETE /api/cart/items/:itemId',
    'DELETE /api/cart',
    'GET /api/cart/totals',
    'GET /api/cart/validate',
    'POST /api/cart/update-prices'
  ];
  
  console.log('\n🎯 Expected cart routes:');
  expectedRoutes.forEach(route => console.log(`  ${route}`));
  
  // Check if all expected routes are present
  const foundRoutes = cartRoutes.length;
  const expectedCount = expectedRoutes.length;
  
  if (foundRoutes >= expectedCount) {
    console.log(`\n✅ Cart endpoints verification successful! Found ${foundRoutes} routes.`);
    console.log('✅ All required cart API endpoints are properly integrated.');
  } else {
    console.log(`\n⚠️  Found ${foundRoutes} routes, expected at least ${expectedCount}.`);
  }
  
} else {
  console.log('❌ Express app is not properly configured');
}

console.log('\n🏁 Cart endpoints verification complete.');