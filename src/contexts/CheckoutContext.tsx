'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal';
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  isDefault: boolean;
}

interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

interface CheckoutState {
  currentStep: 'shipping' | 'payment' | 'review' | 'confirmation';
  shippingAddress: ShippingAddress | null;
  billingAddress: ShippingAddress | null;
  useSameAddress: boolean;
  paymentMethod: PaymentMethod | null;
  orderSummary: OrderSummary;
  isProcessing: boolean;
  error: string | null;
  orderId: string | null;
}

type CheckoutAction =
  | { type: 'SET_STEP'; payload: CheckoutState['currentStep'] }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_BILLING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_USE_SAME_ADDRESS'; payload: boolean }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_ORDER_SUMMARY'; payload: OrderSummary }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ORDER_ID'; payload: string }
  | { type: 'RESET_CHECKOUT' };

const initialState: CheckoutState = {
  currentStep: 'shipping',
  shippingAddress: null,
  billingAddress: null,
  useSameAddress: true,
  paymentMethod: null,
  orderSummary: {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  },
  isProcessing: false,
  error: null,
  orderId: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, error: null };

    case 'SET_SHIPPING_ADDRESS':
      return { 
        ...state, 
        shippingAddress: action.payload,
        billingAddress: state.useSameAddress ? action.payload : state.billingAddress 
      };

    case 'SET_BILLING_ADDRESS':
      return { ...state, billingAddress: action.payload };

    case 'SET_USE_SAME_ADDRESS':
      return { 
        ...state, 
        useSameAddress: action.payload,
        billingAddress: action.payload ? state.shippingAddress : state.billingAddress
      };

    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };

    case 'SET_ORDER_SUMMARY':
      return { ...state, orderSummary: action.payload };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_ORDER_ID':
      return { ...state, orderId: action.payload };

    case 'RESET_CHECKOUT':
      return { ...initialState };

    default:
      return state;
  }
}

interface CheckoutContextType {
  state: CheckoutState;
  setStep: (step: CheckoutState['currentStep']) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  setBillingAddress: (address: ShippingAddress) => void;
  setUseSameAddress: (useSame: boolean) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  calculateOrderSummary: (subtotal: number) => void;
  processOrder: () => Promise<void>;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// Mock payment methods for demo
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'credit_card',
    cardNumber: '•••• •••• •••• 1234',
    expiryMonth: '12',
    expiryYear: '2026',
    cvv: '***',
    cardholderName: 'John Doe',
    isDefault: true,
  },
  {
    id: '2',
    type: 'credit_card',
    cardNumber: '•••• •••• •••• 5678',
    expiryMonth: '08',
    expiryYear: '2027',
    cvv: '***',
    cardholderName: 'John Doe',
    isDefault: false,
  },
];

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const setStep = (step: CheckoutState['currentStep']) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const setShippingAddress = (address: ShippingAddress) => {
    dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: address });
  };

  const setBillingAddress = (address: ShippingAddress) => {
    dispatch({ type: 'SET_BILLING_ADDRESS', payload: address });
  };

  const setUseSameAddress = (useSame: boolean) => {
    dispatch({ type: 'SET_USE_SAME_ADDRESS', payload: useSame });
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const calculateOrderSummary = (subtotal: number) => {
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 35 ? 0 : 9.99; // Free shipping over $35
    const discount = 0; // No discount for now
    const total = subtotal + tax + shipping - discount;

    dispatch({
      type: 'SET_ORDER_SUMMARY',
      payload: { subtotal, tax, shipping, discount, total },
    });
  };

  const processOrder = async () => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate processing
      if (!state.shippingAddress || !state.paymentMethod) {
        throw new Error('Missing required checkout information');
      }

      // Generate mock order ID
      const orderId = `TFM${Date.now()}`;
      
      dispatch({ type: 'SET_ORDER_ID', payload: orderId });
      dispatch({ type: 'SET_STEP', payload: 'confirmation' });

      // In a real app, this would clear the cart
      console.log('Order processed successfully:', orderId);

    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Order processing failed' 
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const resetCheckout = () => {
    dispatch({ type: 'RESET_CHECKOUT' });
  };

  const value: CheckoutContextType = {
    state,
    setStep,
    setShippingAddress,
    setBillingAddress,
    setUseSameAddress,
    setPaymentMethod,
    calculateOrderSummary,
    processOrder,
    resetCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}

export type { ShippingAddress, PaymentMethod, OrderSummary };
