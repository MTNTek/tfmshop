import { Response } from 'express';
import { AdminService, UserQueryOptions, OrderQueryOptions, AdminUserUpdateData } from '../services/AdminService';
import { AuthenticatedRequest } from '../middleware/auth';
import { OrderStatus } from '../entities/Order';

/**
 * Admin controller handling administrative operations
 */
export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Get dashboard analytics
   * GET /api/admin/dashboard
   */
  getDashboard = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const analytics = await this.adminService.getDashboardAnalytics(days);

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Dashboard analytics retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve dashboard analytics';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DASHBOARD_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get paginated list of users
   * GET /api/admin/users
   */
  getUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const options: UserQueryOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        role: req.query.role as any,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'DESC',
      };

      const result = await this.adminService.getUsers(options);

      res.status(200).json({
        success: true,
        data: {
          users: result.users.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            addressCount: user.addresses?.length || 0,
            orderCount: user.orders?.length || 0,
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        message: 'Users retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve users';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_RETRIEVAL_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get user by ID with full details
   * GET /api/admin/users/:userId
   */
  getUserById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await this.adminService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          addresses: user.addresses?.map(address => ({
            id: address.id,
            type: address.type,
            firstName: address.firstName,
            lastName: address.lastName,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone,
            isDefault: address.isDefault,
            label: address.label,
            formattedAddress: address.formattedAddress,
          })) || [],
          orders: user.orders?.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: order.total,
            createdAt: order.createdAt.toISOString(),
            itemCount: order.items?.length || 0,
          })) || [],
        },
        message: 'User details retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve user';
      
      let statusCode = 500;
      let errorCode = 'USER_RETRIEVAL_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
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
   * Update user information
   * PUT /api/admin/users/:userId
   */
  updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const updateData: AdminUserUpdateData = req.body;

      const updatedUser = await this.adminService.updateUser(userId, updateData);

      res.status(200).json({
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        },
        message: 'User updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      
      let statusCode = 500;
      let errorCode = 'USER_UPDATE_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      } else if (errorMessage.includes('already in use')) {
        statusCode = 400;
        errorCode = 'EMAIL_ALREADY_EXISTS';
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
   * Delete user (deactivate)
   * DELETE /api/admin/users/:userId
   */
  deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      await this.adminService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      
      let statusCode = 500;
      let errorCode = 'USER_DELETE_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      } else if (errorMessage.includes('Cannot delete admin')) {
        statusCode = 400;
        errorCode = 'CANNOT_DELETE_ADMIN';
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
   * Get paginated list of orders
   * GET /api/admin/orders
   */
  getOrders = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const options: OrderQueryOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as OrderStatus,
        userId: req.query.userId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'DESC',
      };

      const result = await this.adminService.getOrders(options);

      res.status(200).json({
        success: true,
        data: {
          orders: result.orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            statusDisplay: order.statusDisplay,
            subtotal: order.subtotal,
            tax: order.tax,
            shipping: order.shipping,
            total: order.total,
            totalItems: order.totalItems,
            user: {
              id: order.user.id,
              email: order.user.email,
              fullName: order.user.fullName,
            },
            items: order.items?.map(item => ({
              id: item.id,
              productTitle: item.productTitle,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })) || [],
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            trackingNumber: order.trackingNumber,
            notes: order.notes,
            customerNotes: order.customerNotes,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            shippedAt: order.shippedAt?.toISOString(),
            deliveredAt: order.deliveredAt?.toISOString(),
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        message: 'Orders retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve orders';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_RETRIEVAL_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Update order status
   * PUT /api/admin/orders/:orderId/status
   */
  updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber, notes } = req.body;

      const updatedOrder = await this.adminService.updateOrderStatus(orderId, status, trackingNumber, notes);

      res.status(200).json({
        success: true,
        data: {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          statusDisplay: updatedOrder.statusDisplay,
          trackingNumber: updatedOrder.trackingNumber,
          notes: updatedOrder.notes,
          updatedAt: updatedOrder.updatedAt.toISOString(),
          shippedAt: updatedOrder.shippedAt?.toISOString(),
          deliveredAt: updatedOrder.deliveredAt?.toISOString(),
        },
        message: 'Order status updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      
      let statusCode = 500;
      let errorCode = 'ORDER_UPDATE_ERROR';

      if (errorMessage.includes('not found')) {
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
   * Get user statistics
   * GET /api/admin/statistics/users
   */
  getUserStatistics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const statistics = await this.adminService.getUserStatistics();

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'User statistics retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve user statistics';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'STATISTICS_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get order statistics
   * GET /api/admin/statistics/orders
   */
  getOrderStatistics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const statistics = await this.adminService.getOrderStatistics(startDate, endDate);

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Order statistics retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve order statistics';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'STATISTICS_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Search users
   * GET /api/admin/search/users
   */
  searchUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SEARCH_QUERY',
            message: 'Search query must be at least 2 characters long',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
        return;
      }

      const users = await this.adminService.searchUsers(query, limit);

      res.status(200).json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
        })),
        message: 'User search completed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search users';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Search orders
   * GET /api/admin/search/orders
   */
  searchOrders = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SEARCH_QUERY',
            message: 'Search query must be at least 2 characters long',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
        return;
      }

      const orders = await this.adminService.searchOrders(query, limit);

      res.status(200).json({
        success: true,
        data: orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          user: {
            id: order.user.id,
            email: order.user.email,
            fullName: order.user.fullName,
          },
          createdAt: order.createdAt.toISOString(),
        })),
        message: 'Order search completed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search orders';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get recent activity
   * GET /api/admin/activity
   */
  getRecentActivity = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activity = await this.adminService.getRecentActivity(limit);

      res.status(200).json({
        success: true,
        data: {
          recentUsers: activity.recentUsers.map(user => ({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
          })),
          recentOrders: activity.recentOrders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: order.total,
            user: {
              id: order.user.id,
              email: order.user.email,
              fullName: order.user.fullName,
            },
            createdAt: order.createdAt.toISOString(),
          })),
        },
        message: 'Recent activity retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve recent activity';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ACTIVITY_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get system health
   * GET /api/admin/health
   */
  getSystemHealth = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const health = await this.adminService.getSystemHealth();

      res.status(200).json({
        success: true,
        data: health,
        message: 'System health retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve system health';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };
}