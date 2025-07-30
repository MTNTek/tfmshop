# TFMshop API Documentation

## 🚀 API Overview

The TFMshop API provides RESTful endpoints for all e-commerce functionality including product management, user authentication, shopping cart operations, and order processing.

**Base URL**: `https://api.tfmshop.com/v1`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

## 📦 Products API

### Get Products
```http
GET /products?page=1&limit=20&category=electronics&sort=price_asc
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `category` (string): Filter by category
- `search` (string): Search query
- `sort` (string): Sort order (`price_asc`, `price_desc`, `rating`, `newest`)
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "name": "Wireless Headphones",
        "description": "High-quality wireless headphones...",
        "price": 199.99,
        "originalPrice": 249.99,
        "currency": "USD",
        "category": "electronics",
        "subcategory": "audio",
        "brand": "TechBrand",
        "images": [
          "https://images.tfmshop.com/products/prod_123_1.jpg",
          "https://images.tfmshop.com/products/prod_123_2.jpg"
        ],
        "rating": 4.5,
        "reviewCount": 1250,
        "stock": 50,
        "features": [
          "Noise Cancellation",
          "30-hour Battery Life",
          "Quick Charge"
        ],
        "specifications": {
          "batteryLife": "30 hours",
          "weight": "250g",
          "connectivity": "Bluetooth 5.0"
        },
        "tags": ["wireless", "bluetooth", "noise-cancelling"],
        "createdAt": "2025-07-01T10:00:00Z",
        "updatedAt": "2025-07-30T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1500,
      "totalPages": 75,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Single Product
```http
GET /products/{productId}
```

**Response**: Single product object with same structure as above.

### Search Products
```http
GET /products/search?q=wireless+headphones&category=electronics
```

## 🛒 Cart API

### Get Cart
```http
GET /cart
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart_123",
      "userId": "user_123",
      "items": [
        {
          "productId": "prod_123",
          "product": {
            "id": "prod_123",
            "name": "Wireless Headphones",
            "price": 199.99,
            "image": "https://..."
          },
          "quantity": 2,
          "addedAt": "2025-07-30T12:00:00Z"
        }
      ],
      "subtotal": 399.98,
      "tax": 32.00,
      "shipping": 9.99,
      "total": 441.97,
      "updatedAt": "2025-07-30T12:30:00Z"
    }
  }
}
```

### Add to Cart
```http
POST /cart/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "prod_123",
  "quantity": 1
}
```

### Update Cart Item
```http
PUT /cart/items/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /cart/items/{productId}
Authorization: Bearer {token}
```

## 📋 Orders API

### Create Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "US"
  },
  "paymentMethod": {
    "type": "credit_card",
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
}
```

### Get Orders
```http
GET /orders?page=1&limit=10&status=pending
Authorization: Bearer {token}
```

### Get Order Details
```http
GET /orders/{orderId}
Authorization: Bearer {token}
```

## 👤 User API

### Get Profile
```http
GET /user/profile
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "avatar": "https://..."
}
```

### Get Addresses
```http
GET /user/addresses
Authorization: Bearer {token}
```

### Add Address
```http
POST /user/addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "shipping",
  "firstName": "John",
  "lastName": "Doe",
  "street": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "country": "US",
  "isDefault": true
}
```

## 📊 Categories API

### Get Categories
```http
GET /categories
```

**Response**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_electronics",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Electronic devices and accessories",
        "image": "https://...",
        "subcategories": [
          {
            "id": "subcat_audio",
            "name": "Audio",
            "slug": "audio",
            "productCount": 450
          }
        ],
        "productCount": 2500,
        "featured": true
      }
    ]
  }
}
```

## 💳 Payment API

### Process Payment
```http
POST /payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order_123",
  "amount": 441.97,
  "currency": "USD",
  "paymentMethod": {
    "type": "credit_card",
    "token": "pm_1234567890"
  }
}
```

## 📝 Reviews API

### Get Product Reviews
```http
GET /products/{productId}/reviews?page=1&limit=10&sort=newest
```

### Add Review
```http
POST /products/{productId}/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Really happy with this purchase...",
  "verified": true
}
```

## ❌ Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_ERROR`: Too many requests
- `SERVER_ERROR`: Internal server error

## 📊 Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 500 requests per minute
- **Search endpoints**: 50 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## 🔒 Security

### HTTPS Only
All API requests must use HTTPS. HTTP requests will be redirected.

### CORS Policy
```javascript
{
  "allowedOrigins": [
    "https://tfmshop.com",
    "https://www.tfmshop.com",
    "https://admin.tfmshop.com"
  ],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowedHeaders": ["Content-Type", "Authorization"]
}
```

### Request Signing
For sensitive operations, requests may require additional signing:

```http
X-TFM-Signature: sha256=abc123...
X-TFM-Timestamp: 1627654321
```

---

**Last Updated**: July 30, 2025  
**API Version**: 1.0.0
