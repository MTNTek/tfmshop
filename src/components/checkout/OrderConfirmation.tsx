'use client';

import React from 'react';
import { CheckCircle, Package, Mail, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import Link from 'next/link';

export function OrderConfirmation() {
  const { state, resetCheckout } = useCheckout();
  const { clearCart } = useCart();
  const { currentOrder, orders } = useOrder();

  // Get the most recent order if currentOrder is not set
  const displayOrder = currentOrder || (orders.length > 0 ? orders[0] : null);

  React.useEffect(() => {
    // Clear cart after successful order
    if (displayOrder) {
      clearCart();
    }
  }, [displayOrder, clearCart]);

  if (!displayOrder && state.orderId) {
    // If we have an orderId from checkout but no order, show a simple confirmation
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've received your payment and will begin processing your order shortly.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Order Number
              </h3>
              <p className="text-xl font-semibold text-gray-900">{state.orderId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Order Date
              </h3>
              <p className="text-xl font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/orders">
            <Button variant="outline" className="w-full sm:w-auto">
              <Package className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
          </Link>
          
          <Link href="/">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={resetCheckout}
            >
              <Home className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!displayOrder) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06303E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-600">
          Thank you for your order. We've received your payment and will begin processing your order shortly.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Order Number
            </h3>
            <p className="text-xl font-semibold text-gray-900">{displayOrder.orderNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Order Date
            </h3>
            <p className="text-xl font-semibold text-gray-900">
              {formatDate(displayOrder.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Order Total
          </h3>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(displayOrder.total)}</p>
        </div>

        {displayOrder.estimatedDelivery && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Estimated Delivery
            </h3>
            <p className="text-lg font-medium text-green-600">
              {formatDate(displayOrder.estimatedDelivery)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              We'll send you tracking information once your order ships.
            </p>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
        <div className="space-y-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Order confirmation email</p>
              <p className="text-sm text-gray-600">
                We've sent a confirmation email to {displayOrder.shippingAddress.firstName} with your order details.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Order processing</p>
              <p className="text-sm text-gray-600">
                Your order will be processed and packed within 1-2 business days.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Shipping notification</p>
              <p className="text-sm text-gray-600">
                Once shipped, you'll receive tracking information via email and SMS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/orders">
          <Button variant="outline" className="w-full sm:w-auto">
            <Package className="h-4 w-4 mr-2" />
            View All Orders
          </Button>
        </Link>
        
        <Link href={`/orders/${displayOrder.id}`}>
          <Button className="w-full sm:w-auto bg-[#06303E] hover:bg-[#06303E]/90">
            <Download className="h-4 w-4 mr-2" />
            View Order Details
          </Button>
        </Link>
        
        <Link href="/">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={resetCheckout}
          >
            <Home className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Customer Support */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Need help?</strong> Our customer support team is available 24/7.{' '}
          <Link href="/help" className="underline font-medium">
            Contact Support
          </Link>{' '}
          or call us at (555) 123-4567.
        </p>
      </div>
    </div>
  );
}
