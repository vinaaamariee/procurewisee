import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function test() {
  console.log("Starting PR query test...");
  try {
    const { prisma } = await import('../src/lib/prisma');
    
    // Try to find the first PR in database
    const firstPr = await prisma.purchaseRequest.findFirst({
      select: { id: true }
    });
    
    if (!firstPr) {
      console.log("No Purchase Requests found in database.");
      return;
    }
    
    const id = firstPr.id;
    console.log(`Querying PR with id: ${id}`);
    
    const [pr, budgetsList] = await Promise.all([
      prisma.purchaseRequest.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
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
      }),
      prisma.departmentBudget.findMany({})
    ]);
    console.log("Queries completed successfully!");
    console.log("PR PRNumber:", pr?.prNumber);
    console.log("Budgets count:", budgetsList.length);
  } catch (err) {
    console.error("Query crash error detail:", err);
  }
}

test();
