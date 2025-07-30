import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';

export interface CreateCategoryData {
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

/**
 * Service class for managing category operations
 */
export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  /**
   * Find all categories with optional parent filtering
   */
  async findAll(includeInactive: boolean = false): Promise<Category[]> {
    const where = includeInactive ? {} : { isActive: true };

    return await this.categoryRepository.find({
      where,
      relations: ['parent', 'children'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  /**
   * Find root categories (no parent)
   */
  async findRootCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: {
        parentId: undefined,
        isActive: true,
      },
      relations: ['children'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  /**
   * Find categories by parent ID
   */
  async findByParent(parentId: string): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: {
        parentId,
        isActive: true,
      },
      relations: ['children'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  /**
   * Find a category by ID with relations
   */
  async findById(id: string): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  /**
   * Find a category by slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategoryData): Promise<Category> {
    // Check if slug already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug: data.slug },
    });

    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }

    // If parentId is provided, verify parent exists
    if (data.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    const category = this.categoryRepository.create({
      ...data,
      sortOrder: data.sortOrder || 0,
    });

    return await this.categoryRepository.save(category);
  }

  /**
   * Update an existing category
   */
  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new Error('Category not found');
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: data.slug },
      });

      if (existingCategory) {
        throw new Error('Category with this slug already exists');
      }
    }

    // If parentId is being updated, verify it exists and prevent circular references
    if (data.parentId !== undefined) {
      if (data.parentId) {
        const parent = await this.categoryRepository.findOne({
          where: { id: data.parentId },
        });

        if (!parent) {
          throw new Error('Parent category not found');
        }

        // Prevent setting self as parent
        if (data.parentId === id) {
          throw new Error('Category cannot be its own parent');
        }

        // Prevent circular references by checking if the new parent is a descendant
        const isDescendant = await this.isDescendant(id, data.parentId);
        if (isDescendant) {
          throw new Error('Cannot set a descendant category as parent (circular reference)');
        }
      }
    }

    Object.assign(category, data);
    return await this.categoryRepository.save(category);
  }

  /**
   * Delete a category (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<boolean> {
    // Check if category has children
    const children = await this.categoryRepository.find({
      where: { parentId: id, isActive: true },
    });

    if (children.length > 0) {
      throw new Error('Cannot delete category with active subcategories');
    }

    const result = await this.categoryRepository.update(id, { isActive: false });
    return result.affected === 1;
  }

  /**
   * Hard delete a category
   */
  async hardDelete(id: string): Promise<boolean> {
    // Check if category has children
    const children = await this.categoryRepository.find({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    const result = await this.categoryRepository.delete(id);
    return result.affected === 1;
  }

  /**
   * Get category hierarchy as a tree structure
   */
  async getCategoryTree(): Promise<Category[]> {
    const allCategories = await this.categoryRepository.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });

    return this.buildCategoryTree(allCategories);
  }

  /**
   * Get category breadcrumb path
   */
  async getCategoryPath(id: string): Promise<Category[]> {
    const path: Category[] = [];
    let currentCategory = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    while (currentCategory) {
      path.unshift(currentCategory);
      currentCategory = currentCategory.parent || null;
    }

    return path;
  }

  /**
   * Reorder categories within the same parent
   */
  async reorderCategories(categoryIds: string[]): Promise<void> {
    for (let i = 0; i < categoryIds.length; i++) {
      await this.categoryRepository.update(categoryIds[i], { sortOrder: i });
    }
  }

  /**
   * Check if a category is a descendant of another category
   */
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    const descendant = await this.categoryRepository.findOne({
      where: { id: descendantId },
      relations: ['parent'],
    });

    if (!descendant || !descendant.parent) {
      return false;
    }

    if (descendant.parent.id === ancestorId) {
      return true;
    }

    return await this.isDescendant(ancestorId, descendant.parent.id);
  }

  /**
   * Build category tree from flat array
   */
  private buildCategoryTree(categories: Category[], parentId: string | null = null): Category[] {
    const children = categories.filter(cat => 
      (parentId === null && !cat.parentId) || cat.parentId === parentId
    );

    return children.map(child => {
      const childWithChildren = Object.assign(child, {
        children: this.buildCategoryTree(categories, child.id),
      });
      return childWithChildren;
    });
  }

  /**
   * Search categories by name
   */
  async search(searchTerm: string): Promise<Category[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.isActive = :isActive', { isActive: true })
      .andWhere('LOWER(category.name) LIKE LOWER(:search)', { search: `%${searchTerm}%` })
      .orderBy('category.name', 'ASC')
      .getMany();
  }

  /**
   * Get popular categories (those with most products)
   */
  async getPopularCategories(limit: number = 10): Promise<any[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('products', 'product', 'product.categoryId = category.id')
      .where('category.isActive = :isActive', { isActive: true })
      .andWhere('product.isActive = :productActive', { productActive: true })
      .groupBy('category.id')
      .orderBy('COUNT(product.id)', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
