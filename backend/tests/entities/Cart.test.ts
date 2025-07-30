import { Cart } from '../../src/entities/Cart';
import { CartItem } from '../../src/entities/CartItem';
import { User } from '../../src/entities/User';

describe('Cart Entity', () => {
  let cart: Cart;
  let mockUser: User;
  let mockCartItems: CartItem[];

  beforeEach(() => {
    mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    } as User;

    mockCartItems = [
      {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 2,
        price: 99.99,
        totalPrice: 199.98,
      } as CartItem,
      {
        id: 'item-2',
        cartId: 'cart-1',
        productId: 'product-2',
        quantity: 1,
        price: 49.99,
        totalPrice: 49.99,
      } as CartItem,
    ];

    cart = new Cart();
    cart.id = 'cart-1';
    cart.userId = 'user-1';
    cart.user = mockUser;
    cart.items = mockCartItems;
  });

  describe('totalItems getter', () => {
    it('should calculate total number of items in cart', () => {
      expect(cart.totalItems).toBe(3);
    });

    it('should return 0 for empty cart', () => {
      cart.items = [];
      expect(cart.totalItems).toBe(0);
    });

    it('should return 0 for undefined items', () => {
      cart.items = undefined as any;
      expect(cart.totalItems).toBe(0);
    });
  });

  describe('subtotal getter', () => {
    it('should calculate subtotal of all items in cart', () => {
      expect(cart.subtotal).toBe(249.97);
    });

    it('should return 0 for empty cart', () => {
      cart.items = [];
      expect(cart.subtotal).toBe(0);
    });

    it('should return 0 for undefined items', () => {
      cart.items = undefined as any;
      expect(cart.subtotal).toBe(0);
    });
  });

  describe('isEmpty getter', () => {
    it('should return false for cart with items', () => {
      expect(cart.isEmpty).toBe(false);
    });

    it('should return true for empty cart', () => {
      cart.items = [];
      expect(cart.isEmpty).toBe(true);
    });

    it('should return true for undefined items', () => {
      cart.items = undefined as any;
      expect(cart.isEmpty).toBe(true);
    });
  });

  describe('getItemByProductId', () => {
    it('should return cart item for existing product', () => {
      const item = cart.getItemByProductId('product-1');
      expect(item).toBeDefined();
      expect(item?.productId).toBe('product-1');
      expect(item?.quantity).toBe(2);
    });

    it('should return undefined for non-existing product', () => {
      const item = cart.getItemByProductId('non-existing-product');
      expect(item).toBeUndefined();
    });

    it('should return undefined for empty cart', () => {
      cart.items = [];
      const item = cart.getItemByProductId('product-1');
      expect(item).toBeUndefined();
    });

    it('should return undefined for undefined items', () => {
      cart.items = undefined as any;
      const item = cart.getItemByProductId('product-1');
      expect(item).toBeUndefined();
    });
  });
});