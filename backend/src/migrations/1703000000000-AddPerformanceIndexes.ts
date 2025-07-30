import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add performance indexes for frequently queried columns
 */
export class AddPerformanceIndexes1703000000000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // User table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_is_active" ON "users" ("is_active")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_created_at" ON "users" ("created_at")`);

    // Product table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_category_id" ON "products" ("category_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_is_active" ON "products" ("is_active")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_in_stock" ON "products" ("in_stock")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_price" ON "products" ("price")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_rating" ON "products" ("rating")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_created_at" ON "products" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_published_at" ON "products" ("published_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_slug" ON "products" ("slug")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_sku" ON "products" ("sku")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_brand" ON "products" ("brand")`);
    
    // Full-text search index for product title and description
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_search" ON "products" 
      USING gin(to_tsvector('english', title || ' ' || description))
    `);

    // Composite indexes for common queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_category_active_stock" 
      ON "products" ("category_id", "is_active", "in_stock")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_active_price" 
      ON "products" ("is_active", "price")
    `);

    // Category table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_categories_slug" ON "categories" ("slug")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_categories_is_active" ON "categories" ("is_active")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_categories_parent_id" ON "categories" ("parent_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_categories_sort_order" ON "categories" ("sort_order")`);

    // Order table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_user_id" ON "orders" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_created_at" ON "orders" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_order_number" ON "orders" ("order_number")`);
    
    // Composite index for user orders by status and date
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orders_user_status_date" 
      ON "orders" ("user_id", "status", "created_at")
    `);

    // Cart table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_carts_user_id" ON "carts" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_carts_updated_at" ON "carts" ("updated_at")`);

    // Cart items table indexes (assuming it exists)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cart_items_cart_id" ON "cart_items" ("cart_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cart_items_product_id" ON "cart_items" ("product_id")`);

    // Order items table indexes (assuming it exists)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_order_items_order_id" ON "order_items" ("order_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_order_items_product_id" ON "order_items" ("product_id")`);

    // Address table indexes (if exists)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_addresses_user_id" ON "addresses" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_addresses_is_default" ON "addresses" ("is_default")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes in reverse order
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_addresses_is_default"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_addresses_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cart_items_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cart_items_cart_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_carts_updated_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_carts_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_user_status_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_order_number"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_sort_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_parent_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_slug"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_active_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_category_active_stock"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_search"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_brand"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_sku"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_slug"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_published_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_in_stock"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_category_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
  }
}