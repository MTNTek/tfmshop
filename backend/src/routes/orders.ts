import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  CheckoutSchema,
  OrderStatusUpdateSchema,
  OrderCancellationSchema,
  OrderIdParamsSchema,
  OrderHistoryQuerySchema,
  OrderStatisticsQuerySchema,
} from '../types/order';

/**
 * Order routes
 * Base path: /api/orders
 * All routes require authentication
 */
const router = Router();
const orderController = new OrderController();

// Apply authentication middleware to all order routes
router.use(authenticateToken);

/**
 * POST /api/orders
 * Create order from cart (checkout)
 */
router.post('/', validateBody(CheckoutSchema), orderController.checkout);

/**
 * GET /api/orders
 * Get user's order history with pagination and filtering
 */
router.get('/', validateQuery(OrderHistoryQuerySchema), orderController.getOrderHistory);

/**
 * GET /api/orders/statistics
 * Get order statistics (Admin only)
 * Note: This route must come before /:orderId to avoid conflicts
 */
router.get(
  '/statistics',
  requireAdmin,
  validateQuery(OrderStatisticsQuerySchema),
  orderController.getOrderStatistics
);

/**
 * GET /api/orders/:orderId
 * Get specific order details
 */
router.get(
  '/:orderId',
  validateParams(OrderIdParamsSchema),
  orderController.getOrderById
);

/**
 * POST /api/orders/:orderId/cancel
 * Cancel order (customer can cancel their own orders)
 */
router.post(
  '/:orderId/cancel',
  validateParams(OrderIdParamsSchema),
  validateBody(OrderCancellationSchema),
  orderController.cancelOrder
);

/**
 * PUT /api/orders/:orderId/status
 * Update order status (Admin only)
 */
router.put(
  '/:orderId/status',
  requireAdmin,
  validateParams(OrderIdParamsSchema),
  validateBody(OrderStatusUpdateSchema),
  orderController.updateOrderStatus
);

export default router;