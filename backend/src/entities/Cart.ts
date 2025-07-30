import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { CartItem } from './CartItem';

/**
 * Cart entity representing a user's shopping cart
 */
@Entity('carts')
export class Cart extends BaseEntity {
  // User relationship
  @Column({
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Cart items relationship
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  /**
   * Calculate total number of items in cart
   */
  get totalItems(): number {
    return this.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  /**
   * Calculate subtotal of all items in cart
   */
  get subtotal(): number {
    return this.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  }

  /**
   * Check if cart is empty
   */
  get isEmpty(): boolean {
    return !this.items || this.items.length === 0;
  }

  /**
   * Get cart item by product ID
   */
  getItemByProductId(productId: string): CartItem | undefined {
    return this.items?.find(item => item.productId === productId);
  }
}