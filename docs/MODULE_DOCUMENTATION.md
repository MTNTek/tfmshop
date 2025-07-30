# TFMshop Module Documentation

## 🏗 System Architecture Overview

TFMshop is built as a modern single-page application (SPA) using React 18 with TypeScript, designed with modular architecture principles for scalability and maintainability.

## 📦 Module Structure

```
TFMshop/
├── src/
│   ├── components/          # UI Components
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Utility Libraries
│   ├── types/              # TypeScript Type Definitions
│   ├── contexts/           # React Context Providers
│   ├── services/           # API and External Services
│   ├── utils/              # Helper Functions
│   ├── constants/          # Application Constants
│   └── assets/             # Static Assets
├── public/                 # Public Assets
├── docs/                   # Documentation
└── tests/                  # Test Files
```

---

## 🧩 Core Modules

### 1. Component Module (`src/components/`)

The component module contains all React components organized by functionality and complexity.

#### 1.1 UI Components (`src/components/ui/`)
**Purpose**: Reusable, low-level UI components from shadcn/ui
**Dependencies**: Radix UI, Tailwind CSS

```typescript
// Example structure
ui/
├── button.tsx             # Button variants and states
├── input.tsx              # Form input components
├── card.tsx               # Card layout component
├── dialog.tsx             # Modal and popup dialogs
├── dropdown-menu.tsx      # Dropdown menus
├── badge.tsx              # Status and label badges
├── avatar.tsx             # User avatar component
└── toast.tsx              # Notification toasts
```

**Key Features**:
- Fully accessible components
- Consistent design system
- TypeScript interfaces
- Customizable variants

#### 1.2 Layout Components (`src/components/layout/`)
**Purpose**: Page structure and navigation components

```typescript
layout/
├── Header.tsx             # Main navigation header
├── Footer.tsx             # Site footer
├── Sidebar.tsx            # Sidebar navigation
├── CategoryNav.tsx        # Category navigation bar
├── Layout.tsx             # Main layout wrapper
└── MobileMenu.tsx         # Mobile navigation menu
```

**Header Component Interface**:
```typescript
interface HeaderProps {
  isLoggedIn: boolean;
  cartItemCount: number;
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
}
```

#### 1.3 Product Components (`src/components/product/`)
**Purpose**: Product-related display and interaction components

```typescript
product/
├── ProductCard.tsx        # Individual product display
├── ProductGrid.tsx        # Product listing grid
├── ProductDetail.tsx      # Detailed product view
├── ProductImage.tsx       # Product image gallery
├── ProductRating.tsx      # Star rating display
├── ProductPrice.tsx       # Price formatting
├── ProductBadge.tsx       # Product status badges
└── ProductSearch.tsx      # Search functionality
```

**ProductCard Interface**:
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: 'featured' | 'sale' | 'new';
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onQuickView: (productId: string) => void;
}
```

#### 1.4 Cart Components (`src/components/cart/`)
**Purpose**: Shopping cart functionality

```typescript
cart/
├── CartButton.tsx         # Cart trigger button
├── CartSidebar.tsx        # Cart slide-out panel
├── CartItem.tsx           # Individual cart item
├── CartSummary.tsx        # Cart totals and summary
└── CartCheckout.tsx       # Checkout initiation
```

---

### 2. Hooks Module (`src/hooks/`)

Custom React hooks for shared stateful logic and side effects.

```typescript
hooks/
├── useCart.ts             # Shopping cart state management
├── useAuth.ts             # Authentication state
├── useLocalStorage.ts     # Local storage persistence
├── useDebounce.ts         # Input debouncing
├── useToast.ts            # Toast notifications
├── useProducts.ts         # Product data fetching
└── useSearch.ts           # Search functionality
```

#### useCart Hook Example:
```typescript
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface UseCartReturn {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = (): UseCartReturn => {
  // Implementation
};
```

---

### 3. Context Module (`src/contexts/`)

React Context providers for global state management.

```typescript
contexts/
├── AuthContext.tsx        # User authentication state
├── CartContext.tsx        # Shopping cart state
├── ThemeContext.tsx       # Theme and styling
├── SearchContext.tsx      # Search state and history
└── NotificationContext.tsx # Global notifications
```

#### AuthContext Interface:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
```

---

### 4. Services Module (`src/services/`)

API integration and external service communication.

```typescript
services/
├── api/
│   ├── auth.ts            # Authentication API calls
│   ├── products.ts        # Product data API
│   ├── cart.ts            # Cart operations API
│   ├── orders.ts          # Order management API
│   └── users.ts           # User profile API
├── storage/
│   ├── localStorage.ts    # Browser storage utilities
│   └── sessionStorage.ts  # Session storage utilities
└── external/
    ├── analytics.ts       # Analytics integration
    ├── payment.ts         # Payment processing
    └── email.ts           # Email service integration
```

#### API Service Example:
```typescript
// products.ts
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
}

export const productService = {
  getProducts: (filters?: ProductFilters): Promise<Product[]> => {
    // API implementation
  },
  getProduct: (id: string): Promise<Product> => {
    // API implementation
  },
  searchProducts: (query: string): Promise<Product[]> => {
    // API implementation
  }
};
```

---

### 5. Types Module (`src/types/`)

TypeScript type definitions and interfaces.

```typescript
types/
├── api.ts                 # API response types
├── auth.ts                # Authentication types
├── cart.ts                # Shopping cart types
├── product.ts             # Product data types
├── user.ts                # User profile types
└── common.ts              # Common utility types
```

#### Core Type Definitions:
```typescript
// product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  category: string;
  subcategory?: string;
  brand: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// cart.ts
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  updatedAt: Date;
}
```

---

### 6. Utils Module (`src/utils/`)

Helper functions and utility libraries.

```typescript
utils/
├── formatting.ts          # Data formatting utilities
├── validation.ts          # Input validation functions
├── calculations.ts        # Price and math calculations
├── date.ts                # Date manipulation utilities
├── url.ts                 # URL parsing and building
└── constants.ts           # Application constants
```

#### Utility Examples:
```typescript
// formatting.ts
export const formatPrice = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price);
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

// validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  // Password validation logic
};
```

---

## 🔄 Data Flow Architecture

### State Management Strategy

1. **Local Component State**: For UI-specific state (forms, toggles)
2. **Custom Hooks**: For shared stateful logic
3. **Context API**: For global application state
4. **Local Storage**: For persistence across sessions

### Data Flow Diagram

```
User Action → Component → Hook → Context → Service → API
     ↑                                              ↓
     └── UI Update ← State Update ← Response ← ──────┘
```

---

## 🎨 Styling Architecture

### Design System Implementation

```typescript
// Tailwind configuration extends
theme: {
  extend: {
    colors: {
      tfm: {
        primary: '#000f0a',
        secondary: '#001f14',
        accent: '#ff9500',
        teal: '#20B2AA'
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif']
    },
    maxWidth: {
      'container': '1440px'
    }
  }
}
```

### Component Styling Strategy

1. **Utility-First**: Tailwind CSS classes for rapid development
2. **Component Variants**: shadcn/ui variant system
3. **Custom Properties**: CSS variables for dynamic theming
4. **Responsive Design**: Mobile-first breakpoint system

---

## 🧪 Testing Architecture

### Testing Module Structure

```typescript
tests/
├── __mocks__/             # Mock data and functions
├── components/            # Component unit tests
├── hooks/                 # Custom hook tests
├── services/              # Service integration tests
├── utils/                 # Utility function tests
├── e2e/                   # End-to-end tests
└── setup.ts               # Test configuration
```

### Testing Strategy

1. **Unit Tests**: Individual component and function testing
2. **Integration Tests**: Component interaction testing
3. **E2E Tests**: Complete user workflow testing
4. **Visual Tests**: UI consistency and regression testing

---

## 🚀 Performance Optimization

### Code Splitting Strategy

```typescript
// Lazy loading for route components
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const Cart = lazy(() => import('./components/Cart'));
const Checkout = lazy(() => import('./components/Checkout'));

// Bundle optimization
const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  </Suspense>
);
```

### Image Optimization

```typescript
// Image loading strategy
interface ImageProps {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

const OptimizedImage: React.FC<ImageProps> = ({
  src,
  alt,
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, 50vw'
}) => {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      sizes={sizes}
      className="w-full h-auto"
    />
  );
};
```

---

## 🔐 Security Implementation

### Input Sanitization

```typescript
// XSS prevention utilities
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

export const validateAndSanitize = (data: Record<string, any>) => {
  const sanitized: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};
```

### Authentication Security

```typescript
// Secure token handling
export const authService = {
  storeToken: (token: string) => {
    // Use secure, httpOnly cookies in production
    sessionStorage.setItem('authToken', token);
  },
  
  getToken: (): string | null => {
    return sessionStorage.getItem('authToken');
  },
  
  clearToken: () => {
    sessionStorage.removeItem('authToken');
  }
};
```

---

## 📦 Build and Deployment

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'lodash']
        }
      }
    },
    target: 'es2020',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
```

### Environment Configuration

```typescript
// Environment variables
interface EnvConfig {
  API_BASE_URL: string;
  PAYMENT_PUBLIC_KEY: string;
  ANALYTICS_ID: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

export const env: EnvConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  PAYMENT_PUBLIC_KEY: import.meta.env.VITE_PAYMENT_PUBLIC_KEY,
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
  NODE_ENV: import.meta.env.NODE_ENV
};
```

---

## 📊 Monitoring and Analytics

### Performance Monitoring

```typescript
// Performance tracking utilities
export const performanceMonitor = {
  measurePageLoad: () => {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      // Send to analytics
      analytics.track('page_load_time', { duration: loadTime });
    });
  },
  
  measureComponentRender: (componentName: string) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;
      
      descriptor.value = function (...args: any[]) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const end = performance.now();
        
        analytics.track('component_render_time', {
          component: componentName,
          duration: end - start
        });
        
        return result;
      };
    };
  }
};
```

---

## 🔄 Future Extensibility

### Plugin Architecture

```typescript
// Plugin system for extending functionality
interface TFMPlugin {
  name: string;
  version: string;
  init: (app: Application) => void;
  destroy?: () => void;
}

class PluginManager {
  private plugins: Map<string, TFMPlugin> = new Map();
  
  register(plugin: TFMPlugin) {
    this.plugins.set(plugin.name, plugin);
    plugin.init(this.app);
  }
  
  unregister(pluginName: string) {
    const plugin = this.plugins.get(pluginName);
    if (plugin?.destroy) {
      plugin.destroy();
    }
    this.plugins.delete(pluginName);
  }
}
```

### API Integration Points

```typescript
// Extensible API service architecture
abstract class BaseApiService {
  protected baseUrl: string;
  protected headers: Record<string, string>;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }
  
  protected async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Base request implementation
  }
}

// Extensible product service
class ProductApiService extends BaseApiService {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return this.request<Product[]>('/products', {
      method: 'GET',
      // Include filters in query params
    });
  }
}
```

---

## 📝 Module Dependencies

### Internal Dependencies
```
components/ui → lib/utils
components/product → hooks/useCart
components/layout → contexts/AuthContext
hooks/useAuth → services/api/auth
services/api → utils/validation
```

### External Dependencies
```
react ^18.2.0
typescript ^5.0.0
@vitejs/plugin-react ^4.0.0
tailwindcss ^3.3.0
@radix-ui/react-* ^1.0.0
lucide-react ^0.263.0
```

---

**Last Updated**: July 30, 2025  
**Version**: 1.0.0  
**Maintainers**: TFMshop Development Team
