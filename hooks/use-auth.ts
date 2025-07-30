'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { authApi, type User } from '@/lib/api'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(email, password)
          const { user, token } = response.data

          // Store token in cookie
          Cookies.set('auth-token', token, { expires: 7 }) // 7 days

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success('Welcome back!')
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(userData)
          const { user, token } = response.data

          // Store token in cookie
          Cookies.set('auth-token', token, { expires: 7 }) // 7 days

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success('Account created successfully!')
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        // Remove token from cookie
        Cookies.remove('auth-token')

        // Call logout API (fire and forget)
        authApi.logout().catch(() => {
          // Ignore errors on logout
        })

        set({
          user: null,
          isAuthenticated: false,
        })

        toast.success('Logged out successfully')
      },

      checkAuth: async () => {
        const token = Cookies.get('auth-token')
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return
        }

        try {
          const response = await authApi.me()
          set({
            user: response.data,
            isAuthenticated: true,
          })
        } catch (error) {
          // Token is invalid, remove it
          Cookies.remove('auth-token')
          set({
            user: null,
            isAuthenticated: false,
          })
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize auth check on app start
if (typeof window !== 'undefined') {
  useAuth.getState().checkAuth()
}