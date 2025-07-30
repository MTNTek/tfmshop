import { Response } from 'express';
import { UserService, UpdateProfileData, AddressData, AddressQueryOptions } from '../services/UserService';
import { AuthenticatedRequest } from '../middleware/auth';
import { AddressType } from '../entities/Address';
import {
  UserProfileResponse,
  AddressResponse,
  UserStatisticsResponse,
} from '../types/user';

/**
 * User controller handling user profile and address operations
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get user profile
   * GET /api/users/profile
   */
  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await this.userService.getUserProfile(userId);

      const response: UserProfileResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        addresses: user.addresses?.map(address => ({
          id: address.id,
          type: address.type,
          firstName: address.firstName,
          lastName: address.lastName,
          company: address.company,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
          isDefault: address.isDefault,
          label: address.label,
          deliveryInstructions: address.deliveryInstructions,
          createdAt: address.createdAt.toISOString(),
          updatedAt: address.updatedAt.toISOString(),
        })) || [],
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Profile retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve profile';
      
      let statusCode = 500;
      let errorCode = 'PROFILE_RETRIEVAL_ERROR';

      if (errorMessage.includes('User not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const updateData: UpdateProfileData = req.body;

      // Validate profile data
      this.userService.validateProfileData(updateData);

      const updatedUser = await this.userService.updateProfile(userId, updateData);

      const response: UserProfileResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        addresses: [], // Addresses not loaded in update response
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      
      let statusCode = 500;
      let errorCode = 'PROFILE_UPDATE_ERROR';

      if (errorMessage.includes('User not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      } else if (errorMessage.includes('Email is already in use')) {
        statusCode = 409;
        errorCode = 'EMAIL_ALREADY_EXISTS';
      } else if (errorMessage.includes('Current password is incorrect')) {
        statusCode = 400;
        errorCode = 'INVALID_CURRENT_PASSWORD';
      } else if (errorMessage.includes('password') || errorMessage.includes('email') || 
                 errorMessage.includes('required') || errorMessage.includes('format')) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get user addresses
   * GET /api/users/addresses
   */
  getAddresses = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const options: AddressQueryOptions = {
        type: req.query.type as AddressType,
        isDefault: req.query.isDefault === 'true' ? true : 
                   req.query.isDefault === 'false' ? false : undefined,
      };

      const addresses = await this.userService.getUserAddresses(userId, options);

      const response: AddressResponse[] = addresses.map(address => ({
        id: address.id,
        type: address.type,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
        label: address.label,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
      }));

      res.status(200).json({
        success: true,
        data: response,
        message: 'Addresses retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve addresses';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ADDRESS_RETRIEVAL_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Create new address
   * POST /api/users/addresses
   */
  createAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const addressData: AddressData = req.body;

      const address = await this.userService.createAddress(userId, addressData);

      const response: AddressResponse = {
        id: address.id,
        type: address.type,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
        label: address.label,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
      };

      res.status(201).json({
        success: true,
        data: response,
        message: 'Address created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create address';
      
      let statusCode = 500;
      let errorCode = 'ADDRESS_CREATION_ERROR';

      if (errorMessage.includes('User not found')) {
        statusCode = 404;
        errorCode = 'USER_NOT_FOUND';
      } else if (errorMessage.includes('required') || errorMessage.includes('format')) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get specific address
   * GET /api/users/addresses/:addressId
   */
  getAddressById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { addressId } = req.params;

      const address = await this.userService.getAddressById(userId, addressId);

      const response: AddressResponse = {
        id: address.id,
        type: address.type,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
        label: address.label,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Address retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve address';
      
      let statusCode = 500;
      let errorCode = 'ADDRESS_RETRIEVAL_ERROR';

      if (errorMessage.includes('Address not found')) {
        statusCode = 404;
        errorCode = 'ADDRESS_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Update address
   * PUT /api/users/addresses/:addressId
   */
  updateAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { addressId } = req.params;
      const addressData: Partial<AddressData> = req.body;

      const updatedAddress = await this.userService.updateAddress(userId, addressId, addressData);

      const response: AddressResponse = {
        id: updatedAddress.id,
        type: updatedAddress.type,
        firstName: updatedAddress.firstName,
        lastName: updatedAddress.lastName,
        company: updatedAddress.company,
        addressLine1: updatedAddress.addressLine1,
        addressLine2: updatedAddress.addressLine2,
        city: updatedAddress.city,
        state: updatedAddress.state,
        postalCode: updatedAddress.postalCode,
        country: updatedAddress.country,
        phone: updatedAddress.phone,
        isDefault: updatedAddress.isDefault,
        label: updatedAddress.label,
        deliveryInstructions: updatedAddress.deliveryInstructions,
        createdAt: updatedAddress.createdAt.toISOString(),
        updatedAt: updatedAddress.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Address updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update address';
      
      let statusCode = 500;
      let errorCode = 'ADDRESS_UPDATE_ERROR';

      if (errorMessage.includes('Address not found')) {
        statusCode = 404;
        errorCode = 'ADDRESS_NOT_FOUND';
      } else if (errorMessage.includes('required') || errorMessage.includes('format')) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Delete address
   * DELETE /api/users/addresses/:addressId
   */
  deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { addressId } = req.params;

      await this.userService.deleteAddress(userId, addressId);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Address deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete address';
      
      let statusCode = 500;
      let errorCode = 'ADDRESS_DELETION_ERROR';

      if (errorMessage.includes('Address not found')) {
        statusCode = 404;
        errorCode = 'ADDRESS_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Set address as default
   * POST /api/users/addresses/:addressId/default
   */
  setDefaultAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { addressId } = req.params;

      const updatedAddress = await this.userService.setDefaultAddress(userId, addressId);

      const response: AddressResponse = {
        id: updatedAddress.id,
        type: updatedAddress.type,
        firstName: updatedAddress.firstName,
        lastName: updatedAddress.lastName,
        company: updatedAddress.company,
        addressLine1: updatedAddress.addressLine1,
        addressLine2: updatedAddress.addressLine2,
        city: updatedAddress.city,
        state: updatedAddress.state,
        postalCode: updatedAddress.postalCode,
        country: updatedAddress.country,
        phone: updatedAddress.phone,
        isDefault: updatedAddress.isDefault,
        label: updatedAddress.label,
        deliveryInstructions: updatedAddress.deliveryInstructions,
        createdAt: updatedAddress.createdAt.toISOString(),
        updatedAt: updatedAddress.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Default address updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set default address';
      
      let statusCode = 500;
      let errorCode = 'DEFAULT_ADDRESS_ERROR';

      if (errorMessage.includes('Address not found')) {
        statusCode = 404;
        errorCode = 'ADDRESS_NOT_FOUND';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };

  /**
   * Get user statistics
   * GET /api/users/statistics
   */
  getUserStatistics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const stats = await this.userService.getUserStatistics(userId);

      const response: UserStatisticsResponse = {
        totalAddresses: stats.totalAddresses,
        defaultShippingAddress: stats.defaultShippingAddress ? {
          id: stats.defaultShippingAddress.id,
          type: stats.defaultShippingAddress.type,
          firstName: stats.defaultShippingAddress.firstName,
          lastName: stats.defaultShippingAddress.lastName,
          company: stats.defaultShippingAddress.company,
          addressLine1: stats.defaultShippingAddress.addressLine1,
          addressLine2: stats.defaultShippingAddress.addressLine2,
          city: stats.defaultShippingAddress.city,
          state: stats.defaultShippingAddress.state,
          postalCode: stats.defaultShippingAddress.postalCode,
          country: stats.defaultShippingAddress.country,
          phone: stats.defaultShippingAddress.phone,
          isDefault: stats.defaultShippingAddress.isDefault,
          label: stats.defaultShippingAddress.label,
          deliveryInstructions: stats.defaultShippingAddress.deliveryInstructions,
          createdAt: stats.defaultShippingAddress.createdAt.toISOString(),
          updatedAt: stats.defaultShippingAddress.updatedAt.toISOString(),
        } : null,
        defaultBillingAddress: stats.defaultBillingAddress ? {
          id: stats.defaultBillingAddress.id,
          type: stats.defaultBillingAddress.type,
          firstName: stats.defaultBillingAddress.firstName,
          lastName: stats.defaultBillingAddress.lastName,
          company: stats.defaultBillingAddress.company,
          addressLine1: stats.defaultBillingAddress.addressLine1,
          addressLine2: stats.defaultBillingAddress.addressLine2,
          city: stats.defaultBillingAddress.city,
          state: stats.defaultBillingAddress.state,
          postalCode: stats.defaultBillingAddress.postalCode,
          country: stats.defaultBillingAddress.country,
          phone: stats.defaultBillingAddress.phone,
          isDefault: stats.defaultBillingAddress.isDefault,
          label: stats.defaultBillingAddress.label,
          deliveryInstructions: stats.defaultBillingAddress.deliveryInstructions,
          createdAt: stats.defaultBillingAddress.createdAt.toISOString(),
          updatedAt: stats.defaultBillingAddress.updatedAt.toISOString(),
        } : null,
        accountAge: stats.accountAge,
        lastUpdated: stats.lastUpdated.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'User statistics retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve user statistics';
      
      res.status(500).json({
        success: false,
        error: {
          code: 'USER_STATISTICS_ERROR',
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  };
}