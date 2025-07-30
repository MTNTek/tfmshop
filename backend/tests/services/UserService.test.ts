import { UserService, UpdateProfileData, AddressData } from '../../src/services/UserService';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/entities/User';
import { Address, AddressType } from '../../src/entities/Address';
import { PasswordUtils } from '../../src/utils/password';

describe('UserService', () => {
  let userService: UserService;
  let testUser: User;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    userService = new UserService();

    // Clean up database
    await AppDataSource.getRepository(Address).delete({});
    await AppDataSource.getRepository(User).delete({});

    // Create test user
    const userRepository = AppDataSource.getRepository(User);
    testUser = userRepository.create({
      email: 'test@example.com',
      password: await PasswordUtils.hashPassword('password123'),
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
      role: UserRole.CUSTOMER,
      isActive: true,
    });
    testUser = await userRepository.save(testUser);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('getUserProfile', () => {
    it('should return user profile with addresses', async () => {
      const profile = await userService.getUserProfile(testUser.id);

      expect(profile).toBeDefined();
      expect(profile.id).toBe(testUser.id);
      expect(profile.email).toBe(testUser.email);
      expect(profile.firstName).toBe(testUser.firstName);
      expect(profile.lastName).toBe(testUser.lastName);
      expect(profile.addresses).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(userService.getUserProfile(nonExistentId))
        .rejects.toThrow('User not found');
    });

    it('should throw error for inactive user', async () => {
      // Deactivate user
      testUser.isActive = false;
      await AppDataSource.getRepository(User).save(testUser);

      await expect(userService.getUserProfile(testUser.id))
        .rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update basic profile information', async () => {
      const updateData: UpdateProfileData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '9876543210',
      };

      const updatedUser = await userService.updateProfile(testUser.id, updateData);

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.phone).toBe('9876543210');
    });

    it('should update email if not already taken', async () => {
      const updateData: UpdateProfileData = {
        email: 'newemail@example.com',
      };

      const updatedUser = await userService.updateProfile(testUser.id, updateData);

      expect(updatedUser.email).toBe('newemail@example.com');
    });

    it('should throw error when email is already taken', async () => {
      // Create another user with different email
      const anotherUser = await AppDataSource.getRepository(User).save({
        email: 'another@example.com',
        password: await PasswordUtils.hashPassword('password123'),
        firstName: 'Another',
        lastName: 'User',
        role: UserRole.CUSTOMER,
        isActive: true,
      });

      const updateData: UpdateProfileData = {
        email: 'another@example.com',
      };

      await expect(userService.updateProfile(testUser.id, updateData))
        .rejects.toThrow('Email is already in use');
    });

    it('should change password with correct current password', async () => {
      const updateData: UpdateProfileData = {
        currentPassword: 'password123',
        newPassword: 'newPassword123',
      };

      const updatedUser = await userService.updateProfile(testUser.id, updateData);

      // Verify new password works
      const isNewPasswordValid = await PasswordUtils.verifyPassword(
        'newPassword123',
        updatedUser.password
      );
      expect(isNewPasswordValid).toBe(true);
    });

    it('should throw error with incorrect current password', async () => {
      const updateData: UpdateProfileData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      await expect(userService.updateProfile(testUser.id, updateData))
        .rejects.toThrow('Current password is incorrect');
    });

    it('should throw error when new password is provided without current password', async () => {
      const updateData: UpdateProfileData = {
        newPassword: 'newPassword123',
      };

      await expect(userService.updateProfile(testUser.id, updateData))
        .rejects.toThrow('Current password is required to change password');
    });

    it('should throw error for weak new password', async () => {
      const updateData: UpdateProfileData = {
        currentPassword: 'password123',
        newPassword: '123',
      };

      await expect(userService.updateProfile(testUser.id, updateData))
        .rejects.toThrow('New password must be at least 8 characters long');
    });

    it('should trim whitespace from input fields', async () => {
      const updateData: UpdateProfileData = {
        firstName: '  Trimmed  ',
        lastName: '  Name  ',
        email: '  trimmed@example.com  ',
      };

      const updatedUser = await userService.updateProfile(testUser.id, updateData);

      expect(updatedUser.firstName).toBe('Trimmed');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.email).toBe('trimmed@example.com');
    });

    it('should throw error for empty required fields', async () => {
      const updateData: UpdateProfileData = {
        firstName: '',
      };

      await expect(userService.updateProfile(testUser.id, updateData))
        .rejects.toThrow('First name, last name, and email are required');
    });
  });

  describe('createAddress', () => {
    it('should create new address for user', async () => {
      const addressData: AddressData = {
        type: AddressType.BOTH,
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'United States',
        isDefault: true,
        label: 'Home',
      };

      const address = await userService.createAddress(testUser.id, addressData);

      expect(address).toBeDefined();
      expect(address.userId).toBe(testUser.id);
      expect(address.firstName).toBe('Test');
      expect(address.addressLine1).toBe('123 Test St');
      expect(address.isDefault).toBe(true);
      expect(address.label).toBe('Home');
    });

    it('should set default country to United States if not provided', async () => {
      const addressData: AddressData = {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
      };

      const address = await userService.createAddress(testUser.id, addressData);

      expect(address.country).toBe('United States');
    });

    it('should clear other default addresses when setting new default', async () => {
      // Create first default address
      const firstAddress = await userService.createAddress(testUser.id, {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 First St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });

      // Create second default address
      const secondAddress = await userService.createAddress(testUser.id, {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '456 Second St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });

      // Refresh first address from database
      const refreshedFirstAddress = await AppDataSource.getRepository(Address)
        .findOne({ where: { id: firstAddress.id } });

      expect(refreshedFirstAddress?.isDefault).toBe(false);
      expect(secondAddress.isDefault).toBe(true);
    });

    it('should throw error for invalid address data', async () => {
      const invalidAddressData = {
        firstName: '',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
      } as AddressData;

      await expect(userService.createAddress(testUser.id, invalidAddressData))
        .rejects.toThrow('firstName is required');
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const addressData: AddressData = {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
      };

      await expect(userService.createAddress(nonExistentId, addressData))
        .rejects.toThrow('User not found');
    });
  });

  describe('getUserAddresses', () => {
    let testAddress1: Address;
    let testAddress2: Address;

    beforeEach(async () => {
      testAddress1 = await userService.createAddress(testUser.id, {
        type: AddressType.SHIPPING,
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Shipping St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });

      testAddress2 = await userService.createAddress(testUser.id, {
        type: AddressType.BILLING,
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '456 Billing St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
      });
    });

    it('should return all user addresses', async () => {
      const addresses = await userService.getUserAddresses(testUser.id);

      expect(addresses).toHaveLength(2);
      expect(addresses.some(addr => addr.id === testAddress1.id)).toBe(true);
      expect(addresses.some(addr => addr.id === testAddress2.id)).toBe(true);
    });

    it('should filter addresses by type', async () => {
      const shippingAddresses = await userService.getUserAddresses(testUser.id, {
        type: AddressType.SHIPPING,
      });

      expect(shippingAddresses).toHaveLength(1);
      expect(shippingAddresses[0].type).toBe(AddressType.SHIPPING);
    });

    it('should filter addresses by default status', async () => {
      const defaultAddresses = await userService.getUserAddresses(testUser.id, {
        isDefault: true,
      });

      expect(defaultAddresses).toHaveLength(1);
      expect(defaultAddresses[0].isDefault).toBe(true);
    });

    it('should order addresses with default first', async () => {
      const addresses = await userService.getUserAddresses(testUser.id);

      expect(addresses[0].isDefault).toBe(true);
    });
  });

  describe('updateAddress', () => {
    let testAddress: Address;

    beforeEach(async () => {
      testAddress = await userService.createAddress(testUser.id, {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
      });
    });

    it('should update address fields', async () => {
      const updateData = {
        firstName: 'Updated',
        addressLine1: '456 Updated St',
        label: 'Work',
      };

      const updatedAddress = await userService.updateAddress(
        testUser.id,
        testAddress.id,
        updateData
      );

      expect(updatedAddress.firstName).toBe('Updated');
      expect(updatedAddress.addressLine1).toBe('456 Updated St');
      expect(updatedAddress.label).toBe('Work');
    });

    it('should set address as default and clear others', async () => {
      // Create another default address first
      await userService.createAddress(testUser.id, {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '789 Default St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });

      // Update first address to be default
      const updatedAddress = await userService.updateAddress(
        testUser.id,
        testAddress.id,
        { isDefault: true }
      );

      expect(updatedAddress.isDefault).toBe(true);
    });

    it('should throw error for non-existent address', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(userService.updateAddress(testUser.id, nonExistentId, {}))
        .rejects.toThrow('Address not found');
    });
  });

  describe('deleteAddress', () => {
    let testAddress: Address;

    beforeEach(async () => {
      testAddress = await userService.createAddress(testUser.id, {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
      });
    });

    it('should delete address successfully', async () => {
      await userService.deleteAddress(testUser.id, testAddress.id);

      // Verify address is deleted
      const addresses = await userService.getUserAddresses(testUser.id);
      expect(addresses).toHaveLength(0);
    });

    it('should throw error for non-existent address', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(userService.deleteAddress(testUser.id, nonExistentId))
        .rejects.toThrow('Address not found');
    });
  });

  describe('setDefaultAddress', () => {
    let testAddress1: Address;
    let testAddress2: Address;

    beforeEach(async () => {
      testAddress1 = await userService.createAddress(testUser.id, {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 First St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });

      testAddress2 = await userService.createAddress(testUser.id, {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '456 Second St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
      });
    });

    it('should set address as default and clear others', async () => {
      const updatedAddress = await userService.setDefaultAddress(
        testUser.id,
        testAddress2.id
      );

      expect(updatedAddress.isDefault).toBe(true);

      // Verify first address is no longer default
      const refreshedFirstAddress = await AppDataSource.getRepository(Address)
        .findOne({ where: { id: testAddress1.id } });
      expect(refreshedFirstAddress?.isDefault).toBe(false);
    });
  });

  describe('getDefaultAddress', () => {
    beforeEach(async () => {
      await userService.createAddress(testUser.id, {
        type: AddressType.SHIPPING,
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Shipping St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });

      await userService.createAddress(testUser.id, {
        type: AddressType.BILLING,
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '456 Billing St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });
    });

    it('should return default shipping address', async () => {
      const defaultAddress = await userService.getDefaultAddress(
        testUser.id,
        AddressType.SHIPPING
      );

      expect(defaultAddress).toBeDefined();
      expect(defaultAddress?.type).toBe(AddressType.SHIPPING);
      expect(defaultAddress?.isDefault).toBe(true);
    });

    it('should return default billing address', async () => {
      const defaultAddress = await userService.getDefaultAddress(
        testUser.id,
        AddressType.BILLING
      );

      expect(defaultAddress).toBeDefined();
      expect(defaultAddress?.type).toBe(AddressType.BILLING);
      expect(defaultAddress?.isDefault).toBe(true);
    });

    it('should return null if no default address exists', async () => {
      // Clear all default addresses
      await AppDataSource.getRepository(Address)
        .update({ userId: testUser.id }, { isDefault: false });

      const defaultAddress = await userService.getDefaultAddress(
        testUser.id,
        AddressType.SHIPPING
      );

      expect(defaultAddress).toBeNull();
    });
  });

  describe('getUserStatistics', () => {
    beforeEach(async () => {
      await userService.createAddress(testUser.id, {
        type: AddressType.SHIPPING,
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Shipping St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });

      await userService.createAddress(testUser.id, {
        type: AddressType.BILLING,
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '456 Billing St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        isDefault: true,
      });
    });

    it('should return user statistics', async () => {
      const stats = await userService.getUserStatistics(testUser.id);

      expect(stats.totalAddresses).toBe(2);
      expect(stats.defaultShippingAddress).toBeDefined();
      expect(stats.defaultBillingAddress).toBeDefined();
      expect(stats.accountAge).toBeGreaterThanOrEqual(0);
      expect(stats.lastUpdated).toBeDefined();
    });
  });

  describe('validateProfileData', () => {
    it('should validate profile data successfully', () => {
      const validData: UpdateProfileData = {
        firstName: 'Valid',
        lastName: 'Name',
        email: 'valid@example.com',
        phone: '1234567890',
      };

      expect(() => userService.validateProfileData(validData)).not.toThrow();
    });

    it('should throw error for invalid email', () => {
      const invalidData: UpdateProfileData = {
        email: 'invalid-email',
      };

      expect(() => userService.validateProfileData(invalidData))
        .toThrow('Invalid email format');
    });

    it('should throw error for weak password', () => {
      const invalidData: UpdateProfileData = {
        newPassword: 'weak',
      };

      expect(() => userService.validateProfileData(invalidData))
        .toThrow('Password must be at least 8 characters long');
    });

    it('should throw error for empty required fields', () => {
      const invalidData: UpdateProfileData = {
        firstName: '',
      };

      expect(() => userService.validateProfileData(invalidData))
        .toThrow('First name cannot be empty');
    });
  });

  describe('deactivateAccount', () => {
    it('should deactivate user account', async () => {
      const deactivatedUser = await userService.deactivateAccount(testUser.id);

      expect(deactivatedUser.isActive).toBe(false);
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(userService.deactivateAccount(nonExistentId))
        .rejects.toThrow('User not found');
    });
  });

  describe('reactivateAccount', () => {
    beforeEach(async () => {
      await userService.deactivateAccount(testUser.id);
    });

    it('should reactivate user account', async () => {
      const reactivatedUser = await userService.reactivateAccount(testUser.id);

      expect(reactivatedUser.isActive).toBe(true);
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(userService.reactivateAccount(nonExistentId))
        .rejects.toThrow('User not found');
    });
  });
});