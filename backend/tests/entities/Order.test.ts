import { Order, OrderStatus } from '../../src/entities/Order';
import { OrderItem } from '../../src/entities/OrderItem';

describe('Order Entity', () => {
  let order: Order;

  beforeEach(() => {
    order = new Order();
    order.id = '123e4567-e89b-12d3-a456-426614174000';
    order.orderNumber = 'ORD-2024-001';
    order.userId = '123e4567-e89b-12d3-a456-426614174001';
    order.status = OrderStatus.PENDING;
    order.subtotal = 100.00;
    order.tax = 8.50;
    order.shipping = 10.00;
    order.total = 118.50;
    order.shippingAddress = {
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'United States',
    };
    order.billingAddress = {
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'United States',
    };
    order.createdAt = new Date();
    order.updatedAt = new Date();
  });

  describe('totalItems getter', () => {
    it('should return 0 when no items', () => {
      order.items = [];
      expect(order.totalItems).toBe(0);
    });

    it('should return total quantity of all items', () => {
      const item1 = new OrderItem();
      item1.quantity = 2;
      
      const item2 = new OrderItem();
      item2.quantity = 3;

      order.items = [item1, item2];
      expect(order.totalItems).toBe(5);
    });

    it('should handle undefined items', () => {
      order.items = undefined as any;
      expect(order.totalItems).toBe(0);
    });
  });

  describe('canBeCancelled getter', () => {
    it('should return true for pending orders', () => {
      order.status = OrderStatus.PENDING;
      expect(order.canBeCancelled).toBe(true);
    });

    it('should return true for confirmed orders', () => {
      order.status = OrderStatus.CONFIRMED;
      expect(order.canBeCancelled).toBe(true);
    });

    it('should return false for processing orders', () => {
      order.status = OrderStatus.PROCESSING;
      expect(order.canBeCancelled).toBe(false);
    });

    it('should return false for shipped orders', () => {
      order.status = OrderStatus.SHIPPED;
      expect(order.canBeCancelled).toBe(false);
    });

    it('should return false for delivered orders', () => {
      order.status = OrderStatus.DELIVERED;
      expect(order.canBeCancelled).toBe(false);
    });

    it('should return false for already cancelled orders', () => {
      order.status = OrderStatus.CANCELLED;
      expect(order.canBeCancelled).toBe(false);
    });
  });

  describe('isCompleted getter', () => {
    it('should return false for pending orders', () => {
      order.status = OrderStatus.PENDING;
      expect(order.isCompleted).toBe(false);
    });

    it('should return false for confirmed orders', () => {
      order.status = OrderStatus.CONFIRMED;
      expect(order.isCompleted).toBe(false);
    });

    it('should return false for processing orders', () => {
      order.status = OrderStatus.PROCESSING;
      expect(order.isCompleted).toBe(false);
    });

    it('should return false for shipped orders', () => {
      order.status = OrderStatus.SHIPPED;
      expect(order.isCompleted).toBe(false);
    });

    it('should return true for delivered orders', () => {
      order.status = OrderStatus.DELIVERED;
      expect(order.isCompleted).toBe(true);
    });

    it('should return true for cancelled orders', () => {
      order.status = OrderStatus.CANCELLED;
      expect(order.isCompleted).toBe(true);
    });

    it('should return true for refunded orders', () => {
      order.status = OrderStatus.REFUNDED;
      expect(order.isCompleted).toBe(true);
    });
  });

  describe('statusDisplay getter', () => {
    it('should return display name for pending status', () => {
      order.status = OrderStatus.PENDING;
      expect(order.statusDisplay).toBe('Pending');
    });

    it('should return display name for confirmed status', () => {
      order.status = OrderStatus.CONFIRMED;
      expect(order.statusDisplay).toBe('Confirmed');
    });

    it('should return display name for processing status', () => {
      order.status = OrderStatus.PROCESSING;
      expect(order.statusDisplay).toBe('Processing');
    });

    it('should return display name for shipped status', () => {
      order.status = OrderStatus.SHIPPED;
      expect(order.statusDisplay).toBe('Shipped');
    });

    it('should return display name for delivered status', () => {
      order.status = OrderStatus.DELIVERED;
      expect(order.statusDisplay).toBe('Delivered');
    });

    it('should return display name for cancelled status', () => {
      order.status = OrderStatus.CANCELLED;
      expect(order.statusDisplay).toBe('Cancelled');
    });

    it('should return display name for refunded status', () => {
      order.status = OrderStatus.REFUNDED;
      expect(order.statusDisplay).toBe('Refunded');
    });
  });

  describe('formattedOrderNumber getter', () => {
    it('should return formatted order number with hash prefix', () => {
      order.orderNumber = 'ORD-2024-001';
      expect(order.formattedOrderNumber).toBe('#ORD-2024-001');
    });

    it('should handle empty order number', () => {
      order.orderNumber = '';
      expect(order.formattedOrderNumber).toBe('#');
    });
  });

  describe('Order Status Enum', () => {
    it('should have correct enum values', () => {
      expect(OrderStatus.PENDING).toBe('pending');
      expect(OrderStatus.CONFIRMED).toBe('confirmed');
      expect(OrderStatus.PROCESSING).toBe('processing');
      expect(OrderStatus.SHIPPED).toBe('shipped');
      expect(OrderStatus.DELIVERED).toBe('delivered');
      expect(OrderStatus.CANCELLED).toBe('cancelled');
      expect(OrderStatus.REFUNDED).toBe('refunded');
    });
  });
});