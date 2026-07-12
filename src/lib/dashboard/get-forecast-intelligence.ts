import { prisma } from '@/lib/prisma';
import { forecastProductPrice } from '@/lib/forecast/engine';
import { startTimer } from '@/lib/performance-logger';

export async function getForecastingIntelligence() {
  const timer = startTimer('getForecastingIntelligence');

  // Fetch active catalog products
  const products = await prisma.catalogProduct.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      estimatedUnitCost: true,
      productCode: true,
    }
  });

  const summaries = [];
  for (const p of products) {
    const forecast = await forecastProductPrice(p.id).catch(() => null);
    if (forecast && forecast.points.length > 0) {
      const currentPrice = Number(p.estimatedUnitCost);
      const forecastPrice = forecast.points[0].value;
      const changePct = ((forecastPrice - currentPrice) / currentPrice) * 100;
      
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
