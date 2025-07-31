'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  variant?: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  phone: string
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: ShippingAddress
  paymentMethod: string
  createdAt: string
  estimatedDelivery?: string
  trackingNumber?: string
  notes?: string
}

interface OrderContextType {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<Order>
  getOrder: (orderId: string) => Order | undefined
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
  trackOrder: (orderNumber: string) => Order | undefined
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

interface OrderProviderProps {
  children: ReactNode
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('tfm-orders')
    const savedCurrentOrder = localStorage.getItem('tfm-current-order')
    
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders)
        setOrders(parsedOrders)
      } catch (error) {
        console.error('Failed to parse saved orders:', error)
      }
    }
    
    if (savedCurrentOrder) {
      try {
        const parsedCurrentOrder = JSON.parse(savedCurrentOrder)
        setCurrentOrder(parsedCurrentOrder)
      } catch (error) {
        console.error('Failed to parse saved current order:', error)
      }
    }
  }, [])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tfm-orders', JSON.stringify(orders))
  }, [orders])

  // Save current order to localStorage whenever it changes
  useEffect(() => {
    if (currentOrder) {
      localStorage.setItem('tfm-current-order', JSON.stringify(currentOrder))
    } else {
      localStorage.removeItem('tfm-current-order')
    }
  }, [currentOrder])

  const generateOrderId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const generateOrderNumber = (): string => {
    const prefix = 'TFM'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newOrder: Order = {
        ...orderData,
        id: generateOrderId(),
        orderNumber: generateOrderNumber(),
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      }

      setOrders(prevOrders => [newOrder, ...prevOrders])
      setCurrentOrder(newOrder)
      
      return newOrder
    } finally {
      setIsLoading(false)
    }
  }

  const getOrder = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId)
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            const updatedOrder = { ...order, status }
            
            // Add tracking number when shipped
            if (status === 'shipped' && !order.trackingNumber) {
              updatedOrder.trackingNumber = `TFM${Math.random().toString(36).substring(2, 8).toUpperCase()}${Date.now().toString().slice(-4)}`
            }
            
            return updatedOrder
          }
          return order
        })
      )
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (orderId: string): Promise<void> => {
    await updateOrderStatus(orderId, 'cancelled')
  }

  const trackOrder = (orderNumber: string): Order | undefined => {
    return orders.find(order => order.orderNumber === orderNumber)
  }

  return (
    <OrderContext.Provider 
      value={{
        orders,
        currentOrder,
        isLoading,
        createOrder,
        getOrder,
        updateOrderStatus,
        cancelOrder,
        trackOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}