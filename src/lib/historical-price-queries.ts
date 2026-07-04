import { prisma } from "./prisma";

/**
 * Gets the average unit price for a given catalog product.
 */
export async function getAveragePrice(productId: number): Promise<number | null> {
  const agg = await prisma.historicalPrice.aggregate({
    _avg: { unitPrice: true },
    where: { productId }
  });
  return agg._avg.unitPrice ? agg._avg.unitPrice.toNumber() : null;
}

/**
 * Gets the lowest unit price for a given catalog product.
 */
export async function getLowestPrice(productId: number): Promise<number | null> {
  const agg = await prisma.historicalPrice.aggregate({
    _min: { unitPrice: true },
    where: { productId }
  });
  return agg._min.unitPrice ? agg._min.unitPrice.toNumber() : null;
}

/**
 * Gets the highest unit price for a given catalog product.
 */
export async function getHighestPrice(productId: number): Promise<number | null> {
  const agg = await prisma.historicalPrice.aggregate({
    _max: { unitPrice: true },
    where: { productId }
  });
  return agg._max.unitPrice ? agg._max.unitPrice.toNumber() : null;
}

/**
 * Gets the latest unit price for a given catalog product based on procurement date.
 */
export async function getLatestPrice(productId: number): Promise<number | null> {
  const latest = await prisma.historicalPrice.findFirst({
    where: { productId },
    orderBy: { procurementDate: "desc" },
    select: { unitPrice: true }
  });
  return latest ? latest.unitPrice.toNumber() : null;
}

/**
 * Gets the count of distinct suppliers that have provided a given catalog product.
 */
export async function getSupplierCount(productId: number): Promise<number> {
  const suppliers = await prisma.historicalPrice.groupBy({
    by: ["supplierName"],
    where: { productId, supplierName: { not: "" } }
  });
  return suppliers.length;
}

/**
 * Gets the monthly price trend (month, year, average price) chronologically for a given catalog product.
 */
export async function getMonthlyTrend(
  productId: number
): Promise<{ month: string; year: number; averagePrice: number }[]> {
  const trend = await prisma.historicalPrice.groupBy({
    by: ["sourceYear", "sourceMonth"],
    where: { productId },
    _avg: { unitPrice: true }
  });

  const monthsOrder = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  
  return trend
    .map(t => ({
      month: t.sourceMonth,
      year: t.sourceYear,
      averagePrice: t._avg.unitPrice ? t._avg.unitPrice.toNumber() : 0
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthsOrder.indexOf(a.month.toLowerCase()) - monthsOrder.indexOf(b.month.toLowerCase());
    });
}

/**
 * Gets the price variance (highest price - lowest price) for a given catalog product.
 */
export async function getPriceVariance(productId: number): Promise<number | null> {
  const agg = await prisma.historicalPrice.aggregate({
    _min: { unitPrice: true },
    _max: { unitPrice: true },
    where: { productId }
  });
  if (agg._max.unitPrice && agg._min.unitPrice) {
    return agg._max.unitPrice.toNumber() - agg._min.unitPrice.toNumber();
  }
  return null;
}

/**
 * Gets the full price history (date, supplier, price, quantity) for a given catalog product.
 */
export async function getPriceHistory(
  productId: number
): Promise<{ procurementDate: Date; supplierName: string; unitPrice: number; quantity: number }[]> {
  const history = await prisma.historicalPrice.findMany({
    where: { productId },
    orderBy: { procurementDate: "desc" },
    select: {
      procurementDate: true,
      supplierName: true,
      unitPrice: true,
      quantity: true
    }
  });

  return history.map(h => ({
    procurementDate: h.procurementDate,
    supplierName: h.supplierName,
    unitPrice: h.unitPrice.toNumber(),
    quantity: h.quantity
  }));
}

/**
 * Gets the average price per month across all years for a given catalog product.
 */
export async function getMonthlyAverage(
  productId: number
): Promise<{ month: string; averagePrice: number }[]> {
  const monthly = await prisma.historicalPrice.groupBy({
    by: ["sourceMonth"],
    where: { productId },
    _avg: { unitPrice: true }
  });

  const monthsOrder = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  
  return monthly
    .map(m => ({
      month: m.sourceMonth,
      averagePrice: m._avg.unitPrice ? m._avg.unitPrice.toNumber() : 0
    }))
    .sort((a, b) => monthsOrder.indexOf(a.month.toLowerCase()) - monthsOrder.indexOf(b.month.toLowerCase()));
}

/**
 * Gets the average price per year for a given catalog product.
 */
export async function getYearlyAverage(
  productId: number
): Promise<{ year: number; averagePrice: number }[]> {
  const yearly = await prisma.historicalPrice.groupBy({
    by: ["sourceYear"],
    where: { productId },
    _avg: { unitPrice: true },
    orderBy: { sourceYear: "asc" }
  });

  return yearly.map(y => ({
    year: y.sourceYear,
    averagePrice: y._avg.unitPrice ? y._avg.unitPrice.toNumber() : 0
  }));
}
