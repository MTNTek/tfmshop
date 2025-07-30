# TMF Shop Module Documentation

## System Architecture Overview

TMF Shop follows a modular full-stack architecture with clear separation of concerns between frontend and backend systems.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React/TS)    │◄──►│   (Node.js/TS)  │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Modules

### 1. Core Application Module

**Location**: `src/`  
**Status**: ✅ Implemented  
**Dependencies**: React 18, TypeScript, Vite

**Components**:
- `App.tsx` - Main application component
- `main.tsx` - Application entry point
- `index.css` - Global styles

**Configuration Files**:
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling configuration
- `tsconfig.json` - TypeScript configuration

---

### 2. UI Component Library Module

**Location**: `src/components/ui/`  
**Status**: ✅ Implemented  
**Dependencies**: Radix UI, Tailwind CSS, Class Variance Authority

**Core Components** (40+ components):
- `button.tsx` - Button variations
- `input.tsx` - Form inputs
- `card.tsx` - Content containers
- `dialog.tsx` - Modal dialogs
- `dropdown-menu.tsx` - Dropdown menus
- `form.tsx` - Form handling
- `table.tsx` - Data tables
- `toast.tsx` - Notifications
- `navigation-menu.tsx` - Navigation
- `pagination.tsx` - Data pagination

**Features**:
- Fully typed TypeScript components
- Accessible by design (ARIA compliance)
- Consistent styling with Tailwind CSS
- Customizable with className props

---

### 3. Layout Components Module

**Location**: `src/components/`  
**Status**: ✅ Implemented  
**Dependencies**: Lucide React icons, UI components

**Components**:
- `Header.tsx` - Site header with navigation and search
- `Footer.tsx` - Site footer with links and information
- `CategoryNav.tsx` - Category navigation component

**Features**:
- Responsive design (mobile-first)
- Shopping cart integration ready
- User authentication state handling
- Search functionality placeholder

---

### 4. Product Display Module

**Location**: `src/components/`  
**Status**: ✅ Implemented  
**Dependencies**: UI components

**Components**:
- `ProductCard.tsx` - Individual product display
- `ProductGrid.tsx` - Product grid layout

**Features**:
- Product image display
- Price and rating display
- Add to cart functionality (placeholder)
- Responsive grid layout

---

### 5. Utility and Hooks Module

**Location**: `src/lib/` and `src/hooks/`  
**Status**: ✅ Implemented  

**Files**:
- `src/lib/utils.ts` - Utility functions (class merging, etc.)
- `src/hooks/use-toast.ts` - Toast notification hook

**Features**:
- Type-safe utility functions
- Custom React hooks for common functionality
- Class name merging with conflict resolution

---

### 6. Authentication Module (Frontend)

**Location**: TBD (to be implemented)  
**Status**: 🚧 Planned  
**Dependencies**: React Hook Form, Zod validation

**Planned Components**:
- `LoginForm.tsx` - User login form
- `RegisterForm.tsx` - User registration form  
- `ProtectedRoute.tsx` - Route protection
- `AuthContext.tsx` - Authentication state management

## Backend Modules

### 1. Core Configuration Module

**Location**: `backend/src/config/`  
**Status**: ✅ Implemented  
**Dependencies**: TypeORM, dotenv

**Files**:
- `database.ts` - Database connection configuration
- `env.ts` - Environment variables configuration

**Features**:
- PostgreSQL connection with TypeORM
- Environment-based configuration
- Connection health checking
- Error handling and logging

---

### 2. Database Foundation Module

**Location**: `backend/src/entities/`  
**Status**: ✅ Implemented  
**Dependencies**: TypeORM, reflect-metadata

**Files**:
- `BaseEntity.ts` - Abstract base entity with common fields
- `User.ts` - User entity with authentication fields
- `index.ts` - Entity exports

**Features**:
- UUID primary keys
- Automatic timestamps (createdAt, updatedAt)
- Type-safe entity definitions
- Relationship support ready

---

### 3. Authentication & Authorization Module

**Location**: `backend/src/` (multiple directories)  
**Status**: ✅ Implemented  
**Dependencies**: JWT, bcrypt, zod

**Files**:
- `services/AuthService.ts` - Authentication business logic
- `controllers/AuthController.ts` - HTTP request handling
- `middleware/auth.ts` - Authentication middleware
- `routes/auth.ts` - Authentication routes
- `utils/jwt.ts` - JWT token utilities
- `utils/password.ts` - Password hashing utilities
- `types/auth.ts` - Authentication type definitions

**Features**:
- JWT-based stateless authentication
- Role-based access control (customer/admin)
- Password hashing with bcrypt
- Token refresh mechanism
- Password reset functionality
- Comprehensive request validation
- Secure middleware for protected routes

**API Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset completion

---

### 4. Validation & Middleware Module

**Location**: `backend/src/middleware/`  
**Status**: ✅ Implemented  
**Dependencies**: Zod, Express

**Files**:
- `validation.ts` - Request validation middleware
- `auth.ts` - Authentication middleware
- `index.ts` - Middleware exports

**Features**:
- Type-safe request validation with Zod
- Body, params, and query validation
- Error handling with detailed messages
- Role-based authorization
- Consistent error response format

---

### 5. Database Utilities Module

**Location**: `backend/src/utils/`  
**Status**: ✅ Implemented  
**Dependencies**: TypeORM

**Files**:
- `database.ts` - Database operation utilities
- `jwt.ts` - JWT token utilities
- `password.ts` - Password hashing utilities
- `index.ts` - Utility exports

**Features**:
- Transaction management
- Table existence checking
- Raw query execution
- Connection info retrieval
- Testing utilities

---

### 6. Testing Infrastructure Module

**Location**: `backend/tests/`  
**Status**: ✅ Implemented  
**Dependencies**: Jest, Supertest

**Structure**:
```
tests/
├── setup.ts              # Test configuration
├── app.test.ts           # Application tests
├── database.test.ts      # Database tests
├── entities/             # Entity tests
├── middleware/           # Middleware tests
├── services/             # Service tests
└── utils/                # Utility tests
```

**Features**:
- Unit tests for all services and utilities
- Integration tests for API endpoints
- Middleware testing with mocks
- Database testing with test configuration
- >85% test coverage
- Automated test runs with Jest

---

### 7. Product Management Module

**Location**: `backend/src/entities/`, `backend/src/services/`, `backend/src/controllers/`, `backend/src/routes/`  
**Status**: ✅ Implemented  
**Dependencies**: TypeORM, Zod validation

**Backend Components**:
- `entities/Product.ts` - Complete product entity with pricing, stock, ratings, images
- `entities/Category.ts` - Hierarchical category entity with parent-child relationships
- `services/ProductService.ts` - Advanced product business logic with filtering, search, pagination
- `services/CategoryService.ts` - Category tree operations and management
- `controllers/ProductController.ts` - Full CRUD API endpoints for products
- `controllers/CategoryController.ts` - Full CRUD API endpoints for categories
- `routes/product.ts` - Product route definitions with authentication
- `routes/category.ts` - Category route definitions with authentication

**Features**:
- Complete product catalog management
- Hierarchical category system with unlimited nesting
- Advanced search and filtering capabilities
- Stock management and inventory tracking
- Product ratings and reviews support
- Image gallery support for products
- Product specifications and variants
- Featured products functionality
- SEO-friendly slugs for categories
- Pagination and sorting for large datasets

**API Endpoints**:
- `GET /api/products` - List products with filtering, search, pagination
- `POST /api/products` - Create new product (admin only)
- `GET /api/products/:id` - Get specific product details
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/featured` - Get featured products
- `GET /api/categories` - List categories with tree structure
- `POST /api/categories` - Create new category (admin only)
- `GET /api/categories/:id` - Get specific category
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

**Frontend Components** (Planned):
- Product listing pages
- Product detail pages
- Product search and filtering
- Category browsing

## Planned Modules (To Be Implemented)

---

### 8. Shopping Cart Module

**Status**: 🚧 Planned  
**Backend Components**:
- `entities/Cart.ts` - Cart entity
- `entities/CartItem.ts` - Cart item entity
- `services/CartService.ts` - Cart business logic
- `controllers/CartController.ts` - Cart API endpoints

**Frontend Components**:
- Cart display component
- Add to cart functionality
- Cart management interface
- Checkout preparation

---

### 9. Order Processing Module

**Status**: 🚧 Planned  
**Backend Components**:
- `entities/Order.ts` - Order entity
- `entities/OrderItem.ts` - Order item entity
- `entities/Address.ts` - Address entity
- `services/OrderService.ts` - Order business logic
- `controllers/OrderController.ts` - Order API endpoints

**Frontend Components**:
- Checkout process
- Order confirmation
- Order history
- Order tracking

---

### 10. Admin Panel Module

**Status**: 🚧 Planned  
**Backend Components**:
- `services/AdminService.ts` - Admin operations
- `controllers/AdminController.ts` - Admin endpoints
- Admin-specific middleware

**Frontend Components**:
- Admin dashboard
- User management interface
- Product management interface
- Order management interface
- Analytics and reporting

---

### 11. File Upload Module

**Status**: 🚧 Planned  
**Dependencies**: Multer, image processing libraries

**Features**:
- Product image upload
- Image optimization and resizing
- Secure file storage
- CDN integration ready

---

### 12. Search & Filter Module

**Status**: 🚧 Planned  
**Features**:
- Full-text search
- Category filtering
- Price range filtering
- Sorting options
- Search analytics

## Module Dependencies

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "typescript": "^5.1.3",
  "@radix-ui/*": "Latest",
  "tailwindcss": "^3.4.1",
  "lucide-react": "^0.446.0",
  "class-variance-authority": "^0.7.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "typeorm": "^0.3.16",
  "pg": "^8.11.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "zod": "^3.21.4",
  "cors": "^2.8.5",
  "dotenv": "^16.1.4"
}
```

## Module Integration Patterns

### 1. Database Integration
- All entities extend `BaseEntity` for consistency
- TypeORM decorators for relationships
- Migration-based schema management
- Repository pattern for data access

### 2. API Integration
- RESTful API design
- Consistent response format
- Zod validation for type safety
- JWT-based authentication
- Role-based authorization

### 3. Frontend-Backend Communication
- Typed API interfaces
- Custom hooks for API calls
- Error handling with toast notifications
- Loading states management

### 4. Testing Integration
- Jest for both frontend and backend
- Mock services for unit testing
- Integration tests for API endpoints
- Component testing for React components

## Development Guidelines

### 1. Adding New Modules
1. Follow existing directory structure
2. Implement proper TypeScript types
3. Add comprehensive tests
4. Update documentation
5. Follow coding standards

### 2. Module Communication
- Use service layer for business logic
- Controllers handle HTTP concerns only
- Frontend components stay focused and small
- Use custom hooks for state management

### 3. Error Handling
- Consistent error response format
- Proper HTTP status codes
- Client-side error boundaries
- Logging for debugging

---

**Last Updated**: July 28, 2025  
**Document Version**: 1.0  
**Next Review**: TBD
