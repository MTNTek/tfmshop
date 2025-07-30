import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order';
import { Product } from './Product';

/**
 * OrderItem entity representing individual items within an order
 */
@Entity('order_items')
export class OrderItem extends BaseEntity {
  // Order relationship
  @Column({
    type: 'uuid',
  })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Product relationship
  @Column({
    type: 'uuid',
  })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Product details at time of order (for historical accuracy)
  @Column({
    type: 'varchar',
    length: 255,
  })
  productTitle: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  productDescription?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  productSku?: string;

  // Quantity ordered
  @Column({
    type: 'int',
  })
  quantity: number;

  // Price at time of order (to handle price changes)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitPrice: number;

  // Discount applied to this item
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discount: number;

  // Product image at time of order
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  productImage?: string;

  // Product specifications at time of order
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  productSpecifications?: Record<string, any>;

  /**
   * Calculate total price for this order item (after discount)
   */
  get totalPrice(): number {
    return (this.unitPrice * this.quantity) - this.discount;
  }

  /**
   * Calculate subtotal before discount
   */
  get subtotal(): number {
    return this.unitPrice * this.quantity;
  }

  /**
   * Calculate discount percentage
   */
  get discountPercentage(): number {
    if (this.subtotal === 0) return 0;
    return (this.discount / this.subtotal) * 100;
  }

  /**
   * Check if item has discount applied
   */
  get hasDiscount(): boolean {
    return this.discount > 0;
  }

  /**
   * Get formatted unit price
   */
  get formattedUnitPrice(): string {
    return `$${this.unitPrice.toFixed(2)}`;
  }

  /**
   * Get formatted total price
   */
  get formattedTotalPrice(): string {
    return `$${this.totalPrice.toFixed(2)}`;
  }

  /**
   * Validate quantity is positive
   */
  isValidQuantity(): boolean {
    return this.quantity > 0 && Number.isInteger(this.quantity);
  }
}