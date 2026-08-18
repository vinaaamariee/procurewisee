const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
const pool = new Pool({ connectionString: process.env.DIRECT_URL });

async function main() {
  try {
    // Get actual table names
    const tables = await pool.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
    console.log('=== ALL TABLES ===');
    console.log(tables.rows.map(r => r.tablename).join('\n'));

    // Check if estimatedUnitCost exists on catalog_products and what its value is for different products
    const ecc = await pool.query(`SELECT product_id, name, estimated_unit_cost FROM catalog_products WHERE estimated_unit_cost IS NOT NULL AND estimated_unit_cost > 0 ORDER BY product_id LIMIT 5`);
    console.log('\n=== estimatedUnitCost on catalog (non-zero samples) ===');
    console.table(ecc.rows);

    // Check all PK sequences
    const seqs = await pool.query(`SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'`);
    console.log('\n=== SEQUENCES ===');
    console.log(seqs.rows.map(r => r.sequename).join('\n'));

    // Check actual RFQ table name
    const rfqTable = tables.rows.filter(r => r.tablename.includes('rfq') || r.tablename.includes('request') || r.tablename.includes('quote'));
    console.log('\n=== RFQ/Quote related tables ===');
    console.log(rfqTable.map(r => r.tablename));

    // Existing PRs
    const prs = await pool.query(`SELECT id, pr_number, status, purpose, requester_id FROM purchase_requests ORDER BY id DESC LIMIT 5`);
    console.log('\n=== Recent PRs ===');
    console.table(prs.rows);

    // Pre-canvasses
    const pcs = await pool.query(`SELECT pc.id, pc.pre_canvass_number, pc.status, pc.pr_id FROM pre_canvasses pc ORDER BY pc.id DESC LIMIT 5`);
    console.log('\n=== Recent Pre-Canvasses ===');
    console.table(pcs.rows);

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
