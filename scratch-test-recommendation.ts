import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import { recommendBestSupplier } from './src/lib/recommendation-engine';

async function run() {
  console.log('--- Procurement Catalog Products ---');
  try {
    const products = await prisma.catalogProduct.findMany({
      where: { isActive: true },
      include: {
        supplierPrices: {
          where: { available: true }
        }
      },
      take: 5
    });

    console.log(`Found ${products.length} active products.`);

    for (const p of products) {
      console.log(`\nProduct ID: ${p.id} | Name: "${p.name}"`);
      console.log(`Active quotes: ${p.supplierPrices.length}`);

      const result = await recommendBestSupplier(p.id);
      
      if (!result.topSupplier) {
        console.log('No recommendation available.');
        continue;
      }

      console.log(`ARIMA Trend: ${result.forecastTrend}`);
      console.log('=== Recommended Supplier ===');
      console.log(`Name: ${result.topSupplier.supplier.companyName}`);
      console.log(`Overall Score: ${result.topSupplier.overallScore} / 100`);
      console.log(`Confidence: ${result.topSupplier.confidence}%`);
      console.log(`Price: ₱${result.topSupplier.price.toLocaleString()} | Delivery Days: ${result.topSupplier.deliveryDays}`);
      
      console.log('\n--- Breakdown ---');
      console.log(`Price Score: ${result.topSupplier.individualScores.priceScore} / 100  (Contribution: ${(result.topSupplier.individualScores.priceScore * 0.4).toFixed(1)}/40)`);
      console.log(`Delivery Score: ${result.topSupplier.individualScores.deliveryScore} / 100  (Contribution: ${(result.topSupplier.individualScores.deliveryScore * 0.2).toFixed(1)}/20)`);
      console.log(`Reliability Score: ${result.topSupplier.individualScores.reliabilityScore} / 100  (Contribution: ${(result.topSupplier.individualScores.reliabilityScore * 0.2).toFixed(1)}/20)`);
      console.log(`Compliance Score: ${result.topSupplier.individualScores.complianceScore} / 100  (Contribution: ${(result.topSupplier.individualScores.complianceScore * 0.1).toFixed(1)}/10)`);
      console.log(`Historical Performance Score: ${result.topSupplier.individualScores.historicalPerformanceScore} / 100  (Contribution: ${(result.topSupplier.individualScores.historicalPerformanceScore * 0.1).toFixed(1)}/10)`);

      console.log('\n=== Justification Logs ===');
      console.log(result.topSupplier.reason);

      if (result.rankedSuppliers.length > 1) {
        console.log('\n=== Alternatives Ranked ===');
        result.rankedSuppliers.forEach((alt, idx) => {
          console.log(`#${idx + 1}: ${alt.supplier.companyName} | Score: ${alt.overallScore} | Price: ₱${alt.price}`);
        });
      }
    }
  } catch (e) {
    console.error('Error during recommendation test:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
