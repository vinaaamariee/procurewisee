import { Pool } from "pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  options: "-c search_path=public",
});

async function applyMigration() {
  const client = await pool.connect();
  try {
    console.log("Applying supplier auth migration...");

    // Step 1: Add supplierId column to user_profiles
    const hasSupplierId = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'supplier_id'
      );
    `);

    if (!hasSupplierId.rows[0].exists) {
      await client.query(`ALTER TABLE user_profiles ADD COLUMN supplier_id INTEGER;`);
      console.log("  + Added supplier_id to user_profiles");
    } else {
      console.log("  ~ supplier_id already exists on user_profiles");
    }

    // Step 2: Add unique index on supplier_id (one supplier per user profile)
    const hasIndex = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes
        WHERE indexname = 'idx_user_profiles_supplier_id'
      );
    `);

    if (!hasIndex.rows[0].exists) {
      await client.query(`
        CREATE UNIQUE INDEX idx_user_profiles_supplier_id ON user_profiles(supplier_id) WHERE supplier_id IS NOT NULL;
      `);
      console.log("  + Created unique index on supplier_id");
    } else {
      console.log("  ~ Index idx_user_profiles_supplier_id already exists");
    }

    console.log("Migration complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
