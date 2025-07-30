import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Category } from './Category';

/**
 * Product entity representing items for sale
 */
@Entity('products')
export class Product extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 200,
  })
  title: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 250,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  originalPrice?: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  currency: string;

  @Column({
    type: 'int',
    default: 0,
  })
  stockQuantity: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  sku: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  rating: number;

  @Column({
    type: 'int',
    default: 0,
  })
  reviewCount: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  badge?: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  images: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  specifications?: Record<string, any>;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  variants?: Record<string, any>;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  inStock: boolean;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  brand?: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  weight?: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  weightUnit?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  tags?: string[];

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  publishedAt?: Date;

  @Column({
    type: 'int',
    default: 0,
  })
  viewCount: number;

  @Column({
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Category relationship
  @Column({
    type: 'uuid',
  })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // Helper methods
  get isOnSale(): boolean {
    return this.originalPrice ? this.originalPrice > this.price : false;
  }

  get discountPercentage(): number {
    if (!this.originalPrice || this.originalPrice <= this.price) {
      return 0;
    }
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  get mainImage(): string | null {
    return this.images && this.images.length > 0 ? this.images[0] : null;
  }
}
