import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function test() {
  console.log("Testing complete serialization and mapping...");
  try {
    const { prisma } = await import('../src/lib/prisma');
    
    // Find PR 1
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: 1 },
      include: {
        items: {
          include: {
            product: true,
            unit: true
          }
        },
        ppmp: true,
        requestedBy: true,
        assignedOfficer: true,
        statusHistory: {
          include: {
            changedBy: true
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });
    
    if (!pr) {
      console.log("PR 1 not found");
      return;
    }
    
    const serializedPr = {
      ...pr,
      estimatedBudget: pr.estimatedBudget ? Number(pr.estimatedBudget) : null,
      totalCost: pr.totalCost ? Number(pr.totalCost) : 0,
      items: pr.items.map(item => ({
        ...item,
        estimatedUnitCost: Number(item.estimatedUnitCost),
        estimatedCost: Number(item.estimatedCost),
        unit: item.unit?.abbreviation || 'pcs'
      })),
      requestDate: pr.requestDate.toISOString(),
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
      statusHistory: pr.statusHistory?.map(sh => ({
        ...sh,
        createdAt: sh.createdAt.toISOString()
      }))
    };
    
    console.log("Success! Serialized and mapped PR perfectly.");
    console.log("First item:", JSON.stringify(serializedPr.items[0], null, 2));
  } catch (err) {
    console.error("Mapping failed:", err);
  }
}

test();
