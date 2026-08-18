import { prisma } from '@/lib/prisma';
import { forecastProductPrice } from '@/lib/forecast/engine';
import { startTimer } from '@/lib/performance-logger';

export async function getForecastingIntelligence() {
  const timer = startTimer('getForecastingIntelligence');

  // Find product IDs with at least 6 historical price records
  const historicalGroups = await prisma.historicalPrice.groupBy({
    by: ['productId'],
    where: {
      productId: { not: null },
      product: { isActive: true },
    },
    _count: { id: true },
  });

  const validProductIds = historicalGroups
    .filter((g) => g._count.id >= 6) // MIN_SERIES_LENGTH is 6
    .map((g) => g.productId as number);

  // Fetch only catalog products that have sufficient historical series data
  const products = validProductIds.length === 0 ? [] : await prisma.catalogProduct.findMany({
    where: {
      id: { in: validProductIds },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      productCode: true,
    }
  });

  const summaries = [];
  for (const p of products) {
    const forecast = await forecastProductPrice(p.id).catch(() => null);
    if (forecast && forecast.points.length > 0) {
      const currentPrice = 0;
      const forecastPrice = forecast.points[0].value;
      const changePct = currentPrice > 0 ? ((forecastPrice - currentPrice) / currentPrice) * 100 : 0;
      
      summaries.push({
        id: p.id,
        name: p.name,
        code: p.productCode || `PROD-${p.id}`,
        currentPrice,
        forecastPrice,
        changePct,
        trend: forecast.trend,
      });
    }
  }

  const expectedToIncrease = summaries.filter(s => s.trend === "increasing");
  const expectedToDecrease = summaries.filter(s => s.trend === "decreasing");

  // Savings Logic: (difference * 20 units baseline purchase volume)
  const potentialSavings = summaries.reduce((sum, s) => {
    const diff = Math.abs(s.forecastPrice - s.currentPrice);
    return sum + (diff * 20);
  }, 0);

  timer.end();

  return {
    expectedToIncrease,
    expectedToDecrease,
    potentialSavings,
  };
}
