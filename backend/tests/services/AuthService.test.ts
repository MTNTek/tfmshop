import { AuthService, RegisterData, LoginCredentials } from '../../src/services/AuthService';
import { User, UserRole } from '../../src/entities/User';
import { AppDataSource } from '../../src/config/database';
import { PasswordUtils } from '../../src/utils/password';
import { JwtUtils } from '../../src/utils/jwt';

// Mock dependencies
jest.mock('../../src/config/database');
jest.mock('../../src/utils/password');
jest.mock('../../src/utils/jwt');

const mockAppDataSource = AppDataSource as jest.Mocked<typeof AppDataSource>;
const mockPasswordUtils = PasswordUtils as jest.Mocked<typeof PasswordUtils>;
const mockJwtUtils = JwtUtils as jest.Mocked<typeof JwtUtils>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    mockAppDataSource.getRepository = jest.fn().mockReturnValue(mockUserRepository);
    authService = new AuthService();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterData: RegisterData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashed-password';
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: UserRole.CUSTOMER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockPasswordUtils.validatePasswordStrength.mockReturnValue(true);
      mockPasswordUtils.hashPassword.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtUtils.generateTokenPair.mockReturnValue(mockTokens);

      const result = await authService.register(validRegisterData);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPasswordUtils.validatePasswordStrength).toHaveBeenCalledWith('password123');
      expect(mockPasswordUtils.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: UserRole.CUSTOMER,
        isActive: true,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockJwtUtils.generateTokenPair).toHaveBeenCalledWith(mockUser);

      expect(result.user).toEqual(expect.objectContaining({
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      }));
      expect(result.user).not.toHaveProperty('password');
      expect(result.tokens).toBe(mockTokens);
    });

    it('should throw error when required fields are missing', async () => {
      const invalidData = {
        email: '',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(authService.register(invalidData)).rejects.toThrow(
        'Email, password, first name, and last name are required'
      );
    });

    it('should throw error when email format is invalid', async () => {
      const invalidData = {
        ...validRegisterData,
        email: 'invalid-email',
      };

      await expect(authService.register(invalidData)).rejects.toThrow('Invalid email format');
    });

    it('should throw error when password is weak', async () => {
      const invalidData = {
        ...validRegisterData,
        password: 'weak',
      };

      mockPasswordUtils.validatePasswordStrength.mockReturnValue(false);

      await expect(authService.register(invalidData)).rejects.toThrow(
        'Password must be at least 8 characters long and contain at least one letter and one number'
      );
    });

    it('should throw error when user already exists', async () => {
      const existingUser = { id: 'existing-id' } as User;

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockPasswordUtils.validatePasswordStrength.mockReturnValue(true);

      await expect(authService.register(validRegisterData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('login', () => {
    const validCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPasswordUtils.verifyPassword.mockResolvedValue(true);
      mockJwtUtils.generateTokenPair.mockReturnValue(mockTokens);

      const result = await authService.login(validCredentials);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPasswordUtils.verifyPassword).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockJwtUtils.generateTokenPair).toHaveBeenCalledWith(mockUser);

      expect(result.user).toEqual(expect.objectContaining({
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      }));
      expect(result.user).not.toHaveProperty('password');
      expect(result.tokens).toBe(mockTokens);
    });

    it('should throw error when credentials are missing', async () => {
      const invalidCredentials = { email: '', password: 'password123' };

      await expect(authService.login(invalidCredentials)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should throw error when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(validCredentials)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error when user is inactive', async () => {
      const inactiveUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: false,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(authService.login(validCredentials)).rejects.toThrow('Account is deactivated');
    });

    it('should throw error when password is invalid', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        isActive: true,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPasswordUtils.verifyPassword.mockResolvedValue(false);

      await expect(authService.login(validCredentials)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'customer',
      };
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
      } as User;
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockJwtUtils.verifyRefreshToken.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtUtils.generateTokenPair.mockReturnValue(mockTokens);

      const result = await authService.refreshToken(refreshToken);

      expect(mockJwtUtils.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id', isActive: true },
      });
      expect(mockJwtUtils.generateTokenPair).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockTokens);
    });

    it('should throw error when refresh token is missing', async () => {
      await expect(authService.refreshToken('')).rejects.toThrow('Refresh token is required');
    });

    it('should throw error when refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtUtils.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error when user is not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'customer',
      };

      mockJwtUtils.verifyRefreshToken.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('User not found or inactive');
    });
  });

  describe('initiatePasswordReset', () => {
    it('should initiate password reset successfully', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.initiatePasswordReset(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com', isActive: true },
      });
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw error when email is missing', async () => {
      await expect(authService.initiatePasswordReset('')).rejects.toThrow('Email is required');
    });

    it('should throw error when user is not found', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.initiatePasswordReset(email)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'newpassword123';
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
      } as User;

      // First initiate a password reset to create a token
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const resetData = await authService.initiatePasswordReset('test@example.com');

      mockPasswordUtils.validatePasswordStrength.mockReturnValue(true);
      mockPasswordUtils.hashPassword.mockResolvedValue('new-hashed-password');

      await authService.resetPassword(resetData.token, newPassword);

      expect(mockPasswordUtils.validatePasswordStrength).toHaveBeenCalledWith(newPassword);
      expect(mockPasswordUtils.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-id', {
        password: 'new-hashed-password',
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when token or password is missing', async () => {
      await expect(authService.resetPassword('', 'password')).rejects.toThrow(
        'Reset token and new password are required'
      );
      await expect(authService.resetPassword('token', '')).rejects.toThrow(
        'Reset token and new password are required'
      );
    });

    it('should throw error when password is weak', async () => {
      const token = 'valid-token';
      const weakPassword = 'weak';

      mockPasswordUtils.validatePasswordStrength.mockReturnValue(false);

      await expect(authService.resetPassword(token, weakPassword)).rejects.toThrow(
        'Password must be at least 8 characters long and contain at least one letter and one number'
      );
    });

    it('should throw error when token is invalid', async () => {
      const invalidToken = 'invalid-token';
      const newPassword = 'newpassword123';

      mockPasswordUtils.validatePasswordStrength.mockReturnValue(true);

      await expect(authService.resetPassword(invalidToken, newPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });
  });

  describe('verifyResetToken', () => {
    it('should return true for valid token', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const resetData = await authService.initiatePasswordReset('test@example.com');

      const isValid = await authService.verifyResetToken(resetData.token);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const isValid = await authService.verifyResetToken('invalid-token');

      expect(isValid).toBe(false);
    });

    it('should return false for empty token', async () => {
      const isValid = await authService.verifyResetToken('');

      expect(isValid).toBe(false);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.getUserById(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId, isActive: true },
      });
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistent-id';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await authService.getUserById(userId);

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user-id';
      const currentPassword = 'currentpassword123';
      const newPassword = 'newpassword123';
      const mockUser = {
        id: 'user-id',
        password: 'current-hashed-password',
        isActive: true,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPasswordUtils.validatePasswordStrength.mockReturnValue(true);
      mockPasswordUtils.verifyPassword.mockResolvedValue(true);
      mockPasswordUtils.hashPassword.mockResolvedValue('new-hashed-password');

      await authService.changePassword(userId, currentPassword, newPassword);

      expect(mockPasswordUtils.verifyPassword).toHaveBeenCalledWith(currentPassword, 'current-hashed-password');
      expect(mockPasswordUtils.validatePasswordStrength).toHaveBeenCalledWith(newPassword);
      expect(mockPasswordUtils.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        password: 'new-hashed-password',
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when passwords are missing', async () => {
      const userId = 'user-id';

      await expect(authService.changePassword(userId, '', 'newpassword')).rejects.toThrow(
        'Current password and new password are required'
      );
    });

    it('should throw error when new password is weak', async () => {
      const userId = 'user-id';
      const currentPassword = 'currentpassword123';
      const weakPassword = 'weak';

      mockPasswordUtils.validatePasswordStrength.mockReturnValue(false);

      await expect(authService.changePassword(userId, currentPassword, weakPassword)).rejects.toThrow(
        'New password must be at least 8 characters long and contain at least one letter and one number'
      );
    });

    it('should throw error when current password is incorrect', async () => {
      const userId = 'user-id';
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword123';
      const mockUser = {
        id: 'user-id',
        password: 'current-hashed-password',
        isActive: true,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPasswordUtils.validatePasswordStrength.mockReturnValue(true);
      mockPasswordUtils.verifyPassword.mockResolvedValue(false);

      await expect(authService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(
        'Current password is incorrect'
      );
    });
  });
});