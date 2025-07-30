import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import categoryRoutes from './categories';
import cartRoutes from './cart';
import orderRoutes from './orders';

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

export default router;