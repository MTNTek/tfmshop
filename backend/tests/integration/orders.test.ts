import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/entities/User';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { Address, AddressType } from '../../src/entities/Address';
import { Cart } from '../../src/entities/Cart';
import { CartItem } from '../../src/entities/CartItem';
import { Order, OrderStatus } from '../../src/entities/Order';
import { OrderItem } from '../../src/entities/OrderItem';
import { JwtUtils } from '../../src/utils/jwt';
import app from '../../src/app';

describe('Order Integration Tests', () => {
  let testUser: User;
  let adminUser: User;
  let testProduct: Product;
  let testCategory: Category;
  let testAddress: Address;
  let testCart: Cart;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    // Clean up database
    await AppDataSource.getRepository(OrderItem).delete({});
    await AppDataSource.getRepository(Order).delete({});
    await AppDataSource.getRepository(CartItem).delete({});
    await AppDataSource.getRepository(Cart).delete({});
    await AppDataSource.getRepository(Address).delete({});
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

    // Create test users
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

    adminUser = userRepository.create({
      email: 'admin@example.com',
      password: 'hashedpassword',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    });
    adminUser = await userRepository.save(adminUser);

    // Create test address
    const addressRepository = AppDataSource.getRepository(Address);
    testAddress = addressRepository.create({
      userId: testUser.id,
      type: AddressType.BOTH,
      firstName: 'Test',
      lastName: 'User',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'United States',
      isDefault: true,
    });
    testAddress = await addressRepository.save(testAddress);

    // Create test cart with items
    const cartRepository = AppDataSource.getRepository(Cart);
    testCart = cartRepository.create({
      userId: testUser.id,
      items: [],
    });
    testCart = await cartRepository.save(testCart);

    const cartItemRepository = AppDataSource.getRepository(CartItem);
    const cartItem = cartItemRepository.create({
      cartId: testCart.id,
      productId: testProduct.id,
      quantity: 2,
      price: testProduct.price,
    });
    await cartItemRepository.save(cartItem);

    // Generate auth tokens
    userToken = JwtUtils.generateAccessToken(testUser);
    adminToken = JwtUtils.generateAccessToken(adminUser);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/orders (checkout)', () => {
    it('should create order with existing address', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddressId: testAddress.id,
          billingAddressId: testAddress.id,
          paymentMethod: 'credit_card',
          customerNotes: 'Test order',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toMatch(/^ORD\d{11}$/);
      expect(response.body.data.status).toBe(OrderStatus.PENDING);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe(testProduct.id);
      expect(response.body.data.items[0].quantity).toBe(2);
      expect(response.body.data.subtotal).toBe(59.98);
      expect(response.body.data.customerNotes).toBe('Test order');
    });

    it('should create order with provided address data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '456 New St',
            city: 'New City',
            state: 'New State',
            postalCode: '54321',
            country: 'United States',
          },
          billingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '456 New St',
            city: 'New City',
            state: 'New State',
            postalCode: '54321',
            country: 'United States',
          },
          paymentMethod: 'paypal',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shippingAddress.firstName).toBe('John');
      expect(response.body.data.shippingAddress.addressLine1).toBe('456 New St');
      expect(response.body.data.paymentMethod).toBe('paypal');
    });

    it('should reject checkout with empty cart', async () => {
      // Clear cart items
      await AppDataSource.getRepository(CartItem).delete({ cartId: testCart.id });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddressId: testAddress.id,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMPTY_CART');
    });

    it('should reject checkout without shipping address', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          paymentMethod: 'credit_card',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject checkout with invalid address ID', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddressId: '123e4567-e89b-12d3-a456-426614174000',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ADDRESS_NOT_FOUND');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          shippingAddressId: testAddress.id,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('GET /api/orders (order history)', () => {
    let testOrder: Order;

    beforeEach(async () => {
      // Create a test order
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddressId: testAddress.id,
        });
      
      testOrder = response.body.data;
    });

    it('should return user order history', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].id).toBe(testOrder.id);
      expect(response.body.data.pagination.total).toBe(1);
      expect(response.body.data.pagination.page).toBe(1);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get(`/api/orders?status=${OrderStatus.PENDING}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].status).toBe(OrderStatus.PENDING);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('GET /api/orders/:orderId', () => {
    let testOrder: Order;

    beforeEach(async () => {
      // Create a test order
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddressId: testAddress.id,
        });
      
      testOrder = response.body.data;
    });

    it('should return order details', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testOrder.id);
      expect(response.body.data.orderNumber).toBe(testOrder.orderNumber);
      expect(response.body.data.items).toHaveLength(1);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ORDER_NOT_FOUND');
    });

    it('should return 400 for invalid order ID format', async () => {
      const response = await request(app)
        .get('/api/orders/invalid-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should not allow access to other user\'s orders', async () => {
      // Create another user
      const anotherUser = await AppDataSource.getRepository(User).save({
        email: 'another@example.com',
        password: 'hashedpassword',
        firstName: 'Another',
        lastName: 'User',
        role: UserRole.CUSTOMER,
        isActive: true,
      });

      const anotherUserToken = JwtUtils.generateAccessToken(anotherUser);

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('POST /api/orders/:orderId/cancel', () => {
    let testOrder: Order;

    beforeEach(async () => {
      // Create a test order
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddressId: testAddress.id,
        });
      
      testOrder = response.body.data;
    });

    it('should cancel order successfully', async () => {
      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reason: 'Changed my mind',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(OrderStatus.CANCELLED);
    });

    it('should cancel order without reason', async () => {
      const response = await request(app)
        .post(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(OrderStatus.CANCELLED);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .post('/api/orders/123e4567-e89b-12d3-a456-426614174000/cancel')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  describe('PUT /api/orders/:orderId/status (Admin only)', () => {
    let testOrder: Order;

    beforeEach(async () => {
      // Create a test order
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddressId: testAddress.id,
        });
      
      testOrder = response.body.data;
    });

    it('should update order status with admin token', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: OrderStatus.CONFIRMED,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should update order status with tracking number', async () => {
      // First confirm the order
      await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: OrderStatus.CONFIRMED });

      await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: OrderStatus.PROCESSING });

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: OrderStatus.SHIPPED,
          trackingNumber: 'TRACK123456',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(OrderStatus.SHIPPED);
      expect(response.body.data.trackingNumber).toBe('TRACK123456');
    });

    it('should reject invalid status transition', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: OrderStatus.DELIVERED, // Invalid transition from PENDING
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should reject customer access', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: OrderStatus.CONFIRMED,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .send({
          status: OrderStatus.CONFIRMED,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('GET /api/orders/statistics (Admin only)', () => {
    beforeEach(async () => {
      // Create multiple test orders
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            shippingAddressId: testAddress.id,
          });
      }
    });

    it('should return order statistics with admin token', async () => {
      const response = await request(app)
        .get('/api/orders/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalOrders).toBe(3);
      expect(response.body.data.totalRevenue).toBeGreaterThan(0);
      expect(response.body.data.averageOrderValue).toBeGreaterThan(0);
      expect(response.body.data.ordersByStatus).toHaveProperty(OrderStatus.PENDING);
    });

    it('should support date filtering', async () => {
      const today = new Date().toISOString();
      const response = await request(app)
        .get(`/api/orders/statistics?startDate=${today}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalOrders');
    });

    it('should reject customer access', async () => {
      const response = await request(app)
        .get('/api/orders/statistics')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders/statistics')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });
});