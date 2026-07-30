import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Syncing PostgreSQL PrStatus enum values in Supabase database...');
  
  const valuesToAdd = ['Under Review', 'Converted to RFQ', 'ConvertedToRfq'];

  for (const val of valuesToAdd) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "PrStatus" ADD VALUE IF NOT EXISTS '${val}';`);
      console.log(`Added enum value '${val}' to PrStatus`);
    } catch (err: any) {
      console.log(`Note for '${val}':`, err.message);
    }
  }

  // Verify updated enum values
  const result: any = await prisma.$queryRawUnsafe(`
    SELECT e.enumlabel as enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'PrStatus'
    ORDER BY e.enumsortorder;
  `);
  console.log('Updated PrStatus Enum Values in DB:\n', JSON.stringify(result, null, 2));

  await prisma.$disconnect();
}

main();
