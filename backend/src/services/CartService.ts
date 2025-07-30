import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { Product } from '../entities/Product';
import { User } from '../entities/User';

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  unavailableItems: string[];
  priceChanges: Array<{
    productId: string;
    oldPrice: number;
    newPrice: number;
  }>;
}

export interface CartTotals {
  subtotal: number;
  totalItems: number;
  itemCount: number;
}

/**
 * Service class for managing shopping cart operations
 */
export class CartService {
  private cartRepository: Repository<Cart>;
  private cartItemRepository: Repository<CartItem>;
  private productRepository: Repository<Product>;
  private userRepository: Repository<User>;

  constructor() {
    this.cartRepository = AppDataSource.getRepository(Cart);
    this.cartItemRepository = AppDataSource.getRepository(CartItem);
    this.productRepository = AppDataSource.getRepository(Product);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Get or create a cart for a user
   */
  async getCart(userId: string): Promise<Cart> {
    // First verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * Add item to cart or update quantity if item already exists
   */
  async addItem(userId: string, data: AddToCartData): Promise<Cart> {
    const { productId, quantity } = data;

    // Validate quantity
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    // Get product and validate availability
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new Error('Product not found or inactive');
    }

    if (!product.inStock || product.stockQuantity <= 0) {
      throw new Error('Product is out of stock');
    }

    // Get or create cart
    const cart = await this.getCart(userId);

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stockQuantity) {
        throw new Error(`Cannot add ${quantity} items. Only ${product.stockQuantity - existingItem.quantity} available`);
      }

      existingItem.quantity = newQuantity;
      existingItem.price = product.price; // Update price to current price
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new cart item
      if (quantity > product.stockQuantity) {
        throw new Error(`Cannot add ${quantity} items. Only ${product.stockQuantity} available`);
      }

      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      });

      await this.cartItemRepository.save(cartItem);
    }

    // Return updated cart
    return await this.getCart(userId);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(userId: string, itemId: string, data: UpdateCartItemData): Promise<Cart> {
    const { quantity } = data;

    // Validate quantity
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    // Get cart and verify ownership
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find(item => item.id === itemId);

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Get product and validate availability
    const product = await this.productRepository.findOne({
      where: { id: cartItem.productId, isActive: true },
    });

    if (!product) {
      throw new Error('Product not found or inactive');
    }

    if (!product.inStock || product.stockQuantity < quantity) {
      throw new Error(`Cannot update quantity to ${quantity}. Only ${product.stockQuantity} available`);
    }

    // Update cart item
    cartItem.quantity = quantity;
    cartItem.price = product.price; // Update price to current price
    await this.cartItemRepository.save(cartItem);

    // Return updated cart
    return await this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<Cart> {
    // Get cart and verify ownership
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find(item => item.id === itemId);

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Remove cart item
    await this.cartItemRepository.remove(cartItem);

    // Return updated cart
    return await this.getCart(userId);
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }

    // Return empty cart
    return await this.getCart(userId);
  }

  /**
   * Validate cart contents and check for issues
   */
  async validateCart(userId: string): Promise<CartValidationResult> {
    const cart = await this.getCart(userId);
    const errors: string[] = [];
    const unavailableItems: string[] = [];
    const priceChanges: Array<{
      productId: string;
      oldPrice: number;
      newPrice: number;
    }> = [];

    for (const item of cart.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        errors.push(`Product ${item.productId} no longer exists`);
        unavailableItems.push(item.productId);
        continue;
      }

      if (!product.isActive) {
        errors.push(`Product "${product.title}" is no longer available`);
        unavailableItems.push(item.productId);
        continue;
      }

      if (!product.inStock || product.stockQuantity <= 0) {
        errors.push(`Product "${product.title}" is out of stock`);
        unavailableItems.push(item.productId);
        continue;
      }

      if (item.quantity > product.stockQuantity) {
        errors.push(`Only ${product.stockQuantity} units of "${product.title}" available, but ${item.quantity} requested`);
        continue;
      }

      // Check for price changes
      if (item.price !== product.price) {
        priceChanges.push({
          productId: item.productId,
          oldPrice: item.price,
          newPrice: product.price,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      unavailableItems,
      priceChanges,
    };
  }

  /**
   * Calculate cart totals
   */
  async calculateTotals(userId: string): Promise<CartTotals> {
    const cart = await this.getCart(userId);

    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const totalItems = cart.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    return {
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      totalItems,
      itemCount: cart.items.length,
    };
  }

  /**
   * Update cart item prices to current product prices
   */
  async updateCartPrices(userId: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    for (const item of cart.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId, isActive: true },
      });

      if (product && item.price !== product.price) {
        item.price = product.price;
        await this.cartItemRepository.save(item);
      }
    }

    return await this.getCart(userId);
  }

  /**
   * Get cart item count for a user
   */
  async getCartItemCount(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.totalItems;
  }

  /**
   * Check if product is in user's cart
   */
  async isProductInCart(userId: string, productId: string): Promise<boolean> {
    const cart = await this.getCart(userId);
    return cart.items.some(item => item.productId === productId);
  }
}