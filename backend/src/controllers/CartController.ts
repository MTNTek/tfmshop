import { Response } from 'express';
import { CartService } from '../services/CartService';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  AddToCartRequest,
  UpdateCartItemRequest,
  CartItemParams,
  CartResponse,
  CartItemResponse,
  CartTotalsResponse,
  CartValidationResponse,
} from '../types/cart';

/**
 * Cart controller handling shopping cart operations
 */
export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  /**
   * Get user's cart
   * GET /api/cart
   */
  getCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const cart = await this.cartService.getCart(userId);

      const response: CartResponse = {
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          product: {
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            images: item.product.images,
            stockQuantity: item.product.stockQuantity,
            inStock: item.product.inStock,
          },
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        })),
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        isEmpty: cart.isEmpty,
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Cart retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve cart';
      
      let statusCode = 500;
      let errorCode = 'CART_RETRIEVAL_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Add item to cart
   * POST /api/cart/items
   */
  addItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const cart = await this.cartService.addItem(userId, req.body);

      const response: CartResponse = {
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          product: {
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            images: item.product.images,
            stockQuantity: item.product.stockQuantity,
            inStock: item.product.inStock,
          },
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        })),
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        isEmpty: cart.isEmpty,
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Item added to cart successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      
      let statusCode = 500;
      let errorCode = 'ADD_TO_CART_ERROR';

      if (errorMessage.includes('not found')) {
        statusCode = 404;
        errorCode = 'PRODUCT_NOT_FOUND';
      } else if (errorMessage.includes('out of stock') || errorMessage.includes('available')) {
        statusCode = 400;
        errorCode = 'INSUFFICIENT_STOCK';
      } else if (errorMessage.includes('Quantity must be')) {
        statusCode = 400;
        errorCode = 'INVALID_QUANTITY';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Update cart item quantity
   * PUT /api/cart/items/:itemId
   */
  updateItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;
      const cart = await this.cartService.updateItem(userId, itemId, req.body);

      const response: CartResponse = {
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          product: {
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            images: item.product.images,
            stockQuantity: item.product.stockQuantity,
            inStock: item.product.inStock,
          },
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        })),
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        isEmpty: cart.isEmpty,
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Cart item updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cart item';
      
      let statusCode = 500;
      let errorCode = 'UPDATE_CART_ITEM_ERROR';

      if (errorMessage.includes('Cart item not found')) {
        statusCode = 404;
        errorCode = 'CART_ITEM_NOT_FOUND';
      } else if (errorMessage.includes('Product not found')) {
        statusCode = 404;
        errorCode = 'PRODUCT_NOT_FOUND';
      } else if (errorMessage.includes('available') || errorMessage.includes('stock')) {
        statusCode = 400;
        errorCode = 'INSUFFICIENT_STOCK';
      } else if (errorMessage.includes('Quantity must be')) {
        statusCode = 400;
        errorCode = 'INVALID_QUANTITY';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Remove item from cart
   * DELETE /api/cart/items/:itemId
   */
  removeItem = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { itemId } = req.params;
      const cart = await this.cartService.removeItem(userId, itemId);

      const response: CartResponse = {
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          product: {
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            images: item.product.images,
            stockQuantity: item.product.stockQuantity,
            inStock: item.product.inStock,
          },
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        })),
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        isEmpty: cart.isEmpty,
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Item removed from cart successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove cart item';
      
      let statusCode = 500;
      let errorCode = 'REMOVE_CART_ITEM_ERROR';

      if (errorMessage.includes('Cart item not found')) {
        statusCode = 404;
        errorCode = 'CART_ITEM_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Clear entire cart
   * DELETE /api/cart
   */
  clearCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const cart = await this.cartService.clearCart(userId);

      const response: CartResponse = {
        id: cart.id,
        userId: cart.userId,
        items: [],
        totalItems: 0,
        subtotal: 0,
        isEmpty: true,
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Cart cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CLEAR_CART_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get cart totals
   * GET /api/cart/totals
   */
  getTotals = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const totals = await this.cartService.calculateTotals(userId);

      const response: CartTotalsResponse = {
        subtotal: totals.subtotal,
        totalItems: totals.totalItems,
        itemCount: totals.itemCount,
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Cart totals calculated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate cart totals';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CART_TOTALS_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Validate cart contents
   * GET /api/cart/validate
   */
  validateCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const validation = await this.cartService.validateCart(userId);

      const response: CartValidationResponse = {
        isValid: validation.isValid,
        errors: validation.errors,
        unavailableItems: validation.unavailableItems,
        priceChanges: validation.priceChanges,
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Cart validation completed',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate cart';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CART_VALIDATION_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Update cart prices to current product prices
   * POST /api/cart/update-prices
   */
  updatePrices = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const cart = await this.cartService.updateCartPrices(userId);

      const response: CartResponse = {
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          product: {
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            images: item.product.images,
            stockQuantity: item.product.stockQuantity,
            inStock: item.product.inStock,
          },
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        })),
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        isEmpty: cart.isEmpty,
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Cart prices updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cart prices';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_CART_PRICES_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };
}