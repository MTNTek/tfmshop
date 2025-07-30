import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { OrderItem } from './OrderItem';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 20,
    unique: true
  })
  orderNumber: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { 
    cascade: true, 
    eager: true 
  })
  items: OrderItem[];

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  // Pricing
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0
  })
  taxAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0
  })
  shippingAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0
  })
  discountAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  totalAmount: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD'
  })
  currency: string;

  // Shipping Information
  @Column({
    type: 'jsonb',
    nullable: true
  })
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
  };

  @Column({
    type: 'jsonb',
    nullable: true
  })
  billingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
  };

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true
  })
  shippingMethod: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true
  })
  trackingNumber: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true
  })
  carrier: string;

  // Payment Information
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true
  })
  paymentMethod: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true
  })
  paymentTransactionId: string;

  // Timestamps
  @Column({
    type: 'timestamp',
    nullable: true
  })
  confirmedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true
  })
  shippedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true
  })
  deliveredAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true
  })
  cancelledAt: Date;

  // Notes and metadata
  @Column({
    type: 'text',
    nullable: true
  })
  customerNotes: string;

  @Column({
    type: 'text',
    nullable: true
  })
  adminNotes: string;

  @Column({
    type: 'jsonb',
    nullable: true
  })
  metadata: Record<string, any>;

  // Calculated properties
  get itemCount(): number {
    return this.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  get isEditable(): boolean {
    return this.status === OrderStatus.PENDING;
  }

  get isCancellable(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
  }

  get isRefundable(): boolean {
    return [OrderStatus.DELIVERED].includes(this.status) && 
           this.paymentStatus === PaymentStatus.CAPTURED;
  }

  // Helper methods
  canTransitionTo(newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: []
    };

    return validTransitions[this.status]?.includes(newStatus) || false;
  }

  updateStatus(newStatus: OrderStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;

    // Update timestamps based on status
    const now = new Date();
    switch (newStatus) {
      case OrderStatus.CONFIRMED:
        this.confirmedAt = now;
        break;
      case OrderStatus.SHIPPED:
        this.shippedAt = now;
        break;
      case OrderStatus.DELIVERED:
        this.deliveredAt = now;
        break;
      case OrderStatus.CANCELLED:
        this.cancelledAt = now;
        break;
    }
  }

  calculateTotals(): void {
    if (!this.items) return;

    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Tax calculation (8% example - should be configurable)
    this.taxAmount = this.subtotal * 0.08;

    // Calculate final total
    this.totalAmount = this.subtotal + this.taxAmount + this.shippingAmount - this.discountAmount;
  }
}
