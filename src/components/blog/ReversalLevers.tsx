"use client"

/**
 * V41 — THE REVERSAL LEVERS  (Chapter 12, "The Key Europe Holds" — the
 * constructive turn).
 *
 * There is no mystery about what Europe must do. The plans are written, costed
 * and signed; the only missing input is the nerve to pull them. This panel is a
 * console of FIVE physical levers — each with a real prize and its real, dismal
 * 2026 implementation rate. The reader throws each lever (it travels cyan →
 * GOLD, "armed → pulled") and the matching GAP-bar narrows toward its prize.
 *
 *   1 · MOBILISE THE SAVINGS   — the Savings & Investments Union: ~€10–11tn of
 *                                idle deposits; stop the ~€300bn/yr leak abroad.
 *   2 · COMPLETE THE SINGLE MKT — ~€2.8tn of GDP on the table; internal barriers
 *                                ≈ 54% (goods) / 95% (services) tariff-equiv.;
 *                                Letta "One Europe, One Market" roadmap, Dec 2027.
 *   3 · BUY & BUILD EUROPEAN    — the EuroStack / sovereign-tech turn.
 *   4 · BACK THE FRONTIER       — InvestAI ~€200bn mobilisation / €20bn facility
 *                                → 5 AI Gigafactories; Mistral scaling.
 *   5 · POWER IT                — fix the grid + the energy price (the solvable
 *                                Chapter-7 problem).
 *
 * But a master IMPLEMENTATION gauge sits at only ~13% (RED) — the Draghi audits
 * put full implementation at ~11–15% as of early 2026. The levers are built,
 * labelled, and within reach — and barely pulled.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (lever throw + bar fill snap instantly when the OS asks),
 * keyboard-reachable (each lever is a focusable button; ▶ pulls all five),
 * meaningful at its default (every lever armed, gauge at the real ~13%).
 * role="img" + aria-label.
 *
 * Figures hard-coded. Sources: European Commission (SIU, InvestAI); ECB
 * (single-market internal barriers); Letta report (2024); Draghi implementation
 * audits (early 2026).
 */

import { useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp01,
  lerp,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

type Lever = {
  key: string
  label: string
  prize: string // the headline figure (mono counter)
  prizeNote: string // what the prize is
  detail: string // the costed plan + source
  impl: number // 0..1 — real 2026 implementation rate (how far it's been pulled)
}

// Each lever's `impl` is its real implementation rate today — most sit near the
// floor, which is the whole point: built, labelled, barely pulled.
const LEVERS: Lever[] = [
  {
    key: "savings",
    label: "MOBILISE THE SAVINGS",
    prize: "€300bn",
    prizeNote: "/yr leak abroad, stopped",
    detail:
      "The Savings & Investments Union: ~€10–11tn of idle EU deposits, and the ~€300bn/yr that leaks to foreign markets. Plan written (EC, 2025).",
    impl: 0.1,
  },
  {
    key: "market",
    label: "COMPLETE THE SINGLE MARKET",
    prize: "€2.8tn",
    prizeNote: "of GDP on the table",
    detail:
      "Internal barriers ≈ 54% (goods) / 95% (services) tariff-equivalents. The Letta 'One Europe, One Market' roadmap — deadline Dec 2027.",
    impl: 0.14,
  },
  {
    key: "build",
    label: "BUY & BUILD EUROPEAN",
    prize: "EuroStack",
    prizeNote: "the sovereign-tech turn",
    detail:
      "Procure and build the sovereign technology stack at home — the EuroStack turn — instead of wiring the cheque to US hyperscalers.",
    impl: 0.12,
  },
  {
    key: "frontier",
    label: "BACK THE FRONTIER",
    prize: "€200bn",
    prizeNote: "InvestAI → 5 Gigafactories",
    detail:
      "InvestAI: ~€200bn mobilisation behind a €20bn facility → five AI Gigafactories; Mistral scaling. The frontier bet, costed (EC, 2025).",
    impl: 0.18,
  },
  {
    key: "power",
    label: "POWER IT",
    prize: "the grid",
    prizeNote: "energy price, solved",
    detail:
      "Fix the grid and the energy price — the solvable Chapter-7 problem. Cheap, clean, abundant power is the input under every other lever.",
    impl: 0.13,
  },
]

// The master implementation gauge — Draghi audits, ~11–15% fully implemented as
// of early 2026. We render the mid-point.
const DRAGHI_IMPL = 0.13

// Plot frame (viewBox units).
const W = 920
const H = 680

// Lever-bank geometry — five console rows down the left two-thirds.
const ROW_TOP = 150
const ROW_H = 78
const SLOT_X = 70 // left edge of the lever slot
const SLOT_W = 150 // travel length of each lever
const BAR_X = SLOT_X + SLOT_W + 56 // gap-bar starts here
const BAR_W = 300 // gap-bar full width

const pct = (t: number) => `${Math.round(t * 100)}%`

export function ReversalLevers() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // Which levers the reader has pulled. Default: none pulled — armed, untouched,
  // the real 2026 posture. (The gauge still reads the real ~13% baseline.)
  const [pulled, setPulled] = useState<Record<string, boolean>>({})
  // Per-lever throw animation 0 → 1 (cyan armed → gold pulled).
  const [throwT, setThrowT] = useState<Record<string, number>>({})
  const [focused, setFocused] = useState<string>(LEVERS[0].key)

  function setThrow(key: string, target: number) {
    if (reduced) {
      setThrowT((m) => ({ ...m, [key]: target }))
      return
    }
    const from = throwT[key] ?? 0
    const start = performance.now()
    const dur = 620
    const tick = (now: number) => {
      const k = clamp01((now - start) / dur)
      const v = lerp(from, target, easeInOut(k))
      setThrowT((m) => ({ ...m, [key]: v }))
      if (k < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  function toggle(key: string) {
    const next = !pulled[key]
    setPulled((m) => ({ ...m, [key]: next }))
    setThrow(key, next ? 1 : 0)
    setFocused(key)
  }

  // ▶ — pull every lever in sequence (the costed plan, fully executed).
  function pullAll() {
    const allPulled = LEVERS.every((l) => pulled[l.key])
    if (allPulled) {
      // reset — slam them all back to armed
      setPulled({})
      LEVERS.forEach((l) => setThrow(l.key, 0))
      return
    }
    LEVERS.forEach((l, i) => {
      window.setTimeout(
        () => {
          setPulled((m) => ({ ...m, [l.key]: true }))
          setThrow(l.key, 1)
        },
        reduced ? 0 : i * 240,
      )
    })
  }

  const pulledCount = LEVERS.filter((l) => pulled[l.key]).length

  // The master gauge: starts at the real Draghi baseline (~13%) and climbs as
  // the reader pulls levers — each lever closes its share of the remaining gap.
  const headroom = 1 - DRAGHI_IMPL
  const gaugeT = clamp01(DRAGHI_IMPL + (pulledCount / LEVERS.length) * headroom)

  const cur = LEVERS.find((l) => l.key === focused) ?? LEVERS[0]
  const curPulled = !!pulled[cur.key]

  // gauge arc geometry (top-right) — a 240° sweep.
  const gx = W - 180
  const gy = 132
  const gr = 78
  const ga0 = Math.PI * 1.2 // start (lower-left)
  const ga1 = -Math.PI * 0.2 // end (lower-right), sweeping clockwise over the top
  const gaCur = lerp(ga0, ga1, gaugeT)
  const gaugeColor =
    gaugeT < 0.34 ? p.squeeze : gaugeT < 0.7 ? mixHex(p.squeeze, p.wonder, (gaugeT - 0.34) / 0.36) : p.wonder

  const arcPath = (a0: number, a1: number) => {
    const x0 = gx + Math.cos(a0) * gr
    const y0 = gy - Math.sin(a0) * gr
    const x1 = gx + Math.cos(a1) * gr
    const y1 = gy - Math.sin(a1) * gr
    const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0
    return `M ${x0} ${y0} A ${gr} ${gr} 0 ${large} 1 ${x1} ${y1}`
  }

  const allPulled = pulledCount === LEVERS.length

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V41 · The Reversal Levers"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: allPulled ? p.wonderHi : p.squeeze }}
        >
          {pulledCount}/{LEVERS.length} PULLED · IMPL {pct(gaugeT)}
        </span>
      }
      caption={
        <>
          Five costed levers Europe already holds — each with its real prize and its real 2026{" "}
          <span style={{ color: p.squeeze }}>implementation rate</span>. Throw a lever (cyan{" "}
          <span style={{ color: p.leverage }}>armed</span> → gold{" "}
          <span style={{ color: p.wonderHi }}>pulled</span>) — or press ▶ — and its gap-bar narrows toward the
          prize: <span style={{ color: p.wonderHi }}>€300bn/yr</span> saved (SIU),{" "}
          <span style={{ color: p.wonderHi }}>€2.8tn</span> of single-market GDP (Letta, Dec 2027),{" "}
          the EuroStack turn, <span style={{ color: p.wonderHi }}>€200bn</span> behind the frontier (InvestAI),
          and the grid. The master gauge starts at the real{" "}
          <span style={{ color: p.squeeze }}>~13%</span> — Draghi&rsquo;s recommendations ~11–15% fully
          implemented, early 2026. Built, labelled, within reach — and barely pulled. Sources: European
          Commission (SIU, InvestAI); ECB (single-market barriers); Letta report; Draghi audits (2026).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A console of five reversal levers Europe already holds. Mobilise the savings (stop the ~€300bn/yr leak), complete the single market (~€2.8tn of GDP; Letta, Dec 2027), buy & build European (EuroStack), back the frontier (InvestAI ~€200bn → 5 AI Gigafactories) and power it (fix the grid). The plans are written and costed — but the master implementation gauge sits at only ~13%, the Draghi audits' early-2026 figure. The levers are built, labelled and within reach, and barely pulled.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="rl-hope" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={lerp(0, 0.22, clamp01((gaugeT - DRAGHI_IMPL) / headroom))} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* hope bloom behind the bank, swelling gold as levers are pulled */}
        <rect x={40} y={ROW_TOP - 28} width={BAR_X + BAR_W - 20} height={LEVERS.length * ROW_H + 20} fill="url(#rl-hope)" />

        {/* console header */}
        <text x={SLOT_X} y={62} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.2em" }}>
          THE PLANS ARE WRITTEN · THE LEVERS ARE BUILT
        </text>
        <text x={SLOT_X} y={94} fill={p.leverage} style={{ fontSize: 21, fontWeight: 800, letterSpacing: "0.01em" }}>
          THE KEY EUROPE HOLDS
        </text>
        <text x={SLOT_X} y={118} fill={p.muted} style={{ fontSize: 12.5, fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}>
          not poor, not weak — it has simply never summoned the nerve to turn the key
        </text>

        {/* the five lever rows */}
        {LEVERS.map((l, i) => {
          const y = ROW_TOP + i * ROW_H
          const t = throwT[l.key] ?? 0
          const on = !!pulled[l.key]
          const isFocus = focused === l.key
          const armColor = mixHex(p.leverage, p.wonderHi, t)

          // lever slot: travel from left (armed) to right (pulled)
          const slotY = y + ROW_H / 2 - 6
          const handleX = SLOT_X + lerp(0, SLOT_W, t)

          // gap-bar: the remaining gap shrinks from full toward the prize as the
          // lever is pulled. armed → full red gap; pulled → near-closed, gold.
          const gapFill = lerp(1, clamp01(l.impl), t) // how much gap remains
          const closed = 1 - gapFill
          const barColor = mixHex(p.squeeze, p.wonderHi, t)

          return (
            <g
              key={l.key}
              role="button"
              tabIndex={0}
              aria-label={`${l.label}: ${on ? "pulled" : "armed"}. Prize ${l.prize} ${l.prizeNote}. Real 2026 implementation ${pct(
                l.impl,
              )}.`}
              aria-pressed={on}
              onMouseEnter={() => setFocused(l.key)}
              onFocus={() => setFocused(l.key)}
              onClick={() => toggle(l.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggle(l.key)
                }
              }}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {/* focus / hover plate */}
              <rect
                x={SLOT_X - 22}
                y={y - 2}
                width={BAR_X + BAR_W - SLOT_X + 44}
                height={ROW_H - 12}
                rx={12}
                fill={isFocus ? rgba(p.glowRGB, 0.06) : "transparent"}
                stroke={isFocus ? rgba(p.glowRGB, on ? 0.4 : 0.22) : "transparent"}
                strokeWidth={1}
              />

              {/* lever index + label */}
              <text x={SLOT_X - 12} y={y + 22} textAnchor="end" fill={on ? p.wonderHi : p.soft} style={{ fontSize: 13, fontWeight: 800 }}>
                {i + 1}
              </text>
              <text x={SLOT_X} y={y + 22} fill={on ? p.ink : p.muted} style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.03em" }}>
                {l.label}
              </text>

              {/* the lever slot track */}
              <rect x={SLOT_X} y={slotY} width={SLOT_W} height={12} rx={6} fill={p.hair} />
              {/* filled travel */}
              <rect x={SLOT_X} y={slotY} width={lerp(0, SLOT_W, t)} height={12} rx={6} fill={armColor} opacity={0.55} />
              {/* slot end caps: armed (cyan, left) / pulled (gold, right) */}
              <text x={SLOT_X} y={slotY + 30} fill={p.leverage} style={{ fontSize: 11, letterSpacing: "0.08em" }}>
                ARMED
              </text>
              <text x={SLOT_X + SLOT_W} y={slotY + 30} textAnchor="end" fill={on ? p.wonderHi : p.soft} style={{ fontSize: 11, letterSpacing: "0.08em" }}>
                PULLED
              </text>
              {/* the lever handle */}
              <line x1={handleX} y1={slotY - 16} x2={handleX} y2={slotY + 12} stroke={armColor} strokeWidth={3} strokeLinecap="round" />
              <circle cx={handleX} cy={slotY - 18} r={7} fill={armColor} stroke={p.bg} strokeWidth={1.5} />

              {/* the gap-bar — remaining gap to the prize */}
              <rect x={BAR_X} y={slotY - 3} width={BAR_W} height={18} rx={5} fill={rgba(p.glowRGB, 0.1)} />
              {/* remaining gap (the part not yet closed) */}
              <rect
                x={BAR_X + BAR_W * closed}
                y={slotY - 3}
                width={BAR_W * gapFill}
                height={18}
                rx={5}
                fill={rgba(mode === "dark" ? "240,112,138" : "192,69,90", lerp(0.55, 0.12, t))}
              />
              {/* the closed portion (the prize captured) */}
              <rect x={BAR_X} y={slotY - 3} width={BAR_W * closed} height={18} rx={5} fill={barColor} opacity={0.9} />
              {/* prize counter, right of the bar */}
              <text x={BAR_X + BAR_W + 12} y={slotY + 11} fill={on ? p.wonderHi : p.muted} style={{ fontSize: 15, fontWeight: 800 }}>
                {l.prize}
              </text>
            </g>
          )
        })}

        {/* ===== MASTER IMPLEMENTATION GAUGE (top-right) ===== */}
        <g>
          <text x={gx} y={gy - gr - 16} textAnchor="middle" fill={p.soft} style={{ fontSize: 10, letterSpacing: "0.18em" }}>
            IMPLEMENTATION
          </text>
          {/* track */}
          <path d={arcPath(ga0, ga1)} fill="none" stroke={p.hair} strokeWidth={10} strokeLinecap="round" />
          {/* baseline tick at the real ~13% */}
          {(() => {
            const ba = lerp(ga0, ga1, DRAGHI_IMPL)
            return (
              <line
                x1={gx + Math.cos(ba) * (gr - 9)}
                y1={gy - Math.sin(ba) * (gr - 9)}
                x2={gx + Math.cos(ba) * (gr + 9)}
                y2={gy - Math.sin(ba) * (gr + 9)}
                stroke={p.squeeze}
                strokeWidth={2}
              />
            )
          })()}
          {/* filled sweep */}
          <path d={arcPath(ga0, gaCur)} fill="none" stroke={gaugeColor} strokeWidth={10} strokeLinecap="round" />
          {/* centre readout */}
          <text x={gx} y={gy + 6} textAnchor="middle" fill={gaugeColor} style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {pct(gaugeT)}
          </text>
          <text x={gx} y={gy + 28} textAnchor="middle" fill={p.muted} style={{ fontSize: 10.5 }}>
            of the plan, executed
          </text>
          {/* the floor label */}
          <text x={gx} y={gy + gr + 4} textAnchor="middle" fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
            real 2026 floor · ~13%
          </text>
          <text x={gx} y={gy + gr + 20} textAnchor="middle" fill={p.soft} style={{ fontSize: 12, fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}>
            Draghi: ~11–15% fully implemented
          </text>
        </g>

        {/* ===== FOCUSED-LEVER DETAIL (bottom strip) ===== */}
        {(() => {
          const dy = ROW_TOP + LEVERS.length * ROW_H + 8
          const headColor = curPulled ? p.wonderHi : p.leverage
          return (
            <g>
              <line x1={SLOT_X} y1={dy} x2={W - 60} y2={dy} stroke={p.blueprint} strokeWidth={1} />
              <text x={SLOT_X} y={dy + 24} fill={headColor} style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.04em" }}>
                {cur.label}
                <tspan fill={p.soft} style={{ fontSize: 12, fontWeight: 600 }}>
                  {"   "}· real impl {pct(cur.impl)}
                </tspan>
              </text>
              {wrapText(cur.detail, 92).map((line, k) => (
                <text key={`d-${k}`} x={SLOT_X} y={dy + 46 + k * 18} fill={p.muted} style={{ fontSize: 12.5, fontFamily: "var(--font-serif), serif" }}>
                  {line}
                </text>
              ))}
            </g>
          )
        })()}
      </svg>

      {/* master meter + verdict + pull-all */}
      <div className="mt-2 px-1">
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: rgba(p.glowRGB, 0.16) }} aria-hidden>
          <div
            style={{
              width: `${gaugeT * 100}%`,
              height: "100%",
              background: gaugeColor,
              transition: reduced ? "none" : "width 540ms ease-out",
            }}
          />
        </div>

        <p className="mt-3 text-[15px]" style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}>
          <span style={{ color: allPulled ? p.wonderHi : p.squeeze, fontStyle: "normal", fontWeight: 700 }}>
            {allPulled ? "The key turns" : "Built, labelled, within reach"}
          </span>{" "}
          — {allPulled
            ? "every lever is written, costed and signed; the only missing input was ever the nerve to pull them."
            : "the plans are not missing. The nerve is."}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={pullAll}
            aria-label={allPulled ? "Reset every lever to armed" : "Pull every reversal lever"}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: allPulled ? p.leverage : p.wonderHi,
              border: `1px solid ${allPulled ? p.leverage : p.wonder}`,
              background: "transparent",
            }}
          >
            {allPulled ? "↺ re-arm all" : "▶ pull all five"}
          </button>
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {pulledCount}/{LEVERS.length} levers pulled · impl {pct(gaugeT)}
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}

// Naive width-budget word-wrap for the in-SVG readout copy. ~`max` chars/line.
function wrapText(s: string, max: number): string[] {
  const words = s.split(" ")
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      if (line) lines.push(line)
      line = w
    } else {
      line = (line + " " + w).trim()
    }
  }
  if (line) lines.push(line)
  return lines
}
