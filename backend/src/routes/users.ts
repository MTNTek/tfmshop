import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  UpdateProfileSchema,
  AddressSchema,
  UpdateAddressSchema,
  AddressIdParamsSchema,
  AddressQuerySchema,
} from '../types/user';

/**
 * User routes
 * Base path: /api/users
 * All routes require authentication
 */
const router = Router();
const userController = new UserController();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

/**
 * GET /api/users/profile
 * Get user profile with addresses
 */
router.get('/profile', userController.getProfile);

/**
 * PUT /api/users/profile
 * Update user profile information
 */
router.put('/profile', validateBody(UpdateProfileSchema), userController.updateProfile);

/**
 * GET /api/users/statistics
 * Get user statistics and summary information
 */
router.get('/statistics', userController.getUserStatistics);

/**
 * GET /api/users/addresses
 * Get user addresses with optional filtering
 */
router.get('/addresses', validateQuery(AddressQuerySchema), userController.getAddresses);

/**
 * POST /api/users/addresses
 * Create new address for user
 */
router.post('/addresses', validateBody(AddressSchema), userController.createAddress);

/**
 * GET /api/users/addresses/:addressId
 * Get specific address by ID
 */
router.get(
  '/addresses/:addressId',
  validateParams(AddressIdParamsSchema),
  userController.getAddressById
);

/**
 * PUT /api/users/addresses/:addressId
 * Update existing address
 */
router.put(
  '/addresses/:addressId',
  validateParams(AddressIdParamsSchema),
  validateBody(UpdateAddressSchema),
  userController.updateAddress
);

/**
 * DELETE /api/users/addresses/:addressId
 * Delete address
 */
router.delete(
  '/addresses/:addressId',
  validateParams(AddressIdParamsSchema),
  userController.deleteAddress
);

/**
 * POST /api/users/addresses/:addressId/default
 * Set address as default
 */
router.post(
  '/addresses/:addressId/default',
  validateParams(AddressIdParamsSchema),
  userController.setDefaultAddress
);

export default router;