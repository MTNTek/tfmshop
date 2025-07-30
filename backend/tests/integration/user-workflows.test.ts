import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/entities/User';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { Order, OrderStatus } from '../../src/entities/Order';
import { Cart } from '../../src/entities/Cart';
import { CartItem } from '../../src/entities/CartItem';
import { Address, AddressType } from '../../src/entities/Address';
import { PasswordUtils } from '../../src/utils/password';
import app from '../../src/app';

describe('Complete User Workflow Integration Tests', () => {
  let testCategory: Category;
  let testProduct1: Product;
  let testProduct2: Product;
  let adminUser: User;
  let adminToken: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    // Clean up database
    await AppDataSource.getRepository(CartItem).delete({});
    await AppDataSource.getRepository(Cart).delete({});
    await AppDataSource.getRepository(Order).delete({});
    await AppDataSource.getRepository(Address).delete({});
    await AppDataSource.getRepository(Product).delete({});
    await AppDataSource.getRepository(Category).delete({});
    await AppDataSource.getRepository(User).delete({});

    // Create admin user
    const userRepository = AppDataSource.getRepository(User);
    adminUser = userRepository.create({
      email: 'admin@example.com',
      password: await PasswordUtils.hashPassword('password123'),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    });
    adminUser = await userRepository.save(adminUser);

    // Create test category
    const categoryRepository = AppDataSource.getRepository(Category);
    testCategory = categoryRepository.create({
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      slug: 'electronics',
    });
    testCategory = await categoryRepository.save(testCategory);

    // Create test products
    const productRepository = AppDataSource.getRepository(Product);
    testProduct1 = productRepository.create({
      title: 'Smartphone',
      description: 'Latest smartphone with advanced features',
      slug: 'smartphone',
      price: 599.99,
      stockQuantity: 50,
      categoryId: testCategory.id,
      images: ['smartphone.jpg'],
      isActive: true,
      inStock: true,
    });
    testProduct1 = await productRepository.save(testProduct1);

    testProduct2 = productRepository.create({
      title: 'Wireless Headphones',
      description: 'High-quality wireless headphones',
      slug: 'wireless-headphones',
      price: 199.99,
      stockQuantity: 30,
      categoryId: testCategory.id,
      images: ['headphones.jpg'],
      isActive: true,
      inStock: true,
    });
    testProduct2 = await productRepository.save(testProduct2);

    // Generate admin token
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });
    adminToken = adminLoginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Complete Customer Journey', () => {
    it('should complete full customer workflow: register -> browse -> cart -> checkout -> order tracking', async () => {
      // Step 1: Customer Registration
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'customer@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        })
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe('customer@example.com');
      const customerToken = registerResponse.body.data.accessToken;

      // Step 2: Browse Products
      const productsResponse = await request(app)
        .get('/api/products')
        .expect(200);

      expect(productsResponse.body.success).toBe(true);
      expect(productsResponse.body.data.products).toHaveLength(2);

      // Step 3: View Product Details
      const productDetailResponse = await request(app)
        .get(`/api/products/${testProduct1.id}`)
        .expect(200);

      expect(productDetailResponse.body.success).toBe(true);
      expect(productDetailResponse.body.data.title).toBe('Smartphone');

      // Step 4: Add Products to Cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProduct1.id,
          quantity: 2,
        })
        .expect(200);

      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProduct2.id,
          quantity: 1,
        })
        .expect(200);

      // Step 5: View Cart
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(cartResponse.body.success).toBe(true);
      expect(cartResponse.body.data.items).toHaveLength(2);
      expect(cartResponse.body.data.totalItems).toBe(3);
      expect(cartResponse.body.data.subtotal).toBe(1399.97); // (599.99 * 2) + 199.99

      // Step 6: Update Cart Item Quantity
      const cartItemId = cartResponse.body.data.items[0].id;
      await request(app)
        .put(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          quantity: 1,
        })
        .expect(200);

      // Step 7: Create Address
      const addressResponse = await request(app)
        .post('/api/users/addresses')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          type: 'both',
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
          isDefault: true,
        })
        .expect(201);

      const addressId = addressResponse.body.data.address.id;

      // Step 8: Checkout and Create Order
      const checkoutResponse = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddressId: addressId,
          billingAddressId: addressId,
          paymentMethod: 'credit_card',
          customerNotes: 'Please handle with care',
        })
        .expect(201);

      expect(checkoutResponse.body.success).toBe(true);
      expect(checkoutResponse.body.data.order.status).toBe('pending');
      expect(checkoutResponse.body.data.order.items).toHaveLength(2);
      const orderId = checkoutResponse.body.data.order.id;

      // Step 9: View Order History
      const orderHistoryResponse = await request(app)
        .get('/api/orders/history')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(orderHistoryResponse.body.success).toBe(true);
      expect(orderHistoryResponse.body.data.orders).toHaveLength(1);

      // Step 10: View Order Details
      const orderDetailResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(orderDetailResponse.body.success).toBe(true);
      expect(orderDetailResponse.body.data.id).toBe(orderId);

      // Step 11: Admin Updates Order Status
      await request(app)
        .put(`/api/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'confirmed',
          notes: 'Order confirmed by admin',
        })
        .expect(200);

      // Step 12: Customer Checks Updated Order Status
      const updatedOrderResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(updatedOrderResponse.body.data.status).toBe('confirmed');

      // Step 13: Update Profile
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          firstName: 'Jonathan',
          phone: '9876543210',
        })
        .expect(200);

      // Step 14: View Updated Profile
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(profileResponse.body.data.firstName).toBe('Jonathan');
      expect(profileResponse.body.data.phone).toBe('9876543210');
    });
  });

  describe('Admin Workflow', () => {
    it('should complete admin workflow: manage users -> manage products -> manage orders -> view analytics', async () => {
      // Create a customer first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'customer@example.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Smith',
        });

      // Step 1: Admin Views Dashboard
      const dashboardResponse = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(dashboardResponse.body.success).toBe(true);
      expect(dashboardResponse.body.data.overview).toBeDefined();

      // Step 2: Admin Views Users
      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(usersResponse.body.success).toBe(true);
      expect(usersResponse.body.data.users.length).toBeGreaterThanOrEqual(2);

      // Step 3: Admin Creates New Product
      const newProductResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Tablet',
          description: 'High-performance tablet',
          slug: 'tablet',
          price: 399.99,
          stockQuantity: 25,
          categoryId: testCategory.id,
          images: ['tablet.jpg'],
        })
        .expect(201);

      expect(newProductResponse.body.success).toBe(true);
      const newProductId = newProductResponse.body.data.id;

      // Step 4: Admin Updates Product
      await request(app)
        .put(`/api/products/${newProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 349.99,
          stockQuantity: 30,
        })
        .expect(200);

      // Step 5: Admin Views Orders
      const ordersResponse = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(ordersResponse.body.success).toBe(true);

      // Step 6: Admin Views Statistics
      const userStatsResponse = await request(app)
        .get('/api/admin/statistics/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(userStatsResponse.body.success).toBe(true);
      expect(userStatsResponse.body.data.totalUsers).toBeGreaterThanOrEqual(2);

      const orderStatsResponse = await request(app)
        .get('/api/admin/statistics/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(orderStatsResponse.body.success).toBe(true);

      // Step 7: Admin Searches Users
      const searchResponse = await request(app)
        .get('/api/admin/search/users?q=jane')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle authentication errors gracefully', async () => {
      // Try to access protected endpoint without token
      await request(app)
        .get('/api/cart')
        .expect(401);

      // Try to access admin endpoint with invalid token
      await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should handle validation errors gracefully', async () => {
      // Register with invalid email
      const invalidEmailResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);

      expect(invalidEmailResponse.body.success).toBe(false);
      expect(invalidEmailResponse.body.error.code).toBe('VALIDATION_ERROR');

      // Add invalid product to cart
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      const token = registerResponse.body.data.accessToken;

      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: '123e4567-e89b-12d3-a456-426614174000', // Non-existent product
          quantity: 1,
        })
        .expect(404);
    });

    it('should handle business logic errors gracefully', async () => {
      // Register customer
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'customer@example.com',
          password: 'password123',
          firstName: 'Customer',
          lastName: 'User',
        });

      const token = registerResponse.body.data.accessToken;

      // Try to add more items than available stock
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: testProduct1.id,
          quantity: 100, // More than available stock (50)
        })
        .expect(400);

      // Try to checkout with empty cart
      await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: {
            firstName: 'Customer',
            lastName: 'User',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'United States',
          },
        })
        .expect(400);
    });
  });

  describe('System Health and Monitoring', () => {
    it('should provide system health information', async () => {
      const healthResponse = await request(app)
        .get('/health')
        .expect(200);

      expect(healthResponse.body.status).toBe('OK');
      expect(healthResponse.body.database.connected).toBe(true);
      expect(healthResponse.body.uptime).toBeGreaterThan(0);
    });

    it('should provide admin system health', async () => {
      const adminHealthResponse = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminHealthResponse.body.success).toBe(true);
      expect(adminHealthResponse.body.data.database).toBe(true);
      expect(adminHealthResponse.body.data.totalUsers).toBeGreaterThanOrEqual(1);
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation', async () => {
      const swaggerResponse = await request(app)
        .get('/api-docs.json')
        .expect(200);

      expect(swaggerResponse.body.openapi).toBe('3.0.0');
      expect(swaggerResponse.body.info.title).toBe('TFMshop Backend API');
      expect(swaggerResponse.body.paths).toBeDefined();
    });
  });

  describe('CORS and Security', () => {
    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/products')
        .set('Origin', 'http://localhost:3000')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
    });
  });
});