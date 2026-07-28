import { config } from 'dotenv';
config();

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Testing DB Connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':[MASKED]@') : 'NOT SET');
  try {
    const count = await prisma.supplier.count();
    console.log('SUCCESS! Supplier count:', count);
  } catch (error) {
    console.error('DB TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
