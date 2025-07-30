import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login
      Cookies.remove('auth-token')
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// API Types
// API Types - Updated to match backend entities
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: 'customer' | 'admin'
  phone?: string
  isActive: boolean
  isEmailVerified: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice?: number
  sku: string
  barcode?: string
  trackQuantity: boolean
  quantity: number
  lowStockThreshold: number
  allowBackorders: boolean
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  images: string[]
  status: 'draft' | 'active' | 'archived'
  visibility: 'visible' | 'hidden'
  featured: boolean
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  categories: Category[]
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  name: string
  value: string
  sku: string
  price: number
  quantity: number
  image?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  level: number
  sortOrder: number
  isActive: boolean
  metaTitle?: string
  metaDescription?: string
  children?: Category[]
  productCount: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  variantId?: string
  variant?: ProductVariant
  quantity: number
  unitPrice: number
  customizations?: Record<string, any>
  lineTotal: number
  createdAt: string
  updatedAt: string
}

export interface Cart {
  id: string
  sessionId?: string
  userId?: string
  items: CartItem[]
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  itemCount: number
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded'
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  items: OrderItem[]
  shippingAddress?: Address
  billingAddress?: Address
  customerNotes?: string
  adminNotes?: string
  confirmedAt?: string
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  variantId?: string
  variant?: ProductVariant
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Address {
  id: string
  type: 'shipping' | 'billing' | 'both'
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
  label?: string
  formattedAddress: string
}

// Backend response wrapper types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password }),
  
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData),
  
  logout: () => api.post<ApiResponse<{ message: string }>>('/auth/logout'),
  
  me: () => api.get<ApiResponse<User>>('/auth/me'),
  
  refreshToken: () => api.post<ApiResponse<{ token: string }>>('/auth/refresh'),
}

export const productsApi = {
  getAll: (params?: {
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
  }) => api.get<PaginatedResponse<Product>>('/products', { params }),
  
  getById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),
  
  getBySlug: (slug: string) => api.get<ApiResponse<Product>>(`/products/slug/${slug}`),
  
  getFeatured: (limit?: number) => 
    api.get<ApiResponse<Product[]>>('/products/featured', { params: { limit } }),
  
  getRelated: (productId: string, limit?: number) => 
    api.get<ApiResponse<Product[]>>(`/products/${productId}/related`, { params: { limit } }),

  search: (query: string, params?: {
    categories?: string[]
    minPrice?: number
    maxPrice?: number
    limit?: number
  }) => api.get<ApiResponse<{
    products: Product[]
    categories: Category[]
    total: number
  }>>('/search', { params: { q: query, ...params } }),
}

export const categoriesApi = {
  getAll: (params?: {
    parentId?: string
    level?: number
    includeProducts?: boolean
  }) => api.get<ApiResponse<Category[]>>('/categories', { params }),
  
  getById: (id: string) => api.get<ApiResponse<Category>>(`/categories/${id}`),
  
  getBySlug: (slug: string) => api.get<ApiResponse<Category>>(`/categories/slug/${slug}`),

  getTree: () => api.get<ApiResponse<Category[]>>('/categories/tree'),
}

export const cartApi = {
  get: (sessionId?: string) => 
    api.get<ApiResponse<Cart>>('/cart', { params: sessionId ? { sessionId } : undefined }),
  
  addItem: (data: {
    productId: string
    variantId?: string
    quantity: number
    customizations?: Record<string, any>
    sessionId?: string
  }) => api.post<ApiResponse<Cart>>('/cart/add', data),
  
  updateItem: (itemId: string, data: {
    quantity: number
    customizations?: Record<string, any>
  }) => api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, data),
  
  removeItem: (itemId: string) => api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`),
  
  clear: (sessionId?: string) => 
    api.delete<ApiResponse<{ message: string }>>('/cart/clear', { 
      params: sessionId ? { sessionId } : undefined 
    }),

  merge: (sessionId: string) => 
    api.post<ApiResponse<Cart>>('/cart/merge', { sessionId }),
}

export const ordersApi = {
  getAll: (params?: { 
    page?: number 
    limit?: number 
    status?: string 
  }) => api.get<PaginatedResponse<Order>>('/orders', { params }),
  
  getById: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`),
  
  create: (orderData: {
    shippingAddress: Omit<Address, 'id' | 'formattedAddress'>
    billingAddress?: Omit<Address, 'id' | 'formattedAddress'>
    customerNotes?: string
    paymentMethodId?: string
  }) => api.post<ApiResponse<Order>>('/orders', orderData),
  
  updateStatus: (id: string, status: string) => 
    api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status }),

  cancel: (id: string) => 
    api.put<ApiResponse<Order>>(`/orders/${id}/cancel`),

  getByNumber: (orderNumber: string) => 
    api.get<ApiResponse<Order>>(`/orders/number/${orderNumber}`),
}

export const userApi = {
  getProfile: () => api.get<ApiResponse<User>>('/users/profile'),
  
  updateProfile: (userData: Partial<User>) =>
    api.put<ApiResponse<User>>('/users/profile', userData),
  
  changePassword: (data: {
    currentPassword: string
    newPassword: string
  }) => api.put<ApiResponse<{ message: string }>>('/users/change-password', data),
  
  getAddresses: () => api.get<ApiResponse<Address[]>>('/users/addresses'),
  
  addAddress: (address: Omit<Address, 'id' | 'formattedAddress'>) => 
    api.post<ApiResponse<Address>>('/users/addresses', address),
  
  updateAddress: (id: string, address: Omit<Address, 'id' | 'formattedAddress'>) =>
    api.put<ApiResponse<Address>>(`/users/addresses/${id}`, address),
  
  deleteAddress: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/users/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    api.put<ApiResponse<Address>>(`/users/addresses/${id}/default`),
}

// Utility functions
export const useSessionId = () => {
  if (typeof window === 'undefined') return null
  
  let sessionId = localStorage.getItem('cart_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('cart_session_id', sessionId)
  }
  return sessionId
}

export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Error handling utility
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// Response data extractor helper
export const extractApiData = <T>(response: { data: ApiResponse<T> }): T => {
  return response.data.data
}

export const extractPaginatedData = <T>(response: { data: PaginatedResponse<T> }): {
  data: T[]
  pagination: PaginatedResponse<T>['pagination']
} => {
  return {
    data: response.data.data,
    pagination: response.data.pagination
  }
}