import { CartItem } from '../../src/entities/CartItem';
import { Cart } from '../../src/entities/Cart';
import { Product } from '../../src/entities/Product';

describe('CartItem Entity', () => {
  let cartItem: CartItem;
  let mockCart: Cart;
  let mockProduct: Product;

  beforeEach(() => {
    mockCart = {
      id: 'cart-1',
      userId: 'user-1',
    } as Cart;

    mockProduct = {
      id: 'product-1',
      title: 'Test Product',
      price: 99.99,
    } as Product;

    cartItem = new CartItem();
    cartItem.id = 'item-1';
    cartItem.cartId = 'cart-1';
    cartItem.cart = mockCart;
    cartItem.productId = 'product-1';
    cartItem.product = mockProduct;
    cartItem.quantity = 2;
    cartItem.price = 99.99;
  });

  describe('totalPrice getter', () => {
    it('should calculate total price for cart item', () => {
      expect(cartItem.totalPrice).toBe(199.98);
    });

    it('should handle single quantity', () => {
      cartItem.quantity = 1;
      expect(cartItem.totalPrice).toBe(99.99);
    });

    it('should handle zero quantity', () => {
      cartItem.quantity = 0;
      expect(cartItem.totalPrice).toBe(0);
    });

    it('should handle decimal prices', () => {
      cartItem.price = 19.95;
      cartItem.quantity = 3;
      expect(cartItem.totalPrice).toBeCloseTo(59.85, 2);
    });
  });

  describe('isValidQuantity', () => {
    it('should return true for positive integer quantity', () => {
      cartItem.quantity = 5;
      expect(cartItem.isValidQuantity()).toBe(true);
    });

    it('should return true for quantity of 1', () => {
      cartItem.quantity = 1;
      expect(cartItem.isValidQuantity()).toBe(true);
    });

    it('should return false for zero quantity', () => {
      cartItem.quantity = 0;
      expect(cartItem.isValidQuantity()).toBe(false);
    });

    it('should return false for negative quantity', () => {
      cartItem.quantity = -1;
      expect(cartItem.isValidQuantity()).toBe(false);
    });

    it('should return false for decimal quantity', () => {
      cartItem.quantity = 1.5;
      expect(cartItem.isValidQuantity()).toBe(false);
    });

    it('should return false for non-numeric quantity', () => {
      cartItem.quantity = NaN;
      expect(cartItem.isValidQuantity()).toBe(false);
    });
  });
});