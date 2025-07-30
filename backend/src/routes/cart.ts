import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  CartItemParamsSchema,
} from '../types/cart';

/**
 * Cart routes
 * Base path: /api/cart
 * All routes require authentication
 */
const router = Router();
const cartController = new CartController();

// Apply authentication middleware to all cart routes
router.use(authenticateToken);

/**
 * GET /api/cart
 * Get user's cart with all items
 */
router.get('/', cartController.getCart);

/**
 * POST /api/cart/items
 * Add item to cart or update quantity if item already exists
 */
router.post('/items', validateBody(AddToCartSchema), cartController.addItem);

/**
 * PUT /api/cart/items/:itemId
 * Update cart item quantity
 */
router.put(
  '/items/:itemId',
  validateParams(CartItemParamsSchema),
  validateBody(UpdateCartItemSchema),
  cartController.updateItem
);

/**
 * DELETE /api/cart/items/:itemId
 * Remove specific item from cart
 */
router.delete(
  '/items/:itemId',
  validateParams(CartItemParamsSchema),
  cartController.removeItem
);

/**
 * DELETE /api/cart
 * Clear entire cart (remove all items)
 */
router.delete('/', cartController.clearCart);

/**
 * GET /api/cart/totals
 * Get cart totals (subtotal, item count, etc.)
 */
router.get('/totals', cartController.getTotals);

/**
 * GET /api/cart/validate
 * Validate cart contents (check availability, price changes, etc.)
 */
router.get('/validate', cartController.validateCart);

/**
 * POST /api/cart/update-prices
 * Update cart item prices to current product prices
 */
router.post('/update-prices', cartController.updatePrices);

export default router;