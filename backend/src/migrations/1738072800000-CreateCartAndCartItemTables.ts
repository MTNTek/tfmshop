import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartAndCartItemTables1738072800000 implements MigrationInterface {
    name = 'CreateCartAndCartItemTables1738072800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create carts table
        await queryRunner.query(`
            CREATE TABLE "carts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "subtotal" numeric(10,2) NOT NULL DEFAULT '0',
                "tax" numeric(10,2) NOT NULL DEFAULT '0',
                "shipping" numeric(10,2) NOT NULL DEFAULT '0',
                "total" numeric(10,2) NOT NULL DEFAULT '0',
                "currency" character varying(3) NOT NULL DEFAULT 'USD',
                "status" character varying(50) NOT NULL DEFAULT 'active',
                "expires_at" TIMESTAMP,
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_carts" PRIMARY KEY ("id")
            )
        `);

        // Create cart_items table
        await queryRunner.query(`
            CREATE TABLE "cart_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "cart_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "quantity" integer NOT NULL DEFAULT 1,
                "unit_price" numeric(10,2) NOT NULL,
                "selected_variant" text,
                "customizations" text,
                "notes" text,
                "added_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cart_items" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "carts" 
            ADD CONSTRAINT "FK_carts_user_id" 
            FOREIGN KEY ("user_id") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            ADD CONSTRAINT "FK_cart_items_cart_id" 
            FOREIGN KEY ("cart_id") 
            REFERENCES "carts"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            ADD CONSTRAINT "FK_cart_items_product_id" 
            FOREIGN KEY ("product_id") 
            REFERENCES "products"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_carts_user_id" ON "carts" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_carts_status" ON "carts" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_cart_items_cart_id" ON "cart_items" ("cart_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_cart_items_product_id" ON "cart_items" ("product_id")`);
        
        // Create composite index for user cart lookup
        await queryRunner.query(`CREATE INDEX "IDX_carts_user_status" ON "carts" ("user_id", "status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_carts_user_status"`);
        await queryRunner.query(`DROP INDEX "IDX_cart_items_product_id"`);
        await queryRunner.query(`DROP INDEX "IDX_cart_items_cart_id"`);
        await queryRunner.query(`DROP INDEX "IDX_carts_status"`);
        await queryRunner.query(`DROP INDEX "IDX_carts_user_id"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_product_id"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_cart_id"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_carts_user_id"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "carts"`);
    }
}
