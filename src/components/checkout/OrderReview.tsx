'use client';

import React from 'react';
import { MapPin, CreditCard, Package, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { useOrder } from '@/contexts/OrderContext';

export function OrderReview() {
  const { state, setStep, processOrder } = useCheckout();
  const { state: cartState, clearCart } = useCart();
  const { createOrder, isLoading } = useOrder();

  // Calculate shipping and tax
  const shipping = cartState.subtotal > 35 ? 0 : 9.99;
  const tax = cartState.subtotal * 0.08; // 8% tax
  const finalTotal = cartState.subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!state.shippingAddress || !state.paymentMethod) {
      return;
    }

    try {
      // Create order in the order management system
      const orderData = {
        status: 'pending' as const,
        items: cartState.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: cartState.subtotal,
        shipping,
        tax,
        total: finalTotal,
        shippingAddress: {
          firstName: state.shippingAddress.firstName,
          lastName: state.shippingAddress.lastName,
          address: state.shippingAddress.street,
          apartment: '',
          city: state.shippingAddress.city,
          state: state.shippingAddress.state,
          zipCode: state.shippingAddress.zipCode,
          phone: state.shippingAddress.phone || '',
        },
        paymentMethod: `${getCardType(state.paymentMethod.cardNumber)} ending in ${state.paymentMethod.cardNumber.slice(-4)}`,
        notes: undefined,
      };

      await createOrder(orderData);
      await processOrder();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const getCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Credit Card';
  };

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-tfm-navy rounded-full flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
        </div>

        <div className="space-y-4">
          {cartState.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-tfm-navy rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep('shipping')}
          >
            Edit
          </Button>
        </div>

        {state.shippingAddress && (
          <div className="text-gray-700">
            <p className="font-medium">
              {state.shippingAddress.firstName} {state.shippingAddress.lastName}
            </p>
            <p>{state.shippingAddress.street}</p>
            <p>
              {state.shippingAddress.city}, {state.shippingAddress.state} {state.shippingAddress.zipCode}
            </p>
            <p>{state.shippingAddress.country}</p>
            {state.shippingAddress.phone && (
              <p className="mt-2 text-sm">Phone: {state.shippingAddress.phone}</p>
            )}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-tfm-navy rounded-full flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep('payment')}
          >
            Edit
          </Button>
        </div>

        {state.paymentMethod && (
          <div className="flex items-center space-x-3">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">
                {getCardType(state.paymentMethod.cardNumber)} {state.paymentMethod.cardNumber}
              </p>
              <p className="text-sm text-gray-600">
                Expires {state.paymentMethod.expiryMonth}/{state.paymentMethod.expiryYear}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${cartState.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold text-tfm-navy">
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">Your order is secure</p>
            <p>We use industry-standard encryption to protect your personal and payment information.</p>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep('payment')}
          disabled={state.isProcessing}
        >
          Back to Payment
        </Button>
        <Button
          onClick={handlePlaceOrder}
          disabled={state.isProcessing || isLoading}
          className="px-8 py-3 bg-[#06303E] hover:bg-[#06303E]/90 disabled:opacity-50"
        >
          {(state.isProcessing || isLoading) ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Place Order - ${finalTotal.toFixed(2)}</span>
            </div>
          )}
        </Button>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}
    </div>
  );
}
