import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating purchase_orders table schema...');
  const queries = [
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "entityName" VARCHAR(150);`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "modeOfProcurement" VARCHAR(100);`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "placeOfDelivery" VARCHAR(200);`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "dateOfDelivery" TIMESTAMP;`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "fundCluster" VARCHAR(50);`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "orsBursNumber" VARCHAR(50);`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "fundsAvailable" DECIMAL(12,2);`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "dateOfOrsBurs" TIMESTAMP;`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "chiefAccountantName" VARCHAR(100);`,
    `ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "authorizedOfficialName" VARCHAR(100);`,
  ];

  for (const q of queries) {
    try {
      await prisma.$executeRawUnsafe(q);
      console.log('Executed:', q);
    } catch (err: any) {
      console.error('Error executing query:', q, err.message);
    }
  }
  console.log('Migration complete!');
  await prisma.$disconnect();
}

main();
