-- AlterEnum
BEGIN;
CREATE TYPE "PpmpStatus_new" AS ENUM ('Draft', 'Submitted', 'Returned', 'Approved', 'Archived');
ALTER TABLE "public"."ppmps" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ppmps" ALTER COLUMN "status" TYPE "PpmpStatus_new" USING ("status"::text::"PpmpStatus_new");
ALTER TYPE "PpmpStatus" RENAME TO "PpmpStatus_old";
ALTER TYPE "PpmpStatus_new" RENAME TO "PpmpStatus";
DROP TYPE "public"."PpmpStatus_old";
ALTER TABLE "ppmps" ALTER COLUMN "status" SET DEFAULT 'Draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PrStatus_new" AS ENUM ('Draft', 'Submitted', 'UnderReview', 'Returned', 'Approved', 'Received', 'Rejected', 'Cancelled');
ALTER TABLE "public"."purchase_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "purchase_requests" ALTER COLUMN "status" TYPE "PrStatus_new" USING ("status"::text::"PrStatus_new");
ALTER TABLE "purchase_request_status_history" ALTER COLUMN "status" TYPE "PrStatus_new" USING ("status"::text::"PrStatus_new");
ALTER TYPE "PrStatus" RENAME TO "PrStatus_old";
ALTER TYPE "PrStatus_new" RENAME TO "PrStatus";
DROP TYPE "public"."PrStatus_old";
ALTER TABLE "purchase_requests" ALTER COLUMN "status" SET DEFAULT 'Draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('Administrator', 'Procurement Officer', 'Administrative Approver', 'Supplier');
ALTER TABLE "user_profiles" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "catalog_products" DROP CONSTRAINT IF EXISTS "catalog_products_preferredSupplierId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "catalog_products_sku_key";

-- AlterTable
ALTER TABLE "catalog_products" 
DROP COLUMN IF EXISTS "brand",
DROP COLUMN IF EXISTS "category",
DROP COLUMN IF EXISTS "latestCanvassedPrice",
DROP COLUMN IF EXISTS "preferredSupplierId",
DROP COLUMN IF EXISTS "sku",
DROP COLUMN IF EXISTS "technicalSpecifications",
DROP COLUMN IF EXISTS "unitOfMeasure",
ADD COLUMN IF NOT EXISTS "brandId" INTEGER,
ADD COLUMN IF NOT EXISTS "categoryId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "productCode" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "unitId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ppmp_items" 
DROP COLUMN IF EXISTS "unit",
ADD COLUMN IF NOT EXISTS "productId" INTEGER,
ADD COLUMN IF NOT EXISTS "unitId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "purchase_request_items" 
DROP COLUMN IF EXISTS "unit",
ADD COLUMN IF NOT EXISTS "unitId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "purchase_requests" 
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "procurementRemarks" TEXT,
ADD COLUMN IF NOT EXISTS "receivedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trackingCode" TEXT;

-- AlterTable
ALTER TABLE "rfq_items" 
DROP COLUMN IF EXISTS "unit",
ADD COLUMN IF NOT EXISTS "unitId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "suppliers" 
ALTER COLUMN "onTimeDeliveryRate" DROP NOT NULL,
ALTER COLUMN "onTimeDeliveryRate" DROP DEFAULT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "supplier_product_prices" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "priceEffectiveDate" TIMESTAMP(3) NOT NULL,
    "priceExpiryDate" TIMESTAMP(3),

    CONSTRAINT "supplier_product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "brands" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_images" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_specifications" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "specificationName" TEXT NOT NULL,
    "specificationValue" TEXT NOT NULL,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_price_history" (
    "id" SERIAL NOT NULL,
    "supplierPriceId" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "units_of_measure" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "abbreviation" VARCHAR(15) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "purchase_request_status_history" (
    "id" SERIAL NOT NULL,
    "purchaseRequestId" INTEGER NOT NULL,
    "status" "PrStatus" NOT NULL,
    "remarks" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_request_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "historical_prices" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "raw_product_name" VARCHAR(255) NOT NULL,
    "supplier_id" INTEGER,
    "supplier_name" VARCHAR(150) NOT NULL,
    "procurement_number" VARCHAR(100) NOT NULL,
    "procurement_date" DATE NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_id" INTEGER,
    "unit" VARCHAR(50) NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "source_month" VARCHAR(20) NOT NULL,
    "source_year" INTEGER NOT NULL,
    "matched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historical_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "supplier_product_prices_supplierId_productId_key" ON "supplier_product_prices"("supplierId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "units_of_measure_name_key" ON "units_of_measure"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "historical_prices_product_id_idx" ON "historical_prices"("product_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "historical_prices_supplier_id_idx" ON "historical_prices"("supplier_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "historical_prices_unit_id_idx" ON "historical_prices"("unit_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "historical_prices_procurement_date_idx" ON "historical_prices"("procurement_date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "historical_prices_procurement_number_raw_product_name_key" ON "historical_prices"("procurement_number", "raw_product_name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "catalog_products_productCode_key" ON "catalog_products"("productCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "purchase_requests_trackingCode_key" ON "purchase_requests"("trackingCode");

-- AddForeignKey
ALTER TABLE "supplier_product_prices" DROP CONSTRAINT IF EXISTS "supplier_product_prices_supplierId_fkey";
ALTER TABLE "supplier_product_prices" ADD CONSTRAINT "supplier_product_prices_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "supplier_product_prices" DROP CONSTRAINT IF EXISTS "supplier_product_prices_productId_fkey";
ALTER TABLE "supplier_product_prices" ADD CONSTRAINT "supplier_product_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "catalog_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rfq_items" DROP CONSTRAINT IF EXISTS "rfq_items_unitId_fkey";
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_images" DROP CONSTRAINT IF EXISTS "product_images_productId_fkey";
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "catalog_products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_specifications" DROP CONSTRAINT IF EXISTS "product_specifications_productId_fkey";
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "catalog_products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_price_history" DROP CONSTRAINT IF EXISTS "product_price_history_supplierPriceId_fkey";
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_supplierPriceId_fkey" FOREIGN KEY ("supplierPriceId") REFERENCES "supplier_product_prices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_products" DROP CONSTRAINT IF EXISTS "catalog_products_categoryId_fkey";
ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "catalog_products" DROP CONSTRAINT IF EXISTS "catalog_products_brandId_fkey";
ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "catalog_products" DROP CONSTRAINT IF EXISTS "catalog_products_unitId_fkey";
ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ppmp_items" DROP CONSTRAINT IF EXISTS "ppmp_items_productId_fkey";
ALTER TABLE "ppmp_items" ADD CONSTRAINT "ppmp_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "catalog_products"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ppmp_items" DROP CONSTRAINT IF EXISTS "ppmp_items_unitId_fkey";
ALTER TABLE "ppmp_items" ADD CONSTRAINT "ppmp_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_request_items" DROP CONSTRAINT IF EXISTS "purchase_request_items_unitId_fkey";
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_request_status_history" DROP CONSTRAINT IF EXISTS "purchase_request_status_history_purchaseRequestId_fkey";
ALTER TABLE "purchase_request_status_history" ADD CONSTRAINT "purchase_request_status_history_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "purchase_requests"("pr_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchase_request_status_history" DROP CONSTRAINT IF EXISTS "purchase_request_status_history_changedById_fkey";
ALTER TABLE "purchase_request_status_history" ADD CONSTRAINT "purchase_request_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "historical_prices" DROP CONSTRAINT IF EXISTS "historical_prices_product_id_fkey";
ALTER TABLE "historical_prices" ADD CONSTRAINT "historical_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "catalog_products"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "historical_prices" DROP CONSTRAINT IF EXISTS "historical_prices_supplier_id_fkey";
ALTER TABLE "historical_prices" ADD CONSTRAINT "historical_prices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "historical_prices" DROP CONSTRAINT IF EXISTS "historical_prices_unit_id_fkey";
ALTER TABLE "historical_prices" ADD CONSTRAINT "historical_prices_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units_of_measure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
