import { Address, AddressType } from '../../src/entities/Address';

describe('Address Entity', () => {
  let address: Address;

  beforeEach(() => {
    address = new Address();
    address.id = '123e4567-e89b-12d3-a456-426614174000';
    address.userId = '123e4567-e89b-12d3-a456-426614174001';
    address.type = AddressType.BOTH;
    address.firstName = 'John';
    address.lastName = 'Doe';
    address.company = 'Acme Corp';
    address.addressLine1 = '123 Main St';
    address.addressLine2 = 'Apt 4B';
    address.city = 'Anytown';
    address.state = 'CA';
    address.postalCode = '12345';
    address.country = 'United States';
    address.phone = '555-123-4567';
    address.isDefault = false;
    address.label = 'Home';
    address.deliveryInstructions = 'Leave at front door';
    address.createdAt = new Date();
    address.updatedAt = new Date();
  });

  describe('fullName getter', () => {
    it('should return full name with first and last name', () => {
      address.firstName = 'John';
      address.lastName = 'Doe';
      expect(address.fullName).toBe('John Doe');
    });

    it('should handle empty first name', () => {
      address.firstName = '';
      address.lastName = 'Doe';
      expect(address.fullName).toBe('Doe');
    });

    it('should handle empty last name', () => {
      address.firstName = 'John';
      address.lastName = '';
      expect(address.fullName).toBe('John');
    });

    it('should handle both names empty', () => {
      address.firstName = '';
      address.lastName = '';
      expect(address.fullName).toBe('');
    });

    it('should trim whitespace', () => {
      address.firstName = ' John ';
      address.lastName = ' Doe ';
      expect(address.fullName).toBe('John   Doe');
    });
  });

  describe('formattedAddress getter', () => {
    it('should return formatted multi-line address', () => {
      const expected = '123 Main St\nApt 4B\nAnytown, CA 12345';
      expect(address.formattedAddress).toBe(expected);
    });

    it('should handle missing address line 2', () => {
      address.addressLine2 = undefined;
      const expected = '123 Main St\nAnytown, CA 12345';
      expect(address.formattedAddress).toBe(expected);
    });

    it('should include country when not United States', () => {
      address.country = 'Canada';
      const expected = '123 Main St\nApt 4B\nAnytown, CA 12345\nCanada';
      expect(address.formattedAddress).toBe(expected);
    });

    it('should exclude United States from address', () => {
      address.country = 'United States';
      const expected = '123 Main St\nApt 4B\nAnytown, CA 12345';
      expect(address.formattedAddress).toBe(expected);
    });
  });

  describe('singleLineAddress getter', () => {
    it('should return single line address', () => {
      const expected = '123 Main St, Apt 4B, Anytown, CA, 12345';
      expect(address.singleLineAddress).toBe(expected);
    });

    it('should handle missing address line 2', () => {
      address.addressLine2 = undefined;
      const expected = '123 Main St, Anytown, CA, 12345';
      expect(address.singleLineAddress).toBe(expected);
    });

    it('should include country when not United States', () => {
      address.country = 'Canada';
      const expected = '123 Main St, Apt 4B, Anytown, CA, 12345, Canada';
      expect(address.singleLineAddress).toBe(expected);
    });
  });

  describe('toOrderAddress method', () => {
    it('should convert to order address format', () => {
      const orderAddress = address.toOrderAddress();
      
      expect(orderAddress).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'United States',
        phone: '555-123-4567',
      });
    });

    it('should handle undefined optional fields', () => {
      address.company = undefined;
      address.addressLine2 = undefined;
      address.phone = undefined;
      
      const orderAddress = address.toOrderAddress();
      
      expect(orderAddress).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        company: undefined,
        addressLine1: '123 Main St',
        addressLine2: undefined,
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'United States',
        phone: undefined,
      });
    });
  });

  describe('isComplete method', () => {
    it('should return true for complete address', () => {
      expect(address.isComplete()).toBe(true);
    });

    it('should return false when firstName is missing', () => {
      address.firstName = '';
      expect(address.isComplete()).toBe(false);
    });

    it('should return false when lastName is missing', () => {
      address.lastName = '';
      expect(address.isComplete()).toBe(false);
    });

    it('should return false when addressLine1 is missing', () => {
      address.addressLine1 = '';
      expect(address.isComplete()).toBe(false);
    });

    it('should return false when city is missing', () => {
      address.city = '';
      expect(address.isComplete()).toBe(false);
    });

    it('should return false when state is missing', () => {
      address.state = '';
      expect(address.isComplete()).toBe(false);
    });

    it('should return false when postalCode is missing', () => {
      address.postalCode = '';
      expect(address.isComplete()).toBe(false);
    });

    it('should return false when country is missing', () => {
      address.country = '';
      expect(address.isComplete()).toBe(false);
    });

    it('should return true when optional fields are missing', () => {
      address.company = undefined;
      address.addressLine2 = undefined;
      address.phone = undefined;
      expect(address.isComplete()).toBe(true);
    });
  });

  describe('canBeUsedForShipping method', () => {
    it('should return true for shipping type', () => {
      address.type = AddressType.SHIPPING;
      expect(address.canBeUsedForShipping()).toBe(true);
    });

    it('should return true for both type', () => {
      address.type = AddressType.BOTH;
      expect(address.canBeUsedForShipping()).toBe(true);
    });

    it('should return false for billing type', () => {
      address.type = AddressType.BILLING;
      expect(address.canBeUsedForShipping()).toBe(false);
    });
  });

  describe('canBeUsedForBilling method', () => {
    it('should return true for billing type', () => {
      address.type = AddressType.BILLING;
      expect(address.canBeUsedForBilling()).toBe(true);
    });

    it('should return true for both type', () => {
      address.type = AddressType.BOTH;
      expect(address.canBeUsedForBilling()).toBe(true);
    });

    it('should return false for shipping type', () => {
      address.type = AddressType.SHIPPING;
      expect(address.canBeUsedForBilling()).toBe(false);
    });
  });

  describe('AddressType Enum', () => {
    it('should have correct enum values', () => {
      expect(AddressType.SHIPPING).toBe('shipping');
      expect(AddressType.BILLING).toBe('billing');
      expect(AddressType.BOTH).toBe('both');
    });
  });
});