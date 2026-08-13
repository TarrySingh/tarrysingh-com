"use client"

/**
 * V2 — THE AMERICAN LEASH  (closes the Prologue; pairs with V1's ASML node).
 *
 * An exploded, schematic EUV scanner: labelled subsystem blocks wired into the
 * frame. The US-origin subsystems glow in the reserved kill-switch RED (Cymer
 * light source = 100% US; plus the US-controlled software / metrology / optics
 * share of the bill of materials); the European and other parts sit in blueprint
 * cyan. A "jurisdiction tether" — a taut blueprint line — runs from SAN DIEGO
 * (Cymer / US export-control authority) to VELDHOVEN (ASML).
 *
 * The single control raises the *US-origin content of the machine (%)*. Push it
 * past the US Foreign Direct Product Rule control threshold — the level at which
 * extraterritorial re-export jurisdiction attaches — and the legal LEASH SNAPS
 * TAUT: the whole machine desaturates to the grey "veto" state. The reveal:
 * the machine is Europe's, the off-switch is Washington's.
 *
 * Theme-aware (re-renders on the Read-mode flip), reduced-motion safe (the only
 * motion is the user's own slider; reduced motion renders the meaningful state),
 * keyboard-reachable (native range input). Renders meaningfully at its default
 * value — already past the threshold — as the static fallback.
 *
 * Data: ASML/Cymer bill-of-materials (Cymer light source 100% US-origin); the
 * US Foreign Direct Product Rule (extraterritorial re-export control); the
 * US-led multilateral "Pax Silica" export-control alliance (launched Dec 2025;
 * EU joined Jun 2026) plus the Dutch service / spare-parts licensing rule (Jun 2026).
 */

import { useRef, useState } from "react"

import { PlateFrame, useReadMode, clamp, clamp01, lerp } from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

// The Foreign Direct Product Rule attaches once US-origin content (and US tech
// embedded in the design) crosses this de-minimis-style control threshold.
const FDPR_THRESHOLD = 25

type Block = {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub: string
  us: boolean // US-origin → glows red, and is what the leash governs
}

// Exploded scanner, laid out as a schematic. `us:true` blocks are the
// US-jurisdiction parts (Cymer source + the US-controlled software/optics/
// metrology share of the BoM); the rest are European / other.
const BLOCKS: Block[] = [
  { x: 40, y: 196, w: 150, h: 96, label: "CYMER SOURCE", sub: "100% US-origin", us: true },
  { x: 214, y: 150, w: 132, h: 78, label: "COLLECTOR", sub: "tin-plasma optics", us: false },
  { x: 214, y: 252, w: 132, h: 78, label: "ILLUMINATOR", sub: "beam shaping", us: false },
  { x: 372, y: 92, w: 138, h: 76, label: "ZEISS OPTICS", sub: "DE single source", us: false },
  { x: 372, y: 196, w: 138, h: 96, label: "PROJECTION", sub: "mirror column", us: false },
  { x: 372, y: 320, w: 138, h: 76, label: "METROLOGY", sub: "US-controlled SW", us: true },
  { x: 536, y: 150, w: 132, h: 78, label: "RETICLE STAGE", sub: "EUV mask handling", us: false },
  { x: 536, y: 252, w: 132, h: 78, label: "WAFER STAGE", sub: "nm positioning", us: false },
  { x: 694, y: 196, w: 150, h: 96, label: "CONTROL SW", sub: "US export-licensed", us: true },
]

// Schematic backbone the blocks wire into (drawn faintly under everything).
const BUS: Array<[number, number, number, number]> = [
  [190, 244, 214, 244],
  [346, 189, 372, 189],
  [346, 291, 372, 291],
  [441, 168, 441, 196],
  [441, 292, 441, 320],
  [510, 244, 536, 244],
  [668, 244, 694, 244],
]

function fmtVerdict(over: boolean) {
  return over
    ? { word: "LEASH TAUT", line: "Washington holds the off-switch to Europe's crown jewel" }
    : { word: "SLACK", line: "below the rule, the machine answers to Veldhoven alone" }
}

export function AmericanLeash() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  // Default already past the threshold: the real machine is veto-exposed today.
  const [pct, setPct] = useState(38)

  const over = pct >= FDPR_THRESHOLD
  // How far past the threshold (0 at the line → 1 fully governed).
  const t = clamp01((pct - FDPR_THRESHOLD) / (70 - FDPR_THRESHOLD))
  // Tether tension: slack sag below the rule, dead-straight + thick above it.
  const tension = over ? 0.18 + 0.82 * t : clamp01(pct / FDPR_THRESHOLD) * 0.55
  // Veto desaturation: european/cyan parts grey out as Washington takes control.
  const veto = over ? 0.35 + 0.65 * t : 0
  const grey = mode === "dark" ? "#5a6478" : "#8a93a4"

  const verdict = fmtVerdict(over)
  const verdictColor = over ? p.squeeze : p.leverage

  // San Diego ↔ Veldhoven anchor points for the jurisdiction tether.
  const SD: [number, number] = [70, 462]
  const VH: [number, number] = [814, 462]
  const sag = lerp(74, 2, tension) // cable sag in px — collapses as it goes taut
  const midX = (SD[0] + VH[0]) / 2
  const midY = Math.max(SD[1], VH[1]) + sag
  const tetherPath = `M ${SD[0]} ${SD[1]} Q ${midX} ${midY} ${VH[0]} ${VH[1]}`
  const tetherW = lerp(1.4, 3.6, tension)
  const tetherColor = mixHex(p.leverage, p.squeeze, tension)

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V2 · The American Leash"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdictColor }}
        >
          {pct}% US · {verdict.word}
        </span>
      }
      caption={
        <>
          Europe builds the EUV machine; raise its{" "}
          <span style={{ color: p.squeeze }}>US-origin content</span> past the{" "}
          <span style={{ color: p.squeeze }}>Foreign Direct Product Rule</span> threshold and the
          jurisdiction tether from San Diego snaps taut, the machine greys to a{" "}
          <span style={{ color: p.squeeze }}>foreign veto</span>. Sources: ASML/Cymer
          bill-of-materials (Cymer light source 100% US-origin); US Foreign Direct Product Rule;
          the US-led &ldquo;Pax Silica&rdquo; alliance (Dec 2025, EU joined Jun 2026).
        </>
      }
    >
      <svg
        viewBox="0 0 884 520"
        role="img"
        aria-label="An exploded EUV machine: US-origin subsystems glow red while a jurisdiction tether from San Diego to Veldhoven snaps taut, greying the machine to a foreign-veto state as US-origin content crosses the export-control threshold"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <marker id="al-head" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.squeeze} />
          </marker>
        </defs>

        {/* schematic backbone */}
        {BUS.map(([x1, y1, x2, y2], i) => (
          <line
            key={`bus-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={mixHex(p.leverage, grey, veto)}
            strokeWidth={1.2}
            strokeOpacity={lerp(0.5, 0.25, veto)}
          />
        ))}

        {/* subsystem blocks */}
        {BLOCKS.map((b, i) => {
          // European parts desaturate to grey under veto; US parts hold red.
          const base = b.us ? p.squeeze : p.leverage
          const stroke = b.us ? p.squeeze : mixHex(p.leverage, grey, veto)
          const fillC = b.us ? p.squeeze : mixHex(p.leverage, grey, veto)
          const labelC = b.us ? p.squeezeHi : mixHex(p.leverageHi, grey, veto)
          // US blocks pulse brighter as the leash tightens; others dim.
          const fillA = b.us ? lerp(0.1, 0.24, over ? t : 0) + 0.08 : lerp(0.14, 0.06, veto)
          return (
            <g key={`blk-${i}`}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={6}
                fill={fillC}
                fillOpacity={fillA}
                stroke={stroke}
                strokeWidth={b.us ? lerp(1.6, 2.6, over ? t : 0) : 1.3}
              />
              {b.us && (
                <rect
                  x={b.x + 4}
                  y={b.y + 4}
                  width={b.w - 8}
                  height={b.h - 8}
                  rx={4}
                  fill="none"
                  stroke={base}
                  strokeWidth={0.8}
                  strokeOpacity={0.45}
                />
              )}
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h / 2 - 3}
                textAnchor="middle"
                fill={labelC}
                style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em" }}
              >
                {b.label}
              </text>
              <text
                x={b.x + b.w / 2}
                y={b.y + b.h / 2 + 14}
                textAnchor="middle"
                fill={b.us ? rgba(p.glowRGB, lerp(0.7, 0.95, over ? t : 0)) : p.soft}
                style={{ fontSize: 11 }}
              >
                {b.sub}
              </text>
            </g>
          )
        })}

        {/* veto plate — a faint red wash falls over the whole machine when taut */}
        {over && (
          <rect
            x={28}
            y={80}
            width={828}
            height={328}
            rx={10}
            fill={rgba(p.glowRGB, lerp(0, 0.07, t))}
            stroke={p.squeeze}
            strokeOpacity={lerp(0, 0.5, t)}
            strokeDasharray="6 5"
            strokeWidth={1.2}
          />
        )}

        {/* jurisdiction anchors */}
        <g>
          <circle cx={SD[0]} cy={SD[1]} r={6} fill={p.squeeze} />
          <text x={SD[0] - 2} y={SD[1] + 26} textAnchor="start" fill={p.squeezeHi} style={{ fontSize: 13, fontWeight: 700 }}>
            SAN DIEGO
          </text>
          <text x={SD[0] - 2} y={SD[1] + 42} textAnchor="start" fill={p.muted} style={{ fontSize: 11.5 }}>
            Cymer · US export authority
          </text>
        </g>
        <g>
          <circle cx={VH[0]} cy={VH[1]} r={6} fill={over ? p.squeeze : p.leverage} />
          <text x={VH[0] + 2} y={VH[1] + 26} textAnchor="end" fill={over ? p.squeezeHi : p.leverageHi} style={{ fontSize: 13, fontWeight: 700 }}>
            VELDHOVEN
          </text>
          <text x={VH[0] + 2} y={VH[1] + 42} textAnchor="end" fill={p.muted} style={{ fontSize: 11.5 }}>
            ASML · builds the machine
          </text>
        </g>

        {/* the jurisdiction tether — sags slack, snaps dead-straight when taut */}
        <path
          d={tetherPath}
          fill="none"
          stroke={tetherColor}
          strokeWidth={tetherW}
          strokeLinecap="round"
          strokeDasharray={over ? undefined : "2 7"}
          markerEnd={over ? "url(#al-head)" : undefined}
        />
        <text
          x={midX}
          y={midY + (over ? -10 : 18)}
          textAnchor="middle"
          fill={over ? p.squeezeHi : p.soft}
          style={{ fontSize: 11.5, fontWeight: over ? 700 : 400, letterSpacing: "0.08em" }}
        >
          {over ? "RE-EXPORT JURISDICTION, ATTACHED" : "extraterritorial reach, slack"}
        </text>
      </svg>

      {/* readout + threshold meter + control */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdictColor, fontStyle: "normal", fontWeight: 700 }}>
            {verdict.word}
          </span>{" "}
, {verdict.line}.
        </p>

        {/* threshold meter: a marked FDPR line the fill crosses */}
        <div className="relative mt-3 h-2.5 w-full overflow-visible rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${clamp01(pct / 100) * 100}%`,
              height: "100%",
              borderRadius: 999,
              background: over ? p.squeeze : p.leverage,
            }}
          />
          <div
            className="absolute top-[-3px] h-[16px] w-[2px]"
            style={{ left: `${FDPR_THRESHOLD}%`, background: p.squeezeHi }}
          />
          <span
            className="absolute top-[-18px] text-[9px] font-semibold uppercase tracking-wider"
            style={{ left: `${FDPR_THRESHOLD}%`, transform: "translateX(-50%)", color: p.squeezeHi, fontFamily: "var(--font-mono), monospace" }}
          >
            FDPR
          </span>
        </div>

        <label className="mt-4 flex items-center gap-3 text-[11px]" style={{ color: p.soft }}>
          <span style={{ fontFamily: "var(--font-mono), monospace", whiteSpace: "nowrap" }}>
            US-ORIGIN CONTENT
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={pct}
            onChange={(e) => setPct(clamp(Math.round(Number(e.target.value)), 0, 100))}
            aria-label="US-origin content of the machine, percent, raise past the Foreign Direct Product Rule threshold to pull the jurisdiction leash taut"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: over ? p.squeeze : p.leverage, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: verdictColor, fontWeight: 700, minWidth: 38, textAlign: "right" }}
          >
            {pct}%
          </span>
        </label>
      </div>
    </PlateFrame>
  )
}
