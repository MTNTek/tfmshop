'use client'

import React, { useState } from 'react'
import { useOrder } from '@/contexts/OrderContext'
import { useRouter } from 'next/navigation'
import { Search, Package, AlertCircle } from 'lucide-react'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { trackOrder } = useOrder()
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSearching(true)

    if (!orderNumber.trim()) {
      setError('Please enter an order number')
      setIsSearching(false)
      return
    }

    try {
      const order = trackOrder(orderNumber.trim())
      
      if (order) {
        router.push(`/orders/${order.id}/track`)
      } else {
        setError('Order not found. Please check your order number and try again.')
      }
    } catch (err) {
      setError('An error occurred while searching for your order. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#06303E] rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-lg text-gray-600">
            Enter your order number to see the latest shipping information
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., TFM123456ABC)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06303E] focus:border-transparent text-lg"
                  disabled={isSearching}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                You can find your order number in your order confirmation email or account order history.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-[#06303E] text-white py-3 px-6 rounded-lg hover:bg-[#06303E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSearching ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                'Track Order'
              )}
            </button>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help Finding Your Order?</h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                <strong>Order Confirmation Email:</strong> Check your email for an order confirmation that contains your order number.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                <strong>Account Order History:</strong> Sign in to your account and visit the orders page to see all your order numbers.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">
                <strong>Guest Orders:</strong> If you placed an order without an account, use the order number from your confirmation email.
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              Still can't find your order?{' '}
              <a href="/help" className="underline font-medium hover:text-blue-800">
                Contact our support team
              </a>{' '}
              and we'll be happy to help you track your package.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/orders"
            className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900 mb-1">View All Orders</h3>
            <p className="text-sm text-gray-600">Access your complete order history</p>
          </a>
          
          <a
            href="/help"
            className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900 mb-1">Get Help</h3>
            <p className="text-sm text-gray-600">Contact our customer support team</p>
          </a>
        </div>
      </div>
    </div>
  )
}
