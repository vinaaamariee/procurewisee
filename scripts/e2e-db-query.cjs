const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
const pool = new Pool({ connectionString: process.env.DIRECT_URL });

async function main() {
  try {
    // Check indexes on user_profiles
    const indexes = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'user_profiles' 
      ORDER BY indexname
    `);
    console.log('=== user_profiles indexes ===');
    indexes.rows.forEach(r => console.log(`  ${r.indexname}: ${r.indexdef}`));

    // Check for any partial unique index on supplier_id
    const partialIdx = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'user_profiles' AND indexdef LIKE '%supplier_id%'
    `);
    console.log('\n=== supplier_id indexes ===');
    partialIdx.rows.forEach(r => console.log(`  ${r.indexname}: ${r.indexdef}`));

    // Check for orphaned auth accounts (Supabase auth user without UserProfile)
    // We can't query auth.users directly, but check if any test emails exist
    const testUsers = await pool.query(`
      SELECT id, email, username, role, isActive, supplier_id 
      FROM user_profiles 
      WHERE email LIKE '%test%' OR email LIKE '%e2e%' OR email LIKE '%procurewise.local%'
      ORDER BY email
    `);
    console.log('\n=== Test accounts ===');
    console.table(testUsers.rows);

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
