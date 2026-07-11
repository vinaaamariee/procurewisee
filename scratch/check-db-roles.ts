import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function run() {
  const users = await prisma.userProfile.findMany({
    select: {
      username: true,
      role: true,
      email: true,
    }
  });
  console.log('User Profiles in Database:', JSON.stringify(users, null, 2));
}

run().then(() => prisma.$disconnect());
