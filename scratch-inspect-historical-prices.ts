import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  try {
    const records = await prisma.historicalPrice.findMany({
      take: 10
    });
    console.log('Historical Price Rows:');
    records.forEach(r => {
      console.log(`ID: ${r.id} | ProductID: ${r.productId} | SupplierID: ${r.supplierId} | SupplierName: "${r.supplierName}" | UnitPrice: ₱${r.unitPrice}`);
    });

    const withSupplierId = await prisma.historicalPrice.count({
      where: {
        supplierId: { not: null }
      }
    });
    console.log(`Total historical prices with supplierId: ${withSupplierId}`);
    console.log(`Total historical prices in database: ${records.length}`);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
