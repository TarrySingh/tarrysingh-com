"use client"

/**
 * V1 · THE LOOP - the hero instrument of THE ENGINE ROOM (Plate V).
 *
 * A live, seeded simulation of the agent loop: PLAN -> ACT -> VERIFY ->
 * PERSIST, orbiting. The reader can switch off the verifier or the state
 * file and watch the progress trace diverge:
 *   - verifier off: claimed progress races to done while true quality decays
 *     (confident garbage; the gap is the lie)
 *   - state file off: the loop replans the step it already finished, forever
 *   - both off: noise that looks like work
 *
 * The trace is SCHEMATIC (a seeded model of documented failure modes, not a
 * measurement) and the method lane says so. The loop stages and the failure
 * modes themselves are sourced: Anthropic frames the loop as gather context,
 * take action, verify work, repeat; Huntley's Ralph pattern wires in
 * backpressure and keeps state on disk between iterations.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useRef, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Deterministic series (module scope: computed once, identical on SSR + CSR).
// ---------------------------------------------------------------------------

const N = 24 // iterations shown

interface Series {
  claimed: number[]
  actual: number[]
  doneClaimedAt: number | null
  verdict: string
}

function buildSeries(): Record<string, Series> {
  const rnd = mulberry32(0x1337c0de)
  const jitter = (amp: number) => (rnd() - 0.5) * amp
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

  // Healthy: converges, verifies, persists; done around iteration 14.
  const healthyActual: number[] = []
  for (let i = 0; i <= N; i++) {
    const base = 100 * easeOut(Math.min(1, i / 14))
    healthyActual.push(i >= 14 ? 100 : Math.max(0, Math.min(98, base + jitter(5))))
  }
  const healthy: Series = {
    claimed: healthyActual,
    actual: healthyActual,
    doneClaimedAt: 14,
    verdict: "done at iteration 14 · verified · shipped",
  }

  // Verifier off: claimed races to done; true quality tops out low, then
  // decays as unverified errors compound into the next iteration's input.
  const nvClaimed: number[] = []
  const nvActual: number[] = []
  let q = 0
  for (let i = 0; i <= N; i++) {
    nvClaimed.push(Math.min(100, i * 12 + (i < 9 ? jitter(6) : 0)))
    if (i <= 5) q = Math.min(34, i * 6 + jitter(4))
    else q = Math.max(6, q - (2.1 + rnd() * 1.7))
    nvActual.push(q)
  }
  const noVerify: Series = {
    claimed: nvClaimed,
    actual: nvActual,
    doneClaimedAt: 9,
    verdict: `claimed done at iteration 9 · true quality ${Math.round(nvActual[N])}% · confident garbage`,
  }

  // State file off: honest verifier, but no persisted progress, so the loop
  // replans the step it already finished. A sawtooth that never climbs.
  const npActual: number[] = []
  for (let i = 0; i <= N; i++) {
    const cycle = i % 5
    npActual.push(Math.max(4, 14 + cycle * 5 + jitter(4)))
  }
  const noPersist: Series = {
    claimed: npActual,
    actual: npActual,
    doneClaimedAt: null,
    verdict: "iteration 24 · still on step 3 · the loop forgot it already did this",
  }

  // Both off: noise that looks like work.
  const bClaimed: number[] = []
  const bActual: number[] = []
  for (let i = 0; i <= N; i++) {
    bClaimed.push(55 + ((i % 4) / 3) * 40 + jitter(8))
    bActual.push(Math.max(2, 8 + jitter(6)))
  }
  const neither: Series = {
    claimed: bClaimed,
    actual: bActual,
    doneClaimedAt: null,
    verdict: "no verifier, no state · noise that looks like work",
  }

  return { healthy, noVerify, noPersist, neither }
}

const SERIES = buildSeries()

const STAGES = [
  { key: "plan", label: "PLAN", angle: -90 },
  { key: "act", label: "ACT", angle: 0 },
  { key: "verify", label: "VERIFY", angle: 90 },
  { key: "persist", label: "PERSIST", angle: 180 },
] as const

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function tracePath(
  values: number[],
  upto: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
): string {
  // y0 = bottom (0%), y1 = top (100%)
  const pts: string[] = []
  for (let i = 0; i <= upto; i++) {
    const x = x0 + ((x1 - x0) * i) / N
    const y = y0 + ((y1 - y0) * Math.min(100, Math.max(0, values[i]))) / 100
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(" ")
}

function LoopScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx
  const [verifyOn, setVerifyOn] = useState(true)
  const [persistOn, setPersistOn] = useState(true)
  const regime = verifyOn && persistOn ? "healthy" : !verifyOn && persistOn ? "noVerify" : verifyOn ? "noPersist" : "neither"
  const s = SERIES[regime]

  // Iteration reveal + orbit angle, driven by rAF after mount. Reduced
  // motion (or pre-hydration) shows the complete final state.
  const [k, setK] = useState(reduced ? N : 0)
  const [orbit, setOrbit] = useState(-90)
  const kRef = useRef(k)
  kRef.current = k

  useEffect(() => {
    setK(reduced ? N : 0)
  }, [regime, reduced])

  useEffect(() => {
    if (reduced) {
      setK(N)
      return
    }
    let raf = 0
    let last: number | null = null
    let acc = 0
    const step = (t: number) => {
      if (last !== null) {
        const dt = Math.min(64, t - last)
        acc += dt
        setOrbit((o) => o + dt * 0.09)
        if (acc > 560 && kRef.current < N) {
          acc = 0
          setK((v) => Math.min(N, v + 1))
        }
      }
      last = t
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced, regime])

  // Geometry
  const W = compact ? 460 : 980
  const H = compact ? 780 : 520
  const ring = compact
    ? { cx: 230, cy: 200, r: 128 }
    : { cx: 236, cy: 258, r: 150 }
  const plot = compact
    ? { x0: 64, x1: 424, yBottom: 700, yTop: 420 }
    : { x0: 500, x1: 930, yBottom: 440, yTop: 100 }

  const stageOff = (key: string) =>
    (key === "verify" && !verifyOn) || (key === "persist" && !persistOn)

  const claimedNow = Math.round(s.claimed[k])
  const actualNow = Math.round(s.actual[k])
  const divergent = regime === "noVerify" || regime === "neither"

  // Compact renders ~460 viewBox units into a ~320px stage (scale ~0.7), so
  // raw sizes run larger there to keep every label >= ~9.5px on screen.
  const fs = compact ? 17 : 13.5

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>The agent loop: plan, act, verify, persist</title>
        <desc>
          A running loop with four stages. Switching off the verifier makes claimed
          progress reach one hundred percent while true quality decays; switching off
          the state file makes the loop repeat the same step forever.
        </desc>

        {/* ── The ring ── */}
        <circle
          cx={ring.cx}
          cy={ring.cy}
          r={ring.r}
          fill="none"
          stroke={p.hair}
          strokeWidth={1.4}
        />
        {/* direction hint */}
        {[30, 120, 210, 300].map((a) => {
          const [x, y] = polar(ring.cx, ring.cy, ring.r, a)
          const [x2, y2] = polar(ring.cx, ring.cy, ring.r, a + 7)
          return (
            <line
              key={a}
              x1={x}
              y1={y}
              x2={x2}
              y2={y2}
              stroke={p.soft}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          )
        })}

        {/* stations */}
        {STAGES.map((st) => {
          const [x, y] = polar(ring.cx, ring.cy, ring.r, st.angle)
          const off = stageOff(st.key)
          const labelDy = st.angle === -90 ? -26 : st.angle === 90 ? 38 : 5
          const labelDx = st.angle === 0 ? 30 : st.angle === 180 ? -16 : 0
          const anchor = st.angle === 0 ? "start" : st.angle === 180 ? "end" : "middle"
          return (
            <g key={st.key}>
              <circle
                cx={x}
                cy={y}
                r={13}
                fill={off ? "none" : rgba(p.signalRGB, 0.16)}
                stroke={off ? p.danger : p.signal}
                strokeWidth={off ? 1.6 : 2}
                strokeDasharray={off ? "4 4" : undefined}
              />
              <text
                x={x + labelDx}
                y={y + labelDy}
                textAnchor={anchor}
                fill={off ? p.danger : p.ink}
                style={{
                  fontSize: fs,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  fontFamily: "var(--font-mono), monospace",
                }}
              >
                {st.label}
              </text>
              {off && (
                <text
                  x={x + labelDx}
                  y={y + labelDy + (st.angle === -90 ? -15 : 16)}
                  textAnchor={anchor}
                  fill={p.danger}
                  style={{
                    fontSize: fs - 3,
                    letterSpacing: "0.14em",
                    fontFamily: "var(--font-mono), monospace",
                  }}
                >
                  OFF
                </text>
              )}
            </g>
          )
        })}

        {/* the iteration token */}
        {!reduced && (
          <g>
            {(() => {
              const [x, y] = polar(ring.cx, ring.cy, ring.r, orbit % 360)
              return (
                <>
                  <circle cx={x} cy={y} r={9} fill={rgba(p.signalRGB, 0.25)} />
                  <circle cx={x} cy={y} r={4.5} fill={p.signalHi} />
                </>
              )
            })()}
          </g>
        )}

        {/* centre readout */}
        <text
          x={ring.cx}
          y={ring.cy - 12}
          textAnchor="middle"
          fill={divergent ? p.danger : p.signalHi}
          style={{ fontSize: compact ? 40 : 42, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
        >
          {actualNow}%
        </text>
        <text
          x={ring.cx}
          y={ring.cy + 24}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: fs - 1, letterSpacing: "0.16em", fontFamily: "var(--font-mono), monospace" }}
        >
          TRUE PROGRESS
        </text>
        <text
          x={ring.cx}
          y={ring.cy + 46}
          textAnchor="middle"
          fill={p.verdict}
          style={{ fontSize: fs - 1, fontFamily: "var(--font-mono), monospace" }}
        >
          claimed {claimedNow}% · iter {k}/{N}
        </text>

        {/* ── The trace ── */}
        <g>
          {/* gridlines + axis labels */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = plot.yBottom + ((plot.yTop - plot.yBottom) * v) / 100
            return (
              <g key={v}>
                <line x1={plot.x0} y1={y} x2={plot.x1} y2={y} stroke={p.grid} strokeWidth={1} />
                <text
                  x={plot.x0 - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill={p.soft}
                  style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
                >
                  {v}
                </text>
              </g>
            )
          })}
          <text
            x={plot.x0}
            y={plot.yTop - (compact ? 14 : 18)}
            fill={p.soft}
            style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
          >
            PROGRESS % · BY ITERATION
          </text>
          <text
            x={plot.x1}
            y={plot.yBottom + 22}
            textAnchor="end"
            fill={p.soft}
            style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
          >
            iteration {N}
          </text>

          {/* ships zone */}
          <rect
            x={plot.x0}
            y={plot.yBottom + ((plot.yTop - plot.yBottom) * 100) / 100}
            width={plot.x1 - plot.x0}
            height={Math.abs(((plot.yTop - plot.yBottom) * 10) / 100)}
            fill={rgba(p.signalRGB, 0.06)}
          />
          <text
            x={plot.x1 - 4}
            y={plot.yTop + 14}
            textAnchor="end"
            fill={p.signal}
            style={{ fontSize: fs - 2.5, letterSpacing: "0.14em", fontFamily: "var(--font-mono), monospace" }}
          >
            SHIPS ≥ 90
          </text>

          {/* divergence fill: the lie between claimed and actual */}
          {divergent && k > 0 && (
            <polygon
              points={[
                ...s.claimed.slice(0, k + 1).map((v, i) => {
                  const x = plot.x0 + ((plot.x1 - plot.x0) * i) / N
                  const y = plot.yBottom + ((plot.yTop - plot.yBottom) * Math.min(100, v)) / 100
                  return `${x},${y}`
                }),
                ...s.actual
                  .slice(0, k + 1)
                  .map((v, i) => {
                    const x = plot.x0 + ((plot.x1 - plot.x0) * i) / N
                    const y = plot.yBottom + ((plot.yTop - plot.yBottom) * Math.max(0, v)) / 100
                    return `${x},${y}`
                  })
                  .reverse(),
              ].join(" ")}
              fill={rgba(p.dangerRGB, 0.12)}
            />
          )}

          {/* claimed (amber, dashed) then actual (the one green accent) */}
          {k > 0 && divergent && (
            <path
              d={tracePath(s.claimed, k, plot.x0, plot.x1, plot.yBottom, plot.yTop)}
              fill="none"
              stroke={p.verdict}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          {k > 0 && (
            <path
              d={tracePath(s.actual, k, plot.x0, plot.x1, plot.yBottom, plot.yTop)}
              fill="none"
              stroke={p.signal}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          )}

          {/* fake-done marker */}
          {divergent && s.doneClaimedAt !== null && k >= s.doneClaimedAt && (
            <g>
              {(() => {
                const x = plot.x0 + ((plot.x1 - plot.x0) * s.doneClaimedAt) / N
                const y = plot.yBottom + (plot.yTop - plot.yBottom)
                return (
                  <>
                    <line x1={x} y1={y} x2={x} y2={plot.yBottom} stroke={rgba(p.dangerRGB, 0.5)} strokeWidth={1} strokeDasharray="3 4" />
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      fill={p.danger}
                      style={{ fontSize: fs - 2, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}
                    >
                      FAKE DONE
                    </text>
                  </>
                )
              })()}
            </g>
          )}

          {/* legend */}
          <g style={{ fontFamily: "var(--font-mono), monospace" }}>
            <line x1={plot.x0} y1={plot.yBottom + 36} x2={plot.x0 + 22} y2={plot.yBottom + 36} stroke={p.signal} strokeWidth={2.6} />
            <text x={plot.x0 + 28} y={plot.yBottom + 40} fill={p.muted} style={{ fontSize: fs - 2 }}>
              true quality
            </text>
            <line x1={plot.x0 + 130} y1={plot.yBottom + 36} x2={plot.x0 + 152} y2={plot.yBottom + 36} stroke={p.verdict} strokeWidth={2} strokeDasharray="5 5" />
            <text x={plot.x0 + 158} y={plot.yBottom + 40} fill={p.muted} style={{ fontSize: fs - 2 }}>
              claimed
            </text>
          </g>
        </g>
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: "var(--font-mono), monospace", color: divergent ? p.danger : p.signal }}
      >
        {"VERDICT · "}
        {s.verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {[
          { label: "VERIFIER", on: verifyOn, set: setVerifyOn },
          { label: "STATE FILE", on: persistOn, set: setPersistOn },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            aria-pressed={t.on}
            onClick={() => t.set(!t.on)}
            className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: t.on ? p.signalHi : p.danger,
              border: `1px ${t.on ? "solid" : "dashed"} ${t.on ? p.signal : p.danger}`,
              background: t.on ? rgba(p.signalRGB, 0.1) : "transparent",
            }}
          >
            {t.label} · {t.on ? "ON" : "OFF"}
          </button>
        ))}
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          switch a stage off · watch the trace
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function TheLoop() {
  return (
    <InstrumentFrame
      kicker="V1 · THE LOOP"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          A loop without a verifier does not fail. It succeeds at the wrong thing,
          and each unverified result becomes the next iteration&rsquo;s input. A loop
          without a state file cannot fail either: it repeats the step it already
          finished, forever. The two switches above are the difference between an
          agent and an expensive random walk.
        </>
      }
      method={
        <>
          SCHEMATIC · the trace is a seeded, deterministic model of documented failure
          modes, not a measurement. Loop stages: Anthropic, Building agents with the
          Claude Agent SDK (2025): gather context, take action, verify work, repeat.
          Backpressure + state on disk: G. Huntley, the Ralph pattern, ghuntley.com/ralph
          (2025). Verification forms (rules, visual, LLM judge): same Anthropic source.
        </>
      }
    >
      {(ctx) => <LoopScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
