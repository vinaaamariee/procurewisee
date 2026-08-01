import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Adding reviewed_by_id column and enum values to PostgreSQL database...");
  
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "purchase_requests" ADD COLUMN IF NOT EXISTS "reviewed_by_id" VARCHAR(100);
    `);
    console.log("✓ Added column reviewed_by_id");
  } catch (err: any) {
    console.log("Column reviewed_by_id error (may already exist):", err.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "PrStatus" ADD VALUE IF NOT EXISTS 'Pending Procurement Review';
    `);
    console.log("✓ Added enum value 'Pending Procurement Review'");
  } catch (err: any) {
    console.log("Enum value error (may already exist):", err.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "PrStatus" ADD VALUE IF NOT EXISTS 'Returned';
    `);
    console.log("✓ Added enum value 'Returned'");
  } catch (err: any) {
    console.log("Enum value error (may already exist):", err.message);
  }

  console.log("Migration finished.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
