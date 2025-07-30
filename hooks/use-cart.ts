'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartApi, type Cart, type CartItem, type Product } from '@/lib/api'
import { toast } from 'sonner'

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  addItem: (product: Product, quantity?: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  fetchCart: () => Promise<void>
  getItemQuantity: (productId: string) => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,

      addItem: async (product: Product, quantity = 1) => {
        set({ isLoading: true })
        try {
          // Check if item already exists in cart
          const existingItem = get().items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            // Update existing item
            await get().updateItem(existingItem.id, existingItem.quantity + quantity)
          } else {
            // Add new item
            const response = await cartApi.addItem(product.id, quantity)
            const newItem = response.data

            set(state => {
              const newItems = [...state.items, newItem]
              return {
                items: newItems,
                totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
                totalPrice: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                isLoading: false,
              }
            })

            toast.success(`${product.title} added to cart`)
          }
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Failed to add item to cart'
          toast.error(message)
          throw error
        }
      },

      updateItem: async (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(itemId)
          return
        }

        set({ isLoading: true })
        try {
          const response = await cartApi.updateItem(itemId, quantity)
          const updatedItem = response.data

          set(state => {
            const newItems = state.items.map(item =>
              item.id === itemId ? updatedItem : item
            )
            return {
              items: newItems,
              totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
              totalPrice: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              isLoading: false,
            }
          })

          toast.success('Cart updated')
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Failed to update cart'
          toast.error(message)
          throw error
        }
      },

      removeItem: async (itemId: string) => {
        set({ isLoading: true })
        try {
          await cartApi.removeItem(itemId)

          set(state => {
            const newItems = state.items.filter(item => item.id !== itemId)
            return {
              items: newItems,
              totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
              totalPrice: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              isLoading: false,
            }
          })

          toast.success('Item removed from cart')
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Failed to remove item'
          toast.error(message)
          throw error
        }
      },

      clearCart: async () => {
        set({ isLoading: true })
        try {
          await cartApi.clear()

          set({
            items: [],
            totalItems: 0,
            totalPrice: 0,
            isLoading: false,
          })

          toast.success('Cart cleared')
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Failed to clear cart'
          toast.error(message)
          throw error
        }
      },

      fetchCart: async () => {
        set({ isLoading: true })
        try {
          const response = await cartApi.get()
          const cart = response.data

          set({
            items: cart.items,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            isLoading: false,
          })
        } catch (error: any) {
          set({ isLoading: false })
          // Don't show error toast for cart fetch failures
          console.error('Failed to fetch cart:', error)
        }
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find(item => item.product.id === productId)
        return item?.quantity || 0
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
)