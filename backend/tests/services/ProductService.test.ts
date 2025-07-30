import { ProductService, ProductFilters, ProductSortOptions, PaginationOptions, CreateProductData, UpdateProductData } from '../../src/services/ProductService';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { AppDataSource } from '../../src/config/database';

// Mock dependencies
jest.mock('../../src/config/database');

const mockAppDataSource = AppDataSource as jest.Mocked<typeof AppDataSource>;

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepository: any;
  let mockCategoryRepository: any;

  beforeEach(() => {
    mockProductRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      increment: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockCategoryRepository = {
      findOne: jest.fn(),
    };

    mockAppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === Product) return mockProductRepository;
      if (entity === Category) return mockCategoryRepository;
    });

    productService = new ProductService();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mockProducts = [
      {
        id: 'product-1',
        title: 'Test Product 1',
        price: 99.99,
        isActive: true,
        inStock: true,
        category: { id: 'cat-1', name: 'Electronics' },
      },
      {
        id: 'product-2',
        title: 'Test Product 2',
        price: 149.99,
        isActive: true,
        inStock: true,
        category: { id: 'cat-1', name: 'Electronics' },
      },
    ] as Product[];

    beforeEach(() => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockProducts, 2]),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated products with default parameters', async () => {
      const result = await productService.findAll();

      expect(result).toEqual({
        products: mockProducts,
        total: 2,
        page: 1,
        limit: 12,
        totalPages: 1,
      });

      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('should apply filters correctly', async () => {
      const filters: ProductFilters = {
        categoryId: 'cat-1',
        minPrice: 50,
        maxPrice: 200,
        brand: 'TestBrand',
        search: 'test',
        inStock: true,
        isActive: true,
      };

      const sort: ProductSortOptions = { field: 'price', direction: 'ASC' };
      const pagination: PaginationOptions = { page: 2, limit: 10 };

      await productService.findAll(filters, sort, pagination);

      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('should handle search functionality', async () => {
      const filters: ProductFilters = {
        search: 'laptop',
      };

      await productService.findAll(filters);

      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('should handle pagination correctly', async () => {
      const pagination: PaginationOptions = { page: 3, limit: 5 };

      const result = await productService.findAll({}, undefined, pagination);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(1); // Math.ceil(2 / 5)
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        id: 'product-1',
        title: 'Test Product',
        category: { id: 'cat-1', name: 'Electronics' },
      } as Product;

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await productService.findById('product-1');

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        relations: ['category'],
      });
      expect(result).toBe(mockProduct);
    });

    it('should return null when product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await productService.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return product when found by slug', async () => {
      const mockProduct = {
        id: 'product-1',
        slug: 'test-product',
        title: 'Test Product',
        category: { id: 'cat-1', name: 'Electronics' },
      } as Product;

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await productService.findBySlug('test-product');

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
        relations: ['category'],
      });
      expect(result).toBe(mockProduct);
    });

    it('should return null when product not found by slug', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await productService.findBySlug('nonexistent-slug');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validProductData: CreateProductData = {
      title: 'New Product',
      description: 'Product description',
      slug: 'new-product',
      price: 99.99,
      stockQuantity: 10,
      categoryId: 'cat-1',
    };

    it('should create product successfully', async () => {
      const mockCategory = { id: 'cat-1', name: 'Electronics' } as Category;
      const mockProduct = {
        id: 'product-1',
        ...validProductData,
        currency: 'USD',
        publishedAt: expect.any(Date),
      } as Product;

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.findOne.mockResolvedValue(null); // No existing product with slug
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await productService.create(validProductData);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'new-product' },
      });
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        ...validProductData,
        currency: 'USD',
        publishedAt: expect.any(Date),
      });
      expect(result).toBe(mockProduct);
    });

    it('should throw error when category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(productService.create(validProductData)).rejects.toThrow('Category not found');
    });

    it('should throw error when slug already exists', async () => {
      const mockCategory = { id: 'cat-1', name: 'Electronics' } as Category;
      const existingProduct = { id: 'existing-id', slug: 'new-product' } as Product;

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.findOne.mockResolvedValue(existingProduct);

      await expect(productService.create(validProductData)).rejects.toThrow(
        'Product with this slug already exists'
      );
    });

    it('should set default currency when not provided', async () => {
      const mockCategory = { id: 'cat-1', name: 'Electronics' } as Category;
      const mockProduct = {
        id: 'product-1',
        ...validProductData,
        currency: 'USD',
      } as Product;

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.findOne.mockResolvedValue(null);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      await productService.create(validProductData);

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'USD',
        })
      );
    });
  });

  describe('update', () => {
    const updateData: UpdateProductData = {
      title: 'Updated Product',
      price: 149.99,
      isActive: true,
    };

    it('should update product successfully', async () => {
      const existingProduct = {
        id: 'product-1',
        title: 'Old Product',
        slug: 'old-product',
        price: 99.99,
      } as Product;

      const updatedProduct = {
        ...existingProduct,
        ...updateData,
      } as Product;

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await productService.update('product-1', updateData);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateData)
      );
      expect(result).toBe(updatedProduct);
    });

    it('should throw error when product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(productService.update('nonexistent-id', updateData)).rejects.toThrow(
        'Product not found'
      );
    });

    it('should validate category when categoryId is updated', async () => {
      const existingProduct = { id: 'product-1' } as Product;
      const updateWithCategory = { ...updateData, categoryId: 'new-cat-id' };

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(productService.update('product-1', updateWithCategory)).rejects.toThrow(
        'Category not found'
      );
    });

    it('should validate slug uniqueness when slug is updated', async () => {
      const existingProduct = { id: 'product-1', slug: 'old-slug' } as Product;
      const conflictingProduct = { id: 'product-2', slug: 'new-slug' } as Product;
      const updateWithSlug = { ...updateData, slug: 'new-slug' };

      mockProductRepository.findOne
        .mockResolvedValueOnce(existingProduct) // First call for finding the product to update
        .mockResolvedValueOnce(conflictingProduct); // Second call for checking slug conflict

      await expect(productService.update('product-1', updateWithSlug)).rejects.toThrow(
        'Product with this slug already exists'
      );
    });
  });

  describe('delete', () => {
    it('should soft delete product successfully', async () => {
      mockProductRepository.update.mockResolvedValue({ affected: 1 });

      const result = await productService.delete('product-1');

      expect(mockProductRepository.update).toHaveBeenCalledWith('product-1', {
        isActive: false,
      });
      expect(result).toBe(true);
    });

    it('should return false when product not found', async () => {
      mockProductRepository.update.mockResolvedValue({ affected: 0 });

      const result = await productService.delete('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete product successfully', async () => {
      mockProductRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await productService.hardDelete('product-1');

      expect(mockProductRepository.delete).toHaveBeenCalledWith('product-1');
      expect(result).toBe(true);
    });

    it('should return false when product not found', async () => {
      mockProductRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await productService.hardDelete('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('updateStock', () => {
    it('should update stock quantity successfully', async () => {
      const existingProduct = {
        id: 'product-1',
        stockQuantity: 5,
        inStock: true,
      } as Product;

      const updatedProduct = {
        ...existingProduct,
        stockQuantity: 20,
        inStock: true,
      } as Product;

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await productService.updateStock('product-1', 20);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          stockQuantity: 20,
          inStock: true,
        })
      );
      expect(result).toBe(updatedProduct);
    });

    it('should set inStock to false when quantity is 0', async () => {
      const existingProduct = {
        id: 'product-1',
        stockQuantity: 5,
        inStock: true,
      } as Product;

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue({
        ...existingProduct,
        stockQuantity: 0,
        inStock: false,
      });

      await productService.updateStock('product-1', 0);

      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          stockQuantity: 0,
          inStock: false,
        })
      );
    });

    it('should throw error when product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(productService.updateStock('nonexistent-id', 10)).rejects.toThrow(
        'Product not found'
      );
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count successfully', async () => {
      await productService.incrementViewCount('product-1');

      expect(mockProductRepository.increment).toHaveBeenCalledWith(
        { id: 'product-1' },
        'viewCount',
        1
      );
    });
  });

  describe('updateRating', () => {
    it('should update product rating successfully', async () => {
      const existingProduct = {
        id: 'product-1',
        rating: 4.0,
        reviewCount: 10,
      } as Product;

      const updatedProduct = {
        ...existingProduct,
        rating: 4.5,
        reviewCount: 15,
      } as Product;

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await productService.updateRating('product-1', 4.5, 15);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: 4.5,
          reviewCount: 15,
        })
      );
      expect(result).toBe(updatedProduct);
    });

    it('should throw error when product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(productService.updateRating('nonexistent-id', 4.5, 15)).rejects.toThrow(
        'Product not found'
      );
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products with default limit', async () => {
      const mockProducts = [
        { id: 'product-1', rating: 4.8, viewCount: 1000 },
        { id: 'product-2', rating: 4.5, viewCount: 800 },
      ] as Product[];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await productService.getFeaturedProducts();

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: {
          isActive: true,
          inStock: true,
        },
        relations: ['category'],
        order: {
          rating: 'DESC',
          viewCount: 'DESC',
        },
        take: 8,
      });
      expect(result).toBe(mockProducts);
    });

    it('should return featured products with custom limit', async () => {
      const mockProducts = [
        { id: 'product-1', rating: 4.8 },
      ] as Product[];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      await productService.getFeaturedProducts(5);

      expect(mockProductRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });

  describe('getByCategory', () => {
    it('should return products by category', async () => {
      const mockProducts = [
        { id: 'product-1', categoryId: 'cat-1' },
        { id: 'product-2', categoryId: 'cat-1' },
      ] as Product[];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await productService.getByCategory('cat-1');

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: {
          categoryId: 'cat-1',
          isActive: true,
          inStock: true,
        },
        relations: ['category'],
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toBe(mockProducts);
    });

    it('should return products by category with limit', async () => {
      const mockProducts = [
        { id: 'product-1', categoryId: 'cat-1' },
      ] as Product[];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      await productService.getByCategory('cat-1', 10);

      expect(mockProductRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });
  });

  describe('search', () => {
    beforeEach(() => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'product-1', title: 'Laptop Computer' },
          { id: 'product-2', title: 'Gaming Laptop' },
        ]),
      };

      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should search products by text with default limit', async () => {
      const result = await productService.search('laptop');

      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(result).toHaveLength(2);
    });

    it('should search products by text with custom limit', async () => {
      await productService.search('laptop', 10);

      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('should search in title, description, and brand fields', async () => {
      const mockQueryBuilder = mockProductRepository.createQueryBuilder();

      await productService.search('test search');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search) OR LOWER(product.brand) LIKE LOWER(:search))',
        { search: '%test search%' }
      );
    });
  });
});