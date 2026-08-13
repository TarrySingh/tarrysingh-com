"use client"

/**
 * V15 · THE AIOPS COMMAND DECK - the closing instrument of THE ENGINE ROOM
 * (Plate V). A fleet observatory: five small panels read together the way a
 * fleet operator reads a control room. A scenario selector drives every panel
 * at once and lights the one alarm a human should act on.
 *
 * This is a CONCEPTUAL control room. The panel values illustrate the operating
 * discipline, not a specific deployment. Where a real figure exists in the
 * Source Ledger it is pinned to the panel and cited in the method lane, so the
 * deck reads against the essay's own verified numbers:
 *  - LOOPS IN FLIGHT / goodput: Meta, The Llama 3 Herd of Models (arXiv
 *    2407.21783, Sec 3.3.4): over a 54-day snapshot a 16,384-GPU fleet hit 466
 *    interruptions (47 planned, 419 unexpected), roughly one failure every 3
 *    hours, yet held above 90% goodput with only 3 manual interventions.
 *  - VERIFIER PASS-RATE: Lodha et al. (arXiv 2606.10209, Table 2), same 50-task
 *    loop: full history 71.0% complete itemisation, curated + summarised 91.6%,
 *    a +20.6 point span.
 *  - CONTEXT BUDGET: NoLiMa (arXiv 2502.05167, ICML 2025): GPT-4o falls 99.3 to
 *    69.7 at 32K tokens; the rot sets in well before the window is full.
 *  - DRIFT ALARM: METR, Recent Frontier Models Are Reward Hacking (2025): o3
 *    reward-hacked 30.4% of RE-Bench runs (39/128) where it could see the
 *    scorer, versus roughly 1-2% of attempts overall.
 *
 * The scenarios (HEALTHY / DRIFT EVENT / VERIFIER REGRESSION) are schematic
 * operating states, not measured incidents; the method lane says so.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useRef, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx, type LHPalette } from "./loop-kit"

// ---------------------------------------------------------------------------
// Scenario model. Every panel value is schematic EXCEPT the pinned anchors,
// which are labelled on the panel and cited in the method lane.
// ---------------------------------------------------------------------------

type Health = "ok" | "warn" | "alarm"

interface Panel {
  /** loops in flight (fleet count) */
  flight: number
  /** goodput, effective training/running time, % */
  goodput: number
  /** verifier pass-rate, % */
  pass: number
  /** context budget utilisation, % of window */
  ctx: number
  /** memory freshness, minutes since last write */
  memAge: number
  /** drift: reward-hack attempt rate, % of runs */
  drift: number
}

interface Scenario {
  key: string
  name: string
  panel: Panel
  /** which panel is the one to act on */
  alarmKey: "flight" | "pass" | "ctx" | "mem" | "drift" | null
  verdict: string
}

// Baselines a healthy fleet holds. The band edges are ledger-anchored:
// goodput >= 90 (Llama-3 fleet held >90%), verifier pass in the 71 to 91.6
// documented span, context rot begins near the 32K NoLiMa point.
const PASS_FLOOR = 71.0 // C2 full-history baseline, the default everyone ships
const PASS_GOOD = 91.6 // C4 curated + summarised, the reachable ceiling
const GOODPUT_FLOOR = 90.0 // Llama-3 fleet held effective training time > 90%
const CTX_ROT = 62.0 // NoLiMa: rot is well underway by 32K, ~62% of a 52K frame

const SCENARIOS: Scenario[] = [
  {
    key: "healthy",
    name: "HEALTHY",
    panel: { flight: 128, goodput: 94.0, pass: 91.6, ctx: 48, memAge: 3, drift: 1.6 },
    alarmKey: null,
    verdict: "fleet nominal · every panel inside its band · sit on the loop, not in it",
  },
  {
    key: "drift",
    name: "DRIFT EVENT",
    panel: { flight: 131, goodput: 92.0, pass: 74.0, ctx: 71, memAge: 128, drift: 8.4 },
    alarmKey: "mem",
    verdict: "drift event · memory stale at 128 min · route to a human before the loop compounds",
  },
  {
    key: "regress",
    name: "VERIFIER REGRESSION",
    panel: { flight: 122, goodput: 88.0, pass: 58.0, ctx: 58, memAge: 9, drift: 30.4 },
    alarmKey: "pass",
    verdict: "verifier pass-rate 58% · below the 71% floor · the loop is shipping unverified work",
  },
]

// ---------------------------------------------------------------------------
// Schematic sparkline for LOOPS IN FLIGHT. Deterministic module-scope seed:
// SSR === CSR. Shape stands for a running fleet, not a measured trace.
// ---------------------------------------------------------------------------

const SPARK_N = 32
function buildSpark(seed: number, base: number, amp: number, dip: number): number[] {
  const rnd = mulberry32(seed)
  const out: number[] = []
  for (let i = 0; i <= SPARK_N; i++) {
    const t = i / SPARK_N
    // a late dip models an interruption wave the fleet recovers from
    const shock = dip > 0 && t > 0.62 ? -dip * Math.exp(-Math.pow((t - 0.72) / 0.12, 2)) : 0
    out.push(base + (rnd() - 0.5) * amp + shock)
  }
  return out
}
const SPARKS: Record<string, number[]> = {
  healthy: buildSpark(0xa105de01, 128, 7, 0),
  drift: buildSpark(0xa105de02, 131, 8, 0),
  regress: buildSpark(0xa105de03, 122, 9, 22),
}

// ---------------------------------------------------------------------------

const MONO = "var(--font-mono), monospace"

function healthColour(p: LHPalette, h: Health): string {
  return h === "alarm" ? p.danger : h === "warn" ? p.verdict : p.signal
}

function DeckScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx
  const [sel, setSel] = useState(0)
  const sc = SCENARIOS[sel]
  const P = sc.panel

  // rAF sweep: panels ease from the previous state to the new one, so a
  // scenario switch reads as instruments settling. Reduced motion / pre-hydrate
  // renders the complete final state (t = 1).
  const [t, setT] = useState(reduced ? 1 : 0)
  const fromRef = useRef<Panel>(P)
  const prevSel = useRef(sel)
  useEffect(() => {
    if (reduced) {
      setT(1)
      return
    }
    // snapshot the currently-shown values as the animation origin
    fromRef.current = SCENARIOS[prevSel.current].panel
    prevSel.current = sel
    setT(0)
    let raf = 0
    let start: number | null = null
    const dur = 620
    const step = (ts: number) => {
      if (start === null) start = ts
      const u = Math.min(1, (ts - start) / dur)
      setT(u * u * (3 - 2 * u))
      if (u < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [sel, reduced])

  const lerp = (a: number, b: number) => a + (b - a) * t
  const f = fromRef.current
  const flight = Math.round(lerp(f.flight, P.flight))
  const goodput = lerp(f.goodput, P.goodput)
  const pass = lerp(f.pass, P.pass)
  const ctxUtil = lerp(f.ctx, P.ctx)
  const memAge = Math.round(lerp(f.memAge, P.memAge))
  const drift = lerp(f.drift, P.drift)

  // Per-panel health verdicts. These are the thresholds a fleet operator sets.
  const passHealth: Health = pass < PASS_FLOOR ? "alarm" : pass < PASS_GOOD - 2 ? "warn" : "ok"
  const goodHealth: Health = goodput < GOODPUT_FLOOR ? "warn" : "ok"
  const ctxHealth: Health = ctxUtil >= CTX_ROT ? "warn" : "ok"
  const memHealth: Health = memAge >= 60 ? "alarm" : memAge >= 20 ? "warn" : "ok"
  const driftHealth: Health = drift >= 10 ? "alarm" : drift >= 4 ? "warn" : "ok"
  const flightHealth: Health = "ok"

  const alarmOn = sc.alarmKey !== null
  const verdictColour = alarmOn ? p.danger : p.signal

  const fs = compact ? 17 : 13.5
  const W = compact ? 460 : 980
  // panel grid geometry
  const pad = compact ? 14 : 20
  const cols = compact ? 1 : 3
  const rows = compact ? 5 : 2
  const gap = compact ? 14 : 18
  const gridTop = compact ? 96 : 92
  const panelW = (W - pad * 2 - gap * (cols - 1)) / cols
  const panelH = compact ? 118 : 168
  const H = gridTop + rows * panelH + (rows - 1) * gap + pad

  const panelXY = (idx: number): [number, number] => {
    const r = Math.floor(idx / cols)
    const c = idx % cols
    return [pad + c * (panelW + gap), gridTop + r * (panelH + gap)]
  }

  // ---- one panel frame ----
  const Frame = ({
    x,
    y,
    label,
    unit,
    health,
    alarm,
    children,
  }: {
    x: number
    y: number
    label: string
    unit: string
    health: Health
    alarm: boolean
    children: React.ReactNode
  }) => {
    const hc = healthColour(p, health)
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={panelW}
          height={panelH}
          rx={8}
          fill={alarm ? rgba(p.dangerRGB, 0.06) : rgba(p.inkRGB, 0.03)}
          stroke={alarm ? p.danger : p.hair}
          strokeWidth={alarm ? 1.8 : 1}
        />
        {/* status dot */}
        <circle cx={x + 12} cy={y + 15} r={4} fill={hc} />
        <text
          x={x + 24}
          y={y + 19}
          fill={p.muted}
          style={{ fontSize: fs - 2.5, letterSpacing: "0.12em", fontFamily: MONO }}
        >
          {label}
        </text>
        <text
          x={x + panelW - 8}
          y={y + 19}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: fs - 4, letterSpacing: "0.08em", fontFamily: MONO }}
        >
          {unit}
        </text>
        {children}
        {alarm && (
          <text
            x={x + panelW - 8}
            y={y + panelH - 8}
            textAnchor="end"
            fill={p.danger}
            style={{ fontSize: fs - 3.5, fontWeight: 700, letterSpacing: "0.16em", fontFamily: MONO }}
          >
            ACT
          </text>
        )}
      </g>
    )
  }

  // big numeric readout inside a panel
  const Readout = ({
    x,
    y,
    value,
    colour,
    suffix,
  }: {
    x: number
    y: number
    value: string
    colour: string
    suffix?: string
  }) => (
    <>
      <text
        x={x}
        y={y}
        fill={colour}
        style={{ fontSize: compact ? 34 : 38, fontWeight: 800, fontFamily: MONO }}
      >
        {value}
      </text>
      {suffix && (
        <text
          x={x + (value.length * (compact ? 34 : 38) * 0.62) + 6}
          y={y}
          fill={p.soft}
          style={{ fontSize: fs - 1, fontFamily: MONO }}
        >
          {suffix}
        </text>
      )}
    </>
  )

  // ---- panel bodies ----
  const [x0, y0] = panelXY(0) // loops in flight
  const [x1, y1] = panelXY(1) // verifier pass-rate
  const [x2, y2] = panelXY(2) // context budget
  const [x3, y3] = panelXY(3) // memory freshness
  const [x4, y4] = panelXY(4) // drift alarm

  // sparkline path for loops in flight
  const spark = SPARKS[sc.key]
  const sparkX0 = x0 + 12
  const sparkX1 = x0 + panelW - 12
  const sparkYb = y0 + panelH - 16
  const sparkYt = y0 + panelH - 58
  const sMin = Math.min(...spark) - 4
  const sMax = Math.max(...spark) + 4
  const sparkPath = spark
    .map((v, i) => {
      const px = sparkX0 + ((sparkX1 - sparkX0) * i) / SPARK_N
      const py = sparkYb + ((sparkYt - sparkYb) * (v - sMin)) / (sMax - sMin)
      return `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`
    })
    .join(" ")

  // verifier pass-rate: horizontal bar with the 71 floor and 91.6 ceiling ghosts
  const barX0 = x1 + 12
  const barX1 = x1 + panelW - 12
  const barY = y1 + panelH - 30
  const barToX = (v: number) => barX0 + ((barX1 - barX0) * v) / 100
  const passColour = healthColour(p, passHealth)

  // context budget: vertical-ish fill bar, rot threshold marked
  const cbX0 = x2 + 12
  const cbX1 = x2 + panelW - 12
  const cbY = y2 + panelH - 30
  const cbToX = (v: number) => cbX0 + ((cbX1 - cbX0) * v) / 100

  // drift: a small dial arc
  const dcx = x4 + panelW - 44
  const dcy = y4 + panelH - 30
  const dr = compact ? 26 : 30
  const driftColour = healthColour(p, driftHealth)
  // arc from 180 (left) to 0 (right); needle fraction of a 0..40% scale
  const driftFrac = Math.min(1, drift / 40)
  const needleDeg = 180 - driftFrac * 180
  const needleRad = (needleDeg * Math.PI) / 180
  const nx = dcx + dr * Math.cos(needleRad)
  const ny = dcy - dr * Math.sin(needleRad)

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>An AIOps command deck: five fleet panels under three operating scenarios</title>
        <desc>
          A fleet observatory of five panels read together: loops in flight, verifier
          pass-rate, context-budget utilisation, memory freshness, and a drift alarm.
          A scenario selector drives every panel and lights the single panel a fleet
          operator should act on. In the healthy state all panels sit inside their
          bands; a drift event leaves memory stale at 128 minutes; a verifier
          regression drops the pass-rate to 58%, below the 71% floor.
        </desc>

        {/* ===== deck header ===== */}
        <text
          x={pad}
          y={30}
          fill={p.soft}
          style={{ fontSize: fs - 1.5, letterSpacing: compact ? "0.14em" : "0.2em", fontFamily: MONO }}
        >
          {compact
            ? "FLEET OBSERVATORY · READ THE PANELS TOGETHER"
            : "FLEET OBSERVATORY · 3 OPERATING STATES · READ THE PANELS TOGETHER"}
        </text>

        {/* fleet status strip */}
        <text
          x={pad}
          y={compact ? 62 : 66}
          fill={alarmOn ? p.danger : p.signalHi}
          style={{ fontSize: compact ? 26 : 30, fontWeight: 800, fontFamily: MONO }}
        >
          {sc.name}
        </text>
        {(() => {
          // status token, stacked in compact so it never collides with the name
          const label = alarmOn ? "ALARM · OPERATOR ACTION" : "ALL BANDS NOMINAL"
          const tx = compact ? pad : W - pad
          const ty = compact ? 86 : 66
          return (
            <text
              x={tx}
              y={ty}
              textAnchor={compact ? "start" : "end"}
              fill={alarmOn ? p.danger : p.signal}
              style={{ fontSize: fs - 1, letterSpacing: "0.14em", fontWeight: 700, fontFamily: MONO }}
            >
              {label}
            </text>
          )
        })()}

        {/* ===== panel 1: LOOPS IN FLIGHT ===== */}
        <Frame x={x0} y={y0} label="LOOPS IN FLIGHT" unit="agents" health={flightHealth} alarm={false}>
          <Readout x={x0 + 12} y={y0 + 66} value={String(flight)} colour={p.ink} />
          <text
            x={x0 + 12 + String(flight).length * (compact ? 34 : 38) * 0.62 + 8}
            y={y0 + 66}
            fill={goodHealth === "warn" ? p.verdict : p.soft}
            style={{ fontSize: fs - 1, fontFamily: MONO }}
          >
            {goodput.toFixed(0)}% goodput
          </text>
          {/* sparkline */}
          <path d={sparkPath} fill="none" stroke={p.signal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <text
            x={sparkX0}
            y={y0 + panelH - 4}
            fill={p.soft}
            style={{ fontSize: fs - 4.5, fontFamily: MONO }}
          >
            fleet held &gt; 90% goodput · one failure ~ every 3 h
          </text>
        </Frame>

        {/* ===== panel 2: VERIFIER PASS-RATE ===== */}
        <Frame
          x={x1}
          y={y1}
          label="VERIFIER PASS-RATE"
          unit="% complete"
          health={passHealth}
          alarm={sc.alarmKey === "pass"}
        >
          <Readout x={x1 + 12} y={y1 + 66} value={pass.toFixed(0)} colour={passColour} suffix="%" />
          {/* track */}
          <rect x={barX0} y={barY} width={barX1 - barX0} height={9} rx={4.5} fill={rgba(p.inkRGB, 0.08)} />
          {/* fill */}
          <rect x={barX0} y={barY} width={Math.max(0, barToX(pass) - barX0)} height={9} rx={4.5} fill={passColour} />
          {/* 71 floor ghost */}
          <line x1={barToX(PASS_FLOOR)} y1={barY - 6} x2={barToX(PASS_FLOOR)} y2={barY + 15} stroke={p.cool} strokeWidth={1.4} strokeDasharray="3 3" />
          <text x={barToX(PASS_FLOOR)} y={barY - 9} textAnchor="middle" fill={p.cool} style={{ fontSize: fs - 4.5, fontFamily: MONO }}>
            71 floor
          </text>
          {/* 91.6 ceiling ghost */}
          <line x1={barToX(PASS_GOOD)} y1={barY - 6} x2={barToX(PASS_GOOD)} y2={barY + 15} stroke={p.signal} strokeWidth={1.4} strokeDasharray="3 3" />
          <text x={barToX(PASS_GOOD)} y={barY - 9} textAnchor="middle" fill={p.signal} style={{ fontSize: fs - 4.5, fontFamily: MONO }}>
            91.6 target
          </text>
        </Frame>

        {/* ===== panel 3: CONTEXT BUDGET ===== */}
        <Frame
          x={x2}
          y={y2}
          label="CONTEXT BUDGET"
          unit="% of window"
          health={ctxHealth}
          alarm={false}
        >
          <Readout
            x={x2 + 12}
            y={y2 + 66}
            value={ctxUtil.toFixed(0)}
            colour={ctxHealth === "warn" ? p.verdict : p.ink}
            suffix="%"
          />
          <rect x={cbX0} y={cbY} width={cbX1 - cbX0} height={9} rx={4.5} fill={rgba(p.inkRGB, 0.08)} />
          {/* rot zone: everything past the rot threshold */}
          <rect
            x={cbToX(CTX_ROT)}
            y={cbY}
            width={cbX1 - cbToX(CTX_ROT)}
            height={9}
            rx={4.5}
            fill={rgba(p.dangerRGB, 0.1)}
          />
          <rect
            x={cbX0}
            y={cbY}
            width={Math.max(0, cbToX(ctxUtil) - cbX0)}
            height={9}
            rx={4.5}
            fill={ctxHealth === "warn" ? p.verdict : p.signal}
          />
          <line x1={cbToX(CTX_ROT)} y1={cbY - 6} x2={cbToX(CTX_ROT)} y2={cbY + 15} stroke={p.danger} strokeWidth={1.4} strokeDasharray="3 3" />
          <text x={cbToX(CTX_ROT)} y={cbY - 9} textAnchor="middle" fill={p.danger} style={{ fontSize: fs - 4.5, fontFamily: MONO }}>
            rot sets in
          </text>
          <text x={cbX0} y={cbY + 26} fill={p.soft} style={{ fontSize: fs - 4.5, fontFamily: MONO }}>
            recall 99.3 to 69.7 by 32K tokens
          </text>
        </Frame>

        {/* ===== panel 4: MEMORY FRESHNESS ===== */}
        <Frame
          x={x3}
          y={y3}
          label="MEMORY FRESHNESS"
          unit="min since write"
          health={memHealth}
          alarm={sc.alarmKey === "mem"}
        >
          <Readout
            x={x3 + 12}
            y={y3 + 66}
            value={String(memAge)}
            colour={healthColour(p, memHealth)}
            suffix="min"
          />
          <text x={x3 + 12} y={y3 + panelH - 30} fill={p.muted} style={{ fontSize: fs - 3, fontFamily: MONO }}>
            {memHealth === "alarm"
              ? "state file stale · loop may replan done work"
              : memHealth === "warn"
                ? "ageing · schedule a persist"
                : "fresh · progress persisted"}
          </text>
          <text x={x3 + 12} y={y3 + panelH - 12} fill={p.soft} style={{ fontSize: fs - 4.5, fontFamily: MONO }}>
            threshold · warn 20 min · alarm 60 min
          </text>
        </Frame>

        {/* ===== panel 5: DRIFT ALARM ===== */}
        <Frame
          x={x4}
          y={y4}
          label="DRIFT ALARM"
          unit="% runs hacked"
          health={driftHealth}
          alarm={sc.alarmKey === "drift"}
        >
          <Readout x={x4 + 12} y={y4 + 66} value={drift.toFixed(1)} colour={driftColour} suffix="%" />
          {/* dial arc */}
          <path
            d={`M ${dcx - dr} ${dcy} A ${dr} ${dr} 0 0 1 ${dcx + dr} ${dcy}`}
            fill="none"
            stroke={rgba(p.inkRGB, 0.1)}
            strokeWidth={5}
            strokeLinecap="round"
          />
          {/* danger arc past the 10% mark */}
          {(() => {
            const startDeg = 180 - (10 / 40) * 180
            const sr = (startDeg * Math.PI) / 180
            const sx = dcx + dr * Math.cos(sr)
            const sy = dcy - dr * Math.sin(sr)
            return (
              <path
                d={`M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${dr} ${dr} 0 0 1 ${dcx + dr} ${dcy}`}
                fill="none"
                stroke={rgba(p.dangerRGB, 0.35)}
                strokeWidth={5}
                strokeLinecap="round"
              />
            )
          })()}
          <line x1={dcx} y1={dcy} x2={nx.toFixed(1)} y2={ny.toFixed(1)} stroke={driftColour} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={dcx} cy={dcy} r={3} fill={driftColour} />
          <text x={x4 + 12} y={y4 + panelH - 12} fill={p.soft} style={{ fontSize: fs - 4.5, fontFamily: MONO }}>
            30.4% when the scorer is visible
          </text>
        </Frame>
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: MONO, color: verdictColour }}
      >
        {"VERDICT · "}
        {sc.verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {SCENARIOS.map((s, i) => {
          const active = i === sel
          const isAlarm = s.alarmKey !== null
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={active}
              onClick={() => setSel(i)}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
              style={{
                fontFamily: MONO,
                color: active ? (isAlarm ? p.dangerHi : p.signalHi) : p.muted,
                border: `1px solid ${active ? (isAlarm ? p.danger : p.signal) : p.hair}`,
                background: active
                  ? isAlarm
                    ? rgba(p.dangerRGB, 0.1)
                    : rgba(p.signalRGB, 0.1)
                  : "transparent",
              }}
            >
              {s.name}
            </button>
          )
        })}
        <span className="text-[11px]" style={{ fontFamily: MONO, color: p.soft }}>
          drive the fleet · watch which panel lights
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function AIOpsCommandDeck() {
  return (
    <InstrumentFrame
      kicker="V15 · THE AIOPS COMMAND DECK"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          Operating intelligence is a discipline with a control room. An enterprise
          runs its agent fleet as a fleet: loops in flight, verifier pass-rates,
          context budgets, memory freshness, a drift alarm. No single gauge is the
          answer. The operator reads the panels together, and the one that leaves its
          band is the one to act on before the loop compounds the error downstream.
        </>
      }
      method={
        <>
          SCHEMATIC · a conceptual control room. The panel values illustrate the
          operating discipline, not one deployment; the three scenarios are operating
          states, not measured incidents. Pinned anchors, all from the Source Ledger:
          fleet goodput and the one-failure-every-3-hours cadence, Meta, The Llama 3
          Herd of Models, arXiv 2407.21783 (466 interruptions over 54 days, above 90%
          goodput). Verifier band 71.0 to 91.6, Lodha et al., arXiv 2606.10209, Table
          2. Context rot 99.3 to 69.7 by 32K, NoLiMa, arXiv 2502.05167, ICML 2025.
          Drift 30.4% when the scorer is visible, METR, Recent Frontier Models Are
          Reward Hacking (2025).
        </>
      }
    >
      {(ctx) => <DeckScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
