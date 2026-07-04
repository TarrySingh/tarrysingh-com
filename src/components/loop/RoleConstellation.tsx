"use client"

/**
 * V14 · THE ROLE CONSTELLATION - the emerging-roles instrument of THE ENGINE
 * ROOM (Plate V). The new jobs are loop-and-harness-shaped; this plots who
 * gets hired and hands the reader the day-one task list for each.
 *
 * FORM: a scatter of seven emerging roles on scarcity (y, hard-to-hire now)
 * against adoption-time (x, how established the hiring precedent is), with
 * career-path edges connecting roles that feed into each other. Clicking a
 * node reveals a concrete Monday-morning task list for that role.
 *
 * NUMBERS DISCIPLINE. Role names and day-one tasks are the essay's forward
 * role design, not surveyed data, and are presented as such. The two axes are
 * ENGINEERING ESTIMATES whose basis (Palantir/OpenAI FDE precedent, MLOps
 * precedent, METR task-horizon trend) is named in the method lane, NOT
 * measured market coordinates. The only MEASURED figures rendered are ledger
 * market signals in the side readout: LinkedIn postings, the PwC wage premium,
 * and the FDE / MLE / MLOps comp anchors from Ch11. No salaries or counts are
 * invented.
 *
 * Anti-slop: no em-dash anywhere in this file; middot separators.
 */

import { useState, type ReactNode } from "react"
import { InstrumentFrame, mulberry32, rgba, type SceneCtx } from "./loop-kit"

// ---------------------------------------------------------------------------
// Roles. x = adoption-time estimate (0 established precedent .. 1 forward),
// y = scarcity estimate (0 hireable .. 1 near-unhireable now). Both axes are
// engineering judgement, not measurement (see method lane). precedent names
// the real archetype the estimate leans on.
// ---------------------------------------------------------------------------

interface Role {
  key: string
  name: string
  short: string
  x: number
  y: number
  precedent: string
  tier: "signal" | "verdict" // signal = the load-bearing hire, verdict = adjacent
  scarcity: string // the verdict clause for scarcity
  feeds: string[] // role keys this one feeds into (career-path edges)
  tasks: string[] // day-one Monday tasks, engineering-native
}

const ROLES: Role[] = [
  {
    key: "loop",
    name: "LOOP & HARNESS ENGINEER",
    short: "Loop & Harness",
    x: 0.34,
    y: 0.82,
    precedent: "Palantir/OpenAI FDE",
    tier: "signal",
    scarcity: "scarce now · the load-bearing hire",
    feeds: ["verifier", "fleet", "auditor"],
    tasks: [
      "Stand up the plan-act-verify-persist loop as code; put the state file on disk",
      "Wire backpressure: a hard stop when the verifier fails N times in a row",
      "Pin the tool surface to a versioned schema so a model swap is a config diff",
      "Write the runbook for a stuck loop: what a human reads first, second, third",
    ],
  },
  {
    key: "verifier",
    name: "VERIFIER ENGINEER",
    short: "Verifier",
    x: 0.62,
    y: 0.9,
    precedent: "SDET / eval infra",
    tier: "signal",
    scarcity: "scarcest of all · nobody trained for it yet",
    feeds: ["econ"],
    tasks: [
      "Turn the acceptance rubric into machine-checkable rules, not vibes",
      "Build the LLM judge and hold out a labelled set to measure the judge itself",
      "Instrument every claimed-done against a ground-truth check; log the gap",
      "Red-team the reward: find the shortcut before the agent does",
    ],
  },
  {
    key: "context",
    name: "CONTEXT CURATOR",
    short: "Context",
    x: 0.7,
    y: 0.74,
    precedent: "retrieval / prompt eng",
    tier: "verdict",
    scarcity: "emerging · a curated window beats the full transcript",
    feeds: ["verifier"],
    tasks: [
      "Set the token budget per task; measure completion against tokens spent",
      "Build the summariser that compresses tool history to what the next step needs",
      "Audit retrieval: which chunks the model actually reads versus what you fetched",
      "Cut the standing context that never earns its place in the window",
    ],
  },
  {
    key: "vault",
    name: "DATA-VAULT STEWARD",
    short: "Data-Vault",
    x: 0.58,
    y: 0.68,
    precedent: "data platform / RLHF",
    tier: "verdict",
    scarcity: "emerging · the private frontier runs on proprietary data",
    feeds: ["context"],
    tasks: [
      "Inventory the proprietary corpus the agent may read; tag provenance and licence",
      "Gate the vault: who and which agent can read which slice, logged",
      "Stand up the labelling pipeline and the reviewer QA on top of it",
      "Version the training and eval splits so a result is reproducible next quarter",
    ],
  },
  {
    key: "fleet",
    name: "AGENT-FLEET OPERATOR",
    short: "Fleet Op",
    x: 0.44,
    y: 0.6,
    precedent: "MLOps / SRE",
    tier: "verdict",
    scarcity: "arriving · MLOps is the operational precedent",
    feeds: ["auditor", "econ"],
    tasks: [
      "Put every agent run behind a dashboard: cost, tokens, tool calls, failure mode",
      "Set the paging rule for a fleet that is burning budget with no progress",
      "Roll out a model or harness change canary-first, never fleet-wide at once",
      "Own the kill switch and the rollback the day a loop goes feral",
    ],
  },
  {
    key: "auditor",
    name: "HARNESS AUDITOR",
    short: "Auditor",
    x: 0.82,
    y: 0.86,
    precedent: "security / SRE review",
    tier: "verdict",
    scarcity: "nascent · the role compliance will demand next",
    feeds: [],
    tasks: [
      "Trace one production task end to end: every tool the agent could reach",
      "Prove the failure-closed path: what happens when a secret is missing",
      "Check the audit log answers who-did-what for a regulated deployment",
      "File the harness threat model the way security files a pen-test report",
    ],
  },
  {
    key: "econ",
    name: "EVALS ECONOMIST",
    short: "Evals Econ",
    x: 0.9,
    y: 0.78,
    precedent: "no clean precedent",
    tier: "verdict",
    scarcity: "furthest out · the newest job on this chart",
    feeds: [],
    tasks: [
      "Price a task: tokens and wall-clock per completed unit, not per call",
      "Rank eval spend by the decisions it changes; kill the evals that change none",
      "Model the build-versus-frontier-API crossover for your own workload",
      "Report quality per dollar to the people who sign the compute bill",
    ],
  },
]

const ROLE_BY_KEY: Record<string, Role> = Object.fromEntries(ROLES.map((r) => [r.key, r]))

// Measured market signals (Source Ledger, Ch11). These are the ONLY measured
// numbers rendered; the axes are estimates.
const SIGNALS = [
  { label: "AI job postings added, US 2023-25", value: "639K", note: "LinkedIn / CBS" },
  { label: "of those, AI engineer roles", value: "75K", note: "LinkedIn / CBS" },
  { label: "wage premium for AI skills", value: "56%", note: "PwC 2025" },
  { label: "Anthropic FDE, Applied AI base band", value: "$200-300K", note: "Greenhouse posting" },
]

// deterministic starfield (background dust), seeded once at module scope
const STARS = (() => {
  const rnd = mulberry32(0x2a17f0e3)
  return Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), r: 0.5 + rnd() * 1.1 }))
})()

// ---------------------------------------------------------------------------

function ConstellationScene({ ctx }: { ctx: SceneCtx }) {
  const { compact, p } = ctx
  const [selKey, setSelKey] = useState("loop") // start on the load-bearing hire
  const sel = ROLE_BY_KEY[selKey]

  const W = compact ? 460 : 980
  // Compact stacks the plot over the task panel; grow H so the panel clears.
  const H = compact ? 900 : 560

  // Plot rectangle (the scatter field).
  const plot = compact
    ? { x0: 74, x1: 430, yTop: 128, yBottom: 430 }
    : { x0: 92, x1: 636, yTop: 96, yBottom: 486 }

  // x estimate -> px (left = established precedent, right = forward)
  const px = (x: number) => plot.x0 + (plot.x1 - plot.x0) * x
  // y estimate -> px (top = scarcest, bottom = hireable)
  const py = (y: number) => plot.yBottom - (plot.yBottom - plot.yTop) * y

  // Side / lower panel for the day-one task list + signals.
  // Compact panel starts well below the x-axis label (baseline ~464) so the
  // DAY ONE header does not collide with ADOPTION TIME on the same band.
  const panel = compact
    ? { x0: 40, x1: 430, yTop: 500 }
    : { x0: 672, x1: 952, yTop: 96 }

  const fs = compact ? 17 : 13.5
  const nodeR = compact ? 9 : 8

  // Compact-only per-node label placement. The 460-wide scatter packs the seven
  // labels too close for the shared desktop nearRight rule, so in compact each
  // label gets a hand-tuned anchor + offset that fans it clear of its neighbours
  // (>= 6px clear between every label box). Desktop keeps the nearRight logic.
  const COMPACT_LABEL: Record<string, { anchor: "start" | "end"; dx: number; dy: number }> = {
    loop: { anchor: "start", dx: nodeR + 6, dy: -10 },
    verifier: { anchor: "end", dx: -(nodeR + 6), dy: -2 },
    auditor: { anchor: "start", dx: nodeR + 6, dy: -8 },
    context: { anchor: "end", dx: -(nodeR + 6), dy: -8 },
    econ: { anchor: "end", dx: -(nodeR + 6), dy: 20 },
    vault: { anchor: "end", dx: -(nodeR + 6), dy: 2 },
    fleet: { anchor: "start", dx: nodeR + 6, dy: 4 },
  }

  const accentFor = (r: Role) => (r.tier === "signal" ? p.signal : p.verdict)

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>The role constellation: emerging agent-engineering jobs by scarcity and adoption time</title>
        <desc>
          Seven emerging roles plotted as a scatter of hiring scarcity against how established
          the precedent is, joined by career-path edges. Loop and Harness Engineer and Verifier
          Engineer are the scarcest and most load-bearing. Selecting a role reveals its day-one
          task list. Axis positions are engineering estimates, not measured coordinates.
        </desc>

        {/* ===== background dust ===== */}
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={plot.x0 + (plot.x1 - plot.x0) * s.x}
            cy={plot.yTop + (plot.yBottom - plot.yTop) * s.y}
            r={s.r}
            fill={rgba(p.inkRGB, 0.1)}
          />
        ))}

        {/* ===== axis frame ===== */}
        <line x1={plot.x0} y1={plot.yBottom} x2={plot.x1} y2={plot.yBottom} stroke={p.hair} strokeWidth={1} />
        <line x1={plot.x0} y1={plot.yTop} x2={plot.x0} y2={plot.yBottom} stroke={p.hair} strokeWidth={1} />

        {/* x axis label + poles */}
        <text
          x={plot.x0}
          y={plot.yTop - (compact ? 42 : 34)}
          fill={p.soft}
          style={{ fontSize: fs - 2, letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
        >
          WHO GETS HIRED · SCARCITY vs ADOPTION TIME
        </text>
        <text
          x={plot.x0}
          y={plot.yBottom + 18}
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
        >
          precedent exists
        </text>
        <text
          x={plot.x1}
          y={plot.yBottom + 18}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
        >
          forward role
        </text>
        <text
          x={plot.x0 + (plot.x1 - plot.x0) / 2}
          y={plot.yBottom + (compact ? 34 : 32)}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: fs - 3, letterSpacing: "0.14em", fontFamily: "var(--font-mono), monospace" }}
        >
          ADOPTION TIME (estimate) &#8594;
        </text>

        {/* y axis poles (stacked; two anchors would collide in compact) */}
        <text
          x={plot.x0 - 8}
          y={plot.yTop + 4}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
        >
          scarce
        </text>
        <text
          x={plot.x0 - 8}
          y={plot.yBottom - 2}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
        >
          hireable
        </text>

        {/* ===== scarcity meaning-zone: the top band is the load-bearing hires ===== */}
        <rect
          x={plot.x0}
          y={plot.yTop}
          width={plot.x1 - plot.x0}
          height={py(0.78) - plot.yTop}
          fill={rgba(p.signalRGB, 0.05)}
        />
        <text
          x={plot.x1 - 6}
          y={plot.yTop + 14}
          textAnchor="end"
          fill={p.signal}
          style={{ fontSize: fs - 3, letterSpacing: "0.12em", fontFamily: "var(--font-mono), monospace" }}
        >
          LOAD-BEARING · HIRE FIRST
        </text>

        {/* ===== career-path edges (drawn under the nodes) ===== */}
        {ROLES.flatMap((r) =>
          r.feeds.map((fk) => {
            const t = ROLE_BY_KEY[fk]
            if (!t) return null
            const active = selKey === r.key || selKey === fk
            return (
              <line
                key={`${r.key}-${fk}`}
                x1={px(r.x)}
                y1={py(r.y)}
                x2={px(t.x)}
                y2={py(t.y)}
                stroke={active ? p.signal : p.hair}
                strokeWidth={active ? 1.8 : 1}
                strokeDasharray={active ? undefined : "4 4"}
                opacity={active ? 0.9 : 0.7}
              />
            )
          }),
        )}

        {/* ===== nodes ===== */}
        {ROLES.map((r) => {
          const cx = px(r.x)
          const cy = py(r.y)
          const isSel = r.key === selKey
          const accent = accentFor(r)
          // Label placement. Compact uses the hand-tuned per-node offset map so
          // the packed labels fan clear of each other; desktop keeps its
          // nearRight rule (verified clean at 1280 and left untouched).
          const cl = compact ? COMPACT_LABEL[r.key] : undefined
          const nearRight = cx > plot.x1 - 128
          const anchor = cl ? cl.anchor : nearRight ? "end" : "start"
          const lx = cl ? cx + cl.dx : nearRight ? cx - nodeR - 6 : cx + nodeR + 6
          const ly = cl ? cy + cl.dy : cy + 4
          return (
            <g key={r.key} style={{ cursor: "pointer" }} onClick={() => setSelKey(r.key)}>
              {isSel && (
                <circle cx={cx} cy={cy} r={nodeR + 6} fill="none" stroke={accent} strokeWidth={1.2} opacity={0.5} />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={nodeR}
                fill={isSel ? rgba(r.tier === "signal" ? p.signalRGB : "230,180,90", 0.34) : rgba(p.inkRGB, 0.06)}
                stroke={accent}
                strokeWidth={isSel ? 2.2 : 1.4}
              />
              {r.tier === "signal" && (
                <circle cx={cx} cy={cy} r={3} fill={accent} />
              )}
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                fill={isSel ? p.ink : p.muted}
                style={{
                  fontSize: fs - (compact ? 6 : 2.5),
                  fontWeight: isSel ? 700 : 600,
                  letterSpacing: "0.03em",
                  fontFamily: "var(--font-mono), monospace",
                }}
              >
                {r.short}
              </text>
            </g>
          )
        })}

        {/* ===== task panel (right on desktop, below in compact) ===== */}
        {(() => {
          const x0 = panel.x0
          let y = panel.yTop
          const accent = accentFor(sel)
          const lineH = compact ? 26 : 21
          const maxChars = 40
          const wrap = (s: string) => {
            const words = s.split(" ")
            const rows: string[] = []
            let cur = ""
            for (const w of words) {
              if ((cur + " " + w).trim().length > maxChars) {
                rows.push(cur.trim())
                cur = w
              } else {
                cur = (cur + " " + w).trim()
              }
            }
            if (cur) rows.push(cur.trim())
            return rows
          }
          return (
            <g>
              {/* panel divider on desktop */}
              {!compact && (
                <line x1={x0 - 16} y1={panel.yTop - 8} x2={x0 - 16} y2={H - 40} stroke={p.hair} strokeWidth={1} />
              )}
              <text
                x={x0}
                y={y}
                fill={p.soft}
                style={{ fontSize: fs - 3, letterSpacing: "0.16em", fontFamily: "var(--font-mono), monospace" }}
              >
                DAY ONE · MONDAY MORNING
              </text>
              {(() => {
                y += compact ? 28 : 24
                return (
                  <text
                    x={x0}
                    y={y}
                    fill={accent}
                    style={{ fontSize: compact ? 18 : 16, fontWeight: 800, fontFamily: "var(--font-mono), monospace" }}
                  >
                    {sel.short.toUpperCase()}
                  </text>
                )
              })()}
              {(() => {
                y += compact ? 22 : 18
                return (
                  <text
                    x={x0}
                    y={y}
                    fill={p.soft}
                    style={{ fontSize: fs - 3, fontFamily: "var(--font-mono), monospace" }}
                  >
                    precedent · {sel.precedent}
                  </text>
                )
              })()}
              {(() => {
                y += compact ? 26 : 22
                return sel.tasks.map((task, i) => {
                  const rows = wrap(task)
                  const block: ReactNode[] = []
                  const startY = y
                  rows.forEach((row, ri) => {
                    block.push(
                      <text
                        key={`${i}-${ri}`}
                        x={ri === 0 ? x0 : x0 + 16}
                        y={y}
                        fill={p.ink}
                        style={{ fontSize: fs - (compact ? 2.5 : 2), fontFamily: "var(--font-mono), monospace" }}
                      >
                        {ri === 0 ? `${i + 1} · ${row}` : row}
                      </text>,
                    )
                    y += lineH
                  })
                  // marker tick for the task
                  block.push(
                    <line
                      key={`tick-${i}`}
                      x1={x0 - 8}
                      y1={startY - 4}
                      x2={x0 - 8}
                      y2={y - lineH + 2}
                      stroke={accent}
                      strokeWidth={2}
                    />,
                  )
                  y += 6
                  return <g key={i}>{block}</g>
                })
              })()}
            </g>
          )
        })()}
      </svg>

      {/* verdict line */}
      <div
        className="mt-1 px-1 text-[13px]"
        style={{
          fontFamily: "var(--font-mono), monospace",
          color: sel.tier === "signal" ? p.signal : p.verdict,
        }}
      >
        {"VERDICT · "}
        {sel.name.replace(/ ENGINEER| OPERATOR| STEWARD| AUDITOR| CURATOR| ECONOMIST/i, (m) => m.toLowerCase())}
        {" · "}
        {sel.scarcity}
      </div>

      {/* measured market signals: the ledger anchors under the estimate */}
      <div
        className="mt-3 grid gap-x-4 gap-y-1.5 px-1"
        style={{ gridTemplateColumns: compact ? "1fr" : "1fr 1fr" }}
      >
        {SIGNALS.map((s) => (
          <div key={s.label} className="flex items-baseline justify-between gap-3">
            <span
              className="text-[11px]"
              style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
            >
              {s.label}
            </span>
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              <span
                className="text-[13px] font-bold"
                style={{ fontFamily: "var(--font-mono), monospace", color: p.verdict }}
              >
                {s.value}
              </span>
              <span
                className="text-[9.5px] uppercase tracking-[0.1em]"
                style={{ fontFamily: "var(--font-mono), monospace", color: p.soft }}
              >
                {s.note}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* controls lane */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        {ROLES.map((r) => {
          const isSel = r.key === selKey
          const accent = r.tier === "signal" ? p.signal : p.verdict
          const accentHi = r.tier === "signal" ? p.signalHi : p.verdictHi
          const accentRGB = r.tier === "signal" ? p.signalRGB : "230,180,90"
          return (
            <button
              key={r.key}
              type="button"
              aria-pressed={isSel}
              onClick={() => setSelKey(r.key)}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors"
              style={{
                fontFamily: "var(--font-mono), monospace",
                color: isSel ? accentHi : p.muted,
                border: `1px solid ${isSel ? accent : p.hair}`,
                background: isSel ? rgba(accentRGB, 0.1) : "transparent",
              }}
            >
              {r.short}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function RoleConstellation() {
  return (
    <InstrumentFrame
      kicker="V14 · THE ROLE CONSTELLATION"
      folio="ENGINE ROOM · PLATE V"
      caption={
        <>
          The new jobs are loop-and-harness-shaped. Two of them are load-bearing and already
          hard to hire: the engineer who owns the loop, and the one who owns the verifier that
          keeps it honest. The rest trail behind on established precedent. Select a node to read
          what each role does on its first Monday, not the brochure version.
        </>
      }
      method={
        <>
          SCHEMATIC · role names and day-one tasks are forward role design, the essay&rsquo;s
          engineering argument, not surveyed data. The two axes are ESTIMATES: scarcity and
          adoption time judged against named precedents (Palantir/OpenAI Forward Deployed
          Engineer, MLOps/SRE, eval infra) and the METR task-horizon trend, not measured
          coordinates. MEASURED signals (side panel), Source Ledger Ch11: LinkedIn added 639K AI
          postings US 2023-25, 75K of them AI engineer roles (LinkedIn / CBS 2025); AI-skill wage
          premium 56% (PwC 2025 Global AI Jobs Barometer); Anthropic Forward Deployed Engineer,
          Applied AI base band $200,000-$300,000 (Greenhouse posting, 2026).
        </>
      }
    >
      {(ctx) => <ConstellationScene ctx={ctx} />}
    </InstrumentFrame>
  )
}
