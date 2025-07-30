import { z } from 'zod';
import { OrderStatus } from '../entities/Order';

/**
 * Zod schemas for order request validation
 */

// Address schema for checkout
const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

// Checkout request schema
export const CheckoutSchema = z.object({
  shippingAddressId: z.string().uuid().optional(),
  billingAddressId: z.string().uuid().optional(),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  paymentMethod: z.string().optional(),
  customerNotes: z.string().optional(),
}).refine(
  (data) => data.shippingAddressId || data.shippingAddress,
  {
    message: 'Either shippingAddressId or shippingAddress is required',
    path: ['shippingAddress'],
  }
);

// Order status update schema (admin only)
export const OrderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
  trackingNumber: z.string().optional(),
});

// Order cancellation schema
export const OrderCancellationSchema = z.object({
  reason: z.string().optional(),
});

// Order ID parameter schema
export const OrderIdParamsSchema = z.object({
  orderId: z.string().uuid('Order ID must be a valid UUID'),
});

// Order history query schema
export const OrderHistoryQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Order statistics query schema
export const OrderStatisticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CheckoutRequest = z.infer<typeof CheckoutSchema>;
export type OrderStatusUpdateRequest = z.infer<typeof OrderStatusUpdateSchema>;
export type OrderCancellationRequest = z.infer<typeof OrderCancellationSchema>;
export type OrderIdParams = z.infer<typeof OrderIdParamsSchema>;
export type OrderHistoryQuery = z.infer<typeof OrderHistoryQuerySchema>;
export type OrderStatisticsQuery = z.infer<typeof OrderStatisticsQuerySchema>;

/**
 * Order response types
 */
export interface OrderItemResponse {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemResponse[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod?: string;
  trackingNumber?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryResponse {
  orders: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderStatisticsResponse {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
}