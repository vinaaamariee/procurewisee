import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  console.log('Fetching handle_new_user source code...');
  try {
    const routine: any[] = await prisma.$queryRaw`
      SELECT routine_definition 
      FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user';
    `;
    console.log('Definition:\n', routine[0]?.routine_definition);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
