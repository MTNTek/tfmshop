import Image from 'next/image'
import Link from 'next/link'
import { Eye, RotateCcw, MessageSquare, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// Mock order data - in real app this would come from database
const orders = [
  {
    id: 'order-001',
    orderNumber: '123-4567890-1234567',
    orderDate: '2025-07-28',
    total: 1149.00,
    status: 'Delivered',
    deliveryDate: '2025-07-30',
    items: [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        price: 999.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200'
      },
      {
        id: '2',
        name: 'iPhone 15 Pro Case',
        brand: 'Apple',
        price: 49.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200'
      }
    ]
  },
  {
    id: 'order-002',
    orderNumber: '123-7890123-4567890',
    orderDate: '2025-07-25',
    total: 150.00,
    status: 'Shipped',
    estimatedDelivery: '2025-08-01',
    trackingNumber: 'TFM123456789',
    items: [
      {
        id: '3',
        name: 'Nike Air Max 270',
        brand: 'Nike',
        price: 150.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200'
      }
    ]
  },
  {
    id: 'order-003',
    orderNumber: '123-1234567-8901234',
    orderDate: '2025-07-29',
    total: 299.99,
    status: 'Processing',
    items: [
      {
        id: '4',
        name: 'AirPods Pro (2nd generation)',
        brand: 'Apple',
        price: 249.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=200'
      },
      {
        id: '5',
        name: 'Lightning Cable',
        brand: 'Apple',
        price: 29.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200'
      }
    ]
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'text-green-600 bg-green-50'
    case 'Shipped':
      return 'text-blue-600 bg-blue-50'
    case 'Processing':
      return 'text-yellow-600 bg-yellow-50'
    case 'Cancelled':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Delivered':
      return CheckCircle
    case 'Shipped':
      return Truck
    case 'Processing':
      return Package
    case 'Cancelled':
      return Clock
    default:
      return Package
  }
}

export default function OrdersPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-600">Track packages, review past orders, and discover new products</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button className="border-b-2 border-amazon-orange pb-2 text-sm font-medium text-amazon-orange">
              All Orders
            </button>
            <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Open Orders
            </button>
            <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Cancelled Orders
            </button>
            <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Buy Again
            </button>
          </nav>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* Order Header */}
              <div className="border-b border-gray-200 bg-gray-50 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Placed</p>
                    <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-medium">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ship to</p>
                    <p className="font-medium">John Doe</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const StatusIcon = getStatusIcon(order.status);
                        return <StatusIcon className="h-4 w-4 text-current" />;
                      })()}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    {order.status === 'Delivered' && order.deliveryDate && (
                      <span className="text-sm text-gray-600">
                        Delivered on {new Date(order.deliveryDate).toLocaleDateString()}
                      </span>
                    )}
                    {order.status === 'Shipped' && order.estimatedDelivery && (
                      <span className="text-sm text-gray-600">
                        Arriving {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    )}
                    {order.trackingNumber && (
                      <Link href={`/track/${order.trackingNumber}`} className="text-sm text-blue-600 hover:underline">
                        Track package
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {order.status === 'Delivered' && (
                      <>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="mr-1 h-4 w-4" />
                          Return Items
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Leave Review
                        </Button>
                      </>
                    )}
                    <Button variant="amazon" size="sm">
                      Buy Again
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex space-x-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            <Link href={`/product/${item.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-amazon-orange">
                              {item.name}
                            </Link>
                          </h4>
                          <p className="text-sm text-gray-600">{item.brand}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline">Load More Orders</Button>
        </div>

        {/* Help Section */}
        <div className="mt-12 rounded-lg bg-gray-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Need help with an order?</h3>
          <p className="mb-4 text-gray-700">
            Visit our Help Center for assistance with returns, refunds, tracking, and more.
          </p>
          <div className="flex space-x-4">
            <Link href="/help">
              <Button variant="outline">Help Center</Button>
            </Link>
            <Link href="/contact">
              <Button variant="amazon">Contact Customer Service</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Your Orders - TFMshop',
  description: 'View and manage your TFMshop orders, track packages, and reorder items',
}
