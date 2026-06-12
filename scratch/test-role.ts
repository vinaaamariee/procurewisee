import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function run() {
  console.log('Querying Postgres user_profiles via raw SQL...');
  try {
    const result = await prisma.$queryRaw`SELECT username, role::text as role_string FROM user_profiles`;
    console.log('Raw SQL query result:', result);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
