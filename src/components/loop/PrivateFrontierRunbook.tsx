"use client"

/**
 * V11 · THE PRIVATE FRONTIER RUN-BOOK - THE ENGINE ROOM (Plate V).
 *
 * A company CAN own its end-to-end stack, but most should NOT pretrain from
 * scratch. The build-vs-buy decision is an engineering decision with
 * thresholds. This instrument lays out the run-book as a LINEAR left-to-right
 * build path (distinct from V7's closed circuit) with a DECISION FORK near
 * the front:
 *
 *   CURATE -> [ FORK: CONTINUED-PRETRAIN / LoRA / RAG ] -> SFT ON PROCESS
 *   DATA -> PREFERENCE (RLAIF w/ constitution) -> PRIVATE EVALS -> DEPLOY ->
 *   DRIFT LOOP
 *
 * Interaction: an archetype selector (MID-CAP SaaS / BANK / MANUFACTURER)
 * and the fork path (PRETRAIN / LoRA / RAG). Archetype + path light the
 * recommended lane and update a cost / compute / team readout.
 *
 * NUMBERS DISCIPLINE (strictest instrument). Every quantified band is a
 * Source Ledger figure (Ch8 / Ch6). Team-size bands and per-archetype
 * recommendations are ENGINEERING ESTIMATES, tagged EST with the assumption
 * shown. The method lane declares which cells are measured vs estimated.
 *
 * MEASURED anchors used:
 *  - DAPT compute (ChipNeMo, arXiv:2311.00176, Table 1): 7B=2,620 /
 *    13B=4,940 / 70B=20,500 GPU-hrs; less than ~1.5% of from-scratch pretrain.
 *  - Break-even economics (Pan et al., arXiv:2509.18101): 24-32B models break
 *    even 0.3-3 months vs Claude-4 Opus $15/$75 per M input/output tokens;
 *    70-120B in 3.8-34 months; on-premise viable above ~50M tokens/month or
 *    under strict data-residency mandates.
 *  - Full frontier tier reference: Meta 16,384 H100 GPUs, 54-day 405B
 *    pre-training snapshot ('Llama 3 Herd', arXiv:2407.21783); DeepSeek-V3
 *    2.788M GPU-hrs / $5.576M official-run-only ('DeepSeek-V3 Technical
 *    Report', 2024).
 *  - LoRA (Hu et al., arXiv:2106.09685): 10,000x fewer trainable params, 3x
 *    less GPU memory vs full fine-tune of GPT-3 175B.
 *  - SFT stage counts (InstructGPT, Ouyang et al., NeurIPS 2022): ~13k SFT
 *    prompts, ~33k RM prompts, ~31k PPO prompts.
 *  - Constitution: 16 principles (Bai et al., arXiv:2212.08073).
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useState } from "react"
import { InstrumentFrame, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// The linear stage path. Each stage carries a short measured or estimated
// figure line; the fork stage is rendered specially.
// ---------------------------------------------------------------------------

type PathKey = "pretrain" | "lora" | "rag"
type ArchKey = "midcap" | "bank" | "mfg"

interface Stage {
  key: string
  label: string
  sub: string
}

const STAGES: Stage[] = [
  { key: "curate", label: "CURATE", sub: "process corpus" },
  { key: "fork", label: "ADAPT", sub: "the fork" },
  { key: "sft", label: "SFT", sub: "process data" },
  { key: "pref", label: "PREFERENCE", sub: "RLAIF · constitution" },
  { key: "evals", label: "PRIVATE EVALS", sub: "your rubric" },
  { key: "deploy", label: "DEPLOY", sub: "on-prem or VPC" },
  { key: "drift", label: "DRIFT LOOP", sub: "re-eval · re-tune" },
]

// The three fork lanes. Compute / cost lines are MEASURED ledger anchors.
interface ForkLane {
  key: PathKey
  label: string
  short: string
  // measured figure line (ledger)
  measure: string
  // one-line what-it-is
  gist: string
}

const FORK: ForkLane[] = [
  {
    key: "pretrain",
    label: "CONTINUED-PRETRAIN",
    short: "CPT",
    measure: "DAPT 2,620 / 4,940 / 20,500 GPU-hr · 7B / 13B / 70B",
    gist: "domain-adapt the base on your corpus",
  },
  {
    key: "lora",
    label: "LoRA / PEFT",
    short: "LoRA",
    measure: "10,000x fewer trainable params · 3x less GPU memory",
    gist: "freeze the base · train a small adapter",
  },
  {
    key: "rag",
    label: "RAG",
    short: "RAG",
    measure: "no training compute · index + retrieve at query time",
    gist: "keep the base · retrieve your documents",
  },
]

// Per-archetype: the recommended path + a threshold-framed advice line, plus
// the team-size estimate (tagged EST) with its assumption.
interface Arch {
  key: ArchKey
  label: string
  short: string
  reco: PathKey
  // advice framed as a threshold, not a claim
  advice: string
  // ESTIMATE: team band + explicit assumption
  teamEst: string
  teamAssume: string
  // verdict tail per path
  verdictTail: Record<PathKey, string>
}

const ARCH: Arch[] = [
  {
    key: "midcap",
    label: "MID-CAP SaaS",
    short: "MID-CAP",
    reco: "rag",
    advice: "RAG-first · revisit LoRA past ~50M tok/mo",
    teamEst: "2 to 4 engineers",
    teamAssume: "assumes an existing app + one ML-literate hire",
    verdictTail: {
      rag: "live in weeks · lowest cost · revisit at ~50M tok/mo",
      lora: "days of tuning · adapter you own · past the RAG ceiling",
      pretrain: "over-built for this tier · burns the frontier budget",
    },
  },
  {
    key: "bank",
    label: "BANK",
    short: "BANK",
    reco: "lora",
    advice: "LoRA + private evals · weights stay in your VPC",
    teamEst: "4 to 8 engineers",
    teamAssume: "assumes an existing MLOps team + data-residency mandate",
    verdictTail: {
      lora: "secrecy by construction · adapter never leaves the VPC",
      rag: "fast · but the index is the exposure surface",
      pretrain: "justified only above ~50M tok/mo or a hard residency rule",
    },
  },
  {
    key: "mfg",
    label: "MANUFACTURER",
    short: "MFG",
    reco: "pretrain",
    advice: "CPT on the process corpus · jargon the base never saw",
    teamEst: "6 to 12 engineers",
    teamAssume: "assumes a labelled process corpus + GPU access",
    verdictTail: {
      pretrain: "domain-adapt for under ~1.5% of from-scratch compute",
      lora: "cheaper start · may miss deep process vocabulary",
      rag: "good for manuals · weaker on tacit process knowledge",
    },
  },
]

// The frontier-tier ceiling: what you are NOT doing (the reference the fork
// sits under). Both are MEASURED ledger anchors.
const FRONTIER = {
  meta: "16,384 H100 · 54-day 405B run",
  deepseek: "2.788M GPU-hr · $5.576M official run",
}

// ---------------------------------------------------------------------------

function RunbookScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p } = ctx
  const [arch, setArch] = useState<ArchKey>("midcap")
  const [path, setPath] = useState<PathKey>("rag")

  const a = ARCH.find((x) => x.key === arch) as Arch
  const lane = FORK.find((x) => x.key === path) as ForkLane
  const isReco = a.reco === path

  const W = compact ? 460 : 980
  // Compact runs the spine top-to-bottom (7 nodes at pitch 108 from y0=96, so the
  // last node ends near 790); H must leave the readout panel (panelY = H - 210)
  // below that, hence 1020 rather than 900.
  const H = compact ? 1020 : 556

  const fs = compact ? 17 : 13.5
  const mono = "var(--font-mono), monospace"

  // ---- geometry ----------------------------------------------------------
  // Desktop: a horizontal spine of node boxes left -> right, with the fork
  // (second node) exploding into three stacked lanes above/below the spine.
  // Compact: the spine runs top -> down (still a linear path, not a loop),
  // fork lanes stacked to the right of the fork node.

  // Node box sizes
  const nbW = compact ? 200 : 118
  const nbH = compact ? 46 : 54

  // Precompute node positions
  const nodePos: Record<string, { x: number; y: number }> = {}
  if (!compact) {
    const spineY = 300
    const x0 = 26
    const pitch = (W - x0 * 2 - nbW) / (STAGES.length - 1)
    STAGES.forEach((s, i) => {
      nodePos[s.key] = { x: x0 + i * pitch, y: spineY }
    })
  } else {
    const spineX = 30
    const y0 = 96
    const pitch = 108
    STAGES.forEach((s, i) => {
      nodePos[s.key] = { x: spineX, y: y0 + i * pitch }
    })
  }

  // fork lane geometry (three parallel lanes off the ADAPT node)
  const fork = nodePos["fork"]
  const laneBoxW = compact ? 214 : 172
  const laneBoxH = compact ? 30 : 34
  const laneGap = compact ? 4 : 8

  // Desktop: lanes stack ABOVE the spine, feeding the fork node.
  // Compact: lanes stack to the RIGHT of the fork node.
  const lanePos = FORK.map((_, i) => {
    if (!compact) {
      const laneY = 300 - 96 - i * (laneBoxH + laneGap)
      return { x: fork.x + nbW / 2 - laneBoxW / 2, y: laneY }
    }
    const laneX = fork.x + nbW + 8
    const laneY = fork.y + (i - 1) * (laneBoxH + laneGap) + nbH / 2 - laneBoxH / 2
    return { x: laneX, y: laneY }
  })

  // ---- helpers -----------------------------------------------------------
  const nodeFill = (active: boolean) =>
    active ? rgba(p.signalRGB, 0.14) : rgba(p.inkRGB, 0.05)
  const nodeStroke = (active: boolean) => (active ? p.signal : p.hair)

  // stage-specific figure line under the box (desktop only, staggered)
  const stageFigure = (key: string): { text: string; measured: boolean } | null => {
    switch (key) {
      case "sft":
        return { text: "~13k SFT · ~33k RM · ~31k PPO prompts", measured: true }
      case "pref":
        return { text: "16-principle constitution · AI feedback", measured: true }
      case "evals":
        return { text: "your rubric · not a public leaderboard", measured: false }
      case "deploy":
        return { text: "break-even > ~50M tok/mo vs API", measured: true }
      case "drift":
        return { text: "re-eval on schedule · re-tune on drift", measured: false }
      case "curate":
        return { text: "the corpus is the moat", measured: false }
      default:
        return null
    }
  }

  const verdict = `${a.short} · ${lane.short} · ${a.verdictTail[path]}`

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>The private-frontier run-book: a linear build path with a decision fork</title>
        <desc>
          A left-to-right build pipeline: curate a corpus, then a three-way fork between
          continued pre-training, LoRA adapters, and retrieval, then supervised
          fine-tuning, preference tuning, private evaluations, deploy, and a drift loop.
          Selecting a company archetype and a fork path lights the recommended lane and
          shows its measured compute and break-even figures.
        </desc>

        {/* ===== frontier-tier ceiling: the thing you are NOT doing ===== */}
        <text
          x={compact ? 30 : 26}
          y={compact ? 26 : 40}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.16em", fontFamily: mono }}
        >
          FULL FRONTIER TIER · WHAT YOU ARE NOT DOING
        </text>
        <text
          x={compact ? 30 : 26}
          y={compact ? 46 : 60}
          fill={p.muted}
          style={{ fontSize: fs - 2.5, fontFamily: mono }}
        >
          {compact ? FRONTIER.meta : `${FRONTIER.meta} · ${FRONTIER.deepseek}`}
        </text>
        {compact && (
          <text x={30} y={64} fill={p.muted} style={{ fontSize: fs - 2.5, fontFamily: mono }}>
            {FRONTIER.deepseek}
          </text>
        )}
        {/* ghost ceiling rule */}
        <line
          x1={compact ? 24 : 26}
          y1={compact ? 74 : 74}
          x2={compact ? W - 24 : W - 26}
          y2={compact ? 74 : 74}
          stroke={p.cool}
          strokeWidth={1}
          strokeDasharray="6 5"
        />

        {/* ===== the linear spine connectors ===== */}
        {STAGES.slice(0, -1).map((s, i) => {
          const from = nodePos[s.key]
          const to = nodePos[STAGES[i + 1].key]
          if (!compact) {
            const y = from.y + nbH / 2
            return (
              <g key={`c${s.key}`}>
                <line
                  x1={from.x + nbW}
                  y1={y}
                  x2={to.x}
                  y2={y}
                  stroke={p.hair}
                  strokeWidth={1.4}
                />
                {/* arrow */}
                <path
                  d={`M ${to.x - 6} ${y - 4} L ${to.x} ${y} L ${to.x - 6} ${y + 4}`}
                  fill="none"
                  stroke={p.soft}
                  strokeWidth={1.4}
                />
              </g>
            )
          }
          const x = from.x + nbW / 2
          return (
            <g key={`c${s.key}`}>
              <line
                x1={x}
                y1={from.y + nbH}
                x2={x}
                y2={to.y}
                stroke={p.hair}
                strokeWidth={1.4}
              />
              <path
                d={`M ${x - 4} ${to.y - 6} L ${x} ${to.y} L ${x + 4} ${to.y - 6}`}
                fill="none"
                stroke={p.soft}
                strokeWidth={1.4}
              />
            </g>
          )
        })}

        {/* ===== fork lanes: connectors from ADAPT node into each lane ===== */}
        {FORK.map((f, i) => {
          const lp = lanePos[i]
          const active = f.key === path
          if (!compact) {
            const fx = fork.x + nbW / 2
            const lx = lp.x + laneBoxW / 2
            const ly = lp.y + laneBoxH
            return (
              <line
                key={`fc${f.key}`}
                x1={fx}
                y1={fork.y}
                x2={lx}
                y2={ly}
                stroke={active ? p.signal : p.hair}
                strokeWidth={active ? 1.8 : 1}
                strokeDasharray={active ? undefined : "3 4"}
              />
            )
          }
          const fx = fork.x + nbW
          const fy = fork.y + nbH / 2
          const lx = lp.x
          const ly = lp.y + laneBoxH / 2
          return (
            <line
              key={`fc${f.key}`}
              x1={fx}
              y1={fy}
              x2={lx}
              y2={ly}
              stroke={active ? p.signal : p.hair}
              strokeWidth={active ? 1.8 : 1}
              strokeDasharray={active ? undefined : "3 4"}
            />
          )
        })}

        {/* ===== fork lanes: the three selectable adapt-strategy boxes ===== */}
        {FORK.map((f, i) => {
          const lp = lanePos[i]
          const active = f.key === path
          const reco = f.key === a.reco
          const stroke = active ? p.signal : reco ? p.verdict : p.hair
          return (
            <g
              key={`fl${f.key}`}
              style={{ cursor: "pointer" }}
              onClick={() => setPath(f.key)}
            >
              <rect
                x={lp.x}
                y={lp.y}
                width={laneBoxW}
                height={laneBoxH}
                rx={5}
                fill={active ? rgba(p.signalRGB, 0.16) : "transparent"}
                stroke={stroke}
                strokeWidth={active ? 1.8 : reco ? 1.4 : 1}
                strokeDasharray={active || reco ? undefined : "3 4"}
              />
              <text
                x={lp.x + 8}
                y={lp.y + laneBoxH / 2 + 4}
                fill={active ? p.signalHi : reco ? p.verdict : p.muted}
                style={{ fontSize: fs - 3, fontWeight: 700, letterSpacing: "0.04em", fontFamily: mono }}
              >
                {f.label}
              </text>
              {reco && (
                <text
                  x={lp.x + laneBoxW - 6}
                  y={lp.y + laneBoxH / 2 + 4}
                  textAnchor="end"
                  fill={p.verdict}
                  style={{ fontSize: fs - 4.5, letterSpacing: "0.1em", fontFamily: mono }}
                >
                  RECO
                </text>
              )}
            </g>
          )
        })}

        {/* ===== the stage nodes on the spine ===== */}
        {STAGES.map((s, i) => {
          const pos = nodePos[s.key]
          const isFork = s.key === "fork"
          const fig = stageFigure(s.key)
          // Desktop figure tier: alternate two rows so the wide ledger lines
          // never overlap their neighbours, and right-anchor the last stage so
          // it cannot spill past the canvas edge.
          const isLast = i === STAGES.length - 1
          const rowB = i % 2 === 1
          const figY = pos.y + nbH + (rowB ? 40 : 18)
          const figX = isLast ? W - 6 : pos.x + nbW / 2
          const figAnchor = isLast ? "end" : "middle"
          return (
            <g key={s.key}>
              <rect
                x={pos.x}
                y={pos.y}
                width={nbW}
                height={nbH}
                rx={7}
                fill={nodeFill(isFork)}
                stroke={isFork ? p.signal : nodeStroke(false)}
                strokeWidth={isFork ? 1.8 : 1.2}
              />
              <text
                x={pos.x + nbW / 2}
                y={pos.y + (compact ? 20 : 22)}
                textAnchor="middle"
                fill={isFork ? p.signalHi : p.ink}
                style={{ fontSize: fs - 1, fontWeight: 700, letterSpacing: "0.05em", fontFamily: mono }}
              >
                {s.label}
              </text>
              <text
                x={pos.x + nbW / 2}
                y={pos.y + (compact ? 38 : 40)}
                textAnchor="middle"
                fill={p.soft}
                style={{ fontSize: fs - 4, fontFamily: mono }}
              >
                {isFork ? lane.short + " selected" : s.sub}
              </text>

              {/* desktop: two-row staggered figure line under each node */}
              {!compact && fig && (
                <text
                  x={figX}
                  y={figY}
                  textAnchor={figAnchor}
                  fill={fig.measured ? p.muted : p.soft}
                  style={{ fontSize: fs - 4.5, fontFamily: mono }}
                >
                  {fig.text}
                </text>
              )}
              {!compact && fig && fig.measured && (
                <text
                  x={figX}
                  y={figY + 13}
                  textAnchor={figAnchor}
                  fill={p.soft}
                  style={{ fontSize: fs - 5.5, letterSpacing: "0.12em", fontFamily: mono }}
                >
                  MEASURED
                </text>
              )}
            </g>
          )
        })}

        {/* ===== the selected-lane measured readout (the argument) ===== */}
        {(() => {
          const panelX = compact ? 24 : 26
          const panelY = compact ? H - 210 : 430
          const panelW = compact ? W - 48 : W - 52
          const panelH = compact ? 176 : 96
          return (
            <g>
              <rect
                x={panelX}
                y={panelY}
                width={panelW}
                height={panelH}
                rx={9}
                fill={rgba(p.inkRGB, 0.04)}
                stroke={isReco ? p.signal : p.hair}
                strokeWidth={isReco ? 1.6 : 1}
              />
              {/* label row */}
              <text
                x={panelX + 14}
                y={panelY + 22}
                fill={p.soft}
                style={{ fontSize: fs - 3, letterSpacing: "0.14em", fontFamily: mono }}
              >
                {a.label} · {lane.label}
              </text>
              {isReco ? (
                <text
                  x={panelX + panelW - 14}
                  y={panelY + 22}
                  textAnchor="end"
                  fill={p.signalHi}
                  style={{ fontSize: fs - 3, letterSpacing: "0.12em", fontFamily: mono }}
                >
                  RECOMMENDED PATH
                </text>
              ) : (
                <text
                  x={panelX + panelW - 14}
                  y={panelY + 22}
                  textAnchor="end"
                  fill={p.verdict}
                  style={{ fontSize: fs - 3, letterSpacing: "0.12em", fontFamily: mono }}
                >
                  {`RECO FOR ${a.short}: ${FORK.find((f) => f.key === a.reco)?.short}`}
                </text>
              )}

              {/* measured compute/economics line for the chosen path */}
              <text
                x={panelX + 14}
                y={panelY + (compact ? 50 : 50)}
                fill={p.ink}
                style={{ fontSize: fs - 1.5, fontWeight: 700, fontFamily: mono }}
              >
                {lane.measure}
              </text>
              <text
                x={panelX + 14}
                y={panelY + (compact ? 68 : 68)}
                fill={p.soft}
                style={{ fontSize: fs - 4, letterSpacing: "0.1em", fontFamily: mono }}
              >
                MEASURED · {lane.gist}
              </text>

              {/* advice (threshold-framed) + team estimate */}
              <text
                x={panelX + 14}
                y={panelY + (compact ? 98 : 90)}
                fill={p.verdict}
                style={{ fontSize: fs - 3, fontFamily: mono }}
              >
                {`advice · ${a.advice}`}
              </text>
              {/* team estimate: explicitly tagged EST */}
              {compact ? (
                <text
                  x={panelX + 14}
                  y={panelY + 122}
                  fill={p.muted}
                  style={{ fontSize: fs - 3.5, fontFamily: mono }}
                >
                  {`team ${a.teamEst}  [EST]`}
                </text>
              ) : (
                <text
                  x={panelX + panelW - 14}
                  y={panelY + 72}
                  textAnchor="end"
                  fill={p.muted}
                  style={{ fontSize: fs - 3.5, fontFamily: mono }}
                >
                  {`team ${a.teamEst}  [EST]`}
                </text>
              )}
              {!compact && (
                <text
                  x={panelX + panelW - 14}
                  y={panelY + 88}
                  textAnchor="end"
                  fill={p.soft}
                  style={{ fontSize: fs - 4.5, fontFamily: mono }}
                >
                  {`EST · ${a.teamAssume}`}
                </text>
              )}
              {compact && (
                <text
                  x={panelX + 14}
                  y={panelY + 142}
                  fill={p.soft}
                  style={{ fontSize: fs - 4.5, fontFamily: mono }}
                >
                  {`EST · ${a.teamAssume}`}
                </text>
              )}
              {compact && (
                <text
                  x={panelX + 14}
                  y={panelY + 162}
                  fill={p.soft}
                  style={{ fontSize: fs - 4.5, fontFamily: mono }}
                >
                  break-even 24-32B · 0.3-3 mo vs $15/$75 API
                </text>
              )}
            </g>
          )
        })()}

        {/* desktop: the break-even ledger strip under the panel */}
        {!compact && (
          <g>
            <text
              x={26}
              y={H - 12}
              fill={p.soft}
              style={{ fontSize: fs - 4, fontFamily: mono }}
            >
              break-even · 24-32B: 0.3-3 mo · 70-120B: 3.8-34 mo · vs Claude-4 Opus $15/$75 per M tok
            </text>
            <text
              x={W - 26}
              y={H - 12}
              textAnchor="end"
              fill={p.soft}
              style={{ fontSize: fs - 5, letterSpacing: "0.12em", fontFamily: mono }}
            >
              MEASURED · Pan et al. 2509.18101
            </text>
          </g>
        )}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: "var(--font-mono), monospace", color: isReco ? p.signal : p.verdict }}
      >
        {"VERDICT · "}
        {verdict}
      </div>

      {/* controls: archetype pills */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        <span
          className="mr-1 text-[11px] uppercase tracking-[0.14em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          archetype
        </span>
        {ARCH.map((x) => (
          <button
            key={x.key}
            type="button"
            aria-pressed={x.key === arch}
            onClick={() => {
              setArch(x.key)
              setPath(x.reco)
            }}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: x.key === arch ? p.signalHi : p.muted,
              border: `1px solid ${x.key === arch ? p.signal : p.hair}`,
              background: x.key === arch ? rgba(p.signalRGB, 0.1) : "transparent",
            }}
          >
            {x.label}
          </button>
        ))}
      </div>

      {/* controls: fork-path pills */}
      <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
        <span
          className="mr-1 text-[11px] uppercase tracking-[0.14em]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          adapt path
        </span>
        {FORK.map((f) => {
          const on = f.key === path
          const reco = f.key === a.reco
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={on}
              onClick={() => setPath(f.key)}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: on ? p.signalHi : reco ? p.verdict : p.muted,
                border: `1px solid ${on ? p.signal : reco ? p.verdict : p.hair}`,
                background: on ? rgba(p.signalRGB, 0.1) : "transparent",
              }}
            >
              {f.label}
              {reco ? " · reco" : ""}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function PrivateFrontierRunbook() {
  return (
    <InstrumentFrame
      kicker="V11 · THE PRIVATE FRONTIER"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          You can own the end-to-end stack. Most teams should not pre-train from
          scratch to do it. The build path is linear and the only real branch is near
          the front: continued pre-training, a LoRA adapter, or retrieval. Pick the
          archetype and the fork lights the tier the thresholds justify, not the most
          expensive one on offer.
        </>
      }
      method={
        <>
          MEASURED cells · DAPT compute: ChipNeMo, arXiv:2311.00176, Table 1 (7B 2,620 /
          13B 4,940 / 70B 20,500 GPU-hr, under ~1.5% of from-scratch). Break-even:
          Pan et al., arXiv:2509.18101 (24-32B 0.3-3 mo · 70-120B 3.8-34 mo vs Claude-4
          Opus $15/$75 per M tok · viable above ~50M tok/mo). LoRA 10,000x params / 3x
          memory: Hu et al., arXiv:2106.09685. SFT/RM/PPO prompt counts: InstructGPT,
          Ouyang et al., NeurIPS 2022. 16-principle constitution: Bai et al.,
          arXiv:2212.08073. Frontier tier: Meta 16,384 H100 / 54-day 405B, arXiv:2407.21783;
          DeepSeek-V3 2.788M GPU-hr / $5.576M official-run-only (Technical Report, 2024).
          ESTIMATED cells · team-size bands (tagged EST) and per-archetype path advice are
          engineering estimates with the assumption shown, not measured figures.
        </>
      }
    >
      {(ctx) => <RunbookScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
