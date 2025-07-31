'use client'

import React, { useState } from 'react'
import { useOrder } from '@/contexts/OrderContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Order } from '@/contexts/OrderContext'

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

export default function OrdersPage() {
  const { orders, isLoading } = useOrder()
  const { user } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your order history.</p>
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

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your TFM orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'processing', label: 'Processing' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedStatus === tab.key
                      ? 'border-[#06303E] text-[#06303E]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.key !== 'all' && (
                    <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                      {orders.filter(order => order.status === tab.key).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06303E] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {selectedStatus === 'all' ? 'No orders yet' : `No ${selectedStatus} orders`}
            </h3>
            <p className="mt-2 text-gray-600">
              {selectedStatus === 'all' 
                ? "When you place your first order, it will appear here."
                : `You don't have any ${selectedStatus} orders.`
              }
            </p>
            {selectedStatus === 'all' && (
              <div className="mt-6">
                <Link
                  href="/"
                  className="bg-[#06303E] text-white px-6 py-3 rounded-md hover:bg-[#06303E]/90 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Order Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-semibold text-gray-900">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date Placed</p>
              <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
            <Link
              href={`/orders/${order.id}`}
              className="text-[#06303E] hover:text-[#06303E]/80 font-medium text-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                {item.variant && (
                  <p className="text-sm text-gray-600">{item.variant}</p>
                )}
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          
          {order.items.length > 3 && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-600">
                +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {order.trackingNumber && (
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-mono text-sm font-medium text-gray-900">{order.trackingNumber}</p>
              </div>
            )}
            {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div>
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-medium text-gray-900">{formatDate(order.estimatedDelivery)}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {order.trackingNumber && (
              <Link
                href={`/orders/${order.id}/track`}
                className="text-[#06303E] hover:text-[#06303E]/80 font-medium text-sm"
              >
                Track Package
              </Link>
            )}
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                Cancel Order
              </button>
            )}
            <Link
              href={`/orders/${order.id}`}
              className="bg-[#06303E] text-white px-4 py-2 rounded-md hover:bg-[#06303E]/90 transition-colors text-sm"
            >
              View Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
