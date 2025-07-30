import { Repository, FindManyOptions, Like, ILike, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  brand?: string;
  search?: string;
  tags?: string[];
}

export interface ProductSortOptions {
  field: 'price' | 'rating' | 'createdAt' | 'title' | 'viewCount';
  direction: 'ASC' | 'DESC';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface CreateProductData {
  title: string;
  description: string;
  slug: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  stockQuantity: number;
  sku?: string;
  categoryId: string;
  images?: string[];
  specifications?: Record<string, any>;
  variants?: Record<string, any>;
  brand?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  tags?: string[];
  badge?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  viewCount?: number;
  publishedAt?: Date;
}

export interface ProductWithPagination {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service class for managing product operations
 */
export class ProductService {
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  /**
   * Find all products with filtering, sorting, and pagination
   */
  async findAll(
    filters: ProductFilters = {},
    sort: ProductSortOptions = { field: 'createdAt', direction: 'DESC' },
    pagination: PaginationOptions = { page: 1, limit: 12 }
  ): Promise<ProductWithPagination> {
    const {
      categoryId,
      minPrice,
      maxPrice,
      inStock = true,
      isActive = true,
      brand,
      search,
      tags
    } = filters;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive });

    // Add filters
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (inStock) {
      queryBuilder.andWhere('product.inStock = :inStock', { inStock });
      queryBuilder.andWhere('product.stockQuantity > 0');
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (brand) {
      queryBuilder.andWhere('LOWER(product.brand) = LOWER(:brand)', { brand });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('product.tags && :tags', { tags });
    }

    // Add sorting
    queryBuilder.orderBy(`product.${sort.field}`, sort.direction);

    // Add pagination
    const skip = (pagination.page - 1) * pagination.limit;
    queryBuilder.skip(skip).take(pagination.limit);

    // Execute query
    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  /**
   * Find a product by ID with category information
   */
  async findById(id: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  /**
   * Find a product by slug with category information
   */
  async findBySlug(slug: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { slug },
      relations: ['category'],
    });
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductData): Promise<Product> {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if slug already exists
    const existingProduct = await this.productRepository.findOne({
      where: { slug: data.slug },
    });

    if (existingProduct) {
      throw new Error('Product with this slug already exists');
    }

    // Set default currency if not provided
    const productData = {
      ...data,
      currency: data.currency || 'USD',
      publishedAt: new Date(),
    };

    const product = this.productRepository.create(productData);
    return await this.productRepository.save(product);
  }

  /**
   * Update an existing product
   */
  async update(id: string, data: UpdateProductData): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new Error('Product not found');
    }

    // If categoryId is being updated, verify it exists
    if (data.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== product.slug) {
      const existingProduct = await this.productRepository.findOne({
        where: { slug: data.slug },
      });

      if (existingProduct) {
        throw new Error('Product with this slug already exists');
      }
    }

    Object.assign(product, data);
    return await this.productRepository.save(product);
  }

  /**
   * Delete a product (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.productRepository.update(id, { isActive: false });
    return result.affected === 1;
  }

  /**
   * Hard delete a product
   */
  async hardDelete(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return result.affected === 1;
  }

  /**
   * Update stock quantity
   */
  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new Error('Product not found');
    }

    product.stockQuantity = quantity;
    product.inStock = quantity > 0;

    return await this.productRepository.save(product);
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.productRepository.increment({ id }, 'viewCount', 1);
  }

  /**
   * Update product rating
   */
  async updateRating(id: string, rating: number, reviewCount: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new Error('Product not found');
    }

    product.rating = rating;
    product.reviewCount = reviewCount;

    return await this.productRepository.save(product);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        isActive: true,
        inStock: true,
      },
      relations: ['category'],
      order: {
        rating: 'DESC',
        viewCount: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get products by category
   */
  async getByCategory(categoryId: string, limit?: number): Promise<Product[]> {
    const options: FindManyOptions<Product> = {
      where: {
        categoryId,
        isActive: true,
        inStock: true,
      },
      relations: ['category'],
      order: {
        createdAt: 'DESC',
      },
    };

    if (limit) {
      options.take = limit;
    }

    return await this.productRepository.find(options);
  }

  /**
   * Search products by text
   */
  async search(searchTerm: string, limit: number = 20): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.inStock = :inStock', { inStock: true })
      .andWhere(
        '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search) OR LOWER(product.brand) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` }
      )
      .orderBy('product.rating', 'DESC')
      .addOrderBy('product.viewCount', 'DESC')
      .take(limit)
      .getMany();
  }
}
