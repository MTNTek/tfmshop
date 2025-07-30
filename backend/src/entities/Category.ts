import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Product } from './Product';

/**
 * Category entity for organizing products
 */
@Entity('categories')
export class Category extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  imageUrl?: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Self-referencing relationship for nested categories
  @Column({
    type: 'uuid',
    nullable: true,
  })
  parentId?: string;

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  // Products relationship
  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
