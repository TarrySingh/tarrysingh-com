"use client"

/**
 * V2 · THE HARNESS, EXPLODED - the anatomy instrument of THE ENGINE ROOM.
 *
 * The argument: the same seven organs exist at every scale; only the flesh
 * changes. A hobbyist .claude/ folder, a team's CI harness and a frontier
 * lab's training run share one anatomy: standing context, permissions,
 * hooks/gates, verifiers, tools, specialisation, memory.
 *
 * The seven-organ stack is this essay's own model (the ledger explicitly
 * forbids asserting a documented file count for the .claude/ anatomy).
 * SOLO / TEAM artifact shapes are illustrative; every figure and quote in
 * them is a Source Ledger claim:
 *  - Ralph loop verbatim `while :; do cat PROMPT.md | claude-code ; done`
 *    (Huntley, ghuntley.com/ralph)
 *  - init.sh · claude-progress.txt · 200+ features "passes": false
 *    (Anthropic, Effective harnesses for long-running agents, 2025)
 *  - ~20-query eval + LLM judge 0.0-1.0 rubric; 40% faster after tool
 *    descriptions rewritten; 90.2% lead+subagents over single agent;
 *    1,000-2,000-token subagent summaries (Anthropic engineering, 2025)
 *  - anthropics/skills ~158,090 stars (GitHub API, 2026-07-04)
 *  - LAB column is a CONCEPTUAL MAPPING onto sourced results: Constitutional
 *    AI (Bai et al., 2022), InstructGPT (Ouyang et al., 2022), CoT monitoring
 *    (arXiv 2503.11926), Llama 3 herd checkpointing (arXiv 2407.21783).
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useEffect, useState } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Deterministic decoration (module scope: identical on SSR + CSR).
// ---------------------------------------------------------------------------

const rnd = mulberry32(0xa11a57)
const RAIL_TICKS = Array.from({ length: 9 }, (_, i) => (i + 1) / 10 + (rnd() - 0.5) * 0.02)

// ---------------------------------------------------------------------------
// Data: seven organs x three scales. Figures are Source Ledger claims;
// file shapes are illustrative (see method lane).
// ---------------------------------------------------------------------------

type Tag = "SCHEMATIC" | "SOURCED" | "CONCEPTUAL"

interface Artifact {
  title: string
  tag: Tag
  lines: string[]
}

interface Organ {
  key: string
  name: string
  forms: [string, string, string]
  artifacts: [Artifact, Artifact, Artifact]
}

const SCALES = [
  {
    key: "SOLO",
    desc1: "a person + a .claude/ folder",
    desc2: "the whole setup on one screen",
    verdict: "same anatomy · different flesh · seven files on one laptop",
  },
  {
    key: "TEAM",
    desc1: "a repo + a CI pipeline",
    desc2: "organs enforced by review",
    verdict: "same anatomy · different flesh · the same organs, now enforced by CI",
  },
  {
    key: "LAB",
    desc1: "a training run + its gates",
    desc2: "a conceptual, sourced mapping",
    verdict: "same anatomy · different flesh · conceptual map: constitution in, checkpoints out",
  },
] as const

const ORGANS: Organ[] = [
  {
    key: "context",
    name: "CONTEXT",
    forms: ["CLAUDE.md", "CLAUDE.md in the repo", "the constitution"],
    artifacts: [
      {
        title: "CLAUDE.md · STANDING CONTEXT",
        tag: "SCHEMATIC",
        lines: [
          "# CLAUDE.md",
          "what this repo is · how to build it",
          "house rules the agent must keep",
          "read at the start of every session",
          "the agent's first fact about the world",
        ],
      },
      {
        title: "CLAUDE.md · PROMPTS-AS-CODE",
        tag: "SCHEMATIC",
        lines: [
          "repo/",
          "  CLAUDE.md          reviewed like code",
          "  docs/agent-brief.md",
          "the standing context is versioned,",
          "diffed, and owned by the whole team",
        ],
      },
      {
        title: "THE CONSTITUTION AS CONTEXT",
        tag: "CONCEPTUAL",
        lines: [
          "16 written principles, 'chosen in a",
          "fairly ad hoc and iterative way for",
          "research purposes' · later drafts draw",
          "on the UN Declaration of Human Rights",
          "(Bai et al. · Constitutional AI, 2022)",
        ],
      },
    ],
  },
  {
    key: "permissions",
    name: "PERMISSIONS",
    forms: [
      "settings.json allow / deny",
      "lockfiles + allowlists in CI",
      "RL-CAI preference labels",
    ],
    artifacts: [
      {
        title: "settings.json · ALLOW / DENY",
        tag: "SCHEMATIC",
        lines: [
          '{ "permissions": {',
          '    "allow": [ "Read", "Edit",',
          '               "Bash(npm test:*)" ],',
          '    "deny":  [ "Bash(rm -rf:*)",',
          '               "Read(.env)" ] } }',
          "what the loop may touch, written down",
        ],
      },
      {
        title: "LOCKFILES + ALLOWLISTS",
        tag: "SCHEMATIC",
        lines: [
          "package-lock.json    exact, pinned",
          "tools-allowlist.yml  what the CI",
          "                     runner may call",
          "nothing new runs until review lets it in",
        ],
      },
      {
        title: "RL-CAI PREFERENCE LABELS",
        tag: "CONCEPTUAL",
        lines: [
          "the model picks the more harmless of",
          "two samples, per the constitution ·",
          "AI-generated labels replace human",
          "feedback in the harmlessness loop",
          "(Bai et al., 2022 · RLAIF)",
        ],
      },
    ],
  },
  {
    key: "hooks",
    name: "HOOKS",
    forms: [
      "PostToolUse command",
      "CI gates on every merge",
      "CoT monitor on every step",
    ],
    artifacts: [
      {
        title: "settings.json · POSTTOOLUSE HOOK",
        tag: "SCHEMATIC",
        lines: [
          '"PostToolUse": [ {',
          '  "matcher": "Edit|Write",',
          '  "hooks": [ { "type": "command",',
          '    "command": "npx tsc --noEmit" } ] } ]',
          "fires after every matching tool call",
        ],
      },
      {
        title: "ci.yml · MERGE GATES",
        tag: "SCHEMATIC",
        lines: [
          "on: pull_request",
          "jobs:",
          "  typecheck: npx tsc --noEmit",
          "  lint:      npx eslint .",
          "  test:      npm test",
          "a merge cannot skip the gate",
        ],
      },
      {
        title: "COT MONITOR AS GATE",
        tag: "CONCEPTUAL",
        lines: [
          "a GPT-4o monitor reads the chain of",
          "thought: 95% recall on the two",
          "systemic hacks vs 60% actions-only ·",
          "pressure on the CoT taught the model",
          "to hide intent, not to stop hacking",
          "(OpenAI · arXiv 2503.11926, 2025)",
        ],
      },
    ],
  },
  {
    key: "verifiers",
    name: "VERIFIERS",
    forms: ["reviewer subagent", "eval suite + PR review", "the reward model"],
    artifacts: [
      {
        title: "agents/reviewer.md · VERIFIER",
        tag: "SCHEMATIC",
        lines: [
          "---",
          "name: reviewer",
          "tools: Read, Grep, Bash",
          "---",
          "run the checks · report which rules",
          "failed and why · verify, never fix",
        ],
      },
      {
        title: "EVAL SUITE IN CI + PR REVIEW",
        tag: "SOURCED",
        lines: [
          "~20 queries from real usage patterns",
          "an LLM judge scores 0.0-1.0 against a",
          "rubric: factual accuracy · citations ·",
          "completeness · source quality · tool",
          "efficiency · humans review edge cases",
          "(Anthropic · multi-agent system, 2025)",
        ],
      },
      {
        title: "REWARD MODEL AS VERIFIER",
        tag: "CONCEPTUAL",
        lines: [
          "InstructGPT: SFT on ~13k prompts ·",
          "reward model on ~33k human-ranked",
          "prompts · PPO against that reward ·",
          "the 1.3B model beat the 175B GPT-3",
          "on human preference",
          "(Ouyang et al., 2022)",
        ],
      },
    ],
  },
  {
    key: "tools",
    name: "TOOLS",
    forms: [".mcp.json tool surface", "shared registry, tested", "just-in-time retrieval"],
    artifacts: [
      {
        title: ".mcp.json · TOOL SURFACE",
        tag: "SCHEMATIC",
        lines: [
          '{ "mcpServers": {',
          '    "github":   { "command": "..." },',
          '    "postgres": { "command": "..." } } }',
          "a small surface of self-contained tools",
          "the loop can actually pick from",
        ],
      },
      {
        title: "SHARED TOOL REGISTRY",
        tag: "SOURCED",
        lines: [
          "tools/registry.json  one source of truth",
          "a tool-testing agent that rewrote tool",
          "descriptions cut task completion time",
          "40% for future agents using them",
          "(Anthropic, 2025)",
        ],
      },
      {
        title: "JUST-IN-TIME RETRIEVAL",
        tag: "CONCEPTUAL",
        lines: [
          "agents keep lightweight identifiers",
          "(file paths, stored queries, links)",
          "and load content on demand · head and",
          "tail instead of whole files in context",
          "(Anthropic · context engineering, 2025)",
        ],
      },
    ],
  },
  {
    key: "skills",
    name: "SKILLS",
    forms: ["skills/ folder", "specialist subagents", "lead + subagent models"],
    artifacts: [
      {
        title: "skills/ · SPECIALISATION",
        tag: "SCHEMATIC",
        lines: [
          "skills/",
          "  deploy-checklist/SKILL.md",
          "  pdf-extract/SKILL.md",
          "loaded on demand, not always in context",
          "anthropics/skills · 158,090 stars",
          "(GitHub API · 2026-07-04)",
        ],
      },
      {
        title: "SPECIALIST SUBAGENTS",
        tag: "SOURCED",
        lines: [
          "agents/",
          "  reviewer.md   verify only",
          "  migrator.md   schema changes only",
          "each returns a condensed summary of",
          "~1,000-2,000 tokens to the lead agent",
          "(Anthropic · context engineering, 2025)",
        ],
      },
      {
        title: "LEAD + SUBAGENT MODELS",
        tag: "CONCEPTUAL",
        lines: [
          "Opus 4 lead + Sonnet 4 subagents beat",
          "a single Opus 4 by 90.2% on Anthropic's",
          "internal research eval · the lead spins",
          "up 3-5 subagents in parallel",
          "(Anthropic, 2025 · internal eval)",
        ],
      },
    ],
  },
  {
    key: "memory",
    name: "MEMORY",
    forms: [
      "MEMORY.md + a loop on disk",
      "init.sh + progress files",
      "checkpoints + auto-restart",
    ],
    artifacts: [
      {
        title: "MEMORY.md + THE LOOP ON DISK",
        tag: "SOURCED",
        lines: [
          "## MEMORY.md",
          "decisions that must survive restarts",
          "",
          "the loop that reads it, verbatim:",
          "while :; do cat PROMPT.md | claude-code ; done",
          "(G. Huntley · ghuntley.com/ralph)",
        ],
      },
      {
        title: "PROGRESS ARTIFACTS ON DISK",
        tag: "SOURCED",
        lines: [
          "init.sh              rebuild the env",
          "claude-progress.txt  what happened",
          "features.json        200+ features,",
          '                     each "passes": false',
          "a fresh session reads its state from disk",
        ],
      },
      {
        title: "CHECKPOINTS AS MEMORY",
        tag: "CONCEPTUAL",
        lines: [
          "Meta, 16,384 GPUs, 54 days: 466 job",
          "interruptions, 419 unexpected · >90%",
          "effective training time held through",
          "automated checkpoint / restart",
          "(Llama 3 herd · arXiv 2407.21783, 2024)",
        ],
      },
    ],
  },
]

const TAG_NOTE: Record<Tag, string> = {
  SCHEMATIC: "illustrative shape",
  SOURCED: "figures as published",
  CONCEPTUAL: "mapping, sourced figures",
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function HarnessScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p, reduced } = ctx
  const [scaleIdx, setScaleIdx] = useState(0)
  const [organIdx, setOrganIdx] = useState(0)
  const scale = SCALES[scaleIdx]
  const organ = ORGANS[organIdx]
  const art = organ.artifacts[scaleIdx]

  // A pulse token travelling down the assembly rail. rAF after mount;
  // reduced motion renders the complete static scene with no token.
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    if (reduced) return
    let raf = 0
    let last: number | null = null
    const step = (t: number) => {
      if (last !== null) {
        const dt = Math.min(64, t - last)
        setPulse((v) => (v + dt * 0.00016) % 1)
      }
      last = t
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const W = compact ? 460 : 980
  const H = compact ? 838 : 590

  // Geometry: organ stack left, rail, artifact panel right (desktop) or
  // below (compact).
  const stack = compact
    ? { x: 24, nameY0: 148, pitch: 56, railX: 402, railY0: 132, railY1: 492 }
    : { x: 40, nameY0: 142, pitch: 62, railX: 292, railY0: 126, railY1: 534 }
  const panel = compact
    ? { x0: 20, x1: 440, y0: 516, y1: 820, tx: 34, codeY0: 576, lineH: 25 }
    : { x0: 356, x1: 948, y0: 118, y1: 558, tx: 370, codeY0: 176, lineH: 24 }

  // Compact renders ~460 viewBox units into a ~320px stage (scale ~0.7), so
  // raw sizes run larger there to keep every label >= ~9.5px on screen.
  const fs = compact ? 17 : 13.5
  const codeFs = compact ? 13.5 : 12.5
  const titleFs = compact ? 13 : 11.5

  const nameY = (i: number) => stack.nameY0 + i * stack.pitch
  const nodeY = (i: number) => nameY(i) - 4
  const tagColor = (t: Tag) =>
    t === "SOURCED" ? p.verdict : t === "CONCEPTUAL" ? p.cool : p.soft

  const pulseY = stack.railY0 + (stack.railY1 - stack.railY0) * pulse
  const ghostScales = [0, 1, 2].filter((i) => i !== scaleIdx)

  const ghostDividerY = compact ? 736 : 464
  const ghostLabelY = compact ? 758 : 486
  const ghostLineY = (j: number) => (compact ? 782 + j * 24 : 510 + j * 24)

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>The harness, exploded: seven organs at three scales</title>
        <desc>
          Seven organ nodes in an exploded stack: context, permissions, hooks,
          verifiers, tools, skills, memory, joined to an assembly rail. A scale
          selector switches between solo, team and lab; a panel shows the real
          artifact each organ takes at the selected scale.
        </desc>

        {/* header lane */}
        <text
          x={stack.x}
          y={compact ? 26 : 30}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          {compact ? "SEVEN ORGANS · ONE ANATOMY" : "SEVEN ORGANS · ONE ANATOMY · CHOOSE A SCALE"}
        </text>
        <text
          x={stack.x}
          y={compact ? 80 : 84}
          fill={p.signalHi}
          style={{ fontSize: compact ? 34 : 40, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
        >
          {scale.key}
        </text>
        <text
          x={compact ? 130 : 185}
          y={compact ? 60 : 64}
          fill={p.muted}
          style={{ fontSize: compact ? fs - 2 : fs - 1, fontFamily: "var(--font-mono), monospace" }}
        >
          {scale.desc1}
        </text>
        <text
          x={compact ? 130 : 185}
          y={compact ? 80 : 84}
          fill={p.soft}
          style={{ fontSize: compact ? fs - 3 : fs - 2, fontFamily: "var(--font-mono), monospace" }}
        >
          {scale.desc2}
        </text>

        {/* the assembly rail */}
        <text
          x={compact ? 434 : stack.railX}
          y={compact ? 124 : 114}
          textAnchor={compact ? "end" : "middle"}
          fill={p.soft}
          style={{ fontSize: fs - 3, letterSpacing: "0.14em", fontFamily: "var(--font-mono), monospace" }}
        >
          ASSEMBLY RAIL
        </text>
        <line
          x1={stack.railX}
          y1={stack.railY0}
          x2={stack.railX}
          y2={stack.railY1}
          stroke={p.hair}
          strokeWidth={2}
        />
        {RAIL_TICKS.map((t, i) => {
          const y = stack.railY0 + (stack.railY1 - stack.railY0) * t
          return (
            <line
              key={i}
              x1={stack.railX - 4}
              y1={y}
              x2={stack.railX + 4}
              y2={y}
              stroke={p.grid}
              strokeWidth={1}
            />
          )
        })}
        {!reduced && (
          <>
            <circle cx={stack.railX} cy={pulseY} r={7} fill={rgba(p.signalRGB, 0.22)} />
            <circle cx={stack.railX} cy={pulseY} r={3.2} fill={p.signalHi} />
          </>
        )}

        {/* organ stack */}
        {ORGANS.map((o, i) => {
          const isSel = i === organIdx
          const ny = nameY(i)
          const cy = nodeY(i)
          return (
            <g key={o.key} style={{ cursor: "pointer" }} onClick={() => setOrganIdx(i)}>
              {/* hit area */}
              <rect
                x={compact ? 16 : 32}
                y={ny - (compact ? 26 : 24)}
                width={compact ? 428 : 292}
                height={compact ? 52 : 56}
                fill="transparent"
              />
              <line
                x1={compact ? 356 : 262}
                y1={cy}
                x2={stack.railX - (compact ? 10 : 9)}
                y2={cy}
                stroke={isSel ? p.signal : p.hair}
                strokeWidth={isSel ? 1.6 : 1}
              />
              <circle
                cx={stack.railX}
                cy={cy}
                r={compact ? 8 : 7}
                fill={isSel ? rgba(p.signalRGB, 0.16) : "none"}
                stroke={isSel ? p.signal : p.hair}
                strokeWidth={isSel ? 2 : 1.2}
              />
              <text
                x={stack.x}
                y={ny}
                fill={isSel ? p.signalHi : p.ink}
                style={{
                  fontSize: fs,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-mono), monospace",
                }}
              >
                {o.name}
              </text>
              <text
                x={stack.x}
                y={ny + (compact ? 18 : 17)}
                fill={isSel ? p.muted : p.soft}
                style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
              >
                {o.forms[scaleIdx]}
              </text>
            </g>
          )
        })}

        {/* connector: focused organ to the artifact panel (desktop only) */}
        {!compact && (
          <>
            <line
              x1={stack.railX + 7}
              y1={nodeY(organIdx)}
              x2={panel.x0}
              y2={nodeY(organIdx)}
              stroke={p.signal}
              strokeWidth={1.6}
            />
            <circle cx={panel.x0} cy={nodeY(organIdx)} r={3} fill={p.signal} />
          </>
        )}

        {/* artifact panel */}
        <rect
          x={panel.x0}
          y={panel.y0}
          width={panel.x1 - panel.x0}
          height={panel.y1 - panel.y0}
          rx={6}
          fill={rgba(p.inkRGB, 0.04)}
          stroke={p.hair}
          strokeWidth={1}
        />
        <line
          x1={panel.x0}
          y1={panel.y0 + (compact ? 30 : 28)}
          x2={panel.x1}
          y2={panel.y0 + (compact ? 30 : 28)}
          stroke={p.hair}
          strokeWidth={1}
        />
        <text
          x={panel.tx}
          y={panel.y0 + (compact ? 20 : 19)}
          fill={p.muted}
          style={{
            fontSize: titleFs,
            fontWeight: 700,
            letterSpacing: compact ? "0.06em" : "0.1em",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {art.title}
        </text>
        <text
          x={panel.x1 - 12}
          y={panel.y0 + (compact ? 20 : 19)}
          textAnchor="end"
          fill={tagColor(art.tag)}
          style={{ fontSize: fs - 3.5, letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}
        >
          {art.tag}
        </text>

        {art.lines.map((ln, i) => (
          <text
            key={i}
            x={panel.tx}
            y={panel.codeY0 + i * panel.lineH}
            fill={ln.startsWith("(") ? p.soft : p.ink}
            style={{ fontSize: codeFs, fontFamily: "var(--font-mono), monospace", whiteSpace: "pre" }}
          >
            {ln}
          </text>
        ))}
        <text
          x={panel.tx}
          y={ghostDividerY - (compact ? 14 : 16)}
          fill={p.soft}
          style={{ fontSize: fs - 3.5, fontFamily: "var(--font-mono), monospace" }}
        >
          {TAG_NOTE[art.tag]}
        </text>

        {/* ghost references: the same organ at the other two scales */}
        <line
          x1={panel.tx}
          y1={ghostDividerY}
          x2={panel.x1 - 12}
          y2={ghostDividerY}
          stroke={p.hair}
          strokeWidth={1}
        />
        <text
          x={panel.tx}
          y={ghostLabelY}
          fill={p.soft}
          style={{ fontSize: fs - 3, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
        >
          THE SAME ORGAN AT THE OTHER SCALES
        </text>
        {ghostScales.map((si, j) => (
          <text
            key={si}
            x={panel.tx}
            y={ghostLineY(j)}
            fill={p.cool}
            style={{ fontSize: codeFs, fontFamily: "var(--font-mono), monospace" }}
          >
            {SCALES[si].key} · {organ.forms[si]}
          </text>
        ))}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: scaleIdx === 2 ? p.verdict : p.signal,
        }}
      >
        {"VERDICT · "}
        {scale.verdict}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {SCALES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={i === scaleIdx}
            onClick={() => setScaleIdx(i)}
            className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: i === scaleIdx ? p.signalHi : p.muted,
              border: `1px solid ${i === scaleIdx ? p.signal : p.hair}`,
              background: i === scaleIdx ? rgba(p.signalRGB, 0.1) : "transparent",
            }}
          >
            {s.key}
          </button>
        ))}
        <span
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
        >
          click an organ · read its artifact at this scale
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function HarnessExploded() {
  return (
    <InstrumentFrame
      kicker="V2 · THE HARNESS, EXPLODED"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          A hobbyist&rsquo;s .claude/ folder, a team&rsquo;s CI pipeline and a frontier
          lab&rsquo;s training run carry the same seven organs: standing context,
          permissions, gates, verifiers, tools, specialisation, memory. Scale swaps
          the flesh around each organ; it never adds or removes one.
        </>
      }
      method={
        <>
          SCHEMATIC · the seven-organ stack is this essay&rsquo;s model, and the SOLO /
          TEAM artifact shapes are illustrative; every figure and quote is sourced.
          Loop + harness framing: Anthropic, Building agents with the Claude Agent SDK
          (2025). init.sh, claude-progress.txt, 200+ features &lsquo;passes&rsquo;: false:
          Anthropic, Effective harnesses for long-running agents (2025). Ralph loop
          verbatim: G. Huntley, ghuntley.com/ralph (2025). Eval rubric, 40%, 90.2%,
          1,000-2,000 tokens: Anthropic engineering posts (2025). Star count: GitHub
          API, 2026-07-04. The LAB column is a CONCEPTUAL MAPPING onto sourced results:
          Bai et al., Constitutional AI (2022); Ouyang et al., InstructGPT (2022);
          OpenAI CoT monitoring, arXiv 2503.11926 (2025); Llama 3 herd, arXiv
          2407.21783 (2024).
        </>
      }
    >
      {(ctx) => <HarnessScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
