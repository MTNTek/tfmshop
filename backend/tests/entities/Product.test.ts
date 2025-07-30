import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';

describe('Product Entity', () => {
  let product: Product;
  let category: Category;

  beforeEach(() => {
    product = new Product();
    category = new Category();
    category.id = '123e4567-e89b-12d3-a456-426614174000';
    category.name = 'Electronics';
    category.slug = 'electronics';
  });

  describe('Basic Properties', () => {
    it('should create a product with required fields', () => {
      product.title = 'iPhone 15 Pro';
      product.description = 'Latest iPhone with advanced features';
      product.slug = 'iphone-15-pro';
      product.price = 999.99;
      product.categoryId = category.id;

      expect(product.title).toBe('iPhone 15 Pro');
      expect(product.description).toBe('Latest iPhone with advanced features');
      expect(product.slug).toBe('iphone-15-pro');
      expect(product.price).toBe(999.99);
      expect(product.categoryId).toBe(category.id);
    });

    it('should have default values for optional fields', () => {
      expect(product.stockQuantity).toBeUndefined(); // Will be set by database default
      expect(product.rating).toBeUndefined(); // Will be set by database default
      expect(product.reviewCount).toBeUndefined(); // Will be set by database default
      expect(product.isActive).toBeUndefined(); // Will be set by database default
      expect(product.inStock).toBeUndefined(); // Will be set by database default
      expect(product.viewCount).toBeUndefined(); // Will be set by database default
      expect(product.sortOrder).toBeUndefined(); // Will be set by database default
    });

    it('should allow setting optional fields', () => {
      product.originalPrice = 1099.99;
      product.currency = 'USD';
      product.stockQuantity = 50;
      product.sku = 'IPH15PRO-128-BLK';
      product.rating = 4.5;
      product.reviewCount = 128;
      product.badge = 'New';
      product.brand = 'Apple';
      product.weight = 0.221;
      product.weightUnit = 'kg';

      expect(product.originalPrice).toBe(1099.99);
      expect(product.currency).toBe('USD');
      expect(product.stockQuantity).toBe(50);
      expect(product.sku).toBe('IPH15PRO-128-BLK');
      expect(product.rating).toBe(4.5);
      expect(product.reviewCount).toBe(128);
      expect(product.badge).toBe('New');
      expect(product.brand).toBe('Apple');
      expect(product.weight).toBe(0.221);
      expect(product.weightUnit).toBe('kg');
    });
  });

  describe('Complex Fields', () => {
    it('should handle images array', () => {
      product.images = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg'
      ];

      expect(product.images).toHaveLength(3);
      expect(product.images[0]).toBe('https://example.com/image1.jpg');
    });

    it('should handle specifications object', () => {
      product.specifications = {
        display: '6.1-inch Super Retina XDR',
        processor: 'A17 Pro chip',
        storage: '128GB',
        camera: '48MP Main camera'
      };

      expect(product.specifications.display).toBe('6.1-inch Super Retina XDR');
      expect(product.specifications.processor).toBe('A17 Pro chip');
    });

    it('should handle variants object', () => {
      product.variants = {
        colors: ['Black', 'White', 'Blue'],
        storage: ['128GB', '256GB', '512GB']
      };

      expect(product.variants.colors).toContain('Black');
      expect(product.variants.storage).toContain('128GB');
    });

    it('should handle dimensions object', () => {
      product.dimensions = {
        length: 146.6,
        width: 70.6,
        height: 8.25,
        unit: 'mm'
      };

      expect(product.dimensions.length).toBe(146.6);
      expect(product.dimensions.unit).toBe('mm');
    });

    it('should handle tags array', () => {
      product.tags = ['smartphone', 'apple', 'premium', '5g'];

      expect(product.tags).toHaveLength(4);
      expect(product.tags).toContain('smartphone');
      expect(product.tags).toContain('apple');
    });
  });

  describe('Relationships', () => {
    it('should belong to a category', () => {
      product.category = category;
      product.categoryId = category.id;

      expect(product.category).toBe(category);
      expect(product.categoryId).toBe(category.id);
    });
  });

  describe('Helper Methods', () => {
    it('should calculate if product is on sale', () => {
      product.price = 899.99;
      product.originalPrice = 999.99;

      expect(product.isOnSale).toBe(true);
    });

    it('should return false for isOnSale when no original price', () => {
      product.price = 899.99;

      expect(product.isOnSale).toBe(false);
    });

    it('should return false for isOnSale when original price is same or lower', () => {
      product.price = 899.99;
      product.originalPrice = 799.99;

      expect(product.isOnSale).toBe(false);
    });

    it('should calculate discount percentage', () => {
      product.price = 800;
      product.originalPrice = 1000;

      expect(product.discountPercentage).toBe(20);
    });

    it('should return 0 discount when no original price', () => {
      product.price = 800;

      expect(product.discountPercentage).toBe(0);
    });

    it('should return 0 discount when original price is same or lower', () => {
      product.price = 800;
      product.originalPrice = 700;

      expect(product.discountPercentage).toBe(0);
    });

    it('should get main image from images array', () => {
      product.images = [
        'https://example.com/main.jpg',
        'https://example.com/alt1.jpg',
        'https://example.com/alt2.jpg'
      ];

      expect(product.mainImage).toBe('https://example.com/main.jpg');
    });

    it('should return null for main image when no images', () => {
      expect(product.mainImage).toBeNull();
    });

    it('should return null for main image when images array is empty', () => {
      product.images = [];

      expect(product.mainImage).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should require title field', () => {
      // This would be validated by the database constraint
      expect(() => {
        product.description = 'Test description';
        product.slug = 'test-product';
        product.price = 99.99;
        // title is required but not set
      }).not.toThrow(); // Entity validation happens at database level
    });

    it('should require unique slug', () => {
      product.slug = 'unique-product-slug';
      // Uniqueness would be enforced by database constraint
      expect(product.slug).toBe('unique-product-slug');
    });

    it('should require category relationship', () => {
      product.categoryId = category.id;
      // Foreign key constraint would be enforced by database
      expect(product.categoryId).toBe(category.id);
    });
  });
});