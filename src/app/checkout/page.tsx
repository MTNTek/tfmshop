'use client';

import React from 'react';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { CheckoutProvider, useCheckout } from '@/contexts/CheckoutContext';
import { ShippingAddressForm } from '@/components/checkout/ShippingAddressForm';
import { PaymentMethodForm } from '@/components/checkout/PaymentMethodForm';
import { OrderReview } from '@/components/checkout/OrderReview';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CheckoutSteps() {
  const { state } = useCheckout();

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: Circle },
    { id: 'payment', label: 'Payment', icon: Circle },
    { id: 'review', label: 'Review', icon: Circle },
    { id: 'confirmation', label: 'Confirmation', icon: CheckCircle },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => {
          const isActive = state.currentStep === step.id;
          const isCompleted = steps.findIndex(s => s.id === state.currentStep) > index;
          const IconComponent = isCompleted ? CheckCircle : Circle;

          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-2 ${isActive ? 'text-tfm-navy' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                <IconComponent className="h-5 w-5" />
                <span className="font-medium">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckoutContent() {
  const { state } = useCheckout();
  const { state: cartState } = useCart();
  const { state: authState } = useAuth();

  // Redirect if cart is empty
  if (cartState.items.length === 0 && state.currentStep !== 'confirmation') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to your cart before proceeding to checkout.</p>
        <Link href="/">
          <Button className="bg-tfm-navy hover:bg-tfm-navy-dark">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // Require authentication
  if (!authState.user && state.currentStep !== 'confirmation') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
        <p className="text-gray-600 mb-8">You need to be signed in to complete your purchase.</p>
        <div className="space-x-4">
          <Link href="/login">
            <Button className="bg-tfm-navy hover:bg-tfm-navy-dark">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'shipping':
        return <ShippingAddressForm />;
      case 'payment':
        return <PaymentMethodForm />;
      case 'review':
        return <OrderReview />;
      case 'confirmation':
        return <OrderConfirmation />;
      default:
        return <ShippingAddressForm />;
    }
  };

  return (
    <>
      {state.currentStep !== 'confirmation' && <CheckoutSteps />}
      {renderStepContent()}
    </>
  );
}

function CheckoutSidebar() {
  const { state: cartState } = useCart();
  const { state } = useCheckout();

  if (state.currentStep === 'confirmation') {
    return null;
  }

  // Calculate shipping and tax
  const shipping = cartState.subtotal > 35 ? 0 : 9.99;
  const tax = cartState.subtotal * 0.08; // 8% tax
  const finalTotal = cartState.subtotal + shipping + tax;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        {/* Cart Items */}
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
          {cartState.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${cartState.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-base font-semibold">Total</span>
              <span className="text-base font-semibold text-tfm-navy">
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Secure Checkout</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your order securely and safely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CheckoutContent />
            </div>
            <CheckoutSidebar />
          </div>
        </div>
      </div>
    </CheckoutProvider>
  );
}
