import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Cart } from './Cart';
import { Product } from './Product';

/**
 * CartItem entity representing individual items in a shopping cart
 */
@Entity('cart_items')
export class CartItem extends BaseEntity {
  // Cart relationship
  @Column({
    type: 'uuid',
  })
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  // Product relationship
  @Column({
    type: 'uuid',
  })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity: number;

  // Price at time of adding to cart (to handle price changes)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  /**
   * Calculate total price for this cart item
   */
  get totalPrice(): number {
    return this.price * this.quantity;
  }

  /**
   * Check if quantity is valid
   */
  isValidQuantity(): boolean {
    return this.quantity > 0 && Number.isInteger(this.quantity);
  }
}