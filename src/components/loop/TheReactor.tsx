"use client"

/**
 * V7 · THE REACTOR - frontier training as loop-and-harness at industrial scale.
 *
 * A rectangular closed-circuit flow schematic: six chambers (PRETRAIN, SFT,
 * PREFERENCE, EVALS, DEPLOY, FLYWHEEL) joined by right-angled ducts with flow
 * chevrons. Click a chamber (or its pill) and the central readout shows the
 * ledger-verified figures for that stage.
 *
 * The circuit itself is SCHEMATIC (a diagram of the pipeline, not a
 * measurement); every number in the readout is a Source Ledger claim:
 *  - Meta, The Llama 3 Herd of Models (arXiv 2407.21783) + Llama 3.1 model
 *    card: 16,384 H100 GPUs, 54-day snapshot, 466 interruptions (47 planned,
 *    419 unexpected, roughly one every 3 hours), >90% goodput via automated
 *    checkpoint/restart, >15T tokens.
 *  - DeepSeek-V3 Technical Report (arXiv 2412.19437): 2.788M H800 GPU-hours,
 *    $5.576M at an assumed $2/GPU-hour, official run only.
 *  - Ouyang et al., InstructGPT, NeurIPS 2022: ~13k SFT prompts, ~33k RM
 *    ranking prompts (4-9 outputs each), ~31k PPO prompts, ~40 labelers,
 *    ~72-77% agreement; 1.3B preferred over 175B GPT-3.
 *  - Bai et al., Constitutional AI (arXiv 2212.08073): 16 principles, quote
 *    verbatim, RLAIF harmlessness labels.
 *  - OpenAI (23 Feb 2026): SWE-bench Verified retired, ~59.4% of audited
 *    failures had flawed tests; HF Open LLM Leaderboard v1 archived Jun 2024.
 *  - Pan et al. (arXiv 2509.18101): on-prem break-even vs Claude-4 Opus API.
 *  - Penedo et al., FineWeb: 96 dumps -> ~36T -> ~20T -> ~15T tokens.
 *  - NVIDIA, Nemotron-4 340B (arXiv 2406.11704): >98% synthetic alignment
 *    data, ~20K human-annotated, reward model filters before SFT/preference.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Ledger-verified chamber data. Do not edit without the Source Ledger.
// ---------------------------------------------------------------------------

type Tone = "muted" | "signal" | "danger" | "quote"
type HeroTone = "signal" | "danger" | "ink"

interface Chamber {
  key: string
  num: string
  label: string
  stat: string
  hero: string
  heroSub: string
  heroTone: HeroTone
  lines: { t: string; tone?: Tone }[]
  src: string
  verdict: string
  verdictTone: "signal" | "danger" | "ink"
}

const CHAMBERS: Chamber[] = [
  {
    key: "pretrain",
    num: "01",
    label: "PRETRAIN",
    stat: "16,384 GPUs · 54 d",
    hero: "419",
    heroSub: "unexpected interruptions · one run",
    heroTone: "danger",
    lines: [
      { t: "Llama 3.1 405B · 16,384 H100s · >15T tok" },
      { t: "466 stops · 47 planned · 419 unexpected", tone: "danger" },
      { t: "roughly one failure every 3 hours", tone: "danger" },
      { t: ">90% goodput · auto checkpoint/restart", tone: "signal" },
      { t: "DeepSeek-V3: 2.788M H800 GPU-h · $5.576M" },
      { t: "official run only · excludes ablations" },
    ],
    src: "Meta, arXiv 2407.21783 · DeepSeek, 2412.19437",
    verdict: "419 unexpected failures in 54 days · the run shipped anyway · the harness is why",
    verdictTone: "signal",
  },
  {
    key: "sft",
    num: "02",
    label: "SFT",
    stat: "~13k demos",
    hero: "~13k",
    heroSub: "human-written demonstrations",
    heroTone: "ink",
    lines: [
      { t: "InstructGPT SFT set: ~13k prompts with" },
      { t: "human-written demonstrations" },
      { t: "~40 labelers · Upwork + Scale AI" },
      { t: "~72-77% inter-annotator agreement", tone: "signal" },
    ],
    src: "Ouyang et al., NeurIPS 2022 (InstructGPT)",
    verdict: "~13k demonstrations steer the whole machine · the smallest chamber in the circuit",
    verdictTone: "ink",
  },
  {
    key: "preference",
    num: "03",
    label: "PREFERENCE",
    stat: "~33k rankings · PPO",
    hero: "1.3B > 175B",
    heroSub: "on human preference",
    heroTone: "signal",
    lines: [
      { t: "RM: ~33k prompts, 4-9 ranked · PPO: ~31k" },
      { t: "1.3B InstructGPT preferred over 175B", tone: "signal" },
      { t: "GPT-3 · despite 100x fewer parameters", tone: "signal" },
      { t: "CAI: 16 principles, 'chosen in a fairly", tone: "quote" },
      { t: "ad hoc and iterative way for research", tone: "quote" },
      { t: "purposes' · harmlessness labels by RLAIF", tone: "quote" },
    ],
    src: "Ouyang 2022 · Bai et al., arXiv 2212.08073",
    verdict: "1.3B preferred over 175B · the loop, not raw scale, drives usefulness",
    verdictTone: "signal",
  },
  {
    key: "evals",
    num: "04",
    label: "EVALS",
    stat: "verifiers retire",
    hero: "59.4%",
    heroSub: "of audited failures: flawed tests",
    heroTone: "danger",
    lines: [
      { t: "SWE-bench Verified · retired 23 Feb 2026" },
      { t: "~59.4% of audited failures: flawed tests", tone: "danger" },
      { t: "models reproduced ground-truth patches", tone: "danger" },
      { t: "Open LLM Leaderboard v1: archived after" },
      { t: "its six benchmarks saturated · Jun 2024" },
      { t: "the verifier graveyard is V5's full map" },
    ],
    src: "OpenAI, 23 Feb 2026 · HF leaderboard archive",
    verdict: "verifiers saturate, leak, retire · the gate is a consumable part",
    verdictTone: "danger",
  },
  {
    key: "deploy",
    num: "05",
    label: "DEPLOY",
    stat: "break-even 0.3-3 mo",
    hero: "0.3-3 mo",
    heroSub: "on-prem break-even · 24-32B",
    heroTone: "ink",
    lines: [
      { t: "on-prem 24-32B models break even vs" },
      { t: "Claude-4 Opus API in 0.3-3 months", tone: "signal" },
      { t: "API anchor: $15/$75 per M in/out tokens" },
      { t: "70-120B models: 3.8-34 months" },
      { t: "viable above ~50M tokens/month, or" },
      { t: "under data-residency mandates" },
    ],
    src: "Pan et al., arXiv 2509.18101",
    verdict: "past ~50M tokens/month the weights beat the API bill",
    verdictTone: "ink",
  },
  {
    key: "flywheel",
    num: "06",
    label: "FLYWHEEL",
    stat: "36T -> 15T tokens",
    hero: "36T -> 15T",
    heroSub: "the FineWeb funnel",
    heroTone: "signal",
    lines: [
      { t: "FineWeb: 96 Common Crawl dumps filtered" },
      { t: "to ~36T tok · dedup ~20T · final ~15T", tone: "signal" },
      { t: "Nemotron-4 340B: >98% of alignment data" },
      { t: "synthetic · only ~20K human-annotated", tone: "signal" },
      { t: "a reward model filters every response" },
      { t: "before it re-enters SFT and preference" },
    ],
    src: "Penedo et al. 2024 · NVIDIA, arXiv 2406.11704",
    verdict: "the loop closes: model output, filtered by a reward model, becomes training data",
    verdictTone: "signal",
  },
]

// Deterministic chevron spacing wobble (module scope: SSR === CSR).
const N_CHEV = 26
const rnd = mulberry32(0x7ea27001)
const CHEV_JITTER = Array.from({ length: N_CHEV }, () => (rnd() - 0.5) * 0.006)

// ---------------------------------------------------------------------------
// Circuit geometry: a rectangle of ducts through the chamber centres.
// ---------------------------------------------------------------------------

interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
  len: number
}

function buildSegs(pts: [number, number][]): { segs: Seg[]; total: number } {
  const segs: Seg[] = []
  let total = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    const len = Math.abs(x2 - x1) + Math.abs(y2 - y1)
    segs.push({ x1, y1, x2, y2, len })
    total += len
  }
  return { segs, total }
}

function pointAt(segs: Seg[], total: number, d: number): { x: number; y: number; ang: number } {
  let rem = ((d % total) + total) % total
  for (const s of segs) {
    if (rem <= s.len) {
      const t = s.len === 0 ? 0 : rem / s.len
      const x = s.x1 + (s.x2 - s.x1) * t
      const y = s.y1 + (s.y2 - s.y1) * t
      const ang = (Math.atan2(s.y2 - s.y1, s.x2 - s.x1) * 180) / Math.PI
      return { x, y, ang }
    }
    rem -= s.len
  }
  return { x: segs[0].x1, y: segs[0].y1, ang: 0 }
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function ReactorScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx
  const [sel, setSel] = useState(0) // PRETRAIN carries the anchor figures
  const c = CHAMBERS[sel]

  // Flow phase, advanced by rAF after mount; reduced motion stays static.
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (reduced) return
    let raf = 0
    let last: number | null = null
    const step = (t: number) => {
      if (last !== null) {
        const dt = Math.min(64, t - last)
        setPhase((v) => (v + dt * 0.000028) % 1)
      }
      last = t
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const W = compact ? 460 : 980
  const H = compact ? 650 : 520

  // Chamber centres, in flow order. Desktop: clockwise around the rectangle.
  // Compact: down the left column, across, up the right column.
  const centres: [number, number][] = compact
    ? [
        [120, 64],
        [120, 180],
        [120, 296],
        [340, 296],
        [340, 180],
        [340, 64],
      ]
    : [
        [140, 88],
        [490, 88],
        [840, 88],
        [840, 472],
        [490, 472],
        [140, 472],
      ]
  const corners: [number, number][] = compact
    ? [
        [120, 64],
        [120, 296],
        [340, 296],
        [340, 64],
      ]
    : [
        [140, 88],
        [840, 88],
        [840, 472],
        [140, 472],
      ]
  const { segs, total } = buildSegs(corners)

  const boxW = compact ? 170 : 186
  const boxH = compact ? 60 : 58

  // Central readout panel (desktop) or below-circuit panel (compact).
  const panel = compact
    ? { x0: 20, x1: 440, label: 366, hero: 414, sub: 442, line0: 474, step: 26, src: 630 }
    : { x0: 235, x1: 745, label: 150, hero: 200, sub: 230, line0: 262, step: 23, src: 400 }
  const panelRect = compact
    ? { x: 20, y: 344, w: 420, h: 302 }
    : { x: 235, y: 128, w: 510, h: 288 }

  // Compact renders ~460 viewBox units into a ~320px stage (scale ~0.7), so
  // raw sizes run larger there to keep every label >= ~9.5px on screen.
  const fs = compact ? 17 : 13.5
  const statFs = compact ? 13 : 10.5
  const heroFs = compact ? 36 : 40

  const toneFill = (tone?: Tone) =>
    tone === "signal" ? p.signal : tone === "danger" ? p.danger : tone === "quote" ? p.verdict : p.muted
  const heroFill = c.heroTone === "signal" ? p.signalHi : c.heroTone === "danger" ? p.danger : p.ink
  const verdictColor =
    c.verdictTone === "signal" ? p.signal : c.verdictTone === "danger" ? p.danger : p.ink

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>Frontier training as a closed circuit of six chambers</title>
        <desc>
          A process-plant style schematic. Six chambers, pretrain, SFT, preference,
          evals, deploy and flywheel, are joined by ducts into one closed circuit with
          flow chevrons. Selecting a chamber shows its ledger figures: for example the
          Llama 3.1 405B pretraining run took 466 interruptions, 419 of them
          unexpected, across 16,384 GPUs in 54 days and still held above 90 percent
          goodput on automated checkpoint and restart.
        </desc>

        {/* ===== ducts ===== */}
        {corners.map((pt, i) => {
          const nxt = corners[(i + 1) % corners.length]
          return (
            <g key={i}>
              <line
                x1={pt[0]}
                y1={pt[1]}
                x2={nxt[0]}
                y2={nxt[1]}
                stroke={rgba(p.inkRGB, 0.06)}
                strokeWidth={12}
              />
              <line
                x1={pt[0]}
                y1={pt[1]}
                x2={nxt[0]}
                y2={nxt[1]}
                stroke={p.hair}
                strokeWidth={1.2}
              />
            </g>
          )
        })}

        {/* flow chevrons, pulsing along the circuit */}
        {Array.from({ length: N_CHEV }, (_, i) => {
          const d = ((i / N_CHEV + CHEV_JITTER[i] + phase) % 1) * total
          const pt = pointAt(segs, total, d)
          return (
            <path
              key={i}
              d="M -5 -4 L 3 0 L -5 4"
              transform={`translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${pt.ang.toFixed(1)})`}
              fill="none"
              stroke={p.signal}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
            />
          )
        })}

        {/* duct annotations (desktop only): what each vertical duct carries */}
        {!compact && (
          <>
            <text
              x={855}
              y={280}
              transform="rotate(90 855 280)"
              textAnchor="middle"
              fill={p.soft}
              style={{ fontSize: fs - 3, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
            >
              WEIGHTS SHIP
            </text>
            <text
              x={124}
              y={280}
              transform="rotate(-90 124 280)"
              textAnchor="middle"
              fill={p.soft}
              style={{ fontSize: fs - 3, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
            >
              DATA RETURNS
            </text>
          </>
        )}

        {/* ===== chambers ===== */}
        {CHAMBERS.map((ch, i) => {
          const [cx, cy] = centres[i]
          const isSel = i === sel
          return (
            <g key={ch.key} style={{ cursor: "pointer" }} onClick={() => setSel(i)}>
              <rect
                x={cx - boxW / 2}
                y={cy - boxH / 2}
                width={boxW}
                height={boxH}
                rx={6}
                fill={p.bg}
                stroke="none"
              />
              <rect
                x={cx - boxW / 2}
                y={cy - boxH / 2}
                width={boxW}
                height={boxH}
                rx={6}
                fill={isSel ? rgba(p.signalRGB, 0.14) : rgba(p.inkRGB, 0.05)}
                stroke={isSel ? p.signal : p.hair}
                strokeWidth={isSel ? 1.8 : 1}
              />
              <text
                x={cx}
                y={cy - (compact ? 6 : 5)}
                textAnchor="middle"
                fill={isSel ? p.signalHi : p.ink}
                style={{
                  fontSize: fs - 1,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-mono), monospace",
                }}
              >
                {ch.num} {ch.label}
              </text>
              <text
                x={cx}
                y={cy + (compact ? 18 : 16)}
                textAnchor="middle"
                fill={isSel ? p.muted : p.soft}
                style={{ fontSize: statFs, fontFamily: "var(--font-mono), monospace" }}
              >
                {ch.stat}
              </text>
            </g>
          )
        })}

        {/* ===== readout panel ===== */}
        <rect
          x={panelRect.x}
          y={panelRect.y}
          width={panelRect.w}
          height={panelRect.h}
          rx={8}
          fill={rgba(p.inkRGB, 0.03)}
          stroke={p.hair}
          strokeWidth={1}
        />
        <text
          x={panel.x0 + 14}
          y={panel.label}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          CHAMBER {c.num} · {c.label} · LEDGER READOUT
        </text>
        <text
          x={panel.x0 + 14}
          y={panel.hero}
          fill={heroFill}
          style={{ fontSize: heroFs, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
        >
          {c.hero}
        </text>
        <text
          x={panel.x0 + 14}
          y={panel.sub}
          fill={p.muted}
          style={{ fontSize: fs - 1, fontFamily: "var(--font-mono), monospace" }}
        >
          {c.heroSub}
        </text>
        {c.lines.map((ln, i) => (
          <text
            key={i}
            x={panel.x0 + 14}
            y={panel.line0 + i * panel.step}
            fill={toneFill(ln.tone)}
            style={{ fontSize: fs - 1, fontFamily: "var(--font-mono), monospace" }}
          >
            {ln.t}
          </text>
        ))}
        <text
          x={panel.x0 + 14}
          y={panel.src}
          fill={p.soft}
          style={{ fontSize: fs - 4, fontFamily: "var(--font-mono), monospace" }}
        >
          {c.src}
        </text>
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{ fontFamily: "var(--font-mono), monospace", color: verdictColor }}
      >
        {"VERDICT · "}
        {c.verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {CHAMBERS.map((ch, i) => (
          <button
            key={ch.key}
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
            {ch.num} · {ch.label}
          </button>
        ))}
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          click a chamber · read its figures
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function TheReactor() {
  return (
    <InstrumentFrame
      kicker="V7 · THE REACTOR"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          A frontier lab runs the same closed circuit as any agent: pretraining, tuning,
          preference, evals, deployment, and a data flywheel feeding output back in as
          input. Meta&rsquo;s 405B run absorbed 419 unexpected interruptions in 54 days and
          still held above 90% goodput; the loop survived because the harness caught
          every failure it threw.
        </>
      }
      method={
        <>
          SCHEMATIC circuit · the piping and chamber layout is a diagram; every figure
          in the readout is a ledger claim. Pretrain: Meta, The Llama 3 Herd of Models,
          arXiv 2407.21783 (16,384 H100s, 466/47/419 interruptions, &gt;90% goodput) +
          Llama 3.1 model card (&gt;15T tokens); DeepSeek-V3 Technical Report, arXiv
          2412.19437 (2.788M H800 GPU-hours, $5.576M at an assumed $2/GPU-hour, official
          run only). SFT + preference: Ouyang et al., InstructGPT, NeurIPS 2022 (~13k /
          ~33k / ~31k prompts; 1.3B preferred over 175B); Bai et al., Constitutional AI,
          arXiv 2212.08073 (16 principles, quote verbatim, RLAIF). Evals: OpenAI, why
          SWE-bench Verified is retired (23 Feb 2026); Hugging Face, Open LLM Leaderboard
          v1 archive (2024). Deploy: Pan et al., arXiv 2509.18101. Flywheel: Penedo et
          al., FineWeb, arXiv 2406.17557; NVIDIA, Nemotron-4 340B, arXiv 2406.11704.
        </>
      }
    >
      {(ctx) => <ReactorScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
