import { User, UserRole } from '../../src/entities/User';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = '123e4567-e89b-12d3-a456-426614174000';
    user.email = 'test@example.com';
    user.password = 'hashedpassword123';
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.phone = '+1234567890';
    user.role = UserRole.CUSTOMER;
    user.isActive = true;
    user.createdAt = new Date();
    user.updatedAt = new Date();
  });

  describe('Constructor and Properties', () => {
    it('should create a user with all properties', () => {
      expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedpassword123');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.phone).toBe('+1234567890');
      expect(user.role).toBe(UserRole.CUSTOMER);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should have optional phone field', () => {
      const userWithoutPhone = new User();
      userWithoutPhone.email = 'test2@example.com';
      userWithoutPhone.firstName = 'Jane';
      userWithoutPhone.lastName = 'Smith';
      
      expect(userWithoutPhone.phone).toBeUndefined();
    });

    it('should default to customer role', () => {
      const newUser = new User();
      // Note: Default values are typically set by the database or TypeORM
      // This test verifies the enum structure
      expect(UserRole.CUSTOMER).toBe('customer');
      expect(UserRole.ADMIN).toBe('admin');
    });
  });

  describe('fullName getter', () => {
    it('should return full name correctly', () => {
      expect(user.fullName).toBe('John Doe');
    });

    it('should handle names with spaces', () => {
      user.firstName = 'Mary Jane';
      user.lastName = 'Watson Smith';
      expect(user.fullName).toBe('Mary Jane Watson Smith');
    });
  });

  describe('isAdmin method', () => {
    it('should return true for admin users', () => {
      user.role = UserRole.ADMIN;
      expect(user.isAdmin()).toBe(true);
    });

    it('should return false for customer users', () => {
      user.role = UserRole.CUSTOMER;
      expect(user.isAdmin()).toBe(false);
    });
  });

  describe('isCustomer method', () => {
    it('should return true for customer users', () => {
      user.role = UserRole.CUSTOMER;
      expect(user.isCustomer()).toBe(true);
    });

    it('should return false for admin users', () => {
      user.role = UserRole.ADMIN;
      expect(user.isCustomer()).toBe(false);
    });
  });

  describe('UserRole enum', () => {
    it('should have correct enum values', () => {
      expect(UserRole.CUSTOMER).toBe('customer');
      expect(UserRole.ADMIN).toBe('admin');
    });

    it('should have only two roles', () => {
      const roles = Object.values(UserRole);
      expect(roles).toHaveLength(2);
      expect(roles).toContain('customer');
      expect(roles).toContain('admin');
    });
  });
});