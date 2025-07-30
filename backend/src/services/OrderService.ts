import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Order, OrderStatus } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { User } from '../entities/User';
import { Address } from '../entities/Address';
import { Product } from '../entities/Product';
import { CartService } from './CartService';

/**
 * Interface for checkout data
 */
export interface CheckoutData {
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod?: string;
  customerNotes?: string;
}

/**
 * Interface for order totals calculation
 */
export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

/**
 * Interface for order history query options
 */
export interface OrderHistoryOptions {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Service class for managing order operations
 */
export class OrderService {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private userRepository: Repository<User>;
  private addressRepository: Repository<Address>;
  private productRepository: Repository<Product>;
  private cartService: CartService;

  // Tax and shipping configuration
  private readonly TAX_RATE = 0.08; // 8% tax rate
  private readonly FREE_SHIPPING_THRESHOLD = 100; // Free shipping over $100
  private readonly STANDARD_SHIPPING_RATE = 9.99;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
    this.userRepository = AppDataSource.getRepository(User);
    this.addressRepository = AppDataSource.getRepository(Address);
    this.productRepository = AppDataSource.getRepository(Product);
    this.cartService = new CartService();
  }

  /**
   * Create order from user's cart
   */
  async createOrder(userId: string, checkoutData: CheckoutData): Promise<Order> {
    // Start transaction
    return await AppDataSource.transaction(async (manager) => {
      // Get user's cart and validate
      const cart = await this.cartService.getCart(userId);
      
      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate cart contents
      const validation = await this.cartService.validateCart(userId);
      if (!validation.isValid) {
        throw new Error(`Cart validation failed: ${validation.errors.join(', ')}`);
      }

      // Get or validate addresses
      const shippingAddress = await this.getOrderAddress(
        userId, 
        checkoutData.shippingAddressId, 
        checkoutData.shippingAddress,
        'shipping'
      );
      
      const billingAddress = await this.getOrderAddress(
        userId, 
        checkoutData.billingAddressId, 
        checkoutData.billingAddress || checkoutData.shippingAddress,
        'billing'
      );

      // Calculate totals
      const totals = this.calculateOrderTotals(cart.subtotal);

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order
      const order = manager.getRepository(Order).create({
        orderNumber,
        userId,
        status: OrderStatus.PENDING,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        shippingAddress,
        billingAddress,
        paymentMethod: checkoutData.paymentMethod,
        customerNotes: checkoutData.customerNotes,
      });

      const savedOrder = await manager.getRepository(Order).save(order);

      // Create order items from cart items
      const orderItems = cart.items.map(cartItem => {
        return manager.getRepository(OrderItem).create({
          orderId: savedOrder.id,
          productId: cartItem.productId,
          productTitle: cartItem.product.title,
          productDescription: cartItem.product.description,
          productSku: cartItem.product.sku,
          quantity: cartItem.quantity,
          unitPrice: cartItem.price,
          discount: 0, // No discounts for now
          productImage: cartItem.product.images?.[0],
          productSpecifications: cartItem.product.specifications,
        });
      });

      await manager.getRepository(OrderItem).save(orderItems);

      // Update product stock quantities
      for (const cartItem of cart.items) {
        const product = await manager.getRepository(Product).findOne({
          where: { id: cartItem.productId }
        });
        
        if (product) {
          product.stockQuantity -= cartItem.quantity;
          if (product.stockQuantity <= 0) {
            product.inStock = false;
          }
          await manager.getRepository(Product).save(product);
        }
      }

      // Clear the cart
      await this.cartService.clearCart(userId);

      // Return order with items
      return await manager.getRepository(Order).findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'items.product'],
      }) as Order;
    });
  }

  /**
   * Calculate order totals including tax and shipping
   */
  calculateOrderTotals(subtotal: number): OrderTotals {
    const tax = Math.round(subtotal * this.TAX_RATE * 100) / 100;
    const shipping = subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.STANDARD_SHIPPING_RATE;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      shipping,
      total,
    };
  }

  /**
   * Generate unique order number
   */
  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD${timestamp.slice(-8)}${random}`;

    // Check if order number already exists (very unlikely)
    const existingOrder = await this.orderRepository.findOne({
      where: { orderNumber }
    });

    if (existingOrder) {
      // Recursively generate new number if collision occurs
      return await this.generateOrderNumber();
    }

    return orderNumber;
  }

  /**
   * Get order by ID for a specific user
   */
  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  /**
   * Get order history for a user with pagination
   */
  async getOrderHistory(userId: string, options: OrderHistoryOptions = {}): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
    } = options;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const orders = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new Error(`Invalid status transition from ${order.status} to ${status}`);
    }

    order.status = status;

    // Set timestamps based on status
    if (status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
    } else if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Cancel order if possible
   */
  async cancelOrder(userId: string, orderId: string, reason?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.canBeCancelled) {
      throw new Error('Order cannot be cancelled in its current status');
    }

    // Restore product stock
    await AppDataSource.transaction(async (manager) => {
      for (const item of order.items) {
        const product = await manager.getRepository(Product).findOne({
          where: { id: item.productId }
        });
        
        if (product) {
          product.stockQuantity += item.quantity;
          product.inStock = true;
          await manager.getRepository(Product).save(product);
        }
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;
      if (reason) {
        order.notes = reason;
      }
      await manager.getRepository(Order).save(order);
    });

    return order;
  }

  /**
   * Get order statistics for admin
   */
  async getOrderStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
  }> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    const orders = await queryBuilder.getMany();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      ordersByStatus,
    };
  }

  /**
   * Get or validate address for order
   */
  private async getOrderAddress(
    userId: string,
    addressId?: string,
    addressData?: any,
    type: 'shipping' | 'billing' = 'shipping'
  ): Promise<any> {
    if (addressId) {
      // Use existing address
      const address = await this.addressRepository.findOne({
        where: { id: addressId, userId }
      });

      if (!address) {
        throw new Error(`${type} address not found`);
      }

      if (type === 'shipping' && !address.canBeUsedForShipping()) {
        throw new Error('Address cannot be used for shipping');
      }

      if (type === 'billing' && !address.canBeUsedForBilling()) {
        throw new Error('Address cannot be used for billing');
      }

      return address.toOrderAddress();
    } else if (addressData) {
      // Use provided address data
      this.validateAddressData(addressData, type);
      return addressData;
    } else {
      throw new Error(`${type} address is required`);
    }
  }

  /**
   * Validate address data completeness
   */
  private validateAddressData(addressData: any, type: string): void {
    const required = ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
    
    for (const field of required) {
      if (!addressData[field]) {
        throw new Error(`${type} address ${field} is required`);
      }
    }
  }

  /**
   * Check if status transition is valid
   */
  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}