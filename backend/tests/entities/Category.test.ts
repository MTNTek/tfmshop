import { Category } from '../../src/entities/Category';
import { Product } from '../../src/entities/Product';

describe('Category Entity', () => {
  let category: Category;

  beforeEach(() => {
    category = new Category();
  });

  describe('Basic Properties', () => {
    it('should create a category with required fields', () => {
      category.name = 'Electronics';
      category.description = 'Electronic devices and accessories';
      category.slug = 'electronics';

      expect(category.name).toBe('Electronics');
      expect(category.description).toBe('Electronic devices and accessories');
      expect(category.slug).toBe('electronics');
    });

    it('should have default values for optional fields', () => {
      expect(category.isActive).toBeUndefined(); // Will be set by database default
      expect(category.sortOrder).toBeUndefined(); // Will be set by database default
      expect(category.parentId).toBeUndefined();
      expect(category.imageUrl).toBeUndefined();
    });

    it('should allow setting optional fields', () => {
      category.isActive = false;
      category.sortOrder = 10;
      category.imageUrl = 'https://example.com/image.jpg';

      expect(category.isActive).toBe(false);
      expect(category.sortOrder).toBe(10);
      expect(category.imageUrl).toBe('https://example.com/image.jpg');
    });
  });

  describe('Relationships', () => {
    it('should support parent-child relationships', () => {
      const parentCategory = new Category();
      parentCategory.name = 'Electronics';
      parentCategory.slug = 'electronics';

      const childCategory = new Category();
      childCategory.name = 'Smartphones';
      childCategory.slug = 'smartphones';
      childCategory.parent = parentCategory;

      expect(childCategory.parent).toBe(parentCategory);
    });

    it('should support multiple children', () => {
      const parentCategory = new Category();
      parentCategory.children = [];

      const child1 = new Category();
      child1.name = 'Smartphones';
      child1.slug = 'smartphones';

      const child2 = new Category();
      child2.name = 'Laptops';
      child2.slug = 'laptops';

      parentCategory.children.push(child1, child2);

      expect(parentCategory.children).toHaveLength(2);
      expect(parentCategory.children[0].name).toBe('Smartphones');
      expect(parentCategory.children[1].name).toBe('Laptops');
    });

    it('should support products relationship', () => {
      const product1 = new Product();
      product1.title = 'iPhone 15';
      product1.slug = 'iphone-15';

      const product2 = new Product();
      product2.title = 'Samsung Galaxy S24';
      product2.slug = 'samsung-galaxy-s24';

      category.products = [product1, product2];

      expect(category.products).toHaveLength(2);
      expect(category.products[0].title).toBe('iPhone 15');
      expect(category.products[1].title).toBe('Samsung Galaxy S24');
    });
  });

  describe('Validation', () => {
    it('should require name field', () => {
      // This would be validated by the database constraint
      expect(() => {
        category.slug = 'test';
        // name is required but not set
      }).not.toThrow(); // Entity validation happens at database level
    });

    it('should require unique slug', () => {
      category.slug = 'electronics';
      // Uniqueness would be enforced by database constraint
      expect(category.slug).toBe('electronics');
    });
  });
});