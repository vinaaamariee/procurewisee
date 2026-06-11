import { Client } from 'pg';
import 'dotenv/config';

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT tgname AS trigger_name, 
             relname AS table_name,
             nspname AS schema_name
      FROM pg_trigger
      JOIN pg_class ON pg_class.oid = tgrelid
      JOIN pg_namespace ON pg_namespace.oid = relnamespace
      WHERE relname = 'users' AND nspname = 'auth';
    `);
    
    console.log("Trigger Diagnostics on auth.users:");
    if (res.rows.length > 0) {
      console.log(res.rows);
    } else {
      console.log("No triggers found on auth.users!");
    }
  } catch (err) {
    console.error("Error querying triggers:", err);
  } finally {
    await client.end();
  }
}

main();
