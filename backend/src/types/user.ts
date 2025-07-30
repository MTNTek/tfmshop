import { z } from 'zod';
import { UserRole } from '../entities/User';
import { AddressType } from '../entities/Address';

/**
 * Zod schemas for user request validation
 */

// Profile update schema
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional(),
  email: z.string().email('Invalid email format').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .optional(),
}).refine(
  (data) => {
    // If newPassword is provided, currentPassword must also be provided
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Current password is required when changing password',
    path: ['currentPassword'],
  }
);

// Address schema
export const AddressSchema = z.object({
  type: z.nativeEnum(AddressType).optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().regex(/^[A-Za-z0-9\s\-]{3,10}$/, 'Invalid postal code format'),
  country: z.string().optional(),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional(),
  isDefault: z.boolean().optional(),
  label: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

// Address update schema (all fields optional)
export const UpdateAddressSchema = z.object({
  type: z.nativeEnum(AddressType).optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  company: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required').optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  postalCode: z.string().regex(/^[A-Za-z0-9\s\-]{3,10}$/, 'Invalid postal code format').optional(),
  country: z.string().optional(),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional(),
  isDefault: z.boolean().optional(),
  label: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

// Address ID parameter schema
export const AddressIdParamsSchema = z.object({
  addressId: z.string().uuid('Address ID must be a valid UUID'),
});

// Address query schema
export const AddressQuerySchema = z.object({
  type: z.nativeEnum(AddressType).optional(),
  isDefault: z.enum(['true', 'false']).optional(),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type AddressRequest = z.infer<typeof AddressSchema>;
export type UpdateAddressRequest = z.infer<typeof UpdateAddressSchema>;
export type AddressIdParams = z.infer<typeof AddressIdParamsSchema>;
export type AddressQuery = z.infer<typeof AddressQuerySchema>;

/**
 * User response types
 */
export interface AddressResponse {
  id: string;
  type: AddressType;
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
  isDefault: boolean;
  label?: string;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  addresses: AddressResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStatisticsResponse {
  totalAddresses: number;
  defaultShippingAddress: AddressResponse | null;
  defaultBillingAddress: AddressResponse | null;
  accountAge: number;
  lastUpdated: string;
}