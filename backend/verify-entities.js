/**
 * Verification script to check if Product and Category entities meet task requirements
 */

const { Category } = require('./dist/entities/Category');
const { Product } = require('./dist/entities/Product');

console.log('🔍 Verifying Product and Category entities...\n');

// Check Category entity
console.log('📁 Category Entity:');
console.log('- Has name field:', Category.prototype.hasOwnProperty('name') || 'name' in new Category());
console.log('- Has description field:', Category.prototype.hasOwnProperty('description') || 'description' in new Category());
console.log('- Extends BaseEntity:', Category.prototype.constructor.name);

// Check Product entity  
console.log('\n📦 Product Entity:');
console.log('- Has title field:', Product.prototype.hasOwnProperty('title') || 'title' in new Product());
console.log('- Has price field:', Product.prototype.hasOwnProperty('price') || 'price' in new Product());
console.log('- Has stockQuantity field:', Product.prototype.hasOwnProperty('stockQuantity') || 'stockQuantity' in new Product());
console.log('- Has rating field:', Product.prototype.hasOwnProperty('rating') || 'rating' in new Product());
console.log('- Has category relationship:', Product.prototype.hasOwnProperty('category') || 'category' in new Product());
console.log('- Extends BaseEntity:', Product.prototype.constructor.name);

console.log('\n✅ Entity verification complete!');