// React hooks for TMF Shop API integration
// Provides easy-to-use hooks for frontend components

import { useState, useEffect, useCallback } from 'react'
import { 
  productsApi, 
  categoriesApi, 
  cartApi, 
  ordersApi,
  extractApiData,
  extractPaginatedData,
  useSessionId,
  type Product,
  type Category,
  type Cart,
  type Order,
  type CartItem,
  type ApiResponse,
  type PaginatedResponse
} from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

// Generic hook for API calls with loading and error states
export const useApiCall = <T>(
  apiCall: () => Promise<{ data: ApiResponse<T> }>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      setData(extractApiData(response))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

// Products hooks
export const useProducts = (params?: {
  page?: number
  limit?: number
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  featured?: boolean
  status?: string
  tags?: string[]
}) => {
  const [data, setData] = useState<{
    products: Product[]
    pagination: PaginatedResponse<Product>['pagination']
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productsApi.getAll(params)
      setData(extractPaginatedData(response))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params), toast])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { data, loading, error, refetch: fetchProducts }
}

export const useProduct = (id: string) => {
  return useApiCall(() => productsApi.getById(id), [id])
}

export const useProductBySlug = (slug: string) => {
  return useApiCall(() => productsApi.getBySlug(slug), [slug])
}

export const useFeaturedProducts = (limit?: number) => {
  return useApiCall(() => productsApi.getFeatured(limit), [limit])
}

export const useRelatedProducts = (productId: string, limit?: number) => {
  return useApiCall(() => productsApi.getRelated(productId, limit), [productId, limit])
}

// Categories hooks
export const useCategories = (params?: {
  parentId?: string
  level?: number
  includeProducts?: boolean
}) => {
  return useApiCall(() => categoriesApi.getAll(params), [JSON.stringify(params)])
}

export const useCategory = (id: string) => {
  return useApiCall(() => categoriesApi.getById(id), [id])
}

export const useCategoryBySlug = (slug: string) => {
  return useApiCall(() => categoriesApi.getBySlug(slug), [slug])
}

export const useCategoryTree = () => {
  return useApiCall(() => categoriesApi.getTree(), [])
}

// Cart hooks
export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const sessionId = useSessionId()

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartApi.get(sessionId)
      setCart(extractApiData(response))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch cart'
      setError(errorMessage)
      console.error('Cart fetch error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const addToCart = useCallback(async (data: {
    productId: string
    variantId?: string
    quantity: number
    customizations?: Record<string, any>
  }) => {
    try {
      const response = await cartApi.addItem({
        ...data,
        sessionId: sessionId || undefined
      })
      const updatedCart = extractApiData(response)
      setCart(updatedCart)
      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart',
      })
      return updatedCart
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add item to cart'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }, [sessionId, toast])

  const updateCartItem = useCallback(async (itemId: string, data: {
    quantity: number
    customizations?: Record<string, any>
  }) => {
    try {
      const response = await cartApi.updateItem(itemId, data)
      const updatedCart = extractApiData(response)
      setCart(updatedCart)
      toast({
        title: 'Cart updated',
        description: 'Item quantity has been updated',
      })
      return updatedCart
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update cart item'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }, [toast])

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const response = await cartApi.removeItem(itemId)
      const updatedCart = extractApiData(response)
      setCart(updatedCart)
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart',
      })
      return updatedCart
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove item from cart'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }, [toast])

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear(sessionId || undefined)
      setCart(null)
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to clear cart'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }, [sessionId, toast])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetch: fetchCart,
    itemCount: cart?.itemCount || 0,
    totalAmount: cart?.totalAmount || 0
  }
}

// Orders hooks
export const useOrders = (params?: { 
  page?: number 
  limit?: number 
  status?: string 
}) => {
  const [data, setData] = useState<{
    orders: Order[]
    pagination: PaginatedResponse<Order>['pagination']
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ordersApi.getAll(params)
      setData(extractPaginatedData(response))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch orders'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params), toast])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return { data, loading, error, refetch: fetchOrders }
}

export const useOrder = (id: string) => {
  return useApiCall(() => ordersApi.getById(id), [id])
}

export const useOrderByNumber = (orderNumber: string) => {
  return useApiCall(() => ordersApi.getByNumber(orderNumber), [orderNumber])
}

export const useCreateOrder = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const createOrder = useCallback(async (orderData: {
    shippingAddress: any
    billingAddress?: any
    customerNotes?: string
    paymentMethodId?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await ordersApi.create(orderData)
      const order = extractApiData(response)
      toast({
        title: 'Order created',
        description: `Order ${order.orderNumber} has been created successfully`,
      })
      return order
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  return { createOrder, loading, error }
}

// Search hook
export const useSearch = () => {
  const [results, setResults] = useState<{
    products: Product[]
    categories: Category[]
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, params?: {
    categories?: string[]
    minPrice?: number
    maxPrice?: number
    limit?: number
  }) => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await productsApi.search(query, params)
      setResults(extractApiData(response))
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Search failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults(null)
    setError(null)
  }, [])

  return { results, loading, error, search, clearResults }
}

// Utility hook for handling async operations with toast notifications
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ) => {
    try {
      setLoading(true)
      const result = await operation()
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        })
      }
      return result
    } catch (err: any) {
      const message = errorMessage || err.response?.data?.message || err.message || 'Operation failed'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  return { execute, loading }
}
