import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { forecastProductPrice, MIN_SERIES_LENGTH } from "../src/lib/forecast/engine";
import { getHistoricalSeries } from "../src/lib/forecast/time-series";
import { isApproximatelyStationary } from "../src/lib/forecast/stationarity";
import { differenceSeries } from "../src/lib/forecast/differencing";
import { calculateACF, calculatePACF, estimateP, estimateQ } from "../src/lib/forecast/autocorrelation";

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function padRight(s: string, len: number) {
  return s.length >= len ? s : s + " ".repeat(len - s.length);
}

function bar(label: string, value: string) {
  console.log(`   ${padRight(label, 24)} ${value}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║         ProcureWise · ARIMA Forecast Engine Test (4.3)       ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // Pick the product with the most historical price records
  const [topProduct] = await prisma.historicalPrice.groupBy({
    by: ["productId"],
    where: { productId: { not: null } },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 1,
  });

  if (!topProduct?.productId) {
    console.error("❌ No matched historical price records found. Run the importer first.");
    process.exit(1);
  }

  const productId = topProduct.productId!;
  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: { name: true, estimatedUnitCost: true },
  });
  const productName = product?.name ?? `Product #${productId}`;

  console.log(`📦 Selected Product: ${productName} (id=${productId})`);
  console.log(`   DB records      : ${topProduct._count.productId}`);
  console.log();

  // ── 1. Series ───────────────────────────────────────────────────────────────
  const series = await getHistoricalSeries(productId);
  console.log(`─── 1. Historical Series (${series.length} monthly points) ──────────────────`);
  for (const pt of series) {
    const label = pt.date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    console.log(`   ${padRight(label, 12)} ${fmt(pt.value)}`);
  }
  console.log();

  if (series.length < MIN_SERIES_LENGTH) {
    console.warn(`⚠️  Only ${series.length} points — below the minimum of ${MIN_SERIES_LENGTH}. Cannot forecast.`);
    process.exit(0);
  }

  // ── 2. Stationarity ─────────────────────────────────────────────────────────
  const values = series.map((p) => p.value);
  const station = isApproximatelyStationary(series);
  console.log("─── 2. Stationarity Check ──────────────────────────────────────────");
  bar("Stationary?", station.stationary ? "✅ YES" : "❌ NO (will difference)");
  bar("Reason", station.reason);
  console.log();

  // ── 3. Differencing ─────────────────────────────────────────────────────────
  const { values: diffs } = differenceSeries(values);
  const d = station.stationary ? 0 : 1;
  const workingValues = d === 0 ? values : diffs;
  console.log(`─── 3. Differencing (d=${d}) ────────────────────────────────────────────`);
  if (d === 0) {
    console.log("   No differencing needed (series already stationary).");
  } else {
    for (let i = 0; i < diffs.length; i++) {
      const label = series[i + 1].date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const sign = diffs[i] >= 0 ? "+" : "";
      console.log(`   ${padRight(label, 12)} Δ = ${sign}${fmt(diffs[i])}`);
    }
  }
  console.log();

  // ── 4. ACF / PACF → p and q ─────────────────────────────────────────────────
  const lags = Math.min(8, Math.floor(workingValues.length / 2));
  const acf = calculateACF(workingValues, lags);
  const pacf = calculatePACF(workingValues, lags);
  const p = Math.max(1, estimateP(pacf, workingValues.length));
  const q = estimateQ(acf, workingValues.length);

  console.log("─── 4. ACF / PACF ──────────────────────────────────────────────────");
  console.log("   ACF  :", acf.map((v, i) => `lag${i + 1}=${v.toFixed(3)}`).join("  "));
  console.log("   PACF :", pacf.map((v, i) => `lag${i + 1}=${v.toFixed(3)}`).join("  "));
  console.log();
  console.log(`   Estimated p (AR order from PACF) : ${p}`);
  console.log(`   Estimated q (MA order from ACF)  : ${q}`);
  console.log();

  // ── 5. Forecast ─────────────────────────────────────────────────────────────
  console.log("─── 5. Running ARIMA Forecast ──────────────────────────────────────");
  const result = await forecastProductPrice(productId, 3);

  if (!result) {
    console.warn("⚠️  Forecast returned null (insufficient data).");
    process.exit(0);
  }

  console.log(`\n   Model Used   : ${result.modelUsed}`);
  console.log(`   Trend        : ${result.trend === "increasing" ? "↑ Increasing" : result.trend === "decreasing" ? "↓ Decreasing" : "→ Stable"}`);
  console.log(`   Forecasted At: ${result.forecastedAt.toISOString()}\n`);

  console.log("─── 6. Forecast Results (3 months ahead) ───────────────────────────");
  for (let i = 0; i < result.points.length; i++) {
    const pt = result.points[i];
    const label = pt.date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    console.log(`\n   Month ${i + 1}: ${label}`);
    bar("  Point Forecast", fmt(pt.value));
    bar("  95% Lower", fmt(pt.lower));
    bar("  95% Upper", fmt(pt.upper));
    bar("  Confidence Interval", `[${fmt(pt.lower)} — ${fmt(pt.upper)}]`);
  }

  console.log("\n─── 7. Model Summary ───────────────────────────────────────────────");
  const meta = result.metadata as Record<string, unknown>;
  bar("Series Length", `${meta.seriesLength} months`);
  bar("Was Stationary", meta.wasStationary ? "Yes" : "No");
  bar("Differenced", meta.differenced ? "Yes (d=1)" : "No");
  bar("AIC", Number(meta.aic).toFixed(2));
  bar("Residual Variance (σ²)", Number(meta.sigma2).toFixed(4));

  console.log("\n✅ ARIMA engine test completed successfully.\n");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ Test failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
