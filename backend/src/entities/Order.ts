import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { OrderItem } from './OrderItem';

/**
 * Order status enumeration
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Order entity representing customer orders
 */
@Entity('orders')
export class Order extends BaseEntity {
  // Unique order number for customer reference
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  orderNumber: string;

  // User relationship
  @Column({
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Order items relationship
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  // Order status
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Pricing information
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  tax: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  shipping: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total: number;

  // Address information stored as JSON
  @Column({
    type: 'jsonb',
  })
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  @Column({
    type: 'jsonb',
  })
  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  // Payment information (basic for now)
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  paymentReference?: string;

  // Tracking information
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  trackingNumber?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  shippedAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deliveredAt?: Date;

  // Notes and special instructions
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  customerNotes?: string;

  /**
   * Calculate total number of items in order
   */
  get totalItems(): number {
    return this.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  /**
   * Check if order can be cancelled
   */
  get canBeCancelled(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
  }

  /**
   * Check if order is completed
   */
  get isCompleted(): boolean {
    return [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(this.status);
  }

  /**
   * Get order status display name
   */
  get statusDisplay(): string {
    const statusMap = {
      [OrderStatus.PENDING]: 'Pending',
      [OrderStatus.CONFIRMED]: 'Confirmed',
      [OrderStatus.PROCESSING]: 'Processing',
      [OrderStatus.SHIPPED]: 'Shipped',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled',
      [OrderStatus.REFUNDED]: 'Refunded',
    };
    return statusMap[this.status] || this.status;
  }

  /**
   * Get formatted order number for display
   */
  get formattedOrderNumber(): string {
    return `#${this.orderNumber}`;
  }
}