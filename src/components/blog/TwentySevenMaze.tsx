"use client"

/**
 * V32 — THE 27-TIMES MAZE  (Chapter 9, "The Moat With the Drawbridge Down:
 * Regulation" — the Brussels Effect inverted).
 *
 * "The single market" that isn't. A US startup faces ONE market and a clean,
 * open lane to scale. A European startup faces a maze it must run up to 27
 * times — once per member state — through the ~13,000+ EU rules issued 2019–24
 * (vs ~5,500 in the US), policed by ~270+ national digital regulators.
 *
 * The instrument is a contrast. On the RIGHT, the US side: a single open CYAN
 * lane, one market, a clean path. On the LEFT, the EU side: a fragmented grid of
 * 27 national cells with RED walls and a tangled path the founder must thread
 * cell by cell. The reader can TOGGLE EU ⟷ US, or STEP the startup deeper into
 * the maze (or press ▶) and watch two mono counters climb on the EU side — the
 * cumulative "rules to clear" and the "regulators" answering to — until the run
 * stalls.
 *
 * REVEAL: the drawbridge Europe keeps raising to keep rivals out mostly seals
 * its own founders in. 27 mazes wearing the name of a single market.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the ▶ loop is gated; reduced → the fully-run maze stands in),
 * keyboard-reachable (toggle + native range + buttons + ←/→ + ▶), and
 * meaningful at its default (the EU maze fully traversed, both counters maxed,
 * the US lane clean alongside).
 *
 * Figures hard-coded from the spec. Sources: Draghi report (13,000 vs 5,500
 * rules; 270+ digital regulators; Sept 2024).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp,
  clamp01,
  lerp,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

// Headline figures (Draghi, Sept 2024).
const EU_RULES = 13000 // EU rules issued 2019–24
const US_RULES = 5500 // US rules over the same window
const EU_REGULATORS = 270 // national digital regulators policing the maze
const MEMBER_STATES = 27 // the 27 mazes wearing the name of a single market

// The maze is a 3-row grid of national cells the founder threads in order. Nine
// waypoint cells stand in for the 27-times run; the path snakes between them.
const COLS = 3
const ROWS = 3
const CELLS = COLS * ROWS // 9 waypoint cells (the full 27 split into thirds)
const N = CELLS // steps 0..N: 0 = at the gate, N = fully run / stalled

// Per-step the founder clears another slice of the rule-book and answers to more
// regulators. Both climb linearly to the headline totals as the maze is run.
const rulesAt = (step: number) => Math.round(lerp(0, EU_RULES, clamp01(step / N)))
const regsAt = (step: number) => Math.round(lerp(0, EU_REGULATORS, clamp01(step / N)))

// Plot frame (viewBox units). EU maze on the left, US lane on the right.
const W = 960
const H = 560

// EU maze panel.
const EU_X = 48
const EU_Y = 150
const EU_W = 540
const EU_H = 348
const CELL_W = EU_W / COLS
const CELL_H = EU_H / ROWS

// US lane panel.
const US_X = 660
const US_Y = 150
const US_W = 252
const US_H = 348

// Cell centre for a waypoint index (boustrophedon — the path snakes row to row).
function cellCentre(idx: number): [number, number] {
  const row = Math.floor(idx / COLS)
  const colRaw = idx % COLS
  const col = row % 2 === 0 ? colRaw : COLS - 1 - colRaw // serpentine
  return [EU_X + col * CELL_W + CELL_W / 2, EU_Y + row * CELL_H + CELL_H / 2]
}

const intFmt = (v: number) => v.toLocaleString("en-US")

export function TwentySevenMaze() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // side: which market the reader is inspecting.
  const [side, setSide] = useState<"eu" | "us">("eu")
  // step ∈ [0, N] — how deep the founder is in the EU maze. Default: fully run.
  const [step, setStep] = useState(N)
  const [playing, setPlaying] = useState(false)

  // ▶ — mechanical advance, one cell per tick. Off under reduced motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= N) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => clamp(s + 1, 0, N)), 760)
    return () => window.clearTimeout(id)
  }, [playing, reduced, step])

  const isEU = side === "eu"
  const rules = rulesAt(step)
  const regs = regsAt(step)
  const stalled = step >= N

  function play() {
    if (reduced) {
      setStep(N)
      return
    }
    if (step >= N) setStep(0)
    setSide("eu")
    setPlaying(true)
  }

  // ←/→ scrub the maze depth; Home/End jump to the ends.
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
      setStep(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setStep(N)
    }
  }

  // The tangled EU path, drawn through the waypoint cells.
  const pathPts: Array<[number, number]> = Array.from({ length: CELLS }, (_, i) => cellCentre(i))
  const fullPath =
    "M " + pathPts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")
  // Travelled portion: up to the founder's current cell.
  const travelledPts = pathPts.slice(0, Math.max(1, step + 1))
  const travelledPath =
    "M " + travelledPts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")
  const [fx, fy] = cellCentre(clamp(step, 0, CELLS - 1))

  // EU emphasis grows as the founder threads more cells (walls redden, glow).
  const depth = clamp01(step / N)

  const verdict = isEU
    ? stalled
      ? {
          word: "SEALED IN",
          color: p.squeeze,
          line: "27 mazes wearing the name of a single market — the drawbridge seals the founder in",
        }
      : step === 0
        ? { word: "AT THE GATE", color: p.leverageHi, line: "one founder, 27 national mazes still to run" }
        : { word: "RUNNING THE MAZE", color: p.squeezeHi, line: "each cell another rule-book, another regulator to answer to" }
    : { word: "ONE OPEN LANE", color: p.leverage, line: "one market, ~5,500 rules, a clean path to scale" }

  const counterColor = mixHex(p.leverageHi, p.squeeze, depth)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V32 · The 27-Times Maze"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {isEU ? `EU · ${step}/${N} CELLS` : "US · ONE LANE"}
        </span>
      }
      caption={
        <>
          The single market that isn&rsquo;t. A US founder faces{" "}
          <span style={{ color: p.leverage }}>one market</span> and a clean lane —{" "}
          <span style={{ color: p.leverage }}>~5,500 rules</span>. A European founder runs a maze up to{" "}
          <span style={{ color: p.squeeze }}>27 times</span>, one per member state, through{" "}
          <span style={{ color: p.squeeze }}>~13,000+ EU rules</span> (2019–24) policed by{" "}
          <span style={{ color: p.squeeze }}>~270+ regulators</span>. Toggle EU&nbsp;⟷&nbsp;US, or step the
          founder (range, buttons, ←/→ or ▶) and watch the counters climb until the run stalls. The drawbridge
          Europe raises to keep rivals out mostly seals its own founders in. Source: Draghi report (Sept 2024).
        </>
      }
    >
      {/* market toggle — keyboard-reachable */}
      <div
        role="tablist"
        aria-label="Choose a market to inspect"
        onKeyDown={onKey}
        className="mb-3 flex flex-wrap gap-1.5 px-1"
      >
        {([
          { k: "eu", label: "European Union · 27 mazes", tint: p.squeeze },
          { k: "us", label: "United States · one lane", tint: p.leverage },
        ] as const).map(({ k, label, tint }) => {
          const active = side === k
          return (
            <button
              key={k}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setSide(k)}
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
              {label}
            </button>
          )
        })}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`The single market that isn't. A United States founder faces one open market and roughly 5,500 rules with a clean path to scale. A European founder faces a maze run up to 27 times, one per member state, through roughly 13,000-plus EU rules issued 2019 to 2024, policed by roughly 270-plus national digital regulators. ${
          isEU
            ? `At cell ${step} of ${N}, the founder has cleared ${intFmt(rules)} rules and answers to ${regs} regulators${
                stalled ? "; the run has stalled" : ""
              }.`
            : "Viewing the United States lane: one market, one clean path."
        }`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="tm-maze-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={lerp(0.05, 0.26, depth)} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="tm-lane" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.leverageHi} stopOpacity={0.34} />
            <stop offset="100%" stopColor={p.leverage} stopOpacity={0.08} />
          </linearGradient>
          <marker id="tm-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.leverage} />
          </marker>
        </defs>

        {/* ---- COUNTERS — the cost the EU founder pays, climbing as they run ---- */}
        <text x={EU_X} y={56} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Rules to clear
        </text>
        <text x={EU_X - 2} y={108} fill={counterColor} style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {intFmt(rules)}
        </text>
        <text x={EU_X} y={130} fill={p.muted} style={{ fontSize: 12 }}>
          of ~13,000+ · EU rules 2019–24
        </text>

        <text x={EU_X + 250} y={56} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Regulators
        </text>
        <text x={EU_X + 248} y={108} fill={counterColor} style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {regs}
        </text>
        <text x={EU_X + 250} y={130} fill={p.muted} style={{ fontSize: 12 }}>
          of ~270+ · national digital
        </text>

        {/* US comparison figure, anchored over its lane */}
        <text x={US_X + US_W / 2} y={56} textAnchor="middle" fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          US · rules
        </text>
        <text x={US_X + US_W / 2} y={108} textAnchor="middle" fill={p.leverage} style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {intFmt(US_RULES)}
        </text>
        <text x={US_X + US_W / 2} y={130} textAnchor="middle" fill={p.muted} style={{ fontSize: 12 }}>
          one market · one lane
        </text>

        {/* ================= EU SIDE — the fragmented 27-cell maze ================= */}
        <g opacity={isEU ? 1 : 0.32} style={{ transition: reduced ? "none" : "opacity 320ms ease" }}>
          <rect x={EU_X - 8} y={EU_Y - 8} width={EU_W + 16} height={EU_H + 16} rx={12} fill="url(#tm-maze-glow)" />

          {/* the 27 cells — three rows of nine, red walls */}
          {Array.from({ length: CELLS }, (_, i) => {
            const row = Math.floor(i / COLS)
            const col = i % COLS
            const x = EU_X + col * CELL_W
            const y = EU_Y + row * CELL_H
            const cleared = i <= step
            const wall = cleared ? p.squeeze : mixHex(p.squeeze, p.soft, 0.55)
            return (
              <rect
                key={`cell-${i}`}
                x={x + 3}
                y={y + 3}
                width={CELL_W - 6}
                height={CELL_H - 6}
                rx={5}
                fill={cleared ? rgba(p.glowRGB, 0.05) : "none"}
                stroke={wall}
                strokeWidth={cleared ? lerp(1.4, 2.6, depth) : 1.1}
                strokeOpacity={cleared ? 0.9 : 0.4}
              />
            )
          })}

          {/* "×27" — each waypoint is really run 27 times */}
          {pathPts.map(([cx, cy], i) => (
            <text
              key={`x27-${i}`}
              x={cx + CELL_W / 2 - 12}
              y={cy - CELL_H / 2 + 18}
              textAnchor="end"
              fill={i <= step ? p.squeezeHi : p.soft}
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.02em" }}
            >
              ×27
            </text>
          ))}

          {/* the tangled path — faint full route, bright travelled portion */}
          <path d={fullPath} fill="none" stroke={p.blueprint} strokeWidth={2} strokeDasharray="4 6" strokeLinejoin="round" />
          <path
            d={travelledPath}
            fill="none"
            stroke={p.squeeze}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.92}
          />

          {/* gate label */}
          <text x={EU_X} y={EU_Y - 4} fill={p.squeezeHi} style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.1em" }}>
            27 MAZES · ONE PER MEMBER STATE
          </text>

          {/* the founder — a token threading the maze, stalls at the end */}
          <g
            style={{
              transition: reduced ? "none" : "transform 520ms cubic-bezier(.4,0,.2,1)",
              transform: `translate(${fx - EU_X}px, ${fy - EU_Y}px)`,
            }}
          >
            <circle cx={EU_X} cy={EU_Y} r={stalled ? 11 : 9} fill={stalled ? p.squeeze : p.leverageHi} stroke={p.bg} strokeWidth={2.5} />
            <circle cx={EU_X} cy={EU_Y} r={16} fill="none" stroke={rgba(stalled ? p.glowRGB : "108,198,230", 0.4)} strokeWidth={1} />
            {stalled && (
              <text x={EU_X} y={EU_Y - 22} textAnchor="middle" fill={p.squeeze} style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em" }}>
                STALLED
              </text>
            )}
          </g>
        </g>

        {/* ================= US SIDE — the single open lane ================= */}
        <g opacity={isEU ? 0.4 : 1} style={{ transition: reduced ? "none" : "opacity 320ms ease" }}>
          <rect x={US_X} y={US_Y} width={US_W} height={US_H} rx={12} fill="url(#tm-lane)" stroke={p.leverage} strokeWidth={1.6} strokeOpacity={0.55} />
          {/* the clean open path straight up the lane */}
          <line
            x1={US_X + US_W / 2}
            y1={US_Y + US_H - 26}
            x2={US_X + US_W / 2}
            y2={US_Y + 30}
            stroke={p.leverage}
            strokeWidth={3.4}
            strokeLinecap="round"
            markerEnd="url(#tm-arrow)"
          />
          <text x={US_X + US_W / 2} y={US_Y - 4} textAnchor="middle" fill={p.leverage} style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.1em" }}>
            ONE MARKET · CLEAN LANE
          </text>
          {/* US founder, already at scale */}
          <circle cx={US_X + US_W / 2} cy={US_Y + US_H - 26} r={9} fill={p.leverageHi} stroke={p.bg} strokeWidth={2.5} />
          <text x={US_X + US_W / 2} y={US_Y + US_H - 4} textAnchor="middle" fill={p.muted} style={{ fontSize: 10, letterSpacing: "0.12em" }}>
            START
          </text>
          <text x={US_X + US_W / 2} y={US_Y + 18} textAnchor="middle" fill={p.leverageHi} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>
            SCALE
          </text>
        </g>

        {/* the drawbridge motif between the two — raised to keep rivals out */}
        <text x={(EU_X + EU_W + US_X) / 2} y={EU_Y + EU_H / 2 - 8} textAnchor="middle" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.14em" }}>
          THE
        </text>
        <text x={(EU_X + EU_W + US_X) / 2} y={EU_Y + EU_H / 2 + 8} textAnchor="middle" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.14em" }}>
          DRAWBRIDGE
        </text>
        <line
          x1={(EU_X + EU_W + US_X) / 2}
          y1={EU_Y + 18}
          x2={(EU_X + EU_W + US_X) / 2}
          y2={EU_Y + EU_H / 2 - 30}
          stroke={p.hair}
          strokeWidth={1}
          strokeDasharray="2 6"
        />
        <line
          x1={(EU_X + EU_W + US_X) / 2}
          y1={EU_Y + EU_H / 2 + 22}
          x2={(EU_X + EU_W + US_X) / 2}
          y2={EU_Y + EU_H - 18}
          stroke={p.hair}
          strokeWidth={1}
          strokeDasharray="2 6"
        />
      </svg>

      {/* meter + verdict + scrubber */}
      <div className="mt-2 px-1">
        {/* rules-cleared meter — cyan baseline (US) vs the EU climb */}
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${(isEU ? clamp01(rules / EU_RULES) : clamp01(US_RULES / EU_RULES)) * 100}%`,
              height: "100%",
              background: isEU ? counterColor : p.leverage,
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

        {/* scrubber + play — only meaningful on the EU side (the maze) */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the maze run" : "Play the founder running the European maze, cell by cell"}
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
            {playing ? "❙❙ pause" : "▶ run the maze"}
          </button>
          <input
            type="range"
            min={0}
            max={N}
            value={step}
            onChange={(e) => {
              setPlaying(false)
              setSide("eu")
              setStep(clamp(Number(e.target.value), 0, N))
            }}
            aria-label="Step the founder through the European maze, cell by cell"
            aria-valuetext={`Cell ${step} of ${N}: ${intFmt(rules)} rules cleared, ${regs} regulators${
              stalled ? ", run stalled" : ""
            }`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.squeeze, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {step}/{N} cells
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
