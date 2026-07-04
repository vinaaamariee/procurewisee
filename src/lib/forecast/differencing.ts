import type { DifferencedSeries } from "./forecast-types";

/**
 * Applies first-order differencing to a numeric array.
 *
 * First-order differencing transforms a series by computing the
 * difference between consecutive values, which removes a linear trend
 * and is the core step before fitting an ARIMA model.
 *
 * Example:
 *   Input:  [230, 235, 240, 238]
 *   Output: [5, 5, -2]
 *
 * Returns an empty array if the input has fewer than 2 elements.
 */
export function differenceSeries(values: number[]): DifferencedSeries {
  if (values.length < 2) {
    return { values: [], order: 1 };
  }

  const differenced: number[] = [];
  for (let i = 1; i < values.length; i++) {
    differenced.push(values[i] - values[i - 1]);
  }

  return { values: differenced, order: 1 };
}

/**
 * Applies differencing repeatedly for a given order d.
 *
 * d = 1 → first-order (standard)
 * d = 2 → second-order (difference of the differences)
 *
 * Used by ARIMA(p, d, q) where d is the integration order.
 */
export function differenceSeriesOfOrder(values: number[], order: number): DifferencedSeries {
  if (order < 1) {
    return { values: [...values], order: 0 };
  }

  let current = values;
  for (let d = 0; d < order; d++) {
    if (current.length < 2) break;
    const next: number[] = [];
    for (let i = 1; i < current.length; i++) {
      next.push(current[i] - current[i - 1]);
    }
    current = next;
  }

  return { values: current, order };
}

/**
 * Inverts a first-order differenced series back to its original scale
 * given the first value of the original series.
 *
 * Used to recover forecasted values after ARIMA predicts on the
 * differenced domain.
 *
 * @param differenced  Array of differenced values
 * @param origin       The first value of the original undifferenced series
 * @returns            Reconstructed series in original scale
 */
export function invertDifference(differenced: number[], origin: number): number[] {
  const result: number[] = [origin];
  for (const delta of differenced) {
    result.push(result[result.length - 1] + delta);
  }
  // Return everything except the seed origin value
  return result.slice(1);
}
