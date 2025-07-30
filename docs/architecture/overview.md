# Architecture Overview

## System Architecture

TMF Shop is built using a modern full-stack architecture with clear separation of concerns.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React/TS)    │◄──►│   (Node.js/TS)  │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express       │    │ • TypeORM       │
│ • TypeScript    │    │ • TypeScript    │    │ • Migrations    │
│ • Vite          │    │ • TypeORM       │    │ • Entities      │
│ • Tailwind CSS  │    │ • JWT Auth      │    │                 │
│ • Shadcn/ui     │    │ • Validation    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── Header
│   ├── Navigation
│   └── UserMenu
├── Main Content
│   ├── CategoryNav
│   ├── ProductGrid
│   │   └── ProductCard[]
│   └── Pagination
└── Footer
```

### State Management

- **Local State**: React hooks (useState, useEffect)
- **Context API**: Authentication and theme
- **Custom Hooks**: Reusable stateful logic
- **Form State**: Controlled components

### Routing Structure

```
/                    # Home page
├── /products        # Product listing
│   ├── /products/:id    # Product details
│   └── /products/search # Search results
├── /categories      # Category browsing
├── /auth           # Authentication
│   ├── /auth/login     # Login page
│   └── /auth/register  # Registration page
├── /user           # User area
│   ├── /user/profile   # User profile
│   ├── /user/orders    # Order history
│   └── /user/wishlist  # Wishlist
└── /admin          # Admin panel (future)
```

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│                Routes                   │ ← HTTP endpoints
├─────────────────────────────────────────┤
│              Controllers                │ ← Request/Response handling
├─────────────────────────────────────────┤
│               Services                  │ ← Business logic
├─────────────────────────────────────────┤
│             Repositories                │ ← Data access layer
├─────────────────────────────────────────┤
│               Entities                  │ ← Data models
├─────────────────────────────────────────┤
│               Database                  │ ← PostgreSQL/MySQL
└─────────────────────────────────────────┘
```

### Directory Structure

```
backend/src/
├── config/          # Configuration files
├── controllers/     # HTTP request handlers
├── entities/        # TypeORM entities
├── middleware/      # Express middleware
├── repositories/    # Data access layer
├── routes/          # Route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### API Design

#### RESTful Conventions

- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Response Format

```typescript
// Success Response
{
  "success": true,
  "data": {
    // Response data
  },
  "meta"?: {
    "pagination"?: {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}

// Error Response
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400,
    "details"?: []
  }
}
```

## Database Architecture

### Entity Relationships

```
User
├── id (PK)
├── email (unique)
├── password (hashed)
├── firstName
├── lastName
├── role
├── createdAt
└── updatedAt

Product (future)
├── id (PK)
├── name
├── description
├── price
├── categoryId (FK)
├── imageUrl
├── stock
├── isActive
├── createdAt
└── updatedAt

Category (future)
├── id (PK)
├── name
├── description
├── parentId (FK, self-reference)
├── createdAt
└── updatedAt

Order (future)
├── id (PK)
├── userId (FK)
├── status
├── total
├── createdAt
└── updatedAt

OrderItem (future)
├── id (PK)
├── orderId (FK)
├── productId (FK)
├── quantity
├── price
└── createdAt
```

### Migration Strategy

1. **Incremental migrations** for schema changes
2. **Data migrations** for complex transformations
3. **Rollback procedures** for each migration
4. **Testing migrations** on staging environment

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Server validates credentials
3. Server generates JWT token
4. Client stores token (httpOnly cookie or localStorage)
5. Client includes token in subsequent requests
6. Server validates token for protected routes
```

### Security Measures

- **Password hashing** using bcrypt
- **JWT tokens** for stateless authentication
- **Input validation** using middleware
- **Rate limiting** to prevent abuse
- **CORS configuration** for cross-origin requests
- **Environment variables** for sensitive data
- **SQL injection prevention** using TypeORM

## Deployment Architecture

### Development Environment

```
Frontend (localhost:5173) ←→ Backend (localhost:3000) ←→ Database (localhost:5432)
```

### Production Environment (Future)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CDN       │    │   Load      │    │   App       │
│  (Static)   │    │  Balancer   │    │  Servers    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │   API       │    │   Database  │
                   │  Gateway    │    │   Cluster   │
                   └─────────────┘    └─────────────┘
```

## Performance Considerations

### Frontend Optimization

- **Code splitting** with React.lazy()
- **Memoization** with React.memo() and useMemo()
- **Virtual scrolling** for large lists
- **Image optimization** with proper formats and lazy loading
- **Bundle analysis** and tree shaking

### Backend Optimization

- **Database indexing** on frequently queried columns
- **Query optimization** with proper joins and limits
- **Caching strategies** (Redis for session data)
- **Connection pooling** for database connections
- **Compression** for API responses

### Database Optimization

- **Proper indexing** strategy
- **Query analysis** and optimization
- **Connection pooling**
- **Read replicas** for scaling reads
- **Partitioning** for large tables

## Testing Strategy

### Testing Pyramid

```
           ┌─────────────┐
          ╱   E2E Tests   ╲     ← Few, expensive, high confidence
         ┌─────────────────┐
        ╱ Integration Tests ╲   ← Some, moderate cost
       ┌───────────────────────┐
      ╱     Unit Tests         ╲ ← Many, cheap, fast feedback
     └─────────────────────────┘
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Core business functionality

## Monitoring and Logging

### Logging Strategy

- **Structured logging** with consistent format
- **Log levels**: ERROR, WARN, INFO, DEBUG
- **Request/response logging** for API calls
- **Error tracking** with stack traces
- **Performance metrics** for database queries

### Monitoring Points

- **API response times**
- **Database query performance**
- **Error rates and types**
- **User authentication success/failure**
- **System resource usage**

## Future Considerations

### Scalability

- **Microservices** architecture for large scale
- **Event-driven** architecture with message queues
- **Caching layers** (Redis, CDN)
- **Database sharding** for horizontal scaling

### Features to Add

- **Product catalog** management
- **Shopping cart** functionality
- **Order processing** system
- **Payment integration**
- **Inventory management**
- **Search functionality**
- **Admin dashboard**
- **Mobile app** (React Native)
