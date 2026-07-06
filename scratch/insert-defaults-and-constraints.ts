import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Starting defaults insertion and constraint setup...");

  const queries = [
    // 1. Rename PrStatus_old to PrStatus if needed
    `ALTER TYPE "PrStatus_old" RENAME TO "PrStatus"`,

    // 2. Insert defaults (with explicit IDs, we need to handle SERIAL sequences later if needed)
    `INSERT INTO "categories" (id, name, "isActive", "createdAt", "updatedAt") 
     VALUES (1, 'Uncategorized', true, NOW(), NOW()) 
     ON CONFLICT (id) DO NOTHING`,
     
    `INSERT INTO "units_of_measure" (id, name, abbreviation, "isActive", "createdAt", "updatedAt") 
     VALUES (1, 'unit', 'unit', true, NOW(), NOW()) 
     ON CONFLICT (id) DO NOTHING`,

    `INSERT INTO "brands" (id, name, "isActive", "createdAt", "updatedAt") 
     VALUES (1, 'Generic', true, NOW(), NOW()) 
     ON CONFLICT (id) DO NOTHING`,

    // Adjust the serial sequences so new inserts don't conflict with ID 1
    `SELECT setval(pg_get_serial_sequence('categories', 'id'), coalesce(max(id), 1)) FROM "categories"`,
    `SELECT setval(pg_get_serial_sequence('units_of_measure', 'id'), coalesce(max(id), 1)) FROM "units_of_measure"`,
    `SELECT setval(pg_get_serial_sequence('brands', 'id'), coalesce(max(id), 1)) FROM "brands"`,

    // 3. Create purchase_request_status_history
    `CREATE TABLE IF NOT EXISTS "purchase_request_status_history" (
        "id" SERIAL NOT NULL,
        "purchaseRequestId" INTEGER NOT NULL,
        "status" "PrStatus" NOT NULL,
        "remarks" TEXT,
        "changedById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "purchase_request_status_history_pkey" PRIMARY KEY ("id")
    )`,

    // 4. Run foreign key constraints
    `ALTER TABLE "rfq_items" DROP CONSTRAINT IF EXISTS "rfq_items_unitId_fkey"`,
    `ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

    `ALTER TABLE "catalog_products" DROP CONSTRAINT IF EXISTS "catalog_products_categoryId_fkey"`,
    `ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

    `ALTER TABLE "catalog_products" DROP CONSTRAINT IF EXISTS "catalog_products_unitId_fkey"`,
    `ALTER TABLE "catalog_products" ADD CONSTRAINT "catalog_products_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

    `ALTER TABLE "ppmp_items" DROP CONSTRAINT IF EXISTS "ppmp_items_unitId_fkey"`,
    `ALTER TABLE "ppmp_items" ADD CONSTRAINT "ppmp_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

    `ALTER TABLE "purchase_request_items" DROP CONSTRAINT IF EXISTS "purchase_request_items_unitId_fkey"`,
    `ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

    `ALTER TABLE "purchase_request_status_history" DROP CONSTRAINT IF EXISTS "purchase_request_status_history_purchaseRequestId_fkey"`,
    `ALTER TABLE "purchase_request_status_history" ADD CONSTRAINT "purchase_request_status_history_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "purchase_requests"("pr_id") ON DELETE CASCADE ON UPDATE CASCADE`,

    `ALTER TABLE "purchase_request_status_history" DROP CONSTRAINT IF EXISTS "purchase_request_status_history_changedById_fkey"`,
    `ALTER TABLE "purchase_request_status_history" ADD CONSTRAINT "purchase_request_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE`
  ];

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    console.log(`\nExecuting Query ${i + 1}/${queries.length}:`);
    console.log(q.substring(0, 100) + (q.length > 100 ? "..." : ""));
    try {
      await prisma.$executeRawUnsafe(q);
      console.log("-> Success");
    } catch (e: any) {
      console.error("-> Error:", e.message);
    }
  }

  await prisma.$disconnect();
}

main();
