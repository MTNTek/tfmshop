import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, logAdminAction } from '../middleware/adminAuth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { z } from 'zod';

/**
 * Admin routes
 * Base path: /api/admin
 * All routes require authentication and admin privileges
 */
const router = Router();
const adminController = new AdminController();

// Apply authentication and admin middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * Dashboard and Analytics
 */

/**
 * GET /api/admin/dashboard
 * Get dashboard analytics
 */
router.get('/dashboard', logAdminAction('VIEW_DASHBOARD'), adminController.getDashboard);

/**
 * GET /api/admin/statistics/users
 * Get user statistics
 */
router.get('/statistics/users', logAdminAction('VIEW_USER_STATISTICS'), adminController.getUserStatistics);

/**
 * GET /api/admin/statistics/orders
 * Get order statistics
 */
router.get('/statistics/orders', logAdminAction('VIEW_ORDER_STATISTICS'), adminController.getOrderStatistics);

/**
 * User Management
 */

// User query validation schema
const UserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  role: z.enum(['customer', 'admin']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'email', 'firstName', 'lastName']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
});

// User update validation schema
const AdminUserUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(['customer', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

// User ID parameter validation
const UserParamsSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),
});

/**
 * GET /api/admin/users
 * Get paginated list of users
 */
router.get('/users', 
  validateQuery(UserQuerySchema),
  logAdminAction('VIEW_USERS'),
  adminController.getUsers
);

/**
 * GET /api/admin/users/:userId
 * Get user by ID with full details
 */
router.get('/users/:userId',
  validateParams(UserParamsSchema),
  logAdminAction('VIEW_USER_DETAILS'),
  adminController.getUserById
);

/**
 * PUT /api/admin/users/:userId
 * Update user information
 */
router.put('/users/:userId',
  validateParams(UserParamsSchema),
  validateBody(AdminUserUpdateSchema),
  logAdminAction('UPDATE_USER'),
  adminController.updateUser
);

/**
 * DELETE /api/admin/users/:userId
 * Delete user (deactivate)
 */
router.delete('/users/:userId',
  validateParams(UserParamsSchema),
  logAdminAction('DELETE_USER'),
  adminController.deleteUser
);

/**
 * Order Management
 */

// Order query validation schema
const OrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  userId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'total', 'orderNumber']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
});

// Order status update validation schema
const OrderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  trackingNumber: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

// Order ID parameter validation
const OrderParamsSchema = z.object({
  orderId: z.string().uuid('Order ID must be a valid UUID'),
});

/**
 * GET /api/admin/orders
 * Get paginated list of orders
 */
router.get('/orders',
  validateQuery(OrderQuerySchema),
  logAdminAction('VIEW_ORDERS'),
  adminController.getOrders
);

/**
 * PUT /api/admin/orders/:orderId/status
 * Update order status
 */
router.put('/orders/:orderId/status',
  validateParams(OrderParamsSchema),
  validateBody(OrderStatusUpdateSchema),
  logAdminAction('UPDATE_ORDER_STATUS'),
  adminController.updateOrderStatus
);

/**
 * Search and Activity
 */

// Search query validation schema
const SearchQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters long'),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

// Activity query validation schema
const ActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// Statistics query validation schema
const StatisticsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * GET /api/admin/search/users
 * Search users
 */
router.get('/search/users',
  validateQuery(SearchQuerySchema),
  logAdminAction('SEARCH_USERS'),
  adminController.searchUsers
);

/**
 * GET /api/admin/search/orders
 * Search orders
 */
router.get('/search/orders',
  validateQuery(SearchQuerySchema),
  logAdminAction('SEARCH_ORDERS'),
  adminController.searchOrders
);

/**
 * GET /api/admin/activity
 * Get recent activity
 */
router.get('/activity',
  validateQuery(ActivityQuerySchema),
  logAdminAction('VIEW_ACTIVITY'),
  adminController.getRecentActivity
);

/**
 * System Health
 */

/**
 * GET /api/admin/health
 * Get system health metrics
 */
router.get('/health', logAdminAction('VIEW_SYSTEM_HEALTH'), adminController.getSystemHealth);

export default router;