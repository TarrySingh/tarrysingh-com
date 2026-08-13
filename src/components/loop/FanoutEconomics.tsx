"use client"

/**
 * V6 · FAN-OUT ECONOMICS - an instrument of THE ENGINE ROOM (Plate V).
 *
 * An orchestrator-worker tree (a lead node fanning to N workers, N set by
 * the reader) beside a two-panel cost-quality readout. Measured anchors,
 * all from the Source Ledger (Ch2, Anthropic, How we built our multi-agent
 * research system, 2025):
 *  - lead Opus 4 + Sonnet 4 subagents outperformed single-agent Opus 4 by
 *    90.2% on Anthropic's OWN INTERNAL eval (not an external benchmark)
 *  - agents use about 4x more tokens than chat; multi-agent systems about
 *    15x more
 *  - the lead agent spins up 3-5 subagents in parallel; simple fact-finding
 *    needs just 1 agent (3-10 tool calls); direct comparisons 2-4 subagents
 *    at 10-15 calls each
 *  - on BrowseComp, token usage by itself explains 80% of the variance
 *  - sub-agents return condensed 1,000-2,000-token summaries (Anthropic,
 *    Effective context engineering for AI agents, 2025)
 *
 * Everything between and beyond those anchors is SCHEMATIC interpolation
 * and the method lane says so: the plateau shape of the quality curve and
 * its decline past N=5 stand for coordination overhead, not a measurement.
 *
 * The instrument argues: fan-out buys quality with tokens, and the trade
 * pays exactly when the task splits into independent sub-jobs.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Curves (module scope: SSR === CSR). Anchors are ledger figures; the points
// between and beyond them are schematic interpolation. Do not label
// non-anchor values in the scene.
// ---------------------------------------------------------------------------

const NMAX = 8

// Chat-token multiple by N. Anchors: 4x at N=1 (agents vs chat interactions)
// and 15x in the documented 3-5 zone (multi-agent systems vs chat).
const TOK = [4, 7.7, 11.3, 15, 18.7, 22.3, 26, 29.7]

// % uplift over the single agent. Anchors: 0 at N=1 (baseline) and +90.2 in
// the documented zone (Anthropic internal eval). Plateau and decline past
// N=5 are schematic coordination overhead.
const QUAL = [0, 52, 86, 90.2, 89, 82, 73, 64]

// Per-worker pulse phase offsets, fixed seed, computed once.
const OFFS: number[] = (() => {
  const rnd = mulberry32(0xfa90e015)
  return Array.from({ length: NMAX }, () => rnd())
})()

type Tone = "base" | "zone" | "tax"

const VERDICTS: { tone: Tone; text: string }[] = [
  { tone: "base", text: "N=1 · one context · about 4x chat tokens · simple fact-finding needs just 1 agent" },
  { tone: "base", text: "N=2 · direct comparisons run 2-4 subagents at 10-15 tool calls each · cost is schematic here" },
  { tone: "zone", text: "N=3 · inside the documented zone · the lead spins up 3-5 subagents in parallel" },
  { tone: "zone", text: "N=4 · the documented sweet zone · +90.2% over single-agent Opus 4 on the internal eval" },
  { tone: "zone", text: "N=5 · top of the documented zone · about 15x chat tokens buys the quality" },
  { tone: "tax", text: "N=6 · beyond the documented zone · schematic: cost keeps climbing, no measured gain" },
  { tone: "tax", text: "N=7 · schematic extrapolation · the lead now coordinates more than it researches" },
  { tone: "tax", text: "N=8 · schematic: coordination tax · fan out only where sub-jobs are independent" },
]

function heroFor(n: number, compact: boolean) {
  if (n === 1)
    return {
      big: "≈4x",
      sub1: compact ? "chat tokens · measured" : "chat-token multiple · measured",
      sub2: compact ? "baseline quality" : "quality: single-agent baseline",
    }
  if (n === 2)
    return {
      big: "4-15x",
      sub1: compact ? "between anchors · schematic" : "between measured anchors · schematic",
      sub2: compact ? "quality unmeasured" : "quality unmeasured between anchors",
    }
  if (n <= 5)
    return {
      big: "≈15x",
      sub1: compact ? "chat tokens · measured" : "chat-token multiple · measured · multi-agent",
      sub2: compact ? "+90.2% vs single agent" : "+90.2% vs single agent · internal eval",
    }
  return {
    big: ">15x",
    sub1: compact ? "past anchor · schematic" : "beyond the measured anchor · schematic",
    sub2: compact ? "no measured gain" : "no measured gain past the documented zone",
  }
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function FanoutScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx
  const [n, setN] = useState(4) // start in the documented sweet zone
  const sel = n - 1
  const tone: Tone = VERDICTS[sel].tone
  const hero = heroFor(n, compact)
  const heroColor = tone === "zone" ? p.signalHi : tone === "tax" ? p.danger : n === 2 ? p.cool : p.ink
  const verdictColor = tone === "zone" ? p.signal : tone === "tax" ? p.danger : p.ink

  // Return-summary pulses, rAF after mount; reduced motion = static scene.
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (reduced) return
    let raf = 0
    let last: number | null = null
    const step = (t: number) => {
      if (last !== null) {
        const dt = Math.min(64, t - last)
        setPhase((v) => (v + dt * 0.00022) % 1)
      }
      last = t
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const W = compact ? 460 : 980
  const H = compact ? 828 : 505
  const fs = compact ? 17 : 13.5
  const mono = "var(--font-mono), monospace"

  // ---- tree geometry ----
  const lead = compact ? { x: 230, y: 188, r: 23 } : { x: 250, y: 196, r: 25 }
  const workerY = compact ? 352 : 392
  const workerR = compact ? 14 : 15
  const pitch = compact ? 46 : 52
  const wx = (i: number) => lead.x - ((n - 1) / 2) * pitch + i * pitch
  const chip = compact
    ? { top: 296, h: 20, w: 38, text: fs - 5 }
    : { top: 338, h: 20, w: 36, text: fs - 3.5 }

  // ---- chart geometry ----
  const cx0 = compact ? 70 : 560
  const cx1 = compact ? 440 : 930
  const cPitch = (cx1 - cx0) / NMAX
  const cN = (k: number) => cx0 + cPitch * (k - 0.5)
  const q = compact
    ? { yTop: 486, yBottom: 622 }
    : { yTop: 142, yBottom: 296 }
  const c = compact
    ? { yTop: 684, yBottom: 788 }
    : { yTop: 356, yBottom: 468 }
  const yQ = (v: number) => q.yBottom - ((q.yBottom - q.yTop) * v) / 100
  const yC = (v: number) => c.yBottom - ((c.yBottom - c.yTop) * v) / 32
  const nLabelY = compact ? 812 : 490
  const barW = compact ? 24 : 26

  const zoneX0 = cN(3) - barW / 2 - 8
  const zoneX1 = cN(5) + barW / 2 + 8

  const qualPath = QUAL.map(
    (v, i) => `${i === 0 ? "M" : "L"} ${cN(i + 1).toFixed(1)} ${yQ(v).toFixed(1)}`,
  ).join(" ")

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>Fan-out economics: a lead agent, N workers, cost and quality by N</title>
        <desc>
          An orchestrator tree with a lead agent fanning out to between one and eight
          workers, each returning a condensed one to two thousand token summary. Two
          charts show the chat-token cost rising with worker count, anchored at four
          times for a single agent and fifteen times for a multi-agent system, while
          quality rises to plus 90.2% in the documented three to five subagent
          zone and is schematic beyond it.
        </desc>

        {/* ===== left: the orchestrator tree ===== */}
        <text
          x={compact ? 24 : 40}
          y={compact ? 34 : 40}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: mono }}
        >
          ORCHESTRATOR FAN-OUT · LEAD + N WORKERS
        </text>

        {/* hero readout */}
        <text
          x={compact ? 24 : 40}
          y={compact ? 88 : 96}
          fill={heroColor}
          style={{ fontSize: compact ? 38 : 46, fontWeight: 800, fontFamily: mono }}
        >
          {hero.big}
        </text>
        <text
          x={compact ? 158 : 205}
          y={compact ? 64 : 70}
          fill={p.muted}
          style={{ fontSize: compact ? fs - 3 : fs - 1, fontFamily: mono }}
        >
          {hero.sub1}
        </text>
        <text
          x={compact ? 158 : 205}
          y={compact ? 86 : 94}
          fill={tone === "zone" ? p.signal : p.soft}
          style={{ fontSize: compact ? fs - 3 : fs - 1, fontFamily: mono }}
        >
          {hero.sub2}
        </text>

        {/* lead node */}
        <text
          x={lead.x}
          y={compact ? 142 : 150}
          textAnchor="middle"
          fill={p.ink}
          style={{ fontSize: fs - 1, fontWeight: 700, letterSpacing: "0.1em", fontFamily: mono }}
        >
          LEAD · OPUS 4
        </text>
        <circle
          cx={lead.x}
          cy={lead.y}
          r={lead.r}
          fill={rgba(p.signalRGB, 0.1)}
          stroke={p.signal}
          strokeWidth={2}
        />
        <text
          x={lead.x}
          y={lead.y + 6}
          textAnchor="middle"
          fill={p.ink}
          style={{ fontSize: fs + 1, fontWeight: 800, fontFamily: mono }}
        >
          N={n}
        </text>

        {/* edges, chips, workers, return pulses */}
        {Array.from({ length: n }, (_, i) => {
          const x = wx(i)
          const edgeTop = { x: lead.x, y: lead.y + lead.r }
          const edgeBot = { x, y: workerY - workerR }
          const tt = (phase + OFFS[i]) % 1
          const px = edgeBot.x + (edgeTop.x - edgeBot.x) * tt
          const py = edgeBot.y + (edgeTop.y - edgeBot.y) * tt
          return (
            <g key={i}>
              <line
                x1={edgeTop.x}
                y1={edgeTop.y}
                x2={edgeBot.x}
                y2={edgeBot.y}
                stroke={rgba(p.inkRGB, 0.28)}
                strokeWidth={1.2}
              />
              {/* summary chip riding the return path */}
              <rect
                x={x - chip.w / 2}
                y={chip.top}
                width={chip.w}
                height={chip.h}
                rx={4}
                fill={p.bg}
                stroke={p.hair}
                strokeWidth={1}
              />
              <text
                x={x}
                y={chip.top + chip.h / 2 + chip.text * 0.36}
                textAnchor="middle"
                fill={p.muted}
                style={{ fontSize: chip.text, fontFamily: mono }}
              >
                1-2K
              </text>
              <circle
                cx={x}
                cy={workerY}
                r={workerR}
                fill={rgba(p.signalRGB, 0.16)}
                stroke={p.signal}
                strokeWidth={1.6}
              />
              {!reduced && (
                <>
                  <circle cx={px} cy={py} r={6.5} fill={rgba(p.signalRGB, 0.22)} />
                  <circle cx={px} cy={py} r={3} fill={p.signalHi} />
                </>
              )}
            </g>
          )
        })}
        <text
          x={lead.x}
          y={compact ? 396 : 428}
          textAnchor="middle"
          fill={p.muted}
          style={{ fontSize: fs - 2, letterSpacing: "0.14em", fontFamily: mono }}
        >
          SONNET 4 WORKERS · PARALLEL
        </text>
        <text
          x={lead.x}
          y={compact ? 420 : 448}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: mono }}
        >
          each returns a condensed 1-2K token summary
        </text>

        {/* ===== right: quality panel ===== */}
        <text
          x={cx0}
          y={compact ? 470 : 126}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: mono }}
        >
          {compact ? "QUALITY · % UPLIFT" : "QUALITY · % UPLIFT vs SINGLE AGENT"}
        </text>

        {/* documented 3-5 zone */}
        <rect
          x={zoneX0}
          y={q.yTop}
          width={zoneX1 - zoneX0}
          height={q.yBottom - q.yTop}
          fill={rgba(p.signalRGB, 0.07)}
        />
        <text
          x={cN(4)}
          y={q.yBottom - 10}
          textAnchor="middle"
          fill={p.signal}
          style={{ fontSize: fs - 2.5, letterSpacing: "0.12em", fontFamily: mono }}
        >
          {compact ? "ZONE · 3-5" : "DOCUMENTED ZONE · 3-5"}
        </text>

        {/* schematic region past the zone */}
        <rect
          x={zoneX1}
          y={q.yTop}
          width={cx1 - zoneX1}
          height={q.yBottom - q.yTop}
          fill={rgba(p.dangerRGB, 0.05)}
        />
        <text
          x={cx1 - 4}
          y={q.yBottom - 26}
          textAnchor="end"
          fill={p.danger}
          style={{ fontSize: fs - 2.5, letterSpacing: "0.1em", fontFamily: mono }}
        >
          SCHEMATIC
        </text>
        <text
          x={cx1 - 4}
          y={q.yBottom - 8}
          textAnchor="end"
          fill={p.danger}
          style={{ fontSize: fs - 2.5, letterSpacing: "0.1em", fontFamily: mono }}
        >
          {compact ? "OVERHEAD" : "COORDINATION TAX"}
        </text>

        {/* baseline + measured uplift reference */}
        <line x1={cx0} y1={q.yBottom} x2={cx1} y2={q.yBottom} stroke={p.hair} strokeWidth={1} />
        <text
          x={cx0 - 8}
          y={q.yBottom + 4}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: fs - 2.5, fontFamily: mono }}
        >
          0
        </text>
        <line
          x1={cx0}
          y1={yQ(90.2)}
          x2={cx1}
          y2={yQ(90.2)}
          stroke={p.verdict}
          strokeWidth={1.4}
          strokeDasharray="6 5"
        />
        <text
          x={cx0 - 8}
          y={yQ(90.2) + 4}
          textAnchor="end"
          fill={p.verdict}
          style={{ fontSize: fs - 2.5, fontFamily: mono }}
        >
          +90.2
        </text>

        {/* the quality curve: schematic interpolation between measured anchors */}
        <path d={qualPath} fill="none" stroke={p.signal} strokeWidth={2.4} strokeDasharray="6 5" />
        <circle cx={cN(1)} cy={yQ(0)} r={4.5} fill={p.verdict} />
        <circle cx={cN(4)} cy={yQ(90.2)} r={4.5} fill={p.verdict} />
        {/* selected point */}
        <circle cx={cN(n)} cy={yQ(QUAL[sel])} r={8} fill={rgba(p.signalRGB, 0.22)} />
        <circle cx={cN(n)} cy={yQ(QUAL[sel])} r={4.5} fill={p.signalHi} />

        {/* ===== right: cost panel ===== */}
        <text
          x={cx0}
          y={compact ? 668 : 342}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: mono }}
        >
          {compact ? "TOKEN COST · x CHAT" : "TOKEN COST · MULTIPLE OF CHAT"}
        </text>
        <line x1={cx0} y1={c.yBottom} x2={cx1} y2={c.yBottom} stroke={p.hair} strokeWidth={1} />
        {TOK.map((v, i) => {
          const isSel = i === sel
          return (
            <rect
              key={i}
              x={cN(i + 1) - barW / 2}
              y={yC(v)}
              width={barW}
              height={c.yBottom - yC(v)}
              rx={3}
              fill={isSel ? rgba(p.signalRGB, 0.3) : rgba(p.inkRGB, 0.08)}
              stroke={isSel ? p.signal : p.hair}
              strokeWidth={isSel ? 1.8 : 1}
            />
          )
        })}
        {/* measured anchors: 4x single agent, 15x multi-agent */}
        {[4, 15].map((v) => (
          <g key={v}>
            <line
              x1={cx0}
              y1={yC(v)}
              x2={cx1}
              y2={yC(v)}
              stroke={p.verdict}
              strokeWidth={1.4}
              strokeDasharray="6 5"
            />
            <text
              x={cx0 - 8}
              y={yC(v) + 4}
              textAnchor="end"
              fill={p.verdict}
              style={{ fontSize: fs - 2.5, fontFamily: mono }}
            >
              {v}x
            </text>
          </g>
        ))}
        <circle cx={cN(1)} cy={yC(4)} r={4.5} fill={p.verdict} />
        <circle cx={cN(4)} cy={yC(15)} r={4.5} fill={p.verdict} />

        {/* selected-N line through both panels */}
        <line
          x1={cN(n)}
          y1={q.yTop}
          x2={cN(n)}
          y2={c.yBottom}
          stroke={rgba(p.signalRGB, 0.35)}
          strokeWidth={1}
        />

        {/* N axis + click targets */}
        {Array.from({ length: NMAX }, (_, i) => (
          <g key={i}>
            <text
              x={cN(i + 1)}
              y={nLabelY}
              textAnchor="middle"
              fill={i === sel ? p.signalHi : p.soft}
              style={{ fontSize: fs - 2, fontWeight: i === sel ? 700 : 400, fontFamily: mono }}
            >
              {i + 1}
            </text>
            <rect
              x={cN(i + 1) - cPitch / 2}
              y={q.yTop}
              width={cPitch}
              height={nLabelY - q.yTop + 6}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onClick={() => setN(i + 1)}
            />
          </g>
        ))}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: mono, color: verdictColor }}
      >
        {"VERDICT · "}
        {VERDICTS[sel].text}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {Array.from({ length: NMAX }, (_, i) => {
          const isSel = i === sel
          return (
            <button
              key={i}
              type="button"
              aria-pressed={isSel}
              onClick={() => setN(i + 1)}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
              style={{
                fontFamily: mono,
                color: isSel ? p.signalHi : p.muted,
                border: `1px solid ${isSel ? p.signal : p.hair}`,
                background: isSel ? rgba(p.signalRGB, 0.1) : "transparent",
              }}
            >
              N={i + 1}
            </button>
          )
        })}
        <span className="text-[11px]" style={{ fontFamily: mono, color: p.soft }}>
          set the fan-out · watch cost and quality
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function FanoutEconomics() {
  return (
    <InstrumentFrame
      kicker="V6 · FAN-OUT ECONOMICS"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          Fan-out buys quality with tokens: a lead agent running three to five parallel
          workers beat a single agent by 90.2% on Anthropic&rsquo;s internal eval, at
          roughly 15x the tokens of a chat session. The trade pays exactly when the task
          splits into independent sub-jobs; when it does not, the lead pays the token
          bill and collects nothing.
        </>
      }
      method={
        <>
          SCHEMATIC · both curves interpolate between measured anchors; only the anchors
          are measurements, and everything past N=5 is extrapolation standing for
          coordination overhead. Anchors: Anthropic, How we built our multi-agent
          research system (2025): an Opus 4 lead with Sonnet 4 subagents outperformed
          single-agent Opus 4 by 90.2% on Anthropic&rsquo;s own internal eval (not an
          external benchmark); agents use about 4x more tokens than chat and multi-agent
          systems about 15x; the lead spins up 3-5 subagents in parallel; simple
          fact-finding needs just 1 agent; on BrowseComp token usage by itself explains
          80% of the variance. Summary chips: Anthropic, Effective context engineering
          for AI agents (2025): sub-agents return condensed 1,000-2,000-token summaries.
        </>
      }
    >
      {(ctx) => <FanoutScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
