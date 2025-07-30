import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { OrderService, CreateOrderData, OrderFilters, OrderUpdateData } from '../services/OrderService';
import { OrderStatus, PaymentStatus } from '../entities';
import { z } from 'zod';

// Validation schemas
const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phoneNumber: z.string().optional()
  }),
  billingAddress: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phoneNumber: z.string().optional()
  }).optional(),
  shippingMethod: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  customerNotes: z.string().optional()
});

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  adminNotes: z.string().optional(),
  shippingMethod: z.string().optional()
});

const processPaymentSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amount: z.number().positive('Amount must be positive'),
  status: z.nativeEnum(PaymentStatus)
});

const fulfillItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive')
});

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Create order from cart
   */
  createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validation = createOrderSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validation.error.errors
        });
        return;
      }

      const userId = req.user!.id;
      const orderData: CreateOrderData = {
        userId,
        ...validation.data
      };

      const order = await this.orderService.createOrderFromCart(userId, orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      const message = error instanceof Error ? error.message : 'Failed to create order';
      
      if (message.includes('empty') || message.includes('not found')) {
        res.status(400).json({ success: false, error: message });
      } else if (message.includes('available') || message.includes('stock')) {
        res.status(409).json({ success: false, error: message });
      } else {
        res.status(500).json({ success: false, error: message });
      }
    }
  };

  /**
   * Get order by ID
   */
  getOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orderId = req.params.orderId;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      // Check if user can access this order
      if (userRole !== 'admin' && order.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: this.formatOrderResponse(order)
      });
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get order'
      });
    }
  };

  /**
   * Get user's orders
   */
  getUserOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: Partial<OrderFilters> = {};
      
      if (req.query.status) {
        filters.status = req.query.status as OrderStatus;
      }
      
      if (req.query.paymentStatus) {
        filters.paymentStatus = req.query.paymentStatus as PaymentStatus;
      }

      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }

      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      const result = await this.orderService.getUserOrders(userId, page, limit, filters);

      res.json({
        success: true,
        data: {
          orders: result.orders.map(order => this.formatOrderResponse(order)),
          pagination: {
            total: result.total,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit
          }
        }
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get orders'
      });
    }
  };

  /**
   * Update order (admin only)
   */
  updateOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validation = updateOrderSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validation.error.errors
        });
        return;
      }

      const orderId = req.params.orderId;
      const updateData: OrderUpdateData = validation.data;

      const order = await this.orderService.updateOrder(orderId, updateData);

      res.json({
        success: true,
        message: 'Order updated successfully',
        data: this.formatOrderResponse(order)
      });
    } catch (error) {
      console.error('Error updating order:', error);
      const message = error instanceof Error ? error.message : 'Failed to update order';
      
      if (message.includes('not found')) {
        res.status(404).json({ success: false, error: message });
      } else if (message.includes('transition') || message.includes('Cannot')) {
        res.status(400).json({ success: false, error: message });
      } else {
        res.status(500).json({ success: false, error: message });
      }
    }
  };

  /**
   * Cancel order
   */
  cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orderId = req.params.orderId;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const reason = req.body.reason;

      // Get order first to check ownership
      const existingOrder = await this.orderService.getOrderById(orderId);
      
      if (!existingOrder) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      // Check if user can cancel this order
      if (userRole !== 'admin' && existingOrder.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }

      const order = await this.orderService.cancelOrder(orderId, reason);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: this.formatOrderResponse(order)
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel order';
      
      if (message.includes('not found')) {
        res.status(404).json({ success: false, error: message });
      } else if (message.includes('cannot be cancelled')) {
        res.status(400).json({ success: false, error: message });
      } else {
        res.status(500).json({ success: false, error: message });
      }
    }
  };

  /**
   * Process payment (admin only)
   */
  processPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validation = processPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validation.error.errors
        });
        return;
      }

      const orderId = req.params.orderId;
      const paymentData = validation.data;

      const order = await this.orderService.processPayment(orderId, paymentData);

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: this.formatOrderResponse(order)
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to process payment';
      
      if (message.includes('not found')) {
        res.status(404).json({ success: false, error: message });
      } else if (message.includes('does not match')) {
        res.status(400).json({ success: false, error: message });
      } else {
        res.status(500).json({ success: false, error: message });
      }
    }
  };

  /**
   * Fulfill order item (admin only)
   */
  fulfillOrderItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const validation = fulfillItemSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validation.error.errors
        });
        return;
      }

      const orderItemId = req.params.itemId;
      const { quantity } = validation.data;

      const orderItem = await this.orderService.fulfillOrderItem(orderItemId, quantity);

      res.json({
        success: true,
        message: 'Order item fulfilled successfully',
        data: {
          orderItemId: orderItem.id,
          fulfilledQuantity: orderItem.fulfilledQuantity,
          remainingQuantity: orderItem.remainingQuantity,
          fulfillmentStatus: orderItem.fulfillmentStatus
        }
      });
    } catch (error) {
      console.error('Error fulfilling order item:', error);
      const message = error instanceof Error ? error.message : 'Failed to fulfill order item';
      
      if (message.includes('not found')) {
        res.status(404).json({ success: false, error: message });
      } else if (message.includes('Cannot fulfill') || message.includes('must be greater')) {
        res.status(400).json({ success: false, error: message });
      } else {
        res.status(500).json({ success: false, error: message });
      }
    }
  };

  /**
   * Get order statistics (admin only)
   */
  getOrderStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const filters: Partial<OrderFilters> = {};

      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }

      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      const statistics = await this.orderService.getOrderStatistics(filters);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting order statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get order statistics'
      });
    }
  };

  /**
   * Format order response
   */
  private formatOrderResponse(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      discountAmount: order.discountAmount,
      currency: order.currency,
      itemCount: order.itemCount,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      paymentMethod: order.paymentMethod,
      customerNotes: order.customerNotes,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      items: order.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.productTitle,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        originalPrice: item.originalPrice,
        discountAmount: item.discountAmount,
        lineTotal: item.lineTotal,
        selectedVariant: item.selectedVariant,
        customizations: item.customizations,
        fulfillmentStatus: item.fulfillmentStatus,
        fulfilledQuantity: item.fulfilledQuantity,
        remainingQuantity: item.remainingQuantity,
        product: item.product ? {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          images: item.product.images,
          price: item.product.price
        } : null
      }))
    };
  }
}
