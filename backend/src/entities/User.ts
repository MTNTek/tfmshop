import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Cart } from './Cart';
import { Address } from './Address';
import { Order } from './Order';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

/**
 * User entity representing registered users in the system
 * Supports both customers and administrators
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'first_name',
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'last_name',
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  // Cart relationship
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  // Addresses relationship
  @OneToMany(() => Address, (address) => address.user, {
    cascade: true,
  })
  addresses: Address[];

  // Orders relationship
  @OneToMany(() => Order, (order) => order.user, {
    cascade: true,
  })
  orders: Order[];

  /**
   * Get user's full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if user is an admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user is a customer
   */
  isCustomer(): boolean {
    return this.role === UserRole.CUSTOMER;
  }
}