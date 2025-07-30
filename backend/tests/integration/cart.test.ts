import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/entities/User';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { Cart } from '../../src/entities/Cart';
import { CartItem } from '../../src/entities/CartItem';
import { JwtUtils } from '../../src/utils/jwt';
import app from '../../src/app';

describe('Cart Integration Tests', () => {
  let testUser: User;
  let testProduct: Product;
  let testCategory: Category;
  let authToken: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    // Clean up database
    await AppDataSource.getRepository(CartItem).delete({});
    await AppDataSource.getRepository(Cart).delete({});
    await AppDataSource.getRepository(Product).delete({});
    await AppDataSource.getRepository(Category).delete({});
    await AppDataSource.getRepository(User).delete({});

    // Create test category
    const categoryRepository = AppDataSource.getRepository(Category);
    testCategory = categoryRepository.create({
      name: 'Test Category',
      description: 'Test category description',
      slug: 'test-category',
    });
    testCategory = await categoryRepository.save(testCategory);

    // Create test product
    const productRepository = AppDataSource.getRepository(Product);
    testProduct = productRepository.create({
      title: 'Test Product',
      description: 'Test product description',
      slug: 'test-product',
      price: 29.99,
      stockQuantity: 10,
      categoryId: testCategory.id,
      images: ['test-image.jpg'],
      isActive: true,
      inStock: true,
    });
    testProduct = await productRepository.save(testProduct);

    // Create test user
    const userRepository = AppDataSource.getRepository(User);
    testUser = userRepository.create({
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.CUSTOMER,
      isActive: true,
    });
    testUser = await userRepository.save(testUser);

    // Generate auth token
    authToken = JwtUtils.generateAccessToken(testUser);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('GET /api/cart', () => {
    it('should return empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.totalItems).toBe(0);
      expect(response.body.data.subtotal).toBe(0);
      expect(response.body.data.isEmpty).toBe(true);
    });

    it('should return cart with items', async () => {
      // Add item to cart first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        })
        .expect(200);

      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe(testProduct.id);
      expect(response.body.data.items[0].quantity).toBe(2);
      expect(response.body.data.totalItems).toBe(2);
      expect(response.body.data.subtotal).toBe(59.98);
      expect(response.body.data.isEmpty).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe(testProduct.id);
      expect(response.body.data.items[0].quantity).toBe(2);
      expect(response.body.data.items[0].price).toBe(29.99);
      expect(response.body.data.totalItems).toBe(2);
      expect(response.body.data.subtotal).toBe(59.98);
    });

    it('should update quantity if item already exists', async () => {
      // Add item first time
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        })
        .expect(200);

      // Add same item again
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 3,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].quantity).toBe(5); // 2 + 3
      expect(response.body.data.totalItems).toBe(5);
    });

    it('should reject invalid quantity', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 0,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject non-existent product', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 1,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should reject quantity exceeding stock', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 15, // More than stock quantity (10)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .send({
          productId: testProduct.id,
          quantity: 1,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('PUT /api/cart/items/:itemId', () => {
    let cartItem: CartItem;

    beforeEach(async () => {
      // Add item to cart first
      const addResponse = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        });

      cartItem = addResponse.body.data.items[0];
    });

    it('should update cart item quantity', async () => {
      const response = await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 5,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].quantity).toBe(5);
      expect(response.body.data.totalItems).toBe(5);
    });

    it('should reject invalid quantity', async () => {
      const response = await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: -1,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject non-existent cart item', async () => {
      const response = await request(app)
        .put('/api/cart/items/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 3,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CART_ITEM_NOT_FOUND');
    });

    it('should reject quantity exceeding stock', async () => {
      const response = await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 15, // More than stock quantity (10)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_STOCK');
    });
  });

  describe('DELETE /api/cart/items/:itemId', () => {
    let cartItem: CartItem;

    beforeEach(async () => {
      // Add item to cart first
      const addResponse = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        });

      cartItem = addResponse.body.data.items[0];
    });

    it('should remove cart item', async () => {
      const response = await request(app)
        .delete(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.totalItems).toBe(0);
      expect(response.body.data.isEmpty).toBe(true);
    });

    it('should reject non-existent cart item', async () => {
      const response = await request(app)
        .delete('/api/cart/items/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CART_ITEM_NOT_FOUND');
    });
  });

  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
      // Add items to cart first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        });
    });

    it('should clear entire cart', async () => {
      const response = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.totalItems).toBe(0);
      expect(response.body.data.isEmpty).toBe(true);
    });
  });

  describe('GET /api/cart/totals', () => {
    beforeEach(async () => {
      // Add items to cart first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        });
    });

    it('should return cart totals', async () => {
      const response = await request(app)
        .get('/api/cart/totals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subtotal).toBe(59.98);
      expect(response.body.data.totalItems).toBe(2);
      expect(response.body.data.itemCount).toBe(1);
    });
  });

  describe('GET /api/cart/validate', () => {
    beforeEach(async () => {
      // Add items to cart first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        });
    });

    it('should validate cart contents', async () => {
      const response = await request(app)
        .get('/api/cart/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.errors).toHaveLength(0);
      expect(response.body.data.unavailableItems).toHaveLength(0);
      expect(response.body.data.priceChanges).toHaveLength(0);
    });

    it('should detect out of stock items', async () => {
      // Update product to be out of stock
      const productRepository = AppDataSource.getRepository(Product);
      testProduct.inStock = false;
      testProduct.stockQuantity = 0;
      await productRepository.save(testProduct);

      const response = await request(app)
        .get('/api/cart/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.errors.length).toBeGreaterThan(0);
      expect(response.body.data.unavailableItems).toContain(testProduct.id);
    });
  });

  describe('POST /api/cart/update-prices', () => {
    beforeEach(async () => {
      // Add items to cart first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2,
        });
    });

    it('should update cart prices', async () => {
      // Update product price
      const productRepository = AppDataSource.getRepository(Product);
      testProduct.price = 39.99;
      await productRepository.save(testProduct);

      const response = await request(app)
        .post('/api/cart/update-prices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].price).toBe(39.99);
      expect(response.body.data.subtotal).toBe(79.98); // 39.99 * 2
    });
  });
});