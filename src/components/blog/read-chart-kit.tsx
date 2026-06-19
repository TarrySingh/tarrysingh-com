"use client"

/**
 * read-chart-kit — shared foundation for the "Software 3.0" instrument plates.
 *
 * SVG-first: every plate is theme-aware by *re-rendering* when the Read mode
 * flips (no manual canvas redraw). `useReadMode` tracks the closest
 * `[data-read-mode]` ancestor live (the canonical pattern from the existing
 * blog plates), `paletteFor` returns canvas/SVG-ready colours for light/dark,
 * and the scale factories + `PlateFrame` chrome keep each instrument lean.
 */

import { useEffect, useState, type ReactNode, type RefObject } from "react"

export type ReadMode = "light" | "dark"

export interface ReadPalette {
  mode: ReadMode
  /** figure background + border */
  bg: string
  border: string
  /** primary ink (hex) + its "r,g,b" for rgba() opacity work */
  ink: string
  inkRGB: string
  muted: string
  soft: string
  /** gridline / hairline */
  hair: string
  /** copper/gold accent (mode-tuned) */
  accent: string
  /** glow base for atmospheric blooms ("r,g,b") */
  glowRGB: string
  /** data-series accents, tuned per mode for contrast on the figure bg */
  series: {
    gold: string
    copper: string
    violet: string
    teal: string
    rose: string
    cool: string
  }
}

const LIGHT: ReadPalette = {
  mode: "light",
  bg: "#fdfaf2",
  border: "rgba(201,142,79,0.24)",
  ink: "#0d1b3d",
  inkRGB: "13,27,61",
  muted: "rgba(13,27,61,0.62)",
  soft: "rgba(13,27,61,0.40)",
  hair: "rgba(13,27,61,0.10)",
  accent: "#b45309",
  glowRGB: "180,83,9",
  series: {
    gold: "#a9740a",
    copper: "#b45309",
    violet: "#6d5bd0",
    teal: "#2b8a9e",
    rose: "#c2566e",
    cool: "#3a5a9c",
  },
}

const DARK: ReadPalette = {
  mode: "dark",
  bg: "#11203a",
  border: "rgba(232,164,74,0.26)",
  ink: "#f6ead0",
  inkRGB: "246,234,208",
  muted: "rgba(246,234,208,0.66)",
  soft: "rgba(246,234,208,0.44)",
  hair: "rgba(246,234,208,0.12)",
  accent: "#e8a44a",
  glowRGB: "232,164,74",
  series: {
    gold: "#f4c482",
    copper: "#e8a44a",
    violet: "#a698d4",
    teal: "#6cb4c2",
    rose: "#e5a896",
    cool: "#849cc8",
  },
}

export function paletteFor(mode: ReadMode): ReadPalette {
  return mode === "dark" ? DARK : LIGHT
}

/**
 * Track the closest `[data-read-mode]` ancestor and re-render on toggle.
 * Attach the returned ref's element inside the article (PlateFrame does this).
 */
export function useReadMode(ref: RefObject<HTMLElement | null>): ReadMode {
  const [mode, setMode] = useState<ReadMode>("light")
  useEffect(() => {
    const root = ref.current?.closest("[data-read-mode]") as HTMLElement | null
    const apply = () =>
      setMode(root?.getAttribute("data-read-mode") === "dark" ? "dark" : "light")
    apply()
    if (!root) return
    const obs = new MutationObserver(apply)
    obs.observe(root, { attributes: true, attributeFilter: ["data-read-mode"] })
    return () => obs.disconnect()
  }, [ref])
  return mode
}

/** Honour the OS reduced-motion preference (ambient animation gates on this). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])
  return reduced
}

// ----------------------------------------------------------------------------
// Scale factories + easing
// ----------------------------------------------------------------------------

/** Linear scale: maps domain [d0,d1] → range [r0,r1]. */
export function linScale(d0: number, d1: number, r0: number, r1: number) {
  return (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)
}

/** Log10 scale (domain must be > 0). */
export function logScale(d0: number, d1: number, r0: number, r1: number) {
  const l0 = Math.log10(d0)
  const l1 = Math.log10(d1)
  return (v: number) =>
    r0 + ((Math.log10(Math.max(v, Number.MIN_VALUE)) - l0) / (l1 - l0)) * (r1 - r0)
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v
export const clamp01 = (t: number) => clamp(t, 0, 1)
export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Point on a Catmull-Rom-ish smooth path through points — returns an SVG `d`. */
export function smoothPath(pts: ReadonlyArray<[number, number]>): string {
  if (pts.length < 2) return ""
  const d: string[] = [`M ${pts[0][0]} ${pts[0][1]}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`)
  }
  return d.join(" ")
}

// ----------------------------------------------------------------------------
// Shared figure chrome — matches the reference blog-plate look
// ----------------------------------------------------------------------------

export function PlateFrame({
  wrapRef,
  mode,
  kicker,
  caption,
  controls,
  children,
  breakout = true,
  palette,
}: {
  wrapRef: RefObject<HTMLElement | null>
  mode: ReadMode
  kicker: string
  caption?: ReactNode
  controls?: ReactNode
  children: ReactNode
  breakout?: boolean
  /** Optional palette override — lets an instrument theme its own frame
   *  (e.g. a skinned flagship). Falls back to the mode's default palette. */
  palette?: ReadPalette
}) {
  const p = palette ?? paletteFor(mode)
  return (
    <figure
      ref={wrapRef}
      data-read-surface
      className={`my-10 rounded-xl border p-3 sm:p-4 ${
        breakout ? "lg:-mx-12 xl:-mx-24" : ""
      }`}
      style={{ background: p.bg, borderColor: p.border }}
    >
      <div className="mb-2 flex items-baseline justify-between gap-4 px-1">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          {kicker}
        </span>
        {controls}
      </div>
      {children}
      {caption && (
        <figcaption
          className="mt-3 px-1 text-[13px] italic leading-relaxed"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
