# TFMshop Component Documentation

## 🧩 Component Architecture

This document provides detailed documentation for all React components in the TFMshop application, including their props, usage examples, and best practices.

## 📋 Component Categories

### 1. Layout Components
- [Header](#header)
- [Footer](#footer)
- [CategoryNav](#categorynav)
- [Layout](#layout)
- [MobileMenu](#mobilemenu)

### 2. Product Components
- [ProductCard](#productcard)
- [ProductGrid](#productgrid)
- [ProductDetail](#productdetail)
- [ProductRating](#productrating)
- [ProductPrice](#productprice)

### 3. Cart Components
- [CartButton](#cartbutton)
- [CartSidebar](#cartsidebar)
- [CartItem](#cartitem)
- [CartSummary](#cartsummary)

### 4. UI Components
- [Button](#button)
- [Input](#input)
- [Card](#card)
- [Badge](#badge)
- [Dialog](#dialog)

### 5. Form Components
- [LoginForm](#loginform)
- [RegisterForm](#registerform)
- [SearchForm](#searchform)
- [CheckoutForm](#checkoutform)

---

## Layout Components

### Header

The main navigation header containing logo, search, user menu, and cart.

#### Props
```typescript
interface HeaderProps {
  isLoggedIn: boolean;
  user?: {
    name: string;
    avatar?: string;
  };
  cartItemCount: number;
  onSearch: (query: string, category?: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  onCartOpen: () => void;
}
```

#### Usage
```tsx
import { Header } from '@/components/layout/Header';

<Header
  isLoggedIn={user !== null}
  user={user}
  cartItemCount={cartItems.length}
  onSearch={handleSearch}
  onLogin={() => setShowLogin(true)}
  onLogout={handleLogout}
  onCartOpen={() => setShowCart(true)}
/>
```

#### Features
- Responsive design with mobile menu
- Search with category filtering
- User account dropdown
- Shopping cart indicator with count
- Logo with brand navigation

---

### CategoryNav

Horizontal navigation bar for product categories.

#### Props
```typescript
interface CategoryNavProps {
  categories: Category[];
  activeCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  className?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}
```

#### Usage
```tsx
import { CategoryNav } from '@/components/layout/CategoryNav';

<CategoryNav
  categories={categories}
  activeCategory={activeCategory}
  onCategorySelect={setActiveCategory}
/>
```

---

## Product Components

### ProductCard

Individual product display card with image, details, and actions.

#### Props
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  onWishlistToggle?: (productId: string) => void;
  showQuickView?: boolean;
  className?: string;
}

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
  inStock: boolean;
}
```

#### Usage
```tsx
import { ProductCard } from '@/components/product/ProductCard';

<ProductCard
  product={product}
  onAddToCart={addToCart}
  onQuickView={openQuickView}
  showQuickView={true}
/>
```

#### Features
- Responsive image display
- Price formatting with discounts
- Star rating display
- Add to cart button
- Hover effects and animations
- Badge system for featured/sale items

---

### ProductGrid

Grid layout for displaying multiple products.

#### Props
```typescript
interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string;
  onAddToCart: (productId: string) => void;
  onProductClick: (productId: string) => void;
  gridCols?: {
    default: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  className?: string;
}
```

#### Usage
```tsx
import { ProductGrid } from '@/components/product/ProductGrid';

<ProductGrid
  products={products}
  loading={isLoading}
  onAddToCart={addToCart}
  onProductClick={navigateToProduct}
  gridCols={{
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  }}
/>
```

#### Features
- Responsive grid layout
- Loading states with skeletons
- Error handling
- Infinite scroll support
- Customizable grid columns

---

### ProductRating

Star rating display component.

#### Props
```typescript
interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}
```

#### Usage
```tsx
import { ProductRating } from '@/components/product/ProductRating';

<ProductRating
  rating={4.5}
  reviewCount={1250}
  showCount={true}
  size="md"
/>
```

---

## Cart Components

### CartButton

Shopping cart trigger button with item count.

#### Props
```typescript
interface CartButtonProps {
  itemCount: number;
  onClick: () => void;
  variant?: 'default' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### Usage
```tsx
import { CartButton } from '@/components/cart/CartButton';

<CartButton
  itemCount={cartItems.length}
  onClick={() => setShowCart(true)}
  variant="default"
  size="md"
/>
```

---

### CartSidebar

Slide-out shopping cart panel.

#### Props
```typescript
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  loading?: boolean;
}

interface CartItem {
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}
```

#### Usage
```tsx
import { CartSidebar } from '@/components/cart/CartSidebar';

<CartSidebar
  isOpen={showCart}
  onClose={() => setShowCart(false)}
  items={cartItems}
  onUpdateQuantity={updateQuantity}
  onRemoveItem={removeItem}
  onCheckout={proceedToCheckout}
/>
```

#### Features
- Smooth slide animations
- Item quantity controls
- Price calculations
- Empty cart state
- Checkout button

---

## UI Components

### Button

Customizable button component with multiple variants.

#### Props
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

#### Usage
```tsx
import { Button } from '@/components/ui/button';

<Button
  variant="default"
  size="lg"
  loading={isLoading}
  leftIcon={<ShoppingCart />}
  onClick={handleAddToCart}
>
  Add to Cart
</Button>
```

#### Variants
- `default`: Primary action button (dark green)
- `destructive`: Dangerous actions (red)
- `outline`: Secondary actions with border
- `secondary`: Alternative secondary style
- `ghost`: Minimal styling
- `link`: Text link appearance

---

### Input

Form input component with validation states.

#### Props
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search';
}
```

#### Usage
```tsx
import { Input } from '@/components/ui/input';

<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error={emailError}
  leftIcon={<Mail />}
  required
/>
```

---

### Card

Container component for content sections.

#### Props
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}
```

#### Usage
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

<Card variant="outline" padding="lg">
  <CardHeader>
    <h3>Product Details</h3>
  </CardHeader>
  <CardContent>
    <p>Product description...</p>
  </CardContent>
  <CardFooter>
    <Button>Add to Cart</Button>
  </CardFooter>
</Card>
```

---

## Form Components

### LoginForm

User authentication login form.

#### Props
```typescript
interface LoginFormProps {
  onSubmit: (data: LoginData) => Promise<void>;
  onForgotPassword: () => void;
  onSignUpClick: () => void;
  loading?: boolean;
  error?: string;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

#### Usage
```tsx
import { LoginForm } from '@/components/forms/LoginForm';

<LoginForm
  onSubmit={handleLogin}
  onForgotPassword={() => setShowForgotPassword(true)}
  onSignUpClick={() => setShowRegister(true)}
  loading={isLoggingIn}
  error={loginError}
/>
```

---

### SearchForm

Product search form with category filtering.

#### Props
```typescript
interface SearchFormProps {
  onSearch: (query: string, category?: string) => void;
  categories: Category[];
  placeholder?: string;
  defaultCategory?: string;
  showCategoryFilter?: boolean;
  className?: string;
}
```

#### Usage
```tsx
import { SearchForm } from '@/components/forms/SearchForm';

<SearchForm
  onSearch={handleSearch}
  categories={categories}
  placeholder="Search products..."
  showCategoryFilter={true}
/>
```

---

## Component Guidelines

### Accessibility

All components follow WCAG 2.1 AA guidelines:

```tsx
// Proper ARIA labels
<button aria-label="Add to cart" aria-describedby="product-price">
  <ShoppingCart aria-hidden="true" />
</button>

// Keyboard navigation
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    handleClick();
  }
};

// Focus management
const buttonRef = useRef<HTMLButtonElement>(null);
useEffect(() => {
  if (shouldFocus) {
    buttonRef.current?.focus();
  }
}, [shouldFocus]);
```

### Performance

#### Memoization
```tsx
import { memo } from 'react';

export const ProductCard = memo<ProductCardProps>(({ product, onAddToCart }) => {
  // Component implementation
});

// Custom comparison for complex props
export const ProductGrid = memo<ProductGridProps>(
  ({ products, ...props }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    return (
      prevProps.products.length === nextProps.products.length &&
      prevProps.loading === nextProps.loading
    );
  }
);
```

#### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const ProductDetail = lazy(() => import('./ProductDetail'));

<Suspense fallback={<ProductDetailSkeleton />}>
  <ProductDetail productId={productId} />
</Suspense>
```

### Testing

#### Component Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    rating: 4.5,
    reviewCount: 100,
    image: 'test.jpg',
    category: 'electronics',
    inStock: true
  };

  it('renders product information correctly', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={jest.fn()}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockAddToCart}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });
});
```

### Styling

#### Tailwind Classes
```tsx
// Responsive design
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

// Custom colors
<button className="bg-tfm-primary hover:bg-tfm-secondary text-white">

// Dark mode support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

#### CSS Modules (when needed)
```css
/* ProductCard.module.css */
.card {
  @apply bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200;
}

.imageContainer {
  @apply relative aspect-square overflow-hidden rounded-t-lg;
}

.badge {
  @apply absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full;
}

.badge--featured {
  @apply bg-tfm-accent text-white;
}

.badge--sale {
  @apply bg-red-500 text-white;
}
```

---

**Last Updated**: July 30, 2025  
**Component Library Version**: 1.0.0
