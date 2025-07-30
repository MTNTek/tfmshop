import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/entities/User';
import { Order, OrderStatus } from '../../src/entities/Order';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { JwtUtils } from '../../src/utils/jwt';
import { PasswordUtils } from '../../src/utils/password';
import app from '../../src/app';

describe('Admin API Integration Tests', () => {
  let adminUser: User;
  let customerUser: User;
  let testProduct: Product;
  let testCategory: Category;
  let testOrder: Order;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    // Clean up database
    await AppDataSource.getRepository(Order).delete({});
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

    // Create customer user
    customerUser = userRepository.create({
      email: 'customer@example.com',
      password: await PasswordUtils.hashPassword('password123'),
      firstName: 'Customer',
      lastName: 'User',
      role: UserRole.CUSTOMER,
      isActive: true,
    });
    customerUser = await userRepository.save(customerUser);

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

    // Create test order
    const orderRepository = AppDataSource.getRepository(Order);
    testOrder = orderRepository.create({
      orderNumber: 'ORD123456789',
      userId: customerUser.id,
      status: OrderStatus.PENDING,
      subtotal: 29.99,
      tax: 2.40,
      shipping: 9.99,
      total: 42.38,
      shippingAddress: {
        firstName: 'Customer',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'United States',
      },
      billingAddress: {
        firstName: 'Customer',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'United States',
      },
    });
    testOrder = await orderRepository.save(testOrder);

    // Generate tokens
    adminToken = JwtUtils.generateAccessToken(adminUser);
    customerToken = JwtUtils.generateAccessToken(customerUser);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should require admin role for admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ADMIN_ACCESS_REQUIRED');
    });

    it('should allow admin access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/dashboard', () => {
    it('should return dashboard analytics', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('recentActivity');
      expect(response.body.data).toHaveProperty('ordersByStatus');
      expect(response.body.data).toHaveProperty('topProducts');
      expect(response.body.data).toHaveProperty('salesTrend');
    });

    it('should accept days parameter', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard?days=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('User Management', () => {
    describe('GET /api/admin/users', () => {
      it('should return paginated list of users', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toHaveLength(2);
        expect(response.body.data.pagination).toHaveProperty('total', 2);
      });

      it('should filter users by role', async () => {
        const response = await request(app)
          .get('/api/admin/users?role=customer')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toHaveLength(1);
        expect(response.body.data.users[0].role).toBe('customer');
      });

      it('should search users', async () => {
        const response = await request(app)
          .get('/api/admin/users?search=customer')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toHaveLength(1);
        expect(response.body.data.users[0].email).toContain('customer');
      });

      it('should paginate users', async () => {
        const response = await request(app)
          .get('/api/admin/users?page=1&limit=1')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toHaveLength(1);
        expect(response.body.data.pagination.totalPages).toBe(2);
      });
    });

    describe('GET /api/admin/users/:userId', () => {
      it('should return user details', async () => {
        const response = await request(app)
          .get(`/api/admin/users/${customerUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(customerUser.id);
        expect(response.body.data.email).toBe(customerUser.email);
        expect(response.body.data.addresses).toBeDefined();
        expect(response.body.data.orders).toBeDefined();
      });

      it('should return 404 for non-existent user', async () => {
        const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
        const response = await request(app)
          .get(`/api/admin/users/${nonExistentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('USER_NOT_FOUND');
      });

      it('should return 400 for invalid user ID', async () => {
        const response = await request(app)
          .get('/api/admin/users/invalid-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('PUT /api/admin/users/:userId', () => {
      it('should update user information', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          role: 'admin',
        };

        const response = await request(app)
          .put(`/api/admin/users/${customerUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.firstName).toBe('Updated');
        expect(response.body.data.lastName).toBe('Name');
        expect(response.body.data.role).toBe('admin');
      });

      it('should return 400 for duplicate email', async () => {
        const updateData = {
          email: 'admin@example.com', // Already taken
        };

        const response = await request(app)
          .put(`/api/admin/users/${customerUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
      });

      it('should return 400 for invalid data', async () => {
        const updateData = {
          email: 'invalid-email',
        };

        const response = await request(app)
          .put(`/api/admin/users/${customerUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('DELETE /api/admin/users/:userId', () => {
      it('should deactivate customer user', async () => {
        const response = await request(app)
          .delete(`/api/admin/users/${customerUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('deactivated');
      });

      it('should not allow deleting admin users', async () => {
        const response = await request(app)
          .delete(`/api/admin/users/${adminUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('CANNOT_DELETE_ADMIN');
      });
    });
  });

  describe('Order Management', () => {
    describe('GET /api/admin/orders', () => {
      it('should return paginated list of orders', async () => {
        const response = await request(app)
          .get('/api/admin/orders')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.orders).toHaveLength(1);
        expect(response.body.data.pagination.total).toBe(1);
      });

      it('should filter orders by status', async () => {
        const response = await request(app)
          .get('/api/admin/orders?status=pending')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.orders).toHaveLength(1);
        expect(response.body.data.orders[0].status).toBe('pending');
      });

      it('should filter orders by user', async () => {
        const response = await request(app)
          .get(`/api/admin/orders?userId=${customerUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.orders).toHaveLength(1);
        expect(response.body.data.orders[0].user.id).toBe(customerUser.id);
      });

      it('should search orders', async () => {
        const response = await request(app)
          .get('/api/admin/orders?search=ORD123')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.orders).toHaveLength(1);
        expect(response.body.data.orders[0].orderNumber).toContain('ORD123');
      });
    });

    describe('PUT /api/admin/orders/:orderId/status', () => {
      it('should update order status', async () => {
        const updateData = {
          status: 'confirmed',
          notes: 'Admin confirmed order',
        };

        const response = await request(app)
          .put(`/api/admin/orders/${testOrder.id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('confirmed');
        expect(response.body.data.notes).toBe('Admin confirmed order');
      });

      it('should update order status with tracking number', async () => {
        // First confirm and process the order
        await request(app)
          .put(`/api/admin/orders/${testOrder.id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'confirmed' });

        await request(app)
          .put(`/api/admin/orders/${testOrder.id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ status: 'processing' });

        const updateData = {
          status: 'shipped',
          trackingNumber: 'TRACK123456',
        };

        const response = await request(app)
          .put(`/api/admin/orders/${testOrder.id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('shipped');
        expect(response.body.data.trackingNumber).toBe('TRACK123456');
        expect(response.body.data.shippedAt).toBeDefined();
      });

      it('should return 400 for invalid status transition', async () => {
        const updateData = {
          status: 'delivered', // Invalid transition from pending
        };

        const response = await request(app)
          .put(`/api/admin/orders/${testOrder.id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION');
      });
    });
  });

  describe('Statistics and Analytics', () => {
    describe('GET /api/admin/statistics/users', () => {
      it('should return user statistics', async () => {
        const response = await request(app)
          .get('/api/admin/statistics/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('totalUsers');
        expect(response.body.data).toHaveProperty('activeUsers');
        expect(response.body.data).toHaveProperty('adminUsers');
        expect(response.body.data).toHaveProperty('customerUsers');
        expect(response.body.data.totalUsers).toBe(2);
        expect(response.body.data.adminUsers).toBe(1);
        expect(response.body.data.customerUsers).toBe(1);
      });
    });

    describe('GET /api/admin/statistics/orders', () => {
      it('should return order statistics', async () => {
        const response = await request(app)
          .get('/api/admin/statistics/orders')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('totalOrders');
        expect(response.body.data).toHaveProperty('totalRevenue');
        expect(response.body.data).toHaveProperty('ordersByStatus');
        expect(response.body.data.totalOrders).toBe(1);
      });

      it('should filter statistics by date range', async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const endDate = new Date();

        const response = await request(app)
          .get(`/api/admin/statistics/orders?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });
  });

  describe('Search Functionality', () => {
    describe('GET /api/admin/search/users', () => {
      it('should search users by query', async () => {
        const response = await request(app)
          .get('/api/admin/search/users?q=customer')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].email).toContain('customer');
      });

      it('should return 400 for short query', async () => {
        const response = await request(app)
          .get('/api/admin/search/users?q=a')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_SEARCH_QUERY');
      });

      it('should limit search results', async () => {
        const response = await request(app)
          .get('/api/admin/search/users?q=user&limit=1')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
      });
    });

    describe('GET /api/admin/search/orders', () => {
      it('should search orders by query', async () => {
        const response = await request(app)
          .get('/api/admin/search/orders?q=ORD123')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].orderNumber).toContain('ORD123');
      });

      it('should search orders by user email', async () => {
        const response = await request(app)
          .get('/api/admin/search/orders?q=customer@example.com')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].user.email).toBe('customer@example.com');
      });
    });
  });

  describe('Activity and Health', () => {
    describe('GET /api/admin/activity', () => {
      it('should return recent activity', async () => {
        const response = await request(app)
          .get('/api/admin/activity')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('recentUsers');
        expect(response.body.data).toHaveProperty('recentOrders');
        expect(response.body.data.recentUsers.length).toBeGreaterThanOrEqual(2);
        expect(response.body.data.recentOrders.length).toBeGreaterThanOrEqual(1);
      });

      it('should limit activity results', async () => {
        const response = await request(app)
          .get('/api/admin/activity?limit=1')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.recentUsers).toHaveLength(1);
        expect(response.body.data.recentOrders).toHaveLength(1);
      });
    });

    describe('GET /api/admin/health', () => {
      it('should return system health metrics', async () => {
        const response = await request(app)
          .get('/api/admin/health')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('database');
        expect(response.body.data).toHaveProperty('totalUsers');
        expect(response.body.data).toHaveProperty('totalOrders');
        expect(response.body.data).toHaveProperty('systemUptime');
        expect(response.body.data.database).toBe(true);
      });
    });
  });
});