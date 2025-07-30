import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';

describe('Product-Category Integration', () => {
  describe('Entity Relationships', () => {
    it('should properly link product to category', () => {
      // Create a category
      const category = new Category();
      category.id = '123e4567-e89b-12d3-a456-426614174000';
      category.name = 'Electronics';
      category.slug = 'electronics';
      category.description = 'Electronic devices and accessories';
      category.isActive = true;
      category.sortOrder = 1;

      // Create a product
      const product = new Product();
      product.id = '987fcdeb-51d2-43a1-b123-456789abcdef';
      product.title = 'iPhone 15 Pro';
      product.description = 'Latest iPhone with advanced features';
      product.slug = 'iphone-15-pro';
      product.price = 999.99;
      product.originalPrice = 1099.99;
      product.currency = 'USD';
      product.stockQuantity = 50;
      product.rating = 4.5;
      product.reviewCount = 128;
      product.isActive = true;
      product.inStock = true;
      product.categoryId = category.id;
      product.category = category;

      // Verify the relationship
      expect(product.category).toBe(category);
      expect(product.categoryId).toBe(category.id);
      expect(product.category.name).toBe('Electronics');
    });

    it('should support category with multiple products', () => {
      // Create a category
      const category = new Category();
      category.id = '123e4567-e89b-12d3-a456-426614174000';
      category.name = 'Smartphones';
      category.slug = 'smartphones';
      category.products = [];

      // Create multiple products
      const product1 = new Product();
      product1.id = '111fcdeb-51d2-43a1-b123-456789abcdef';
      product1.title = 'iPhone 15 Pro';
      product1.slug = 'iphone-15-pro';
      product1.description = 'Latest iPhone';
      product1.price = 999.99;
      product1.categoryId = category.id;
      product1.category = category;

      const product2 = new Product();
      product2.id = '222fcdeb-51d2-43a1-b123-456789abcdef';
      product2.title = 'Samsung Galaxy S24';
      product2.slug = 'samsung-galaxy-s24';
      product2.description = 'Latest Samsung flagship';
      product2.price = 899.99;
      product2.categoryId = category.id;
      product2.category = category;

      // Add products to category
      category.products.push(product1, product2);

      // Verify the relationships
      expect(category.products).toHaveLength(2);
      expect(category.products[0].title).toBe('iPhone 15 Pro');
      expect(category.products[1].title).toBe('Samsung Galaxy S24');
      expect(category.products[0].category).toBe(category);
      expect(category.products[1].category).toBe(category);
    });

    it('should support nested categories with products', () => {
      // Create parent category
      const parentCategory = new Category();
      parentCategory.id = '111e4567-e89b-12d3-a456-426614174000';
      parentCategory.name = 'Electronics';
      parentCategory.slug = 'electronics';
      parentCategory.children = [];

      // Create child category
      const childCategory = new Category();
      childCategory.id = '222e4567-e89b-12d3-a456-426614174000';
      childCategory.name = 'Smartphones';
      childCategory.slug = 'smartphones';
      childCategory.parentId = parentCategory.id;
      childCategory.parent = parentCategory;
      childCategory.products = [];

      // Add child to parent
      parentCategory.children.push(childCategory);

      // Create product in child category
      const product = new Product();
      product.id = '333fcdeb-51d2-43a1-b123-456789abcdef';
      product.title = 'iPhone 15 Pro';
      product.slug = 'iphone-15-pro';
      product.description = 'Latest iPhone';
      product.price = 999.99;
      product.categoryId = childCategory.id;
      product.category = childCategory;

      // Add product to child category
      childCategory.products.push(product);

      // Verify the nested relationships
      expect(parentCategory.children).toHaveLength(1);
      expect(parentCategory.children[0].name).toBe('Smartphones');
      expect(childCategory.parent).toBe(parentCategory);
      expect(childCategory.products).toHaveLength(1);
      expect(childCategory.products[0].title).toBe('iPhone 15 Pro');
      expect(product.category.parent).toBe(parentCategory);
    });
  });

  describe('Business Logic', () => {
    it('should calculate product sale information correctly', () => {
      const product = new Product();
      product.price = 799.99;
      product.originalPrice = 999.99;

      expect(product.isOnSale).toBe(true);
      expect(product.discountPercentage).toBe(20);
    });

    it('should handle product images correctly', () => {
      const product = new Product();
      product.images = [
        'https://example.com/main.jpg',
        'https://example.com/alt1.jpg',
        'https://example.com/alt2.jpg'
      ];

      expect(product.mainImage).toBe('https://example.com/main.jpg');
    });

    it('should handle product specifications and variants', () => {
      const product = new Product();
      product.specifications = {
        display: '6.1-inch Super Retina XDR',
        processor: 'A17 Pro chip',
        storage: '128GB'
      };
      product.variants = {
        colors: ['Black', 'White', 'Blue'],
        storage: ['128GB', '256GB', '512GB']
      };

      expect(product.specifications.display).toBe('6.1-inch Super Retina XDR');
      expect(product.variants.colors).toContain('Black');
    });
  });

  describe('Data Validation', () => {
    it('should handle required fields correctly', () => {
      const category = new Category();
      category.name = 'Electronics';
      category.slug = 'electronics';

      const product = new Product();
      product.title = 'Test Product';
      product.description = 'Test Description';
      product.slug = 'test-product';
      product.price = 99.99;
      product.categoryId = '123e4567-e89b-12d3-a456-426614174000';

      // These should not throw errors as validation happens at database level
      expect(category.name).toBe('Electronics');
      expect(product.title).toBe('Test Product');
      expect(product.price).toBe(99.99);
    });

    it('should handle optional fields correctly', () => {
      const product = new Product();
      product.title = 'Test Product';
      product.description = 'Test Description';
      product.slug = 'test-product';
      product.price = 99.99;
      product.categoryId = '123e4567-e89b-12d3-a456-426614174000';

      // Optional fields should be undefined initially
      expect(product.originalPrice).toBeUndefined();
      expect(product.badge).toBeUndefined();
      expect(product.brand).toBeUndefined();

      // Should be able to set optional fields
      product.originalPrice = 129.99;
      product.badge = 'Sale';
      product.brand = 'TestBrand';

      expect(product.originalPrice).toBe(129.99);
      expect(product.badge).toBe('Sale');
      expect(product.brand).toBe('TestBrand');
    });
  });
});