import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function test() {
  console.log("Testing PO drafting page serialization...");
  try {
    const { prisma } = await import('../src/lib/prisma');
    
    // 1. Fetch pos
    const pos = await prisma.purchaseOrder.findMany({
      select: {
        id: true,
        poNumber: true,
        supplierId: true,
        supplier: {
          select: {
            companyName: true
          }
        },
        rfq: {
          select: {
            rfqNumber: true
          }
        },
        totalCost: true,
        status: true,
        createdAt: true,
        deliveryTerms: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // 2. Fetch approved recommendations
    const approvedRecommendations = await prisma.recommendation.findMany({
      where: {
        approvalStatus: "Approved"
      },
      include: {
        supplier: true,
        supplierQuote: true,
        canvas: {
          include: {
            rfq: true
          }
        }
      }
    });

    // Filter pending awards
    const pendingAwards = approvedRecommendations.filter((rec) => {
      return !pos.some(
        (po) => po.supplierId === rec.supplierId && po.rfq?.rfqNumber === rec.canvas.rfq.rfqNumber
      );
    });

    // Try to serialize directly
    try {
      JSON.parse(JSON.stringify(pos));
      JSON.parse(JSON.stringify(pendingAwards));
      console.log("Direct JSON serialization succeeded (standard Node JSON). But Next.js RSC is stricter and throws on Decimal objects.");
    } catch (e) {
      console.log("JSON serialization failed:", e);
    }
  } catch (err) {
    console.error("Query/execution error:", err);
  }
}

test();
