"use client"

/**
 * V13 — THE KILL-SWITCH, TIGHTENING  (Chapter 4, "The Chokepoint We Spent").
 *
 * Europe owns the EUV machine; Washington owns the dial — and the dial only
 * turns one way. The reader scrubs (or presses ▶) a horizontal timeline of the
 * tightening US-led export-control regime on ASML. Each stop snaps a RED tether
 * tighter around the machine and cuts ASML's China revenue further:
 *
 *   2019      EUV exports to China banned
 *   2023      advanced DUV restricted
 *   Jan 2025  Netherlands tiered controls
 *   Dec 2025  "Pax Silica" multilateral alliance (EU joins Jun 2026)
 *   Jun 2026  NL extends to servicing + spare parts
 *   Apr 2026  proposed US MATCH Act — ban ALL DUV + servicing to China
 *
 * A linked readout shows ASML's China revenue falling along the way: ~49% of
 * sales (2024) → 36% (Q4 2025) → ~20% (2026). A mono counter of the cumulative
 * "China revenue cut" climbs as the locks close.
 *
 * REVEAL: the machine is Europe's; the off-switch is Washington's — and it has
 * only ever moved in one direction.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the ▶ loop is gated; reduced → the meaningful end-state stands
 * in), keyboard-reachable (native range input + play button), and meaningful at
 * its default (the full regime already run).
 *
 * Figures hard-coded. Sources: US BIS / Export Administration Regulations;
 * Netherlands export controls (2025–26); "Pax Silica" (Dec 2025); proposed US
 * MATCH Act (Apr 2026); ASML filings.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  linScale,
  clamp,
  clamp01,
  lerp,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

// The baseline ASML China revenue share before the dial ever turned.
const BASELINE = 49 // % of sales, 2024

type Stop = {
  date: string
  title: string
  detail: string
  china: number // ASML China revenue share (% of sales) at/after this stop
}

// Each stop snaps the tether tighter and cuts China revenue further. `china`
// is the China share of ASML sales that survives the control at that stop.
const STOPS: Stop[] = [
  { date: "2019", title: "EUV export ban", detail: "EUV to China banned (BIS)", china: 49 },
  { date: "2023", title: "Advanced DUV restricted", detail: "top DUV scanners licensed", china: 49 },
  { date: "Jan 2025", title: "NL tiered controls", detail: "Netherlands national regime", china: 41 },
  { date: "Dec 2025", title: "“Pax Silica” alliance", detail: "multilateral · EU joins Jun 2026", china: 36 },
  { date: "Jun 2026", title: "NL: servicing + parts", detail: "spare parts + service licensed", china: 28 },
  { date: "Apr 2026", title: "MATCH Act (proposed)", detail: "ban ALL DUV + servicing", china: 20 },
]
const N = STOPS.length - 1

// Machine geometry — the EUV scanner sits centre-stage, ringed by the tether.
const MX = 460
const MY = 250
const MW = 196
const MH = 116

// Plot frame (viewBox units).
const W = 920
const H = 560

// The tether is drawn as a closed loop of links around the machine; tightness
// pulls the loop inward and reddens it. radius shrinks as the dial turns.
const RING_OUT = 178
const RING_IN = 96

const pctFmt = (v: number) => `${Math.round(v)}%`

export function KillSwitchTimeline() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // step ∈ [0, N] — how far the regime has tightened. Default: fully run.
  const [step, setStep] = useState(N)
  const [playing, setPlaying] = useState(false)

  // ▶ — mechanical advance, one stop per tick. Off under reduced motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= N) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => clamp(s + 1, 0, N)), 1000)
    return () => window.clearTimeout(id)
  }, [playing, reduced, step])

  const cur = STOPS[step]
  // Tightness 0 (first stop) → 1 (MATCH Act). Drives every red mechanism.
  const tight = clamp01(step / N)
  const cut = BASELINE - cur.china // cumulative China-revenue cut, pts

  function play() {
    if (reduced) {
      setStep(N)
      return
    }
    if (step >= N) setStep(0)
    setPlaying(true)
  }

  // Timeline track geometry (the scrubber drawn in-SVG).
  const trackX0 = 60
  const trackX1 = W - 60
  const trackY = 92
  const tx = linScale(0, N, trackX0, trackX1)

  // Tether ring: collapses inward + reddens as the dial turns one way.
  const ringR = lerp(RING_OUT, RING_IN, tight)
  const ringColor = mixHex(p.leverage, p.squeeze, tight)
  const ringW = lerp(1.6, 4.4, tight)
  // Machine desaturates toward the foreign-veto state as control tightens.
  const grey = mode === "dark" ? "#5a6478" : "#8a93a4"
  const machineStroke = mixHex(p.wonderHi, grey, tight * 0.8)
  const machineFillA = lerp(0.16, 0.05, tight)

  // Lock glyphs spaced round the ring — they snap shut as tightness climbs.
  const LOCKS = 6
  const locked = Math.round(tight * LOCKS)

  const verdict =
    step <= 1
      ? { word: "ONE TURN", color: p.leverage, line: "the dial has begun to close, and it only turns one way" }
      : step <= 3
        ? { word: "TIGHTENING", color: p.squeezeHi, line: "each stop snaps the tether tighter, never looser" }
        : { word: "OFF-SWITCH", color: p.squeeze, line: "the machine is Europe's; the off-switch is Washington's" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V13 · The Kill-Switch, Tightening"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {cur.date} · {verdict.word}
        </span>
      }
      caption={
        <>
          Europe builds the EUV machine; Washington owns the dial. Scrub the timeline, or press ▶, from{" "}
          <span style={{ color: p.leverage }}>2019</span> to the proposed{" "}
          <span style={{ color: p.squeeze }}>MATCH Act</span>, and watch the{" "}
          <span style={{ color: p.squeeze }}>tether tighten</span> while ASML&rsquo;s{" "}
          <span style={{ color: p.squeeze }}>China revenue</span> falls 49% → 36% → ~20%. The dial only turns
          one way. Sources: US BIS / Export Administration Regulations; Netherlands export controls (2025–26);
          &ldquo;Pax Silica&rdquo; (Dec 2025); proposed US MATCH Act (Apr 2026); ASML filings.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Kill-switch timeline: by ${cur.date} (${cur.title}), the US-led export-control tether has tightened around ASML's EUV machine and cut China revenue from 49% to ${pctFmt(
          cur.china,
        )} of sales, a ${pctFmt(cut)}-point cut. The off-switch only moves one direction.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="ks-veto" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={lerp(0, 0.34, tight)} />
            <stop offset="70%" stopColor={p.squeeze} stopOpacity={lerp(0, 0.1, tight)} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
          <marker id="ks-head" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.squeeze} />
          </marker>
        </defs>

        {/* THE READOUT — China revenue share + cumulative cut */}
        <text x={60} y={150} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          ASML China revenue · {cur.date}
        </text>
        <text x={57} y={206} fill={ringColor} style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {pctFmt(cur.china)}
        </text>
        <text x={60} y={232} fill={p.muted} style={{ fontSize: 13 }}>
          of sales · was {BASELINE}% in 2024
        </text>

        <text
          x={W - 60}
          y={150}
          textAnchor="end"
          fill={p.soft}
          style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          China revenue cut · cumulative
        </text>
        <text
          x={W - 57}
          y={206}
          textAnchor="end"
          fill={p.squeeze}
          style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.01em" }}
        >
          −{Math.round(cut)} pts
        </text>
        <text x={W - 60} y={232} textAnchor="end" fill={p.muted} style={{ fontSize: 13 }}>
          {cur.title}
        </text>

        {/* THE MACHINE — EUV scanner, ringed by the tightening tether */}
        <circle cx={MX} cy={MY} r={ringR + 36} fill="url(#ks-veto)" />

        {/* tether ring — a dashed loop that collapses inward + reddens */}
        <circle
          cx={MX}
          cy={MY}
          r={ringR}
          fill="none"
          stroke={ringColor}
          strokeWidth={ringW}
          strokeOpacity={lerp(0.4, 0.95, tight)}
          strokeDasharray={`${lerp(14, 5, tight)} ${lerp(10, 5, tight)}`}
        />

        {/* lock glyphs around the ring — snap shut one by one as the dial turns */}
        {Array.from({ length: LOCKS }, (_, i) => {
          const ang = (i / LOCKS) * Math.PI * 2 - Math.PI / 2
          const lx = MX + Math.cos(ang) * ringR
          const ly = MY + Math.sin(ang) * ringR
          const shut = i < locked
          const c = shut ? p.squeeze : mixHex(p.leverage, p.squeeze, tight * 0.5)
          return (
            <g key={`lock-${i}`}>
              <rect
                x={lx - 6}
                y={ly - 4}
                width={12}
                height={10}
                rx={2}
                fill={shut ? rgba(p.glowRGB, 0.22) : "none"}
                stroke={c}
                strokeWidth={shut ? 1.8 : 1.2}
              />
              {/* shackle: open (up) when slack, closed (down into body) when shut */}
              <path
                d={
                  shut
                    ? `M ${lx - 3.5} ${ly - 4} v -3 a 3.5 3.5 0 0 1 7 0 v 3`
                    : `M ${lx - 3.5} ${ly - 4} v -3 a 3.5 3.5 0 0 1 7 0 v 1`
                }
                fill="none"
                stroke={c}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            </g>
          )
        })}

        {/* the scanner body */}
        <rect
          x={MX - MW / 2}
          y={MY - MH / 2}
          width={MW}
          height={MH}
          rx={10}
          fill={mixHex(p.wonder, grey, tight * 0.8)}
          fillOpacity={machineFillA}
          stroke={machineStroke}
          strokeWidth={2.4}
        />
        <rect
          x={MX - MW / 2 + 8}
          y={MY - MH / 2 + 8}
          width={MW - 16}
          height={MH - 16}
          rx={6}
          fill="none"
          stroke={p.blueprint}
          strokeWidth={1}
        />
        <text
          x={MX}
          y={MY - 6}
          textAnchor="middle"
          fill={mixHex(p.wonderHi, grey, tight * 0.85)}
          style={{ fontSize: 23, fontWeight: 800, letterSpacing: "0.04em" }}
        >
          EUV
        </text>
        <text
          x={MX}
          y={MY + 16}
          textAnchor="middle"
          fill={p.soft}
          style={{ fontSize: 10, letterSpacing: "0.18em" }}
        >
          ASML · VELDHOVEN
        </text>

        {/* WASHINGTON — the dial, with a one-way arrow into the tether */}
        <g>
          <circle cx={MX} cy={MY - ringR - 30} r={5} fill={p.squeeze} />
          <text
            x={MX}
            y={MY - ringR - 42}
            textAnchor="middle"
            fill={p.squeezeHi}
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}
          >
            WASHINGTON · THE DIAL
          </text>
          <line
            x1={MX}
            y1={MY - ringR - 24}
            x2={MX}
            y2={MY - ringR - ringW - 4}
            stroke={p.squeeze}
            strokeWidth={lerp(1.4, 2.8, tight)}
            markerEnd="url(#ks-head)"
          />
          <text
            x={MX + 14}
            y={MY - ringR - 14}
            textAnchor="start"
            fill={p.soft}
            style={{ fontSize: 9.5, letterSpacing: "0.04em" }}
          >
            turns one way ↻
          </text>
        </g>

        {/* TIMELINE — scrub track + the six control stops */}
        <line x1={trackX0} y1={trackY} x2={trackX1} y2={trackY} stroke={p.hair} strokeWidth={2} />
        <line x1={trackX0} y1={trackY} x2={tx(step)} y2={trackY} stroke={p.squeeze} strokeWidth={2.4} />
        {STOPS.map((s, i) => {
          const on = i <= step
          const here = i === step
          return (
            <g key={`stop-${i}`}>
              <circle
                cx={tx(i)}
                cy={trackY}
                r={here ? 6 : 3.6}
                fill={on ? p.squeeze : p.bg}
                stroke={on ? p.squeezeHi : p.soft}
                strokeWidth={1.6}
              />
              <text
                x={tx(i)}
                y={trackY - 14}
                textAnchor="middle"
                fill={here ? p.squeezeHi : on ? p.muted : p.soft}
                style={{ fontSize: 12, fontWeight: here ? 700 : 400 }}
              >
                {s.date}
              </text>
              {here && (
                <text
                  x={tx(i)}
                  y={trackY + 22}
                  textAnchor={i === 0 ? "start" : i === N ? "end" : "middle"}
                  fill={p.squeezeHi}
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {s.detail}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* meter + verdict + scrubber */}
      <div className="mt-2 px-1">
        {/* China revenue surviving ⟷ cut-away meter */}
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: rgba(p.glowRGB, 0.18) }}
          aria-hidden
        >
          <div
            style={{
              width: `${clamp01(cur.china / BASELINE) * 100}%`,
              height: "100%",
              background: ringColor,
              transition: reduced ? "none" : "width 560ms ease-out",
            }}
          />
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* scrubber + play — the reader turns the dial */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the tightening" : "Play the tightening regime, 2019 to the MATCH Act"}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "5px 11px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: p.squeezeHi,
              border: `1px solid ${p.squeeze}`,
              background: "transparent",
            }}
          >
            {playing ? "❙❙ pause" : "▶ play"}
          </button>
          <input
            type="range"
            min={0}
            max={N}
            value={step}
            onChange={(e) => {
              setPlaying(false)
              setStep(clamp(Number(e.target.value), 0, N))
            }}
            aria-label="Scrub the export-control timeline from 2019 to the proposed MATCH Act"
            aria-valuetext={`${cur.date}: ${cur.title}, ASML China revenue ${pctFmt(cur.china)}, a ${pctFmt(
              cut,
            )}-point cut`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.squeeze, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: p.soft,
              fontSize: 11,
              whiteSpace: "nowrap",
            }}
          >
            {step + 1}/{N + 1} stops
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
