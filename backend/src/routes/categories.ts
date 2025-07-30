import { Router } from 'express';
import { CategoryController, CreateCategorySchema, UpdateCategorySchema, ReorderCategoriesSchema } from '../controllers/CategoryController';
import { validateBody } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

/**
 * Category routes
 * Base path: /api/categories
 */
const router = Router();
const categoryController = new CategoryController();

/**
 * GET /api/categories
 * Get all categories
 */
router.get('/', categoryController.getCategories);

/**
 * GET /api/categories/tree
 * Get category tree structure
 */
router.get('/tree', categoryController.getCategoryTree);

/**
 * GET /api/categories/root
 * Get root categories
 */
router.get('/root', categoryController.getRootCategories);

/**
 * GET /api/categories/popular
 * Get popular categories
 */
router.get('/popular', categoryController.getPopularCategories);

/**
 * GET /api/categories/search
 * Search categories
 */
router.get('/search', categoryController.searchCategories);

/**
 * GET /api/categories/slug/:slug
 * Get category by slug
 */
router.get('/slug/:slug', categoryController.getCategoryBySlug);

/**
 * GET /api/categories/parent/:parentId
 * Get categories by parent ID
 */
router.get('/parent/:parentId', categoryController.getCategoriesByParent);

/**
 * GET /api/categories/:id
 * Get category by ID
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * GET /api/categories/:id/path
 * Get category breadcrumb path
 */
router.get('/:id/path', categoryController.getCategoryPath);

/**
 * POST /api/categories
 * Create a new category (Admin only)
 */
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  validateBody(CreateCategorySchema),
  categoryController.createCategory
);

/**
 * PUT /api/categories/:id
 * Update a category (Admin only)
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateBody(UpdateCategorySchema),
  categoryController.updateCategory
);

/**
 * PATCH /api/categories/reorder
 * Reorder categories (Admin only)
 */
router.patch(
  '/reorder',
  authenticateToken,
  requireAdmin,
  validateBody(ReorderCategoriesSchema),
  categoryController.reorderCategories
);

/**
 * DELETE /api/categories/:id
 * Delete a category (Admin only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  categoryController.deleteCategory
);

export default router;
