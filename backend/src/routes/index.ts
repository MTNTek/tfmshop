import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import categoryRoutes from './categories';
import cartRoutes from './cart';
import orderRoutes from './orders';
import userRoutes from './users';
import imageRoutes from './images';
import adminRoutes from './admin';

/**
 * Main API router
 * Combines all route modules
 */
const router = Router();

// Authentication routes
router.use('/auth', authRoutes);

// Product routes
router.use('/products', productRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Cart routes
router.use('/cart', cartRoutes);

// Order routes
router.use('/orders', orderRoutes);

// User routes
router.use('/users', userRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Image routes
router.use('/images', imageRoutes);

export default router;