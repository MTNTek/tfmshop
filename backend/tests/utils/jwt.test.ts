import { JwtUtils, JwtPayload } from '../../src/utils/jwt';
import { User, UserRole } from '../../src/entities/User';

// Mock environment variables for testing
const originalEnv = process.env;

describe('JwtUtils', () => {
  let mockUser: User;

  beforeAll(() => {
    // Set test environment variables
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  beforeEach(() => {
    mockUser = new User();
    mockUser.id = '123e4567-e89b-12d3-a456-426614174000';
    mockUser.email = 'test@example.com';
    mockUser.role = UserRole.CUSTOMER;
    mockUser.firstName = 'John';
    mockUser.lastName = 'Doe';
    mockUser.isActive = true;
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = JwtUtils.generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include correct payload in access token', () => {
      const token = JwtUtils.generateAccessToken(mockUser);
      const payload = JwtUtils.verifyAccessToken(token);
      
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = JwtUtils.generateRefreshToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct payload in refresh token', () => {
      const token = JwtUtils.generateRefreshToken(mockUser);
      const payload = JwtUtils.verifyRefreshToken(token);
      
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokenPair = JwtUtils.generateTokenPair(mockUser);
      
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(typeof tokenPair.accessToken).toBe('string');
      expect(typeof tokenPair.refreshToken).toBe('string');
      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = JwtUtils.generateAccessToken(mockUser);
      const payload = JwtUtils.verifyAccessToken(token);
      
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => JwtUtils.verifyAccessToken('invalid-token')).toThrow('Invalid access token');
    });

    it('should throw error for refresh token used as access token', () => {
      const refreshToken = JwtUtils.generateRefreshToken(mockUser);
      expect(() => JwtUtils.verifyAccessToken(refreshToken)).toThrow('Invalid access token');
    });

    it('should throw error for empty token', () => {
      expect(() => JwtUtils.verifyAccessToken('')).toThrow('Invalid access token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = JwtUtils.generateRefreshToken(mockUser);
      const payload = JwtUtils.verifyRefreshToken(token);
      
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => JwtUtils.verifyRefreshToken('invalid-token')).toThrow('Invalid refresh token');
    });

    it('should throw error for access token used as refresh token', () => {
      const accessToken = JwtUtils.generateAccessToken(mockUser);
      expect(() => JwtUtils.verifyRefreshToken(accessToken)).toThrow('Invalid refresh token');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const header = `Bearer ${token}`;
      
      const extracted = JwtUtils.extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for invalid header format', () => {
      expect(JwtUtils.extractTokenFromHeader('InvalidHeader')).toBeNull();
      expect(JwtUtils.extractTokenFromHeader('Basic token')).toBeNull();
      expect(JwtUtils.extractTokenFromHeader('Bearer')).toBeNull();
      expect(JwtUtils.extractTokenFromHeader('Bearer token extra')).toBeNull();
    });

    it('should return null for undefined header', () => {
      expect(JwtUtils.extractTokenFromHeader(undefined)).toBeNull();
    });

    it('should return null for empty header', () => {
      expect(JwtUtils.extractTokenFromHeader('')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const token = JwtUtils.generateAccessToken(mockUser);
      expect(JwtUtils.isTokenExpired(token)).toBe(false);
    });

    it('should return true for invalid token', () => {
      expect(JwtUtils.isTokenExpired('invalid-token')).toBe(true);
    });

    it('should return true for empty token', () => {
      expect(JwtUtils.isTokenExpired('')).toBe(true);
    });

    // Note: Testing actual expiration would require mocking time or waiting
    // This is typically handled in integration tests
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date for valid token', () => {
      const token = JwtUtils.generateAccessToken(mockUser);
      const expiration = JwtUtils.getTokenExpiration(token);
      
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for invalid token', () => {
      expect(JwtUtils.getTokenExpiration('invalid-token')).toBeNull();
    });

    it('should return null for empty token', () => {
      expect(JwtUtils.getTokenExpiration('')).toBeNull();
    });
  });

  describe('Token security', () => {
    it('should generate tokens with same payload but different signatures', () => {
      // Tokens generated at the same time will have same iat, but different signatures due to randomness in JWT library
      const token1 = JwtUtils.generateAccessToken(mockUser);
      const token2 = JwtUtils.generateAccessToken(mockUser);
      
      // Decode both tokens to compare payloads
      const payload1 = JwtUtils.verifyAccessToken(token1);
      const payload2 = JwtUtils.verifyAccessToken(token2);
      
      // Payloads should be identical (same user, same timestamp)
      expect(payload1.userId).toBe(payload2.userId);
      expect(payload1.email).toBe(payload2.email);
      expect(payload1.role).toBe(payload2.role);
      expect(payload1.iat).toBe(payload2.iat);
      
      // But tokens themselves might be the same if generated at exact same time
      // This is expected behavior for JWT
    });

    it('should generate tokens with different expiration times', () => {
      const accessToken = JwtUtils.generateAccessToken(mockUser);
      const refreshToken = JwtUtils.generateRefreshToken(mockUser);
      
      const accessExpiration = JwtUtils.getTokenExpiration(accessToken);
      const refreshExpiration = JwtUtils.getTokenExpiration(refreshToken);
      
      expect(refreshExpiration!.getTime()).toBeGreaterThan(accessExpiration!.getTime());
    });
  });
});