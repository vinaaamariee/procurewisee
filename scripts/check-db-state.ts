import { Pool } from "pg";
import { config } from "dotenv";
config({ path: ".env" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  options: "-c search_path=public",
});

async function check() {
  const client = await pool.connect();
  try {
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_profiles'
      ORDER BY ordinal_position;
    `);
    console.log("=== user_profiles columns ===");
    for (const r of cols.rows) {
      console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`);
    }

    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'user_profiles';
    `);
    console.log("\n=== user_profiles indexes ===");
    for (const r of indexes.rows) {
      console.log(`  ${r.indexname}: ${r.indexdef}`);
    }

    const catalogCount = await client.query(`SELECT COUNT(*) as count FROM catalog_products;`);
    console.log(`\n=== Catalog Products: ${catalogCount.rows[0].count} ===`);

    const catCount = await client.query(`SELECT COUNT(*) as count FROM categories;`);
    console.log(`=== Categories: ${catCount.rows[0].count} ===`);
    const cats = await client.query(`SELECT id, name FROM categories ORDER BY id;`);
    for (const r of cats.rows) {
      console.log(`  ${r.id}: ${r.name}`);
    }

    const uomCount = await client.query(`SELECT COUNT(*) as count FROM units_of_measure;`);
    console.log(`\n=== Units of Measure: ${uomCount.rows[0].count} ===`);
    const uoms = await client.query(`SELECT id, name, abbreviation FROM units_of_measure ORDER BY id;`);
    for (const r of uoms.rows) {
      console.log(`  ${r.id}: ${r.name} (${r.abbreviation})`);
    }

    const userCount = await client.query(`SELECT COUNT(*) as count FROM user_profiles;`);
    console.log(`\n=== User Profiles: ${userCount.rows[0].count} ===`);

    const hasPrice = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'catalog_products' AND column_name = 'estimated_unit_cost'
      ) as has_price;
    `);
    console.log(`\n=== Catalog has estimated_unit_cost: ${hasPrice.rows[0].has_price} ===`);

    const products = await client.query(`SELECT "productCode", name FROM catalog_products ORDER BY "product_id" LIMIT 20;`);
    console.log(`\n=== Sample Catalog Products (first 20) ===`);
    for (const r of products.rows) {
      console.log(`  ${r.product_code}: ${r.name}`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch((e) => { console.error(e); process.exit(1); });
