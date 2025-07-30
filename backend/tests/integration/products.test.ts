import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import app from '../../src/app';
import { User, UserRole } from '../../src/entities/User';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { AuthService } from '../../src/services/AuthService';

describe('Product API Integration Tests', () => {
  let adminUser: User;
  let customerUser: User;
  let adminToken: string;
  let customerToken: string;
  let category: Category;
  let testProduct: Product;

  beforeAll(async () => {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Clean up existing data
    await AppDataSource.getRepository(Product).delete({});
    await AppDataSource.getRepository(Category).delete({});
    await AppDataSource.getRepository(User).delete({});

    // Create test category
    const categoryRepo = AppDataSource.getRepository(Category);
    category = categoryRepo.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      isActive: true,
      sortOrder: 1,
    });
    await categoryRepo.save(category);

    // Create test users
    const authService = new AuthService();
    
    // Create admin user
    const adminData = {
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
    };
    const adminResponse = await authService.register(adminData);
    adminUser = adminResponse.user as any; // Cast to User for test purposes
    adminToken = adminResponse.tokens.accessToken;

    // Manually set admin role (since register creates customers by default)
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.update(adminUser.id, { role: UserRole.ADMIN });

    // Create customer user
    const customerData = {
      email: 'customer@test.com',
      password: 'password123',
      firstName: 'Customer',
      lastName: 'User',
    };
    const customerResponse = await authService.register(customerData);
    customerUser = customerResponse.user as any; // Cast to User for test purposes
    customerToken = customerResponse.tokens.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await AppDataSource.getRepository(Product).delete({});
    await AppDataSource.getRepository(Category).delete({});
    await AppDataSource.getRepository(User).delete({});
    
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Clean products before each test
      await AppDataSource.getRepository(Product).delete({});
      
      // Create test products
      const productRepo = AppDataSource.getRepository(Product);
      
      const products = [
        {
          title: 'iPhone 15 Pro',
          description: 'Latest iPhone with advanced features',
          slug: 'iphone-15-pro',
          price: 999.99,
          originalPrice: 1099.99,
          stockQuantity: 50,
          categoryId: category.id,
          brand: 'Apple',
          rating: 4.5,
          reviewCount: 128,
          isActive: true,
          inStock: true,
        },
        {
          title: 'Samsung Galaxy S24',
          description: 'Latest Samsung flagship smartphone',
          slug: 'samsung-galaxy-s24',
          price: 899.99,
          stockQuantity: 30,
          categoryId: category.id,
          brand: 'Samsung',
          rating: 4.3,
          reviewCount: 95,
          isActive: true,
          inStock: true,
        },
        {
          title: 'Out of Stock Product',
          description: 'This product is out of stock',
          slug: 'out-of-stock',
          price: 199.99,
          stockQuantity: 0,
          categoryId: category.id,
          brand: 'TestBrand',
          rating: 3.5,
          reviewCount: 10,
          isActive: true,
          inStock: false,
        },
      ];

      for (const productData of products) {
        const product = productRepo.create(productData);
        await productRepo.save(product);
      }
    });

    it('should return paginated products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('limit');
      expect(response.body.data).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get(`/api/products?categoryId=${category.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.products.forEach((product: any) => {
        expect(product.categoryId).toBe(category.id);
      });
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=800&maxPrice=1000')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(800);
        expect(product.price).toBeLessThanOrEqual(1000);
      });
    });

    it('should filter products by stock status', async () => {
      const response = await request(app)
        .get('/api/products?inStock=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.products.forEach((product: any) => {
        expect(product.inStock).toBe(true);
        expect(product.stockQuantity).toBeGreaterThan(0);
      });
    });

    it('should filter products by brand', async () => {
      const response = await request(app)
        .get('/api/products?brand=Apple')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.products.forEach((product: any) => {
        expect(product.brand.toLowerCase()).toBe('apple');
      });
    });

    it('should search products by text', async () => {
      const response = await request(app)
        .get('/api/products?search=iPhone')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBeGreaterThan(0);
      response.body.data.products.forEach((product: any) => {
        expect(
          product.title.toLowerCase().includes('iphone') ||
          product.description.toLowerCase().includes('iphone')
        ).toBe(true);
      });
    });

    it('should sort products by price ascending', async () => {
      const response = await request(app)
        .get('/api/products?sortField=price&sortDirection=ASC')
        .expect(200);

      expect(response.body.success).toBe(true);
      const products = response.body.data.products;
      for (let i = 1; i < products.length; i++) {
        expect(products[i].price).toBeGreaterThanOrEqual(products[i - 1].price);
      }
    });

    it('should sort products by price descending', async () => {
      const response = await request(app)
        .get('/api/products?sortField=price&sortDirection=DESC')
        .expect(200);

      expect(response.body.success).toBe(true);
      const products = response.body.data.products;
      for (let i = 1; i < products.length; i++) {
        expect(products[i].price).toBeLessThanOrEqual(products[i - 1].price);
      }
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBeLessThanOrEqual(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
    });
  });

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      // Clean products before each test
      await AppDataSource.getRepository(Product).delete({});
      
      // Create a test product
      const productRepo = AppDataSource.getRepository(Product);
      testProduct = productRepo.create({
        title: 'Test Product',
        description: 'Test product description',
        slug: 'test-product',
        price: 99.99,
        stockQuantity: 10,
        categoryId: category.id,
        isActive: true,
        inStock: true,
      });
      await productRepo.save(testProduct);
    });

    it('should return product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProduct.id);
      expect(response.body.data.title).toBe('Test Product');
      expect(response.body.data.category).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PRODUCT_ID');
    });
  });

  describe('GET /api/products/slug/:slug', () => {
    beforeEach(async () => {
      // Clean products before each test
      await AppDataSource.getRepository(Product).delete({});
      
      // Create a test product
      const productRepo = AppDataSource.getRepository(Product);
      testProduct = productRepo.create({
        title: 'Test Product',
        description: 'Test product description',
        slug: 'test-product-slug',
        price: 99.99,
        stockQuantity: 10,
        categoryId: category.id,
        isActive: true,
        inStock: true,
      });
      await productRepo.save(testProduct);
    });

    it('should return product by slug', async () => {
      const response = await request(app)
        .get('/api/products/slug/test-product-slug')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('test-product-slug');
      expect(response.body.data.title).toBe('Test Product');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/products/slug/non-existent-slug')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('GET /api/products/search', () => {
    beforeEach(async () => {
      // Clean products before each test
      await AppDataSource.getRepository(Product).delete({});
      
      // Create test products for search
      const productRepo = AppDataSource.getRepository(Product);
      const products = [
        {
          title: 'iPhone 15 Pro Max',
          description: 'Premium smartphone with advanced camera',
          slug: 'iphone-15-pro-max',
          price: 1199.99,
          stockQuantity: 25,
          categoryId: category.id,
          brand: 'Apple',
          isActive: true,
          inStock: true,
        },
        {
          title: 'MacBook Pro',
          description: 'Professional laptop for developers',
          slug: 'macbook-pro',
          price: 1999.99,
          stockQuantity: 15,
          categoryId: category.id,
          brand: 'Apple',
          isActive: true,
          inStock: true,
        },
      ];

      for (const productData of products) {
        const product = productRepo.create(productData);
        await productRepo.save(product);
      }
    });

    it('should search products by title', async () => {
      const response = await request(app)
        .get('/api/products/search?q=iPhone')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain('iPhone');
    });

    it('should search products by description', async () => {
      const response = await request(app)
        .get('/api/products/search?q=laptop')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].description).toContain('laptop');
    });

    it('should search products by brand', async () => {
      const response = await request(app)
        .get('/api/products/search?q=Apple')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((product: any) => {
        expect(product.brand).toBe('Apple');
      });
    });

    it('should return 400 when search term is missing', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_SEARCH_TERM');
    });

    it('should limit search results', async () => {
      const response = await request(app)
        .get('/api/products/search?q=Apple&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/products/featured', () => {
    beforeEach(async () => {
      // Clean products before each test
      await AppDataSource.getRepository(Product).delete({});
      
      // Create featured products
      const productRepo = AppDataSource.getRepository(Product);
      const products = [
        {
          title: 'Featured Product 1',
          description: 'High rated product',
          slug: 'featured-1',
          price: 299.99,
          stockQuantity: 20,
          categoryId: category.id,
          rating: 4.8,
          viewCount: 1000,
          isActive: true,
          inStock: true,
        },
        {
          title: 'Featured Product 2',
          description: 'Popular product',
          slug: 'featured-2',
          price: 199.99,
          stockQuantity: 15,
          categoryId: category.id,
          rating: 4.6,
          viewCount: 800,
          isActive: true,
          inStock: true,
        },
      ];

      for (const productData of products) {
        const product = productRepo.create(productData);
        await productRepo.save(product);
      }
    });

    it('should return featured products', async () => {
      const response = await request(app)
        .get('/api/products/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should limit featured products', async () => {
      const response = await request(app)
        .get('/api/products/featured?limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('POST /api/products (Admin Only)', () => {
    const validProductData = {
      title: 'New Test Product',
      description: 'A new test product',
      slug: 'new-test-product',
      price: 149.99,
      originalPrice: 199.99,
      stockQuantity: 100,
      categoryId: '',
      brand: 'TestBrand',
      specifications: {
        color: 'Black',
        size: 'Medium',
      },
    };

    beforeEach(() => {
      validProductData.categoryId = category.id;
    });

    it('should create product with admin token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(validProductData.title);
      expect(response.body.data.slug).toBe(validProductData.slug);
      expect(response.body.message).toBe('Product created successfully');
    });

    it('should reject creation without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(validProductData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject creation with customer token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validProductData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject creation with invalid data', async () => {
      const invalidData = { ...validProductData };
      delete (invalidData as any).title;

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject creation with duplicate slug', async () => {
      // Create first product
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData)
        .expect(201);

      // Try to create second product with same slug
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_SLUG_EXISTS');
    });

    it('should reject creation with invalid category', async () => {
      const invalidData = {
        ...validProductData,
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CATEGORY');
    });
  });

  describe('PUT /api/products/:id (Admin Only)', () => {
    beforeEach(async () => {
      // Clean products before each test
      await AppDataSource.getRepository(Product).delete({});
      
      // Create a test product
      const productRepo = AppDataSource.getRepository(Product);
      testProduct = productRepo.create({
        title: 'Original Product',
        description: 'Original description',
        slug: 'original-product',
        price: 99.99,
        stockQuantity: 10,
        categoryId: category.id,
        isActive: true,
        inStock: true,
      });
      await productRepo.save(testProduct);
    });

    it('should update product with admin token', async () => {
      const updateData = {
        title: 'Updated Product',
        price: 149.99,
      };

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Product');
      expect(response.body.data.price).toBe(149.99);
      expect(response.body.message).toBe('Product updated successfully');
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject update with customer token', async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ title: 'Updated' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('DELETE /api/products/:id (Admin Only)', () => {
    beforeEach(async () => {
      // Clean products before each test
      await AppDataSource.getRepository(Product).delete({});
      
      // Create a test product
      const productRepo = AppDataSource.getRepository(Product);
      testProduct = productRepo.create({
        title: 'Product to Delete',
        description: 'This product will be deleted',
        slug: 'product-to-delete',
        price: 99.99,
        stockQuantity: 10,
        categoryId: category.id,
        isActive: true,
        inStock: true,
      });
      await productRepo.save(testProduct);
    });

    it('should delete product with admin token', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');

      // Verify product is soft deleted (isActive = false)
      const deletedProduct = await AppDataSource.getRepository(Product).findOne({
        where: { id: testProduct.id },
      });
      expect(deletedProduct?.isActive).toBe(false);
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject deletion with customer token', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('PATCH /api/products/:id/stock (Admin Only)', () => {
    beforeEach(async () => {
      // Clean products before each test
      await AppDataSource.getRepository(Product).delete({});
      
      // Create a test product
      const productRepo = AppDataSource.getRepository(Product);
      testProduct = productRepo.create({
        title: 'Stock Test Product',
        description: 'Product for stock testing',
        slug: 'stock-test-product',
        price: 99.99,
        stockQuantity: 10,
        categoryId: category.id,
        isActive: true,
        inStock: true,
      });
      await productRepo.save(testProduct);
    });

    it('should update stock with admin token', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProduct.id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stockQuantity).toBe(50);
      expect(response.body.data.inStock).toBe(true);
      expect(response.body.message).toBe('Stock updated successfully');
    });

    it('should set inStock to false when quantity is 0', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProduct.id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stockQuantity).toBe(0);
      expect(response.body.data.inStock).toBe(false);
    });

    it('should reject stock update without authentication', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProduct.id}/stock`)
        .send({ quantity: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject stock update with customer token', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProduct.id}/stock`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantity: 50 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid stock quantity', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProduct.id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .patch(`/api/products/${fakeId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });
});