import { OrderService, CheckoutData, OrderHistoryOptions } from '../../src/services/OrderService';
import { AppDataSource } from '../../src/config/database';
import { Order, OrderStatus } from '../../src/entities/Order';
import { OrderItem } from '../../src/entities/OrderItem';
import { User, UserRole } from '../../src/entities/User';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { Address, AddressType } from '../../src/entities/Address';
import { Cart } from '../../src/entities/Cart';
import { CartItem } from '../../src/entities/CartItem';

describe('OrderService', () => {
  let orderService: OrderService;
  let testUser: User;
  let testProduct: Product;
  let testCategory: Category;
  let testAddress: Address;
  let testCart: Cart;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    orderService = new OrderService();

    // Clean up database
    await AppDataSource.getRepository(OrderItem).delete({});
    await AppDataSource.getRepository(Order).delete({});
    await AppDataSource.getRepository(CartItem).delete({});
    await AppDataSource.getRepository(Cart).delete({});
    await AppDataSource.getRepository(Address).delete({});
    await AppDataSource.getRepository(Product).delete({});
    await AppDataSource.getRepository(Category).delete({});
    await AppDataSource.getRepository(User).delete({});

    // Create test data
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

    const categoryRepository = AppDataSource.getRepository(Category);
    testCategory = categoryRepository.create({
      name: 'Test Category',
      description: 'Test category description',
      slug: 'test-category',
    });
    testCategory = await categoryRepository.save(testCategory);

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
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('calculateOrderTotals', () => {
    it('should calculate totals correctly with tax and shipping', () => {
      const subtotal = 50.00;
      const totals = orderService.calculateOrderTotals(subtotal);

      expect(totals.subtotal).toBe(50.00);
      expect(totals.tax).toBe(4.00); // 8% tax
      expect(totals.shipping).toBe(9.99); // Standard shipping
      expect(totals.total).toBe(63.99);
    });

    it('should apply free shipping for orders over threshold', () => {
      const subtotal = 150.00;
      const totals = orderService.calculateOrderTotals(subtotal);

      expect(totals.subtotal).toBe(150.00);
      expect(totals.tax).toBe(12.00); // 8% tax
      expect(totals.shipping).toBe(0); // Free shipping
      expect(totals.total).toBe(162.00);
    });

    it('should handle edge case at free shipping threshold', () => {
      const subtotal = 100.00;
      const totals = orderService.calculateOrderTotals(subtotal);

      expect(totals.subtotal).toBe(100.00);
      expect(totals.tax).toBe(8.00); // 8% tax
      expect(totals.shipping).toBe(0); // Free shipping at threshold
      expect(totals.total).toBe(108.00);
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate unique order number', async () => {
      const orderNumber1 = await orderService.generateOrderNumber();
      const orderNumber2 = await orderService.generateOrderNumber();

      expect(orderNumber1).toMatch(/^ORD\d{11}$/);
      expect(orderNumber2).toMatch(/^ORD\d{11}$/);
      expect(orderNumber1).not.toBe(orderNumber2);
    });

    it('should generate order number with correct format', async () => {
      const orderNumber = await orderService.generateOrderNumber();
      
      expect(orderNumber).toMatch(/^ORD\d{11}$/);
      expect(orderNumber.length).toBe(14); // ORD + 11 digits
    });
  });

  describe('createOrder', () => {
    it('should create order from cart successfully', async () => {
      const checkoutData: CheckoutData = {
        shippingAddressId: testAddress.id,
        billingAddressId: testAddress.id,
        paymentMethod: 'credit_card',
        customerNotes: 'Test order notes',
      };

      const order = await orderService.createOrder(testUser.id, checkoutData);

      expect(order).toBeDefined();
      expect(order.userId).toBe(testUser.id);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].productId).toBe(testProduct.id);
      expect(order.items[0].quantity).toBe(2);
      expect(order.subtotal).toBe(59.98); // 2 * 29.99
      expect(order.customerNotes).toBe('Test order notes');
    });

    it('should create order with provided address data', async () => {
      const checkoutData: CheckoutData = {
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
      };

      const order = await orderService.createOrder(testUser.id, checkoutData);

      expect(order.shippingAddress.firstName).toBe('John');
      expect(order.shippingAddress.addressLine1).toBe('456 New St');
      expect(order.billingAddress.firstName).toBe('John');
    });

    it('should throw error for empty cart', async () => {
      // Clear cart items
      await AppDataSource.getRepository(CartItem).delete({ cartId: testCart.id });

      const checkoutData: CheckoutData = {
        shippingAddressId: testAddress.id,
      };

      await expect(orderService.createOrder(testUser.id, checkoutData))
        .rejects.toThrow('Cart is empty');
    });

    it('should throw error for invalid shipping address', async () => {
      const checkoutData: CheckoutData = {
        shippingAddressId: '123e4567-e89b-12d3-a456-426614174000', // Non-existent ID
      };

      await expect(orderService.createOrder(testUser.id, checkoutData))
        .rejects.toThrow('shipping address not found');
    });

    it('should update product stock after order creation', async () => {
      const checkoutData: CheckoutData = {
        shippingAddressId: testAddress.id,
      };

      const originalStock = testProduct.stockQuantity;
      await orderService.createOrder(testUser.id, checkoutData);

      // Refresh product from database
      const updatedProduct = await AppDataSource.getRepository(Product)
        .findOne({ where: { id: testProduct.id } });

      expect(updatedProduct?.stockQuantity).toBe(originalStock - 2);
    });
  });

  describe('getOrderById', () => {
    let testOrder: Order;

    beforeEach(async () => {
      const checkoutData: CheckoutData = {
        shippingAddressId: testAddress.id,
      };
      testOrder = await orderService.createOrder(testUser.id, checkoutData);
    });

    it('should return order by ID for correct user', async () => {
      const order = await orderService.getOrderById(testUser.id, testOrder.id);

      expect(order).toBeDefined();
      expect(order.id).toBe(testOrder.id);
      expect(order.userId).toBe(testUser.id);
      expect(order.items).toBeDefined();
    });

    it('should throw error for non-existent order', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(orderService.getOrderById(testUser.id, nonExistentId))
        .rejects.toThrow('Order not found');
    });

    it('should throw error when accessing another user\'s order', async () => {
      // Create another user
      const anotherUser = await AppDataSource.getRepository(User).save({
        email: 'another@example.com',
        password: 'hashedpassword',
        firstName: 'Another',
        lastName: 'User',
        role: UserRole.CUSTOMER,
        isActive: true,
      });

      await expect(orderService.getOrderById(anotherUser.id, testOrder.id))
        .rejects.toThrow('Order not found');
    });
  });

  describe('getOrderHistory', () => {
    let testOrders: Order[];

    beforeEach(async () => {
      const checkoutData: CheckoutData = {
        shippingAddressId: testAddress.id,
      };

      // Create multiple orders
      testOrders = [];
      for (let i = 0; i < 3; i++) {
        const order = await orderService.createOrder(testUser.id, checkoutData);
        testOrders.push(order);
        
        // Add some delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    });

    it('should return paginated order history', async () => {
      const result = await orderService.getOrderHistory(testUser.id, {
        page: 1,
        limit: 2,
      });

      expect(result.orders).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('should filter orders by status', async () => {
      // Update one order status
      await orderService.updateOrderStatus(testOrders[0].id, OrderStatus.CONFIRMED);

      const result = await orderService.getOrderHistory(testUser.id, {
        status: OrderStatus.CONFIRMED,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0].status).toBe(OrderStatus.CONFIRMED);
    });

    it('should return orders in descending order by creation date', async () => {
      const result = await orderService.getOrderHistory(testUser.id);

      expect(result.orders).toHaveLength(3);
      // Most recent order should be first
      expect(new Date(result.orders[0].createdAt).getTime())
        .toBeGreaterThanOrEqual(new Date(result.orders[1].createdAt).getTime());
    });
  });

  describe('updateOrderStatus', () => {
    let testOrder: Order;

    beforeEach(async () => {
      const checkoutData: CheckoutData = {
        shippingAddressId: testAddress.id,
      };
      testOrder = await orderService.createOrder(testUser.id, checkoutData);
    });

    it('should update order status successfully', async () => {
      const updatedOrder = await orderService.updateOrderStatus(
        testOrder.id,
        OrderStatus.CONFIRMED
      );

      expect(updatedOrder.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should set shipped timestamp when status is shipped', async () => {
      await orderService.updateOrderStatus(testOrder.id, OrderStatus.CONFIRMED);
      await orderService.updateOrderStatus(testOrder.id, OrderStatus.PROCESSING);
      
      const updatedOrder = await orderService.updateOrderStatus(
        testOrder.id,
        OrderStatus.SHIPPED,
        'TRACK123'
      );

      expect(updatedOrder.status).toBe(OrderStatus.SHIPPED);
      expect(updatedOrder.shippedAt).toBeDefined();
      expect(updatedOrder.trackingNumber).toBe('TRACK123');
    });

    it('should set delivered timestamp when status is delivered', async () => {
      // Progress through valid status transitions
      await orderService.updateOrderStatus(testOrder.id, OrderStatus.CONFIRMED);
      await orderService.updateOrderStatus(testOrder.id, OrderStatus.PROCESSING);
      await orderService.updateOrderStatus(testOrder.id, OrderStatus.SHIPPED);
      
      const updatedOrder = await orderService.updateOrderStatus(
        testOrder.id,
        OrderStatus.DELIVERED
      );

      expect(updatedOrder.status).toBe(OrderStatus.DELIVERED);
      expect(updatedOrder.deliveredAt).toBeDefined();
    });

    it('should throw error for invalid status transition', async () => {
      await expect(orderService.updateOrderStatus(testOrder.id, OrderStatus.DELIVERED))
        .rejects.toThrow('Invalid status transition');
    });

    it('should throw error for non-existent order', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(orderService.updateOrderStatus(nonExistentId, OrderStatus.CONFIRMED))
        .rejects.toThrow('Order not found');
    });
  });

  describe('cancelOrder', () => {
    let testOrder: Order;

    beforeEach(async () => {
      const checkoutData: CheckoutData = {
        shippingAddressId: testAddress.id,
      };
      testOrder = await orderService.createOrder(testUser.id, checkoutData);
    });

    it('should cancel order successfully', async () => {
      const cancelledOrder = await orderService.cancelOrder(
        testUser.id,
        testOrder.id,
        'Customer requested cancellation'
      );

      expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED);
      expect(cancelledOrder.notes).toBe('Customer requested cancellation');
    });

    it('should restore product stock when order is cancelled', async () => {
      const originalStock = testProduct.stockQuantity;
      
      await orderService.cancelOrder(testUser.id, testOrder.id);

      // Refresh product from database
      const updatedProduct = await AppDataSource.getRepository(Product)
        .findOne({ where: { id: testProduct.id } });

      expect(updatedProduct?.stockQuantity).toBe(originalStock);
      expect(updatedProduct?.inStock).toBe(true);
    });

    it('should throw error when trying to cancel non-cancellable order', async () => {
      // Update order to shipped status
      await orderService.updateOrderStatus(testOrder.id, OrderStatus.CONFIRMED);
      await orderService.updateOrderStatus(testOrder.id, OrderStatus.PROCESSING);
      await orderService.updateOrderStatus(testOrder.id, OrderStatus.SHIPPED);

      await expect(orderService.cancelOrder(testUser.id, testOrder.id))
        .rejects.toThrow('Order cannot be cancelled');
    });

    it('should throw error for non-existent order', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(orderService.cancelOrder(testUser.id, nonExistentId))
        .rejects.toThrow('Order not found');
    });
  });

  describe('getOrderStatistics', () => {
    beforeEach(async () => {
      const checkoutData: CheckoutData = {
        shippingAddressId: testAddress.id,
      };

      // Create multiple orders with different statuses
      const order1 = await orderService.createOrder(testUser.id, checkoutData);
      const order2 = await orderService.createOrder(testUser.id, checkoutData);
      const order3 = await orderService.createOrder(testUser.id, checkoutData);

      await orderService.updateOrderStatus(order2.id, OrderStatus.CONFIRMED);
      await orderService.updateOrderStatus(order3.id, OrderStatus.CONFIRMED);
      await orderService.updateOrderStatus(order3.id, OrderStatus.PROCESSING);
    });

    it('should return correct order statistics', async () => {
      const stats = await orderService.getOrderStatistics();

      expect(stats.totalOrders).toBe(3);
      expect(stats.totalRevenue).toBeGreaterThan(0);
      expect(stats.averageOrderValue).toBeGreaterThan(0);
      expect(stats.ordersByStatus[OrderStatus.PENDING]).toBe(1);
      expect(stats.ordersByStatus[OrderStatus.CONFIRMED]).toBe(1);
      expect(stats.ordersByStatus[OrderStatus.PROCESSING]).toBe(1);
    });

    it('should filter statistics by date range', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const stats = await orderService.getOrderStatistics(undefined, tomorrow);

      expect(stats.totalOrders).toBe(3); // All orders should be included
    });
  });
});