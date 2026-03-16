/** Formatting utilities — locale-aware for European numbers/currencies */

/**
 * Format a number with thousands separators (European style: 1.234.567).
 */
export function formatNumber(value: number | null, locale: string = "en-EU"): string {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

/**
 * Format thousands (e.g., 1234.5k → "1,234,500").
 */
export function formatJobCount(thousands: number | null): string {
  if (thousands === null || thousands === undefined) return "N/A";
  return formatNumber(Math.round(thousands * 1000));
}

/**
 * Format currency in EUR.
 */
export function formatEUR(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a percentage (0-1 range → "45%").
 */
export function formatPercent(value: number | null, decimals: number = 0): string {
  if (value === null || value === undefined) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format an exposure score with label.
 */
export function formatExposure(score: number | null): string {
  if (score === null || score === undefined) return "N/A";
  return `${score}/10`;
}

/**
 * Abbreviate large numbers (1.2M, 3.4K).
 */
export function abbreviateNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}
