import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function run() {
  const result = await prisma.$queryRaw`
    SELECT enumlabel 
    FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE typname = 'UserRole';
  `;
  console.log('Postgres UserRole enum values:', JSON.stringify(result, null, 2));
}

run().then(() => prisma.$disconnect());
