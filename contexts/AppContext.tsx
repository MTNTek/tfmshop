// Global state management for TMF Shop
// Provides cart and authentication state across the application

'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Cart, User, Product } from '@/lib/api'
import { useCart as useCartApi } from '@/hooks/use-api'

// Types
interface AppState {
  // Authentication
  user: User | null
  isAuthenticated: boolean
  authLoading: boolean
  
  // Cart
  cart: Cart | null
  cartLoading: boolean
  cartItemCount: number
  cartTotal: number
  
  // UI
  sidebarOpen: boolean
  searchOpen: boolean
  
  // Recently viewed products
  recentlyViewed: Product[]
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_CART_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'SET_SEARCH'; payload: boolean }
  | { type: 'ADD_RECENTLY_VIEWED'; payload: Product }
  | { type: 'CLEAR_RECENTLY_VIEWED' }

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  authLoading: true,
  cart: null,
  cartLoading: true,
  cartItemCount: 0,
  cartTotal: 0,
  sidebarOpen: false,
  searchOpen: false,
  recentlyViewed: []
}

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        authLoading: false
      }
    
    case 'SET_AUTH_LOADING':
      return {
        ...state,
        authLoading: action.payload
      }
    
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        cartItemCount: action.payload?.itemCount || 0,
        cartTotal: action.payload?.totalAmount || 0,
        cartLoading: false
      }
    
    case 'SET_CART_LOADING':
      return {
        ...state,
        cartLoading: action.payload
      }
    
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      }
    
    case 'SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.payload
      }
    
    case 'TOGGLE_SEARCH':
      return {
        ...state,
        searchOpen: !state.searchOpen
      }
    
    case 'SET_SEARCH':
      return {
        ...state,
        searchOpen: action.payload
      }
    
    case 'ADD_RECENTLY_VIEWED':
      const existingIndex = state.recentlyViewed.findIndex(p => p.id === action.payload.id)
      let newRecentlyViewed = [...state.recentlyViewed]
      
      if (existingIndex >= 0) {
        // Remove existing and add to front
        newRecentlyViewed.splice(existingIndex, 1)
      }
      
      newRecentlyViewed.unshift(action.payload)
      
      // Keep only last 10 items
      if (newRecentlyViewed.length > 10) {
        newRecentlyViewed = newRecentlyViewed.slice(0, 10)
      }
      
      return {
        ...state,
        recentlyViewed: newRecentlyViewed
      }
    
    case 'CLEAR_RECENTLY_VIEWED':
      return {
        ...state,
        recentlyViewed: []
      }
    
    default:
      return state
  }
}

// Context
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  
  // Authentication actions
  login: (user: User) => void
  logout: () => void
  
  // Cart actions
  updateCart: (cart: Cart | null) => void
  
  // UI actions
  toggleSidebar: () => void
  setSidebar: (open: boolean) => void
  toggleSearch: () => void
  setSearch: (open: boolean) => void
  
  // Recently viewed actions
  addToRecentlyViewed: (product: Product) => void
  clearRecentlyViewed: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  // Initialize cart from API
  const { cart, loading: cartApiLoading } = useCartApi()
  
  // Update cart state when API cart changes
  useEffect(() => {
    dispatch({ type: 'SET_CART_LOADING', payload: cartApiLoading })
    if (cart) {
      dispatch({ type: 'SET_CART', payload: cart })
    }
  }, [cart, cartApiLoading])
  
  // Load recently viewed from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('recently_viewed')
        if (stored) {
          const products: Product[] = JSON.parse(stored)
          products.forEach(product => {
            dispatch({ type: 'ADD_RECENTLY_VIEWED', payload: product })
          })
        }
      } catch (error) {
        console.error('Failed to load recently viewed products:', error)
      }
    }
  }, [])
  
  // Save recently viewed to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recently_viewed', JSON.stringify(state.recentlyViewed))
    }
  }, [state.recentlyViewed])
  
  // Actions
  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user })
  }
  
  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null })
    // Clear cart on logout if needed
    // dispatch({ type: 'SET_CART', payload: null })
  }
  
  const updateCart = (cart: Cart | null) => {
    dispatch({ type: 'SET_CART', payload: cart })
  }
  
  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }
  
  const setSidebar = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR', payload: open })
  }
  
  const toggleSearch = () => {
    dispatch({ type: 'TOGGLE_SEARCH' })
  }
  
  const setSearch = (open: boolean) => {
    dispatch({ type: 'SET_SEARCH', payload: open })
  }
  
  const addToRecentlyViewed = (product: Product) => {
    dispatch({ type: 'ADD_RECENTLY_VIEWED', payload: product })
  }
  
  const clearRecentlyViewed = () => {
    dispatch({ type: 'CLEAR_RECENTLY_VIEWED' })
  }
  
  const contextValue: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    updateCart,
    toggleSidebar,
    setSidebar,
    toggleSearch,
    setSearch,
    addToRecentlyViewed,
    clearRecentlyViewed
  }
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Convenience hooks for specific parts of state
export const useAuth = () => {
  const { state, login, logout } = useApp()
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    authLoading: state.authLoading,
    login,
    logout
  }
}

export const useCartState = () => {
  const { state, updateCart } = useApp()
  return {
    cart: state.cart,
    cartLoading: state.cartLoading,
    cartItemCount: state.cartItemCount,
    cartTotal: state.cartTotal,
    updateCart
  }
}

export const useUI = () => {
  const { 
    state, 
    toggleSidebar, 
    setSidebar, 
    toggleSearch, 
    setSearch 
  } = useApp()
  
  return {
    sidebarOpen: state.sidebarOpen,
    searchOpen: state.searchOpen,
    toggleSidebar,
    setSidebar,
    toggleSearch,
    setSearch
  }
}

export const useRecentlyViewed = () => {
  const { state, addToRecentlyViewed, clearRecentlyViewed } = useApp()
  return {
    recentlyViewed: state.recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  }
}
