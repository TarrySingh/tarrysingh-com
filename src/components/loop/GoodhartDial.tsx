"use client"

/**
 * V8 · THE GOODHART DIAL - an instrument of THE ENGINE ROOM (Plate V).
 *
 * A half-circle pressure dial. The reader steps optimization pressure
 * LOW -> MODERATE -> HIGH -> EXTREME and watches a proxy score keep climbing
 * while the true goal bends away. The curves are SCHEMATIC (seeded model);
 * the case markers and the monitor anchors are measured claims from the
 * Source Ledger (Ch6 / V8):
 *  - CoastRunners: OpenAI, Faulty reward functions in the wild (2016). The
 *    RL boat scores on average ~20% higher than human players and never
 *    finishes the race.
 *  - Lego flip: DeepMind, Specification gaming (Krakovna, Uesato et al.,
 *    2020). Reward = height of the red block's bottom face when not touching
 *    the blue block; the agent flips the block instead of stacking it.
 *    (Do NOT frame this as a reward learned from human preferences; the
 *    do-not-use list killed that qualifier.)
 *  - Sims 1994 fall-over + the ~60-entry case catalogue: Krakovna master
 *    list (2018) + Lehman et al. (2020).
 *  - Monitor: OpenAI, arXiv 2503.11926 (2025). A GPT-4o chain-of-thought
 *    monitor reaches 95% RECALL on the two systemic hacks vs 60% recall for
 *    action-only monitoring; optimizing against the monitor teaches the
 *    model to obfuscate its intent, recall collapsing toward zero, without
 *    stopping the hacking. (Use the word recall, not accuracy.)
 *
 * The instrument argues: optimize a proxy hard enough and it detaches from
 * the goal; monitoring the chain of thought catches most of it until the
 * monitor itself becomes a target.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useRef, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Pressure levels. The recall anchors (95 / 60) are measured; how recall
// varies with the dial is a declared schematic interpolation.
// ---------------------------------------------------------------------------

interface Level {
  key: string
  name: string
  tagline: string
  /** schematic: where the goal curve detaches from the proxy (0..1) */
  br: number
  /** schematic: how far the goal falls after detaching (0..1) */
  drop: number
  /** chain-of-thought monitor recall %; null = collapses toward zero */
  cot: number | null
  verdict: string
}

const LEVELS: Level[] = [
  {
    key: "L0",
    name: "LOW",
    tagline: "the metric still means something",
    br: 0.84,
    drop: 0.1,
    cot: 95,
    verdict: "proxy and goal still agree · light pressure has not found the seams",
  },
  {
    key: "L1",
    name: "MODERATE",
    tagline: "the seams start to show",
    br: 0.55,
    drop: 0.42,
    cot: 95,
    verdict:
      "CoastRunners: ~20% above human score, race never finished · one of ~60 catalogued cases",
  },
  {
    key: "L2",
    name: "HIGH",
    tagline: "proxy up · goal down",
    br: 0.36,
    drop: 0.72,
    cot: 95,
    verdict:
      "the block flips, the boat burns, the score climbs · monitor recall 95% with CoT vs 60% actions-only",
  },
  {
    key: "L3",
    name: "EXTREME",
    tagline: "the monitor is now the target",
    br: 0.22,
    drop: 0.92,
    cot: null,
    verdict:
      "optimized against the monitor · recall collapses toward zero · the metric now hides what it measures",
  },
]

const TARGET_ANGLE = LEVELS.map((_, i) => 180 - (i + 0.5) * 45)

// ---------------------------------------------------------------------------
// Deterministic schematic curves (module scope: SSR === CSR). The proxy
// climbs identically at every pressure; only the goal detaches.
// ---------------------------------------------------------------------------

const STEPS = 56

function buildCurves(): { proxy: number[]; goals: number[][] } {
  const rnd = mulberry32(0x900d4a27)
  const proxy: number[] = []
  const jit: number[] = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const j = (rnd() - 0.5) * 2
    jit.push(j)
    const base = 4 + 96 * (1 - Math.pow(1 - t, 2.4))
    proxy.push(Math.min(100, Math.max(0, base + j * 0.8)))
  }
  const goals = LEVELS.map((l) => {
    const pb = 4 + 96 * (1 - Math.pow(1 - l.br, 2.4))
    return proxy.map((pv, i) => {
      const t = i / STEPS
      if (t <= l.br) return pv
      const u = (t - l.br) / (1 - l.br)
      const s = u * u * (3 - 2 * u)
      return Math.max(1, pb * (1 - l.drop * s) + jit[i] * 0.9)
    })
  })
  return { proxy, goals }
}

const { proxy: PROXY, goals: GOALS } = buildCurves()

// Ledger-verified case markers, pinned to the proxy curve. `level` is the
// dial setting at which the case lights up.
interface CaseMark {
  key: string
  level: number
  t: number
  label: string
  line: string
  danger?: boolean
  /** desktop label offset from the marker + anchor */
  dx: number
  dy: number
}

const CASES: CaseMark[] = [
  {
    key: "sims",
    level: 1,
    t: 0.4,
    label: "SIMS '94",
    line: "SIMS '94 · falls over to reach the target",
    dx: -12,
    dy: -16,
  },
  {
    key: "coast",
    level: 1,
    t: 0.58,
    label: "COASTRUNNERS '16",
    line: "COASTRUNNERS '16 · +~20% · never finishes",
    dx: -12,
    dy: -12,
  },
  {
    key: "lego",
    level: 2,
    t: 0.76,
    label: "LEGO FLIP '20",
    line: "LEGO '20 · flips block · underside reward",
    dx: -12,
    dy: -11,
  },
  {
    key: "obf",
    level: 3,
    t: 0.92,
    label: "OBFUSCATION '25",
    line: "OBFUSCATION '25 · hides its intent",
    danger: true,
    dx: 8,
    dy: 29,
  },
]

const ACTIONS_ONLY = 60 // measured recall %, arXiv 2503.11926
const COT_MEASURED = 95 // measured recall %, same source

// ---------------------------------------------------------------------------

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

function DialScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx
  const [sel, setSel] = useState(0)
  const lv = LEVELS[sel]
  const goal = GOALS[sel]

  // Needle eases to its target via rAF after mount; reduced motion (and the
  // SSR paint) renders the final state directly.
  const [angle, setAngle] = useState(TARGET_ANGLE[0])
  const angleRef = useRef(angle)
  angleRef.current = angle

  useEffect(() => {
    if (reduced) {
      setAngle(TARGET_ANGLE[sel])
      return
    }
    let raf = 0
    let last: number | null = null
    const step = (ts: number) => {
      const target = TARGET_ANGLE[sel]
      if (last !== null) {
        const dt = Math.min(64, ts - last)
        const cur = angleRef.current
        const diff = target - cur
        if (Math.abs(diff) < 0.2) {
          setAngle(target)
          return
        }
        setAngle(cur + diff * Math.min(1, dt * 0.01))
      }
      last = ts
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [sel, reduced])

  const needleA = reduced ? TARGET_ANGLE[sel] : angle

  // Geometry
  const W = compact ? 460 : 980
  const H = compact ? 1060 : 560
  const dial = compact
    ? { cx: 230, cy: 290, r: 128, sw: 24, lr: 168 }
    : { cx: 210, cy: 310, r: 140, sw: 26, lr: 182 }
  const plot = compact
    ? { x0: 64, x1: 430, yTop: 470, yBottom: 690 }
    : { x0: 520, x1: 930, yTop: 100, yBottom: 400 }
  const mon = compact
    ? { x0: 64, sc: 260, title: 900, l1: 928, b1: 934, l2: 990, b2: 996, note: 1040 }
    : { x0: 40, sc: 280, title: 432, l1: 460, b1: 466, l2: 504, b2: 510, note: 540 }
  const titleX = compact ? 32 : 40
  const titleY = compact ? 40 : 64

  // Compact renders ~460 viewBox units into a ~320px stage (scale ~0.7), so
  // raw sizes run larger there to keep every label >= ~9.5px on screen.
  const fs = compact ? 17 : 13.5

  const yFor = (v: number) =>
    plot.yBottom - ((plot.yBottom - plot.yTop) * Math.min(100, Math.max(0, v))) / 100
  const xFor = (i: number) => plot.x0 + ((plot.x1 - plot.x0) * i) / STEPS

  const linePath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`).join(" ")

  const gapPoints = [
    ...PROXY.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`),
    ...goal
      .map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)
      .reverse(),
  ].join(" ")

  const [tipX, tipY] = polar(dial.cx, dial.cy, dial.r - dial.sw / 2 - 12, needleA)
  const tickX = mon.x0 + (COT_MEASURED / 100) * mon.sc
  const cotW = lv.cot === null ? 7 : (lv.cot / 100) * mon.sc

  const mono = "var(--font-mono), monospace"

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>The Goodhart dial: optimization pressure against a proxy</title>
        <desc>
          A half-circle pressure dial with four settings from low to extreme. A panel
          plots a proxy score that keeps climbing while the true goal bends away as
          pressure rises, annotated with documented reward-hacking cases. A monitor
          readout shows chain-of-thought recall of 95% against 60% for
          actions only, collapsing toward zero at the extreme setting.
        </desc>

        {/* ===== the dial ===== */}
        <text
          x={titleX}
          y={titleY}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: mono }}
        >
          {compact ? "OPTIMIZATION PRESSURE" : "OPTIMIZATION PRESSURE · TURN THE DIAL"}
        </text>

        {/* sector band */}
        {LEVELS.map((l, i) => {
          const a0 = 180 - i * 45
          const a1 = 180 - (i + 1) * 45
          const isSel = i === sel
          const stroke = isSel
            ? i === 3
              ? rgba(p.dangerRGB, 0.38)
              : rgba(p.signalRGB, 0.34)
            : i === 3
              ? rgba(p.dangerRGB, 0.1)
              : rgba(p.inkRGB, 0.08)
          return (
            <path
              key={l.key}
              d={arcPath(dial.cx, dial.cy, dial.r, a0, a1)}
              fill="none"
              stroke={stroke}
              strokeWidth={dial.sw}
              style={{ cursor: "pointer" }}
              onClick={() => setSel(i)}
            />
          )
        })}

        {/* boundary ticks */}
        {[180, 135, 90, 45, 0].map((a) => {
          const [x1, y1] = polar(dial.cx, dial.cy, dial.r + dial.sw / 2 + 3, a)
          const [x2, y2] = polar(dial.cx, dial.cy, dial.r + dial.sw / 2 + 11, a)
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={p.soft} strokeWidth={1.4} />
        })}

        {/* danger rim over the EXTREME sector */}
        <path
          d={arcPath(dial.cx, dial.cy, dial.r + dial.sw / 2 + 5, 45, 0)}
          fill="none"
          stroke={rgba(p.dangerRGB, 0.55)}
          strokeWidth={2}
        />

        {/* sector labels */}
        {LEVELS.map((l, i) => {
          const [x, y] = polar(dial.cx, dial.cy, dial.lr, 180 - (i + 0.5) * 45)
          const isSel = i === sel
          return (
            <text
              key={l.key}
              x={x}
              y={y}
              textAnchor="middle"
              fill={isSel ? (i === 3 ? p.danger : p.signalHi) : p.muted}
              style={{
                fontSize: fs - 2,
                fontWeight: 700,
                letterSpacing: "0.1em",
                fontFamily: mono,
                cursor: "pointer",
              }}
              onClick={() => setSel(i)}
            >
              {l.name}
            </text>
          )
        })}

        {/* needle */}
        <line
          x1={dial.cx}
          y1={dial.cy}
          x2={tipX}
          y2={tipY}
          stroke={sel === 3 ? p.danger : p.signal}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <circle cx={tipX} cy={tipY} r={4} fill={sel === 3 ? p.dangerHi : p.signalHi} />
        <circle cx={dial.cx} cy={dial.cy} r={7} fill={p.bg} stroke={p.muted} strokeWidth={1.6} />

        {/* readout under the hub */}
        <text
          x={dial.cx}
          y={compact ? 338 : 356}
          textAnchor="middle"
          fill={sel === 3 ? p.danger : sel === 0 ? p.signalHi : p.ink}
          style={{ fontSize: compact ? 30 : 26, fontWeight: 800, fontFamily: mono }}
        >
          {lv.name}
        </text>
        <text
          x={dial.cx}
          y={compact ? 368 : 382}
          textAnchor="middle"
          fill={p.muted}
          style={{ fontSize: fs - 1, fontFamily: mono }}
        >
          {lv.tagline}
        </text>

        {/* ===== proxy vs goal panel ===== */}
        <text
          x={compact ? 32 : plot.x0}
          y={compact ? 430 : titleY}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: mono }}
        >
          {compact ? "PROXY vs TRUE GOAL · SCHEMATIC" : "PROXY SCORE vs TRUE GOAL · SCHEMATIC"}
        </text>

        {/* gridlines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={plot.x0}
              y1={yFor(v)}
              x2={plot.x1}
              y2={yFor(v)}
              stroke={p.grid}
              strokeWidth={1}
            />
            <text
              x={plot.x0 - 8}
              y={yFor(v) + 4}
              textAnchor="end"
              fill={p.soft}
              style={{ fontSize: fs - 2.5, fontFamily: mono }}
            >
              {v}
            </text>
          </g>
        ))}

        {/* the divergence gap: rose, strictly */}
        <polygon points={gapPoints} fill={rgba(p.dangerRGB, 0.12)} />
        {!compact && sel >= 2 && (
          <text
            x={928}
            y={206}
            textAnchor="end"
            fill={p.danger}
            style={{ fontSize: fs - 2, letterSpacing: "0.08em", fontFamily: mono }}
          >
            THE GAP · what the score hides
          </text>
        )}

        {/* proxy (amber dashed: the claimed number) then goal (the one green) */}
        <path
          d={linePath(PROXY)}
          fill="none"
          stroke={p.verdict}
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <path
          d={linePath(goal)}
          fill="none"
          stroke={p.signal}
          strokeWidth={2.6}
          strokeLinecap="round"
        />

        {/* case markers pinned to the proxy curve */}
        {CASES.map((c) => {
          const i = Math.round(c.t * STEPS)
          const px = xFor(i)
          const py = yFor(PROXY[i])
          const lit = c.level <= sel
          const col = lit ? (c.danger ? p.danger : p.verdict) : p.soft
          return (
            <g key={c.key}>
              <path
                d={`M ${px} ${py - 5.5} L ${px + 5.5} ${py} L ${px} ${py + 5.5} L ${px - 5.5} ${py} Z`}
                fill={lit ? col : "none"}
                stroke={col}
                strokeWidth={1.4}
              />
              {!compact && (
                <text
                  x={px + c.dx}
                  y={py + c.dy}
                  textAnchor="end"
                  fill={col}
                  style={{ fontSize: fs - 3, letterSpacing: "0.06em", fontFamily: mono }}
                >
                  {c.label}
                </text>
              )}
            </g>
          )
        })}

        {/* x axis */}
        <text
          x={plot.x0}
          y={plot.yBottom + 22}
          fill={p.soft}
          style={{ fontSize: fs - 2.5, letterSpacing: "0.12em", fontFamily: mono }}
        >
          {"OPTIMIZATION STEPS →"}
        </text>
        <text
          x={plot.x1}
          y={plot.yBottom + 22}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: fs - 2.5, fontFamily: mono }}
        >
          log · schematic
        </text>

        {/* legend */}
        <g style={{ fontFamily: mono }}>
          <line
            x1={plot.x0}
            y1={plot.yBottom + (compact ? 42 : 44)}
            x2={plot.x0 + 22}
            y2={plot.yBottom + (compact ? 42 : 44)}
            stroke={p.signal}
            strokeWidth={2.6}
          />
          <text
            x={plot.x0 + 28}
            y={plot.yBottom + (compact ? 46 : 48)}
            fill={p.muted}
            style={{ fontSize: fs - 2 }}
          >
            true goal
          </text>
          <line
            x1={plot.x0 + (compact ? 136 : 120)}
            y1={plot.yBottom + (compact ? 42 : 44)}
            x2={plot.x0 + (compact ? 158 : 142)}
            y2={plot.yBottom + (compact ? 42 : 44)}
            stroke={p.verdict}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <text
            x={plot.x0 + (compact ? 164 : 148)}
            y={plot.yBottom + (compact ? 46 : 48)}
            fill={p.muted}
            style={{ fontSize: fs - 2 }}
          >
            proxy score
          </text>
        </g>

        {/* compact: the case list gets its own rows below the plot */}
        {compact &&
          CASES.map((c, r) => {
            const y = 774 + r * 26
            const lit = c.level <= sel
            const col = lit ? (c.danger ? p.danger : p.verdict) : p.soft
            return (
              <g key={c.key}>
                <path
                  d={`M 70 ${y - 9.5} L 74.5 ${y - 5} L 70 ${y - 0.5} L 65.5 ${y - 5} Z`}
                  fill={lit ? col : "none"}
                  stroke={col}
                  strokeWidth={1.2}
                />
                <text x={82} y={y} fill={lit ? p.ink : p.soft} style={{ fontSize: fs - 3, fontFamily: mono }}>
                  {c.line}
                </text>
              </g>
            )
          })}

        {/* ===== monitor sub-readout ===== */}
        <text
          x={compact ? 32 : mon.x0}
          y={mon.title}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: mono }}
        >
          MONITOR · REWARD-HACK RECALL %
        </text>

        {/* row 1: chain of thought */}
        <text x={mon.x0} y={mon.l1} fill={p.muted} style={{ fontSize: fs - 2, fontFamily: mono }}>
          CHAIN OF THOUGHT
        </text>
        {!compact && (
          <text
            x={tickX}
            y={mon.l1}
            textAnchor="end"
            fill={p.soft}
            style={{ fontSize: fs - 3, fontFamily: mono }}
          >
            measured 95
          </text>
        )}
        <rect x={mon.x0} y={mon.b1} width={mon.sc} height={12} fill={rgba(p.inkRGB, 0.06)} />
        <rect
          x={mon.x0}
          y={mon.b1}
          width={cotW}
          height={12}
          fill={sel === 3 ? rgba(p.dangerRGB, 0.55) : rgba(p.signalRGB, 0.5)}
        />
        <line
          x1={tickX}
          y1={mon.b1 - 3}
          x2={tickX}
          y2={mon.b1 + 15}
          stroke={p.soft}
          strokeWidth={1.4}
        />
        <text
          x={mon.x0 + cotW + 8}
          y={mon.b1 + 10}
          fill={sel === 3 ? p.danger : p.signalHi}
          style={{ fontSize: fs - 2, fontFamily: mono }}
        >
          {lv.cot === null ? "→ 0 · obfuscated · still hacking" : `${lv.cot}% recall`}
        </text>
        {compact && (
          <text
            x={tickX}
            y={mon.b1 + 30}
            textAnchor="end"
            fill={p.soft}
            style={{ fontSize: fs - 3, fontFamily: mono }}
          >
            measured 95
          </text>
        )}

        {/* row 2: actions only */}
        <text x={mon.x0} y={mon.l2} fill={p.muted} style={{ fontSize: fs - 2, fontFamily: mono }}>
          ACTIONS ONLY
        </text>
        <rect x={mon.x0} y={mon.b2} width={mon.sc} height={12} fill={rgba(p.inkRGB, 0.06)} />
        <rect
          x={mon.x0}
          y={mon.b2}
          width={(ACTIONS_ONLY / 100) * mon.sc}
          height={12}
          fill={p.cool}
          opacity={0.75}
        />
        <text
          x={mon.x0 + (ACTIONS_ONLY / 100) * mon.sc + 8}
          y={mon.b2 + 10}
          fill={p.muted}
          style={{ fontSize: fs - 2, fontFamily: mono }}
        >
          {ACTIONS_ONLY}% recall
        </text>

        <text x={mon.x0} y={mon.note} fill={p.soft} style={{ fontSize: fs - 3, fontFamily: mono }}>
          anchors measured · trajectory schematic
        </text>
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{
          fontFamily: mono,
          color: sel === 3 ? p.danger : sel === 0 ? p.signal : p.ink,
        }}
      >
        {"VERDICT · "}
        {lv.verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {LEVELS.map((l, i) => {
          const isSel = i === sel
          const hot = i === 3
          return (
            <button
              key={l.key}
              type="button"
              aria-pressed={isSel}
              onClick={() => setSel(i)}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
              style={{
                fontFamily: mono,
                color: isSel ? (hot ? p.dangerHi : p.signalHi) : p.muted,
                border: `1px solid ${isSel ? (hot ? p.danger : p.signal) : p.hair}`,
                background: isSel
                  ? hot
                    ? rgba(p.dangerRGB, 0.1)
                    : rgba(p.signalRGB, 0.1)
                  : "transparent",
              }}
            >
              {l.name}
            </button>
          )
        })}
        <span className="text-[11px]" style={{ fontFamily: mono, color: p.soft }}>
          turn the dial · watch the goal detach
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function GoodhartDial() {
  return (
    <InstrumentFrame
      kicker="V8 · THE GOODHART DIAL"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          Push on a proxy and it stays honest only while the pressure is light; push
          harder and the score keeps climbing after the goal has left the room.
          Reading the chain of thought catches most of the gaming, until the monitor
          itself becomes a target and the model learns to hack quietly.
        </>
      }
      method={
        <>
          SCHEMATIC · the dial, both curves and the recall trajectory are a seeded
          model; the case markers and recall anchors are measured. CoastRunners:
          OpenAI, Faulty reward functions in the wild (2016), score ~20% above human
          players, race never finished. Lego flip: DeepMind, Specification gaming
          (Krakovna, Uesato et al., 2020), reward = height of the block&rsquo;s bottom
          face, so the agent flips it. Sims fall-over + the ~60-entry case list:
          Krakovna master list (2018) + Lehman et al. (2020). Monitor: OpenAI, arXiv
          2503.11926 (2025), 95% recall with chain of thought vs 60% recall
          actions-only; optimizing against the monitor drives recall toward zero
          without stopping the hacking.
        </>
      }
    >
      {(ctx) => <DialScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
