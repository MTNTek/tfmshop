import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { z } from 'zod';

// Validation schemas
const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  slug: z.string().min(1).max(150),
  imageUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

const ReorderCategoriesSchema = z.object({
  categoryIds: z.array(z.string().uuid()),
});

export interface CategoryRequest extends Request {
  body: z.infer<typeof CreateCategorySchema>;
}

export interface UpdateCategoryRequest extends Request {
  body: z.infer<typeof UpdateCategorySchema>;
  params: {
    id: string;
  };
}

/**
 * Category controller handling category-related HTTP requests
 */
export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * Get all categories
   * GET /api/categories
   */
  getCategories = async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await this.categoryService.findAll(includeInactive);

      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'CATEGORIES_FETCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get category tree structure
   * GET /api/categories/tree
   */
  getCategoryTree = async (req: Request, res: Response) => {
    try {
      const categoryTree = await this.categoryService.getCategoryTree();

      res.json({
        success: true,
        data: categoryTree,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category tree';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'CATEGORY_TREE_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get root categories
   * GET /api/categories/root
   */
  getRootCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.categoryService.findRootCategories();

      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch root categories';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'ROOT_CATEGORIES_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get a single category by ID
   * GET /api/categories/:id
   */
  getCategoryById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category ID is required',
            code: 'INVALID_CATEGORY_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const category = await this.categoryService.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Category not found',
            code: 'CATEGORY_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      res.json({
        success: true,
        data: category,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'CATEGORY_FETCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get a single category by slug
   * GET /api/categories/slug/:slug
   */
  getCategoryBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category slug is required',
            code: 'INVALID_CATEGORY_SLUG',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const category = await this.categoryService.findBySlug(slug);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Category not found',
            code: 'CATEGORY_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      res.json({
        success: true,
        data: category,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'CATEGORY_FETCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get categories by parent ID
   * GET /api/categories/parent/:parentId
   */
  getCategoriesByParent = async (req: Request, res: Response) => {
    try {
      const { parentId } = req.params;

      if (!parentId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Parent ID is required',
            code: 'INVALID_PARENT_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const categories = await this.categoryService.findByParent(parentId);

      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subcategories';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'SUBCATEGORIES_FETCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Create a new category (Admin only)
   * POST /api/categories
   */
  createCategory = async (req: CategoryRequest, res: Response) => {
    try {
      const category = await this.categoryService.create(req.body);

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      
      let statusCode = 500;
      let errorCode = 'CATEGORY_CREATION_ERROR';

      if (errorMessage.includes('already exists')) {
        statusCode = 409;
        errorCode = 'CATEGORY_SLUG_EXISTS';
      } else if (errorMessage.includes('Parent category not found')) {
        statusCode = 400;
        errorCode = 'INVALID_PARENT_CATEGORY';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          message: errorMessage,
          code: errorCode,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Update an existing category (Admin only)
   * PUT /api/categories/:id
   */
  updateCategory = async (req: UpdateCategoryRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category ID is required',
            code: 'INVALID_CATEGORY_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const category = await this.categoryService.update(id, req.body);

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      
      let statusCode = 500;
      let errorCode = 'CATEGORY_UPDATE_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'CATEGORY_NOT_FOUND';
      } else if (errorMessage.includes('already exists')) {
        statusCode = 409;
        errorCode = 'CATEGORY_SLUG_EXISTS';
      } else if (errorMessage.includes('circular reference') || errorMessage.includes('own parent')) {
        statusCode = 400;
        errorCode = 'INVALID_PARENT_CATEGORY';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          message: errorMessage,
          code: errorCode,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Delete a category (Admin only)
   * DELETE /api/categories/:id
   */
  deleteCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category ID is required',
            code: 'INVALID_CATEGORY_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const deleted = await this.categoryService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Category not found',
            code: 'CATEGORY_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      
      let statusCode = 500;
      let errorCode = 'CATEGORY_DELETION_ERROR';

      if (errorMessage.includes('subcategories')) {
        statusCode = 400;
        errorCode = 'CATEGORY_HAS_SUBCATEGORIES';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          message: errorMessage,
          code: errorCode,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get category breadcrumb path
   * GET /api/categories/:id/path
   */
  getCategoryPath = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category ID is required',
            code: 'INVALID_CATEGORY_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const path = await this.categoryService.getCategoryPath(id);

      res.json({
        success: true,
        data: path,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category path';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'CATEGORY_PATH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Reorder categories (Admin only)
   * PATCH /api/categories/reorder
   */
  reorderCategories = async (req: Request, res: Response) => {
    try {
      const { categoryIds } = req.body;

      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Category IDs array is required',
            code: 'INVALID_CATEGORY_IDS',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      await this.categoryService.reorderCategories(categoryIds);

      res.json({
        success: true,
        message: 'Categories reordered successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder categories';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'CATEGORY_REORDER_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Search categories
   * GET /api/categories/search
   */
  searchCategories = async (req: Request, res: Response) => {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Search term is required',
            code: 'MISSING_SEARCH_TERM',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const categories = await this.categoryService.search(searchTerm as string);

      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search categories';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'CATEGORY_SEARCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get popular categories
   * GET /api/categories/popular
   */
  getPopularCategories = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const categories = await this.categoryService.getPopularCategories(limit);

      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch popular categories';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'POPULAR_CATEGORIES_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };
}

// Export validation schemas for use in routes
export {
  CreateCategorySchema,
  UpdateCategorySchema,
  ReorderCategoriesSchema,
};
