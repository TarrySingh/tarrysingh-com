"use client"

/**
 * chokepoint-kit — the shared foundation for "The Chokepoint Paradox" flagship
 * instruments (Direction C, "The Machine").
 *
 * It builds on `read-chart-kit` (theme-aware SVG plates that re-render on the
 * Read-mode flip) and adds the three semantic accents that encode the essay's
 * thesis:
 *   - LEVERAGE  → blueprint cyan   (the power Europe holds)
 *   - SQUEEZE   → reserved red     (the foreign veto closing in)
 *   - WONDER    → copper-gold      (the crown-jewel capability)
 *
 * Instruments import the read-chart-kit primitives (useReadMode, PlateFrame,
 * scales) directly and pull `cpPalette()` from here for the semantic colours,
 * so the blueprint grammar stays in one place across all 50 instruments.
 */

import { paletteFor, type ReadMode, type ReadPalette } from "./read-chart-kit"

export interface CPPalette extends ReadPalette {
  /** the power Europe holds — blueprint cyan */
  leverage: string
  leverageHi: string
  /** the foreign veto closing in — the single reserved red */
  squeeze: string
  squeezeHi: string
  /** crown-jewel capability — copper-gold (the "wonder" beat) */
  wonder: string
  wonderHi: string
  /** faint blueprint hairline for the schematic grid + leader-lines */
  blueprint: string
}

const DARK_CP = {
  leverage: "#6cc6e6",
  leverageHi: "#9ad8ef",
  squeeze: "#f0708a",
  squeezeHi: "#f59ab0",
  wonder: "#e6b45a",
  wonderHi: "#f4cd86",
  blueprint: "rgba(120,170,230,0.20)",
}

const LIGHT_CP = {
  leverage: "#0e7aa5",
  leverageHi: "#1aa0c9",
  squeeze: "#c0455a",
  squeezeHi: "#d75e74",
  wonder: "#b07a2f",
  wonderHi: "#caa24e",
  blueprint: "rgba(14,122,165,0.16)",
}

/** read-chart-kit palette + the three chokepoint semantic accents. */
export function cpPalette(mode: ReadMode): CPPalette {
  const base = paletteFor(mode)
  return { ...base, ...(mode === "dark" ? DARK_CP : LIGHT_CP) }
}

/** Mix two hex colours in sRGB. t=0 → a, t=1 → b. Cheap morph for node states. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = hexToRGB(a)
  const pb = hexToRGB(b)
  if (!pa || !pb) return a
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t)
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t)
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

function hexToRGB(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "")
  if (h.length !== 6) return null
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** rgba() from a "r,g,b" triple at alpha a — matches read-chart-kit's *RGB fields. */
export function rgba(rgbTriple: string, a: number): string {
  return `rgba(${rgbTriple}, ${a})`
}
