/** Color utilities for exposure scoring visualization */

/**
 * Map an exposure score (0-10) to a color on a green-to-red gradient.
 * 0 = deep green (minimal AI exposure)
 * 5 = yellow (moderate)
 * 10 = deep red (maximum AI exposure)
 */
export function exposureColor(score: number | null, alpha: number = 1): string {
  if (score === null || score === undefined) {
    return `rgba(128, 128, 128, ${alpha})`; // gray for missing data
  }

  const t = Math.max(0, Math.min(1, score / 10));

  let r: number, g: number, b: number;

  if (t < 0.5) {
    // Green to yellow (0 → 0.5)
    const s = t * 2;
    r = Math.round(34 + s * (234 - 34));
    g = Math.round(139 + s * (179 - 139));
    b = Math.round(34 + s * (8 - 34));
  } else {
    // Yellow to red (0.5 → 1.0)
    const s = (t - 0.5) * 2;
    r = Math.round(234 + s * (192 - 234));
    g = Math.round(179 - s * 179);
    b = Math.round(8 + s * (28 - 8));
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get a CSS class-friendly exposure level label.
 */
export function exposureLevel(score: number | null): string {
  if (score === null) return "unknown";
  if (score <= 2) return "low";
  if (score <= 5) return "moderate";
  if (score <= 7) return "significant";
  return "high";
}

/**
 * 5 exposure tiers matching Karpathy's style.
 */
export const EXPOSURE_TIERS = [
  { label: "Minimal", range: "0-2", min: 0, max: 2, color: "#228B22" },
  { label: "Low", range: "3-4", min: 3, max: 4, color: "#7CB518" },
  { label: "Moderate", range: "5-6", min: 5, max: 6, color: "#EAB308" },
  { label: "High", range: "7-8", min: 7, max: 8, color: "#EA580C" },
  { label: "Very High", range: "9-10", min: 9, max: 10, color: "#C0241C" },
];

/** Get tier color for a given score */
export function tierColor(score: number | null): string {
  if (score === null) return "#666";
  for (const tier of EXPOSURE_TIERS) {
    if (score >= tier.min && score <= tier.max) return tier.color;
  }
  return "#666";
}
