/**
 * Official fund sources as defined by the Cashier's Office of Batanes State College.
 * These are the only permitted values for the fundCluster field on a Purchase Request.
 * Do not modify without coordination with the Cashier's Office.
 */
export const FUND_SOURCES = [
  "GAA 2026 - Current Appropriation",
  "Internally Generated - Income",
] as const;

export type FundSource = (typeof FUND_SOURCES)[number];

/** The default fund source pre-selected when creating a new PR. */
export const DEFAULT_FUND_SOURCE = FUND_SOURCES[0];
