'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  inStock: boolean;
  isPrime?: boolean;
  seller?: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  total: 0,
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      let updatedItems: CartItem[];
      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 35 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      return {
        ...state,
        items: updatedItems,
        itemCount,
        subtotal,
        total,
      };
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 35 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      return {
        ...state,
        items: updatedItems,
        itemCount,
        subtotal,
        total,
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 35 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      return {
        ...state,
        items: updatedItems,
        itemCount,
        subtotal,
        total,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        itemCount: 0,
        subtotal: 0,
        total: 0,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    case 'LOAD_CART': {
      const items = action.payload;
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 35 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      return {
        ...state,
        items,
        itemCount,
        subtotal,
        total,
      };
    }

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('tfmshop-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tfmshop-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
