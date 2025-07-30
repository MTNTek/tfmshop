import { AdminService, UserQueryOptions, OrderQueryOptions, AdminUserUpdateData } from '../../src/services/AdminService';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/entities/User';
import { Order, OrderStatus } from '../../src/entities/Order';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { Address, AddressType } from '../../src/entities/Address';
import { PasswordUtils } from '../../src/utils/password';

describe('AdminService', () => {
  let adminService: AdminService;
  let testAdmin: User;
  let testCustomer: User;
  let testProduct: Product;
  let testCategory: Category;
  let testOrder: Order;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    adminService = new AdminService();

    // Clean up database
    await AppDataSource.getRepository(Order).delete({});
    await AppDataSource.getRepository(Address).delete({});
    await AppDataSource.getRepository(Product).delete({});
    await AppDataSource.getRepository(Category).delete({});
    await AppDataSource.getRepository(User).delete({});

    // Create test admin user
    const userRepository = AppDataSource.getRepository(User);
    testAdmin = userRepository.create({
      email: 'admin@example.com',
      password: await PasswordUtils.hashPassword('password123'),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    });
    testAdmin = await userRepository.save(testAdmin);

    // Create test customer user
    testCustomer = userRepository.create({
      email: 'customer@example.com',
      password: await PasswordUtils.hashPassword('password123'),
      firstName: 'Customer',
      lastName: 'User',
      role: UserRole.CUSTOMER,
      isActive: true,
    });
    testCustomer = await userRepository.save(testCustomer);

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
      userId: testCustomer.id,
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
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      const result = await adminService.getUsers({
        page: 1,
        limit: 10,
      });

      expect(result.users).toHaveLength(2); // admin + customer
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter users by role', async () => {
      const result = await adminService.getUsers({
        role: UserRole.CUSTOMER,
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].role).toBe(UserRole.CUSTOMER);
    });

    it('should filter users by active status', async () => {
      // Deactivate customer
      testCustomer.isActive = false;
      await AppDataSource.getRepository(User).save(testCustomer);

      const result = await adminService.getUsers({
        isActive: true,
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].isActive).toBe(true);
    });

    it('should search users by name or email', async () => {
      const result = await adminService.getUsers({
        search: 'customer',
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toContain('customer');
    });

    it('should sort users by specified field', async () => {
      const result = await adminService.getUsers({
        sortBy: 'email',
        sortOrder: 'ASC',
      });

      expect(result.users).toHaveLength(2);
      expect(result.users[0].email).toBe('admin@example.com');
      expect(result.users[1].email).toBe('customer@example.com');
    });
  });

  describe('getUserById', () => {
    it('should return user with full details', async () => {
      const user = await adminService.getUserById(testCustomer.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(testCustomer.id);
      expect(user.email).toBe(testCustomer.email);
      expect(user.addresses).toBeDefined();
      expect(user.orders).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(adminService.getUserById(nonExistentId))
        .rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const updateData: AdminUserUpdateData = {
        firstName: 'Updated',
        lastName: 'Name',
        role: UserRole.ADMIN,
        isActive: false,
      };

      const updatedUser = await adminService.updateUser(testCustomer.id, updateData);

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.role).toBe(UserRole.ADMIN);
      expect(updatedUser.isActive).toBe(false);
    });

    it('should update email if not already taken', async () => {
      const updateData: AdminUserUpdateData = {
        email: 'newemail@example.com',
      };

      const updatedUser = await adminService.updateUser(testCustomer.id, updateData);

      expect(updatedUser.email).toBe('newemail@example.com');
    });

    it('should throw error when email is already taken', async () => {
      const updateData: AdminUserUpdateData = {
        email: 'admin@example.com', // Already taken by testAdmin
      };

      await expect(adminService.updateUser(testCustomer.id, updateData))
        .rejects.toThrow('Email is already in use');
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: AdminUserUpdateData = {
        firstName: 'Updated',
      };

      await expect(adminService.updateUser(nonExistentId, updateData))
        .rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should deactivate customer user', async () => {
      await adminService.deleteUser(testCustomer.id);

      const user = await AppDataSource.getRepository(User)
        .findOne({ where: { id: testCustomer.id } });

      expect(user?.isActive).toBe(false);
    });

    it('should throw error when trying to delete admin user', async () => {
      await expect(adminService.deleteUser(testAdmin.id))
        .rejects.toThrow('Cannot delete admin users');
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(adminService.deleteUser(nonExistentId))
        .rejects.toThrow('User not found');
    });
  });

  describe('getOrders', () => {
    it('should return paginated list of orders', async () => {
      const result = await adminService.getOrders({
        page: 1,
        limit: 10,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter orders by status', async () => {
      const result = await adminService.getOrders({
        status: OrderStatus.PENDING,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].status).toBe(OrderStatus.PENDING);
    });

    it('should filter orders by user ID', async () => {
      const result = await adminService.getOrders({
        userId: testCustomer.id,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].userId).toBe(testCustomer.id);
    });

    it('should filter orders by amount range', async () => {
      const result = await adminService.getOrders({
        minAmount: 40,
        maxAmount: 50,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].total).toBeGreaterThanOrEqual(40);
      expect(result.orders[0].total).toBeLessThanOrEqual(50);
    });

    it('should search orders by order number or user info', async () => {
      const result = await adminService.getOrders({
        search: 'ORD123',
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].orderNumber).toContain('ORD123');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const updatedOrder = await adminService.updateOrderStatus(
        testOrder.id,
        OrderStatus.CONFIRMED,
        undefined,
        'Admin confirmed order'
      );

      expect(updatedOrder.status).toBe(OrderStatus.CONFIRMED);
      expect(updatedOrder.notes).toBe('Admin confirmed order');
    });

    it('should update order status with tracking number', async () => {
      // First confirm the order
      await adminService.updateOrderStatus(testOrder.id, OrderStatus.CONFIRMED);
      await adminService.updateOrderStatus(testOrder.id, OrderStatus.PROCESSING);

      const updatedOrder = await adminService.updateOrderStatus(
        testOrder.id,
        OrderStatus.SHIPPED,
        'TRACK123456'
      );

      expect(updatedOrder.status).toBe(OrderStatus.SHIPPED);
      expect(updatedOrder.trackingNumber).toBe('TRACK123456');
      expect(updatedOrder.shippedAt).toBeDefined();
    });
  });

  describe('getDashboardAnalytics', () => {
    it('should return dashboard analytics', async () => {
      const analytics = await adminService.getDashboardAnalytics(30);

      expect(analytics).toBeDefined();
      expect(analytics.overview).toBeDefined();
      expect(analytics.overview.totalUsers).toBeGreaterThanOrEqual(2);
      expect(analytics.overview.totalOrders).toBeGreaterThanOrEqual(1);
      expect(analytics.overview.totalProducts).toBeGreaterThanOrEqual(1);
      expect(analytics.recentActivity).toBeDefined();
      expect(analytics.ordersByStatus).toBeDefined();
      expect(analytics.topProducts).toBeDefined();
      expect(analytics.salesTrend).toBeDefined();
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics', async () => {
      const stats = await adminService.getUserStatistics();

      expect(stats.totalUsers).toBe(2);
      expect(stats.activeUsers).toBe(2);
      expect(stats.inactiveUsers).toBe(0);
      expect(stats.adminUsers).toBe(1);
      expect(stats.customerUsers).toBe(1);
      expect(stats.newUsersThisMonth).toBeGreaterThanOrEqual(0);
      expect(stats.userGrowthRate).toBeDefined();
    });
  });

  describe('getOrderStatistics', () => {
    it('should return order statistics', async () => {
      const stats = await adminService.getOrderStatistics();

      expect(stats.totalOrders).toBe(1);
      expect(stats.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(stats.averageOrderValue).toBeGreaterThanOrEqual(0);
      expect(stats.ordersByStatus).toBeDefined();
      expect(stats.ordersByStatus[OrderStatus.PENDING]).toBe(1);
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const users = await adminService.searchUsers('customer', 10);

      expect(users).toHaveLength(1);
      expect(users[0].email).toContain('customer');
    });

    it('should limit search results', async () => {
      const users = await adminService.searchUsers('user', 1);

      expect(users).toHaveLength(1);
    });
  });

  describe('searchOrders', () => {
    it('should search orders by query', async () => {
      const orders = await adminService.searchOrders('ORD123', 10);

      expect(orders).toHaveLength(1);
      expect(orders[0].orderNumber).toContain('ORD123');
    });

    it('should search orders by user email', async () => {
      const orders = await adminService.searchOrders('customer@example.com', 10);

      expect(orders).toHaveLength(1);
      expect(orders[0].user.email).toBe('customer@example.com');
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent users and orders', async () => {
      const activity = await adminService.getRecentActivity(10);

      expect(activity.recentUsers).toBeDefined();
      expect(activity.recentUsers.length).toBeGreaterThanOrEqual(2);
      expect(activity.recentOrders).toBeDefined();
      expect(activity.recentOrders.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('validateAdminUser', () => {
    it('should validate admin user successfully', async () => {
      const admin = await adminService.validateAdminUser(testAdmin.id);

      expect(admin).toBeDefined();
      expect(admin.id).toBe(testAdmin.id);
      expect(admin.role).toBe(UserRole.ADMIN);
    });

    it('should throw error for non-admin user', async () => {
      await expect(adminService.validateAdminUser(testCustomer.id))
        .rejects.toThrow('Access denied: Admin privileges required');
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(adminService.validateAdminUser(nonExistentId))
        .rejects.toThrow('User not found');
    });

    it('should throw error for inactive admin user', async () => {
      testAdmin.isActive = false;
      await AppDataSource.getRepository(User).save(testAdmin);

      await expect(adminService.validateAdminUser(testAdmin.id))
        .rejects.toThrow('User not found');
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health metrics', async () => {
      const health = await adminService.getSystemHealth();

      expect(health.database).toBe(true);
      expect(health.totalUsers).toBeGreaterThanOrEqual(2);
      expect(health.totalOrders).toBeGreaterThanOrEqual(1);
      expect(health.totalProducts).toBeGreaterThanOrEqual(1);
      expect(health.systemUptime).toBeGreaterThan(0);
    });
  });
});