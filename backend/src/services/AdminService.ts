import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { Order, OrderStatus } from '../entities/Order';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { OrderService } from './OrderService';

/**
 * Interface for user query options
 */
export interface UserQueryOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'email' | 'firstName' | 'lastName';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Interface for order query options
 */
export interface OrderQueryOptions {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: 'createdAt' | 'total' | 'orderNumber';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Interface for user update data (admin only)
 */
export interface AdminUserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * Interface for dashboard analytics
 */
export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
  };
  recentActivity: {
    newUsers: number;
    newOrders: number;
    revenueToday: number;
    ordersToday: number;
  };
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: Array<{
    productId: string;
    productTitle: string;
    totalSold: number;
    revenue: number;
  }>;
  salesTrend: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

/**
 * Service class for admin functionality
 */
export class AdminService {
  private userRepository: Repository<User>;
  private orderRepository: Repository<Order>;
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;
  private orderService: OrderService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.productRepository = AppDataSource.getRepository(Product);
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.orderService = new OrderService();
  }

  /**
   * Get paginated list of users with filtering
   */
  async getUsers(options: UserQueryOptions = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.addresses', 'addresses')
      .leftJoinAndSelect('user.orders', 'orders');

    // Apply filters
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const users = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user by ID with full details
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['addresses', 'orders', 'orders.items'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user information (admin only)
   */
  async updateUser(userId: string, updateData: AdminUserUpdateData): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Handle email change
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email is already in use');
      }

      user.email = updateData.email.toLowerCase().trim();
    }

    // Update other fields
    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName.trim();
    }

    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName.trim();
    }

    if (updateData.phone !== undefined) {
      user.phone = updateData.phone ? updateData.phone.trim() : undefined;
    }

    if (updateData.role !== undefined) {
      user.role = updateData.role;
    }

    if (updateData.isActive !== undefined) {
      user.isActive = updateData.isActive;
    }

    return await this.userRepository.save(user);
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow deleting admin users
    if (user.role === UserRole.ADMIN) {
      throw new Error('Cannot delete admin users');
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * Get paginated list of orders with filtering
   */
  async getOrders(options: OrderQueryOptions = {}): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      status,
      userId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    if (minAmount) {
      queryBuilder.andWhere('order.total >= :minAmount', { minAmount });
    }

    if (maxAmount) {
      queryBuilder.andWhere('order.total <= :maxAmount', { maxAmount });
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.orderNumber ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder);

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
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, notes?: string): Promise<Order> {
    const order = await this.orderService.updateOrderStatus(orderId, status, trackingNumber);

    // Add admin notes if provided
    if (notes) {
      order.notes = notes;
      await this.orderRepository.save(order);
    }

    return order;
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(days: number = 30): Promise<DashboardAnalytics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Overview statistics
    const totalUsers = await this.userRepository.count({ where: { isActive: true } });
    const totalOrders = await this.orderRepository.count();
    const totalProducts = await this.productRepository.count({ where: { isActive: true } });

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    // Recent activity (today)
    const newUsersToday = await this.userRepository.count({
      where: {
        createdAt: { $gte: today } as any,
        isActive: true,
      },
    });

    const newOrdersToday = await this.orderRepository.count({
      where: {
        createdAt: { $gte: today } as any,
      },
    });

    const todayRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.createdAt >= :today', { today })
      .andWhere('order.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      })
      .getRawOne();

    const revenueToday = parseFloat(todayRevenueResult?.total || '0');

    // Orders by status
    const orderStatusResults = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const ordersByStatus = orderStatusResults.reduce((acc, result) => {
      acc[result.status as OrderStatus] = parseInt(result.count);
      return acc;
    }, {} as Record<OrderStatus, number>);

    // Top products
    const topProductsResults = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.title', 'productTitle')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .addSelect('SUM(item.quantity * item.unitPrice)', 'revenue')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      })
      .groupBy('product.id, product.title')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(10)
      .getRawMany();

    const topProducts = topProductsResults.map(result => ({
      productId: result.productId,
      productTitle: result.productTitle,
      totalSold: parseInt(result.totalSold),
      revenue: parseFloat(result.revenue),
    }));

    // Sales trend (last 30 days)
    const salesTrendResults = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)', 'ASC')
      .getRawMany();

    const salesTrend = salesTrendResults.map(result => ({
      date: result.date,
      orders: parseInt(result.orders),
      revenue: parseFloat(result.revenue),
    }));

    return {
      overview: {
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
      },
      recentActivity: {
        newUsers: newUsersToday,
        newOrders: newOrdersToday,
        revenueToday,
        ordersToday: newOrdersToday,
      },
      ordersByStatus,
      topProducts,
      salesTrend,
    };
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    customerUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
  }> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    const inactiveUsers = totalUsers - activeUsers;
    const adminUsers = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
    const customerUsers = await this.userRepository.count({ where: { role: UserRole.CUSTOMER } });

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await this.userRepository.count({
      where: {
        createdAt: { $gte: startOfMonth } as any,
      },
    });

    // User growth rate (compared to last month)
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const usersLastMonth = await this.userRepository.count({
      where: {
        createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } as any,
      },
    });

    const userGrowthRate = usersLastMonth > 0 
      ? ((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100 
      : 0;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      customerUsers,
      newUsersThisMonth,
      userGrowthRate: Math.round(userGrowthRate * 100) / 100,
    };
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
  }> {
    return await this.orderService.getOrderStatistics(startDate, endDate);
  }

  /**
   * Search users by email or name
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.firstName ILIKE :query OR user.lastName ILIKE :query OR user.email ILIKE :query', {
        query: `%${query}%`,
      })
      .andWhere('user.isActive = true')
      .limit(limit)
      .getMany();
  }

  /**
   * Search orders by order number or user
   */
  async searchOrders(query: string, limit: number = 10): Promise<Order[]> {
    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.orderNumber ILIKE :query OR user.email ILIKE :query OR user.firstName ILIKE :query OR user.lastName ILIKE :query', {
        query: `%${query}%`,
      })
      .limit(limit)
      .getMany();
  }

  /**
   * Get recent activity for admin dashboard
   */
  async getRecentActivity(limit: number = 20): Promise<{
    recentUsers: User[];
    recentOrders: Order[];
  }> {
    const recentUsers = await this.userRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const recentOrders = await this.orderRepository.find({
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      recentUsers,
      recentOrders,
    };
  }

  /**
   * Validate admin permissions
   */
  async validateAdminUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new Error('Access denied: Admin privileges required');
    }

    return user;
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<{
    database: boolean;
    totalUsers: number;
    totalOrders: number;
    totalProducts: number;
    lastOrderTime: Date | null;
    systemUptime: number;
  }> {
    try {
      const totalUsers = await this.userRepository.count();
      const totalOrders = await this.orderRepository.count();
      const totalProducts = await this.productRepository.count();

      const lastOrder = await this.orderRepository.findOne({
        order: { createdAt: 'DESC' },
      });

      return {
        database: true,
        totalUsers,
        totalOrders,
        totalProducts,
        lastOrderTime: lastOrder?.createdAt || null,
        systemUptime: process.uptime(),
      };
    } catch (error) {
      return {
        database: false,
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        lastOrderTime: null,
        systemUptime: process.uptime(),
      };
    }
  }
}