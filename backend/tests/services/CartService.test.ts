import { CartService, AddToCartData, UpdateCartItemData } from '../../src/services/CartService';
import { Cart } from '../../src/entities/Cart';
import { CartItem } from '../../src/entities/CartItem';
import { Product } from '../../src/entities/Product';
import { User } from '../../src/entities/User';
import { AppDataSource } from '../../src/config/database';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock dependencies
jest.mock('../../src/config/database');

const mockAppDataSource = AppDataSource as jest.Mocked<typeof AppDataSource>;

describe('CartService', () => {
  let cartService: CartService;
  let mockCartRepository: any;
  let mockCartItemRepository: any;
  let mockProductRepository: any;
  let mockUserRepository: any;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer' as any,
    isActive: true,
  } as User;

  const mockProduct: Product = {
    id: 'product-1',
    title: 'Test Product',
    price: 99.99,
    stockQuantity: 10,
    isActive: true,
    inStock: true,
  } as Product;

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    user: mockUser,
    items: [],
    get totalItems() { return 0; },
    get subtotal() { return 0; },
    get isEmpty() { return true; },
    getItemByProductId: jest.fn(),
  } as unknown as Cart;

  beforeEach(() => {
    mockCartRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockCartItemRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockProductRepository = {
      findOne: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockAppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === Cart) return mockCartRepository;
      if (entity === CartItem) return mockCartItemRepository;
      if (entity === Product) return mockProductRepository;
      if (entity === User) return mockUserRepository;
    });

    cartService = new CartService();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return existing cart for user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCartRepository.findOne.mockResolvedValue(mockCart);

      const result = await cartService.getCart('user-1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['items', 'items.product'],
      });
      expect(result).toEqual(mockCart);
    });

    it('should create new cart if none exists', async () => {
      const newCart = { ...mockCart, id: 'new-cart-1' };
      
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCartRepository.findOne.mockResolvedValue(null);
      mockCartRepository.create.mockReturnValue(newCart);
      mockCartRepository.save.mockResolvedValue(newCart);

      const result = await cartService.getCart('user-1');

      expect(mockCartRepository.create).toHaveBeenCalledWith({ userId: 'user-1', items: [] });
      expect(mockCartRepository.save).toHaveBeenCalledWith(newCart);
      expect(result).toEqual(newCart);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(cartService.getCart('invalid-user')).rejects.toThrow('User not found');
    });
  });

  describe('addItem', () => {
    const addToCartData: AddToCartData = {
      productId: 'product-1',
      quantity: 2,
    };

    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
    });

    it('should add new item to empty cart', async () => {
      const emptyCart = { ...mockCart, items: [] };
      const newCartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 2,
        price: 99.99,
      };

      mockCartRepository.findOne.mockResolvedValue(emptyCart);
      mockCartItemRepository.create.mockReturnValue(newCartItem);
      mockCartItemRepository.save.mockResolvedValue(newCartItem);

      // Mock the second call to getCart (after adding item)
      const updatedCart = { ...emptyCart, items: [newCartItem] };
      mockCartRepository.findOne.mockResolvedValueOnce(emptyCart).mockResolvedValueOnce(updatedCart);

      const result = await cartService.addItem('user-1', addToCartData);

      expect(mockCartItemRepository.create).toHaveBeenCalledWith({
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 2,
        price: 99.99,
      });
      expect(mockCartItemRepository.save).toHaveBeenCalledWith(newCartItem);
    });

    it('should update existing item quantity', async () => {
      const existingItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 1,
        price: 89.99,
      };
      const cartWithItem = { ...mockCart, items: [existingItem] };

      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockCartItemRepository.save.mockResolvedValue({ ...existingItem, quantity: 3, price: 99.99 });

      await cartService.addItem('user-1', addToCartData);

      expect(existingItem.quantity).toBe(3);
      expect(existingItem.price).toBe(99.99);
      expect(mockCartItemRepository.save).toHaveBeenCalledWith(existingItem);
    });

    it('should throw error for invalid quantity', async () => {
      const invalidData = { ...addToCartData, quantity: 0 };

      await expect(cartService.addItem('user-1', invalidData)).rejects.toThrow('Quantity must be a positive integer');
    });

    it('should throw error for non-integer quantity', async () => {
      const invalidData = { ...addToCartData, quantity: 1.5 };

      await expect(cartService.addItem('user-1', invalidData)).rejects.toThrow('Quantity must be a positive integer');
    });

    it('should throw error if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(cartService.addItem('user-1', addToCartData)).rejects.toThrow('Product not found or inactive');
    });

    it('should throw error if product is out of stock', async () => {
      const outOfStockProduct = { ...mockProduct, inStock: false, stockQuantity: 0 };
      mockProductRepository.findOne.mockResolvedValue(outOfStockProduct);

      await expect(cartService.addItem('user-1', addToCartData)).rejects.toThrow('Product is out of stock');
    });

    it('should throw error if requested quantity exceeds stock', async () => {
      const lowStockProduct = { ...mockProduct, stockQuantity: 1 };
      mockProductRepository.findOne.mockResolvedValue(lowStockProduct);
      mockCartRepository.findOne.mockResolvedValue({ ...mockCart, items: [] });

      await expect(cartService.addItem('user-1', addToCartData)).rejects.toThrow('Cannot add 2 items. Only 1 available');
    });

    it('should throw error if adding to existing item exceeds stock', async () => {
      const existingItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 8,
        price: 89.99,
      };
      const cartWithItem = { ...mockCart, items: [existingItem] };
      const limitedStockProduct = { ...mockProduct, stockQuantity: 9 };

      mockProductRepository.findOne.mockResolvedValue(limitedStockProduct);
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);

      await expect(cartService.addItem('user-1', addToCartData)).rejects.toThrow('Cannot add 2 items. Only 1 available');
    });
  });

  describe('updateItem', () => {
    const updateData: UpdateCartItemData = {
      quantity: 3,
    };

    const existingItem = {
      id: 'item-1',
      cartId: 'cart-1',
      productId: 'product-1',
      quantity: 2,
      price: 89.99,
    };

    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
    });

    it('should update cart item quantity', async () => {
      const cartWithItem = { ...mockCart, items: [existingItem] };
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockCartItemRepository.save.mockResolvedValue({ ...existingItem, quantity: 3, price: 99.99 });

      await cartService.updateItem('user-1', 'item-1', updateData);

      expect(existingItem.quantity).toBe(3);
      expect(existingItem.price).toBe(99.99);
      expect(mockCartItemRepository.save).toHaveBeenCalledWith(existingItem);
    });

    it('should throw error for invalid quantity', async () => {
      const invalidData = { quantity: 0 };

      await expect(cartService.updateItem('user-1', 'item-1', invalidData)).rejects.toThrow('Quantity must be a positive integer');
    });

    it('should throw error if cart item not found', async () => {
      const emptyCart = { ...mockCart, items: [] };
      mockCartRepository.findOne.mockResolvedValue(emptyCart);

      await expect(cartService.updateItem('user-1', 'item-1', updateData)).rejects.toThrow('Cart item not found');
    });

    it('should throw error if product not found', async () => {
      const cartWithItem = { ...mockCart, items: [existingItem] };
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(cartService.updateItem('user-1', 'item-1', updateData)).rejects.toThrow('Product not found or inactive');
    });

    it('should throw error if quantity exceeds stock', async () => {
      const cartWithItem = { ...mockCart, items: [existingItem] };
      const lowStockProduct = { ...mockProduct, stockQuantity: 2 };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockProductRepository.findOne.mockResolvedValue(lowStockProduct);

      await expect(cartService.updateItem('user-1', 'item-1', updateData)).rejects.toThrow('Cannot update quantity to 3. Only 2 available');
    });
  });

  describe('removeItem', () => {
    const existingItem = {
      id: 'item-1',
      cartId: 'cart-1',
      productId: 'product-1',
      quantity: 2,
      price: 99.99,
    };

    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should remove item from cart', async () => {
      const cartWithItem = { ...mockCart, items: [existingItem] };
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockCartItemRepository.remove.mockResolvedValue(existingItem);

      await cartService.removeItem('user-1', 'item-1');

      expect(mockCartItemRepository.remove).toHaveBeenCalledWith(existingItem);
    });

    it('should throw error if cart item not found', async () => {
      const emptyCart = { ...mockCart, items: [] };
      mockCartRepository.findOne.mockResolvedValue(emptyCart);

      await expect(cartService.removeItem('user-1', 'item-1')).rejects.toThrow('Cart item not found');
    });
  });

  describe('clearCart', () => {
    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should clear all items from cart', async () => {
      const items = [
        { id: 'item-1', cartId: 'cart-1', productId: 'product-1', quantity: 1, price: 99.99 },
        { id: 'item-2', cartId: 'cart-1', productId: 'product-2', quantity: 2, price: 49.99 },
      ];
      const cartWithItems = { ...mockCart, items };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItems);
      mockCartItemRepository.remove.mockResolvedValue(items);

      await cartService.clearCart('user-1');

      expect(mockCartItemRepository.remove).toHaveBeenCalledWith(items);
    });

    it('should handle empty cart', async () => {
      const emptyCart = { ...mockCart, items: [] };
      mockCartRepository.findOne.mockResolvedValue(emptyCart);

      await cartService.clearCart('user-1');

      expect(mockCartItemRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('validateCart', () => {
    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should return valid result for valid cart', async () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 2,
        price: 99.99,
      };
      const cartWithItem = { ...mockCart, items: [cartItem] };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await cartService.validateCart('user-1');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.unavailableItems).toHaveLength(0);
      expect(result.priceChanges).toHaveLength(0);
    });

    it('should detect product not found', async () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 2,
        price: 99.99,
      };
      const cartWithItem = { ...mockCart, items: [cartItem] };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await cartService.validateCart('user-1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Product product-1 no longer exists');
      expect(result.unavailableItems).toContain('product-1');
    });

    it('should detect inactive product', async () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 2,
        price: 99.99,
      };
      const cartWithItem = { ...mockCart, items: [cartItem] };
      const inactiveProduct = { ...mockProduct, isActive: false };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockProductRepository.findOne.mockResolvedValue(inactiveProduct);

      const result = await cartService.validateCart('user-1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Product "Test Product" is no longer available');
      expect(result.unavailableItems).toContain('product-1');
    });

    it('should detect out of stock product', async () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 2,
        price: 99.99,
      };
      const cartWithItem = { ...mockCart, items: [cartItem] };
      const outOfStockProduct = { ...mockProduct, inStock: false, stockQuantity: 0 };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockProductRepository.findOne.mockResolvedValue(outOfStockProduct);

      const result = await cartService.validateCart('user-1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Product "Test Product" is out of stock');
      expect(result.unavailableItems).toContain('product-1');
    });

    it('should detect insufficient stock', async () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 5,
        price: 99.99,
      };
      const cartWithItem = { ...mockCart, items: [cartItem] };
      const lowStockProduct = { ...mockProduct, stockQuantity: 3 };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockProductRepository.findOne.mockResolvedValue(lowStockProduct);

      const result = await cartService.validateCart('user-1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only 3 units of "Test Product" available, but 5 requested');
    });

    it('should detect price changes', async () => {
      const cartItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 2,
        price: 89.99,
      };
      const cartWithItem = { ...mockCart, items: [cartItem] };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await cartService.validateCart('user-1');

      expect(result.isValid).toBe(true);
      expect(result.priceChanges).toHaveLength(1);
      expect(result.priceChanges[0]).toEqual({
        productId: 'product-1',
        oldPrice: 89.99,
        newPrice: 99.99,
      });
    });
  });

  describe('calculateTotals', () => {
    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should calculate totals for cart with items', async () => {
      const items = [
        { id: 'item-1', cartId: 'cart-1', productId: 'product-1', quantity: 2, price: 99.99 },
        { id: 'item-2', cartId: 'cart-1', productId: 'product-2', quantity: 1, price: 49.99 },
      ];
      const cartWithItems = { ...mockCart, items };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItems);

      const result = await cartService.calculateTotals('user-1');

      expect(result.subtotal).toBe(249.97);
      expect(result.totalItems).toBe(3);
      expect(result.itemCount).toBe(2);
    });

    it('should return zero totals for empty cart', async () => {
      const emptyCart = { ...mockCart, items: [] };
      mockCartRepository.findOne.mockResolvedValue(emptyCart);

      const result = await cartService.calculateTotals('user-1');

      expect(result.subtotal).toBe(0);
      expect(result.totalItems).toBe(0);
      expect(result.itemCount).toBe(0);
    });
  });

  describe('getCartItemCount', () => {
    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should return total item count', async () => {
      const items = [
        { id: 'item-1', cartId: 'cart-1', productId: 'product-1', quantity: 2, price: 99.99 },
        { id: 'item-2', cartId: 'cart-1', productId: 'product-2', quantity: 3, price: 49.99 },
      ];
      const cartWithItems = { ...mockCart, items, totalItems: 5 };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItems);

      const result = await cartService.getCartItemCount('user-1');

      expect(result).toBe(5);
    });
  });

  describe('isProductInCart', () => {
    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should return true if product is in cart', async () => {
      const items = [
        { id: 'item-1', cartId: 'cart-1', productId: 'product-1', quantity: 2, price: 99.99 },
      ];
      const cartWithItems = { ...mockCart, items };
      
      mockCartRepository.findOne.mockResolvedValue(cartWithItems);

      const result = await cartService.isProductInCart('user-1', 'product-1');

      expect(result).toBe(true);
    });

    it('should return false if product is not in cart', async () => {
      const emptyCart = { ...mockCart, items: [] };
      mockCartRepository.findOne.mockResolvedValue(emptyCart);

      const result = await cartService.isProductInCart('user-1', 'product-1');

      expect(result).toBe(false);
    });
  });
});