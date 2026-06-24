"use client"

/**
 * V29 — THE DEPENDENCY SPINE  (Chapter 8, "Paying for Dependence, Calling It
 * Autonomy: Defence").
 *
 * Europe's defence stack, drawn as a vertebral column — one segment per layer,
 * each split into the share that is US-dependent (RED, the leak / foreign
 * control) versus European-sovereign (CYAN, the value Europe keeps). A GOLD
 * marker flags the one vertebra where Europe is actively building its own
 * alternative — the first sign of a spine of resistance.
 *
 *   AIRCRAFT                  — F-35; ~64% of EU arms imports are US. Deeply
 *                               dependent. No live sovereign substitute yet.
 *   BATTLE-MANAGEMENT SW      — Palantir's Maven Smart System adopted across
 *                               NATO (SHAPE, Mar 2025) — but Germany REJECTED
 *                               Palantir (Apr 2026); France / NL / Denmark
 *                               build alternatives (Arcadia). GOLD resistance.
 *   MUNITIONS / IMPORTS       — ~78% of procurement spend went extra-EU at the
 *                               surge peak; the re-armament leaks abroad.
 *   SOVEREIGN PROGRAMMES      — FCAS / Eurofighter; the ~22% kept home. CYAN.
 *
 * Click (or keyboard-focus) any vertebra for its dependence detail and any
 * European alternative now forming.
 *
 * REVEAL: the largest re-armament since the Cold War is also a transatlantic
 * wealth transfer — paying for dependence and calling it autonomy. But, vertebra
 * by vertebra, a spine of resistance is finally setting.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the only motion is a slow settle gated behind the OS preference;
 * the static end-state is the fully-rendered spine), keyboard-reachable
 * (focusable vertebra groups), meaningful at its default (the resistance
 * vertebra is pre-selected). role="img" + aria-label.
 *
 * Figures hard-coded. Sources: SIPRI (arms-import / extra-EU shares);
 * SHAPE / NATO (Maven Smart System, Mar 2025); German MoD (Palantir rejection,
 * Apr 2026); EU procurement targets.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp01,
  easeOut,
  lerp,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

type Vertebra = {
  key: string
  label: string
  sub: string
  usDep: number // % of this layer that is US-dependent (the leak)
  resistance: boolean // Europe is actively building an alternative here
  metric: string // the headline figure for the readout
  detail: string // the dependence story
  alt: string // the European alternative now forming (or its absence)
}

// Top → bottom: the stack runs from the airframe down to the sovereign core.
const SPINE: Vertebra[] = [
  {
    key: "aircraft",
    label: "AIRCRAFT",
    sub: "F-35 · combat air",
    usDep: 64,
    resistance: false,
    metric: "~64%",
    detail:
      "Around 64% of EU arms imports are American — the F-35 is the spine of allied air power, and its mission-data, sustainment and software updates run through US hands.",
    alt: "No live sovereign substitute in service; the alternative is a programme, not a jet (see SOVEREIGN, below).",
  },
  {
    key: "bms",
    label: "BATTLE-MANAGEMENT SW",
    sub: "Maven · the targeting brain",
    usDep: 55,
    resistance: true,
    metric: "Apr 2026",
    detail:
      "Palantir's Maven Smart System was adopted across NATO (SHAPE, Mar 2025) — the targeting brain, foreign-owned. Then Germany REJECTED Palantir (Apr 2026).",
    alt: "France, the Netherlands and Denmark are building sovereign alternatives (Arcadia). The first vertebra to resist — gold.",
  },
  {
    key: "munitions",
    label: "MUNITIONS / IMPORTS",
    sub: "shells · the surge",
    usDep: 78,
    resistance: false,
    metric: "~78%",
    detail:
      "At the surge peak, ~78% of European defence procurement spend went extra-EU — the re-armament cheque clears abroad, not at home.",
    alt: "EU procurement targets push toward buying European, but the muscle isn't built yet; most of the surge still leaks out.",
  },
  {
    key: "sovereign",
    label: "SOVEREIGN PROGRAMMES",
    sub: "FCAS / Eurofighter",
    usDep: 22,
    resistance: false,
    metric: "~22%",
    detail:
      "FCAS and Eurofighter are the ~22% kept home — the sovereign core of the stack, European-designed and European-owned.",
    alt: "This IS the alternative: the slow, expensive, jointly-built backbone the rest of the spine is meant to grow toward.",
  },
]

// Geometry — a vertical column of vertebrae, the readout to its right. --------
const W = 920
const H = 600
const SPINE_X = 248 // centre-line of the column
const SEG_W = 300 // vertebra body width
const TOP = 96
const BOT = H - 70
const GAP = 22 // disc gap between vertebrae
const SEG_H = (BOT - TOP - GAP * (SPINE.length - 1)) / SPINE.length

const segY = (i: number) => TOP + i * (SEG_H + GAP)

const pctOfStack = (() => {
  // Stack-wide US-dependence: a simple mean of the layer shares, for the header.
  const m = SPINE.reduce((a, v) => a + v.usDep, 0) / SPINE.length
  return Math.round(m)
})()

export function DependencySpine() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // Default selection = the resistance vertebra (the meaningful beat).
  const [active, setActive] = useState<string>("bms")
  const cur = SPINE.find((v) => v.key === active) ?? SPINE[1]

  // Slow mechanical settle: each vertebra fills from sovereign-cyan toward its
  // true US-dependence over ~1.1s. Gated behind reduced motion (→ snaps full).
  const [t, setT] = useState(reduced ? 1 : 0)
  useEffect(() => {
    if (reduced) {
      setT(1)
      return
    }
    let raf = 0
    const start = performance.now()
    const dur = 1100
    const tick = (now: number) => {
      const k = clamp01((now - start) / dur)
      setT(easeOut(k))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V29 · The Dependency Spine"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze }}
        >
          ~{pctOfStack}% OF THE STACK · FOREIGN-OWNED
        </span>
      }
      caption={
        <>
          Europe&rsquo;s defence stack, vertebra by vertebra — each split into the share that is{" "}
          <span style={{ color: p.squeeze }}>US-dependent</span> and the share that is{" "}
          <span style={{ color: p.leverage }}>European-sovereign</span>. Click any vertebra for its
          dependence detail. The one <span style={{ color: p.wonderHi }}>gold</span> joint —
          battle-management software — is where Germany rejected Palantir and France, the Netherlands and
          Denmark began building their own (Arcadia): the first vertebra of a spine of resistance. Sources:
          SIPRI; SHAPE/NATO (Maven Smart System, Mar 2025); German MoD (Palantir rejection, Apr 2026); EU
          procurement targets.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`The Dependency Spine: Europe's defence stack as four stacked vertebrae. Aircraft ~64% US-dependent, munitions/imports ~78% extra-EU, sovereign programmes only ~22% foreign — and one gold joint, battle-management software, where Germany rejected Palantir (Apr 2026) and France, the Netherlands and Denmark are building Arcadia: the first sign of a spine of resistance.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="ds-leak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.92} />
            <stop offset="100%" stopColor={p.squeezeHi} stopOpacity={0.7} />
          </linearGradient>
          <radialGradient id="ds-resist" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={0.4} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* schematic column hairlines — the dorsal + ventral guides */}
        <line x1={SPINE_X - SEG_W / 2} y1={TOP - 22} x2={SPINE_X - SEG_W / 2} y2={BOT + 14} stroke={p.blueprint} strokeWidth={1} />
        <line x1={SPINE_X + SEG_W / 2} y1={TOP - 22} x2={SPINE_X + SEG_W / 2} y2={BOT + 14} stroke={p.blueprint} strokeWidth={1} />
        <text x={SPINE_X} y={TOP - 30} textAnchor="middle" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.22em" }}>
          THE STACK · TOP → CORE
        </text>

        {/* scale legend over the column: 0% ← sovereign | dependent → 100% */}
        <text x={SPINE_X - SEG_W / 2 + 6} y={BOT + 30} textAnchor="start" fill={p.leverage} style={{ fontSize: 9.5, letterSpacing: "0.1em" }}>
          ◂ EUROPEAN-SOVEREIGN
        </text>
        <text x={SPINE_X + SEG_W / 2 - 6} y={BOT + 30} textAnchor="end" fill={p.squeeze} style={{ fontSize: 9.5, letterSpacing: "0.1em" }}>
          US-DEPENDENT ▸
        </text>

        {/* the vertebrae */}
        {SPINE.map((v, i) => {
          const y = segY(i)
          const isActive = active === v.key
          const x0 = SPINE_X - SEG_W / 2
          // dependence fills from the right; settle animates from 0 → true share
          const dep = (v.usDep / 100) * t
          const depW = SEG_W * dep
          const splitX = x0 + (SEG_W - depW)

          return (
            <g
              key={v.key}
              role="button"
              tabIndex={0}
              aria-label={`${v.label}: ${v.usDep}% US-dependent${v.resistance ? " — but Europe is building an alternative here" : ""}`}
              onMouseEnter={() => setActive(v.key)}
              onFocus={() => setActive(v.key)}
              onClick={() => setActive(v.key)}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {/* resistance bloom behind the gold vertebra */}
              {v.resistance && (
                <rect
                  x={x0 - 30}
                  y={y - 18}
                  width={SEG_W + 60}
                  height={SEG_H + 36}
                  rx={26}
                  fill="url(#ds-resist)"
                  opacity={isActive ? 1 : 0.7}
                />
              )}

              {/* the sovereign body (cyan base) */}
              <rect
                x={x0}
                y={y}
                width={SEG_W}
                height={SEG_H}
                rx={14}
                fill={rgba(mode === "dark" ? "108,198,230" : "14,122,165", isActive ? 0.18 : 0.12)}
                stroke={isActive ? p.leverageHi : rgba(mode === "dark" ? "108,198,230" : "14,122,165", 0.5)}
                strokeWidth={isActive ? 2 : 1.3}
              />
              {/* the US-dependent overlay (red, filling from the right) */}
              <clipPath id={`ds-clip-${v.key}`}>
                <rect x={x0} y={y} width={SEG_W} height={SEG_H} rx={14} />
              </clipPath>
              <g clipPath={`url(#ds-clip-${v.key})`}>
                <rect
                  x={splitX}
                  y={y}
                  width={depW}
                  height={SEG_H}
                  fill="url(#ds-leak)"
                  opacity={isActive ? 1 : 0.82}
                />
                {/* the split seam — where sovereign ends and dependence begins */}
                <line
                  x1={splitX}
                  y1={y}
                  x2={splitX}
                  y2={y + SEG_H}
                  stroke={isActive ? p.squeezeHi : p.squeeze}
                  strokeWidth={1.6}
                  strokeDasharray="3 3"
                />
              </g>

              {/* the disc / spinous process — a small notch on the left flank,
                  GOLD where the spine resists, otherwise a faint blueprint nub */}
              <circle
                cx={x0 - 16}
                cy={y + SEG_H / 2}
                r={v.resistance ? 7 : 4.5}
                fill={v.resistance ? p.wonderHi : p.bg}
                stroke={v.resistance ? p.wonder : p.blueprint}
                strokeWidth={v.resistance ? 2 : 1.2}
              />
              {v.resistance && (
                <circle cx={x0 - 16} cy={y + SEG_H / 2} r={12} fill="none" stroke={p.wonder} strokeOpacity={0.5} strokeWidth={1} />
              )}

              {/* label block, left-aligned inside the sovereign side */}
              <text
                x={x0 + 16}
                y={y + SEG_H / 2 - 4}
                fill={isActive ? p.ink : p.muted}
                style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "0.04em" }}
              >
                {v.label}
              </text>
              <text x={x0 + 16} y={y + SEG_H / 2 + 14} fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.06em" }}>
                {v.sub}
              </text>

              {/* the share, right-aligned inside the dependence side */}
              <text
                x={x0 + SEG_W - 14}
                y={y + SEG_H / 2 + 6}
                textAnchor="end"
                fill={isActive ? "#fff" : rgba("255,255,255", 0.92)}
                style={{ fontSize: 18, fontWeight: 800 }}
              >
                {v.usDep}%
              </text>
            </g>
          )
        })}

        {/* ===== READOUT panel — dependence detail + European alternative ===== */}
        {(() => {
          const px = 600
          const pw = W - px - 40
          const py = TOP
          const ph = BOT - TOP
          const gold = cur.resistance
          const headColor = gold ? p.wonderHi : p.squeeze
          return (
            <g>
              <rect
                x={px}
                y={py}
                width={pw}
                height={ph}
                rx={14}
                fill={p.hair}
                stroke={gold ? p.wonder : p.blueprint}
                strokeWidth={gold ? 1.6 : 1}
              />
              <text x={px + 22} y={py + 34} fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.2em" }}>
                {gold ? "SPINE OF RESISTANCE" : "PAYING FOR DEPENDENCE"}
              </text>
              <text x={px + 22} y={py + 70} fill={headColor} style={{ fontSize: 17, fontWeight: 800, letterSpacing: "0.03em" }}>
                {cur.label}
              </text>

              {/* the headline figure */}
              <text x={px + 22} y={py + 138} fill={headColor} style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {cur.metric}
              </text>
              <text x={px + 22} y={py + 162} fill={p.muted} style={{ fontSize: 12 }}>
                {gold ? "Germany rejected Palantir · alternatives forming" : `US-dependent share of this layer`}
              </text>

              {/* dependence detail */}
              {wrapText(cur.detail, 46).map((line, k) => (
                <text key={`det-${k}`} x={px + 22} y={py + 206 + k * 19} fill={p.muted} style={{ fontSize: 12.5, fontFamily: "var(--font-serif), serif" }}>
                  {line}
                </text>
              ))}

              {/* the alternative — gold if resistance, else faint */}
              <line x1={px + 22} y1={py + 206 + wrapText(cur.detail, 46).length * 19 + 14} x2={px + pw - 22} y2={py + 206 + wrapText(cur.detail, 46).length * 19 + 14} stroke={p.blueprint} strokeWidth={1} />
              <text
                x={px + 22}
                y={py + 206 + wrapText(cur.detail, 46).length * 19 + 38}
                fill={gold ? p.wonderHi : p.soft}
                style={{ fontSize: 10, letterSpacing: "0.18em" }}
              >
                {gold ? "▸ ALTERNATIVE FORMING" : "ALTERNATIVE"}
              </text>
              {wrapText(cur.alt, 46).map((line, k) => (
                <text
                  key={`alt-${k}`}
                  x={px + 22}
                  y={py + 206 + wrapText(cur.detail, 46).length * 19 + 58 + k * 19}
                  fill={gold ? mixHex(p.wonderHi, p.muted, 0.25) : p.soft}
                  style={{ fontSize: 12.5, fontFamily: "var(--font-serif), serif" }}
                >
                  {line}
                </text>
              ))}
            </g>
          )
        })()}
      </svg>

      {/* sovereign ⟷ dependent meter for the focused vertebra */}
      <div className="mt-2 px-1">
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: rgba(p.glowRGB, 0.16) }} aria-hidden>
          <div
            style={{
              width: `${lerp(0, 100, clamp01(cur.usDep / 100))}%`,
              marginLeft: `${100 - clamp01(cur.usDep / 100) * 100}%`,
              height: "100%",
              background: cur.resistance ? p.wonder : p.squeeze,
              transition: reduced ? "none" : "all 520ms ease-out",
            }}
          />
        </div>

        <p className="mt-3 text-[15px]" style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}>
          <span style={{ color: p.wonderHi, fontStyle: "normal", fontWeight: 700 }}>Paying for dependence, calling it autonomy</span>{" "}
          — but, vertebra by vertebra, a spine of resistance is finally setting.
        </p>
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
