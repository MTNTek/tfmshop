'use client'

import React from 'react'
import { useOrder } from '@/contexts/OrderContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Truck, Package, CheckCircle, Clock, X } from 'lucide-react'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-orange-100 text-orange-800 border-orange-200',
  shipped: 'bg-green-100 text-green-800 border-green-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: X,
}

export default function OrderDetailsPage() {
  const { getOrder, updateOrderStatus, cancelOrder, isLoading } = useOrder()
  const { state: authState } = useAuth()
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const order = getOrder(orderId)

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your order details.</p>
            <Link
              href="/login"
              className="w-full bg-[#06303E] text-white py-2 px-4 rounded-md hover:bg-[#06303E]/90 transition-colors inline-block text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              href="/orders"
              className="w-full bg-[#06303E] text-white py-2 px-4 rounded-md hover:bg-[#06303E]/90 transition-colors inline-block text-center"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const handleCancelOrder = async () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(orderId)
    }
  }

  const StatusIcon = statusIcons[order.status]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="inline-flex items-center text-[#06303E] hover:text-[#06303E]/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="mt-2 text-gray-600">Order #{order.orderNumber}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center ${statusColors[order.status]}`}>
                <StatusIcon className="w-4 h-4 mr-2" />
                {statusLabels[order.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.variant && (
                          <p className="text-sm text-gray-600 mt-1">{item.variant}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                        <p className="text-sm text-gray-600">Total: {formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="p-6">
                <div className="text-gray-900">
                  <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p className="mt-1">{order.shippingAddress.address}</p>
                  {order.shippingAddress.apartment && (
                    <p>{order.shippingAddress.apartment}</p>
                  )}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p className="mt-2">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  {order.status !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Confirmed</p>
                        <p className="text-sm text-gray-600">Your order has been confirmed and is being processed</p>
                      </div>
                    </div>
                  )}

                  {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Package className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Processing</p>
                        <p className="text-sm text-gray-600">Your order is being prepared for shipment</p>
                      </div>
                    </div>
                  )}

                  {(order.status === 'shipped' || order.status === 'delivered') && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Truck className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Shipped</p>
                        <p className="text-sm text-gray-600">
                          Your order has been shipped
                          {order.trackingNumber && (
                            <span className="block font-mono text-xs mt-1">
                              Tracking: {order.trackingNumber}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Delivered</p>
                        <p className="text-sm text-gray-600">Your order has been delivered successfully</p>
                      </div>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <X className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Cancelled</p>
                        <p className="text-sm text-gray-600">This order has been cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(order.tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                {order.trackingNumber && (
                  <Link
                    href={`/orders/${order.id}/track`}
                    className="w-full bg-[#06303E] text-white py-2 px-4 rounded-md hover:bg-[#06303E]/90 transition-colors text-center block"
                  >
                    Track Package
                  </Link>
                )}
                
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isLoading}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}

                {order.status === 'delivered' && (
                  <Link
                    href={`/product/${order.items[0]?.id}/review`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                  >
                    Write Review
                  </Link>
                )}

                <Link
                  href="/help"
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-center block"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
              </div>
              <div className="p-6 space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Order Number</span>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Order Date</span>
                  <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div>
                    <span className="text-sm text-gray-600">Estimated Delivery</span>
                    <p className="font-medium text-gray-900">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                </div>
                {order.trackingNumber && (
                  <div>
                    <span className="text-sm text-gray-600">Tracking Number</span>
                    <p className="font-mono text-sm font-medium text-gray-900">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
