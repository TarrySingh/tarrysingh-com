"use client"

/**
 * V12 — THE EXIT-VALUE SCISSORS  (Chapter 3, "The Standing Order: How Europe
 * Funds Its Own Defeat").
 *
 * A scissors has two blades and one pivot. Here the pivot is a single European
 * champion; one blade is the value CREATED in Europe — the talent, the IP, the
 * company itself (blueprint cyan, opening left); the other is the value
 * CAPTURED in the US — the listing, the ownership, the compounding equity
 * (reserved red, opening right). The reader clicks or arrows through a gallery
 * of dated cases, and the blades open wider with each: Europe runs the
 * finishing school; America keeps the graduates' equity.
 *
 * Each card names the country the value was BUILT IN, the US venue that now
 * CAPTURES it, and the dated event. The kicker case is the Norwegian sovereign
 * wealth fund — oil money built on the Norwegian shelf, recycled into US tech
 * as a major (not top-five) holder of Apple (~$49bn) and Microsoft (~$42bn),
 * about 1.3% of each.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native tablist buttons + ←/→/Home/End on the group), reduced-
 * motion safe (the blade angle settles to its static end-state; only the user's
 * selection moves it), role="img" with a spoken aria-label, and meaningful at
 * its default (Klarna) as the static fallback.
 *
 * Figures hard-coded from company filings/announcements and NBIM holdings.
 * Sources: Klarna NYSE listing (Sept 2025); Wise Nasdaq primary listing (May
 * 2026, LSE secondary kept); ARM Nasdaq IPO / SoftBank-owned; DeepMind owned by
 * Google; Adyen/Mollie (NL) US capital + listings; NBIM holdings 2026.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp,
  lerp,
  easeInOut,
} from "./read-chart-kit"
import { cpPalette } from "./chokepoint-kit"

type Case = {
  key: string
  name: string
  /** where the value was created */
  builtIn: string
  builtFlag: string
  /** the European thing that was built */
  createdLabel: string
  /** the US capture + venue */
  capturedLabel: string
  capturedVenue: string
  /** the dated event */
  date: string
  /** 0..1 — how wide the scissors open (later / larger capture → wider) */
  open: number
  /** the big mono readout for the capture */
  stat: string
  statSub: string
  gloss: string
}

// Each case: built in Europe (cyan blade) vs captured in the US (red blade),
// with a dated, verifiable event. `open` rises across the gallery — the blades
// spread as the capture compounds.
const CASES: Case[] = [
  {
    key: "klarna",
    name: "Klarna",
    builtIn: "Sweden",
    builtFlag: "SE",
    createdLabel: "Built in Stockholm",
    capturedLabel: "Listed on the NYSE",
    capturedVenue: "NYSE · New York",
    date: "Sept 2025",
    open: 0.42,
    stat: "NYSE",
    statSub: "IPO · Sept 2025",
    gloss:
      "Europe's fintech standard-bearer rang the bell in New York, not Stockholm — the equity now compounds on a US exchange.",
  },
  {
    key: "wise",
    name: "Wise",
    builtIn: "United Kingdom",
    builtFlag: "UK",
    createdLabel: "Built in London",
    capturedLabel: "Primary listing → Nasdaq",
    capturedVenue: "Nasdaq · New York",
    date: "May 2026",
    open: 0.5,
    stat: "Nasdaq",
    statSub: "primary listing · May 2026",
    gloss:
      "London kept only a secondary listing; the primary venue — and the index inclusion that follows — moved to New York.",
  },
  {
    key: "arm",
    name: "ARM",
    builtIn: "United Kingdom",
    builtFlag: "UK",
    createdLabel: "Built in Cambridge",
    capturedLabel: "Nasdaq · SoftBank-owned",
    capturedVenue: "Nasdaq · New York",
    date: "IPO 2023",
    open: 0.62,
    stat: "Nasdaq",
    statSub: "SoftBank-controlled",
    gloss:
      "The instruction set inside nearly every phone is British by design, foreign by ownership, American by listing.",
  },
  {
    key: "deepmind",
    name: "DeepMind",
    builtIn: "United Kingdom",
    builtFlag: "UK",
    createdLabel: "Built in London",
    capturedLabel: "Owned by Google",
    capturedVenue: "Alphabet · California",
    date: "Acquired 2014",
    open: 0.74,
    stat: "Google",
    statSub: "wholly owned",
    gloss:
      "Britain's crown-jewel AI lab is a wholly-owned arm of a Californian company — the frontier research, the patents, the upside, all captured.",
  },
  {
    key: "adyen",
    name: "Adyen / Mollie",
    builtIn: "Netherlands",
    builtFlag: "NL",
    createdLabel: "Built in Amsterdam",
    capturedLabel: "US capital · US exits",
    capturedVenue: "US growth funds",
    date: "Scale-up era",
    open: 0.82,
    stat: "US$",
    statSub: "growth capital + exits",
    gloss:
      "Dutch payments champions scaled on US growth capital and toward US liquidity — the cap table tilts west long before the IPO bell.",
  },
  {
    key: "nbim",
    name: "Norway's oil fund",
    builtIn: "Norway",
    builtFlag: "NO",
    createdLabel: "Built on Norwegian oil",
    capturedLabel: "Recycled into US tech",
    capturedVenue: "NBIM holdings · 2026",
    date: "NBIM 2026",
    open: 1,
    stat: "~$91bn",
    statSub: "Apple ~$49bn · Microsoft ~$42bn",
    gloss:
      "The sovereign wealth Norway pumped from its own shelf is now a major (not top-five) holder of Apple and Microsoft — about 1.3% of each. The fund built on European oil compounds American equity.",
  },
]

// ---- plot frame (viewBox units) -------------------------------------------
const W = 920
const H = 420
const PIVOT_X = W / 2
const PIVOT_Y = 300 // the scissors hinge sits low; blades open upward
const BLADE_LEN = 300
const HANDLE_LEN = 70

// blade half-angles (radians) at fully-closed vs fully-open
const ANG_MIN = 0.1 // nearly shut
const ANG_MAX = 0.62 // spread wide

function tip(angle: number, len: number): [number, number] {
  // angle measured from straight-up, blades open symmetrically
  return [PIVOT_X + Math.sin(angle) * len, PIVOT_Y - Math.cos(angle) * len]
}
function handle(angle: number, len: number): [number, number] {
  // handles trail below the pivot, mirrored
  return [PIVOT_X - Math.sin(angle) * len, PIVOT_Y + Math.cos(angle) * len]
}

export function ExitValueScissors() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  const [i, setI] = useState(0)
  const c = CASES[i]

  // Animate the blade opening toward the target `open` (eased), unless reduced.
  // The mount starts nearly shut and eases open; on reduced motion we settle to
  // the static end-state immediately.
  const animRef = useRef(0)
  const [anim, setAnim] = useState(0)
  useEffect(() => {
    if (reduced) {
      animRef.current = c.open
      setAnim(c.open)
      return
    }
    let raf = 0
    const start = performance.now()
    const from = animRef.current
    const to = c.open
    const dur = 620
    const step = (now: number) => {
      const t = clamp((now - start) / dur, 0, 1)
      const v = lerp(from, to, easeInOut(t))
      animRef.current = v
      setAnim(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, reduced])

  const openT = reduced ? c.open : anim
  const angle = lerp(ANG_MIN, ANG_MAX, openT)

  // LEFT blade = value created in Europe (cyan); RIGHT = captured in US (red).
  const [lTipX, lTipY] = tip(-angle, BLADE_LEN)
  const [rTipX, rTipY] = tip(angle, BLADE_LEN)
  const [lHx, lHy] = handle(-angle, HANDLE_LEN)
  const [rHx, rHy] = handle(angle, HANDLE_LEN)

  // ←/→ steps; Home/End jump to the ends.
  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      setI((v) => clamp(v + 1, 0, CASES.length - 1))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      setI((v) => clamp(v - 1, 0, CASES.length - 1))
    } else if (e.key === "Home") {
      e.preventDefault()
      setI(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setI(CASES.length - 1)
    }
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V12 · The Exit-Value Scissors"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: p.squeezeHi }}
        >
          {i + 1}/{CASES.length} · {c.date}
        </span>
      }
      caption={
        <>
          Two blades, one hinge: the value{" "}
          <span style={{ color: p.leverage }}>created in Europe</span> — the talent, the IP, the company —
          versus the value <span style={{ color: p.squeeze }}>captured in the US</span> — the listing, the
          ownership, the compounding equity. Click — or use ←/→ — through the champions; the scissors open
          wider each time. Europe runs the finishing school; America keeps the graduates&rsquo; equity.
          Sources: Klarna NYSE 2025; Wise Nasdaq 2026; ARM/SoftBank; DeepMind/Google; NBIM holdings 2026.
        </>
      }
    >
      {/* selector — a native tablist, keyboard-reachable */}
      <div
        role="tablist"
        aria-label="Choose a European champion captured by US ownership"
        onKeyDown={onKey}
        className="mb-3 flex flex-wrap gap-1.5 px-1"
      >
        {CASES.map((cs, idx) => {
          const active = idx === i
          return (
            <button
              key={cs.key}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setI(idx)}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 7,
                cursor: "pointer",
                whiteSpace: "nowrap",
                color: active ? p.bg : p.muted,
                border: `1px solid ${active ? p.squeeze : p.hair}`,
                background: active ? p.squeeze : "transparent",
                fontWeight: active ? 700 : 400,
              }}
            >
              {cs.name}
            </button>
          )
        })}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${c.name}: ${c.createdLabel} in ${c.builtIn}, ${c.capturedLabel} (${c.capturedVenue}), ${c.date}. The exit-value scissors open wider as the US capture compounds.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="evs-left" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={p.leverage} stopOpacity={0.55} />
            <stop offset="100%" stopColor={p.leverageHi} stopOpacity={0.95} />
          </linearGradient>
          <linearGradient id="evs-right" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={p.squeeze} stopOpacity={0.55} />
            <stop offset="100%" stopColor={p.squeezeHi} stopOpacity={0.95} />
          </linearGradient>
          <radialGradient id="evs-pivot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={0.5} />
            <stop offset="70%" stopColor={p.wonder} stopOpacity={0.12} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* schematic hairline: the closed-scissors baseline + spread arc */}
        <line
          x1={PIVOT_X}
          y1={PIVOT_Y}
          x2={PIVOT_X}
          y2={PIVOT_Y - BLADE_LEN - 8}
          stroke={p.blueprint}
          strokeWidth={1}
          strokeDasharray="2 6"
        />
        <path
          d={`M ${lTipX} ${lTipY} A ${BLADE_LEN} ${BLADE_LEN} 0 0 1 ${rTipX} ${rTipY}`}
          fill="none"
          stroke={p.blueprint}
          strokeWidth={1}
        />

        {/* ---- LEFT BLADE — value CREATED in Europe (cyan) ---- */}
        <g>
          <line
            x1={lHx}
            y1={lHy}
            x2={lTipX}
            y2={lTipY}
            stroke="url(#evs-left)"
            strokeWidth={9}
            strokeLinecap="round"
          />
          {/* handle loop */}
          <circle cx={lHx} cy={lHy} r={13} fill="none" stroke={p.leverage} strokeWidth={5} />
          {/* tip node */}
          <circle cx={lTipX} cy={lTipY} r={7} fill={p.leverageHi} stroke={p.bg} strokeWidth={2} />
          <text
            x={lTipX - 12}
            y={lTipY - 14}
            textAnchor="end"
            fill={p.leverage}
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em" }}
          >
            BUILT IN EUROPE
          </text>
          <text
            x={lTipX - 12}
            y={lTipY + 6}
            textAnchor="end"
            fill={p.leverageHi}
            style={{ fontSize: 22, fontWeight: 800 }}
          >
            {c.builtIn}
          </text>
          <text
            x={lTipX - 12}
            y={lTipY + 26}
            textAnchor="end"
            fill={p.muted}
            style={{ fontSize: 12.5 }}
          >
            {c.createdLabel}
          </text>
        </g>

        {/* ---- RIGHT BLADE — value CAPTURED in the US (red) ---- */}
        <g>
          <line
            x1={rHx}
            y1={rHy}
            x2={rTipX}
            y2={rTipY}
            stroke="url(#evs-right)"
            strokeWidth={9}
            strokeLinecap="round"
          />
          <circle cx={rHx} cy={rHy} r={13} fill="none" stroke={p.squeeze} strokeWidth={5} />
          <circle cx={rTipX} cy={rTipY} r={7} fill={p.squeezeHi} stroke={p.bg} strokeWidth={2} />
          <text
            x={rTipX + 12}
            y={rTipY - 14}
            textAnchor="start"
            fill={p.squeeze}
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em" }}
          >
            CAPTURED IN THE US
          </text>
          <text
            x={rTipX + 12}
            y={rTipY + 6}
            textAnchor="start"
            fill={p.squeezeHi}
            style={{ fontSize: 22, fontWeight: 800 }}
          >
            {c.stat}
          </text>
          <text
            x={rTipX + 12}
            y={rTipY + 26}
            textAnchor="start"
            fill={p.muted}
            style={{ fontSize: 12.5 }}
          >
            {c.statSub}
          </text>
        </g>

        {/* ---- THE PIVOT — the champion at the hinge ---- */}
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={56} fill="url(#evs-pivot-glow)" />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={9} fill={p.wonder} stroke={p.bg} strokeWidth={2} />
        <text
          x={PIVOT_X}
          y={PIVOT_Y + 40}
          textAnchor="middle"
          fill={p.ink}
          style={{ fontSize: 19, fontWeight: 800 }}
        >
          {c.name}
        </text>
        <text
          x={PIVOT_X}
          y={PIVOT_Y + 60}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          {c.capturedVenue} · {c.date}
        </text>

        {/* the spread, named in mono above the open blades */}
        <text
          x={PIVOT_X}
          y={20}
          textAnchor="middle"
          fill={p.squeeze}
          style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}
        >
          THE EXIT-VALUE SPREAD — CREATED ◂ EUROPE · US ▸ CAPTURED
        </text>
      </svg>

      {/* progress strip (the scissors open wider across the gallery) + verdict */}
      <div className="mt-2 px-1">
        <div className="flex items-end gap-2" aria-hidden>
          {CASES.map((cs, idx) => {
            const active = idx === i
            return (
              <div key={cs.key} className="flex-1">
                <div
                  style={{
                    height: 6 + cs.open * 28,
                    borderRadius: 2,
                    background: active ? p.squeeze : p.hair,
                    border: `1px solid ${active ? p.squeeze : "transparent"}`,
                    transition: "background 200ms ease-out",
                  }}
                />
              </div>
            )
          })}
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: p.squeeze, fontStyle: "normal", fontWeight: 700 }}>{c.builtFlag} → US</span>{" "}
          — {c.gloss}
        </p>
      </div>
    </PlateFrame>
  )
}
