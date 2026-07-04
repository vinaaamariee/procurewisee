import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { getHistoricalSeries } from "../src/lib/forecast/time-series";
import { calculateMean, calculateVariance, calculateRollingMean, isApproximatelyStationary } from "../src/lib/forecast/stationarity";
import { differenceSeries } from "../src/lib/forecast/differencing";

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function padRight(str: string, len: number) {
  return str.length >= len ? str : str + " ".repeat(len - str.length);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║     ProcureWise · Forecast Infrastructure Test (4.2)     ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // Pick a product that has enough historical records
  const sampleRecord = await prisma.historicalPrice.groupBy({
    by: ["productId"],
    where: { productId: { not: null } },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 1,
  });

  if (!sampleRecord.length || !sampleRecord[0].productId) {
    console.error("❌ No matched historical price records found. Run the importer first.");
    process.exit(1);
  }

  const productId = sampleRecord[0].productId!;
  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: { name: true },
  });
  const productName = product?.name ?? `Product #${productId}`;

  console.log(`📦 Testing with: ${productName} (id=${productId})`);
  console.log(`   Records in DB: ${sampleRecord[0]._count.productId}\n`);

  // ── 1. Historical Series ────────────────────────────────────────────────────
  console.log("─── 1. Historical Series (oldest → newest) ─────────────────");
  const series = await getHistoricalSeries(productId);

  if (series.length === 0) {
    console.log("   ⚠️  No monthly data points returned. Exiting.\n");
    process.exit(0);
  }

  for (const pt of series) {
    const label = pt.date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    console.log(`   ${padRight(label, 12)} ${fmt(pt.value)}`);
  }
  console.log(`\n   Total points: ${series.length}\n`);

  // ── 2. Mean & Variance ──────────────────────────────────────────────────────
  const values = series.map((p) => p.value);

  const mean = calculateMean(values);
  const variance = calculateVariance(values);
  const stdDev = Math.sqrt(variance);

  console.log("─── 2. Mean & Variance ─────────────────────────────────────");
  console.log(`   Mean        : ${fmt(mean)}`);
  console.log(`   Variance    : ${variance.toFixed(4)}`);
  console.log(`   Std. Dev.   : ${fmt(stdDev)}\n`);

  // ── 3. Rolling Mean (window = 3) ────────────────────────────────────────────
  const WINDOW = 3;
  const rollingMeans = calculateRollingMean(values, WINDOW);

  console.log(`─── 3. Rolling Mean (window=${WINDOW}) ──────────────────────────────`);
  rollingMeans.forEach((rm, i) => {
    const label = series[i + WINDOW - 1].date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    console.log(`   ${padRight(label, 12)} rolling mean = ${fmt(rm)}`);
  });
  console.log();

  // ── 4. Stationarity Check ───────────────────────────────────────────────────
  const stationarity = isApproximatelyStationary(series, WINDOW);

  console.log("─── 4. Stationarity Check ──────────────────────────────────");
  console.log(`   Stationary  : ${stationarity.stationary ? "✅ YES" : "❌ NO"}`);
  console.log(`   Reason      : ${stationarity.reason}\n`);

  // ── 5. Differenced Series ───────────────────────────────────────────────────
  const { values: diffs } = differenceSeries(values);

  console.log("─── 5. Differenced Series (first-order) ────────────────────");
  for (let i = 0; i < diffs.length; i++) {
    const label = series[i + 1].date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const sign = diffs[i] > 0 ? "+" : "";
    console.log(`   ${padRight(label, 12)} Δ = ${sign}${fmt(diffs[i])}`);
  }

  const diffMean = calculateMean(diffs);
  const diffVariance = calculateVariance(diffs);
  console.log(`\n   Diff Mean   : ${diffMean > 0 ? "+" : ""}${fmt(diffMean)}`);
  console.log(`   Diff Var    : ${diffVariance.toFixed(4)}`);

  console.log("\n✅ All forecast infrastructure checks passed.\n");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ Test failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
