import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  console.log('Querying triggers...');
  try {
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers;
    `;
    console.log('Triggers:', triggers);

    const functions = await prisma.$queryRaw`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public';
    `;
    console.log('Functions:', functions);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
