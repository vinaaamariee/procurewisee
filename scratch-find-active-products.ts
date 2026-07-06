import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  try {
    const productsWithPrices = await prisma.catalogProduct.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            supplierPrices: true,
            historicalPrices: true,
          }
        }
      }
    });

    console.log('Products with prices count summary:');
    productsWithPrices.forEach(p => {
      if (p._count.supplierPrices > 0 || p._count.historicalPrices > 0) {
        console.log(`Product ID: ${p.id} | Name: "${p.name}" | SupplierPrices: ${p._count.supplierPrices} | HistoricalPrices: ${p._count.historicalPrices}`);
      }
    });

    // Also let's query all SupplierProductPrices
    const sppCount = await prisma.supplierProductPrice.count();
    console.log(`Total SupplierProductPrices in database: ${sppCount}`);

    // Also let's query all HistoricalPrices
    const hpCount = await prisma.historicalPrice.count();
    console.log(`Total HistoricalPrices in database: ${hpCount}`);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
