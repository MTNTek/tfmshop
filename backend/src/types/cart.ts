import { z } from 'zod';

/**
 * Zod schemas for cart request validation
 */

// Add item to cart request
export const AddToCartSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

// Update cart item request
export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

// Cart item ID parameter
export const CartItemParamsSchema = z.object({
  itemId: z.string().uuid('Item ID must be a valid UUID'),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type AddToCartRequest = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemSchema>;
export type CartItemParams = z.infer<typeof CartItemParamsSchema>;

/**
 * Cart response types
 */
export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
  isEmpty: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stockQuantity: number;
    inStock: boolean;
  };
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface CartTotalsResponse {
  subtotal: number;
  totalItems: number;
  itemCount: number;
}

export interface CartValidationResponse {
  isValid: boolean;
  errors: string[];
  unavailableItems: string[];
  priceChanges: Array<{
    productId: string;
    oldPrice: number;
    newPrice: number;
  }>;
}