/**
 * consortiumTokens.ts — the corporate design system for the PANORAIMA
 * consortium dashboard ("McKinsey deep-navy + cobalt").
 *
 * A restrained, institutional palette: a deep teal-navy base, crisp white
 * surfaces, a single cobalt accent used sparingly for emphasis/active states,
 * hairline rules, and tabular IBM Plex Mono micro-labels. Data-semantic colours
 * (submitted / missed / engagement) are kept but desaturated to corporate tones.
 *
 * Mirrors the wp4constants.ts pattern (inline hex, no Tailwind config changes)
 * so components can `import { NAVY, COBALT, ... }`. This is deliberately a
 * DIFFERENT system from the WP4 EarthScan rust palette — that signals the
 * "platform" (WP4 tool) vs this "consortium" overview.
 */

// ── Core neutrals ──────────────────────────────────────────────────────────
export const NAVY = "#051C2C"      // McKinsey deep blue — darkest field / hero base
export const NAVY_2 = "#0A2540"    // raised navy — cards on dark, gradient stop
export const NAVY_3 = "#13334E"    // hairlines / strokes on dark
export const INK = "#0A1F33"        // near-black headings on light
export const SLATE = "#51607A"      // body text
export const MUTE = "#6B7686"       // secondary text
export const FAINT = "#97A0AD"      // faintest labels, tick text
export const LINE = "#E3E7ED"       // hairline borders on light
export const LINE_SOFT = "#EEF1F5"  // faintest rules
export const SURFACE = "#F7F8FA"    // off-white section fill
export const WHITE = "#FFFFFF"

// ── Accent (cobalt) — use sparingly: links, active state, key emphasis ───────
export const COBALT = "#2251FF"     // McKinsey bright blue
export const COBALT_DK = "#1D43D8"  // hover / pressed
export const COBALT_SOFT = "#EEF2FF" // tinted background for active/selected
export const COBALT_LINE = "#C9D4FF" // tinted border

// ── Data-semantic (corporate-muted, NOT neon) ───────────────────────────────
export const OK = "#1F8A5B"         // submitted / strong engagement (emerald)
export const OK_SOFT = "#E8F3ED"
export const WARN = "#B8801E"       // partial / at-risk (amber)
export const WARN_SOFT = "#F6EEDC"
export const BAD = "#C0392B"        // missed / weak engagement (brick)
export const BAD_SOFT = "#F7E9E6"

/** Engagement → colour (used by the map + partner stats). */
export function engagementColor(level: "strong" | "ok" | "weak" | string): string {
  if (level === "strong") return OK
  if (level === "weak") return BAD
  return WARN
}

// ── Work-package scale — a cool sequential navy → cobalt → teal ramp ─────────
// (Replaces the old rainbow; reads as one corporate family, WP4 lands on cobalt
//  since it's the curriculum/flagship package.)
export const WP_COLORS: Record<string, string> = {
  WP1: "#0A2540",
  WP2: "#143A63",
  WP3: "#1C5286",
  WP4: "#2251FF",
  WP5: "#2E7FA6",
  WP6: "#36A08C",
  WP7: "#6B7A8F",
}
export function wpColor(wp: string): string {
  return WP_COLORS[wp?.toUpperCase?.()] ?? MUTE
}

// ── Shared className fragments (keep components consistent) ──────────────────
/** Uppercase tracked mono micro-label, e.g. section kickers. */
export const KICKER = "font-mono text-[11px] font-semibold uppercase tracking-[0.2em]"
/** Flat hairline card on light. */
export const CARD = "rounded-xl border border-[#E3E7ED] bg-white"
/** Tabular figures for any numeric value. */
export const NUM = "tabular-nums"
