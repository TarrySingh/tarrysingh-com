"use client"

import { useState } from "react"

type LayerKey = "rationale" | "historical" | "behavioural" | "structural"
type ScaleKey = "hyperparameter" | "plasticity" | "neuronal" | "dendritic"

const LAYERS: ReadonlyArray<{ key: LayerKey; numeral: string; label: string; sub: string; color: string }> = [
  { key: "rationale", numeral: "I", label: "Rationale", sub: "design intent", color: "#f4c482" },
  { key: "historical", numeral: "II", label: "Historical", sub: "commits · provenance", color: "#e5a896" },
  { key: "behavioural", numeral: "III", label: "Behavioural", sub: "tests · contracts · flow", color: "#6cb4c2" },
  { key: "structural", numeral: "IV", label: "Structural", sub: "modules · functions", color: "#849cc8" },
]

const SCALES: ReadonlyArray<{ key: ScaleKey; label: string; sub: string }> = [
  { key: "hyperparameter", label: "Hyperparameter", sub: "global gain" },
  { key: "plasticity", label: "Plasticity", sub: "connectivity reshape" },
  { key: "neuronal", label: "Neuronal", sub: "per-node gating" },
  { key: "dendritic", label: "Dendritic", sub: "branch-local compute" },
]

// 4 × 4 cell descriptions — what the substrate exposes at each (layer × scale) intersection.
const CELLS: Record<LayerKey, Record<ScaleKey, string>> = {
  rationale: {
    hyperparameter:
      "Global stance: how strongly design-rationale evidence is admitted into the active subnetwork at all.",
    plasticity:
      "Re-weight which rationale fragments connect to which structural anchors — promote, demote, prune.",
    neuronal:
      "Gain individual rationale notes (an ADR, a commit message, a comment) up or down per task.",
    dendritic:
      "Within one rationale node, surface the branch matching the task context (e.g. perf vs. safety).",
  },
  historical: {
    hyperparameter:
      "Decide how heavily commit history weighs against current code in any task.",
    plasticity:
      "Re-link commits to functions and modules where the trace has gone stale; rewire after a rebase.",
    neuronal:
      "Boost the commits that touched the cells the task baton is pointed at.",
    dendritic:
      "Within a commit, surface the hunk relevant to the task — not the whole patch.",
  },
  behavioural: {
    hyperparameter:
      "Tune how much test and contract evidence the substrate trusts for the current task.",
    plasticity:
      "Add or remove behavioural edges as new tests land — without rebuilding the substrate.",
    neuronal:
      "Boost individual tests / contracts that exercise the path under inspection.",
    dendritic:
      "Within a test, surface the assertion stack that matches the suspected fault region.",
  },
  structural: {
    hyperparameter:
      "Set how aggressively the substrate prunes its visible module / function set for the task.",
    plasticity:
      "Re-link modules after refactoring; reweight inter-module dependencies under the task.",
    neuronal:
      "Boost the functions on the active task's salience path; quiet the rest.",
    dendritic:
      "Within a function, surface the basic blocks the task baton actually needs.",
  },
}

const VW = 600
const VH = 420
const PAD_TOP = 56
const PAD_BOTTOM = 60
const PAD_LEFT = 110
const PAD_RIGHT = 16
const GRID_W = VW - PAD_LEFT - PAD_RIGHT
const GRID_H = VH - PAD_TOP - PAD_BOTTOM
const CELL_W = GRID_W / SCALES.length
const CELL_H = GRID_H / LAYERS.length

export function SubstrateScales() {
  const [hover, setHover] = useState<{ layer: LayerKey; scale: ScaleKey } | null>(null)
  const active = hover ? CELLS[hover.layer][hover.scale] : null
  const activeLayer = hover ? LAYERS.find((l) => l.key === hover.layer) : null
  const activeScale = hover ? SCALES.find((s) => s.key === hover.scale) : null

  return (
    <figure className="syn-symphony">
      <div
        className="rounded-[var(--radius-tight)] border p-4"
        style={{
          borderColor: "rgba(200,180,255,0.18)",
          background:
            "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Substrate × scales — a four-layer code representation (rationale, historical, behavioural, structural) crossed with four neuromodulatory scales (hyperparameter, plasticity, neuronal, dendritic). Hover any cell to read what the substrate exposes at that intersection."
        >
          {/* column headers (scales) */}
          {SCALES.map((s, i) => {
            const x = PAD_LEFT + i * CELL_W + CELL_W / 2
            const isActive = hover?.scale === s.key
            return (
              <g key={`col-${s.key}`}>
                <text
                  x={x}
                  y={PAD_TOP - 24}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={10}
                  letterSpacing={1.5}
                  textRendering="optimizeLegibility"
                  fill={isActive ? "var(--ink)" : "rgba(220,200,160,0.78)"}
                >
                  {s.label.toUpperCase()}
                </text>
                <text
                  x={x}
                  y={PAD_TOP - 10}
                  textAnchor="middle"
                  fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                  fontStyle="italic"
                  fontSize={10}
                  fill="rgba(220,200,160,0.55)"
                >
                  {s.sub}
                </text>
              </g>
            )
          })}

          {/* row headers (layers) */}
          {LAYERS.map((l, j) => {
            const y = PAD_TOP + j * CELL_H + CELL_H / 2
            const isActive = hover?.layer === l.key
            return (
              <g key={`row-${l.key}`}>
                <text
                  x={PAD_LEFT - 12}
                  y={y - 4}
                  textAnchor="end"
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={18}
                  fill={l.color}
                >
                  {l.numeral}
                </text>
                <text
                  x={PAD_LEFT - 12}
                  y={y + 12}
                  textAnchor="end"
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={10}
                  letterSpacing={1.5}
                  fill={isActive ? "var(--ink)" : "rgba(220,200,160,0.78)"}
                >
                  {l.label.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* cells */}
          {LAYERS.map((l, j) =>
            SCALES.map((s, i) => {
              const x = PAD_LEFT + i * CELL_W
              const y = PAD_TOP + j * CELL_H
              const isHover = hover?.layer === l.key && hover.scale === s.key
              const isCross =
                !isHover && hover && (hover.layer === l.key || hover.scale === s.key)
              return (
                <g
                  key={`cell-${l.key}-${s.key}`}
                  onMouseEnter={() => setHover({ layer: l.key, scale: s.key })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={x + 2}
                    y={y + 2}
                    width={CELL_W - 4}
                    height={CELL_H - 4}
                    rx={4}
                    fill={l.color}
                    fillOpacity={isHover ? 0.45 : isCross ? 0.22 : 0.12}
                    stroke={l.color}
                    strokeOpacity={isHover ? 0.9 : isCross ? 0.5 : 0.28}
                    strokeWidth={isHover ? 1.4 : 1}
                  />
                  {isHover ? (
                    <circle
                      cx={x + CELL_W / 2}
                      cy={y + CELL_H / 2}
                      r={5}
                      fill="#ffe0a4"
                      className="syn-anim-sweep"
                    />
                  ) : (
                    <circle
                      cx={x + CELL_W / 2}
                      cy={y + CELL_H / 2}
                      r={3}
                      fill={l.color}
                      fillOpacity={0.65}
                    />
                  )}
                </g>
              )
            }),
          )}

          {/* footer rule */}
          <line
            x1={PAD_LEFT}
            x2={VW - PAD_RIGHT}
            y1={PAD_TOP + GRID_H + 6}
            y2={PAD_TOP + GRID_H + 6}
            stroke="rgba(220,200,160,0.18)"
            strokeWidth={0.6}
          />
          <text
            x={VW - PAD_RIGHT}
            y={PAD_TOP + GRID_H + 22}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={9}
            fill="rgba(220,200,160,0.55)"
            letterSpacing={1}
          >
            FIG. 1.2 · MEI · MULLER · RAMASWAMY 2022, ADAPTED
          </text>
        </svg>

        {/* hover detail */}
        <div
          className="mt-3 px-1"
          style={{
            minHeight: "3.6em",
            color: "var(--ink-cool)",
            fontSize: "0.86rem",
            lineHeight: 1.45,
          }}
        >
          {active && activeLayer && activeScale ? (
            <>
              <span
                className="syn-small-caps"
                style={{ color: activeLayer.color, marginRight: "0.6rem" }}
              >
                {activeLayer.label}
              </span>
              <span
                className="syn-small-caps"
                style={{ color: "var(--ink-dim)", marginRight: "0.75rem" }}
              >
                × {activeScale.label}
              </span>
              <span style={{ color: "var(--ink)" }}>{active}</span>
            </>
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>
              Hover any cell. Four code-system layers crossed with the four
              neuromodulatory scales adapted from Mei, Muller &amp; Ramaswamy
              (<em>Trends in Neurosciences</em>, 2022). The substrate is the
              cell of the matrix the engineer activates next, not the entire
              matrix re-read.
            </span>
          )}
        </div>
      </div>
    </figure>
  )
}
