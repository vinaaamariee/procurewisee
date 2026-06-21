import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function run() {
  console.log('Resetting all recommendation approval statuses to "Pending Review"...');
  try {
    const result = await prisma.recommendation.updateMany({
      data: {
        approvalStatus: 'Pending Review',
        reviewedById: null,
      },
    });
    console.log(`Successfully reset ${result.count} recommendations.`);
  } catch (error) {
    console.error('Error resetting recommendations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
