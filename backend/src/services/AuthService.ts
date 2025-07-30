import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/User';
import { AppDataSource } from '../config/database';
import { PasswordUtils } from '../utils/password';
import { JwtUtils, TokenPair } from '../utils/jwt';
import crypto from 'crypto';

/**
 * Registration data interface
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  tokens: TokenPair;
}

/**
 * Password reset token interface
 */
export interface PasswordResetToken {
  token: string;
  expiresAt: Date;
}

/**
 * Authentication service handling user registration, login, and token management
 */
export class AuthService {
  private userRepository: Repository<User>;
  private resetTokens: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise<AuthResponse> - Authentication response with user and tokens
   * @throws Error if registration fails
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phone } = userData;

    // Validate input data
    if (!email || !password || !firstName || !lastName) {
      throw new Error('Email, password, first name, and last name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (!PasswordUtils.validatePasswordStrength(password)) {
      throw new Error('Password must be at least 8 characters long and contain at least one letter and one number');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    try {
      // Hash password
      const hashedPassword = await PasswordUtils.hashPassword(password);

      // Create new user
      const user = this.userRepository.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim(),
        role: UserRole.CUSTOMER,
        isActive: true,
      });

      // Save user to database
      const savedUser = await this.userRepository.save(user);

      // Generate tokens
      const tokens = JwtUtils.generateTokenPair(savedUser);

      return {
        user: this.sanitizeUser(savedUser),
        tokens,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error('User with this email already exists');
      }
      throw new Error('Failed to register user');
    }
  }

  /**
   * Authenticate user login
   * @param credentials - Login credentials
   * @returns Promise<AuthResponse> - Authentication response with user and tokens
   * @throws Error if login fails
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const tokens = JwtUtils.generateTokenPair(user);

      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Valid refresh token
   * @returns Promise<TokenPair> - New token pair
   * @throws Error if refresh fails
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      // Verify refresh token
      const payload = JwtUtils.verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await this.userRepository.findOne({
        where: { id: payload.userId, isActive: true },
      });

      if (!user) {
        throw new Error('User not found or inactive');
      }

      // Generate new token pair
      return JwtUtils.generateTokenPair(user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Initiate password reset process
   * @param email - User email
   * @returns Promise<PasswordResetToken> - Reset token information
   * @throws Error if user not found
   */
  async initiatePasswordReset(email: string): Promise<PasswordResetToken> {
    if (!email) {
      throw new Error('Email is required');
    }

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase(), isActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token (in production, this should be stored in database)
    this.resetTokens.set(resetToken, {
      userId: user.id,
      expiresAt,
    });

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    return {
      token: resetToken,
      expiresAt,
    };
  }

  /**
   * Complete password reset with token
   * @param token - Reset token
   * @param newPassword - New password
   * @returns Promise<void>
   * @throws Error if reset fails
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token || !newPassword) {
      throw new Error('Reset token and new password are required');
    }

    // Validate password strength
    if (!PasswordUtils.validatePasswordStrength(newPassword)) {
      throw new Error('Password must be at least 8 characters long and contain at least one letter and one number');
    }

    // Get reset token data
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      this.resetTokens.delete(token);
      throw new Error('Reset token has expired');
    }

    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { id: resetData.userId, isActive: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Hash new password
      const hashedPassword = await PasswordUtils.hashPassword(newPassword);

      // Update user password
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        updatedAt: new Date(),
      });

      // Remove used reset token
      this.resetTokens.delete(token);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password reset failed');
    }
  }

  /**
   * Verify if reset token is valid
   * @param token - Reset token to verify
   * @returns Promise<boolean> - True if token is valid
   */
  async verifyResetToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      return false;
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      this.resetTokens.delete(token);
      return false;
    }

    // Check if user still exists and is active
    const user = await this.userRepository.findOne({
      where: { id: resetData.userId, isActive: true },
    });

    return !!user;
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns Promise<User | null> - User entity or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });
  }

  /**
   * Update user profile
   * @param userId - User ID
   * @param updateData - Data to update
   * @returns Promise<User> - Updated user
   */
  async updateProfile(userId: string, updateData: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update allowed fields
    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName.trim();
    }
    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName.trim();
    }
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone?.trim();
    }

    return await this.userRepository.save(user);
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Promise<void>
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    // Validate new password strength
    if (!PasswordUtils.validatePasswordStrength(newPassword)) {
      throw new Error('New password must be at least 8 characters long and contain at least one letter and one number');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await PasswordUtils.hashPassword(newPassword);

    // Update password
    await this.userRepository.update(userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }

  /**
   * Sanitize user data for response (remove sensitive fields)
   * @param user - User entity
   * @returns Sanitized user object
   */
  private sanitizeUser(user: User) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Clean up expired reset tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of this.resetTokens.entries()) {
      if (now > data.expiresAt) {
        this.resetTokens.delete(token);
      }
    }
  }
}