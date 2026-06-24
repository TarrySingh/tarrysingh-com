"use client"

/**
 * V33 — THE VALUE-CAPTURE WATERFALL  (Chapter 10, "The Quarter-Trillion Tribute:
 * The Wealth-Transfer Ledger").
 *
 * Europe books the wages; America keeps the compounding. Of the cloud/software
 * value the European digital economy consumes, ~€264bn a year flows out to US
 * providers — about 80–83% of EU professional cloud spend, with ~70% going to
 * the three US hyperscalers (AWS, Azure, Google).
 *
 * This instrument is a waterfall on a 100-unit bar of consumed value (cyan).
 * The reader scrubs / steps the deductions and each red step carves value away
 * and ships it abroad:
 *
 *   100  value the European digital economy consumes (cyan)
 *   −44  cloud & licence fees to US hyperscalers (AWS / Azure / Google)
 *   −20  the rest of US cloud + SaaS / licence fees
 *   −18  the IP & gross margin, booked in the US
 *   −10  the equity that compounds in US capital markets
 *   = 8  RETAINED IN EUROPE — wages, reseller margin, data-centre construction
 *
 * A mono readout shows €264bn/yr leaving and the retained share collapsing from
 * 100 toward a thin cyan sliver (~8 of 100 at full run; the retained band is
 * roughly 15–30 before the equity & IP layers compound away).
 *
 * REVEAL: Europe keeps the basis points and ships the compounding — a quarter-
 * trillion-euro tribute, billed annually, renewed by default.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the ▶ loop is gated; reduced → the fully-run ledger stands in),
 * keyboard-reachable (native range + ▶ + ←/→), and meaningful at its default
 * (the full waterfall already carved) as the static fallback.
 *
 * Figures hard-coded. Sources: Asterès / Cigref-Numeum (~€264bn, ~80% of EU
 * professional cloud spend to US providers); Synergy Research (~70% to the
 * three US hyperscalers).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  clamp,
  clamp01,
  lerp,
} from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

// The headline tribute and the unit bar it is normalised against.
const TRIBUTE_EUR = 264 // €bn/yr flowing to US providers (Asterès / Cigref-Numeum)
const HYPERSCALER_PCT = 70 // % of EU professional cloud spend to AWS/Azure/Google (Synergy)

type Step = {
  key: string
  // the deduction this step carves away, in units of the 100-unit bar
  cut: number
  label: string
  detail: string
}

// The waterfall: a 100-unit bar stepped down by red deductions to a thin
// retained sliver. Cuts sum to 92 → ~8 retained in Europe at full run.
const STEPS: Step[] = [
  { key: "hyper", cut: 44, label: "US hyperscaler fees", detail: "AWS · Azure · Google — ~70% of cloud spend" },
  { key: "saas", cut: 20, label: "Other US cloud & SaaS", detail: "the rest of US cloud + licence fees" },
  { key: "ip", cut: 18, label: "IP & gross margin", detail: "booked in the United States" },
  { key: "equity", cut: 10, label: "Equity compounding", detail: "shares appreciate in US capital markets" },
]
const N = STEPS.length

const TOTAL_CUT = STEPS.reduce((s, st) => s + st.cut, 0) // 92
const RETAINED_FLOOR = 100 - TOTAL_CUT // 8

// Plot frame (viewBox units).
const W = 920
const H = 540
const PADL = 70
const PADR = 70
const PADT = 150
const PADB = 116
const PLOT_TOP = PADT
const PLOT_BOT = H - PADB

// 0 units at the floor, 100 units at the top of the plot.
const yFor = linScale(0, 100, PLOT_BOT, PLOT_TOP)

// Column band: the source bar, then one column per deduction, then the sliver.
const COLS = N + 2 // start + N cuts + retained
const colX = linScale(0, COLS - 1, PADL, W - PADR)
const COL_W = ((W - PADL - PADR) / COLS) * 0.6

const fmtUnit = (v: number) => (Math.round(v * 10) / 10).toFixed(v < 10 ? 0 : 0)

export function ValueCaptureWaterfall() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // step ∈ [0, N] — how many deductions have been carved. Default: fully run.
  const [step, setStep] = useState(N)
  const [playing, setPlaying] = useState(false)

  // ▶ — mechanical advance, one deduction per tick. Off under reduced motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= N) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => clamp(s + 1, 0, N)), 1000)
    return () => window.clearTimeout(id)
  }, [playing, reduced, step])

  // Value still standing in the European bar after `step` deductions.
  const cutSoFar = STEPS.slice(0, step).reduce((s, st) => s + st.cut, 0)
  const retained = 100 - cutSoFar
  const shippedShare = cutSoFar / 100
  const eurOut = Math.round(TRIBUTE_EUR * shippedShare)
  const tight = clamp01(step / N)

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setPlaying(false)
      setStep((v) => clamp(v + 1, 0, N))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setPlaying(false)
      setStep((v) => clamp(v - 1, 0, N))
    } else if (e.key === "Home") {
      e.preventDefault()
      setPlaying(false)
      setStep(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setPlaying(false)
      setStep(N)
    }
  }

  function play() {
    if (reduced) {
      setStep(N)
      return
    }
    if (step >= N) setStep(0)
    setPlaying(true)
  }

  const verdict =
    step === 0
      ? { word: "BOOKED IN FULL", color: p.leverage, line: "every unit of value still stands in the European ledger" }
      : step < N
        ? { word: "CARVED AWAY", color: p.squeezeHi, line: "each step ships another slice abroad — billed annually, renewed by default" }
        : { word: "THE TRIBUTE", color: p.squeeze, line: "Europe keeps the basis points and ships the compounding" }

  // Running top-of-bar as deductions stack: the cyan that survives each step.
  let runningTop = 100
  const ledger = STEPS.map((st, i) => {
    const before = runningTop
    runningTop -= st.cut
    return { ...st, i, before, after: runningTop, x: colX(i + 1) }
  })

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V33 · The Value-Capture Waterfall"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          €{eurOut}bn OUT · {fmtUnit(retained)} KEPT
        </span>
      }
      caption={
        <>
          Of the cloud &amp; software value Europe consumes,{" "}
          <span style={{ color: p.squeeze }}>~€{TRIBUTE_EUR}bn a year</span> flows to US providers — about
          80–83% of EU professional cloud spend, ~{HYPERSCALER_PCT}% to the three US hyperscalers. Scrub the
          waterfall — range, ▶ or ←/→ — and watch the{" "}
          <span style={{ color: p.leverage }}>100-unit cyan bar</span> step down through{" "}
          <span style={{ color: p.squeeze }}>red deductions</span> to the thin sliver{" "}
          <span style={{ color: p.leverage }}>retained in Europe</span> (the wages, the reseller margin, the
          data-centre construction). Sources: Asterès / Cigref-Numeum (~€{TRIBUTE_EUR}bn, ~80%); Synergy
          Research (~{HYPERSCALER_PCT}% hyperscaler).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Value-capture waterfall on the European digital economy. After ${step} of ${N} deductions, ${fmtUnit(
          retained,
        )} of every 100 units of consumed value is retained in Europe and ${fmtUnit(
          cutSoFar,
        )} has been shipped to US providers — about €${eurOut} billion of the ~€${TRIBUTE_EUR} billion annual tribute. At full run only ~${RETAINED_FLOOR} of 100 stays: Europe keeps the basis points and ships the compounding.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="vcw-keep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.5} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.16} />
          </linearGradient>
          <linearGradient id="vcw-cut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={0.4} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0.14} />
          </linearGradient>
          <radialGradient id="vcw-veto" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={lerp(0, 0.22, tight)} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* THE READOUT — €bn shipped out + retained share */}
        <text x={PADL} y={52} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Shipped to US providers · per year
        </text>
        <text x={PADL - 3} y={108} fill={p.squeeze} style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-0.01em" }}>
          €{eurOut}bn
        </text>
        <text x={PADL} y={132} fill={p.muted} style={{ fontSize: 12.5 }}>
          of the ~€{TRIBUTE_EUR}bn annual tribute · {Math.round(shippedShare * 100)}% of value consumed
        </text>

        <text x={W - PADR} y={52} textAnchor="end" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Retained in Europe · per 100
        </text>
        <text x={W - PADR + 3} y={108} textAnchor="end" fill={p.leverageHi} style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {fmtUnit(retained)}
        </text>
        <text x={W - PADR} y={132} textAnchor="end" fill={p.muted} style={{ fontSize: 12.5 }}>
          wages · reseller margin · data-centre build
        </text>

        {/* baseline + faint 100-unit reference frame */}
        <line x1={PADL - 18} y1={PLOT_BOT} x2={W - PADR + 18} y2={PLOT_BOT} stroke={p.hair} strokeWidth={1.4} />
        <line
          x1={PADL - 18}
          y1={yFor(100)}
          x2={W - PADR + 18}
          y2={yFor(100)}
          stroke={p.blueprint}
          strokeWidth={1}
          strokeDasharray="2 6"
        />
        <text x={W - PADR + 18} y={yFor(100) - 7} textAnchor="end" fill={p.soft} style={{ fontSize: 10, letterSpacing: "0.12em" }}>
          100 · VALUE CONSUMED
        </text>

        {/* THE SOURCE BAR — value the European digital economy consumes (cyan) */}
        {(() => {
          const x = colX(0)
          return (
            <g>
              <rect
                x={x - COL_W / 2}
                y={yFor(100)}
                width={COL_W}
                height={yFor(0) - yFor(100)}
                rx={4}
                fill="url(#vcw-keep)"
                stroke={p.leverage}
                strokeWidth={1.6}
              />
              <text x={x} y={yFor(100) - 14} textAnchor="middle" fill={p.leverageHi} style={{ fontSize: 22, fontWeight: 800 }}>
                100
              </text>
              <text x={x} y={PLOT_BOT + 24} textAnchor="middle" fill={p.muted} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em" }}>
                CONSUMED
              </text>
            </g>
          )
        })()}

        {/* THE DEDUCTIONS — each red step carves value away and ships it abroad */}
        {ledger.map((d) => {
          const done = d.i < step
          const here = d.i === step - 1
          const topY = yFor(d.before)
          const botY = yFor(d.after)
          const h = botY - topY
          const prevX = d.i === 0 ? colX(0) : ledger[d.i - 1].x
          return (
            <g key={d.key} opacity={done ? 1 : 0.26}>
              {/* connector from the previous bar-top down to this step */}
              <line
                x1={prevX + COL_W / 2}
                y1={topY}
                x2={d.x - COL_W / 2}
                y2={topY}
                stroke={done ? p.squeeze : p.hair}
                strokeWidth={1.2}
                strokeDasharray="3 3"
              />
              {/* the carved red slab — value leaving Europe */}
              <rect
                x={d.x - COL_W / 2}
                y={topY}
                width={COL_W}
                height={Math.max(h, 2)}
                rx={3}
                fill={done ? "url(#vcw-cut)" : "none"}
                stroke={done ? (here ? p.squeezeHi : p.squeeze) : p.hair}
                strokeWidth={here ? 2.2 : 1.4}
              />
              {/* an outbound arrow — the slice shipped to the US */}
              {done && (
                <text x={d.x} y={(topY + botY) / 2 + 4} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: h > 26 ? 15 : 11, fontWeight: 800 }}>
                  −{d.cut}
                </text>
              )}
              {/* the surviving cyan beneath this cut */}
              <rect
                x={d.x - COL_W / 2}
                y={botY}
                width={COL_W}
                height={PLOT_BOT - botY}
                rx={3}
                fill="url(#vcw-keep)"
                fillOpacity={done ? 0.7 : 0.12}
                stroke={done ? p.leverage : p.hair}
                strokeWidth={done ? 1.2 : 0.8}
              />
              <text
                x={d.x}
                y={PLOT_BOT + 24}
                textAnchor="middle"
                fill={here ? p.squeezeHi : done ? p.muted : p.soft}
                style={{ fontSize: 9.5, fontWeight: here ? 700 : 400, letterSpacing: "0.02em" }}
              >
                {d.label.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* THE RETAINED SLIVER — what actually stays in Europe */}
        {(() => {
          const x = colX(COLS - 1)
          const topY = yFor(retained)
          const lastX = ledger[N - 1].x
          return (
            <g>
              <rect x={x - COL_W * 1.2} y={topY - 18} width={COL_W * 2.4} height={PLOT_BOT - topY + 18} fill="url(#vcw-veto)" />
              <line
                x1={lastX + COL_W / 2}
                y1={topY}
                x2={x - COL_W / 2}
                y2={topY}
                stroke={step >= N ? p.leverage : p.hair}
                strokeWidth={1.2}
                strokeDasharray="3 3"
              />
              <rect
                x={x - COL_W / 2}
                y={topY}
                width={COL_W}
                height={Math.max(PLOT_BOT - topY, 3)}
                rx={3}
                fill="url(#vcw-keep)"
                stroke={p.leverageHi}
                strokeWidth={2}
              />
              <text x={x} y={topY - 12} textAnchor="middle" fill={p.leverageHi} style={{ fontSize: 24, fontWeight: 800 }}>
                {fmtUnit(retained)}
              </text>
              <text x={x} y={PLOT_BOT + 24} textAnchor="middle" fill={step >= N ? p.leverageHi : p.soft} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em" }}>
                RETAINED
              </text>
            </g>
          )
        })()}

        {/* the active step's detail line, anchored under the readout */}
        <text x={W / 2} y={PADT - 18} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.04em" }}>
          {step === 0
            ? "100 units stand — nothing carved yet · step the deductions ▸"
            : `${STEPS[clamp(step - 1, 0, N - 1)].label}: −${STEPS[clamp(step - 1, 0, N - 1)].cut} · ${STEPS[clamp(step - 1, 0, N - 1)].detail}`}
        </text>
      </svg>

      {/* meter + verdict + scrubber */}
      <div className="mt-2 px-1" onKeyDown={onKey}>
        {/* retained-cyan ⟷ shipped-red meter */}
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${retained}%`,
              height: "100%",
              background: p.leverage,
              float: "left",
              transition: reduced ? "none" : "width 520ms ease-out",
            }}
          />
          <div
            style={{
              width: `${cutSoFar}%`,
              height: "100%",
              background: p.squeeze,
              float: "left",
              transition: reduced ? "none" : "width 520ms ease-out",
            }}
          />
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* scrubber + play — the reader carves the waterfall */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the waterfall" : "Play the waterfall, carving each deduction in turn"}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: p.squeezeHi,
              border: `1px solid ${p.squeeze}`,
              background: "transparent",
            }}
          >
            {playing ? "❙❙ pause" : "▶ play"}
          </button>
          <input
            type="range"
            min={0}
            max={N}
            value={step}
            onChange={(e) => {
              setPlaying(false)
              setStep(clamp(Number(e.target.value), 0, N))
            }}
            aria-label="Scrub the value-capture waterfall from the full 100-unit bar to the retained sliver"
            aria-valuetext={
              step === 0
                ? "Nothing carved: 100 of 100 units retained in Europe"
                : `${step} of ${N} deductions: ${fmtUnit(retained)} of 100 retained, €${eurOut}bn shipped to US providers`
            }
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: step >= N ? p.squeeze : p.leverage, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {step}/{N} cuts
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
