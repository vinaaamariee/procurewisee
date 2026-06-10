import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  console.log('Querying auth.users...');
  try {
    const users = await prisma.$queryRaw`
      SELECT id, email, raw_user_meta_data, created_at
      FROM auth.users;
    `;
    console.log('Auth Users:', users);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
