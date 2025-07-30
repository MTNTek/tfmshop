import { Router } from 'express';
import { ProductController, CreateProductSchema, UpdateProductSchema, UpdateStockSchema } from '../controllers/ProductController';
import { validateBody } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadMultiple, handleUploadError } from '../middleware/upload';
import { z } from 'zod';

/**
 * Product routes
 * Base path: /api/products
 */
const router = Router();
const productController = new ProductController();

/**
 * GET /api/products
 * Get all products with filtering, sorting, and pagination
 */
router.get('/', productController.getProducts);

/**
 * GET /api/products/featured
 * Get featured products
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * GET /api/products/search
 * Search products
 */
router.get('/search', productController.searchProducts);

/**
 * GET /api/products/slug/:slug
 * Get product by slug
 */
router.get('/slug/:slug', productController.getProductBySlug);

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get('/:id', productController.getProductById);

/**
 * POST /api/products
 * Create a new product (Admin only)
 */
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  validateBody(CreateProductSchema),
  productController.createProduct
);

/**
 * PUT /api/products/:id
 * Update a product (Admin only)
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateBody(UpdateProductSchema),
  productController.updateProduct
);

/**
 * PATCH /api/products/:id/stock
 * Update product stock (Admin only)
 */
router.patch(
  '/:id/stock',
  authenticateToken,
  requireAdmin,
  validateBody(UpdateStockSchema),
  productController.updateStock
);

/**
 * DELETE /api/products/:id
 * Delete a product (Admin only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  productController.deleteProduct
);

/**
 * POST /api/products/:id/images
 * Upload images for a product (Admin only)
 */
router.post(
  '/:id/images',
  authenticateToken,
  requireAdmin,
  uploadMultiple('images', 10),
  handleUploadError,
  productController.uploadImages
);

/**
 * DELETE /api/products/:id/images/:filename
 * Delete a specific image from a product (Admin only)
 */
router.delete(
  '/:id/images/:filename',
  authenticateToken,
  requireAdmin,
  productController.deleteImage
);

/**
 * PUT /api/products/:id/images/reorder
 * Reorder product images (Admin only)
 */
router.put(
  '/:id/images/reorder',
  authenticateToken,
  requireAdmin,
  validateBody(z.object({
    imageOrder: z.array(z.string()).min(1, 'At least one image is required')
  })),
  productController.reorderImages
);

export default router;
