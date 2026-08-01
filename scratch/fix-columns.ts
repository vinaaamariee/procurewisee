import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function fixDatabaseColumns() {
  console.log("Applying missing SQL columns to PostgreSQL database...");
  const { prisma } = await import('../src/lib/prisma');

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS pr_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS entity_name VARCHAR(150) DEFAULT 'Batanes State College';
      ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS fund_cluster VARCHAR(50) DEFAULT '01101101';
      ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS created_by_id TEXT;
      ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS updated_by_id TEXT;

      ALTER TABLE purchase_request_items ADD COLUMN IF NOT EXISTS item_no INT DEFAULT 1;
      ALTER TABLE purchase_request_items ADD COLUMN IF NOT EXISTS stock_no VARCHAR(50);
      ALTER TABLE purchase_request_items ADD COLUMN IF NOT EXISTS unit_text VARCHAR(50);
      ALTER TABLE purchase_request_items ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12, 2) DEFAULT 0.00;
      ALTER TABLE purchase_request_items ADD COLUMN IF NOT EXISTS office_section VARCHAR(100);
    `);
    console.log("✅ Successfully added missing columns to PostgreSQL!");
  } catch (err) {
    console.error("❌ Failed to add columns:", err);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseColumns();
