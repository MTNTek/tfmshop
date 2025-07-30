import { Request, Response } from 'express';
import { ProductService, ProductFilters, ProductSortOptions, PaginationOptions } from '../services/ProductService';
import { z } from 'zod';
import { imageProcessor } from '../utils/imageProcessor';

// Validation schemas
const CreateProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  slug: z.string().min(1).max(250),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  stockQuantity: z.number().int().min(0),
  sku: z.string().max(50).optional(),
  categoryId: z.string().uuid(),
  images: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
  variants: z.record(z.any()).optional(),
  brand: z.string().max(100).optional(),
  weight: z.number().positive().optional(),
  weightUnit: z.string().max(50).optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.string().max(10).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  badge: z.string().max(50).optional(),
});

const UpdateProductSchema = CreateProductSchema.partial().extend({
  isActive: z.boolean().optional(),
  inStock: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  viewCount: z.number().int().min(0).optional(),
  publishedAt: z.string().datetime().optional(),
});

const ProductQuerySchema = z.object({
  page: z.string().transform(Number).refine(n => n > 0).optional(),
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100).optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.string().transform(Number).refine(n => n >= 0).optional(),
  maxPrice: z.string().transform(Number).refine(n => n >= 0).optional(),
  inStock: z.string().transform(val => val === 'true').optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  tags: z.string().transform(val => val.split(',')).optional(),
  sortField: z.enum(['price', 'rating', 'createdAt', 'title', 'viewCount']).optional(),
  sortDirection: z.enum(['ASC', 'DESC']).optional(),
});

const UpdateStockSchema = z.object({
  quantity: z.number().int().min(0),
});

export interface ProductRequest extends Request {
  body: z.infer<typeof CreateProductSchema>;
}

export interface UpdateProductRequest extends Request {
  body: z.infer<typeof UpdateProductSchema>;
  params: {
    id: string;
  };
}

/**
 * Product controller handling product-related HTTP requests
 */
export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get all products with filtering, sorting, and pagination
   * GET /api/products
   */
  getProducts = async (req: Request, res: Response) => {
    try {
      const query = req.query;

      // Parse and validate query parameters
      const page = query.page ? parseInt(query.page as string) : 1;
      const limit = query.limit ? parseInt(query.limit as string) : 12;
      const minPrice = query.minPrice ? parseFloat(query.minPrice as string) : undefined;
      const maxPrice = query.maxPrice ? parseFloat(query.maxPrice as string) : undefined;
      const inStock = query.inStock === 'true';
      const isActive = query.isActive !== 'false'; // Default to true
      const sortField = (query.sortField as string) || 'createdAt';
      const sortDirection = (query.sortDirection as 'ASC' | 'DESC') || 'DESC';

      // Build filters
      const filters: ProductFilters = {
        isActive,
        inStock,
      };

      if (query.categoryId) filters.categoryId = query.categoryId as string;
      if (minPrice !== undefined) filters.minPrice = minPrice;
      if (maxPrice !== undefined) filters.maxPrice = maxPrice;
      if (query.brand) filters.brand = query.brand as string;
      if (query.search) filters.search = query.search as string;
      if (query.tags) {
        const tagsString = query.tags as string;
        filters.tags = tagsString.split(',').map(tag => tag.trim());
      }

      // Build sort options
      const sort: ProductSortOptions = {
        field: sortField as any,
        direction: sortDirection,
      };

      // Build pagination
      const pagination: PaginationOptions = {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
      };

      const result = await this.productService.findAll(filters, sort, pagination);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'PRODUCTS_FETCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get a single product by ID
   * GET /api/products/:id
   */
  getProductById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Product ID is required',
            code: 'INVALID_PRODUCT_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const product = await this.productService.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Increment view count
      await this.productService.incrementViewCount(id);

      res.json({
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'PRODUCT_FETCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get a single product by slug
   * GET /api/products/slug/:slug
   */
  getProductBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Product slug is required',
            code: 'INVALID_PRODUCT_SLUG',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const product = await this.productService.findBySlug(slug);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Increment view count
      await this.productService.incrementViewCount(product.id);

      res.json({
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'PRODUCT_FETCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Create a new product (Admin only)
   * POST /api/products
   */
  createProduct = async (req: ProductRequest, res: Response) => {
    try {
      const product = await this.productService.create(req.body);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      
      let statusCode = 500;
      let errorCode = 'PRODUCT_CREATION_ERROR';

      if (errorMessage.includes('already exists')) {
        statusCode = 409;
        errorCode = 'PRODUCT_SLUG_EXISTS';
      } else if (errorMessage.includes('Category not found')) {
        statusCode = 400;
        errorCode = 'INVALID_CATEGORY';
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
   * Update an existing product (Admin only)
   * PUT /api/products/:id
   */
  updateProduct = async (req: UpdateProductRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Product ID is required',
            code: 'INVALID_PRODUCT_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const { publishedAt, ...bodyData } = req.body;
      const updateData: any = { ...bodyData };
      
      // Convert publishedAt string to Date if provided
      if (publishedAt) {
        updateData.publishedAt = new Date(publishedAt);
      }

      const product = await this.productService.update(id, updateData);

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      
      let statusCode = 500;
      let errorCode = 'PRODUCT_UPDATE_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'PRODUCT_NOT_FOUND';
      } else if (errorMessage.includes('already exists')) {
        statusCode = 409;
        errorCode = 'PRODUCT_SLUG_EXISTS';
      } else if (errorMessage.includes('Category not found')) {
        statusCode = 400;
        errorCode = 'INVALID_CATEGORY';
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
   * Delete a product (Admin only)
   * DELETE /api/products/:id
   */
  deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Product ID is required',
            code: 'INVALID_PRODUCT_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const deleted = await this.productService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'PRODUCT_DELETION_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Update product stock (Admin only)
   * PATCH /api/products/:id/stock
   */
  updateStock = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Product ID is required',
            code: 'INVALID_PRODUCT_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const product = await this.productService.updateStock(id, quantity);

      res.json({
        success: true,
        data: product,
        message: 'Stock updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update stock';
      
      let statusCode = 500;
      let errorCode = 'STOCK_UPDATE_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'PRODUCT_NOT_FOUND';
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
   * Get featured products
   * GET /api/products/featured
   */
  getFeaturedProducts = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const products = await this.productService.getFeaturedProducts(limit);

      res.json({
        success: true,
        data: products,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch featured products';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'FEATURED_PRODUCTS_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Search products
   * GET /api/products/search
   */
  searchProducts = async (req: Request, res: Response) => {
    try {
      const { q: searchTerm, limit } = req.query;

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

      const searchLimit = limit ? parseInt(limit as string) : 20;
      const products = await this.productService.search(searchTerm as string, searchLimit);

      res.json({
        success: true,
        data: products,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search products';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'PRODUCT_SEARCH_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Upload images for a product (Admin only)
   * POST /api/products/:id/images
   */
  uploadImages = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Product ID is required',
            code: 'INVALID_PRODUCT_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No images provided',
            code: 'NO_IMAGES_PROVIDED',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Check if product exists
      const product = await this.productService.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Process images
      const processedImages = await imageProcessor.processImages(files);
      
      // Get current images and add new ones
      const currentImages = product.images || [];
      const newImageUrls = processedImages.map(img => img.url);
      const updatedImages = [...currentImages, ...newImageUrls];

      // Update product with new images
      const updatedProduct = await this.productService.update(id, {
        images: updatedImages,
      });

      res.status(201).json({
        success: true,
        data: {
          product: updatedProduct,
          uploadedImages: processedImages,
        },
        message: `${processedImages.length} image(s) uploaded successfully`,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
      
      let statusCode = 500;
      let errorCode = 'IMAGE_UPLOAD_ERROR';

      if (errorMessage.includes('File size exceeds') || errorMessage.includes('Unsupported file format')) {
        statusCode = 400;
        errorCode = 'INVALID_FILE';
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
   * Delete a specific image from a product (Admin only)
   * DELETE /api/products/:id/images/:filename
   */
  deleteImage = async (req: Request, res: Response) => {
    try {
      const { id, filename } = req.params;

      if (!id || !filename) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Product ID and filename are required',
            code: 'INVALID_PARAMETERS',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Check if product exists
      const product = await this.productService.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Check if image exists in product
      const imageUrl = `/api/images/${filename}`;
      const currentImages = product.images || [];
      
      if (!currentImages.includes(imageUrl)) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Image not found in product',
            code: 'IMAGE_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Remove image from product
      const updatedImages = currentImages.filter(img => img !== imageUrl);
      
      // Update product
      const updatedProduct = await this.productService.update(id, {
        images: updatedImages,
      });

      // Delete physical file
      try {
        imageProcessor.deleteImage(filename);
      } catch (fileError) {
        console.error('Failed to delete physical file:', fileError);
        // Continue even if file deletion fails
      }

      res.json({
        success: true,
        data: updatedProduct,
        message: 'Image deleted successfully',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'IMAGE_DELETION_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Reorder product images (Admin only)
   * PUT /api/products/:id/images/reorder
   */
  reorderImages = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { imageOrder } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Product ID is required',
            code: 'INVALID_PRODUCT_ID',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      if (!imageOrder || !Array.isArray(imageOrder)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Image order array is required',
            code: 'INVALID_IMAGE_ORDER',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Check if product exists
      const product = await this.productService.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      const currentImages = product.images || [];
      
      // Validate that all provided images exist in the product
      const invalidImages = imageOrder.filter(img => !currentImages.includes(img));
      if (invalidImages.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Invalid images in order: ${invalidImages.join(', ')}`,
            code: 'INVALID_IMAGES',
          },
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        });
      }

      // Update product with new image order
      const updatedProduct = await this.productService.update(id, {
        images: imageOrder,
      });

      res.json({
        success: true,
        data: updatedProduct,
        message: 'Images reordered successfully',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder images';
      
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage,
          code: 'IMAGE_REORDER_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };
}

// Export validation schemas for use in routes
export {
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
  UpdateStockSchema,
};
