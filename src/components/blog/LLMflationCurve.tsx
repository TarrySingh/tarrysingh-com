"use client"

/**
 * V37 — THE LLMFLATION CURVE  (Chapter 11, "Software 3.0: The Accelerant").
 *
 * The price of intelligence is collapsing — and the returns flow to whoever owns
 * the frontier model and the compute to serve the demand, not to Europe, which
 * owns neither. This is the technology that multiplies every gap in the essay:
 * it rewards scale, capital, cheap energy, data and frontier compute.
 *
 * The instrument is a LOG-SCALE decay curve of the cost of a unit of AI
 * capability across 2023 → 2026. Two tiers fall:
 *   - "GOOD-ENOUGH" budget tier (gold, the deflation wonder): GPT-4-class
 *     ~$30/1M tokens in 2023 → ~$0.03–0.14/1M by 2026 — roughly ~1000× in three
 *     years, ~10× per year.
 *   - FRONTIER-EQUIVALENT (cyan, the capability you actually compete on): a
 *     gentler ~62× over the same window — the cutting edge stays dear.
 *
 * The reader scrubs the date; a mono readout shows the plummeting $/Mtok on the
 * log axis. Then the JEVONS TWIST: a second, RISING red curve — as price falls,
 * demand explodes (Goldman ~24× token demand by 2030; enterprise AI budgets
 * +5.8× even as prices fell ~65%). The two curves cross.
 *
 * REVEAL: intelligence deflating toward zero does not democratise power — it
 * concentrates it on whoever owns the frontier model and the compute to serve
 * the exploding demand. Europe owns neither.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the ▶ sweep is gated; reduced → the full curve stands in),
 * keyboard-reachable (native range + ▶ + ←/→), and meaningful at its default
 * (curves fully drawn, scrubber at the present) as the static fallback.
 *
 * Figures hard-coded. Sources: a16z (LLMflation); Epoch AI (price trends);
 * Goldman Sachs (token demand).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  logScale,
  clamp,
  clamp01,
  lerp,
  smoothPath,
} from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

type Point = {
  /** decimal year, e.g. 2024.5 */
  t: number
  label: string
  /** good-enough budget tier $/1M tokens (gold) */
  budget: number
  /** frontier-equivalent $/1M tokens (cyan) */
  frontier: number
  /** relative token-demand index, 1 = 2023 baseline (red, Jevons) */
  demand: number
}

// The decay: budget tier ~10×/yr (~1000× over 3 yrs); frontier ~62× over window;
// demand rises ~24× toward 2030 (we plot the 2023→2026 leg of that ramp).
// (a16z LLMflation; Epoch AI; Goldman Sachs.)
const SERIES: Point[] = [
  { t: 2023.0, label: "2023", budget: 30.0, frontier: 60.0, demand: 1.0 },
  { t: 2023.5, label: "mid-23", budget: 9.0, frontier: 36.0, demand: 1.7 },
  { t: 2024.0, label: "2024", budget: 2.5, frontier: 18.0, demand: 3.1 },
  { t: 2024.5, label: "mid-24", budget: 0.75, frontier: 9.5, demand: 5.4 },
  { t: 2025.0, label: "2025", budget: 0.27, frontier: 4.2, demand: 9.0 },
  { t: 2025.5, label: "mid-25", budget: 0.11, frontier: 1.9, demand: 14.0 },
  { t: 2026.0, label: "2026", budget: 0.06, frontier: 0.97, demand: 21.0 },
]
const N = SERIES.length

// Headline figures (hard-coded from the spec).
const BUDGET_DROP = 1000 // ~1000× cheaper, good-enough tier
const FRONTIER_DROP = 62 // ~62× cheaper, frontier-equivalent
const DEMAND_MULT = 24 // ~24× token demand by 2030 (Goldman)
const PRICE_FALL_PCT = 65 // enterprise prices fell ~65% …
const BUDGET_GROW = 5.8 // … even as AI budgets grew +5.8×

// Plot frame (viewBox units).
const W = 940
const H = 560
const PADL = 78
const PADR = 78
const PADT = 150
const PADB = 96
const PLOT_TOP = PADT
const PLOT_BOT = H - PADB

// Price axis: LOG, $/1M tokens, 0.03 → 60. Demand axis: linear, 1 → 24.
const T0 = SERIES[0].t
const T1 = SERIES[N - 1].t
const xFor = linScale(T0, T1, PADL, W - PADR)
const yPrice = logScale(0.03, 60, PLOT_BOT, PLOT_TOP)
const yDemand = linScale(1, DEMAND_MULT, PLOT_BOT, PLOT_TOP)

// Decade gridlines on the log price axis.
const PRICE_TICKS = [30, 3, 0.3, 0.03]
const fmtUSD = (v: number) =>
  v >= 1 ? `$${v.toFixed(v >= 10 ? 0 : 1)}` : `$${v.toFixed(v >= 0.1 ? 2 : 3)}`

export function LLMflationCurve() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // i ∈ [0, N-1] — the scrubbed date. Default: the present (full curve drawn).
  const [i, setI] = useState(N - 1)
  const [playing, setPlaying] = useState(false)
  const d = SERIES[i]

  // ▶ — mechanical sweep across the timeline. Off under reduced motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (i >= N - 1) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setI((v) => clamp(v + 1, 0, N - 1)), 760)
    return () => window.clearTimeout(id)
  }, [playing, reduced, i])

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setPlaying(false)
      setI((v) => clamp(v + 1, 0, N - 1))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setPlaying(false)
      setI((v) => clamp(v - 1, 0, N - 1))
    } else if (e.key === "Home") {
      e.preventDefault()
      setPlaying(false)
      setI(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setPlaying(false)
      setI(N - 1)
    }
  }

  function play() {
    if (reduced) {
      setI(N - 1)
      return
    }
    if (i >= N - 1) setI(0)
    setPlaying(true)
  }

  // Curves (full domain, always drawn — the static verdict).
  const budgetPts: Array<[number, number]> = SERIES.map((s) => [xFor(s.t), yPrice(s.budget)])
  const frontierPts: Array<[number, number]> = SERIES.map((s) => [xFor(s.t), yPrice(s.frontier)])
  const demandPts: Array<[number, number]> = SERIES.map((s) => [xFor(s.t), yDemand(s.demand)])
  const budgetPath = smoothPath(budgetPts)
  const frontierPath = smoothPath(frontierPts)
  const demandPath = smoothPath(demandPts)

  // The crossover: where the falling budget price meets the rising demand index
  // on screen (the Jevons pivot). Found by scanning the y-positions for a sign
  // flip between the two curves' screen heights.
  let crossX = xFor(T1)
  let crossY = (yPrice(SERIES[N - 1].budget) + yDemand(SERIES[N - 1].demand)) / 2
  for (let k = 0; k < N - 1; k++) {
    const aDiff = yPrice(SERIES[k].budget) - yDemand(SERIES[k].demand)
    const bDiff = yPrice(SERIES[k + 1].budget) - yDemand(SERIES[k + 1].demand)
    if (aDiff * bDiff <= 0 && aDiff !== bDiff) {
      const f = aDiff / (aDiff - bDiff)
      crossX = lerp(xFor(SERIES[k].t), xFor(SERIES[k + 1].t), clamp01(f))
      crossY = lerp(yPrice(SERIES[k].budget), yPrice(SERIES[k + 1].budget), clamp01(f))
      break
    }
  }

  // Live markers at the scrubbed date.
  const px = xFor(d.t)
  const budgetY = yPrice(d.budget)
  const frontierY = yPrice(d.frontier)
  const demandY = yDemand(d.demand)

  // How far the budget tier has deflated from the 2023 baseline (×).
  const budgetFold = SERIES[0].budget / d.budget
  const pastCross = px >= crossX

  const verdict =
    i === 0
      ? { word: "DEAR", color: p.wonder, line: "intelligence still costs real money; the deflation has barely begun" }
      : !pastCross
        ? { word: "DEFLATING", color: p.wonderHi, line: "price falls ~10× a year while demand climbs to meet it" }
        : { word: "CONCENTRATED", color: p.squeeze, line: "the cheaper it gets, the more it concentrates on whoever owns the frontier and the compute" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V37 · The LLMflation Curve"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {d.label} · {fmtUSD(d.budget)}/Mtok · ↓{Math.round(budgetFold)}×
        </span>
      }
      caption={
        <>
          The price of intelligence is collapsing, and the returns flow to whoever owns the frontier and the
          compute. Scrub the date (range, ▶ or ←/→) and watch the{" "}
          <span style={{ color: p.wonder }}>good-enough tier</span> fall ~10× a year (~{BUDGET_DROP}× over three
          years) on the log axis, while the{" "}
          <span style={{ color: p.leverage }}>frontier-equivalent</span> falls a gentler ~{FRONTIER_DROP}×. As
          price drops, a <span style={{ color: p.squeeze }}>rising red demand curve</span> (~{DEMAND_MULT}× tokens
          by 2030; budgets +{BUDGET_GROW}× even as prices fell ~{PRICE_FALL_PCT}%) crosses it. Cheaper
          intelligence concentrates power; it does not democratise it. Europe owns neither the frontier model nor
          the compute. Sources: a16z (LLMflation); Epoch AI (price trends); Goldman Sachs (token demand).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Log-scale curve of the cost of AI capability, 2023 to 2026. At ${d.label}, the good-enough tier costs about ${fmtUSD(
          d.budget,
        )} per million tokens, roughly ${Math.round(
          budgetFold,
        )} times cheaper than 2023, while the frontier-equivalent costs about ${fmtUSD(
          d.frontier,
        )}. As price falls, token demand rises to about ${d.demand.toFixed(
          1,
        )} times its 2023 level. The falling price and rising demand cross: cheaper intelligence concentrates power on whoever owns the frontier model and the compute, and Europe owns neither.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="llmf-budget" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={0.42} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0.04} />
          </linearGradient>
          <radialGradient id="llmf-cross" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={pastCross ? 0.3 : 0.14} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* THE READOUT — plummeting $/Mtok (gold) + rising demand (red) */}
        <text x={PADL} y={48} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Good-enough intelligence · {d.label}
        </text>
        <text x={PADL - 3} y={108} fill={p.wonderHi} style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {fmtUSD(d.budget)}
        </text>
        <text x={PADL} y={132} fill={p.muted} style={{ fontSize: 12.5 }}>
          per 1M tokens · ↓{Math.round(budgetFold)}× since 2023 · ~10×/yr
        </text>

        <text x={W - PADR} y={48} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Token demand · index
        </text>
        <text x={W - PADR + 3} y={108} textAnchor="end" fill={p.squeeze} style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {d.demand.toFixed(1)}×
        </text>
        <text x={W - PADR} y={132} textAnchor="end" fill={p.muted} style={{ fontSize: 12.5 }}>
          vs 2023 · heading for ~{DEMAND_MULT}× by 2030
        </text>

        {/* log-decade gridlines + $/Mtok ticks (price axis, left) */}
        {PRICE_TICKS.map((v) => (
          <g key={`pt-${v}`}>
            <line x1={PADL} y1={yPrice(v)} x2={W - PADR} y2={yPrice(v)} stroke={p.hair} strokeWidth={1} strokeDasharray="2 6" />
            <text x={PADL - 10} y={yPrice(v) + 4} textAnchor="end" fill={p.soft} style={{ fontSize: 10.5 }}>
              {fmtUSD(v)}
            </text>
          </g>
        ))}

        {/* baseline + year ticks (x axis) */}
        <line x1={PADL} y1={PLOT_BOT} x2={W - PADR} y2={PLOT_BOT} stroke={p.hair} strokeWidth={1.4} />
        {SERIES.map((s) => (
          <g key={`xt-${s.t}`}>
            <line x1={xFor(s.t)} y1={PLOT_BOT} x2={xFor(s.t)} y2={PLOT_BOT + 7} stroke={p.hair} strokeWidth={1} />
            <text
              x={xFor(s.t)}
              y={PLOT_BOT + 24}
              textAnchor="middle"
              fill={s.t === d.t ? p.ink : p.soft}
              style={{ fontSize: 10.5, fontWeight: s.t === d.t ? 700 : 400, letterSpacing: "0.04em" }}
            >
              {s.label}
            </text>
          </g>
        ))}

        {/* the crossover bloom + Jevons pivot hairline */}
        <rect x={crossX - 90} y={crossY - 90} width={180} height={180} fill="url(#llmf-cross)" />
        <line x1={crossX} y1={PLOT_TOP} x2={crossX} y2={PLOT_BOT} stroke={rgba(p.glowRGB, 0.18)} strokeWidth={1} strokeDasharray="4 4" />
        <circle cx={crossX} cy={crossY} r={5} fill={p.squeeze} stroke={p.bg} strokeWidth={1.6} />
        <text x={crossX} y={crossY - 14} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em" }}>
          THE JEVONS PIVOT
        </text>

        {/* RISING demand curve (red) — the more it falls, the more we use */}
        <path d={demandPath} fill="none" stroke={p.squeeze} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="1 7" strokeLinejoin="round" />

        {/* fill under the falling budget tier — the deflation wonder */}
        <path d={`${budgetPath} L ${xFor(T1)} ${PLOT_BOT} L ${xFor(T0)} ${PLOT_BOT} Z`} fill="url(#llmf-budget)" />

        {/* FALLING frontier-equivalent (cyan, the capability you compete on) */}
        <path d={frontierPath} fill="none" stroke={p.leverage} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="9 5" />

        {/* FALLING good-enough budget tier (gold — the headline collapse) */}
        <path d={budgetPath} fill="none" stroke={p.wonder} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

        {/* inline series labels */}
        <text x={xFor(SERIES[1].t)} y={yPrice(SERIES[1].frontier) - 12} fill={p.leverage} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
          FRONTIER-EQUIVALENT · ↓{FRONTIER_DROP}×
        </text>
        <text x={xFor(SERIES[3].t)} y={yPrice(SERIES[3].budget) + 26} fill={p.wonderHi} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
          GOOD-ENOUGH · ↓~{BUDGET_DROP}×
        </text>
        <text x={xFor(SERIES[N - 2].t)} y={yDemand(SERIES[N - 2].demand) - 12} textAnchor="end" fill={p.squeezeHi} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
          DEMAND ↑
        </text>

        {/* static dots along each curve */}
        {SERIES.map((s) => (
          <g key={`dots-${s.t}`} opacity={0.85}>
            <circle cx={xFor(s.t)} cy={yPrice(s.budget)} r={2.4} fill={p.wonder} />
            <circle cx={xFor(s.t)} cy={yDemand(s.demand)} r={2.2} fill={p.squeeze} />
          </g>
        ))}

        {/* live scrub line + markers at the chosen date */}
        <line x1={px} y1={PLOT_TOP} x2={px} y2={PLOT_BOT} stroke={p.blueprint} strokeWidth={1.4} />
        <circle cx={px} cy={frontierY} r={5} fill={p.bg} stroke={p.leverage} strokeWidth={2.4} />
        <circle cx={px} cy={demandY} r={5} fill={p.bg} stroke={p.squeeze} strokeWidth={2.4} />
        <circle cx={px} cy={budgetY} r={7} fill={p.wonder} stroke={p.bg} strokeWidth={2} />
        <circle cx={px} cy={budgetY} r={13} fill="none" stroke={rgba(p.glowRGB, 0.35)} strokeWidth={1} />

        {/* live $/Mtok callout pinned to the budget marker */}
        <text
          x={clamp(px, PADL + 36, W - PADR - 36)}
          y={budgetY + 30}
          textAnchor="middle"
          fill={p.wonderHi}
          style={{ fontSize: 18, fontWeight: 800 }}
        >
          {fmtUSD(d.budget)}/Mtok
        </text>

        {/* the active beat — a single status line under the readout */}
        <text x={W / 2} y={PADT - 16} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.03em" }}>
          {pastCross
            ? "price and demand have crossed, deflation now concentrates, it does not democratise"
            : "the good-enough tier is in free-fall · drag toward the present ▸"}
        </text>
      </svg>

      {/* verdict + scrubber */}
      <div className="mt-2 px-1" onKeyDown={onKey}>
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the timeline sweep" : "Play the timeline, sweeping the price collapse from 2023 to the present"}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: p.wonderHi,
              border: `1px solid ${p.wonder}`,
              background: "transparent",
            }}
          >
            {playing ? "❙❙ pause" : "▶ play"}
          </button>
          <input
            type="range"
            min={0}
            max={N - 1}
            step={1}
            value={i}
            onChange={(e) => {
              setPlaying(false)
              setI(clamp(Number(e.target.value), 0, N - 1))
            }}
            aria-label="Scrub the date from 2023 to 2026 and read the falling price of AI capability"
            aria-valuetext={`${d.label}: good-enough tier ${fmtUSD(d.budget)} per million tokens, ${Math.round(
              budgetFold,
            )} times cheaper than 2023; token demand ${d.demand.toFixed(1)} times its 2023 level`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: pastCross ? p.squeeze : p.wonder, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {d.label}
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
