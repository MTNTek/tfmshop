'use client'

import React from 'react'
import { useOrder } from '@/contexts/OrderContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Package, Truck, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface TrackingEvent {
  id: string
  timestamp: string
  status: string
  location: string
  description: string
  isCompleted: boolean
}

export default function OrderTrackingPage() {
  const { getOrder } = useOrder()
  const { state: authState } = useAuth()
  const params = useParams()
  const orderId = params.id as string

  const order = getOrder(orderId)

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to track your order.</p>
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

  if (!order.trackingNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tracking Not Available</h2>
            <p className="text-gray-600 mb-6">
              Your order hasn't shipped yet. We'll send you tracking information once your order is on its way.
            </p>
            <Link
              href={`/orders/${orderId}`}
              className="w-full bg-[#06303E] text-white py-2 px-4 rounded-md hover:bg-[#06303E]/90 transition-colors inline-block text-center"
            >
              View Order Details
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Generate mock tracking events based on order status
  const generateTrackingEvents = (): TrackingEvent[] => {
    const events: TrackingEvent[] = [
      {
        id: '1',
        timestamp: order.createdAt,
        status: 'Order Placed',
        location: 'TFM Fulfillment Center',
        description: 'Your order has been received and is being processed.',
        isCompleted: true,
      },
    ]

    if (order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
      events.push({
        id: '2',
        timestamp: new Date(new Date(order.createdAt).getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        status: 'Order Confirmed',
        location: 'TFM Fulfillment Center',
        description: 'Your order has been confirmed and is being prepared for shipment.',
        isCompleted: true,
      })
    }

    if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
      events.push({
        id: '3',
        timestamp: new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1 day later
        status: 'In Preparation',
        location: 'TFM Fulfillment Center',
        description: 'Your items are being picked and packed for shipment.',
        isCompleted: true,
      })
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      events.push({
        id: '4',
        timestamp: new Date(new Date(order.createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString(), // 2 days later
        status: 'Shipped',
        location: 'TFM Fulfillment Center',
        description: `Your package has been shipped with tracking number ${order.trackingNumber}.`,
        isCompleted: true,
      })

      events.push({
        id: '5',
        timestamp: new Date(new Date(order.createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString(), // 3 days later
        status: 'In Transit',
        location: 'Regional Sorting Facility',
        description: 'Your package is on its way to the destination city.',
        isCompleted: true,
      })

      events.push({
        id: '6',
        timestamp: new Date(new Date(order.createdAt).getTime() + 96 * 60 * 60 * 1000).toISOString(), // 4 days later
        status: 'Out for Delivery',
        location: `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
        description: 'Your package is out for delivery and will arrive today.',
        isCompleted: order.status === 'delivered',
      })
    }

    if (order.status === 'delivered') {
      events.push({
        id: '7',
        timestamp: new Date(new Date(order.createdAt).getTime() + 120 * 60 * 60 * 1000).toISOString(), // 5 days later
        status: 'Delivered',
        location: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
        description: 'Your package has been delivered successfully.',
        isCompleted: true,
      })
    }

    return events
  }

  const trackingEvents = generateTrackingEvents()
  const currentEvent = trackingEvents.find(event => !event.isCompleted) || trackingEvents[trackingEvents.length - 1]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (!isCompleted) {
      return <Clock className="w-5 h-5 text-yellow-500" />
    }

    switch (status) {
      case 'Order Placed':
      case 'Order Confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'In Preparation':
        return <Package className="w-5 h-5 text-green-500" />
      case 'Shipped':
      case 'In Transit':
      case 'Out for Delivery':
        return <Truck className="w-5 h-5 text-green-500" />
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/orders/${orderId}`}
            className="inline-flex items-center text-[#06303E] hover:text-[#06303E]/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order Details
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Track Your Package</h1>
                <p className="text-gray-600">Order #{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-mono text-lg font-semibold text-gray-900">{order.trackingNumber}</p>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(currentEvent.status, currentEvent.isCompleted)}
                <div>
                  <p className="font-semibold text-blue-900">{currentEvent.status}</p>
                  <p className="text-sm text-blue-700">{currentEvent.description}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {currentEvent.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tracking History</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {trackingEvents.map((event, index) => (
                    <div key={event.id} className="relative">
                      {index !== trackingEvents.length - 1 && (
                        <div className={`absolute left-2.5 top-10 w-0.5 h-16 ${
                          event.isCompleted ? 'bg-green-200' : 'bg-gray-200'
                        }`} />
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(event.status, event.isCompleted)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${
                              event.isCompleted ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {event.status}
                            </h3>
                            <span className={`text-sm ${
                              event.isCompleted ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${
                            event.isCompleted ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {event.description}
                          </p>
                          <p className={`text-sm mt-1 flex items-center ${
                            event.isCompleted ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Delivery Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Shipping Address</span>
                  <div className="mt-1 text-gray-900">
                    <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  </div>
                </div>
                
                {order.estimatedDelivery && order.status !== 'delivered' && (
                  <div>
                    <span className="text-sm text-gray-600">Estimated Delivery</span>
                    <p className="mt-1 font-medium text-gray-900">
                      {formatDate(order.estimatedDelivery)}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-600">Carrier</span>
                  <p className="mt-1 font-medium text-gray-900">TFM Express Shipping</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  
                  {order.items.length > 2 && (
                    <p className="text-sm text-gray-600">
                      +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Need Help?</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/help"
                  className="w-full bg-[#06303E] text-white py-2 px-4 rounded-md hover:bg-[#06303E]/90 transition-colors text-center block"
                >
                  Contact Support
                </Link>
                
                <Link
                  href={`/orders/${orderId}`}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-center block"
                >
                  View Order Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
