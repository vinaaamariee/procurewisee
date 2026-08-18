import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});

const migrations = [
  `DO $$ BEGIN
    CREATE TYPE "PreCanvassStatus" AS ENUM ('Draft', 'SuppliersSelected', 'Sent', 'PartiallyResponded', 'FullyResponded', 'Closed', 'Cancelled');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    CREATE TYPE "PreCanvassResponseStatus" AS ENUM ('Pending', 'Invited', 'Submitted', 'Declined', 'NoResponse');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    ALTER TABLE "catalog_products" ADD COLUMN "remarks" TEXT;
  EXCEPTION WHEN duplicate_column THEN null;
  END $$;`,

  `CREATE TABLE IF NOT EXISTS "pre_canvasses" (
    "pre_canvass_id" SERIAL NOT NULL,
    "preCanvassNumber" VARCHAR(50) NOT NULL,
    "prId" INTEGER NOT NULL,
    "status" "PreCanvassStatus" NOT NULL DEFAULT 'Draft',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "remarks" TEXT,
    CONSTRAINT "pre_canvasses_pkey" PRIMARY KEY ("pre_canvass_id")
  )`,

  `CREATE TABLE IF NOT EXISTS "pre_canvass_suppliers" (
    "id" SERIAL NOT NULL,
    "preCanvassId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "selectedById" TEXT,
    "responseStatus" "PreCanvassResponseStatus" NOT NULL DEFAULT 'Pending',
    "invitedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pre_canvass_suppliers_pkey" PRIMARY KEY ("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "pre_canvass_responses" (
    "id" SERIAL NOT NULL,
    "preCanvassId" INTEGER NOT NULL,
    "preCanvassSupplierId" INTEGER NOT NULL,
    "quotationNumber" VARCHAR(100),
    "quotationDate" DATE,
    "attachment" TEXT,
    "remarks" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pre_canvass_responses_pkey" PRIMARY KEY ("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "pre_canvass_response_items" (
    "id" SERIAL NOT NULL,
    "responseId" INTEGER NOT NULL,
    "prItemId" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "quantityQuoted" INTEGER,
    "quantityAvailable" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "deliveryDays" INTEGER,
    "remarks" TEXT,
    CONSTRAINT "pre_canvass_response_items_pkey" PRIMARY KEY ("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "pre_canvass_abstracts" (
    "pre_canvass_abstract_id" SERIAL NOT NULL,
    "preCanvassId" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedById" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'Draft',
    "remarks" TEXT,
    CONSTRAINT "pre_canvass_abstracts_pkey" PRIMARY KEY ("pre_canvass_abstract_id")
  )`,

  `DO $$ BEGIN
    ALTER TABLE "pre_canvasses" ADD CONSTRAINT "pre_canvasses_preCanvassNumber_key" UNIQUE ("preCanvassNumber");
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    ALTER TABLE "pre_canvasses" ADD CONSTRAINT "pre_canvasses_prId_key" UNIQUE ("prId");
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    ALTER TABLE "pre_canvass_suppliers" ADD CONSTRAINT "pre_canvass_suppliers_preCanvassId_supplierId_key" UNIQUE ("preCanvassId", "supplierId");
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    ALTER TABLE "pre_canvass_responses" ADD CONSTRAINT "pre_canvass_responses_preCanvassSupplierId_key" UNIQUE ("preCanvassSupplierId");
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    ALTER TABLE "pre_canvass_response_items" ADD CONSTRAINT "pre_canvass_response_items_responseId_prItemId_key" UNIQUE ("responseId", "prItemId");
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    ALTER TABLE "pre_canvass_abstracts" ADD CONSTRAINT "pre_canvass_abstracts_preCanvassId_key" UNIQUE ("preCanvassId");
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`,

  `CREATE INDEX IF NOT EXISTS "pre_canvasses_prId_idx" ON "pre_canvasses"("prId")`,
  `CREATE INDEX IF NOT EXISTS "pre_canvasses_status_idx" ON "pre_canvasses"("status")`,
  `CREATE INDEX IF NOT EXISTS "pre_canvasses_createdById_idx" ON "pre_canvasses"("createdById")`,
  `CREATE INDEX IF NOT EXISTS "pre_canvass_suppliers_preCanvassId_idx" ON "pre_canvass_suppliers"("preCanvassId")`,
  `CREATE INDEX IF NOT EXISTS "pre_canvass_suppliers_supplierId_idx" ON "pre_canvass_suppliers"("supplierId")`,
  `CREATE INDEX IF NOT EXISTS "pre_canvass_responses_preCanvassId_idx" ON "pre_canvass_responses"("preCanvassId")`,
  `CREATE INDEX IF NOT EXISTS "pre_canvass_response_items_responseId_idx" ON "pre_canvass_response_items"("responseId")`,
  `CREATE INDEX IF NOT EXISTS "pre_canvass_response_items_prItemId_idx" ON "pre_canvass_response_items"("prItemId")`,
  `CREATE INDEX IF NOT EXISTS "pre_canvass_abstracts_generatedById_idx" ON "pre_canvass_abstracts"("generatedById")`,

  `ALTER TABLE "pre_canvasses" DROP CONSTRAINT IF EXISTS "pre_canvasses_prId_fkey";
   ALTER TABLE "pre_canvasses" ADD CONSTRAINT "pre_canvasses_prId_fkey" FOREIGN KEY ("prId") REFERENCES "purchase_requests"("pr_id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvasses" DROP CONSTRAINT IF EXISTS "pre_canvasses_createdById_fkey";
   ALTER TABLE "pre_canvasses" ADD CONSTRAINT "pre_canvasses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_suppliers" DROP CONSTRAINT IF EXISTS "pre_canvass_suppliers_preCanvassId_fkey";
   ALTER TABLE "pre_canvass_suppliers" ADD CONSTRAINT "pre_canvass_suppliers_preCanvassId_fkey" FOREIGN KEY ("preCanvassId") REFERENCES "pre_canvasses"("pre_canvass_id") ON DELETE CASCADE ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_suppliers" DROP CONSTRAINT IF EXISTS "pre_canvass_suppliers_supplierId_fkey";
   ALTER TABLE "pre_canvass_suppliers" ADD CONSTRAINT "pre_canvass_suppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_suppliers" DROP CONSTRAINT IF EXISTS "pre_canvass_suppliers_selectedById_fkey";
   ALTER TABLE "pre_canvass_suppliers" ADD CONSTRAINT "pre_canvass_suppliers_selectedById_fkey" FOREIGN KEY ("selectedById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_responses" DROP CONSTRAINT IF EXISTS "pre_canvass_responses_preCanvassId_fkey";
   ALTER TABLE "pre_canvass_responses" ADD CONSTRAINT "pre_canvass_responses_preCanvassId_fkey" FOREIGN KEY ("preCanvassId") REFERENCES "pre_canvasses"("pre_canvass_id") ON DELETE CASCADE ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_responses" DROP CONSTRAINT IF EXISTS "pre_canvass_responses_preCanvassSupplierId_fkey";
   ALTER TABLE "pre_canvass_responses" ADD CONSTRAINT "pre_canvass_responses_preCanvassSupplierId_fkey" FOREIGN KEY ("preCanvassSupplierId") REFERENCES "pre_canvass_suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_response_items" DROP CONSTRAINT IF EXISTS "pre_canvass_response_items_responseId_fkey";
   ALTER TABLE "pre_canvass_response_items" ADD CONSTRAINT "pre_canvass_response_items_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "pre_canvass_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_response_items" DROP CONSTRAINT IF EXISTS "pre_canvass_response_items_prItemId_fkey";
   ALTER TABLE "pre_canvass_response_items" ADD CONSTRAINT "pre_canvass_response_items_prItemId_fkey" FOREIGN KEY ("prItemId") REFERENCES "purchase_request_items"("pr_item_id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_abstracts" DROP CONSTRAINT IF EXISTS "pre_canvass_abstracts_preCanvassId_fkey";
   ALTER TABLE "pre_canvass_abstracts" ADD CONSTRAINT "pre_canvass_abstracts_preCanvassId_fkey" FOREIGN KEY ("preCanvassId") REFERENCES "pre_canvasses"("pre_canvass_id") ON DELETE CASCADE ON UPDATE CASCADE`,

  `ALTER TABLE "pre_canvass_abstracts" DROP CONSTRAINT IF EXISTS "pre_canvass_abstracts_generatedById_fkey";
   ALTER TABLE "pre_canvass_abstracts" ADD CONSTRAINT "pre_canvass_abstracts_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
];

async function main() {
  console.log("Applying Pre-Canvass migration...\n");

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    try {
      await pool.query(sql);
      console.log(`  Step ${i + 1}/${migrations.length} applied`);
    } catch (error: any) {
      console.error(`  Step ${i + 1}/${migrations.length} failed:`, error.message);
    }
  }

  console.log("\nMigration complete!");
  await pool.end();
}

main();
