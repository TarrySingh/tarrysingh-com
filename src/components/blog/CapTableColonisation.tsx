"use client"

/**
 * V18 — THE CAP-TABLE COLONISATION MAP  (Chapter 5, "Tenant Farms: The Bright
 * Spots, Honestly").
 *
 * The chapter's hardest move: the bright spots are not the rebuttal to the
 * thesis — they are its proof. Every European jewel held up as a counter-example
 * has, on inspection, a foreign outlet, owner, or off-switch. This instrument is
 * a click/keyboard gallery of those jewels. Each card shows the WONDER (gold —
 * the capability Europe genuinely built) and, beside it, the CAP TABLE (red —
 * the foreign owner / listing / control that now holds the off-switch).
 *
 * A running tally sits above the gallery and never moves: by the time European
 * startups break through, ~73% of the lead investors in their large rounds are
 * American, and US late-stage funding (~$141bn) dwarfs Europe's (~$12bn) by
 * roughly 9:1. The cards are the texture; the tally is the verdict.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native tablist + ←/→/Home/End), reduced-motion safe (the capture
 * meter settles to its end-state; only the user's selection moves it), role="img"
 * with a spoken aria-label, and meaningful at its default (Arm) as the static
 * fallback.
 *
 * Figures hard-coded from the spec. Sources: Prosus "State of AI in Europe"
 * (73% of large-round leads American); Dealroom (~$141bn US vs ~$12bn EU late
 * stage); company filings 2025–26.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp,
  lerp,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

type Jewel = {
  key: string
  name: string
  /** where the value was built */
  builtIn: string
  builtFlag: string
  /** the gold beat — what Europe genuinely built */
  wonderLabel: string
  /** the red beat — the foreign cap table / off-switch */
  captureLabel: string
  /** the big mono readout for the capture */
  stat: string
  statSub: string
  /** 0..1 — share of the jewel held by a foreign cap table (meter fill) */
  capture: number
  date: string
  gloss: string
}

// Each jewel: the capability Europe built (gold) vs the foreign owner / listing
// / off-switch that holds it (red). `capture` is the share of control that has
// moved abroad — it rises across the gallery, from a still-mostly-European
// round to a wholly-owned subsidiary.
const JEWELS: Jewel[] = [
  {
    key: "helsing",
    name: "Helsing",
    builtIn: "Germany",
    builtFlag: "DE",
    wonderLabel: "Europe's defence-AI champion",
    captureLabel: "$18bn round, US-led",
    stat: "US-LED",
    statSub: "$18bn · Dragoneer / Lightspeed",
    capture: 0.34,
    date: "2025",
    gloss:
      "Still ~80% European-owned, the closest thing to a clean bright spot, yet the round that crowned it was led from the US by Dragoneer and Lightspeed. Even the exception leans on an American lead.",
  },
  {
    key: "mistral",
    name: "Mistral",
    builtIn: "France",
    builtFlag: "FR",
    wonderLabel: "Europe's frontier lab",
    captureLabel: "€14bn, a fraction of US peers",
    stat: "€14bn",
    statSub: "vs US frontier labs' war chests",
    capture: 0.42,
    date: "2025",
    gloss:
      "France's frontier hope, valued at €14bn, real, and a fraction of what a single US lab raises in a quarter. The jewel is genuine; the scale that decides the frontier is not Europe's to set.",
  },
  {
    key: "wayve",
    name: "Wayve",
    builtIn: "United Kingdom",
    builtFlag: "UK",
    wonderLabel: "UK self-driving champion",
    captureLabel: "$8.6bn, SoftBank / Microsoft / Nvidia",
    stat: "$8.6bn",
    statSub: "SoftBank · Microsoft · Nvidia",
    capture: 0.6,
    date: "2024",
    gloss:
      "London's autonomy crown-jewel, funded by SoftBank, Microsoft and Nvidia. British by invention, foreign by cap table, the backers who decide its fate sit in Tokyo and Seattle.",
  },
  {
    key: "klarna",
    name: "Klarna",
    builtIn: "Sweden",
    builtFlag: "SE",
    wonderLabel: "Europe's fintech standard-bearer",
    captureLabel: "Listed on the NYSE",
    stat: "NYSE",
    statSub: "IPO · Sept 2025",
    capture: 0.66,
    date: "Sept 2025",
    gloss:
      "Built in Stockholm, it rang the bell in New York. The equity now compounds, and the governance gravity now sits, on a US exchange, not a Swedish one.",
  },
  {
    key: "wise",
    name: "Wise",
    builtIn: "United Kingdom",
    builtFlag: "UK",
    wonderLabel: "UK cross-border payments",
    captureLabel: "Primary listing → Nasdaq",
    stat: "Nasdaq",
    statSub: "primary listing · May 2026",
    capture: 0.7,
    date: "May 2026",
    gloss:
      "London kept only a secondary listing; the primary venue, and the index inclusion that follows the capital, moved to New York in 2026.",
  },
  {
    key: "arm",
    name: "Arm",
    builtIn: "United Kingdom",
    builtFlag: "UK",
    wonderLabel: "The instruction set in every phone",
    captureLabel: "Nasdaq · SoftBank ~87%",
    stat: "~87%",
    statSub: "SoftBank-owned · Nasdaq",
    capture: 0.87,
    date: "IPO 2023",
    gloss:
      "British by design, ~87% SoftBank by ownership, American by listing. The architecture inside nearly every phone on Earth answers to Tokyo and a Nasdaq ticker.",
  },
  {
    key: "alephalpha",
    name: "Aleph Alpha",
    builtIn: "Germany",
    builtFlag: "DE",
    wonderLabel: "Germany's sovereign-AI hope",
    captureLabel: "Absorbed into Canada's Cohere",
    stat: "ABSORBED",
    statSub: "into Cohere (Canada) · Apr 2026",
    capture: 0.95,
    date: "Apr 2026",
    gloss:
      "Heidelberg's 'sovereign AI' answer to OpenAI was absorbed into Canada's Cohere in April 2026. The sovereignty case dissolved the moment the cap table left the country.",
  },
  {
    key: "deepmind",
    name: "DeepMind",
    builtIn: "United Kingdom",
    builtFlag: "UK",
    wonderLabel: "Britain's crown-jewel AI lab",
    captureLabel: "Wholly owned by Alphabet / Google",
    stat: "100%",
    statSub: "wholly owned · Alphabet",
    capture: 1,
    date: "since 2014",
    gloss:
      "The off-switch in its purest form: a wholly-owned arm of a Californian company. The frontier research, the patents, the upside, every share of it captured.",
  },
]

// Running tally — fixed across the gallery. This is the verdict the cards prove.
const US_LEAD_SHARE = 73 // % of large-round leads that are American
const US_LATE = 141 // $bn, US late-stage
const EU_LATE = 12 // $bn, EU late-stage
const RATIO = "~9:1"

// ---- plot frame (viewBox units) -------------------------------------------
const W = 920
const H = 360
const CX = W / 2
// jewel disc (left) + cap-table meter (right)
const JEWEL_CX = 250
const JEWEL_CY = 188
const JEWEL_R = 92
const METER_X = 470
const METER_W = 380
const METER_Y = 150
const METER_H = 56

export function CapTableColonisation() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  const [i, setI] = useState(0)
  const c = JEWELS[i]

  // Animate the capture meter toward the target share (eased), unless reduced.
  const animRef = useRef(0)
  const [anim, setAnim] = useState(0)
  useEffect(() => {
    if (reduced) {
      animRef.current = c.capture
      setAnim(c.capture)
      return
    }
    let raf = 0
    const start = performance.now()
    const from = animRef.current
    const to = c.capture
    const dur = 620
    const step = (now: number) => {
      const t = clamp((now - start) / dur, 0, 1)
      const v = lerp(from, to, easeInOut(t))
      animRef.current = v
      setAnim(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, reduced])

  const captureT = reduced ? c.capture : anim
  const capLen = METER_W * captureT
  const capPct = Math.round(captureT * 100)

  // ←/→ steps; Home/End jump to the ends.
  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      setI((v) => clamp(v + 1, 0, JEWELS.length - 1))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      setI((v) => clamp(v - 1, 0, JEWELS.length - 1))
    } else if (e.key === "Home") {
      e.preventDefault()
      setI(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setI(JEWELS.length - 1)
    }
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V18 · The Cap-Table Colonisation Map"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeezeHi }}
        >
          {i + 1}/{JEWELS.length} · {c.date}
        </span>
      }
      caption={
        <>
          Every European <span style={{ color: p.wonder }}>jewel</span> held up as the rebuttal has, on
          inspection, a foreign <span style={{ color: p.squeeze }}>cap table</span>, an owner, a listing, or
          an off-switch. Click, or use ←/→, through the bright spots; the capture meter fills as control
          moves abroad. Above it sits the verdict that never moves: ~{US_LEAD_SHARE}% of large-round leads are
          American, and US late-stage funding (~${US_LATE}bn) dwarfs Europe&rsquo;s (~${EU_LATE}bn) {RATIO}.
          The bright spots are the proof, not the rebuttal. Sources: Prosus &ldquo;State of AI in
          Europe&rdquo;; Dealroom; company filings 2025&ndash;26.
        </>
      }
    >
      {/* selector — a native tablist, keyboard-reachable */}
      <div
        role="tablist"
        aria-label="Choose a European bright spot and its foreign cap table"
        onKeyDown={onKey}
        className="mb-3 flex flex-wrap gap-1.5 px-1"
      >
        {JEWELS.map((j, idx) => {
          const active = idx === i
          return (
            <button
              key={j.key}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setI(idx)}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 7,
                cursor: "pointer",
                whiteSpace: "nowrap",
                color: active ? p.bg : p.muted,
                border: `1px solid ${active ? p.squeeze : p.hair}`,
                background: active ? p.squeeze : "transparent",
                fontWeight: active ? 700 : 400,
              }}
            >
              {j.name}
            </button>
          )
        })}
      </div>

      {/* THE TALLY — fixed verdict, never moves across the gallery */}
      <div
        className="mb-3 flex flex-wrap items-stretch gap-2 px-1"
        style={{ fontFamily: "var(--font-mono), monospace" }}
      >
        <div
          className="flex-1 rounded-lg px-3 py-2"
          style={{ minWidth: 150, border: `1px solid ${p.hair}`, background: "transparent" }}
        >
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: p.soft }}>
            Large-round leads
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-extrabold tabular-nums" style={{ color: p.squeezeHi }}>
              {US_LEAD_SHARE}%
            </span>
            <span className="text-[11px]" style={{ color: p.muted }}>
              American
            </span>
          </div>
        </div>
        <div
          className="flex-1 rounded-lg px-3 py-2"
          style={{ minWidth: 210, border: `1px solid ${p.hair}`, background: "transparent" }}
        >
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: p.soft }}>
            Late-stage funding · US vs EU
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-extrabold tabular-nums" style={{ color: p.squeezeHi }}>
              ${US_LATE}bn
            </span>
            <span className="text-[13px]" style={{ color: p.soft }}>
              vs
            </span>
            <span className="text-[18px] font-bold tabular-nums" style={{ color: p.leverageHi }}>
              ${EU_LATE}bn
            </span>
            <span className="text-[12px] font-semibold" style={{ color: p.squeeze }}>
              {RATIO}
            </span>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${c.name}, built in ${c.builtIn}: ${c.wonderLabel}, now ${c.captureLabel} (${c.stat}, ${c.date}), roughly ${capPct}% of control captured abroad. Across Europe's bright spots, about ${US_LEAD_SHARE}% of large-round leads are American and US late-stage funding of about ${US_LATE} billion dollars dwarfs Europe's ${EU_LATE} billion ${RATIO}.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="ctc-jewel" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={0.95} />
            <stop offset="62%" stopColor={p.wonder} stopOpacity={0.78} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0.42} />
          </radialGradient>
          <radialGradient id="ctc-jewel-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={0.4} />
            <stop offset="70%" stopColor={p.wonder} stopOpacity={0.1} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="ctc-cap" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.55} />
            <stop offset="100%" stopColor={p.squeezeHi} stopOpacity={0.95} />
          </linearGradient>
        </defs>

        {/* ---- THE JEWEL — gold, the capability Europe built ---- */}
        <circle cx={JEWEL_CX} cy={JEWEL_CY} r={JEWEL_R + 36} fill="url(#ctc-jewel-glow)" />
        <circle
          cx={JEWEL_CX}
          cy={JEWEL_CY}
          r={JEWEL_R}
          fill="url(#ctc-jewel)"
          stroke={p.wonderHi}
          strokeWidth={1.5}
        />
        <text
          x={JEWEL_CX}
          y={JEWEL_CY - 16}
          textAnchor="middle"
          fill={p.bg}
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em" }}
        >
          THE JEWEL
        </text>
        <text
          x={JEWEL_CX}
          y={JEWEL_CY + 12}
          textAnchor="middle"
          fill={p.bg}
          style={{ fontSize: 28, fontWeight: 800 }}
        >
          {c.name}
        </text>
        <text
          x={JEWEL_CX}
          y={JEWEL_CY + 34}
          textAnchor="middle"
          fill={p.bg}
          style={{ fontSize: 11, fontWeight: 600, opacity: 0.82 }}
        >
          {c.builtFlag} · {c.builtIn}
        </text>
        <text
          x={JEWEL_CX}
          y={JEWEL_CY + JEWEL_R + 26}
          textAnchor="middle"
          fill={p.wonder}
          style={{ fontSize: 12.5 }}
        >
          {c.wonderLabel}
        </text>

        {/* the leader-line from jewel to its cap table */}
        <line
          x1={JEWEL_CX + JEWEL_R + 6}
          y1={JEWEL_CY}
          x2={METER_X - 8}
          y2={METER_Y + METER_H / 2}
          stroke={p.blueprint}
          strokeWidth={1}
          strokeDasharray="2 6"
        />

        {/* ---- THE CAP TABLE — red meter, share captured abroad ---- */}
        <text
          x={METER_X}
          y={METER_Y - 14}
          textAnchor="start"
          fill={p.squeeze}
          style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em" }}
        >
          THE CAP TABLE, CONTROL CAPTURED ABROAD
        </text>
        {/* meter track (the whole jewel) */}
        <rect
          x={METER_X}
          y={METER_Y}
          width={METER_W}
          height={METER_H}
          rx={4}
          fill="none"
          stroke={p.blueprint}
          strokeWidth={1.4}
        />
        {/* the residual European sliver, faint cyan, behind the fill */}
        <rect
          x={METER_X}
          y={METER_Y}
          width={METER_W}
          height={METER_H}
          rx={4}
          fill={p.leverage}
          opacity={0.1}
        />
        {/* captured fill — red, growing left→right */}
        <rect
          x={METER_X}
          y={METER_Y}
          width={capLen}
          height={METER_H}
          rx={4}
          fill="url(#ctc-cap)"
          stroke={p.squeeze}
          strokeWidth={1.2}
        />
        {/* the live boundary tick between captured (red) and held (cyan) */}
        <line
          x1={METER_X + capLen}
          y1={METER_Y - 6}
          x2={METER_X + capLen}
          y2={METER_Y + METER_H + 6}
          stroke={p.squeezeHi}
          strokeWidth={2}
        />
        {/* captured % readout */}
        <text
          x={METER_X + 14}
          y={METER_Y + METER_H / 2 + 11}
          textAnchor="start"
          fill={p.bg}
          style={{ fontSize: 30, fontWeight: 800 }}
        >
          {capPct}%
        </text>
        {/* the stat + sub, below the meter */}
        <text
          x={METER_X}
          y={METER_Y + METER_H + 34}
          textAnchor="start"
          fill={p.squeezeHi}
          style={{ fontSize: 24, fontWeight: 800 }}
        >
          {c.stat}
        </text>
        <text
          x={METER_X}
          y={METER_Y + METER_H + 56}
          textAnchor="start"
          fill={p.muted}
          style={{ fontSize: 12.5 }}
        >
          {c.statSub}
        </text>
        <text
          x={METER_X + METER_W}
          y={METER_Y + METER_H + 34}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}
        >
          {c.captureLabel}
        </text>
      </svg>

      {/* the capture strip across the gallery + the serif verdict */}
      <div className="mt-2 px-1">
        <div className="flex items-end gap-2" aria-hidden>
          {JEWELS.map((j, idx) => {
            const active = idx === i
            return (
              <div key={j.key} className="flex-1">
                <div
                  style={{
                    height: 6 + j.capture * 28,
                    borderRadius: 2,
                    background: active ? p.squeeze : p.hair,
                    border: `1px solid ${active ? p.squeeze : "transparent"}`,
                    transition: "background 200ms ease-out",
                  }}
                />
              </div>
            )
          })}
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: p.squeeze, fontStyle: "normal", fontWeight: 700 }}>
            {c.builtFlag} → {capPct}% captured
          </span>{" "}
, {c.gloss}
        </p>
      </div>
    </PlateFrame>
  )
}
