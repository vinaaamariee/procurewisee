import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  console.log('Querying UserProfiles...');
  try {
    const profiles = await prisma.userProfile.findMany({
      orderBy: { role: 'asc' }
    });
    console.log('Profiles:', profiles.map(p => ({
      id: p.id,
      email: p.email,
      fullName: p.fullName,
      role: p.role,
      isActive: p.isActive
    })));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
