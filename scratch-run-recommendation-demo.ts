import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import { recommendBestSupplier } from './src/lib/recommendation-engine';

async function run() {
  try {
    console.log('--- Finding Product with Active Supplier Prices ---');
    
    // Find products that have active supplier prices
    const products = await prisma.catalogProduct.findMany({
      where: {
        isActive: true,
        supplierPrices: {
          some: {
            available: true
          }
        }
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            supplierPrices: true,
            historicalPrices: true
          }
        }
      },
      take: 5
    });

    if (products.length === 0) {
      console.log('No products with active supplier prices found.');
      return;
    }

    console.log('Active products found:');
    for (const p of products) {
      console.log(`Product ID: ${p.id} | Name: "${p.name}" | SupplierPrices: ${p._count.supplierPrices} | HistoricalPrices: ${p._count.historicalPrices}`);
    }

    const testProductId = products[0].id;
    console.log(`\nExecuting Best-Value Recommendation Engine for Product ID ${testProductId}...`);

    const result = await recommendBestSupplier(testProductId);

    if (!result.topSupplier) {
      console.log('No recommendation generated.');
      return;
    }

    console.log('\n==================================================');
    console.log('🏆 BEST-VALUE RECOMMENDATION ENGINE RESULT');
    console.log('==================================================');
    console.log(`Product ID: ${result.productId}`);
    console.log(`ARIMA Forecast Trend: ${result.forecastTrend}`);
    console.log(`Forecast Expected Change: ${result.expectedChange}`);
    console.log(`Overall Engine Confidence: ${result.confidenceLabel} (${result.confidence}%)`);
    console.log(`Academic Alignment Method: ${result.reason}`);
    
    console.log('\n🥇 TOP RECOMMENDED SUPPLIER:');
    console.log(`Name: ${result.topSupplier.supplier.companyName}`);
    console.log(`MCDM Score: ${result.topSupplier.overallScore} / 100`);
    console.log(`Confidence: ${result.topSupplier.confidenceLabel} (${result.topSupplier.confidence}%)`);
    console.log(`Current Quote Price: ₱${result.topSupplier.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`);
    console.log(`Delivery Lead Time: ${result.topSupplier.deliveryDays} days`);
    
    console.log('\n📊 Criteria Scores Contribution Breakdown:');
    const ts = result.topSupplier;
    console.log(`- Price Score:        ${ts.individualScores.priceScore}/100 (Contribution: ${(ts.individualScores.priceScore * 0.4).toFixed(1)} / 40.0)`);
    console.log(`- Delivery Score:     ${ts.individualScores.deliveryScore}/100 (Contribution: ${(ts.individualScores.deliveryScore * 0.2).toFixed(1)} / 20.0)`);
    console.log(`- Reliability Score:  ${ts.individualScores.reliabilityScore}/100 (Contribution: ${(ts.individualScores.reliabilityScore * 0.2).toFixed(1)} / 20.0)`);
    console.log(`- Compliance Score:   ${ts.individualScores.complianceScore}/100 (Contribution: ${(ts.individualScores.complianceScore * 0.1).toFixed(1)} / 10.0)`);
    console.log(`- Historical Performance: ${ts.individualScores.historicalPerformanceScore}/100 (Contribution: ${(ts.individualScores.historicalPerformanceScore * 0.1).toFixed(1)} / 10.0)`);

    console.log('\n📝 Dynamic Explanations (Justifications):');
    console.log(ts.reason);

    if (result.rankedSuppliers.length > 1) {
      console.log('\n🥈 Alternative Candidates Ranked:');
      result.rankedSuppliers.forEach((alt, index) => {
        console.log(`#${index + 1}: ${alt.supplier.companyName} | MCDM Score: ${alt.overallScore}/100 | Price: ₱${alt.price.toLocaleString()} | Delivery: ${alt.deliveryDays} days`);
      });
    }
    console.log('==================================================');

  } catch (e) {
    console.error('Error executing demo:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
