# Frontend Guide

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **React Router** - Client-side routing

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── CategoryNav.tsx # Category navigation
│   ├── Footer.tsx      # Site footer
│   ├── Header.tsx      # Site header
│   ├── ProductCard.tsx # Product display card
│   └── ProductGrid.tsx # Product grid layout
├── hooks/              # Custom React hooks
│   └── use-toast.ts    # Toast notification hook
├── lib/                # Utility libraries
│   └── utils.ts        # Common utility functions
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Component Guidelines

### Component Structure

```typescript
// components/ExampleComponent.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  title: string;
  description?: string;
  className?: string;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  description,
  className
}) => {
  return (
    <div className={cn("default-classes", className)}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
};
```

### Best Practices

1. **Use TypeScript interfaces** for all props
2. **Export components as named exports**
3. **Use the `cn` utility** for conditional classes
4. **Keep components small and focused**
5. **Use proper prop destructuring**

## Styling with Tailwind CSS

### Responsive Design

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Custom Utilities

Add custom utilities in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

## State Management

### Local State

Use React's built-in hooks for local state:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [user, setUser] = useState<User | null>(null);
```

### Context API

For shared state across components:

```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## API Integration

### HTTP Client Setup

```typescript
// lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE}${endpoint}`);
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};
```

### Custom Hooks for API

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, login };
};
```

## Routing

### Route Setup

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};
```

## Forms and Validation

### Form Handling

```typescript
// components/LoginForm.tsx
const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setErrors({ general: 'Login failed' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## Testing

### Component Testing

```typescript
// __tests__/components/Header.test.tsx
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';

test('renders header with logo', () => {
  render(<Header />);
  expect(screen.getByRole('banner')).toBeInTheDocument();
});
```

### Testing Best Practices

1. **Test user interactions**, not implementation details
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Mock external dependencies**
4. **Test error states** and loading states
5. **Keep tests simple** and focused

## Performance Optimization

### Code Splitting

```typescript
// Lazy load components
const ProductPage = lazy(() => import('./pages/ProductPage'));

// Use Suspense for loading states
<Suspense fallback={<div>Loading...</div>}>
  <ProductPage />
</Suspense>
```

### Memoization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return performExpensiveCalculation(data);
}, [data]);

// Memoize components
const MemoizedComponent = React.memo(Component);
```

## Build and Deployment

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=TMF Shop
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```
