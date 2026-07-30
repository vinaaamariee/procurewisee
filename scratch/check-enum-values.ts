import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Inspecting PostgreSQL enum types in Supabase database...');
  try {
    const result: any = await prisma.$queryRawUnsafe(`
      SELECT t.typname as enum_type, e.enumlabel as enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname ILIKE '%PrStatus%' OR t.typname ILIKE '%status%'
      ORDER BY t.typname, e.enumsortorder;
    `);
    console.log('Database Enum Values:\n', JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('Error querying enum values:', err.message);
  }
  await prisma.$disconnect();
}

main();
