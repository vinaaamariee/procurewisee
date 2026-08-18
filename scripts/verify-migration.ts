import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});

async function main() {
  // Check if enums exist
  const enums = await pool.query(
    `SELECT typname, enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY typname, enumsortorder`
  );
  console.log("All enums:", enums.rows.filter(r => r.typname.includes('pre') || r.typname.includes('Pre')));
  
  // Check catalog_products for remarks column
  const columns = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'catalog_products' AND column_name = 'remarks'`
  );
  console.log("remarks column exists:", columns.rows.length > 0);

  await pool.end();
}

main();
