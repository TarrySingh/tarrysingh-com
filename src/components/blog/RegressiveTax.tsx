"use client"

/**
 * V30 — THE COMPLIANCE REGRESSIVE TAX  (Chapter 9, "The Moat With the Drawbridge
 * Down: Regulation").
 *
 * The Brussels Effect, inverted. A rulebook aimed at the American giants lands
 * as a roughly FIXED cost — the same ~€200k–600k of EU AI-Act high-risk
 * conformity work, a quality-management system (QMS) at ~€193k–330k, and
 * ~€29k/yr per deployed model. A fixed cost divided by a firm's annual budget is
 * a REGRESSIVE tax: a crippling share of a seed startup's runway and a rounding
 * error for a hyperscaler.
 *
 * This instrument is that division, drawn. The reader scrubs firm size from a
 * €0.4M seed startup to a €120bn Big-Tech budget (log x-axis). The compliance
 * curve — the SAME absolute euros every step — plunges from a punishing share at
 * the left (small) to near-zero at the right (large). A mono readout holds the
 * absolute cost (≈ constant, in CYAN — the burden Europe loads onto its own) and
 * the share of budget (RED — regressive, collapsing). The headline cost of the
 * regime sits above: GDPR cut US-led EU venture deals ~20.6% (NBER 2025);
 * ~€3.3bn/yr EU-wide AI-Act compliance (DIGITALEUROPE).
 *
 * REVEAL: the moat meant to constrain Big Tech is a regressive tax that drowns
 * Europe's own small challengers and entrenches the incumbents it feared.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native range + ←/→ + Home/End), reduced-motion safe (no ambient
 * animation — only the reader's scrub moves anything), and meaningful at its
 * default (the curve drawn, the marker on the drowning seed startup) as the
 * static fallback.
 *
 * Figures hard-coded from the spec. Sources: NBER WP 33909 (2025);
 * DIGITALEUROPE; CEPS (AI Act compliance costs).
 */

import { useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  logScale,
  linScale,
  clamp,
  clamp01,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

// The fixed compliance load — the SAME euros at every firm size. Mid-point of
// the high-risk AI-Act conformity band, plus the one-off QMS, plus per-model
// monitoring for one deployed model. (CEPS; DIGITALEUROPE.)
const HIGH_RISK = 400_000 // ~€200k–600k high-risk conformity work
const QMS = 261_000 // ~€193k–330k quality-management system (one-off)
const PER_MODEL = 29_000 // ~€29k/yr per deployed model
const FIXED_COST = HIGH_RISK + QMS + PER_MODEL // ≈ €690k, the regressive numerator

// Firm-size domain: annual operating budget, in euros, log-scaled.
const BUDGET_MIN = 400_000 // €0.4M — a seed startup's first-year runway
const BUDGET_MAX = 120_000_000_000 // €120bn — a hyperscaler's annual budget

// Sampled firm archetypes along the size axis (budget in €). Each carries the
// share the FIXED compliance cost takes of that budget.
type Firm = {
  key: string
  label: string
  short: string
  budget: number
  gloss: string
}

const FIRMS: Firm[] = [
  { key: "seed", label: "Seed startup", short: "SEED", budget: 400_000, gloss: "€0.4M of runway, the compliance bill eats it whole; the company is dead before its first model ships." },
  { key: "pre", label: "Pre-seed scale", short: "PRE-A", budget: 2_000_000, gloss: "€2M raised, over a third of the round is spent proving conformity, not building product." },
  { key: "a", label: "Series A", short: "SER. A", budget: 12_000_000, gloss: "€12M, the fixed bill is now a noticeable tax, but survivable; the moat is starting to flatten." },
  { key: "scale", label: "Scale-up", short: "SCALE", budget: 90_000_000, gloss: "€90M, under 1% of budget; the rulebook barely registers." },
  { key: "large", label: "Large EU firm", short: "LARGE", budget: 1_400_000_000, gloss: "€1.4bn, the compliance cost has shrunk to a rounding error in the accounts." },
  { key: "bigtech", label: "Big Tech", short: "BIGTECH", budget: 120_000_000_000, gloss: "€120bn, the same bill is 0.0006% of budget; the incumbent it feared pays it without noticing." },
]
const N = FIRMS.length - 1

// Headline costs of the regime (the price tag above the curve).
const GDPR_DEAL_CUT = 20.6 // % fall in US-led EU venture deals after GDPR (NBER 2025)
const AIACT_ANNUAL_BN = 3.3 // €bn/yr EU-wide AI-Act compliance (DIGITALEUROPE)

// Plot frame (viewBox units).
const W = 920
const H = 560
const PADL = 70
const PADR = 56
const PADT = 150
const PADB = 132
const PLOT_TOP = PADT
const PLOT_BOT = H - PADB

const shareOf = (budget: number) => FIXED_COST / budget // 0..1+

const xFor = logScale(BUDGET_MIN, BUDGET_MAX, PADL, W - PADR)
// Share axis: log-scaled so the collapse from ~170% to ~0.0006% stays readable.
const SHARE_HI = 2 // 200% — the seed startup is underwater (cost > budget)
const SHARE_LO = 0.000004 // ~0.0004% floor for the hyperscaler
const yFor = logScale(SHARE_LO, SHARE_HI, PLOT_BOT, PLOT_TOP)

// Survivability threshold: above this share of budget, the compliance bill is
// effectively fatal to a firm that must also build a product.
const FATAL = 0.25 // 25% of annual budget

// Format absolute euros compactly: €690k, €1.4bn.
function eur(v: number): string {
  if (v >= 1_000_000_000) return `€${(v / 1_000_000_000).toFixed(v >= 10_000_000_000 ? 0 : 1)}bn`
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1)}M`
  if (v >= 1_000) return `€${Math.round(v / 1_000)}k`
  return `€${Math.round(v)}`
}

// Format the share of budget across many orders of magnitude.
function pct(share: number): string {
  const p = share * 100
  if (p >= 100) return `${Math.round(p)}%`
  if (p >= 10) return `${p.toFixed(0)}%`
  if (p >= 1) return `${p.toFixed(1)}%`
  if (p >= 0.1) return `${p.toFixed(2)}%`
  if (p >= 0.01) return `${p.toFixed(3)}%`
  return `${p.toFixed(4)}%`
}

export function RegressiveTax() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  // Default to the small end: the seed startup drowning — the verdict is visible
  // before any interaction (static fallback).
  const [i, setI] = useState(0)
  const f = FIRMS[i]
  const share = shareOf(f.budget)
  const fatal = share >= FATAL

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setI((v) => clamp(v + 1, 0, N))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setI((v) => clamp(v - 1, 0, N))
    } else if (e.key === "Home") {
      e.preventDefault()
      setI(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setI(N)
    }
  }

  // The regressive curve — same fixed cost over a sweep of budgets. Densely
  // sampled so the log/log plunge is a smooth hyperbola, not a polyline.
  const SAMPLES = 120
  const curvePts: Array<[number, number]> = []
  for (let s = 0; s <= SAMPLES; s++) {
    const t = s / SAMPLES
    const budget = BUDGET_MIN * Math.pow(BUDGET_MAX / BUDGET_MIN, t)
    const sh = clamp(shareOf(budget), SHARE_LO, SHARE_HI)
    curvePts.push([xFor(budget), yFor(sh)])
  }
  const curvePath = "M " + curvePts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")
  // Red region under the curve — the burden loaded onto the firm.
  const burdenArea =
    curvePath + ` L ${xFor(BUDGET_MAX)} ${PLOT_BOT} L ${xFor(BUDGET_MIN)} ${PLOT_BOT} Z`

  // Live point on the curve.
  const cx = xFor(f.budget)
  const cy = yFor(clamp(share, SHARE_LO, SHARE_HI))

  // Where the curve crosses the fatal line — the drawbridge, raised against the
  // small. To its left, the bill is lethal; to its right, survivable.
  const fatalBudget = FIXED_COST / FATAL
  const fatalX = xFor(fatalBudget)
  const fatalY = yFor(FATAL)

  // Y gridlines at decade shares (1×, 10%, 1%, 0.1%, 0.01%, 0.001%).
  const yTicks = [1, 0.1, 0.01, 0.001, 0.0001, 0.00001]

  const verdict = fatal
    ? { word: "DROWNED", color: p.squeeze, line: "the fixed bill is larger than the firm, the challenger dies before it ships" }
    : share >= 0.05
      ? { word: "TAXED", color: p.squeezeHi, line: "survivable, but a fifth of the round is spent on conformity, not product" }
      : { word: "ROUNDING ERROR", color: p.leverage, line: "the same bill is invisible to the incumbent the rulebook feared" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V30 · The Compliance Regressive Tax"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {f.short} · {pct(share)} OF BUDGET
        </span>
      }
      caption={
        <>
          The Brussels Effect, inverted. The <span style={{ color: p.leverage }}>same ~€690k</span> of
          AI-Act high-risk conformity (€200k–600k), a QMS (€193k–330k) and ~€29k/yr per model is a fixed
          cost, so as a <span style={{ color: p.squeeze }}>share of budget</span> it plunges from over 170%
          for a seed startup to ~0.0006% for a hyperscaler. Scrub firm size, range, ←/→, and watch the
          moat aimed at the giants land as a <span style={{ color: p.squeeze }}>regressive tax</span> on
          Europe&rsquo;s own challengers: GDPR already cut US-led EU venture deals ~20.6%, and the regime
          costs ~€3.3bn/yr EU-wide. Sources: NBER WP&nbsp;33909 (2025); DIGITALEUROPE; CEPS.
        </>
      }
    >
      {/* firm selector — native tablist, keyboard-reachable */}
      <div
        role="tablist"
        aria-label="Choose a firm size"
        onKeyDown={onKey}
        className="mb-3 flex flex-wrap gap-1.5 px-1"
      >
        {FIRMS.map((s, idx) => {
          const active = idx === i
          const lethal = shareOf(s.budget) >= FATAL
          const tint = lethal ? p.squeeze : p.leverage
          return (
            <button
              key={s.key}
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
                border: `1px solid ${active ? tint : p.hair}`,
                background: active ? tint : "transparent",
                fontWeight: active ? 700 : 400,
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`The fixed ~€690k EU compliance bill as a share of a firm's annual budget, by firm size. At ${f.label} (budget ${eur(
          f.budget,
        )}), the same bill is ${pct(share)} of budget, ${
          fatal ? "fatal to the challenger" : "a survivable or negligible cost"
        }. The curve plunges from over 170% for a seed startup to ~0.0006% for a hyperscaler: a regressive tax that drowns the small and is invisible to the incumbent.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="rt-burden" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.42} />
            <stop offset="100%" stopColor={p.squeezeHi} stopOpacity={0.06} />
          </linearGradient>
        </defs>

        {/* HEADLINE — the price tag of the regime, two mono figures up top */}
        <text x={PADL} y={34} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          The fixed bill · AI-Act high-risk + QMS + per-model
        </text>
        <text x={PADL - 3} y={84} fill={p.leverage} style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {eur(FIXED_COST)}
        </text>
        <text x={PADL} y={108} fill={p.muted} style={{ fontSize: 12.5 }}>
          ≈ constant across every firm size
        </text>

        <text x={W - PADR} y={34} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          What the regime already cost
        </text>
        <text x={W - PADR + 1} y={70} textAnchor="end" fill={p.squeeze} style={{ fontSize: 19, fontWeight: 800 }}>
          −{GDPR_DEAL_CUT}%
        </text>
        <text x={W - PADR} y={88} textAnchor="end" fill={p.muted} style={{ fontSize: 11.5 }}>
          US-led EU venture deals, post-GDPR (NBER 2025)
        </text>
        <text x={W - PADR + 1} y={114} textAnchor="end" fill={p.squeezeHi} style={{ fontSize: 18, fontWeight: 700 }}>
          €{AIACT_ANNUAL_BN}bn/yr
        </text>
        <text x={W - PADR} y={130} textAnchor="end" fill={p.muted} style={{ fontSize: 11.5 }}>
          EU-wide AI-Act compliance (DIGITALEUROPE)
        </text>

        {/* Y decade gridlines + labels */}
        {yTicks.map((s) => (
          <g key={`y-${s}`}>
            <line x1={PADL} y1={yFor(s)} x2={W - PADR} y2={yFor(s)} stroke={p.hair} strokeWidth={1} />
            <text x={PADL - 8} y={yFor(s) + 3.5} textAnchor="end" fill={p.soft} style={{ fontSize: 10 }}>
              {pct(s)}
            </text>
          </g>
        ))}

        {/* the fatal threshold — the raised drawbridge */}
        <line
          x1={PADL}
          y1={fatalY}
          x2={W - PADR}
          y2={fatalY}
          stroke={p.squeeze}
          strokeWidth={1.2}
          strokeDasharray="2 5"
        />
        <text x={W - PADR} y={fatalY - 7} textAnchor="end" fill={p.squeezeHi} style={{ fontSize: 10.5, letterSpacing: "0.12em" }}>
          25% OF BUDGET, EFFECTIVELY FATAL
        </text>

        {/* burden region + the regressive curve */}
        <path d={burdenArea} fill="url(#rt-burden)" />
        <path d={curvePath} fill="none" stroke={p.squeeze} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />

        {/* the drawbridge gutter — where the bill stops being lethal */}
        <line x1={fatalX} y1={PLOT_TOP} x2={fatalX} y2={PLOT_BOT} stroke={rgba(p.glowRGB, 0.2)} strokeWidth={1} />
        <text x={fatalX} y={PLOT_TOP - 6} textAnchor="middle" fill={p.soft} style={{ fontSize: 9.5, letterSpacing: "0.1em" }}>
          DRAWBRIDGE
        </text>

        {/* zone labels */}
        <text x={PADL + 10} y={PLOT_TOP + 22} fill={p.squeezeHi} style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.1em" }}>
          CHALLENGERS DROWN
        </text>
        <text x={W - PADR - 10} y={PLOT_BOT - 12} textAnchor="end" fill={p.leverage} style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.1em" }}>
          INCUMBENTS SHRUG
        </text>

        {/* firm dots + x-axis tick labels */}
        {FIRMS.map((s, idx) => {
          const x = xFor(s.budget)
          const sh = clamp(shareOf(s.budget), SHARE_LO, SHARE_HI)
          const y = yFor(sh)
          const active = idx === i
          const lethal = shareOf(s.budget) >= FATAL
          const tint = lethal ? p.squeeze : p.leverage
          return (
            <g key={s.key}>
              <line x1={x} y1={PLOT_BOT} x2={x} y2={PLOT_BOT + 8} stroke={p.hair} strokeWidth={1} />
              <circle
                cx={x}
                cy={y}
                r={active ? 6.5 : 4}
                fill={active ? tint : p.bg}
                stroke={tint}
                strokeWidth={2}
              />
              <text
                x={x}
                y={PLOT_BOT + 24}
                textAnchor="middle"
                fill={active ? p.ink : p.soft}
                style={{ fontSize: 10.5, fontWeight: active ? 700 : 400, letterSpacing: "0.06em" }}
              >
                {s.short}
              </text>
              <text
                x={x}
                y={PLOT_BOT + 38}
                textAnchor="middle"
                fill={active ? p.muted : p.soft}
                style={{ fontSize: 9.5 }}
              >
                {eur(s.budget)}
              </text>
            </g>
          )
        })}

        {/* x-axis title */}
        <text x={(PADL + W - PADR) / 2} y={H - 56} textAnchor="middle" fill={p.soft} style={{ fontSize: 10, letterSpacing: "0.18em" }}>
          FIRM SIZE · ANNUAL BUDGET (LOG) →
        </text>

        {/* live readout at the active point — absolute (cyan) + share (red) */}
        <g>
          <line x1={cx} y1={cy} x2={cx} y2={PLOT_BOT} stroke={p.hair} strokeWidth={1} />
          <circle cx={cx} cy={cy} r={9} fill="none" stroke={mixHex(p.leverage, p.squeeze, clamp01(share / FATAL))} strokeWidth={1.4} />
          <text
            x={clamp(cx, PADL + 46, W - PADR - 46)}
            y={cy - 18}
            textAnchor="middle"
            fill={fatal ? p.squeezeHi : p.leverageHi}
            style={{ fontSize: 30, fontWeight: 800 }}
          >
            {pct(share)}
          </text>
          <text
            x={clamp(cx, PADL + 46, W - PADR - 46)}
            y={cy - 3}
            textAnchor="middle"
            fill={p.muted}
            style={{ fontSize: 10.5, letterSpacing: "0.08em" }}
          >
            {eur(FIXED_COST)} BILL · {eur(f.budget)} BUDGET
          </text>
        </g>
      </svg>

      {/* verdict + meters + scrub control */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> ·{" "}
          {verdict.line}.
        </p>

        {/* share-of-budget meter — how much of the firm the fixed bill consumes */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${clamp01(share) * 100}%`,
              height: "100%",
              background: mixHex(p.leverage, p.squeeze, clamp01(share / FATAL)),
              transition: reduced ? "none" : "width 360ms ease-out",
            }}
          />
        </div>

        <label className="mt-3 flex items-center gap-3 text-[11px]" style={{ color: p.soft }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze, whiteSpace: "nowrap" }}>
            ◂ SEED
          </span>
          <input
            type="range"
            min={0}
            max={N}
            step={1}
            value={i}
            onChange={(e) => setI(clamp(Number(e.target.value), 0, N))}
            aria-label="Scrub firm size from a seed startup to Big Tech"
            aria-valuetext={`${f.label}, budget ${eur(f.budget)}: the fixed ${eur(
              FIXED_COST,
            )} compliance bill is ${pct(share)} of budget`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: fatal ? p.squeeze : p.leverage, background: p.hair }}
          />
          <span style={{ fontFamily: "var(--font-mono), monospace", color: p.leverage, whiteSpace: "nowrap" }}>
            BIG TECH ▸
          </span>
        </label>
      </div>
    </PlateFrame>
  )
}
