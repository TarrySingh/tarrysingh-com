"use client"

/**
 * V5 — THE TWO CLOCKS  (Chapter 1).
 *
 * Two interlocking gear-dials. A FRANTIC 4-year POLITICAL clock (the
 * election / coalition cycle) is geared to a FROZEN ~40-year ASSET clock —
 * the horizon strategic industry and infrastructure actually need. The reader
 * spins the political dial; the asset clock barely creeps. At every 4-year
 * reset the long-term STRATEGY (a progress arc) is knocked back to zero and a
 * VOLATILITY PREMIUM meter ticks up: the compounding cost of short-termism.
 *
 * The concrete casualty rides along — the €20bn Nationaal Groeifonds (the Dutch
 * National Growth Fund), a 40-year-horizon vehicle wound down — final €6.8bn cut, 2024 — one cycle in. When
 * a reset lands on it, it flies off the rails.
 *
 * REVEAL: you cannot build a 40-year capability on a 4-year attention span.
 *
 * Theme-aware (re-renders on the Read-mode flip), reduced-motion safe (auto-spin
 * gates on the OS preference; when reduced, the meaningful end-state — several
 * cycles in, strategy wrecked, premium high — renders static). Keyboard-reachable
 * (native range + step buttons). Renders meaningfully at its default.
 *
 * Data: 4-year political cycle vs ~40-year asset horizon; the €20bn
 * Nationaal Groeifonds. Source: Dutch competitiveness deck (B03 / B04, p34 / p49).
 */

import { useEffect, useRef, useState } from "react"

import { PlateFrame, useReadMode, usePrefersReducedMotion, clamp, clamp01, lerp, easeOut } from "./read-chart-kit"
import { cpPalette, rgba } from "./chokepoint-kit"

// ── geometry ────────────────────────────────────────────────────────────────
const POL = { cx: 250, cy: 300, r: 120 } // frantic political dial
const ASSET = { cx: 670, cy: 300, r: 168 } // frozen asset dial

const POLITICAL_CYCLE = 4 // years per election / coalition
const ASSET_HORIZON = 40 // years a strategic asset actually needs
const MAX_YEARS = 40 // one full spin of the political dial = the asset's life
const GROEIFONDS_YEAR = 4 // the Nationaal Groeifonds is wound down at the first reset

// gear teeth — the frantic dial is geared 1:10 to the frozen one
const POL_TEETH = 12
const ASSET_TEETH = 120

function gearPath(cx: number, cy: number, r: number, teeth: number, depth: number): string {
  const rOuter = r
  const rInner = r - depth
  const pts: string[] = []
  const seg = (Math.PI * 2) / (teeth * 2)
  for (let i = 0; i < teeth * 2; i++) {
    const a = i * seg - Math.PI / 2
    const rr = i % 2 === 0 ? rOuter : rInner
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  pts.push("Z")
  return pts.join(" ")
}

export function TwoClocks() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // the user spins the political dial in YEARS [0 .. MAX_YEARS]
  const [year, setYear] = useState(reduced ? 13 : 0)

  // auto-spin only when motion is allowed AND the dial hasn't run out
  const [spinning, setSpinning] = useState(false)
  useEffect(() => {
    if (reduced || !spinning) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setYear((y) => {
        const ny = y + dt * 2.6 // years per second
        if (ny >= MAX_YEARS) {
          setSpinning(false)
          return MAX_YEARS
        }
        return ny
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [spinning, reduced])

  // ── derived state ─────────────────────────────────────────────────────────
  const cyclesDone = Math.floor(year / POLITICAL_CYCLE) // resets survived
  const intoCycle = (year % POLITICAL_CYCLE) / POLITICAL_CYCLE // 0..1 within a term

  // POLITICAL dial spins a full turn per cycle (frantic)
  const polAngle = (year / POLITICAL_CYCLE) * 360
  // ASSET dial geared 1:10 — barely creeps
  const assetAngle = (year / ASSET_HORIZON) * 360 * (POL_TEETH / ASSET_TEETH) * 10

  // STRATEGY progress: climbs within a term, slammed to ~0 at each reset.
  // We model the *current* term's accrued progress (eased), so the arc visibly
  // resets every 4 years — the whole point.
  const strategyArc = easeOut(intoCycle) // 0..1 progress THIS term
  // best-ever progress the asset needed (the dashed "what we needed" line)
  const needed = clamp01(year / ASSET_HORIZON)

  // VOLATILITY PREMIUM — compounding cost of every reset (B04, p49).
  // Each completed cycle wastes the term's accrued capital; premium climbs.
  const premium = cyclesDone * 14 + Math.round(intoCycle * intoCycle * 6)

  // Nationaal Groeifonds: alive until the first reset lands on it, then derailed.
  const groeifondsDead = year >= GROEIFONDS_YEAR
  const groeifondsDerail = clamp01((year - GROEIFONDS_YEAR) / 2) // 0..1 fly-off

  // verdict
  const verdict =
    cyclesDone === 0
      ? { word: "BUILDING", color: p.leverage }
      : cyclesDone < 4
        ? { word: "RESET", color: p.wonderHi }
        : { word: "SHORT-TERMISM", color: p.squeeze }

  // strategy arc path on the asset dial (a growing capability ring)
  const arcR = ASSET.r - 46
  const arcStart = -90
  const arcSweep = strategyArc * 300
  const polTo = (deg: number) => {
    const a = ((arcStart + deg) * Math.PI) / 180
    return [ASSET.cx + Math.cos(a) * arcR, ASSET.cy + Math.sin(a) * arcR]
  }
  const [ax0, ay0] = polTo(0)
  const [ax1, ay1] = polTo(arcSweep)
  const arcLarge = arcSweep > 180 ? 1 : 0
  const arcPath =
    arcSweep < 0.5
      ? ""
      : `M ${ax0.toFixed(1)} ${ay0.toFixed(1)} A ${arcR} ${arcR} 0 ${arcLarge} 1 ${ax1.toFixed(1)} ${ay1.toFixed(1)}`

  // the "needed" dashed reference ring (full 300° at full horizon)
  const [nx1, ny1] = polTo(needed * 300)
  const nLarge = needed * 300 > 180 ? 1 : 0
  const neededPath =
    needed < 0.01
      ? ""
      : `M ${ax0.toFixed(1)} ${ay0.toFixed(1)} A ${arcR} ${arcR} 0 ${nLarge} 1 ${nx1.toFixed(1)} ${ny1.toFixed(1)}`

  function step(delta: number) {
    setSpinning(false)
    setYear((y) => clamp(y + delta, 0, MAX_YEARS))
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V5 · The Two Clocks"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {verdict.word}
        </span>
      }
      caption={
        <>
          Spin the <span style={{ color: p.squeeze }}>4-year political dial</span> and watch the{" "}
          <span style={{ color: p.leverage }}>40-year asset dial</span> barely move — geared 1:10. Every term
          the <span style={{ color: p.wonderHi }}>strategy arc</span> resets to zero and the volatility premium
          climbs; the €20bn Nationaal Groeifonds — its final €6.8bn cut in 2024 — flies off at the first reset. You cannot build a 40-year
          capability on a 4-year attention span. Source: Dutch competitiveness deck (B03 / B04, p34 / p49).
        </>
      }
    >
      <svg
        viewBox="0 0 920 600"
        role="img"
        aria-label="Two interlocking gear-dials: a frantic four-year political clock geared to a frozen forty-year asset clock, with the long-term strategy resetting each cycle and a volatility-premium meter climbing"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="tc-asset-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.16} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* blueprint mesh line connecting the two gears */}
        <line
          x1={POL.cx + POL.r - 8}
          y1={POL.cy}
          x2={ASSET.cx - ASSET.r + 8}
          y2={ASSET.cy}
          stroke={p.blueprint}
          strokeWidth={1}
          strokeDasharray="2 5"
        />

        {/* ════ ASSET DIAL — frozen 40-year horizon (cyan, the leverage) ════ */}
        <circle cx={ASSET.cx} cy={ASSET.cy} r={ASSET.r + 40} fill="url(#tc-asset-glow)" />
        <g transform={`rotate(${assetAngle} ${ASSET.cx} ${ASSET.cy})`}>
          <path d={gearPath(ASSET.cx, ASSET.cy, ASSET.r, ASSET_TEETH, 8)} fill="none" stroke={p.leverage} strokeWidth={1.4} opacity={0.5} />
        </g>
        <circle cx={ASSET.cx} cy={ASSET.cy} r={ASSET.r - 14} fill="none" stroke={p.leverage} strokeWidth={1.5} opacity={0.7} />
        {/* the "needed" reference ring — what a 40-yr asset required (dashed) */}
        {neededPath && (
          <path d={neededPath} fill="none" stroke={p.leverage} strokeWidth={3} strokeDasharray="3 6" strokeLinecap="round" opacity={0.55} />
        )}
        {/* the strategy arc actually achieved THIS term (gold) — resets each cycle */}
        {arcPath && (
          <path d={arcPath} fill="none" stroke={p.wonder} strokeWidth={7} strokeLinecap="round" />
        )}
        {/* asset hub */}
        <circle cx={ASSET.cx} cy={ASSET.cy} r={58} fill={p.bg} stroke={p.leverage} strokeWidth={2} />
        <text x={ASSET.cx} y={ASSET.cy - 18} textAnchor="middle" fill={p.leverageHi} style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.14em" }}>
          ASSET
        </text>
        <text x={ASSET.cx} y={ASSET.cy + 6} textAnchor="middle" fill={p.ink} style={{ fontSize: 30, fontWeight: 800 }}>
          {Math.min(year, ASSET_HORIZON).toFixed(0)}
          <tspan fill={p.soft} style={{ fontSize: 14, fontWeight: 700 }}> / {ASSET_HORIZON}y</tspan>
        </text>
        <text x={ASSET.cx} y={ASSET.cy + 28} textAnchor="middle" fill={p.soft} style={{ fontSize: 12, letterSpacing: "0.16em" }}>
          STRATEGIC HORIZON
        </text>
        <text x={ASSET.cx} y={ASSET.cy + ASSET.r + 30} textAnchor="middle" fill={p.muted} style={{ fontSize: 12 }}>
          strategy this term:{" "}
          <tspan fill={p.wonderHi} style={{ fontWeight: 700 }}>{Math.round(strategyArc * 100)}%</tspan>
          <tspan fill={p.soft}> · needed </tspan>
          <tspan fill={p.leverageHi} style={{ fontWeight: 700 }}>{Math.round(needed * 100)}%</tspan>
        </text>

        {/* ════ POLITICAL DIAL — frantic 4-year cycle (red, the squeeze) ════ */}
        <g transform={`rotate(${polAngle} ${POL.cx} ${POL.cy})`}>
          <path d={gearPath(POL.cx, POL.cy, POL.r, POL_TEETH, 16)} fill={rgba(mode === "dark" ? "240,112,138" : "192,69,90", 0.06)} stroke={p.squeeze} strokeWidth={1.8} />
          {/* the single hand — sweeps a full turn every 4 years */}
          <line x1={POL.cx} y1={POL.cy} x2={POL.cx} y2={POL.cy - POL.r + 26} stroke={p.squeezeHi} strokeWidth={3} strokeLinecap="round" />
          {/* term ticks: 4 elections marked on the rim */}
          {Array.from({ length: POLITICAL_CYCLE }).map((_, i) => {
            const a = (i / POLITICAL_CYCLE) * Math.PI * 2 - Math.PI / 2
            return (
              <line
                key={i}
                x1={POL.cx + Math.cos(a) * (POL.r - 30)}
                y1={POL.cy + Math.sin(a) * (POL.r - 30)}
                x2={POL.cx + Math.cos(a) * (POL.r - 18)}
                y2={POL.cy + Math.sin(a) * (POL.r - 18)}
                stroke={p.squeeze}
                strokeWidth={1.5}
                opacity={0.6}
              />
            )
          })}
        </g>
        {/* political hub */}
        <circle cx={POL.cx} cy={POL.cy} r={50} fill={p.bg} stroke={p.squeeze} strokeWidth={2} />
        <text x={POL.cx} y={POL.cy - 14} textAnchor="middle" fill={p.squeezeHi} style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em" }}>
          POLITICS
        </text>
        <text x={POL.cx} y={POL.cy + 10} textAnchor="middle" fill={p.ink} style={{ fontSize: 26, fontWeight: 800 }}>
          {cyclesDone}
        </text>
        <text x={POL.cx} y={POL.cy + 28} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.12em" }}>
          {cyclesDone === 1 ? "RESET" : "RESETS"} · 4y
        </text>

        {/* reset flash ring — pulses around the political dial near a term boundary */}
        {intoCycle > 0.86 && year < MAX_YEARS && (
          <circle cx={POL.cx} cy={POL.cy} r={POL.r + 10} fill="none" stroke={p.squeeze} strokeWidth={2} opacity={lerp(0, 0.7, (intoCycle - 0.86) / 0.14)} strokeDasharray="4 6" />
        )}

        {/* ════ THE CASUALTY — Nationaal Groeifonds €20bn ════ */}
        {(() => {
          // sits on the meshing point; when derailed it flies off-screen down-right
          const baseX = (POL.cx + POL.r + ASSET.cx - ASSET.r) / 2
          const baseY = 470
          const dx = groeifondsDerail * 150
          const dy = groeifondsDerail * 70
          const rot = groeifondsDerail * 38
          const op = groeifondsDead ? lerp(1, 0.35, groeifondsDerail) : 0.95
          const col = groeifondsDead ? p.squeeze : p.wonder
          const colHi = groeifondsDead ? p.squeezeHi : p.wonderHi
          return (
            <g transform={`translate(${dx} ${dy}) rotate(${rot} ${baseX} ${baseY})`} style={{ opacity: op }}>
              <rect x={baseX - 86} y={baseY - 22} width={172} height={44} rx={7} fill={rgba(mode === "dark" ? "17,32,58" : "253,250,242", 0.9)} stroke={col} strokeWidth={1.6} strokeDasharray={groeifondsDead ? "5 4" : undefined} />
              <text x={baseX} y={baseY - 4} textAnchor="middle" fill={colHi} style={{ fontSize: 12.5, fontWeight: 800 }}>
                Nationaal Groeifonds
              </text>
              <text x={baseX} y={baseY + 13} textAnchor="middle" fill={groeifondsDead ? p.squeezeHi : p.muted} style={{ fontSize: 11, fontWeight: 700 }}>
                €20bn · {groeifondsDead ? "WOUND DOWN" : "40-yr horizon"}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* ── readouts + controls ────────────────────────────────────────────── */}
      <div className="mt-2 px-1">
        <p className="text-[15px]" style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}>
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> — a
          forty-year capability cannot be built on a four-year attention span.
        </p>

        {/* volatility premium meter */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-[11px] whitespace-nowrap" style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}>
            VOLATILITY PREMIUM
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
            <div style={{ width: `${clamp(premium, 0, 100)}%`, height: "100%", background: p.squeeze, transition: spinning ? "none" : "width 0.2s" }} />
          </div>
          <span className="text-[13px] font-bold tabular-nums whitespace-nowrap" style={{ fontFamily: "var(--font-mono), monospace", color: p.squeezeHi }}>
            +{premium}%
          </span>
        </div>

        {/* the spin control */}
        <label className="mt-3 flex items-center gap-3 text-[11px]" style={{ color: p.soft }}>
          <button
            onClick={() => step(-POLITICAL_CYCLE)}
            aria-label="Rewind one electoral term"
            style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, padding: "2px 9px", borderRadius: 6, cursor: "pointer", color: p.soft, border: `1px solid ${p.hair}`, background: "transparent" }}
          >
            −4y
          </button>
          <input
            type="range"
            min={0}
            max={MAX_YEARS * 10}
            value={Math.round(year * 10)}
            onChange={(e) => {
              setSpinning(false)
              setYear(clamp(Number(e.target.value) / 10, 0, MAX_YEARS))
            }}
            aria-label="Spin the four-year political dial across the asset's forty-year life"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.squeeze, background: p.hair }}
          />
          <button
            onClick={() => step(POLITICAL_CYCLE)}
            aria-label="Advance one electoral term"
            style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, padding: "2px 9px", borderRadius: 6, cursor: "pointer", color: p.soft, border: `1px solid ${p.hair}`, background: "transparent" }}
          >
            +4y
          </button>
          {!reduced && (
            <button
              onClick={() => {
                if (year >= MAX_YEARS) setYear(0)
                setSpinning((s) => !s)
              }}
              aria-label={spinning ? "Pause the dial" : "Auto-spin the dial"}
              style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, padding: "2px 11px", borderRadius: 6, cursor: "pointer", color: spinning ? p.squeezeHi : p.soft, border: `1px solid ${spinning ? p.squeeze : p.hair}`, background: "transparent", whiteSpace: "nowrap" }}
            >
              {spinning ? "❙❙ pause" : "▶ spin"}
            </button>
          )}
        </label>
      </div>
    </PlateFrame>
  )
}
