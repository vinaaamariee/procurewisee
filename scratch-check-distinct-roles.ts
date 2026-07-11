import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  try {
    const roles = await prisma.$queryRaw`SELECT DISTINCT role FROM user_profiles`;
    console.log('Distinct Roles in DB:', roles);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
