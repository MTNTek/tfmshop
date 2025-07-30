import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/entities/User';
import { Address, AddressType } from '../../src/entities/Address';
import { JwtUtils } from '../../src/utils/jwt';
import { PasswordUtils } from '../../src/utils/password';
import app from '../../src/app';

describe('User Profile Integration Tests', () => {
  let testUser: User;
  let testAddress: Address;
  let userToken: string;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
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

    // Create test address
    const addressRepository = AppDataSource.getRepository(Address);
    testAddress = addressRepository.create({
      userId: testUser.id,
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
    });
    testAddress = await addressRepository.save(testAddress);

    // Generate auth token
    userToken = JwtUtils.generateAccessToken(testUser);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile with addresses', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.firstName).toBe(testUser.firstName);
      expect(response.body.data.lastName).toBe(testUser.lastName);
      expect(response.body.data.addresses).toHaveLength(1);
      expect(response.body.data.addresses[0].id).toBe(testAddress.id);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update basic profile information', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '9876543210',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name');
      expect(response.body.data.phone).toBe('9876543210');
    });

    it('should update email if not already taken', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'newemail@example.com',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newemail@example.com');
    });

    it('should change password with correct current password', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'NewPassword123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject password change with incorrect current password', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'wrongPassword',
          newPassword: 'NewPassword123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject new password without current password', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          newPassword: 'NewPassword123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          firstName: 'Updated',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('GET /api/users/addresses', () => {
    it('should return user addresses', async () => {
      const response = await request(app)
        .get('/api/users/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(testAddress.id);
      expect(response.body.data[0].addressLine1).toBe('123 Test St');
    });

    it('should filter addresses by type', async () => {
      const response = await request(app)
        .get('/api/users/addresses?type=shipping')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter addresses by default status', async () => {
      const response = await request(app)
        .get('/api/users/addresses?isDefault=true')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isDefault).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users/addresses')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('POST /api/users/addresses', () => {
    it('should create new address', async () => {
      const response = await request(app)
        .post('/api/users/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          type: 'shipping',
          firstName: 'New',
          lastName: 'Address',
          addressLine1: '456 New St',
          city: 'New City',
          state: 'New State',
          postalCode: '54321',
          country: 'United States',
          label: 'Work',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('New');
      expect(response.body.data.addressLine1).toBe('456 New St');
      expect(response.body.data.label).toBe('Work');
    });

    it('should set default country if not provided', async () => {
      const response = await request(app)
        .post('/api/users/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '789 Test Ave',
          city: 'Test City',
          state: 'Test State',
          postalCode: '98765',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.country).toBe('United States');
    });

    it('should reject invalid address data', async () => {
      const response = await request(app)
        .post('/api/users/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: '',
          lastName: 'User',
          addressLine1: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid postal code', async () => {
      const response = await request(app)
        .post('/api/users/addresses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: 'invalid',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/users/addresses')
        .send({
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('GET /api/users/addresses/:addressId', () => {
    it('should return specific address', async () => {
      const response = await request(app)
        .get(`/api/users/addresses/${testAddress.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testAddress.id);
      expect(response.body.data.addressLine1).toBe('123 Test St');
    });

    it('should return 404 for non-existent address', async () => {
      const response = await request(app)
        .get('/api/users/addresses/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ADDRESS_NOT_FOUND');
    });

    it('should return 400 for invalid address ID format', async () => {
      const response = await request(app)
        .get('/api/users/addresses/invalid-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/users/addresses/:addressId', () => {
    it('should update address', async () => {
      const response = await request(app)
        .put(`/api/users/addresses/${testAddress.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
          addressLine1: '456 Updated St',
          label: 'Work',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.addressLine1).toBe('456 Updated St');
      expect(response.body.data.label).toBe('Work');
    });

    it('should return 404 for non-existent address', async () => {
      const response = await request(app)
        .put('/api/users/addresses/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ADDRESS_NOT_FOUND');
    });
  });

  describe('DELETE /api/users/addresses/:addressId', () => {
    it('should delete address', async () => {
      const response = await request(app)
        .delete(`/api/users/addresses/${testAddress.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });

    it('should return 404 for non-existent address', async () => {
      const response = await request(app)
        .delete('/api/users/addresses/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ADDRESS_NOT_FOUND');
    });
  });

  describe('POST /api/users/addresses/:addressId/default', () => {
    let secondAddress: Address;

    beforeEach(async () => {
      // Create second address
      const addressRepository = AppDataSource.getRepository(Address);
      secondAddress = addressRepository.create({
        userId: testUser.id,
        type: AddressType.SHIPPING,
        firstName: 'Second',
        lastName: 'Address',
        addressLine1: '789 Second St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '98765',
        country: 'United States',
        isDefault: false,
      });
      secondAddress = await addressRepository.save(secondAddress);
    });

    it('should set address as default', async () => {
      const response = await request(app)
        .post(`/api/users/addresses/${secondAddress.id}/default`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isDefault).toBe(true);
    });

    it('should return 404 for non-existent address', async () => {
      const response = await request(app)
        .post('/api/users/addresses/123e4567-e89b-12d3-a456-426614174000/default')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ADDRESS_NOT_FOUND');
    });
  });

  describe('GET /api/users/statistics', () => {
    it('should return user statistics', async () => {
      const response = await request(app)
        .get('/api/users/statistics')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAddresses).toBe(1);
      expect(response.body.data.accountAge).toBeGreaterThanOrEqual(0);
      expect(response.body.data.lastUpdated).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users/statistics')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });
});