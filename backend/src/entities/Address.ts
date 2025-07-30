import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

/**
 * Address type enumeration
 */
export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
  BOTH = 'both',
}

/**
 * Address entity for storing user addresses
 */
@Entity('addresses')
export class Address extends BaseEntity {
  // User relationship
  @Column({
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Address type
  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.BOTH,
  })
  type: AddressType;

  // Personal information
  @Column({
    type: 'varchar',
    length: 100,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  company?: string;

  // Address details
  @Column({
    type: 'varchar',
    length: 255,
  })
  addressLine1: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLine2?: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  state: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  postalCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    default: 'United States',
  })
  country: string;

  // Contact information
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone?: string;

  // Address preferences
  @Column({
    type: 'boolean',
    default: false,
  })
  isDefault: boolean;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  label?: string; // e.g., "Home", "Work", "Mom's House"

  // Delivery instructions
  @Column({
    type: 'text',
    nullable: true,
  })
  deliveryInstructions?: string;

  /**
   * Get full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Get formatted address for display
   */
  get formattedAddress(): string {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      `${this.city}, ${this.state} ${this.postalCode}`,
      this.country !== 'United States' ? this.country : null,
    ].filter(Boolean);

    return parts.join('\n');
  }

  /**
   * Get single line address
   */
  get singleLineAddress(): string {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.city,
      this.state,
      this.postalCode,
      this.country !== 'United States' ? this.country : null,
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Convert to order address format
   */
  toOrderAddress(): {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  } {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      company: this.company,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      phone: this.phone,
    };
  }

  /**
   * Validate address completeness
   */
  isComplete(): boolean {
    return !!(
      this.firstName &&
      this.lastName &&
      this.addressLine1 &&
      this.city &&
      this.state &&
      this.postalCode &&
      this.country
    );
  }

  /**
   * Check if address can be used for shipping
   */
  canBeUsedForShipping(): boolean {
    return this.type === AddressType.SHIPPING || this.type === AddressType.BOTH;
  }

  /**
   * Check if address can be used for billing
   */
  canBeUsedForBilling(): boolean {
    return this.type === AddressType.BILLING || this.type === AddressType.BOTH;
  }
}