import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Use direct database URL port 5432
process.env.DATABASE_URL = "postgresql://postgres.tfswokhkuxwvpcpxekso:DatabaseniPJ18@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function check() {
  const { prisma } = await import('../src/lib/prisma');
  try {
    const prs = await prisma.purchaseRequest.findMany({
      select: { id: true, prNumber: true, status: true }
    });
    console.log("Existing PRs status:");
    console.log(prs);
  } catch (err) {
    console.error("Query failed:", err);
  }
}
check();
