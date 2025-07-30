import { Request, Response } from 'express';
import { ProductController } from '../../src/controllers/ProductController';
import { ProductService } from '../../src/services/ProductService';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';

// Mock the ProductService
jest.mock('../../src/services/ProductService');

const MockedProductService = ProductService as jest.MockedClass<typeof ProductService>;

describe('ProductController', () => {
  let productController: ProductController;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockProductService = new MockedProductService() as jest.Mocked<ProductService>;
    productController = new ProductController();
    
    // Replace the service instance with our mock
    (productController as any).productService = mockProductService;

    mockRequest = {
      query: {},
      params: {},
      body: {},
      originalUrl: '/api/products',
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    const mockProductsResult = {
      products: [
        {
          id: 'product-1',
          title: 'Test Product 1',
          description: 'Test description 1',
          slug: 'test-product-1',
          price: 99.99,
          currency: 'USD',
          stockQuantity: 10,
          isActive: true,
          inStock: true,
          category: { id: 'cat-1', name: 'Electronics' },
        },
        {
          id: 'product-2',
          title: 'Test Product 2',
          description: 'Test description 2',
          slug: 'test-product-2',
          price: 149.99,
          currency: 'USD',
          stockQuantity: 5,
          isActive: true,
          inStock: true,
          category: { id: 'cat-1', name: 'Electronics' },
        },
      ] as Product[],
      total: 2,
      page: 1,
      limit: 12,
      totalPages: 1,
    };

    it('should get products with default parameters', async () => {
      mockProductService.findAll.mockResolvedValue(mockProductsResult);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.findAll).toHaveBeenCalledWith(
        { isActive: true, inStock: false },
        { field: 'createdAt', direction: 'DESC' },
        { page: 1, limit: 12 }
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProductsResult,
        timestamp: expect.any(String),
      });
    });

    it('should handle query parameters correctly', async () => {
      mockRequest.query = {
        page: '2',
        limit: '5',
        categoryId: 'cat-1',
        minPrice: '50',
        maxPrice: '200',
        brand: 'Apple',
        search: 'iPhone',
        tags: 'smartphone,premium',
        sortField: 'price',
        sortDirection: 'ASC',
        inStock: 'false',
      };

      mockProductService.findAll.mockResolvedValue(mockProductsResult);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.findAll).toHaveBeenCalledWith(
        {
          isActive: true,
          inStock: false,
          categoryId: 'cat-1',
          minPrice: 50,
          maxPrice: 200,
          brand: 'Apple',
          search: 'iPhone',
          tags: ['smartphone', 'premium'],
        },
        { field: 'price', direction: 'ASC' },
        { page: 2, limit: 5 }
      );
    });

    it('should handle service errors', async () => {
      const errorMessage = 'Database connection failed';
      mockProductService.findAll.mockRejectedValue(new Error(errorMessage));

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: errorMessage,
          code: 'PRODUCTS_FETCH_ERROR',
        },
        timestamp: expect.any(String),
        path: '/api/products',
      });
    });

    it('should validate and limit pagination parameters', async () => {
      mockRequest.query = {
        page: '0', // Should default to 1
        limit: '200', // Should cap at 100
      };

      mockProductService.findAll.mockResolvedValue(mockProductsResult);

      await productController.getProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.findAll).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { page: 1, limit: 100 }
      );
    });
  });

  describe('getProductById', () => {
    const mockProduct = {
      id: 'product-1',
      title: 'Test Product',
      description: 'Test description',
      slug: 'test-product',
      price: 99.99,
      currency: 'USD',
      stockQuantity: 10,
      isActive: true,
      inStock: true,
      category: { id: 'cat-1', name: 'Electronics' },
    } as Product;

    it('should get product by ID successfully', async () => {
      mockRequest.params = { id: 'product-1' };
      mockProductService.findById.mockResolvedValue(mockProduct);
      mockProductService.incrementViewCount.mockResolvedValue();

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.findById).toHaveBeenCalledWith('product-1');
      expect(mockProductService.incrementViewCount).toHaveBeenCalledWith('product-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        timestamp: expect.any(String),
      });
    });

    it('should return 404 for non-existent product', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockProductService.findById.mockResolvedValue(null);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });

    it('should return 400 for missing product ID', async () => {
      mockRequest.params = {};

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product ID is required',
          code: 'INVALID_PRODUCT_ID',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: 'product-1' };
      const errorMessage = 'Database error';
      mockProductService.findById.mockRejectedValue(new Error(errorMessage));

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: errorMessage,
          code: 'PRODUCT_FETCH_ERROR',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });
  });

  describe('getProductBySlug', () => {
    const mockProduct = {
      id: 'product-1',
      slug: 'test-product',
      title: 'Test Product',
      description: 'Test description',
      price: 99.99,
      currency: 'USD',
      stockQuantity: 10,
      isActive: true,
      inStock: true,
    } as Product;

    it('should get product by slug successfully', async () => {
      mockRequest.params = { slug: 'test-product' };
      mockProductService.findBySlug.mockResolvedValue(mockProduct);
      mockProductService.incrementViewCount.mockResolvedValue();

      await productController.getProductBySlug(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.findBySlug).toHaveBeenCalledWith('test-product');
      expect(mockProductService.incrementViewCount).toHaveBeenCalledWith('product-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        timestamp: expect.any(String),
      });
    });

    it('should return 404 for non-existent slug', async () => {
      mockRequest.params = { slug: 'non-existent' };
      mockProductService.findBySlug.mockResolvedValue(null);

      await productController.getProductBySlug(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });
  });

  describe('searchProducts', () => {
    const mockProducts = [
      { 
        id: 'product-1', 
        title: 'iPhone 15', 
        description: 'Latest iPhone',
        slug: 'iphone-15',
        price: 999.99,
        currency: 'USD',
        stockQuantity: 10,
        isActive: true,
        inStock: true,
      },
      { 
        id: 'product-2', 
        title: 'iPhone 14', 
        description: 'Previous iPhone',
        slug: 'iphone-14',
        price: 799.99,
        currency: 'USD',
        stockQuantity: 5,
        isActive: true,
        inStock: true,
      },
    ] as Product[];

    it('should search products successfully', async () => {
      mockRequest.query = { q: 'iPhone', limit: '10' };
      mockProductService.search.mockResolvedValue(mockProducts);

      await productController.searchProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.search).toHaveBeenCalledWith('iPhone', 10);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        timestamp: expect.any(String),
      });
    });

    it('should use default limit when not provided', async () => {
      mockRequest.query = { q: 'iPhone' };
      mockProductService.search.mockResolvedValue(mockProducts);

      await productController.searchProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.search).toHaveBeenCalledWith('iPhone', 20);
    });

    it('should return 400 for missing search term', async () => {
      mockRequest.query = {};

      await productController.searchProducts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Search term is required',
          code: 'MISSING_SEARCH_TERM',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });
  });

  describe('getFeaturedProducts', () => {
    const mockProducts = [
      { 
        id: 'product-1', 
        title: 'Featured Product 1', 
        description: 'Featured description 1',
        slug: 'featured-1',
        price: 199.99,
        currency: 'USD',
        stockQuantity: 10,
        rating: 4.8,
        isActive: true,
        inStock: true,
      },
      { 
        id: 'product-2', 
        title: 'Featured Product 2', 
        description: 'Featured description 2',
        slug: 'featured-2',
        price: 299.99,
        currency: 'USD',
        stockQuantity: 5,
        rating: 4.6,
        isActive: true,
        inStock: true,
      },
    ] as Product[];

    it('should get featured products with default limit', async () => {
      mockRequest.query = {};
      mockProductService.getFeaturedProducts.mockResolvedValue(mockProducts);

      await productController.getFeaturedProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.getFeaturedProducts).toHaveBeenCalledWith(8);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        timestamp: expect.any(String),
      });
    });

    it('should get featured products with custom limit', async () => {
      mockRequest.query = { limit: '5' };
      mockProductService.getFeaturedProducts.mockResolvedValue(mockProducts);

      await productController.getFeaturedProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.getFeaturedProducts).toHaveBeenCalledWith(5);
    });
  });

  describe('createProduct', () => {
    const mockProductData = {
      title: 'New Product',
      description: 'Product description',
      slug: 'new-product',
      price: 99.99,
      stockQuantity: 10,
      categoryId: 'cat-1',
    };

    const mockCreatedProduct = {
      id: 'product-1',
      ...mockProductData,
      currency: 'USD',
      isActive: true,
      inStock: true,
    } as Product;

    it('should create product successfully', async () => {
      mockRequest.body = mockProductData;
      mockProductService.create.mockResolvedValue(mockCreatedProduct);

      await productController.createProduct(mockRequest as any, mockResponse as Response);

      expect(mockProductService.create).toHaveBeenCalledWith(mockProductData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedProduct,
        message: 'Product created successfully',
        timestamp: expect.any(String),
      });
    });

    it('should handle duplicate slug error', async () => {
      mockRequest.body = mockProductData;
      mockProductService.create.mockRejectedValue(new Error('Product with this slug already exists'));

      await productController.createProduct(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product with this slug already exists',
          code: 'PRODUCT_SLUG_EXISTS',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });

    it('should handle invalid category error', async () => {
      mockRequest.body = mockProductData;
      mockProductService.create.mockRejectedValue(new Error('Category not found'));

      await productController.createProduct(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Category not found',
          code: 'INVALID_CATEGORY',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });
  });

  describe('updateProduct', () => {
    const mockUpdateData = {
      title: 'Updated Product',
      price: 129.99,
    };

    const mockUpdatedProduct = {
      id: 'product-1',
      title: 'Updated Product',
      description: 'Updated description',
      slug: 'updated-product',
      price: 129.99,
      currency: 'USD',
      stockQuantity: 10,
      isActive: true,
      inStock: true,
    } as Product;

    it('should update product successfully', async () => {
      mockRequest.params = { id: 'product-1' };
      mockRequest.body = mockUpdateData;
      mockProductService.update.mockResolvedValue(mockUpdatedProduct);

      await productController.updateProduct(mockRequest as any, mockResponse as Response);

      expect(mockProductService.update).toHaveBeenCalledWith('product-1', mockUpdateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedProduct,
        message: 'Product updated successfully',
        timestamp: expect.any(String),
      });
    });

    it('should return 400 for missing product ID', async () => {
      mockRequest.params = {};
      mockRequest.body = mockUpdateData;

      await productController.updateProduct(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product ID is required',
          code: 'INVALID_PRODUCT_ID',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });

    it('should handle product not found error', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = mockUpdateData;
      mockProductService.update.mockRejectedValue(new Error('Product not found'));

      await productController.updateProduct(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });

    it('should handle publishedAt date conversion', async () => {
      const updateDataWithDate = {
        ...mockUpdateData,
        publishedAt: '2024-01-01T00:00:00.000Z',
      };

      mockRequest.params = { id: 'product-1' };
      mockRequest.body = updateDataWithDate;
      mockProductService.update.mockResolvedValue(mockUpdatedProduct);

      await productController.updateProduct(mockRequest as any, mockResponse as Response);

      expect(mockProductService.update).toHaveBeenCalledWith('product-1', {
        ...mockUpdateData,
        publishedAt: new Date('2024-01-01T00:00:00.000Z'),
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      mockRequest.params = { id: 'product-1' };
      mockProductService.delete.mockResolvedValue(true);

      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.delete).toHaveBeenCalledWith('product-1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product deleted successfully',
        timestamp: expect.any(String),
      });
    });

    it('should return 404 when product not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockProductService.delete.mockResolvedValue(false);

      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });

    it('should return 400 for missing product ID', async () => {
      mockRequest.params = {};

      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product ID is required',
          code: 'INVALID_PRODUCT_ID',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });
  });

  describe('updateStock', () => {
    const mockUpdatedProduct = {
      id: 'product-1',
      title: 'Test Product',
      description: 'Test description',
      slug: 'test-product',
      price: 99.99,
      currency: 'USD',
      stockQuantity: 25,
      isActive: true,
      inStock: true,
    } as Product;

    it('should update stock successfully', async () => {
      mockRequest.params = { id: 'product-1' };
      mockRequest.body = { quantity: 25 };
      mockProductService.updateStock.mockResolvedValue(mockUpdatedProduct);

      await productController.updateStock(mockRequest as Request, mockResponse as Response);

      expect(mockProductService.updateStock).toHaveBeenCalledWith('product-1', 25);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedProduct,
        message: 'Stock updated successfully',
        timestamp: expect.any(String),
      });
    });

    it('should return 400 for missing product ID', async () => {
      mockRequest.params = {};
      mockRequest.body = { quantity: 25 };

      await productController.updateStock(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product ID is required',
          code: 'INVALID_PRODUCT_ID',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });

    it('should handle product not found error', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = { quantity: 25 };
      mockProductService.updateStock.mockRejectedValue(new Error('Product not found'));

      await productController.updateStock(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        timestamp: expect.any(String),
        path: expect.any(String),
      });
    });
  });
});