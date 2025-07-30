import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderAndAddressTables1738072900000 implements MigrationInterface {
  name = 'CreateOrderAndAddressTables1738072900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create addresses table
    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" character varying NOT NULL DEFAULT 'both',
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "company" character varying(100),
        "address_line1" character varying(255) NOT NULL,
        "address_line2" character varying(255),
        "city" character varying(100) NOT NULL,
        "state" character varying(100) NOT NULL,
        "postal_code" character varying(20) NOT NULL,
        "country" character varying(100) NOT NULL DEFAULT 'United States',
        "phone" character varying(20),
        "is_default" boolean NOT NULL DEFAULT false,
        "label" character varying(100),
        "delivery_instructions" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_addresses" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_addresses_type" CHECK ("type" IN ('shipping', 'billing', 'both'))
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_number" character varying(50) NOT NULL,
        "user_id" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "subtotal" numeric(10,2) NOT NULL,
        "tax" numeric(10,2) NOT NULL DEFAULT '0',
        "shipping" numeric(10,2) NOT NULL DEFAULT '0',
        "total" numeric(10,2) NOT NULL,
        "shipping_address" jsonb NOT NULL,
        "billing_address" jsonb NOT NULL,
        "payment_method" character varying(50),
        "payment_reference" character varying(100),
        "tracking_number" character varying(100),
        "shipped_at" TIMESTAMP,
        "delivered_at" TIMESTAMP,
        "notes" text,
        "customer_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "CHK_orders_status" CHECK ("status" IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'))
      )
    `);

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "product_title" character varying(255) NOT NULL,
        "product_description" text,
        "product_sku" character varying(100),
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "discount" numeric(10,2) NOT NULL DEFAULT '0',
        "product_image" character varying(500),
        "product_specifications" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "addresses" 
      ADD CONSTRAINT "FK_addresses_user_id" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD CONSTRAINT "FK_orders_user_id" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" 
      ADD CONSTRAINT "FK_order_items_order_id" 
      FOREIGN KEY ("order_id") 
      REFERENCES "orders"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" 
      ADD CONSTRAINT "FK_order_items_product_id" 
      FOREIGN KEY ("product_id") 
      REFERENCES "products"("id") 
      ON DELETE RESTRICT 
      ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_addresses_user_id" ON "addresses" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_addresses_user_default" ON "addresses" ("user_id", "is_default")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_created_at" ON "orders" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_order_number" ON "orders" ("order_number")`);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_product_id" ON "order_items" ("product_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_order_items_product_id"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_order_id"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_order_number"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_addresses_user_default"`);
    await queryRunner.query(`DROP INDEX "IDX_addresses_user_id"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_product_id"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order_id"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_user_id"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_user_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
  }
}