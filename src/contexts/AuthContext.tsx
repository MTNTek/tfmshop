'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPrime?: boolean;
  joinDate: string;
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: { firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo
const mockUsers = [
  {
    id: '1',
    email: 'demo@tfmshop.com',
    password: 'demo123',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    isPrime: true,
    joinDate: '2023-01-15',
    preferences: {
      currency: 'USD',
      language: 'English',
      notifications: true,
    },
  },
  {
    id: '2',
    email: 'jane@tfmshop.com',
    password: 'jane123',
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    isPrime: false,
    joinDate: '2024-03-22',
    preferences: {
      currency: 'USD',
      language: 'English',
      notifications: false,
    },
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('tfmshop-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: userData });
      } catch (error) {
        console.error('Failed to load user from localStorage:', error);
        localStorage.removeItem('tfmshop-user');
      }
    }
  }, []);

  // Save user to localStorage whenever authenticated user changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('tfmshop-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('tfmshop-user');
    }
  }, [state.user]);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      dispatch({ type: 'AUTH_SUCCESS', payload: userWithoutPassword });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: { firstName: string; lastName: string }) => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: `${userData.firstName} ${userData.lastName}`,
        isPrime: false,
        joinDate: new Date().toISOString().split('T')[0],
        preferences: {
          currency: 'USD',
          language: 'English',
          notifications: true,
        },
      };

      // Add to mock users (in real app, this would be API call)
      mockUsers.push({ ...newUser, password } as any);

      dispatch({ type: 'AUTH_SUCCESS', payload: newUser });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error instanceof Error ? error.message : 'Registration failed' 
      });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
