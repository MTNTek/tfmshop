import { Response } from 'express';
import { OrderService, CheckoutData, OrderHistoryOptions } from '../services/OrderService';
import { AuthenticatedRequest } from '../middleware/auth';
import { OrderStatus } from '../entities/Order';
import {
  CheckoutRequest,
  OrderResponse,
  OrderHistoryResponse,
  OrderStatusUpdateRequest,
  OrderStatisticsResponse,
} from '../types/order';

/**
 * Order controller handling order operations
 */
export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Create order from cart (checkout)
   * POST /api/orders
   */
  checkout = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const checkoutData: CheckoutData = req.body;

      const order = await this.orderService.createOrder(userId, checkoutData);

      const response: OrderResponse = {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productTitle: item.productTitle,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        customerNotes: order.customerNotes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };

      res.status(201).json({
        success: true,
        data: response,
        message: 'Order created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      
      let statusCode = 500;
      let errorCode = 'ORDER_CREATION_ERROR';

      if (errorMessage.includes('Cart is empty')) {
        statusCode = 400;
        errorCode = 'EMPTY_CART';
      } else if (errorMessage.includes('address not found')) {
        statusCode = 404;
        errorCode = 'ADDRESS_NOT_FOUND';
      } else if (errorMessage.includes('address') && errorMessage.includes('required')) {
        statusCode = 400;
        errorCode = 'MISSING_ADDRESS';
      } else if (errorMessage.includes('validation failed')) {
        statusCode = 400;
        errorCode = 'CART_VALIDATION_ERROR';
      } else if (errorMessage.includes('out of stock') || errorMessage.includes('available')) {
        statusCode = 400;
        errorCode = 'INSUFFICIENT_STOCK';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get user's order history
   * GET /api/orders
   */
  getOrderHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const options: OrderHistoryOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        status: req.query.status as OrderStatus,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const result = await this.orderService.getOrderHistory(userId, options);

      const response: OrderHistoryResponse = {
        orders: result.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          status: order.status,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            productTitle: item.productTitle,
            productImage: item.productImage,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            totalPrice: item.totalPrice,
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          total: order.total,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod,
          trackingNumber: order.trackingNumber,
          customerNotes: order.customerNotes,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Order history retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve order history';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_HISTORY_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get specific order details
   * GET /api/orders/:orderId
   */
  getOrderById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { orderId } = req.params;

      const order = await this.orderService.getOrderById(userId, orderId);

      const response: OrderResponse = {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productTitle: item.productTitle,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        customerNotes: order.customerNotes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Order retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve order';
      
      let statusCode = 500;
      let errorCode = 'ORDER_RETRIEVAL_ERROR';

      if (errorMessage.includes('Order not found')) {
        statusCode = 404;
        errorCode = 'ORDER_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Cancel order
   * POST /api/orders/:orderId/cancel
   */
  cancelOrder = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await this.orderService.cancelOrder(userId, orderId, reason);

      const response: OrderResponse = {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productTitle: item.productTitle,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        customerNotes: order.customerNotes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Order cancelled successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      
      let statusCode = 500;
      let errorCode = 'ORDER_CANCELLATION_ERROR';

      if (errorMessage.includes('Order not found')) {
        statusCode = 404;
        errorCode = 'ORDER_NOT_FOUND';
      } else if (errorMessage.includes('cannot be cancelled')) {
        statusCode = 400;
        errorCode = 'ORDER_NOT_CANCELLABLE';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Update order status (Admin only)
   * PUT /api/orders/:orderId/status
   */
  updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber }: OrderStatusUpdateRequest = req.body;

      const order = await this.orderService.updateOrderStatus(orderId, status, trackingNumber);

      const response: OrderResponse = {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productTitle: item.productTitle,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        customerNotes: order.customerNotes,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Order status updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      
      let statusCode = 500;
      let errorCode = 'ORDER_STATUS_UPDATE_ERROR';

      if (errorMessage.includes('Order not found')) {
        statusCode = 404;
        errorCode = 'ORDER_NOT_FOUND';
      } else if (errorMessage.includes('Invalid status transition')) {
        statusCode = 400;
        errorCode = 'INVALID_STATUS_TRANSITION';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get order statistics (Admin only)
   * GET /api/orders/statistics
   */
  getOrderStatistics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await this.orderService.getOrderStatistics(startDate, endDate);

      const response: OrderStatisticsResponse = {
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        averageOrderValue: stats.averageOrderValue,
        ordersByStatus: stats.ordersByStatus,
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Order statistics retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve order statistics';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_STATISTICS_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };
}