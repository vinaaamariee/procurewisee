import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  console.log('Querying raw database rows...');
  try {
    const rawProfiles = await prisma.$queryRaw`SELECT id, username, role FROM user_profiles`;
    console.log('Raw DB User Profiles:', rawProfiles);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
