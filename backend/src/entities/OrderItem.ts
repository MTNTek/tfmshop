import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order';
import { Product } from './Product';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({
    type: 'int'
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  originalPrice: number; // Price before any item-level discounts

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0
  })
  discountAmount: number;

  // Product snapshot at time of order (in case product changes later)
  @Column({
    type: 'varchar',
    length: 255
  })
  productTitle: string;

  @Column({
    type: 'varchar',
    length: 100
  })
  productSku: string;

  @Column({
    type: 'jsonb',
    nullable: true
  })
  productSnapshot: {
    title: string;
    description?: string;
    images: string[];
    specifications?: Record<string, any>;
  };

  @Column({
    type: 'jsonb',
    nullable: true
  })
  selectedVariant: {
    name: string;
    value: string;
    priceModifier?: number;
  }[];

  @Column({
    type: 'jsonb',
    nullable: true
  })
  customizations: Record<string, any>;

  @Column({
    type: 'text',
    nullable: true
  })
  notes: string;

  // Fulfillment status
  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending'
  })
  fulfillmentStatus: 'pending' | 'fulfilled' | 'partially_fulfilled' | 'cancelled';

  @Column({
    type: 'int',
    default: 0
  })
  fulfilledQuantity: number;

  @Column({
    type: 'timestamp',
    nullable: true
  })
  fulfilledAt: Date;

  // Calculated properties
  get lineTotal(): number {
    return (this.quantity * this.unitPrice) - this.discountAmount;
  }

  get originalLineTotal(): number {
    return this.quantity * (this.originalPrice || this.unitPrice);
  }

  get totalDiscount(): number {
    const priceDiscount = (this.originalPrice || this.unitPrice) - this.unitPrice;
    return (priceDiscount * this.quantity) + this.discountAmount;
  }

  get remainingQuantity(): number {
    return this.quantity - this.fulfilledQuantity;
  }

  get isFullyFulfilled(): boolean {
    return this.fulfilledQuantity >= this.quantity;
  }

  get canFulfill(): boolean {
    return this.fulfillmentStatus !== 'cancelled' && !this.isFullyFulfilled;
  }

  // Helper methods
  fulfillQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Fulfill quantity must be greater than 0');
    }

    if (this.fulfilledQuantity + quantity > this.quantity) {
      throw new Error('Cannot fulfill more than ordered quantity');
    }

    this.fulfilledQuantity += quantity;

    if (this.fulfilledQuantity === this.quantity) {
      this.fulfillmentStatus = 'fulfilled';
      this.fulfilledAt = new Date();
    } else if (this.fulfilledQuantity > 0) {
      this.fulfillmentStatus = 'partially_fulfilled';
    }
  }

  cancelFulfillment(): void {
    this.fulfillmentStatus = 'cancelled';
  }

  getVariantDisplay(): string {
    if (!this.selectedVariant || this.selectedVariant.length === 0) {
      return '';
    }

    return this.selectedVariant
      .map(variant => `${variant.name}: ${variant.value}`)
      .join(', ');
  }

  // Create a snapshot of the product at the time of order
  createProductSnapshot(product: Product): void {
    this.productTitle = product.title;
    this.productSku = product.sku;
    this.productSnapshot = {
      title: product.title,
      description: product.description,
      images: product.images,
      specifications: product.specifications
    };
  }
}
