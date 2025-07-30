import { Repository, FindManyOptions, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Order, OrderItem, Cart, Product, User, OrderStatus, PaymentStatus } from '../entities';

export interface CreateOrderData {
  userId: string;
  shippingAddress: any;
  billingAddress?: any;
  shippingMethod?: string;
  paymentMethod: string;
  customerNotes?: string;
}

export interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // Search by order number, customer name, email
}

export interface OrderUpdateData {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  carrier?: string;
  adminNotes?: string;
  shippingMethod?: string;
}

export class OrderService {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private cartRepository: Repository<Cart>;
  private productRepository: Repository<Product>;
  private userRepository: Repository<User>;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
    this.cartRepository = AppDataSource.getRepository(Cart);
    this.productRepository = AppDataSource.getRepository(Product);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create order from user's cart
   */
  async createOrderFromCart(
    userId: string,
    orderData: CreateOrderData
  ): Promise<Order> {
    // Get user's active cart
    const cart = await this.cartRepository.findOne({
      where: { userId, status: 'active' },
      relations: ['items', 'items.product', 'user']
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty or not found');
    }

    // Validate cart items before creating order
    for (const cartItem of cart.items) {
      const product = await this.productRepository.findOne({ 
        where: { id: cartItem.productId } 
      });

      if (!product || !product.isActive) {
        throw new Error(`Product "${cartItem.product.title}" is no longer available`);
      }

      if (cartItem.quantity > product.stockQuantity) {
        throw new Error(`Insufficient stock for "${product.title}". Only ${product.stockQuantity} available.`);
      }
    }

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = this.orderRepository.create({
      orderNumber,
      userId,
      user: cart.user,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      subtotal: cart.subtotal,
      taxAmount: cart.tax,
      shippingAmount: cart.shipping,
      totalAmount: cart.total,
      currency: cart.currency,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      shippingMethod: orderData.shippingMethod,
      paymentMethod: orderData.paymentMethod,
      customerNotes: orderData.customerNotes
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items from cart items
    const orderItems: OrderItem[] = [];
    for (const cartItem of cart.items) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        product: cartItem.product,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        originalPrice: cartItem.product.price,
        selectedVariant: cartItem.getVariant(),
        customizations: cartItem.getCustomizations()
      });

      // Create product snapshot
      orderItem.createProductSnapshot(cartItem.product);
      
      orderItems.push(orderItem);
    }

    await this.orderItemRepository.save(orderItems);

    // Update product stock
    for (const cartItem of cart.items) {
      await this.productRepository.decrement(
        { id: cartItem.productId },
        'stockQuantity',
        cartItem.quantity
      );
    }

    // Convert cart to 'converted' status
    cart.status = 'converted';
    await this.cartRepository.save(cart);

    // Return complete order with items
    const completeOrder = await this.getOrderById(savedOrder.id);
    if (!completeOrder) {
      throw new Error('Failed to retrieve created order');
    }
    
    return completeOrder;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user']
    });
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'items.product', 'user']
    });
  }

  /**
   * Get orders for a user
   */
  async getUserOrders(
    userId: string,
    page = 1,
    limit = 10,
    filters: Partial<OrderFilters> = {}
  ): Promise<{
    orders: Order[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.userId = :userId', { userId });

    // Apply filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        queryBuilder.andWhere('order.status IN (:...statuses)', { statuses: filters.status });
      } else {
        queryBuilder.andWhere('order.status = :status', { status: filters.status });
      }
    }

    if (filters.paymentStatus) {
      if (Array.isArray(filters.paymentStatus)) {
        queryBuilder.andWhere('order.paymentStatus IN (:...paymentStatuses)', { 
          paymentStatuses: filters.paymentStatus 
        });
      } else {
        queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { 
          paymentStatus: filters.paymentStatus 
        });
      }
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('order.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('order.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    // Count total
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const orders = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  /**
   * Update order
   */
  async updateOrder(orderId: string, updateData: OrderUpdateData): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition if status is being updated
    if (updateData.status && updateData.status !== order.status) {
      if (!order.canTransitionTo(updateData.status)) {
        throw new Error(`Cannot transition order from ${order.status} to ${updateData.status}`);
      }
      order.updateStatus(updateData.status);
    }

    // Update other fields
    Object.assign(order, updateData);

    return await this.orderRepository.save(order);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.isCancellable) {
      throw new Error(`Order with status ${order.status} cannot be cancelled`);
    }

    // Restore product stock
    for (const item of order.items) {
      await this.productRepository.increment(
        { id: item.productId },
        'stockQuantity',
        item.quantity
      );
    }

    // Update order status
    order.updateStatus(OrderStatus.CANCELLED);
    if (reason) {
      order.adminNotes = (order.adminNotes || '') + `\nCancellation reason: ${reason}`;
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Process payment for order
   */
  async processPayment(
    orderId: string,
    paymentData: {
      transactionId: string;
      amount: number;
      status: PaymentStatus;
    }
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (paymentData.amount !== order.totalAmount) {
      throw new Error('Payment amount does not match order total');
    }

    order.paymentStatus = paymentData.status;
    order.paymentTransactionId = paymentData.transactionId;

    // If payment is successful, move order to confirmed status
    if (paymentData.status === PaymentStatus.CAPTURED && order.status === OrderStatus.PENDING) {
      order.updateStatus(OrderStatus.CONFIRMED);
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Fulfill order items
   */
  async fulfillOrderItem(
    orderItemId: string,
    quantity: number
  ): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id: orderItemId },
      relations: ['order']
    });

    if (!orderItem) {
      throw new Error('Order item not found');
    }

    orderItem.fulfillQuantity(quantity);
    await this.orderItemRepository.save(orderItem);

    // Check if all items in the order are fulfilled
    const allItems = await this.orderItemRepository.find({
      where: { orderId: orderItem.orderId }
    });

    const allFulfilled = allItems.every(item => item.isFullyFulfilled);
    
    if (allFulfilled && orderItem.order.status === OrderStatus.PROCESSING) {
      await this.updateOrder(orderItem.orderId, { status: OrderStatus.SHIPPED });
    }

    return orderItem;
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(filters: Partial<OrderFilters> = {}): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByPaymentStatus: Record<PaymentStatus, number>;
  }> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    // Apply filters
    if (filters.userId) {
      queryBuilder.where('order.userId = :userId', { userId: filters.userId });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('order.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('order.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    const orders = await queryBuilder.getMany();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Count by status
    const ordersByStatus = {} as Record<OrderStatus, number>;
    const ordersByPaymentStatus = {} as Record<PaymentStatus, number>;

    Object.values(OrderStatus).forEach(status => {
      ordersByStatus[status] = 0;
    });

    Object.values(PaymentStatus).forEach(status => {
      ordersByPaymentStatus[status] = 0;
    });

    orders.forEach(order => {
      ordersByStatus[order.status]++;
      ordersByPaymentStatus[order.paymentStatus]++;
    });

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      ordersByPaymentStatus
    };
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const prefix = 'TMF';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    let orderNumber = `${prefix}${timestamp}${random}`;
    
    // Ensure uniqueness
    while (await this.orderRepository.findOne({ where: { orderNumber } })) {
      const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      orderNumber = `${prefix}${timestamp}${newRandom}`;
    }
    
    return orderNumber;
  }
}
