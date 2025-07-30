import { PasswordUtils } from '../../src/utils/password';

describe('PasswordUtils', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashedPassword = await PasswordUtils.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await PasswordUtils.hashPassword(password);
      const hash2 = await PasswordUtils.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should throw error for empty password', async () => {
      await expect(PasswordUtils.hashPassword('')).rejects.toThrow('Password cannot be empty');
      await expect(PasswordUtils.hashPassword('   ')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for null/undefined password', async () => {
      await expect(PasswordUtils.hashPassword(null as any)).rejects.toThrow('Password cannot be empty');
      await expect(PasswordUtils.hashPassword(undefined as any)).rejects.toThrow('Password cannot be empty');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await PasswordUtils.hashPassword(password);
      
      const isValid = await PasswordUtils.verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await PasswordUtils.hashPassword(password);
      
      const isValid = await PasswordUtils.verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hashedPassword = await PasswordUtils.hashPassword('testPassword123');
      
      const isValid1 = await PasswordUtils.verifyPassword('', hashedPassword);
      const isValid2 = await PasswordUtils.verifyPassword(null as any, hashedPassword);
      const isValid3 = await PasswordUtils.verifyPassword(undefined as any, hashedPassword);
      
      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
      expect(isValid3).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const isValid1 = await PasswordUtils.verifyPassword('password', '');
      const isValid2 = await PasswordUtils.verifyPassword('password', null as any);
      const isValid3 = await PasswordUtils.verifyPassword('password', undefined as any);
      
      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
      expect(isValid3).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const isValid = await PasswordUtils.verifyPassword('password', 'invalid-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      expect(PasswordUtils.validatePasswordStrength('password123')).toBe(true);
      expect(PasswordUtils.validatePasswordStrength('MyPassword1')).toBe(true);
      expect(PasswordUtils.validatePasswordStrength('abcdefgh1')).toBe(true);
    });

    it('should reject passwords that are too short', () => {
      expect(PasswordUtils.validatePasswordStrength('pass1')).toBe(false);
      expect(PasswordUtils.validatePasswordStrength('1234567')).toBe(false);
    });

    it('should reject passwords without letters', () => {
      expect(PasswordUtils.validatePasswordStrength('12345678')).toBe(false);
      expect(PasswordUtils.validatePasswordStrength('!@#$%^&*1')).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(PasswordUtils.validatePasswordStrength('password')).toBe(false);
      expect(PasswordUtils.validatePasswordStrength('MyPassword')).toBe(false);
    });

    it('should reject null/undefined passwords', () => {
      expect(PasswordUtils.validatePasswordStrength(null as any)).toBe(false);
      expect(PasswordUtils.validatePasswordStrength(undefined as any)).toBe(false);
      expect(PasswordUtils.validatePasswordStrength('')).toBe(false);
    });
  });

  describe('generateRandomPassword', () => {
    it('should generate password with default length', () => {
      const password = PasswordUtils.generateRandomPassword();
      expect(password).toBeDefined();
      expect(password.length).toBe(12);
    });

    it('should generate password with custom length', () => {
      const password = PasswordUtils.generateRandomPassword(16);
      expect(password.length).toBe(16);
    });

    it('should generate different passwords each time', () => {
      const password1 = PasswordUtils.generateRandomPassword();
      const password2 = PasswordUtils.generateRandomPassword();
      expect(password1).not.toBe(password2);
    });

    it('should generate passwords with valid characters', () => {
      const password = PasswordUtils.generateRandomPassword(100);
      const validChars = /^[a-zA-Z0-9!@#$%^&*]+$/;
      expect(password).toMatch(validChars);
    });

    it('should handle edge cases', () => {
      const shortPassword = PasswordUtils.generateRandomPassword(1);
      expect(shortPassword.length).toBe(1);
      
      const longPassword = PasswordUtils.generateRandomPassword(50);
      expect(longPassword.length).toBe(50);
    });
  });
});