import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// Mock cart data - in real app this would come from state management
const cartItems = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    price: 999.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
    inStock: true,
    isPrime: true
  },
  {
    id: '2',
    name: 'Nike Air Max 270',
    brand: 'Nike',
    price: 150.00,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
    inStock: true,
    isPrime: true
  }
]

export default function CartPage() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 0 // Free shipping
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="mt-2 text-gray-600">Start shopping to add items to your cart</p>
          <Link href="/">
            <Button variant="amazon" className="mt-6">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex space-x-4 border-b border-gray-200 pb-6">
                  <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link href={`/product/${item.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-amazon-orange">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">{item.brand}</p>
                        {item.isPrime && (
                          <span className="inline-block mt-1 text-xs text-blue-600 font-bold">prime</span>
                        )}
                        <p className="mt-1 text-sm text-green-600">✓ In Stock</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium">{item.quantity}</span>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <Link href="/">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Estimated tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-amazon-orange">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button variant="cart" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
                
                <Button variant="amazon" size="lg" className="w-full">
                  Buy Now with 1-Click
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600">
                  This order contains a gift
                </p>
                <Link href="#" className="text-xs text-blue-600 hover:underline">
                  Learn more
                </Link>
              </div>
            </div>
            
            {/* Prime Benefits */}
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-600">prime</span>
              </div>
              <p className="mt-2 text-sm text-blue-800">
                FREE One-Day Delivery on eligible items
              </p>
              <p className="text-xs text-blue-700">
                Order within 2 hrs 47 mins
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Shopping Cart - TFMshop',
  description: 'Review and manage items in your shopping cart',
}
