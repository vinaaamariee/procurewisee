import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  console.log('Configuring supplier demo credential...');

  // Check if supplier@bsc.edu.ph exists in auth.users or user_profiles
  const authUsers: any = await prisma.$queryRaw`
    SELECT id, email FROM auth.users WHERE email IN ('supplier@bsc.edu.ph', 'carloebalin@gmail.com', 'cardonaangelo29@gmail.com');
  `;
  console.log('Found auth users:', authUsers);

  // Set password123 for carloebalin@gmail.com and cardonaangelo29@gmail.com
  await prisma.$executeRaw`
    UPDATE auth.users 
    SET encrypted_password = crypt('password123', gen_salt('bf', 10)) 
    WHERE email IN ('carloebalin@gmail.com', 'cardonaangelo29@gmail.com');
  `;
  console.log('Updated passwords to password123 for supplier accounts');

  await prisma.$disconnect();
}

run();
