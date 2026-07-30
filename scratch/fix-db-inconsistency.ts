import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Use direct port 5432
process.env.DATABASE_URL = "postgresql://postgres.tfswokhkuxwvpcpxekso:DatabaseniPJ18@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

async function run() {
  const { prisma } = await import('../src/lib/prisma');
  console.log("Starting DB inconsistency repair...");
  
  try {
    // 1. Update purchase_requests
    console.log("Repairing status on purchase_requests...");
    const countPr1 = await prisma.$executeRawUnsafe(
      `UPDATE purchase_requests SET status = 'Under Review'::"PrStatus" WHERE status::text = 'UnderReview'`
    );
    console.log(`Updated ${countPr1} rows on purchase_requests (UnderReview -> Under Review).`);

    const countPr2 = await prisma.$executeRawUnsafe(
      `UPDATE purchase_requests SET status = 'Converted to RFQ'::"PrStatus" WHERE status::text = 'ConvertedToRfq'`
    );
    console.log(`Updated ${countPr2} rows on purchase_requests (ConvertedToRfq -> Converted to RFQ).`);

    const countPr3 = await prisma.$executeRawUnsafe(
      `UPDATE purchase_requests SET status = 'Returned for Revision'::"PrStatus" WHERE status::text = 'ReturnedForRevision'`
    );
    console.log(`Updated ${countPr3} rows on purchase_requests (ReturnedForRevision -> Returned for Revision).`);

    // 2. Update purchase_request_status_history
    console.log("Repairing status on purchase_request_status_history...");
    const countHist1 = await prisma.$executeRawUnsafe(
      `UPDATE purchase_request_status_history SET status = 'Under Review'::"PrStatus" WHERE status::text = 'UnderReview'`
    );
    console.log(`Updated ${countHist1} rows on purchase_request_status_history (UnderReview -> Under Review).`);

    const countHist2 = await prisma.$executeRawUnsafe(
      `UPDATE purchase_request_status_history SET status = 'Converted to RFQ'::"PrStatus" WHERE status::text = 'ConvertedToRfq'`
    );
    console.log(`Updated ${countHist2} rows on purchase_request_status_history (ConvertedToRfq -> Converted to RFQ).`);

    const countHist3 = await prisma.$executeRawUnsafe(
      `UPDATE purchase_request_status_history SET status = 'Returned for Revision'::"PrStatus" WHERE status::text = 'ReturnedForRevision'`
    );
    console.log(`Updated ${countHist3} rows on purchase_request_status_history (ReturnedForRevision -> Returned for Revision).`);

    console.log("Repair completed successfully!");
  } catch (err) {
    console.error("Repair failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
