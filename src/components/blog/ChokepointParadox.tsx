"use client"

/**
 * V1 — THE CHOKEPOINT PARADOX  (the essay's title instrument + grammar-locker).
 *
 * One glowing ASML node. LEVERAGE radiates outward in blueprint cyan (100% EUV,
 * ~85% of all chips, €32.7bn, ~94% of litho); the SQUEEZE closes inward in the
 * reserved kill-switch red (Cymer/US, Zeiss/DE single sources, China demand
 * cliff, US export control). A single slider morphs the field between the two —
 * because the strength and the exposure are the *same node*. That is the
 * paradox: leverage you don't own.
 *
 * Theme-aware (re-renders on Read-mode flip via read-chart-kit), reduced-motion
 * safe (no ambient animation; the only motion is the user's own slider), and
 * keyboard-reachable (native range input). Renders meaningfully at its default
 * balance point as the static fallback.
 *
 * Data: deck B01/B04 (ASML monopoly + dependency), B02/B05/B06 (Cymer, Zeiss,
 * Pax Silica), research `semiconductors` (China revenue 49%→~19%).
 */

import { useRef, useState } from "react"

import { PlateFrame, useReadMode, clamp01, lerp } from "./read-chart-kit"
import { cpPalette, mixHex } from "./chokepoint-kit"

const CX = 460
const CY = 282
const NODE_R = 58

type Leverage = { x: number; y: number; anchor: "start" | "end"; label: string; sub: string }
type Squeeze = { x: number; y: number; align: "start" | "middle" | "end"; label: string; sub: string }

const LEVERAGE: Leverage[] = [
  { x: 116, y: 92, anchor: "start", label: "100% of EUV", sub: "lithography on Earth" },
  { x: 804, y: 92, anchor: "end", label: "~85% of all chips", sub: "depend on the Dutch stack" },
  { x: 116, y: 474, anchor: "start", label: "€32.7bn", sub: "FY2025 revenue" },
  { x: 804, y: 474, anchor: "end", label: "~94%", sub: "of all litho systems" },
]

const SQUEEZE: Squeeze[] = [
  { x: 460, y: 54, align: "middle", label: "US export control", sub: "“Pax Silica”, Dec 2025" },
  { x: 460, y: 512, align: "middle", label: "China demand cliff", sub: "49% → ~19% in four quarters" },
  { x: 70, y: 280, align: "start", label: "Cymer light source", sub: "100% US-origin" },
  { x: 850, y: 280, align: "end", label: "Zeiss optics", sub: "single German source" },
]

function towardCenter(x: number, y: number, dist: number): [number, number] {
  const dx = x - CX
  const dy = y - CY
  const len = Math.hypot(dx, dy) || 1
  return [CX + (dx / len) * dist, CY + (dy / len) * dist]
}

export function ChokepointParadox() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const [s, setS] = useState(0.5) // 0 = pure leverage, 1 = pure squeeze

  const lvOpacity = lerp(1, 0.16, s)
  const lvWidth = lerp(2.4, 1, s)
  const sqOpacity = lerp(0.16, 1, s)
  const sqWidth = lerp(1, 2.6, s)
  const sqDist = lerp(196, NODE_R + 16, s) // arrowheads close in as squeeze wins
  const nodeFill = mixHex(p.wonder, "#5b6678", s)
  const nodeStroke = mixHex(p.wonderHi, p.squeeze, s)
  const glow = lerp(0.55, 0.06, s)

  const verdict =
    s < 0.34
      ? { word: "LEVERAGE", color: p.leverage, line: "the one machine the world cannot replace" }
      : s < 0.66
        ? { word: "PARADOX", color: p.wonderHi, line: "the strength and the exposure are the same node" }
        : { word: "EXPOSURE", color: p.squeeze, line: "every input is a foreign veto" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      kicker="V1 · The Chokepoint Paradox"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {verdict.word}
        </span>
      }
      caption={
        <>
          Europe owns the single most important machine in the chip supply chain — and Washington holds
          the trigger. Drag from <span style={{ color: p.leverage }}>leverage</span> to{" "}
          <span style={{ color: p.squeeze }}>squeeze</span>: the strength and the exposure are the same
          node. Sources: ASML FY2025; US/EU export controls (“Pax Silica”, Dec 2025); ASML China revenue
          49%→~19%.
        </>
      }
    >
      <svg
        viewBox="0 0 920 560"
        role="img"
        aria-label="The ASML chokepoint: leverage radiating out versus the foreign squeeze closing in"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="cp-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={glow} />
            <stop offset="60%" stopColor={p.wonder} stopOpacity={glow * 0.4} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
          <marker id="cp-sq-head" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.squeeze} />
          </marker>
          <marker id="cp-lv-head" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.leverage} />
          </marker>
        </defs>

        {/* LEVERAGE — rays + labels radiating out (cyan) */}
        {LEVERAGE.map((lv, i) => {
          const [ex, ey] = towardCenter(lv.x, lv.y, NODE_R + 6)
          const [tx, ty] = towardCenter(lv.x, lv.y, 250)
          return (
            <g key={`lv-${i}`} style={{ opacity: lvOpacity }}>
              <line
                x1={ex}
                y1={ey}
                x2={tx}
                y2={ty}
                stroke={p.leverage}
                strokeWidth={lvWidth}
                markerEnd="url(#cp-lv-head)"
              />
              <text
                x={lv.x}
                y={lv.y}
                textAnchor={lv.anchor}
                fill={p.leverageHi}
                style={{ fontSize: 20, fontWeight: 700 }}
              >
                {lv.label}
              </text>
              <text
                x={lv.x}
                y={lv.y + 18}
                textAnchor={lv.anchor}
                fill={p.muted}
                style={{ fontSize: 12.5 }}
              >
                {lv.sub}
              </text>
            </g>
          )
        })}

        {/* SQUEEZE — arrows + labels closing in (red) */}
        {SQUEEZE.map((sq, i) => {
          const [ix, iy] = towardCenter(sq.x, sq.y, sqDist)
          const [ox, oy] = towardCenter(sq.x, sq.y, 214)
          const labelY = sq.y < CY ? sq.y - 4 : sq.y + 4
          return (
            <g key={`sq-${i}`} style={{ opacity: sqOpacity }}>
              <line
                x1={ox}
                y1={oy}
                x2={ix}
                y2={iy}
                stroke={p.squeeze}
                strokeWidth={sqWidth}
                markerEnd="url(#cp-sq-head)"
              />
              <text
                x={sq.x}
                y={labelY}
                textAnchor={sq.align}
                fill={p.squeezeHi}
                style={{ fontSize: 15, fontWeight: 700 }}
              >
                {sq.label}
              </text>
              <text
                x={sq.x}
                y={labelY + (sq.y < CY ? -16 : 16)}
                textAnchor={sq.align}
                fill={p.muted}
                style={{ fontSize: 11.5 }}
              >
                {sq.sub}
              </text>
            </g>
          )
        })}

        {/* THE NODE — ASML / Veldhoven */}
        <circle cx={CX} cy={CY} r={NODE_R + 70} fill="url(#cp-node-glow)" />
        <circle cx={CX} cy={CY} r={NODE_R} fill={nodeFill} stroke={nodeStroke} strokeWidth={2.5} />
        <circle cx={CX} cy={CY} r={NODE_R - 9} fill="none" stroke={p.blueprint} strokeWidth={1} />
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          fill={mode === "dark" ? "#0a0f1c" : "#fdfaf2"}
          style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.04em" }}
        >
          ASML
        </text>
        <text
          x={CX}
          y={CY + 16}
          textAnchor="middle"
          fill={mode === "dark" ? "rgba(10,15,28,0.7)" : "rgba(253,250,242,0.8)"}
          style={{ fontSize: 10.5, letterSpacing: "0.18em" }}
        >
          VELDHOVEN
        </text>
      </svg>

      {/* Verdict + meter + control */}
      <div className="mt-2 px-1">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>
            {verdict.word}
          </span>{" "}
          — {verdict.line}.
        </p>

        {/* leverage ⟷ squeeze meter */}
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full"
          style={{ background: p.hair }}
          aria-hidden
        >
          <div
            style={{
              width: `${clamp01(1 - s) * 100}%`,
              height: "100%",
              background: p.leverage,
              float: "left",
            }}
          />
          <div
            style={{ width: `${clamp01(s) * 100}%`, height: "100%", background: p.squeeze, float: "left" }}
          />
        </div>

        <label className="mt-3 flex items-center gap-3 text-[11px]" style={{ color: p.soft }}>
          <span
            style={{ fontFamily: "var(--font-mono), monospace", color: p.leverage, whiteSpace: "nowrap" }}
          >
            ◂ LEVERAGE
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(s * 100)}
            onChange={(e) => setS(clamp01(Number(e.target.value) / 100))}
            aria-label="Drag from leverage to squeeze"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.wonder, background: p.hair }}
          />
          <span
            style={{ fontFamily: "var(--font-mono), monospace", color: p.squeeze, whiteSpace: "nowrap" }}
          >
            SQUEEZE ▸
          </span>
        </label>
      </div>
    </PlateFrame>
  )
}
