import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

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
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'admin'
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  title: string
  description: string
  slug: string
  price: number
  originalPrice?: number
  currency: string
  stockQuantity: number
  sku: string
  rating: number
  reviewCount: number
  badge?: string
  brand?: string
  weight?: number
  weightUnit?: string
  images: string[]
  specifications?: Record<string, any>
  tags: string[]
  category: Category
  isActive: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  slug: string
  imageUrl?: string
  sortOrder: number
  parent?: Category
  children?: Category[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
}

export interface Cart {
  id: string
  items: CartItem[]
  totalItems: number
  totalPrice: number
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: Address
  billingAddress: Address
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
  productTitle: string
}

export interface Address {
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
}

// API Functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => api.post<{ user: User; token: string }>('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get<User>('/auth/me'),
  
  refreshToken: () => api.post<{ token: string }>('/auth/refresh'),
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
  }) => api.get<{
    products: Product[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }>('/products', { params }),
  
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  
  getBySlug: (slug: string) => api.get<Product>(`/products/slug/${slug}`),
  
  getFeatured: () => api.get<Product[]>('/products/featured'),
  
  getRelated: (productId: string) => api.get<Product[]>(`/products/${productId}/related`),
}

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  
  getBySlug: (slug: string) => api.get<Category>(`/categories/slug/${slug}`),
}

export const cartApi = {
  get: () => api.get<Cart>('/cart'),
  
  addItem: (productId: string, quantity: number) =>
    api.post<CartItem>('/cart/items', { productId, quantity }),
  
  updateItem: (itemId: string, quantity: number) =>
    api.put<CartItem>(`/cart/items/${itemId}`, { quantity }),
  
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  
  clear: () => api.delete('/cart'),
}

export const ordersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{
      orders: Order[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>('/orders', { params }),
  
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  
  create: (orderData: {
    shippingAddress: Address
    billingAddress: Address
    paymentMethod: string
  }) => api.post<Order>('/orders', orderData),
  
  cancel: (id: string) => api.put<Order>(`/orders/${id}/cancel`),
}

export const userApi = {
  getProfile: () => api.get<User>('/users/profile'),
  
  updateProfile: (userData: Partial<User>) =>
    api.put<User>('/users/profile', userData),
  
  changePassword: (data: {
    currentPassword: string
    newPassword: string
  }) => api.put('/users/change-password', data),
  
  getAddresses: () => api.get<Address[]>('/users/addresses'),
  
  addAddress: (address: Address) => api.post<Address>('/users/addresses', address),
  
  updateAddress: (id: string, address: Address) =>
    api.put<Address>(`/users/addresses/${id}`, address),
  
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
}