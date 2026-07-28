import { Pool } from 'pg';

const password = '73NjFynhhv6cbnwj';
const ref = 'tfswokhkuxwvpcpxekso';

const urls = [
  { name: 'Pooler aws-1 (user.ref 6543)', url: `postgresql://postgres.${ref}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres` },
  { name: 'Pooler aws-0 (user.ref 6543)', url: `postgresql://postgres.${ref}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` },
  { name: 'Pooler aws-1 (user 6543)', url: `postgresql://postgres:${password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres` },
  { name: 'Pooler aws-1 (user.ref 5432)', url: `postgresql://postgres.${ref}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres` },
  { name: 'Direct db.ref (user 5432)', url: `postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres` },
  { name: 'Direct db.ref (user.ref 5432)', url: `postgresql://postgres.${ref}:${password}@db.${ref}.supabase.co:5432/postgres` },
];

async function testAll() {
  for (const item of urls) {
    console.log(`\n--- Testing ${item.name} ---`);
    console.log(`URL: ${item.url.replace(/:[^:@]+@/, ':[MASKED]@')}`);
    const pool = new Pool({
      connectionString: item.url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    try {
      const res = await pool.query('SELECT 1 as result');
      console.log(`✅ SUCCESS! Result:`, res.rows);
    } catch (err: any) {
      console.error(`❌ FAILED: ${err.message}`);
    } finally {
      await pool.end().catch(() => {});
    }
  }
}

testAll();
