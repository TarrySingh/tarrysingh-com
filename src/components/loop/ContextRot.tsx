"use client"

/**
 * V4 · CONTEXT ROT - the second calibration exemplar of THE ENGINE ROOM.
 *
 * Everything plotted here is a MEASURED value from the Source Ledger:
 *  - Lodha et al., arXiv 2606.10209, Table 2 (50-task Microsoft Dynamics 365
 *    hotel-expense benchmark, four GPT-5 context configurations):
 *      C1 no user model            8.0% complete itemisation
 *      C2 full conversation history 71.0% · 1,481.0K tokens · 14.56 h
 *      C3 last-5 tool pairs         79.0%
 *      C4 last-5 + summarisation    91.6% · 553.4K tokens · 5.79 h
 *    headline: +20.6 points over full history on 62.7% fewer tokens and
 *    60.2% less wall-clock.
 *  - NoLiMa (arXiv 2502.05167, ICML 2025): GPT-4o falls 99.3 -> 69.7 at 32K
 *    tokens; 11 of 13 models end below 50% of their short-length baseline.
 *  - Mechanism: Anthropic (2025), attention is n-squared in tokens; the
 *    model has a finite attention budget.
 *
 * The instrument argues: more context is not more capability. The curated,
 * summarised window beats the full transcript on completion, tokens and
 * wall-clock. Context is a budget.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useState } from "react"
import { InstrumentFrame, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Measured data (Source Ledger, Ch3 / V4). Do not edit without the ledger.
// ---------------------------------------------------------------------------

interface Config {
  key: string
  name: string
  sub: string
  completion: number
  tokensK: number | null
  hours: number | null
  verdict: string
}

const CONFIGS: Config[] = [
  {
    key: "C1",
    name: "NO CONTEXT",
    sub: "no user model",
    completion: 8.0,
    tokensK: null,
    hours: null,
    verdict: "8.0% · a loop that remembers nothing is blind",
  },
  {
    key: "C2",
    name: "FULL HISTORY",
    sub: "entire conversation",
    completion: 71.0,
    tokensK: 1481.0,
    hours: 14.56,
    verdict: "71.0% · the default: every token, every hour",
  },
  {
    key: "C3",
    name: "LAST 5",
    sub: "recent tool pairs",
    completion: 79.0,
    tokensK: null,
    hours: null,
    verdict: "79.0% · a recent window already beats the full transcript",
  },
  {
    key: "C4",
    name: "LAST 5 + SUMMARY",
    sub: "curated + summarised",
    completion: 91.6,
    tokensK: 553.4,
    hours: 5.79,
    verdict: "91.6% · +20.6 pts over full history on 62.7% fewer tokens",
  },
]

const BASELINE = 71.0 // C2, the default everyone ships
const NOLIMA = { base: 99.3, at32k: 69.7 } // GPT-4o, NoLiMa

// ---------------------------------------------------------------------------

function RotScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p } = ctx
  const [sel, setSel] = useState(1) // start on C2: the default people ship
  const c = CONFIGS[sel]

  const W = compact ? 460 : 980
  const H = compact ? 860 : 560

  // main panel (bars)
  const main = compact
    ? { x0: 66, x1: 430, yBottom: 470, yTop: 130 }
    : { x0: 70, x1: 600, yBottom: 462, yTop: 112 }
  // NoLiMa inset
  const inset = compact
    ? { x0: 90, x1: 420, yBottom: 800, yTop: 600 }
    : { x0: 680, x1: 930, yBottom: 462, yTop: 210 }

  const yFor = (v: number, panel: { yBottom: number; yTop: number }) =>
    panel.yBottom + ((panel.yTop - panel.yBottom) * v) / 100

  const nCols = CONFIGS.length
  const span = main.x1 - main.x0
  const colW = compact ? 64 : 92
  const gap = (span - nCols * colW) / (nCols + 1)

  // Compact renders ~460 viewBox units into a ~320px stage (scale ~0.7), so
  // raw sizes run larger there to keep every label >= ~9.5px on screen.
  const fs = compact ? 17 : 13.5
  const fmt = (n: number) => n.toLocaleString("en-GB")

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>Task completion under four context strategies</title>
        <desc>
          Four measured context configurations on the same benchmark: no context 8%, full history 71%, last five tool pairs 79%, last five
          plus summarisation 91.6%. A second panel shows retrieval accuracy
          falling from 99.3 to 69.7 at 32 thousand tokens.
        </desc>

        {/* ===== main panel ===== */}
        <text
          x={main.x0}
          y={main.yTop - 70}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          COMPLETE ITEMISATION % · SAME LOOP · SAME 50 TASKS · GPT-5
        </text>

        {/* hero readout, header lane of the panel */}
        <text
          x={main.x0}
          y={main.yTop - 8}
          fill={c.completion >= 90 ? p.signalHi : c.completion < 20 ? p.danger : p.ink}
          style={{ fontSize: compact ? 42 : 46, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
        >
          {c.completion.toFixed(1)}%
        </text>
        <text
          x={main.x0 + (compact ? 128 : 150)}
          y={main.yTop - 32}
          fill={p.muted}
          style={{ fontSize: fs - 1, fontFamily: "var(--font-mono), monospace" }}
        >
          {c.key} · {c.name}
        </text>
        <text
          x={main.x0 + (compact ? 128 : 150)}
          y={main.yTop - 8}
          fill={p.soft}
          style={{ fontSize: fs - 2, fontFamily: "var(--font-mono), monospace" }}
        >
          {c.tokensK !== null && c.hours !== null
            ? `${fmt(Math.round(c.tokensK))}K tokens · ${c.hours.toFixed(2).replace(/0$/, "")} h wall-clock`
            : "tokens · hours: not reported for this config"}
        </text>

        {/* gridlines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={main.x0}
              y1={yFor(v, main)}
              x2={main.x1}
              y2={yFor(v, main)}
              stroke={p.grid}
              strokeWidth={1}
            />
            <text
              x={main.x0 - 8}
              y={yFor(v, main) + 4}
              textAnchor="end"
              fill={p.soft}
              style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
            >
              {v}
            </text>
          </g>
        ))}

        {/* target zone >= 90 */}
        <rect
          x={main.x0}
          y={yFor(100, main)}
          width={span}
          height={yFor(90, main) - yFor(100, main)}
          fill={rgba(p.signalRGB, 0.06)}
        />
        <text
          x={main.x0 + (compact ? 150 : 240)}
          y={yFor(100, main) + 14}
          fill={p.signal}
          style={{ fontSize: fs - 2.5, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
        >
          TARGET ≥ 90
        </text>

        {/* the ghost reference: full-history baseline */}
        <line
          x1={main.x0}
          y1={yFor(BASELINE, main)}
          x2={main.x1}
          y2={yFor(BASELINE, main)}
          stroke={p.cool}
          strokeWidth={1.4}
          strokeDasharray="6 5"
        />
        <text
          x={main.x0 + 6}
          y={yFor(BASELINE, main) - 6}
          fill={p.cool}
          style={{ fontSize: fs - 2.5, fontFamily: "var(--font-mono), monospace" }}
        >
          {compact ? "baseline" : "C2 baseline · 71.0"}
        </text>

        {/* bars */}
        {CONFIGS.map((cfg, i) => {
          const x = main.x0 + gap + i * (colW + gap)
          const y = yFor(cfg.completion, main)
          const isSel = i === sel
          return (
            <g key={cfg.key} style={{ cursor: "pointer" }} onClick={() => setSel(i)}>
              <rect
                x={x}
                y={y}
                width={colW}
                height={main.yBottom - y}
                rx={4}
                fill={isSel ? rgba(p.signalRGB, 0.34) : rgba(p.inkRGB, 0.08)}
                stroke={isSel ? p.signal : p.hair}
                strokeWidth={isSel ? 1.8 : 1}
              />
              <text
                x={x + colW / 2}
                y={y - 8}
                textAnchor="middle"
                fill={isSel ? p.signalHi : p.muted}
                style={{ fontSize: fs + 1.5, fontWeight: 700, fontFamily: "var(--font-mono), monospace" }}
              >
                {cfg.completion.toFixed(1)}
              </text>
              <text
                x={x + colW / 2}
                y={main.yBottom + 18}
                textAnchor="middle"
                fill={isSel ? p.ink : p.muted}
                style={{ fontSize: fs - 2, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--font-mono), monospace" }}
              >
                {cfg.key}
              </text>
              {/* the sub line is wider than the compact column pitch; the
                  control pills below carry the full names there */}
              {!compact && (
                <text
                  x={x + colW / 2}
                  y={main.yBottom + 34}
                  textAnchor="middle"
                  fill={p.soft}
                  style={{ fontSize: fs - 3.5, fontFamily: "var(--font-mono), monospace" }}
                >
                  {cfg.sub}
                </text>
              )}
            </g>
          )
        })}

        {/* ===== NoLiMa inset ===== */}
        <text
          x={inset.x0}
          y={inset.yTop - 46}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          RETRIEVAL ROTS THE SAME WAY
        </text>
        <text
          x={inset.x0}
          y={inset.yTop - 28}
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
        >
          NoLiMa retrieval · GPT-4o · % accuracy
        </text>

        {/* frame */}
        <line x1={inset.x0} y1={inset.yBottom} x2={inset.x1} y2={inset.yBottom} stroke={p.hair} strokeWidth={1} />
        <line x1={inset.x0} y1={inset.yBottom} x2={inset.x0} y2={inset.yTop} stroke={p.hair} strokeWidth={1} />

        {/* below-half danger zone (50% of baseline = 49.65) */}
        {(() => {
          const yHalf = inset.yBottom + ((inset.yTop - inset.yBottom) * (NOLIMA.base / 2)) / 100
          return (
            <>
              <rect
                x={inset.x0}
                y={yHalf}
                width={inset.x1 - inset.x0}
                height={inset.yBottom - yHalf}
                fill={rgba(p.dangerRGB, 0.08)}
              />
              <text
                x={inset.x0 + 4}
                y={yHalf + 14}
                fill={p.danger}
                style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
              >
                below half · 11 of 13 models end here
              </text>
            </>
          )
        })()}

        {/* the measured endpoints, dashed interpolation */}
        {(() => {
          const yA = inset.yBottom + ((inset.yTop - inset.yBottom) * NOLIMA.base) / 100
          const yB = inset.yBottom + ((inset.yTop - inset.yBottom) * NOLIMA.at32k) / 100
          return (
            <g>
              <line x1={inset.x0 + 16} y1={yA} x2={inset.x1 - 16} y2={yB} stroke={p.verdict} strokeWidth={2} strokeDasharray="6 5" />
              <circle cx={inset.x0 + 16} cy={yA} r={4.5} fill={p.verdict} />
              <circle cx={inset.x1 - 16} cy={yB} r={4.5} fill={p.verdict} />
              <text x={inset.x0 + 24} y={yA + 20} fill={p.ink} style={{ fontSize: fs - 2, fontFamily: "var(--font-mono), monospace" }}>
                99.3 · short baseline
              </text>
              <text x={inset.x1 - 24} y={yB + 20} textAnchor="end" fill={p.ink} style={{ fontSize: fs - 2, fontFamily: "var(--font-mono), monospace" }}>
                69.7 · at 32K tokens
              </text>
            </g>
          )
        })()}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: c.completion >= 90 ? p.signal : c.completion < 20 ? p.danger : p.ink,
        }}
      >
        {"VERDICT · "}
        {c.verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {CONFIGS.map((cfg, i) => (
          <button
            key={cfg.key}
            type="button"
            aria-pressed={i === sel}
            onClick={() => setSel(i)}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: i === sel ? p.signalHi : p.muted,
              border: `1px solid ${i === sel ? p.signal : p.hair}`,
              background: i === sel ? rgba(p.signalRGB, 0.1) : "transparent",
            }}
          >
            {cfg.key} · {cfg.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function ContextRot() {
  return (
    <InstrumentFrame
      kicker="V4 · CONTEXT ROT"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          Four ways to feed the same loop the same fifty tasks. The full transcript is
          the anchor, and a curated window with summarisation beats it by 20.6 points
          while spending 62.7% fewer tokens and 60.2% less wall-clock. Context is a
          budget, and the default spends it worst.
        </>
      }
      method={
        <>
          MEASURED · bars: Lodha et al., arXiv 2606.10209, Table 2 (2026), 50-task
          Dynamics 365 benchmark, GPT-5 configs; tokens and hours as reported for C2
          and C4. Inset endpoints: NoLiMa, arXiv 2502.05167, ICML 2025 (GPT-4o 99.3 to
          69.7 at 32K; 11 of 13 models below half of baseline). Mechanism: Anthropic,
          Effective context engineering (2025): attention is n-squared in tokens.
        </>
      }
    >
      {(ctx) => <RotScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
