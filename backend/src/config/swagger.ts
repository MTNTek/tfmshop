import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

/**
 * Swagger configuration for API documentation
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TFMshop Backend API',
      version: '1.0.0',
      description: 'Comprehensivive e-commerce backend API built with Node.js, Express, and TypeScript',
      contact: {
        name: 'TFMshop API Support',
        email: 'support@tfmshop.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.tfmshop.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
            },
          },
          required: ['success', 'timestamp'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code',
                },
                message: {
                  type: 'string',
                  description: 'Error message',
                },
              },
              required: ['code', 'message'],
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
            },
            path: {
              type: 'string',
              description: 'Request path',
            },
          },
          required: ['success', 'error', 'timestamp'],
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Current page number',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              description: 'Items per page',
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of items',
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of pages',
            },
          },
          required: ['page', 'limit', 'total', 'totalPages'],
        },
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            fullName: {
              type: 'string',
              description: 'User full name',
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'User phone number',
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              description: 'User role',
            },
            isActive: {
              type: 'boolean',
              description: 'User active status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
          required: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
        },
        // Product schemas
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID',
            },
            title: {
              type: 'string',
              description: 'Product title',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            slug: {
              type: 'string',
              description: 'Product URL slug',
            },
            price: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Product price',
            },
            originalPrice: {
              type: 'number',
              format: 'float',
              minimum: 0,
              nullable: true,
              description: 'Original price before discount',
            },
            stockQuantity: {
              type: 'integer',
              minimum: 0,
              description: 'Available stock quantity',
            },
            inStock: {
              type: 'boolean',
              description: 'Product availability status',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Product image URLs',
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5,
              description: 'Product rating',
            },
            reviewCount: {
              type: 'integer',
              minimum: 0,
              description: 'Number of reviews',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'Category ID',
            },
            isActive: {
              type: 'boolean',
              description: 'Product active status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Product creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Product last update timestamp',
            },
          },
          required: ['id', 'title', 'price', 'stockQuantity', 'inStock', 'categoryId', 'isActive'],
        },
        // Order schemas
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Order ID',
            },
            orderNumber: {
              type: 'string',
              description: 'Unique order number',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
              description: 'Order status',
            },
            subtotal: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Order subtotal',
            },
            tax: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Tax amount',
            },
            shipping: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Shipping cost',
            },
            total: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Total order amount',
            },
            totalItems: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of items',
            },
            trackingNumber: {
              type: 'string',
              nullable: true,
              description: 'Shipping tracking number',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order last update timestamp',
            },
          },
          required: ['id', 'orderNumber', 'userId', 'status', 'subtotal', 'tax', 'shipping', 'total'],
        },
        // Cart schemas
        Cart: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Cart ID',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem',
              },
              description: 'Cart items',
            },
            totalItems: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of items',
            },
            subtotal: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Cart subtotal',
            },
            isEmpty: {
              type: 'boolean',
              description: 'Whether cart is empty',
            },
          },
          required: ['id', 'userId', 'items', 'totalItems', 'subtotal', 'isEmpty'],
        },
        CartItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Cart item ID',
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID',
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Item quantity',
            },
            price: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Item price at time of adding',
            },
            totalPrice: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Total price for this item',
            },
          },
          required: ['id', 'productId', 'quantity', 'price', 'totalPrice'],
        },
        // Address schemas
        Address: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Address ID',
            },
            type: {
              type: 'string',
              enum: ['shipping', 'billing', 'both'],
              description: 'Address type',
            },
            firstName: {
              type: 'string',
              description: 'First name',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
            },
            company: {
              type: 'string',
              nullable: true,
              description: 'Company name',
            },
            addressLine1: {
              type: 'string',
              description: 'Address line 1',
            },
            addressLine2: {
              type: 'string',
              nullable: true,
              description: 'Address line 2',
            },
            city: {
              type: 'string',
              description: 'City',
            },
            state: {
              type: 'string',
              description: 'State/Province',
            },
            postalCode: {
              type: 'string',
              description: 'Postal/ZIP code',
            },
            country: {
              type: 'string',
              description: 'Country',
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'Phone number',
            },
            isDefault: {
              type: 'boolean',
              description: 'Whether this is the default address',
            },
            label: {
              type: 'string',
              nullable: true,
              description: 'Address label (e.g., Home, Work)',
            },
          },
          required: ['id', 'type', 'firstName', 'lastName', 'addressLine1', 'city', 'state', 'postalCode', 'country'],
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User profile management endpoints',
      },
      {
        name: 'Products',
        description: 'Product catalog and management endpoints',
      },
      {
        name: 'Categories',
        description: 'Product category management endpoints',
      },
      {
        name: 'Cart',
        description: 'Shopping cart management endpoints',
      },
      {
        name: 'Orders',
        description: 'Order management endpoints',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints (admin only)',
      },
      {
        name: 'System',
        description: 'System health and monitoring endpoints',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/types/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Swagger UI options
 */
export const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
  customSiteTitle: 'TFMshop API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};