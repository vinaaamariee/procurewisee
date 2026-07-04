import { prisma } from "../prisma";
import type { HistoricalPoint } from "./forecast-types";

const MONTHS_ORDER = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Converts a sourceMonth string (e.g. "January") and sourceYear (e.g. 2023)
 * to the first day of that month as a Date object.
 */
function monthYearToDate(month: string, year: number): Date {
  const monthIndex = MONTHS_ORDER.indexOf(month.toLowerCase().trim());
  if (monthIndex === -1) {
    // Fallback: try as a number (1-12), else default to January
    const numericMonth = parseInt(month, 10);
    const idx = isNaN(numericMonth) ? 0 : Math.max(0, numericMonth - 1);
    return new Date(year, idx, 1);
  }
  return new Date(year, monthIndex, 1);
}

/**
 * Returns the monthly average price series for a product, ordered oldest → newest.
 *
 * Each point in the series represents the average unit price
 * recorded during a given month and year.
 *
 * Filters out any months where the computed average is zero or null.
 */
export async function getHistoricalSeries(productId: number): Promise<HistoricalPoint[]> {
  const grouped = await prisma.historicalPrice.groupBy({
    by: ["sourceYear", "sourceMonth"],
    where: { productId },
    _avg: { unitPrice: true },
  });

  const series: HistoricalPoint[] = grouped
    .filter((g) => g._avg.unitPrice !== null && g._avg.unitPrice.toNumber() > 0)
    .map((g) => ({
      date: monthYearToDate(g.sourceMonth, g.sourceYear),
      value: g._avg.unitPrice!.toNumber(),
    }));

  // Sort chronologically oldest → newest
  series.sort((a, b) => a.date.getTime() - b.date.getTime());

  return series;
}
