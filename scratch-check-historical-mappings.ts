import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  try {
    const withProductId = await prisma.historicalPrice.count({
      where: {
        productId: { not: null }
      }
    });
    console.log(`Total historical prices with productId: ${withProductId}`);

    const sampleMapped = await prisma.historicalPrice.findFirst({
      where: {
        productId: { not: null }
      }
    });

    if (sampleMapped) {
      console.log('Sample mapped row:', {
        id: sampleMapped.id,
        productId: sampleMapped.productId,
        rawProductName: sampleMapped.rawProductName,
        supplierId: sampleMapped.supplierId,
        supplierName: sampleMapped.supplierName,
        unitPrice: sampleMapped.unitPrice.toNumber(),
      });
    }

    // Let's see if we can match any supplierName in historical prices with supplier company names
    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        companyName: true
      }
    });
    console.log('\nRegistered Suppliers:');
    suppliers.forEach(s => {
      console.log(`ID: ${s.id} | Name: "${s.companyName}"`);
    });

    const uniqueHistSupplierNames = await prisma.historicalPrice.groupBy({
      by: ['supplierName'],
      where: {
        productId: { not: null }
      }
    });

    console.log('\nUnique supplierNames in historical prices for mapped products:');
    uniqueHistSupplierNames.forEach(uh => {
      const match = suppliers.find(s => s.companyName.toLowerCase().trim() === uh.supplierName.toLowerCase().trim());
      console.log(`Hist SupplierName: "${uh.supplierName}" | Matches active supplier: ${match ? `Yes (ID ${match.id})` : 'No'}`);
    });

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
