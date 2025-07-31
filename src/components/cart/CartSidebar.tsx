'use client';

import React from 'react';
import { X, Plus, Minus, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export function CartSidebar() {
  const { state, updateQuantity, removeItem, closeCart } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${state.isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          state.isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transition-transform duration-300 ${
        state.isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-tfm-navy" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <span className="rounded-full bg-tfm-navy px-2 py-1 text-xs text-white">
              {state.itemCount}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Start shopping to add items to your cart</p>
              <Button onClick={closeCart} className="bg-tfm-navy hover:bg-tfm-navy-dark">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex space-x-3">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </h4>
                      
                      {item.isPrime && (
                        <div className="flex items-center mt-1">
                          <Truck className="h-3 w-3 text-blue-600 mr-1" />
                          <span className="text-xs text-blue-600 font-medium">Prime</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          {item.originalPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t bg-gray-50 p-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({state.itemCount} items)</span>
                <span>{formatPrice(state.subtotal)}</span>
              </div>
              
              {state.subtotal < 35 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Shipping</span>
                  <span>$5.99</span>
                </div>
              )}
              
              {state.subtotal >= 35 && (
                <div className="flex items-center text-sm text-green-600">
                  <Truck className="h-4 w-4 mr-1" />
                  <span>FREE shipping on this order</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Estimated tax</span>
                <span>{formatPrice(state.subtotal * 0.08)}</span>
              </div>
              
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(state.total)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link href="/cart" onClick={closeCart}>
                <Button variant="outline" className="w-full">
                  View Cart
                </Button>
              </Link>
              
              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full bg-tfm-navy hover:bg-tfm-navy-dark">
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {state.subtotal < 35 && (
              <p className="text-xs text-gray-600 mt-2 text-center">
                Add {formatPrice(35 - state.subtotal)} more for FREE shipping
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
