import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsAndCategories1706712345678 implements MigrationInterface {
    name = 'CreateProductsAndCategories1706712345678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create categories table
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "slug" character varying(150) NOT NULL,
                "image_url" character varying(500),
                "is_active" boolean NOT NULL DEFAULT true,
                "sort_order" integer NOT NULL DEFAULT '0',
                "parent_id" uuid,
                CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_categories_id" PRIMARY KEY ("id")
            )
        `);

        // Create products table
        await queryRunner.query(`
            CREATE TABLE "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "title" character varying(200) NOT NULL,
                "description" text NOT NULL,
                "slug" character varying(250) NOT NULL,
                "price" numeric(10,2) NOT NULL,
                "original_price" numeric(10,2),
                "currency" character varying(10),
                "stock_quantity" integer NOT NULL DEFAULT '0',
                "sku" character varying(50),
                "rating" numeric(3,2) NOT NULL DEFAULT '0',
                "review_count" integer NOT NULL DEFAULT '0',
                "badge" character varying(50),
                "images" text,
                "specifications" jsonb,
                "variants" jsonb,
                "is_active" boolean NOT NULL DEFAULT true,
                "in_stock" boolean NOT NULL DEFAULT true,
                "brand" character varying(100),
                "weight" numeric(5,2),
                "weight_unit" character varying(50),
                "dimensions" jsonb,
                "tags" text,
                "published_at" TIMESTAMP,
                "view_count" integer NOT NULL DEFAULT '0',
                "sort_order" integer NOT NULL DEFAULT '0',
                "category_id" uuid NOT NULL,
                CONSTRAINT "UQ_products_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "categories" 
            ADD CONSTRAINT "FK_categories_parent_id" 
            FOREIGN KEY ("parent_id") 
            REFERENCES "categories"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "products" 
            ADD CONSTRAINT "FK_products_category_id" 
            FOREIGN KEY ("category_id") 
            REFERENCES "categories"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active")`);
        await queryRunner.query(`CREATE INDEX "IDX_categories_sort_order" ON "categories" ("sort_order")`);
        
        await queryRunner.query(`CREATE INDEX "IDX_products_category_id" ON "products" ("category_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_is_active" ON "products" ("is_active")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_in_stock" ON "products" ("in_stock")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_price" ON "products" ("price")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_rating" ON "products" ("rating")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_brand" ON "products" ("brand")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_published_at" ON "products" ("published_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_view_count" ON "products" ("view_count")`);
        
        // Full-text search indexes
        await queryRunner.query(`CREATE INDEX "IDX_products_search" ON "products" USING gin(to_tsvector('english', title || ' ' || description))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_products_search"`);
        await queryRunner.query(`DROP INDEX "IDX_products_view_count"`);
        await queryRunner.query(`DROP INDEX "IDX_products_published_at"`);
        await queryRunner.query(`DROP INDEX "IDX_products_brand"`);
        await queryRunner.query(`DROP INDEX "IDX_products_rating"`);
        await queryRunner.query(`DROP INDEX "IDX_products_price"`);
        await queryRunner.query(`DROP INDEX "IDX_products_in_stock"`);
        await queryRunner.query(`DROP INDEX "IDX_products_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_products_category_id"`);
        
        await queryRunner.query(`DROP INDEX "IDX_categories_sort_order"`);
        await queryRunner.query(`DROP INDEX "IDX_categories_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_categories_parent_id"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_category_id"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_parent_id"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }
}
