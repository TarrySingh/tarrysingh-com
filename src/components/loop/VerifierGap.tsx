"use client"

/**
 * V3 · THE VERIFIER GAP - an instrument of THE ENGINE ROOM (Plate V).
 *
 * A seeded conveyor: 24 work items with fixed hidden defects flow through a
 * verifier gate into a SHIPPED bin. The reader raises the gate's strictness
 * (NONE · SMOKE · TESTS · ADVERSARIAL) and watches the same batch sort
 * differently:
 *   - weak gate: throughput looks great, but broken items land in the shipped
 *     bin with a rose outline (fake done) and surface downstream
 *   - strict gate: more items bounce back as rework (amber), and the shipped
 *     bin holds only work that actually works
 *
 * The conveyor is SCHEMATIC (seeded mulberry32, deterministic per level) and
 * the method lane says so. The gate taxonomy itself is sourced: Anthropic
 * documents verification as pluggable (rules-based, visual, LLM-as-judge with
 * an explicit caveat); Huntley's Ralph pattern wires arbitrary checks in as
 * back pressure to reject invalid generations.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Deterministic batch + per-level outcomes (module scope: SSR === CSR).
// ---------------------------------------------------------------------------

const N = 24

// The batch never changes: the same items carry the same hidden defects at
// every strictness level. Only the gate changes.
const DEFECT: boolean[] = (() => {
  const rnd = mulberry32(0xd00dfeed)
  return Array.from({ length: N }, () => rnd() < 0.4)
})()

type Fate = "good" | "fake" | "rework"

interface LevelData {
  key: string
  desc: string
  teeth: number
  fates: Fate[]
  shipSlot: number[]
  reworkSlot: number[]
  ship: number
  good: number
  fake: number
  rework: number
  verdict: string
}

interface LevelSpec {
  key: string
  desc: string
  teeth: number
  catchP: number
  goodBounceP: number
  seed: number
}

const SPECS: LevelSpec[] = [
  {
    key: "NONE",
    desc: "no back pressure · nothing rejected",
    teeth: 0,
    catchP: 0,
    goodBounceP: 0,
    seed: 0x0a11ce01,
  },
  {
    key: "SMOKE",
    desc: "one run · a glance at the output",
    teeth: 1,
    catchP: 0.35,
    goodBounceP: 0.05,
    seed: 0x0a11ce02,
  },
  {
    key: "TESTS",
    desc: "rules-based · tests, linters, type checks",
    teeth: 3,
    catchP: 0.88,
    goodBounceP: 0.1,
    seed: 0x0a11ce03,
  },
  {
    key: "ADVERSARIAL",
    desc: "rules + scanners + a hostile second pass",
    teeth: 5,
    catchP: 1,
    goodBounceP: 0.2,
    seed: 0x0a11ce04,
  },
]

function buildLevels(): LevelData[] {
  return SPECS.map((spec) => {
    const rnd = mulberry32(spec.seed)
    const fates: Fate[] = []
    for (let i = 0; i < N; i++) {
      const roll = rnd()
      if (DEFECT[i]) {
        fates.push(roll < spec.catchP ? "rework" : "fake")
      } else {
        fates.push(roll < spec.goodBounceP ? "rework" : "good")
      }
    }
    const shipSlot: number[] = []
    const reworkSlot: number[] = []
    let shipN = 0
    let reworkN = 0
    let fake = 0
    for (let i = 0; i < N; i++) {
      if (fates[i] === "rework") {
        reworkSlot.push(reworkN)
        shipSlot.push(-1)
        reworkN++
      } else {
        shipSlot.push(shipN)
        reworkSlot.push(-1)
        shipN++
        if (fates[i] === "fake") fake++
      }
    }
    const good = shipN - fake
    const verdict =
      spec.key === "NONE"
        ? `${shipN}/${N} shipped · zero rework · ${fake} broken items counted as done`
        : spec.key === "SMOKE"
          ? `${shipN}/${N} shipped · the gate watched it run once · ${fake} defects passed`
          : spec.key === "TESTS"
            ? `${reworkN} bounced at the gate · ${fake} defect${fake === 1 ? "" : "s"} still slipped the rules`
            : `${reworkN} bounced · ${fake} fake done · shipped now means shipped`
    return {
      key: spec.key,
      desc: spec.desc,
      teeth: spec.teeth,
      fates,
      shipSlot,
      reworkSlot,
      ship: shipN,
      good,
      fake,
      rework: reworkN,
      verdict,
    }
  })
}

const LEVELS = buildLevels()

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function GateScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx
  const [lv, setLv] = useState(0) // start on NONE: the throughput trap
  const L = LEVELS[lv]

  // Reveal index: item i is sorted at step i+1. Reduced motion (or
  // pre-hydration) shows the fully sorted batch.
  const [k, setK] = useState(reduced ? N : 0)
  const kRef = useRef(k)
  kRef.current = k

  useEffect(() => {
    setK(reduced ? N : 0)
  }, [lv, reduced])

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
        acc += Math.min(64, t - last)
        if (acc > 130 && kRef.current < N) {
          acc = 0
          setK((v) => Math.min(N, v + 1))
        }
      }
      last = t
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced, lv])

  // Live counters: only the items processed so far.
  const counts = useMemo(() => {
    let ship = 0
    let fake = 0
    let rework = 0
    for (let i = 0; i < k; i++) {
      if (L.fates[i] === "rework") rework++
      else {
        ship++
        if (L.fates[i] === "fake") fake++
      }
    }
    return { ship, fake, rework, good: ship - fake }
  }, [L, k])

  const W = compact ? 460 : 980
  const H = compact ? 700 : 560
  // Compact renders ~460 viewBox units into a ~320px stage (scale ~0.7), so
  // raw sizes run larger there to keep every label >= ~9.5px on screen.
  const fs = compact ? 17 : 13.5

  const fillFor = (f: Fate) =>
    f === "good" ? rgba(p.signalRGB, 0.3) : f === "fake" ? rgba(p.dangerRGB, 0.14) : "none"
  const strokeFor = (f: Fate) => (f === "good" ? p.signal : f === "fake" ? p.danger : p.verdict)

  const counterBlocks = [
    { label: "THROUGHPUT", value: `${counts.ship}/${N}`, color: p.ink },
    { label: "REWORK", value: `${counts.rework}`, color: p.verdict },
    { label: "FAKE DONE", value: `${counts.fake}`, color: counts.fake > 0 ? p.danger : p.signal },
  ]

  const fakeNote =
    counts.fake > 0
      ? `${counts.fake} of these are broken · found downstream`
      : "every shipped item verified · nothing hidden"

  // ---------------------------------------------------------------- compact
  if (compact) {
    const queue = { x0: 117, y0: 152, cell: 30, size: 16, cols: 8 }
    const band = { x: 24, y: 264, w: 412, h: 34 }
    const shipBin = { x: 24, y: 356, w: 412, h: 150 }
    const reworkBin = { x: 24, y: 544, w: 412, h: 120 }
    const grid = { cell: 34, size: 20, cols: 8 }
    return (
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" style={{ width: "100%", height: "auto", display: "block" }}>
          <title>A verifier gate sorting the same batch of work at four strictness levels</title>
          <desc>
            Twenty four work items with fixed hidden defects flow through a verifier
            gate. At low strictness nearly everything ships and broken items land in
            the shipped bin. At high strictness more items bounce back as rework and
            the shipped bin holds only working items.
          </desc>

          <text
            x={16}
            y={30}
            fill={p.soft}
            style={{ fontSize: fs - 2, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}
          >
            24 ITEMS · ONLY THE GATE CHANGES
          </text>

          {/* counters */}
          {counterBlocks.map((b, i) => (
            <g key={b.label}>
              <text
                x={16 + i * 154}
                y={70}
                fill={p.soft}
                style={{ fontSize: fs - 4, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
              >
                {b.label}
              </text>
              <text
                x={16 + i * 154}
                y={100}
                fill={b.color}
                style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
              >
                {b.value}
              </text>
            </g>
          ))}

          {/* queue */}
          <text
            x={16}
            y={140}
            fill={p.soft}
            style={{ fontSize: fs - 4, letterSpacing: "0.14em", fontFamily: "var(--font-mono), monospace" }}
          >
            INBOUND QUEUE
          </text>
          {Array.from({ length: N }, (_, i) => {
            if (i < k) return null
            const col = i % queue.cols
            const row = Math.floor(i / queue.cols)
            return (
              <rect
                key={i}
                x={queue.x0 + col * queue.cell}
                y={queue.y0 + row * queue.cell}
                width={queue.size}
                height={queue.size}
                rx={3}
                fill={rgba(p.inkRGB, 0.1)}
                stroke={p.hair}
                strokeWidth={1}
              />
            )
          })}

          {/* flow arrow into the gate */}
          <line x1={230} y1={238} x2={230} y2={256} stroke={p.soft} strokeWidth={1.6} />
          <polygon points="230,262 224,252 236,252" fill={p.soft} />

          {/* gate band */}
          <rect x={band.x} y={band.y} width={band.w} height={band.h} rx={5} fill={rgba(p.inkRGB, 0.05)} stroke={p.hair} strokeWidth={1.2} />
          {Array.from({ length: L.teeth }, (_, i) => {
            const y = band.y + band.h / 2 + (i - (L.teeth - 1) / 2) * 6
            return <line key={i} x1={band.x + 10} y1={y} x2={band.x + band.w - 10} y2={y} stroke={p.signal} strokeWidth={1.8} />
          })}
          {L.teeth === 0 && (
            <text
              x={230}
              y={band.y + band.h / 2 + 5}
              textAnchor="middle"
              fill={p.danger}
              style={{ fontSize: fs - 3, letterSpacing: "0.2em", fontFamily: "var(--font-mono), monospace" }}
            >
              OPEN
            </text>
          )}
          <text
            x={230}
            y={322}
            textAnchor="middle"
            fill={p.ink}
            style={{ fontSize: fs - 1, fontWeight: 700, letterSpacing: "0.14em", fontFamily: "var(--font-mono), monospace" }}
          >
            GATE · {L.key}
          </text>
          <text
            x={230}
            y={342}
            textAnchor="middle"
            fill={p.muted}
            style={{ fontSize: fs - 3.5, fontFamily: "var(--font-mono), monospace" }}
          >
            {L.desc}
          </text>

          {/* shipped bin */}
          <rect x={shipBin.x} y={shipBin.y} width={shipBin.w} height={shipBin.h} rx={6} fill={rgba(p.signalRGB, 0.05)} stroke={p.hair} strokeWidth={1.2} />
          <text
            x={shipBin.x + 8}
            y={shipBin.y + 20}
            fill={p.signal}
            style={{ fontSize: fs - 3, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
          >
            SHIPPED · {counts.ship}
          </text>
          <text
            x={shipBin.x + shipBin.w - 8}
            y={shipBin.y + 20}
            textAnchor="end"
            fill={p.muted}
            style={{ fontSize: fs - 4, fontFamily: "var(--font-mono), monospace" }}
          >
            {counts.good} work
          </text>
          {Array.from({ length: N }, (_, i) => {
            if (i >= k || L.fates[i] === "rework") return null
            const s = L.shipSlot[i]
            const col = s % grid.cols
            const row = Math.floor(s / grid.cols)
            const fake = L.fates[i] === "fake"
            return (
              <rect
                key={i}
                x={shipBin.x + 16 + col * (grid.cell + 14)}
                y={shipBin.y + 34 + row * grid.cell}
                width={grid.size}
                height={grid.size}
                rx={3}
                fill={fillFor(L.fates[i])}
                stroke={strokeFor(L.fates[i])}
                strokeWidth={fake ? 1.8 : 1.4}
                strokeDasharray={fake ? "3 3" : undefined}
              />
            )
          })}
          <text
            x={shipBin.x}
            y={528}
            fill={counts.fake > 0 ? p.danger : p.signal}
            style={{ fontSize: fs - 4, fontFamily: "var(--font-mono), monospace" }}
          >
            {fakeNote}
          </text>

          {/* rework bin */}
          <rect x={reworkBin.x} y={reworkBin.y} width={reworkBin.w} height={reworkBin.h} rx={6} fill={rgba(p.inkRGB, 0.03)} stroke={p.hair} strokeWidth={1.2} />
          <text
            x={reworkBin.x + 8}
            y={reworkBin.y + 20}
            fill={p.verdict}
            style={{ fontSize: fs - 3, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
          >
            REWORK · {counts.rework}
          </text>
          {Array.from({ length: N }, (_, i) => {
            if (i >= k || L.fates[i] !== "rework") return null
            const s = L.reworkSlot[i]
            const col = s % grid.cols
            const row = Math.floor(s / grid.cols)
            return (
              <rect
                key={i}
                x={reworkBin.x + 16 + col * (grid.cell + 14)}
                y={reworkBin.y + 34 + row * grid.cell}
                width={grid.size}
                height={grid.size}
                rx={3}
                fill="none"
                stroke={p.verdict}
                strokeWidth={1.6}
              />
            )
          })}
          {counts.rework > 0 && (
            <text
              x={reworkBin.x}
              y={686}
              fill={p.verdict}
              style={{ fontSize: fs - 4, fontFamily: "var(--font-mono), monospace" }}
            >
              rework loops back to the queue
            </text>
          )}
        </svg>
        {lane(L, p, lv, setLv)}
      </div>
    )
  }

  // ---------------------------------------------------------------- desktop
  const queue = { x0: 62, y0: 172, cell: 28, size: 16, cols: 6 }
  const gate = { x: 455, w: 30, yTop: 170, slotTop: 285, slotBot: 315, yBot: 430 }
  const shipBin = { x: 620, y: 170, w: 312, h: 130 }
  const reworkBin = { x: 620, y: 350, w: 312, h: 100 }
  const grid = { cellX: 36, cellY: 32, size: 18, cols: 8 }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" style={{ width: "100%", height: "auto", display: "block" }}>
        <title>A verifier gate sorting the same batch of work at four strictness levels</title>
        <desc>
          Twenty four work items with fixed hidden defects flow through a verifier
          gate. At low strictness nearly everything ships and broken items land in
          the shipped bin. At high strictness more items bounce back as rework and
          the shipped bin holds only working items.
        </desc>

        <text
          x={60}
          y={36}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          SEEDED BATCH · 24 WORK ITEMS · SAME HIDDEN DEFECTS · ONLY THE GATE CHANGES
        </text>

        {/* counters */}
        {counterBlocks.map((b, i) => (
          <g key={b.label}>
            <text
              x={60 + i * 180}
              y={78}
              fill={p.soft}
              style={{ fontSize: fs - 3, letterSpacing: "0.16em", fontFamily: "var(--font-mono), monospace" }}
            >
              {b.label}
            </text>
            <text
              x={60 + i * 180}
              y={110}
              fill={b.color}
              style={{ fontSize: 30, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
            >
              {b.value}
            </text>
          </g>
        ))}
        <text
          x={920}
          y={110}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
        >
          processed {k}/{N}
        </text>

        {/* queue */}
        <text
          x={60}
          y={158}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.14em", fontFamily: "var(--font-mono), monospace" }}
        >
          INBOUND QUEUE
        </text>
        {Array.from({ length: N }, (_, i) => {
          if (i < k) return null
          const col = i % queue.cols
          const row = Math.floor(i / queue.cols)
          return (
            <rect
              key={i}
              x={queue.x0 + col * queue.cell}
              y={queue.y0 + row * queue.cell}
              width={queue.size}
              height={queue.size}
              rx={3}
              fill={rgba(p.inkRGB, 0.1)}
              stroke={p.hair}
              strokeWidth={1}
            />
          )
        })}

        {/* conveyor into the gate */}
        <line x1={240} y1={300} x2={443} y2={300} stroke={p.soft} strokeWidth={1.6} />
        <polygon points="453,300 441,294 441,306" fill={p.soft} />

        {/* gate: two posts with a slot; teeth screen the slot */}
        <text
          x={gate.x + gate.w / 2}
          y={158}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          VERIFIER GATE
        </text>
        <rect x={gate.x} y={gate.yTop} width={gate.w} height={gate.slotTop - gate.yTop} rx={4} fill={rgba(p.inkRGB, 0.05)} stroke={p.hair} strokeWidth={1.2} />
        <rect x={gate.x} y={gate.slotBot} width={gate.w} height={gate.yBot - gate.slotBot} rx={4} fill={rgba(p.inkRGB, 0.05)} stroke={p.hair} strokeWidth={1.2} />
        {Array.from({ length: L.teeth }, (_, i) => {
          const x = gate.x + gate.w / 2 + (i - (L.teeth - 1) / 2) * 6
          return <line key={i} x1={x} y1={gate.slotTop} x2={x} y2={gate.slotBot} stroke={p.signal} strokeWidth={2} />
        })}
        {L.teeth === 0 && (
          <text
            x={gate.x + gate.w / 2}
            y={gate.slotBot + 24}
            textAnchor="middle"
            fill={p.danger}
            style={{ fontSize: fs - 3.5, letterSpacing: "0.2em", fontFamily: "var(--font-mono), monospace" }}
          >
            OPEN
          </text>
        )}
        <text
          x={gate.x + gate.w / 2}
          y={452}
          textAnchor="middle"
          fill={p.ink}
          style={{ fontSize: fs + 0.5, fontWeight: 700, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
        >
          {L.key}
        </text>
        <text
          x={gate.x + gate.w / 2}
          y={471}
          textAnchor="middle"
          fill={p.muted}
          style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
        >
          {L.desc}
        </text>

        {/* flows out of the gate */}
        <line x1={488} y1={296} x2={604} y2={238} stroke={p.signal} strokeWidth={1.4} />
        <polygon points="612,235 600,234 604,245" fill={p.signal} />
        {L.rework > 0 && (
          <>
            <line x1={488} y1={304} x2={604} y2={396} stroke={p.verdict} strokeWidth={1.4} strokeDasharray="5 4" />
            <polygon points="612,400 600,400 606,389" fill={p.verdict} />
          </>
        )}

        {/* shipped bin */}
        <rect x={shipBin.x} y={shipBin.y} width={shipBin.w} height={shipBin.h} rx={6} fill={rgba(p.signalRGB, 0.05)} stroke={p.hair} strokeWidth={1.2} />
        <text
          x={shipBin.x + 10}
          y={shipBin.y + 20}
          fill={p.signal}
          style={{ fontSize: fs - 2, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
        >
          SHIPPED · {counts.ship}
        </text>
        <text
          x={shipBin.x + shipBin.w - 10}
          y={shipBin.y + 20}
          textAnchor="end"
          fill={p.muted}
          style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
        >
          {counts.good} actually work
        </text>
        {Array.from({ length: N }, (_, i) => {
          if (i >= k || L.fates[i] === "rework") return null
          const s = L.shipSlot[i]
          const col = s % grid.cols
          const row = Math.floor(s / grid.cols)
          const fake = L.fates[i] === "fake"
          return (
            <rect
              key={i}
              x={shipBin.x + 12 + col * grid.cellX}
              y={shipBin.y + 34 + row * grid.cellY}
              width={grid.size}
              height={grid.size}
              rx={3}
              fill={fillFor(L.fates[i])}
              stroke={strokeFor(L.fates[i])}
              strokeWidth={fake ? 1.8 : 1.4}
              strokeDasharray={fake ? "3 3" : undefined}
            />
          )
        })}
        <text
          x={shipBin.x}
          y={322}
          fill={counts.fake > 0 ? p.danger : p.signal}
          style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
        >
          {fakeNote}
        </text>

        {/* rework bin */}
        <rect x={reworkBin.x} y={reworkBin.y} width={reworkBin.w} height={reworkBin.h} rx={6} fill={rgba(p.inkRGB, 0.03)} stroke={p.hair} strokeWidth={1.2} />
        <text
          x={reworkBin.x + 10}
          y={reworkBin.y + 20}
          fill={p.verdict}
          style={{ fontSize: fs - 2, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
        >
          REWORK · BOUNCED AT THE GATE
        </text>
        <text
          x={reworkBin.x + reworkBin.w - 10}
          y={reworkBin.y + 20}
          textAnchor="end"
          fill={p.muted}
          style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
        >
          {counts.rework}
        </text>
        {Array.from({ length: N }, (_, i) => {
          if (i >= k || L.fates[i] !== "rework") return null
          const s = L.reworkSlot[i]
          const col = s % grid.cols
          const row = Math.floor(s / grid.cols)
          return (
            <rect
              key={i}
              x={reworkBin.x + 12 + col * grid.cellX}
              y={reworkBin.y + 34 + row * grid.cellY}
              width={grid.size}
              height={grid.size}
              rx={3}
              fill="none"
              stroke={p.verdict}
              strokeWidth={1.6}
            />
          )
        })}

        {/* rework returns to the queue */}
        {counts.rework > 0 && (
          <>
            <polyline
              points="700,450 700,520 174,520"
              fill="none"
              stroke={p.verdict}
              strokeWidth={1.4}
              strokeDasharray="5 4"
            />
            <polygon points="162,520 174,514 174,526" fill={p.verdict} />
            <text
              x={190}
              y={512}
              fill={p.verdict}
              style={{ fontSize: fs - 3, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}
            >
              REWORK RETURNS TO THE QUEUE
            </text>
          </>
        )}
      </svg>
      {lane(L, p, lv, setLv)}
    </div>
  )
}

// Verdict line + controls lane, shared by both layouts.
function lane(
  L: LevelData,
  p: SceneCtx["p"],
  lv: number,
  setLv: (i: number) => void,
) {
  const tone = L.fake >= 5 ? p.danger : L.fake > 0 ? p.verdict : p.signal
  return (
    <>
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: "var(--font-mono), monospace", color: tone }}
      >
        {"VERDICT · "}
        {L.verdict}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {LEVELS.map((l, i) => (
          <button
            key={l.key}
            type="button"
            aria-pressed={i === lv}
            onClick={() => setLv(i)}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: i === lv ? p.signalHi : p.muted,
              border: `1px solid ${i === lv ? p.signal : p.hair}`,
              background: i === lv ? rgba(p.signalRGB, 0.1) : "transparent",
            }}
          >
            {l.key}
          </button>
        ))}
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          raise the gate · watch what ships
        </span>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------

export function VerifierGap() {
  return (
    <InstrumentFrame
      kicker="V3 · THE VERIFIER GAP"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          The batch and its defects never change; only the gate does, and the gate,
          not the model, decides what compounds. A weak verifier does not buy speed:
          it ships broken work with a green tick and defers the cost to whoever finds
          it downstream.
        </>
      }
      method={
        <>
          SCHEMATIC · the conveyor is a seeded, deterministic model; item counts are
          illustrative, not measured. Gate taxonomy: Anthropic, Building agents with
          the Claude Agent SDK (2025): verification is pluggable and comes as
          rules-based feedback, visual feedback, or LLM-as-judge, the last caveated
          as &ldquo;generally not a very robust method&rdquo;. Backpressure: G. Huntley,
          ghuntley.com/ralph (2025): &ldquo;Anything can be wired in as back pressure
          to reject invalid code generation.&rdquo;
        </>
      }
    >
      {(ctx) => <GateScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
