"use client"

/**
 * loop-kit - shared foundation for THE ENGINE ROOM instruments (Plate V).
 *
 * Implements the RIS (Responsive Instrument System) contract from
 * docs/Loop-Harness-Engineering/PLAN.md:
 *  - roomy meet-canvas: SVG at width 100% / height auto, never cropped
 *  - zone lanes: header / stage / controls / caption / method are separate
 *    chrome lanes so perimeter text can never collide with the scene
 *  - expand: every instrument carries an expand affordance opening a SECOND,
 *    independent interactive instance in a modal (Esc / backdrop closes)
 *  - determinism: mulberry32 seeded RNG, no wall-clock in render paths
 *  - compact: a container-width hook so scenes switch layout below ~620px
 *    instead of shrinking to mush
 *  - reduced motion: instruments read usePrefersReducedMotion and render a
 *    complete static state
 *
 * House rules baked in (anti-LLM-smell contract): no em-dash anywhere in
 * rendered strings or in this file; the separator is the middot.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import {
  useReadMode,
  usePrefersReducedMotion,
  type ReadMode,
} from "../blog/read-chart-kit"

export { usePrefersReducedMotion, useReadMode }
export type { ReadMode }

// ---------------------------------------------------------------------------
// Palette: graphite field, phosphor green = the ONE live-signal accent,
// amber = verdict / claimed, rose = danger only.
// ---------------------------------------------------------------------------

export interface LHPalette {
  mode: ReadMode
  bg: string
  border: string
  ink: string
  inkRGB: string
  muted: string
  soft: string
  hair: string
  grid: string
  signal: string
  signalHi: string
  signalRGB: string
  verdict: string
  verdictHi: string
  danger: string
  dangerHi: string
  dangerRGB: string
  cool: string
}

const DARK: LHPalette = {
  mode: "dark",
  bg: "#0c1416",
  border: "rgba(140, 200, 170, 0.22)",
  ink: "#e9f2ec",
  inkRGB: "233,242,236",
  muted: "rgba(233,242,236,0.66)",
  soft: "rgba(233,242,236,0.44)",
  hair: "rgba(160,210,185,0.16)",
  grid: "rgba(160,210,185,0.08)",
  signal: "#53e08c",
  signalHi: "#8df0b4",
  signalRGB: "83,224,140",
  verdict: "#e6b45a",
  verdictHi: "#f4cd86",
  danger: "#f0708a",
  dangerHi: "#f59ab0",
  dangerRGB: "240,112,138",
  cool: "#7c95a6",
}

const LIGHT: LHPalette = {
  mode: "light",
  bg: "#f6faf5",
  border: "rgba(30, 90, 60, 0.24)",
  ink: "#10231d",
  inkRGB: "16,35,29",
  muted: "rgba(16,35,29,0.64)",
  soft: "rgba(16,35,29,0.42)",
  hair: "rgba(16,35,29,0.12)",
  grid: "rgba(16,35,29,0.07)",
  signal: "#177a48",
  signalHi: "#0e5c34",
  signalRGB: "23,122,72",
  verdict: "#96660c",
  verdictHi: "#7a520a",
  danger: "#c04868",
  dangerHi: "#a23252",
  dangerRGB: "192,72,104",
  cool: "#4a6474",
}

export function lhPalette(mode: ReadMode): LHPalette {
  return mode === "dark" ? DARK : LIGHT
}

export const rgba = (rgb: string, a: number) => `rgba(${rgb},${a})`

// ---------------------------------------------------------------------------
// Deterministic RNG (SSR render === CSR render, always).
// ---------------------------------------------------------------------------

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Container width -> compact flag. SSR assumes desktop; measures on mount.
// ---------------------------------------------------------------------------

export function useContainerWidth(ref: RefObject<HTMLElement | null>): number | null {
  const [w, setW] = useState<number | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(el.getBoundingClientRect().width)
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setW(e.contentRect.width)
    })
    obs.observe(el)
    // Belt and braces: some embedders resize the viewport without the
    // ResizeObserver firing; a plain resize listener catches those.
    window.addEventListener("resize", measure)
    measure()
    return () => {
      obs.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [ref])
  return w
}

// ---------------------------------------------------------------------------
// The frame: zone-lane chrome + the expand modal.
// ---------------------------------------------------------------------------

export interface SceneCtx {
  /** true inside the expand modal (a fresh, independent instance) */
  expanded: boolean
  /** container is narrow: render the stacked compact layout */
  compact: boolean
  p: LHPalette
  reduced: boolean
  mode: ReadMode
}

export function InstrumentFrame({
  kicker,
  folio,
  caption,
  method,
  children,
  breakout = true,
}: {
  /** left header lane, mono small caps, e.g. "V1 · THE LOOP" */
  kicker: string
  /** right header lane, e.g. "ENGINE ROOM · PLATE V" */
  folio?: string
  /** italic serif lane under the stage: the argument, one or two sentences */
  caption?: ReactNode
  /** mono provenance lane: what is measured, what is schematic, sources */
  method?: ReactNode
  children: (ctx: SceneCtx) => ReactNode
  breakout?: boolean
}) {
  const wrapRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = lhPalette(mode)
  const reduced = usePrefersReducedMotion()
  const width = useContainerWidth(stageRef)
  const compact = width !== null && width < 620
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  const headerLane = (inModal: boolean) => (
    <div className="mb-2 flex items-baseline justify-between gap-4 px-1">
      <span
        className="text-[10.5px] font-semibold uppercase tracking-[0.22em]"
        style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
      >
        {kicker}
      </span>
      <span className="flex items-baseline gap-3">
        {folio && (
          <span
            className="hidden text-[10px] uppercase tracking-[0.2em] sm:inline"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
          >
            {folio}
          </span>
        )}
        {inModal ? (
          <button
            type="button"
            onClick={close}
            aria-label="Close expanded view"
            className="rounded px-2 py-0.5 text-[13px] leading-none transition-opacity hover:opacity-70"
            style={{ color: p.muted, border: `1px solid ${p.hair}` }}
          >
            close
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Expand instrument"
            title="Expand"
            className="rounded px-2 py-0.5 text-[13px] leading-none transition-opacity hover:opacity-70"
            style={{ color: p.muted, border: `1px solid ${p.hair}` }}
          >
            {"⤢"}
          </button>
        )}
      </span>
    </div>
  )

  const captionLane = caption && (
    <figcaption
      className="mt-3 px-1 text-[13px] italic leading-relaxed"
      style={{ fontFamily: "var(--font-serif), serif", color: p.muted }}
    >
      {caption}
    </figcaption>
  )

  const methodLane = method && (
    <div
      className="mt-2 border-t px-1 pt-2 text-[10.5px] leading-relaxed"
      style={{
        fontFamily: "var(--font-mono), monospace",
        color: p.soft,
        borderColor: p.hair,
      }}
    >
      {method}
    </div>
  )

  return (
    <>
      <figure
        ref={wrapRef}
        data-read-surface
        className={`my-10 rounded-xl border p-3 sm:p-4 ${
          breakout ? "lg:-mx-12 xl:-mx-24" : ""
        }`}
        style={{ background: p.bg, borderColor: p.border }}
      >
        {headerLane(false)}
        <div ref={stageRef}>{children({ expanded: false, compact, p, reduced, mode })}</div>
        {captionLane}
        {methodLane}
      </figure>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${kicker} expanded`}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
          style={{ background: "rgba(4,8,9,0.82)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="max-h-full w-full max-w-6xl overflow-y-auto rounded-xl border p-4 sm:p-6"
            style={{ background: p.bg, borderColor: p.border }}
          >
            {headerLane(true)}
            {/* A second, independent interactive instance: fresh React tree, fresh state. */}
            <div>{children({ expanded: true, compact: false, p, reduced, mode })}</div>
            {captionLane}
            {methodLane}
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// CodePane: a real config or command, shown as an artifact. Copy affordance.
// ---------------------------------------------------------------------------

export function CodePane({
  title,
  code,
  p,
}: {
  title: string
  code: string
  p: LHPalette
}) {
  const [copied, setCopied] = useState(false)
  return (
    <div
      className="my-3 overflow-hidden rounded-lg border"
      style={{ borderColor: p.hair, background: rgba(p.inkRGB, 0.04) }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-1.5"
        style={{ borderColor: p.hair }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          {title}
        </span>
        <button
          type="button"
          className="text-[10px] uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-mono), monospace", color: copied ? p.signal : p.muted }}
          onClick={() => {
            void navigator.clipboard?.writeText(code)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1400)
          }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto px-3 py-2 text-[12px] leading-relaxed"
        style={{ fontFamily: "var(--font-mono), monospace", color: p.ink }}
      >
        {code}
      </pre>
    </div>
  )
}
