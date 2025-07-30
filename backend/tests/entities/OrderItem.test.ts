import { OrderItem } from '../../src/entities/OrderItem';

describe('OrderItem Entity', () => {
  let orderItem: OrderItem;

  beforeEach(() => {
    orderItem = new OrderItem();
    orderItem.id = '123e4567-e89b-12d3-a456-426614174000';
    orderItem.orderId = '123e4567-e89b-12d3-a456-426614174001';
    orderItem.productId = '123e4567-e89b-12d3-a456-426614174002';
    orderItem.productTitle = 'Test Product';
    orderItem.productDescription = 'Test product description';
    orderItem.quantity = 2;
    orderItem.unitPrice = 25.99;
    orderItem.discount = 0;
    orderItem.createdAt = new Date();
    orderItem.updatedAt = new Date();
  });

  describe('totalPrice getter', () => {
    it('should calculate total price without discount', () => {
      orderItem.quantity = 2;
      orderItem.unitPrice = 25.99;
      orderItem.discount = 0;
      
      expect(orderItem.totalPrice).toBe(51.98);
    });

    it('should calculate total price with discount', () => {
      orderItem.quantity = 2;
      orderItem.unitPrice = 25.99;
      orderItem.discount = 5.00;
      
      expect(orderItem.totalPrice).toBe(46.98);
    });

    it('should handle zero quantity', () => {
      orderItem.quantity = 0;
      orderItem.unitPrice = 25.99;
      orderItem.discount = 0;
      
      expect(orderItem.totalPrice).toBe(0);
    });

    it('should handle zero unit price', () => {
      orderItem.quantity = 2;
      orderItem.unitPrice = 0;
      orderItem.discount = 0;
      
      expect(orderItem.totalPrice).toBe(0);
    });
  });

  describe('subtotal getter', () => {
    it('should calculate subtotal before discount', () => {
      orderItem.quantity = 3;
      orderItem.unitPrice = 15.50;
      orderItem.discount = 10.00;
      
      expect(orderItem.subtotal).toBe(46.50);
    });

    it('should handle zero values', () => {
      orderItem.quantity = 0;
      orderItem.unitPrice = 0;
      
      expect(orderItem.subtotal).toBe(0);
    });
  });

  describe('discountPercentage getter', () => {
    it('should calculate discount percentage', () => {
      orderItem.quantity = 2;
      orderItem.unitPrice = 50.00;
      orderItem.discount = 10.00;
      
      expect(orderItem.discountPercentage).toBe(10);
    });

    it('should return 0 when no discount', () => {
      orderItem.quantity = 2;
      orderItem.unitPrice = 50.00;
      orderItem.discount = 0;
      
      expect(orderItem.discountPercentage).toBe(0);
    });

    it('should return 0 when subtotal is 0', () => {
      orderItem.quantity = 0;
      orderItem.unitPrice = 0;
      orderItem.discount = 10.00;
      
      expect(orderItem.discountPercentage).toBe(0);
    });

    it('should handle 100% discount', () => {
      orderItem.quantity = 1;
      orderItem.unitPrice = 25.00;
      orderItem.discount = 25.00;
      
      expect(orderItem.discountPercentage).toBe(100);
    });
  });

  describe('hasDiscount getter', () => {
    it('should return true when discount is applied', () => {
      orderItem.discount = 5.00;
      expect(orderItem.hasDiscount).toBe(true);
    });

    it('should return false when no discount', () => {
      orderItem.discount = 0;
      expect(orderItem.hasDiscount).toBe(false);
    });

    it('should return false for negative discount', () => {
      orderItem.discount = -5.00;
      expect(orderItem.hasDiscount).toBe(false);
    });
  });

  describe('formattedUnitPrice getter', () => {
    it('should format unit price with dollar sign and two decimals', () => {
      orderItem.unitPrice = 25.99;
      expect(orderItem.formattedUnitPrice).toBe('$25.99');
    });

    it('should format whole numbers with two decimals', () => {
      orderItem.unitPrice = 25;
      expect(orderItem.formattedUnitPrice).toBe('$25.00');
    });

    it('should handle zero price', () => {
      orderItem.unitPrice = 0;
      expect(orderItem.formattedUnitPrice).toBe('$0.00');
    });
  });

  describe('formattedTotalPrice getter', () => {
    it('should format total price with dollar sign and two decimals', () => {
      orderItem.quantity = 2;
      orderItem.unitPrice = 25.99;
      orderItem.discount = 1.98;
      
      expect(orderItem.formattedTotalPrice).toBe('$50.00');
    });

    it('should handle zero total', () => {
      orderItem.quantity = 0;
      orderItem.unitPrice = 25.99;
      orderItem.discount = 0;
      
      expect(orderItem.formattedTotalPrice).toBe('$0.00');
    });
  });

  describe('isValidQuantity method', () => {
    it('should return true for positive integer quantity', () => {
      orderItem.quantity = 5;
      expect(orderItem.isValidQuantity()).toBe(true);
    });

    it('should return false for zero quantity', () => {
      orderItem.quantity = 0;
      expect(orderItem.isValidQuantity()).toBe(false);
    });

    it('should return false for negative quantity', () => {
      orderItem.quantity = -1;
      expect(orderItem.isValidQuantity()).toBe(false);
    });

    it('should return false for decimal quantity', () => {
      orderItem.quantity = 2.5;
      expect(orderItem.isValidQuantity()).toBe(false);
    });
  });
});