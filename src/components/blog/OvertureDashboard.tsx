"use client"

/**
 * V46 — THE OVERTURE DASHBOARD  (the essay's hero overview).
 *
 * Six live gauges sweep up to their value on mount — the whole indictment at a
 * glance. Each gauge is a deep-link into its chapter: a native <a> (so it works
 * with no JS and is keyboard-reachable) that also fires an optional `onJump`
 * handler for in-page smooth-scroll. Semantic colours encode the argument:
 *   WONDER  (gold)  → the capability framing (productivity gap, the 40× gulf)
 *   SQUEEZE (rose)  → the alarming outflows  (€300bn, €264bn)
 *   LEVERAGE(cyan)  → the structural failures (pension venture share, Draghi)
 *
 * Theme-aware (re-renders on the Read-mode flip), reduced-motion safe (the sweep
 * is skipped and gauges snap straight to value), SSR-safe (no window access
 * outside effects). Renders meaningfully at the final value as a static fallback.
 *
 * Sources: Draghi report (Sept 2024) + 18-month implementation tracker; Eurostat
 * / BEA GDP-per-capita; €300bn EU savings export (Letta/Noyer); €264bn EU cloud
 * spend to US hyperscalers; pension venture-allocation share (Invest Europe / NVCA);
 * Anthropic ~$965bn vs Mistral ~€20bn valuations, June 2026.
 */

import { useEffect, useRef, useState } from "react"

import { PlateFrame, useReadMode, usePrefersReducedMotion, clamp01, easeOut } from "./read-chart-kit"
import { cpPalette, rgba, type CPPalette } from "./chokepoint-kit"

type Accent = "wonder" | "squeeze" | "leverage"

interface Gauge {
  /** chapter anchor + label */
  anchor: string
  chapter: string
  /** headline + how to render it from a 0..1 fill */
  value: string
  fill: number // 0..1 — how full the arc reads (the dial's "alarm level")
  caption: string
  accent: Accent
}

const GAUGES: Gauge[] = [
  {
    anchor: "#chapter-1",
    chapter: "Ch.1 · Productivity",
    value: "~50%",
    fill: 0.5,
    caption: "EU GDP per capita versus the US — and the gap is widening.",
    accent: "wonder",
  },
  {
    anchor: "#chapter-3",
    chapter: "Ch.3 · The standing order",
    value: "€300bn",
    fill: 0.78,
    caption: "European savings wired to foreign capital markets, every year.",
    accent: "squeeze",
  },
  {
    anchor: "#chapter-10",
    chapter: "Ch.10 · The tribute",
    value: "€264bn",
    fill: 0.7,
    caption: "Cloud spend paid back to US hyperscalers, every year.",
    accent: "squeeze",
  },
  {
    anchor: "#chapter-6",
    chapter: "Ch.6 · Dry powder",
    value: "0.009%",
    fill: 0.32,
    caption: "Of European pension assets in venture — a third of the US share.",
    accent: "leverage",
  },
  {
    anchor: "#chapter-12",
    chapter: "Ch.12 · The drawer",
    value: "11%",
    fill: 0.11,
    caption: "Of Draghi's recommendations implemented, eighteen months on.",
    accent: "leverage",
  },
  {
    anchor: "#chapter-9",
    chapter: "Ch.9 · The gulf",
    value: "40×",
    fill: 0.9,
    caption: "Anthropic (~$965bn) against Europe's flagship Mistral (~€20bn).",
    accent: "wonder",
  },
]

// Every section in reading order — the full index strip beneath the six hero
// dials. IDs match the <section> anchors on each chapter (and the JumpNav rail).
const SECTIONS: { id: string; roman: string; title: string }[] = [
  { id: "prologue", roman: "·", title: "Prologue" },
  { id: "chapter-1", roman: "I", title: "The Canary" },
  { id: "chapter-2", roman: "II", title: "The Map Out" },
  { id: "chapter-3", roman: "III", title: "The Standing Order" },
  { id: "chapter-4", roman: "IV", title: "The Crown Jewel" },
  { id: "chapter-5", roman: "V", title: "Tenant Farms" },
  { id: "chapter-6", roman: "VI", title: "The Finishing School" },
  { id: "chapter-7", roman: "VII", title: "The Electrons" },
  { id: "chapter-8", roman: "VIII", title: "The Re-Armament" },
  { id: "chapter-9", roman: "IX", title: "The Moat" },
  { id: "chapter-10", roman: "X", title: "The Ledger" },
  { id: "chapter-11", roman: "XI", title: "The Accelerant" },
  { id: "chapter-12", roman: "XII", title: "The Turn & Coda" },
]

function accentOf(p: CPPalette, a: Accent): { base: string; hi: string } {
  if (a === "squeeze") return { base: p.squeeze, hi: p.squeezeHi }
  if (a === "leverage") return { base: p.leverage, hi: p.leverageHi }
  return { base: p.wonder, hi: p.wonderHi }
}

// Gauge geometry — a 240° arc opening at the bottom.
const GR = 54
const GCX = 70
const GCY = 66
const A0 = 150 // start angle (deg) — bottom-left
const SWEEP = 240 // total degrees travelled clockwise

function polar(angleDeg: number): [number, number] {
  const r = (angleDeg * Math.PI) / 180
  return [GCX + GR * Math.cos(r), GCY + GR * Math.sin(r)]
}

/** SVG arc path from A0 across `frac` of the full sweep. */
function arcPath(frac: number): string {
  const f = clamp01(frac)
  if (f <= 0.0001) return ""
  const [sx, sy] = polar(A0)
  const [ex, ey] = polar(A0 + SWEEP * f)
  const large = SWEEP * f > 180 ? 1 : 0
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${GR} ${GR} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`
}

export function OvertureDashboard({ onJump }: { onJump?: (anchor: string) => void }) {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // Mount sweep: 0 → 1. Reduced motion snaps straight to 1 (full static value).
  const [t, setT] = useState(reduced ? 1 : 0)
  useEffect(() => {
    if (reduced) {
      setT(1)
      return
    }
    let raf = 0
    let t0 = 0
    const dur = 1100
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const prog = Math.min(1, (ts - t0) / dur)
      setT(easeOut(prog))
      if (prog < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  function handleJump(e: React.MouseEvent<HTMLAnchorElement>, anchor: string) {
    if (onJump) {
      e.preventDefault()
      onJump(anchor)
      return
    }
    // No external handler: smooth-scroll to the section ourselves so every dial
    // and index pill actually navigates (a bare href would otherwise hard-jump).
    const el = typeof document !== "undefined" ? document.getElementById(anchor.replace("#", "")) : null
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
      if (typeof history !== "undefined") history.replaceState(null, "", anchor)
    }
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V46 · The Overture"
      caption={
        <>
          The whole indictment at a glance — six dials, six chapters. In{" "}
          <span style={{ color: p.wonder }}>gold</span>, the capability gulf; in{" "}
          <span style={{ color: p.squeeze }}>rose</span>, the annual wealth transfer; in{" "}
          <span style={{ color: p.leverage }}>cyan</span>, the structural failures to close it. Each dial
          jumps to its chapter. Sources: Draghi report (2024) + implementation tracker; Eurostat/BEA;
          Letta/Noyer on savings; EU cloud spend; Invest Europe/NVCA; valuations, June 2026.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {GAUGES.map((g) => {
          const { base, hi } = accentOf(p, g.accent)
          const shown = g.fill * t
          return (
            <a
              key={g.anchor}
              href={g.anchor}
              onClick={(e) => handleJump(e, g.anchor)}
              className="group flex items-center gap-3 rounded-lg border p-3 no-underline transition-colors focus:outline-none"
              style={{
                borderColor: p.border,
                background: rgba(p.inkRGB, mode === "dark" ? 0.04 : 0.02),
              }}
              aria-label={`${g.value} — ${g.caption} Jump to ${g.chapter}.`}
            >
              {/* radial gauge */}
              <svg
                viewBox="0 0 140 124"
                role="img"
                aria-hidden
                style={{ width: 96, height: 85, flex: "none", display: "block", overflow: "visible" }}
              >
                {/* track */}
                <path
                  d={arcPath(1)}
                  fill="none"
                  stroke={p.hair}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
                {/* value arc */}
                <path
                  d={arcPath(shown)}
                  fill="none"
                  stroke={base}
                  strokeWidth={9}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${rgba(p.inkRGB, 0)})` }}
                />
                {/* glow cap at the leading edge */}
                {shown > 0.01 &&
                  (() => {
                    const [hx, hy] = polar(A0 + SWEEP * shown)
                    return <circle cx={hx} cy={hy} r={5.2} fill={hi} />
                  })()}
                {/* headline figure */}
                <text
                  x={GCX}
                  y={GCY - 2}
                  textAnchor="middle"
                  fill={hi}
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {g.value}
                </text>
                <text
                  x={GCX}
                  y={GCY + 16}
                  textAnchor="middle"
                  fill={p.soft}
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                  }}
                >
                  {Math.round(shown * 100)}
                </text>
              </svg>

              {/* label block */}
              <span className="min-w-0 flex-1">
                <span
                  className="block text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ fontFamily: "var(--font-mono), monospace", color: base }}
                >
                  {g.chapter}
                </span>
                <span
                  className="mt-1 block text-[12.5px] leading-snug"
                  style={{ fontFamily: "var(--font-serif), serif", color: p.muted }}
                >
                  {g.caption}
                </span>
                <span
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-60 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                  style={{ fontFamily: "var(--font-mono), monospace", color: hi }}
                >
                  Read the chapter →
                </span>
              </span>
            </a>
          )
        })}
      </div>

      {/* legend */}
      <div
        className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 px-1 text-[10px] uppercase tracking-[0.16em]"
        style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 9, height: 9, borderRadius: 9, background: p.wonder }} className="inline-block" />
          Capability
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 9, height: 9, borderRadius: 9, background: p.squeeze }} className="inline-block" />
          Transfer
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 9, height: 9, borderRadius: 9, background: p.leverage }} className="inline-block" />
          Structure
        </span>
      </div>

      {/* the full index — every section, one tap away (the six dials above are the highlights) */}
      <nav className="mt-4 border-t pt-3" style={{ borderColor: p.hair }} aria-label="All chapters">
        <span
          className="mb-2 block text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          The full index · jump to any section
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => handleJump(e, `#${s.id}`)}
              className="rounded-md border px-2 py-1 text-[11px] no-underline transition-opacity hover:opacity-100"
              style={{
                borderColor: p.border,
                color: p.muted,
                fontFamily: "var(--font-mono), monospace",
                background: rgba(p.inkRGB, mode === "dark" ? 0.04 : 0.02),
                opacity: 0.82,
              }}
            >
              <span style={{ color: p.soft }}>{s.roman}</span>&nbsp;{s.title}
            </a>
          ))}
        </div>
      </nav>
    </PlateFrame>
  )
}
