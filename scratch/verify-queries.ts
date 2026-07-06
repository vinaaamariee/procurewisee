import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  getAveragePrice,
  getLowestPrice,
  getHighestPrice,
  getLatestPrice,
  getSupplierCount,
  getMonthlyTrend,
  getPriceVariance,
  getPriceHistory,
  getMonthlyAverage,
  getYearlyAverage
} from "../src/lib/historical-price-queries";

async function main() {
  console.log("🔍 Verifying Historical Price Queries...\n");

  // Fetch a random productId that has historical prices
  const sampleRecord = await prisma.historicalPrice.findFirst({
    where: { productId: { not: null } },
    select: { productId: true }
  });

  if (!sampleRecord || !sampleRecord.productId) {
    console.warn("⚠️ No historical price records with a matched productId found. Seeding a temp record...");
    // Let's seed a temp record to test queries
    await prisma.historicalPrice.create({
      data: {
        productId: 1,
        rawProductName: "Test Product",
        supplierName: "Test Supplier",
        procurementNumber: "TEST-PR-001",
        procurementDate: new Date("2026-06-01"),
        quantity: 10,
        unit: "pcs",
        unitPrice: 150.00,
        totalPrice: 1500.00,
        sourceMonth: "June",
        sourceYear: 2026,
      }
    });
  }

  const productId = sampleRecord?.productId || 1;
  console.log(`🎯 Testing queries for Product ID: ${productId}\n`);

  try {
    const avg = await getAveragePrice(productId);
    console.log(`1. getAveragePrice:`, avg);

    const lowest = await getLowestPrice(productId);
    console.log(`2. getLowestPrice:`, lowest);

    const highest = await getHighestPrice(productId);
    console.log(`3. getHighestPrice:`, highest);

    const latest = await getLatestPrice(productId);
    console.log(`4. getLatestPrice:`, latest);

    const suppliersCount = await getSupplierCount(productId);
    console.log(`5. getSupplierCount:`, suppliersCount);

    const monthlyTrend = await getMonthlyTrend(productId);
    console.log(`6. getMonthlyTrend (length: ${monthlyTrend.length}):`, monthlyTrend.slice(0, 3));

    const variance = await getPriceVariance(productId);
    console.log(`7. getPriceVariance:`, variance);

    const history = await getPriceHistory(productId);
    console.log(`8. getPriceHistory (length: ${history.length}):`, history.slice(0, 3));

    const monthlyAvg = await getMonthlyAverage(productId);
    console.log(`9. getMonthlyAverage (length: ${monthlyAvg.length}):`, monthlyAvg.slice(0, 3));

    const yearlyAvg = await getYearlyAverage(productId);
    console.log(`10. getYearlyAverage (length: ${yearlyAvg.length}):`, yearlyAvg);

    console.log("\n✅ All 10 queries executed successfully!");
  } catch (error) {
    console.error("❌ One or more queries failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
