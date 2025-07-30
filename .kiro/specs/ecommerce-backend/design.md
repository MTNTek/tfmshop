# Backend Design Document

## Overview

The TFMshop backend will be built as a RESTful API using Node.js with Express.js framework, TypeScript for type safety, and PostgreSQL for data persistence. The system follows a layered architecture with clear separation of concerns, implementing authentication via JWT tokens, and providing comprehensive API endpoints for product management, user operations, shopping cart functionality, and order processing.

## Architecture

### System Architecture
The backend follows a three-tier architecture:

1. **Presentation Layer**: REST API endpoints with Express.js routes
2. **Business Logic Layer**: Service classes containing business rules and validation
3. **Data Access Layer**: Repository pattern with TypeORM for database operations

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM for database operations
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod for request/response validation
- **File Storage**: Local filesystem with future cloud storage support
- **Testing**: Jest for unit and integration tests
- **Documentation**: Swagger/OpenAPI for API documentation

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic layer
│   ├── repositories/    # Data access layer
│   ├── entities/        # Database entity models
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route definitions
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── tests/               # Test files
├── uploads/             # File upload storage
└── docs/                # API documentation
```

## Components and Interfaces

### Core Entities

#### User Entity
```typescript
interface User {
  id: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  role: 'customer' | 'admin';
}
```

#### Product Entity
```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  images: string[];
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  specifications: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Order Entity
```typescript
interface Order {
  id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Cart Entity
```typescript
interface Cart {
  id: string;
  user: User;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number; // price at time of adding to cart
}
```

### API Endpoints

#### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Product Routes
- `GET /api/products` - Get paginated products with filtering
- `GET /api/products/:id` - Get single product details
- `GET /api/products/search` - Search products
- `GET /api/categories` - Get product categories
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

#### Cart Routes
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

#### Order Routes
- `POST /api/orders` - Create new order (checkout)
- `GET /api/orders` - Get user's order history
- `GET /api/orders/:id` - Get specific order details
- `PUT /api/orders/:id/status` - Update order status (admin only)

#### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add new address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address

#### Admin Routes
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `GET /api/admin/analytics` - Get platform analytics (admin only)

### Service Layer Design

#### ProductService
- `findAll(filters, pagination)` - Get products with filtering and pagination
- `findById(id)` - Get single product
- `search(query, filters)` - Search products
- `create(productData)` - Create new product
- `update(id, productData)` - Update existing product
- `delete(id)` - Soft delete product
- `updateStock(id, quantity)` - Update inventory

#### AuthService
- `register(userData)` - Register new user
- `login(credentials)` - Authenticate user
- `generateTokens(user)` - Generate JWT tokens
- `refreshToken(refreshToken)` - Refresh access token
- `forgotPassword(email)` - Initiate password reset
- `resetPassword(token, newPassword)` - Complete password reset

#### CartService
- `getCart(userId)` - Get user's cart
- `addItem(userId, productId, quantity)` - Add item to cart
- `updateItem(userId, itemId, quantity)` - Update cart item
- `removeItem(userId, itemId)` - Remove cart item
- `clearCart(userId)` - Clear entire cart
- `validateCart(userId)` - Validate cart contents and pricing

#### OrderService
- `createOrder(userId, orderData)` - Create new order
- `getOrders(userId, pagination)` - Get user's orders
- `getOrderById(orderId)` - Get specific order
- `updateOrderStatus(orderId, status)` - Update order status
- `calculateTotals(items, shippingAddress)` - Calculate order totals

## Data Models

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id),
  stock_quantity INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  badge VARCHAR(50),
  specifications JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relationships
- Users have many Orders (one-to-many)
- Users have one Cart (one-to-one)
- Products belong to Categories (many-to-one)
- Orders have many OrderItems (one-to-many)
- Carts have many CartItems (one-to-many)

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}
```

### Error Categories
1. **Validation Errors** (400): Invalid request data
2. **Authentication Errors** (401): Invalid or missing credentials
3. **Authorization Errors** (403): Insufficient permissions
4. **Not Found Errors** (404): Resource not found
5. **Conflict Errors** (409): Resource conflicts (e.g., duplicate email)
6. **Server Errors** (500): Internal server errors

### Error Handling Middleware
- Global error handler for unhandled exceptions
- Validation error handler for request validation
- Database error handler for database-specific errors
- Authentication error handler for JWT-related errors

## Testing Strategy

### Unit Testing
- Service layer methods with mocked dependencies
- Utility functions and helper methods
- Validation schemas and middleware
- Target: 90%+ code coverage

### Integration Testing
- API endpoint testing with test database
- Database operations and transactions
- Authentication and authorization flows
- File upload and processing

### Test Structure
```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── middleware/
├── integration/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   └── orders/
└── fixtures/
    ├── users.json
    ├── products.json
    └── orders.json
```

### Testing Tools
- **Jest**: Test framework and assertion library
- **Supertest**: HTTP assertion library for API testing
- **Test Database**: Separate PostgreSQL instance for testing
- **Factory Functions**: Generate test data consistently
- **Mocking**: Mock external dependencies and services

### Performance Testing
- Load testing for high-traffic scenarios
- Database query optimization testing
- Memory usage and leak detection
- Response time benchmarking for critical endpoints