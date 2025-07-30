import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Address, AddressType } from '../entities/Address';
import { PasswordUtils } from '../utils/password';

/**
 * Interface for user profile update data
 */
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

/**
 * Interface for address creation/update data
 */
export interface AddressData {
  type?: AddressType;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
  label?: string;
  deliveryInstructions?: string;
}

/**
 * Interface for address query options
 */
export interface AddressQueryOptions {
  type?: AddressType;
  isDefault?: boolean;
}

/**
 * Service class for managing user profiles and addresses
 */
export class UserService {
  private userRepository: Repository<User>;
  private addressRepository: Repository<Address>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.addressRepository = AppDataSource.getRepository(Address);
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['addresses'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: UpdateProfileData): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Handle password change
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new Error('Current password is required to change password');
      }

      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
        updateData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password strength
      if (updateData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      user.password = await PasswordUtils.hashPassword(updateData.newPassword);
    }

    // Handle email change
    if (updateData.email && updateData.email !== user.email) {
      // Check if email is already taken
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email is already in use');
      }

      user.email = updateData.email.toLowerCase().trim();
    }

    // Update other profile fields
    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName.trim();
    }

    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName.trim();
    }

    if (updateData.phone !== undefined) {
      user.phone = updateData.phone ? updateData.phone.trim() : undefined;
    }

    // Validate required fields
    if (!user.firstName || !user.lastName || !user.email) {
      throw new Error('First name, last name, and email are required');
    }

    return await this.userRepository.save(user);
  }

  /**
   * Get user addresses
   */
  async getUserAddresses(userId: string, options: AddressQueryOptions = {}): Promise<Address[]> {
    const queryBuilder = this.addressRepository
      .createQueryBuilder('address')
      .where('address.userId = :userId', { userId })
      .orderBy('address.isDefault', 'DESC')
      .addOrderBy('address.createdAt', 'ASC');

    if (options.type) {
      queryBuilder.andWhere(
        '(address.type = :type OR address.type = :both)',
        { type: options.type, both: AddressType.BOTH }
      );
    }

    if (options.isDefault !== undefined) {
      queryBuilder.andWhere('address.isDefault = :isDefault', {
        isDefault: options.isDefault,
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get address by ID for a specific user
   */
  async getAddressById(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  }

  /**
   * Create new address for user
   */
  async createAddress(userId: string, addressData: AddressData): Promise<Address> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Validate address data
    this.validateAddressData(addressData);

    // Handle default address logic
    if (addressData.isDefault) {
      await this.clearDefaultAddresses(userId, addressData.type);
    }

    // Create address
    const address = this.addressRepository.create({
      userId,
      type: addressData.type || AddressType.BOTH,
      firstName: addressData.firstName.trim(),
      lastName: addressData.lastName.trim(),
      company: addressData.company?.trim(),
      addressLine1: addressData.addressLine1.trim(),
      addressLine2: addressData.addressLine2?.trim(),
      city: addressData.city.trim(),
      state: addressData.state.trim(),
      postalCode: addressData.postalCode.trim(),
      country: addressData.country?.trim() || 'United States',
      phone: addressData.phone?.trim(),
      isDefault: addressData.isDefault || false,
      label: addressData.label?.trim(),
      deliveryInstructions: addressData.deliveryInstructions?.trim(),
    });

    return await this.addressRepository.save(address);
  }

  /**
   * Update existing address
   */
  async updateAddress(userId: string, addressId: string, addressData: Partial<AddressData>): Promise<Address> {
    const address = await this.getAddressById(userId, addressId);

    // Validate address data if provided
    if (addressData.firstName || addressData.lastName || addressData.addressLine1 || 
        addressData.city || addressData.state || addressData.postalCode) {
      this.validateAddressData({
        firstName: addressData.firstName || address.firstName,
        lastName: addressData.lastName || address.lastName,
        addressLine1: addressData.addressLine1 || address.addressLine1,
        city: addressData.city || address.city,
        state: addressData.state || address.state,
        postalCode: addressData.postalCode || address.postalCode,
      } as AddressData);
    }

    // Handle default address logic
    if (addressData.isDefault && !address.isDefault) {
      await this.clearDefaultAddresses(userId, addressData.type || address.type);
    }

    // Update address fields
    if (addressData.type !== undefined) {
      address.type = addressData.type;
    }

    if (addressData.firstName !== undefined) {
      address.firstName = addressData.firstName.trim();
    }

    if (addressData.lastName !== undefined) {
      address.lastName = addressData.lastName.trim();
    }

    if (addressData.company !== undefined) {
      address.company = addressData.company?.trim();
    }

    if (addressData.addressLine1 !== undefined) {
      address.addressLine1 = addressData.addressLine1.trim();
    }

    if (addressData.addressLine2 !== undefined) {
      address.addressLine2 = addressData.addressLine2?.trim();
    }

    if (addressData.city !== undefined) {
      address.city = addressData.city.trim();
    }

    if (addressData.state !== undefined) {
      address.state = addressData.state.trim();
    }

    if (addressData.postalCode !== undefined) {
      address.postalCode = addressData.postalCode.trim();
    }

    if (addressData.country !== undefined) {
      address.country = addressData.country?.trim() || 'United States';
    }

    if (addressData.phone !== undefined) {
      address.phone = addressData.phone?.trim();
    }

    if (addressData.isDefault !== undefined) {
      address.isDefault = addressData.isDefault;
    }

    if (addressData.label !== undefined) {
      address.label = addressData.label?.trim();
    }

    if (addressData.deliveryInstructions !== undefined) {
      address.deliveryInstructions = addressData.deliveryInstructions?.trim();
    }

    return await this.addressRepository.save(address);
  }

  /**
   * Delete address
   */
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.getAddressById(userId, addressId);
    await this.addressRepository.remove(address);
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    const address = await this.getAddressById(userId, addressId);

    // Clear other default addresses of the same type
    await this.clearDefaultAddresses(userId, address.type);

    // Set this address as default
    address.isDefault = true;
    return await this.addressRepository.save(address);
  }

  /**
   * Get default address for a specific type
   */
  async getDefaultAddress(userId: string, type: AddressType): Promise<Address | null> {
    const address = await this.addressRepository.findOne({
      where: [
        { userId, type, isDefault: true },
        { userId, type: AddressType.BOTH, isDefault: true },
      ],
      order: { createdAt: 'ASC' },
    });

    return address;
  }

  /**
   * Validate user profile data
   */
  validateProfileData(data: UpdateProfileData): void {
    if (data.firstName !== undefined && (!data.firstName || data.firstName.trim().length === 0)) {
      throw new Error('First name cannot be empty');
    }

    if (data.lastName !== undefined && (!data.lastName || data.lastName.trim().length === 0)) {
      throw new Error('Last name cannot be empty');
    }

    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
    }

    if (data.phone !== undefined && data.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
        throw new Error('Invalid phone number format');
      }
    }

    if (data.newPassword !== undefined) {
      if (data.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }
    }
  }

  /**
   * Validate address data
   */
  private validateAddressData(data: AddressData): void {
    const required = ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'postalCode'];
    
    for (const field of required) {
      if (!data[field as keyof AddressData] || 
          String(data[field as keyof AddressData]).trim().length === 0) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate postal code format (basic validation)
    const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
    if (!postalCodeRegex.test(data.postalCode)) {
      throw new Error('Invalid postal code format');
    }

    // Validate phone number if provided
    if (data.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
        throw new Error('Invalid phone number format');
      }
    }
  }

  /**
   * Clear default addresses for a specific type
   */
  private async clearDefaultAddresses(userId: string, type?: AddressType): Promise<void> {
    if (!type) {
      type = AddressType.BOTH;
    }

    const queryBuilder = this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('userId = :userId', { userId });

    if (type === AddressType.BOTH) {
      // Clear all default addresses
      queryBuilder.andWhere('isDefault = true');
    } else {
      // Clear default addresses of the same type or BOTH type
      queryBuilder.andWhere(
        '(type = :type OR type = :both) AND isDefault = true',
        { type, both: AddressType.BOTH }
      );
    }

    await queryBuilder.execute();
  }

  /**
   * Get user statistics (for admin purposes)
   */
  async getUserStatistics(userId: string): Promise<{
    totalAddresses: number;
    defaultShippingAddress: Address | null;
    defaultBillingAddress: Address | null;
    accountAge: number; // in days
    lastUpdated: Date;
  }> {
    const user = await this.getUserProfile(userId);
    const addresses = await this.getUserAddresses(userId);
    
    const defaultShippingAddress = await this.getDefaultAddress(userId, AddressType.SHIPPING);
    const defaultBillingAddress = await this.getDefaultAddress(userId, AddressType.BILLING);
    
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalAddresses: addresses.length,
      defaultShippingAddress,
      defaultBillingAddress,
      accountAge,
      lastUpdated: user.updatedAt,
    };
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    return await this.userRepository.save(user);
  }

  /**
   * Reactivate user account
   */
  async reactivateAccount(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = true;
    return await this.userRepository.save(user);
  }
}