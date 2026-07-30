import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

process.env.DATABASE_URL = "postgresql://postgres.tfswokhkuxwvpcpxekso:DatabaseniPJ18@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function check() {
  const { prisma } = await import('../src/lib/prisma');
  try {
    const history = await prisma.purchaseRequestStatusHistory.findMany({
      select: { id: true, purchaseRequestId: true, status: true }
    });
    console.log("Existing status history records:");
    console.log(history);
  } catch (err) {
    console.error("Query failed:", err);
  }
}
check();
