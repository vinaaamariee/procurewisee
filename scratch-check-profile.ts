import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  console.log('Querying user_profiles...');
  try {
    const profiles = await prisma.userProfile.findMany();
    console.log('User Profiles:', profiles);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
