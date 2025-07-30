import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { UserRole } from '../entities/User';
import { z } from 'zod';

const router = Router();
const orderController = new OrderController();

// Validation schemas for route-specific validation
const cancelOrderValidation = z.object({
  reason: z.string().optional()
});

/**
 * @route POST /api/orders
 * @desc Create order from cart
 * @access Private (authenticated users)
 */
router.post('/', authenticateToken, orderController.createOrder);

/**
 * @route GET /api/orders/my
 * @desc Get current user's orders
 * @access Private (authenticated users)
 */
router.get('/my', authenticateToken, orderController.getUserOrders);

/**
 * @route GET /api/orders/statistics
 * @desc Get order statistics
 * @access Private (admin only)
 */
router.get('/statistics', authenticateToken, requireRole([UserRole.ADMIN]), orderController.getOrderStatistics);

/**
 * @route GET /api/orders/:orderId
 * @desc Get specific order
 * @access Private (authenticated users - own orders, admin - all orders)
 */
router.get('/:orderId', authenticateToken, orderController.getOrder);

/**
 * @route PUT /api/orders/:orderId
 * @desc Update order
 * @access Private (admin only)
 */
router.put('/:orderId', authenticateToken, requireRole([UserRole.ADMIN]), orderController.updateOrder);

/**
 * @route POST /api/orders/:orderId/cancel
 * @desc Cancel order
 * @access Private (authenticated users - own orders, admin - all orders)
 */
router.post('/:orderId/cancel', authenticateToken, validateBody(cancelOrderValidation), orderController.cancelOrder);

/**
 * @route POST /api/orders/:orderId/payment
 * @desc Process payment for order
 * @access Private (admin only)
 */
router.post('/:orderId/payment', authenticateToken, requireRole([UserRole.ADMIN]), orderController.processPayment);

/**
 * @route POST /api/orders/items/:itemId/fulfill
 * @desc Fulfill order item
 * @access Private (admin only)
 */
router.post('/items/:itemId/fulfill', authenticateToken, requireRole([UserRole.ADMIN]), orderController.fulfillOrderItem);

export default router;
