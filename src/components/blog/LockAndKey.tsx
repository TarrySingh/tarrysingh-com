"use client"

/**
 * V40 — THE LOCK AND THE KEY  (Chapter 12, "The Key Europe Holds").
 *
 * The title made literal, and the essay's thesis resolved. The CONSTRUCTIVE
 * TURN: Europe is not poor, or stupid, or weak — it holds the single most
 * irreplaceable chokepoint asset in the entire global chip supply chain, plus a
 * written, costed plan, and has simply never summoned the nerve to turn the key.
 *
 * A KEY (cyan → gold) whose teeth are engraved with the assets Europe actually
 * holds:
 *   ASML / EUV     — 100% EUV-lithography monopoly; €677bn market cap; ZERO
 *                    substitutes — without ASML no sub-5nm AI chip on Earth.
 *   SAVINGS        — €33.5tn household savings (€61tn net wealth).
 *   SINGLE MARKET  — 450 million people, one market.
 *   SCIENCE        — 22% of the world's scientific papers.
 *   INDUSTRY       — €2.5tn of manufacturing value-added.
 * A LOCK (red) whose PINS are what Washington owns — the platforms, the frontier
 * models, the capital markets, the cloud.
 *
 * The reader inserts the key and turns it: it RESISTS, turning only partway —
 * because turning it fully needs coordinated nerve Europe hasn't summoned. The
 * GOLD turn completes only when the reader HOLDS the control (press-and-hold /
 * Space-hold) — the commitment beat. A mono readout names each asset on
 * hover/focus.
 *
 * REVEAL: the key has simply never been turned.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (hold snaps straight to the turned state, no easing), keyboard-
 * reachable (focusable teeth + a hold button that also takes Space/Enter),
 * meaningful at its default (the key sits in the lock, partway, asset named).
 * role="img" + aria-label.
 *
 * Figures hard-coded. Sources: ASML / IMEC / Zeiss (EUV monopoly, market cap);
 * ECB / BCG (household savings, net wealth); Eurostat (single market); Elsevier
 * (22% of papers); Eurostat (manufacturing value-added). NOTE: ARM is deliberately
 * NOT claimed as European — SoftBank-owned, run from Tokyo.
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp01,
  easeInOut,
  lerp,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

type Tooth = {
  key: string
  label: string
  metric: string
  detail: string
  // tooth height as a share of the max bitting depth (0..1) — the "cut"
  cut: number
}

// The bitting of the key — each tooth an irreplaceable asset Europe holds.
const TEETH: Tooth[] = [
  {
    key: "asml",
    label: "ASML · EUV",
    metric: "100%",
    detail:
      "A 100% monopoly on EUV lithography — €677bn market cap, ZERO substitutes. Without ASML, no sub-5nm AI chip on Earth gets made.",
    cut: 1,
  },
  {
    key: "savings",
    label: "HOUSEHOLD SAVINGS",
    metric: "€33.5tn",
    detail:
      "€33.5tn of household savings, atop €61tn of net wealth — the capital to fund a continent's own frontier, if it dared to deploy it.",
    cut: 0.74,
  },
  {
    key: "market",
    label: "SINGLE MARKET",
    metric: "450M",
    detail:
      "A single market of 450 million people — the scale to set the rules rather than take them, the moment it acts as one.",
    cut: 0.58,
  },
  {
    key: "science",
    label: "SCIENCE",
    metric: "22%",
    detail:
      "22% of the world's scientific papers — more than the United States. The discovery base is already here; only the will to commercialise it is missing.",
    cut: 0.86,
  },
  {
    key: "industry",
    label: "INDUSTRY",
    metric: "€2.5tn",
    detail:
      "€2.5tn of manufacturing value-added — a real economy that makes real things, the ballast a software-only rival cannot improvise.",
    cut: 0.66,
  },
]

// The pins of the lock — what Washington owns (the things the key is up against).
const PINS = ["PLATFORMS", "FRONTIER MODELS", "CAPITAL MARKETS", "THE CLOUD"]

// Geometry (viewBox units). ----------------------------------------------------
const W = 920
const H = 560

// The lock body sits left; the key reaches in from the right.
const LOCK_X = 86
const LOCK_Y = 150
const LOCK_W = 250
const LOCK_H = 270
// Keyway centre — the pivot the key turns around.
const PIVOT_X = LOCK_X + LOCK_W - 56
const PIVOT_Y = LOCK_Y + LOCK_H / 2

// The key shaft runs from the pivot rightward; teeth hang below the shaft.
const SHAFT_LEN = 360
const SHAFT_H = 30
const BOW_R = 46 // the round handle (bow) of the key
const TOOTH_W = SHAFT_LEN / TEETH.length
const TOOTH_MAX = 46 // max bitting depth

// The reader can turn the key to at most this fraction without holding —
// it resists. Holding drives it the rest of the way (the nerve Europe lacks).
const RESIST_FRAC = 0.34
const FULL_ANGLE = 64 // degrees of a full successful turn (clockwise)

export function LockAndKey() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // turn ∈ [0,1]. Default sits at the resist point — the key in the lock, partway.
  const [turn, setTurn] = useState(RESIST_FRAC)
  const [holding, setHolding] = useState(false)
  const [active, setActive] = useState<string>("asml")

  const cur = TEETH.find((t) => t.key === active) ?? TEETH[0]

  // Hold drives the turn toward 1; release lets it spring back to the resist point.
  useEffect(() => {
    if (reduced) {
      setTurn(holding ? 1 : RESIST_FRAC)
      return
    }
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      setTurn((v) => {
        const target = holding ? 1 : RESIST_FRAC
        // mechanical, slow: ~1.4s to seat, faster spring-back
        const rate = holding ? 0.85 : 1.9
        const next = v + (target - v) * clamp01(rate * dt)
        return Math.abs(next - target) < 0.001 ? target : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [holding, reduced])

  const turned = turn >= 0.985 // the lock is open
  // angle of the key (degrees, clockwise). Gold engages past the resist point.
  const angle = lerp(0, FULL_ANGLE, easeInOut(turn))
  // how far past resistance — 0 below resist, 1 at full turn. Drives the gold wash.
  const past = clamp01((turn - RESIST_FRAC) / (1 - RESIST_FRAC))
  const keyColor = mixHex(p.leverage, p.wonder, past)
  const keyHi = mixHex(p.leverageHi, p.wonderHi, past)

  const startHold = () => setHolding(true)
  const endHold = () => setHolding(false)

  const verdict = turned
    ? { word: "THE KEY TURNS", color: p.wonderHi }
    : turn > RESIST_FRAC + 0.05
      ? { word: "IT GIVES — KEEP HOLDING", color: p.wonderHi }
      : { word: "IT RESISTS", color: p.leverageHi }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V40 · The Lock and the Key"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {cur.label} · {verdict.word}
        </span>
      }
      caption={
        <>
          Europe is not poor, or stupid, or weak. The key&rsquo;s teeth are the assets it actually{" "}
          <span style={{ color: p.leverage }}>holds</span> — <span style={{ color: p.leverage }}>ASML&rsquo;s
          100% EUV monopoly</span> (€677bn; <em>zero</em> substitutes — no sub-5nm AI chip on Earth without it),{" "}
          €33.5tn household savings, a 450-million single market, 22% of the world&rsquo;s papers, €2.5tn of
          industry. The lock&rsquo;s pins are what Washington owns —{" "}
          <span style={{ color: p.squeeze }}>platforms, frontier models, capital markets, the cloud</span>.{" "}
          Hover a tooth to name the asset; <strong>press and hold</strong> (or hold Space) to turn the key. It{" "}
          <span style={{ color: p.leverage }}>resists</span>, then turns{" "}
          <span style={{ color: p.wonderHi }}>gold</span> — full only while you hold the nerve. Sources:
          ASML/IMEC/Zeiss; ECB/BCG (savings); Eurostat (market, industry); Elsevier (22% of papers).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A lock and key. The key's teeth are the irreplaceable assets Europe holds — ASML's 100% EUV-lithography monopoly (€677bn, zero substitutes), €33.5tn household savings, a 450-million single market, 22% of the world's scientific papers, €2.5tn of manufacturing value-added. The lock's pins are what Washington owns — platforms, frontier models, capital markets and the cloud. The key resists turning; it completes, glowing gold, only while held — the coordinated nerve Europe has never summoned. ${turned ? "Right now the key is fully turned and the lock is open." : "Right now the key sits partway, resisting."}`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <linearGradient id="lk-key" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={keyHi} stopOpacity={0.95} />
            <stop offset="100%" stopColor={keyColor} stopOpacity={0.9} />
          </linearGradient>
          <radialGradient id="lk-turnglow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={p.wonderHi} stopOpacity={lerp(0, 0.42, past)} />
            <stop offset="100%" stopColor={p.wonder} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* schematic blueprint hairlines — the shop drawing the plan is written on */}
        <line x1={40} y1={PIVOT_Y} x2={W - 40} y2={PIVOT_Y} stroke={p.blueprint} strokeWidth={1} strokeDasharray="2 6" />
        <text x={W - 44} y={PIVOT_Y - 10} textAnchor="end" fill={p.soft} style={{ fontSize: 12.5, letterSpacing: "0.2em" }}>
          THE KEY EUROPE HOLDS
        </text>

        {/* the turn glow — gold bloom that swells around the keyway as nerve holds */}
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={150} fill="url(#lk-turnglow)" />

        {/* ===== THE LOCK (red) — pins are what Washington owns ===== */}
        <g>
          <rect
            x={LOCK_X}
            y={LOCK_Y}
            width={LOCK_W}
            height={LOCK_H}
            rx={20}
            fill={rgba(mode === "dark" ? "240,112,138" : "192,69,90", 0.1)}
            stroke={turned ? mixHex(p.squeeze, p.wonder, 0.4) : p.squeeze}
            strokeWidth={1.8}
          />
          {/* shackle — swings open when the key turns */}
          <g
            style={{
              transform: turned ? "translateY(-22px)" : "translateY(0)",
              transformOrigin: `${LOCK_X + LOCK_W / 2}px ${LOCK_Y}px`,
              transition: reduced ? "none" : "transform 700ms cubic-bezier(.4,0,.2,1)",
            }}
          >
            <path
              d={`M ${LOCK_X + 52} ${LOCK_Y} L ${LOCK_X + 52} ${LOCK_Y - 56} A 56 56 0 0 1 ${
                LOCK_X + LOCK_W - 52
              } ${LOCK_Y - 56} L ${LOCK_X + LOCK_W - 52} ${LOCK_Y}`}
              fill="none"
              stroke={turned ? p.wonderHi : p.squeeze}
              strokeWidth={16}
              strokeLinecap="round"
            />
          </g>
          <text x={LOCK_X + 20} y={LOCK_Y + 30} fill={p.squeezeHi} style={{ fontSize: 12.5, letterSpacing: "0.18em" }}>
            WHAT WASHINGTON OWNS
          </text>

          {/* the pins — the tumblers Washington holds down */}
          {PINS.map((pin, i) => {
            const py = LOCK_Y + 64 + i * 44
            // pins lift as the key seats past resistance — the bitting "reads" them
            const lift = turned ? 16 : past * 8
            return (
              <g key={pin}>
                <rect
                  x={LOCK_X + 22}
                  y={py - lift}
                  width={12}
                  height={30 + lift}
                  rx={4}
                  fill={turned ? mixHex(p.squeeze, p.wonderHi, 0.5) : p.squeeze}
                  opacity={0.9}
                />
                <text x={LOCK_X + 44} y={py + 18} fill={p.muted} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
                  {pin}
                </text>
              </g>
            )
          })}
        </g>

        {/* ===== THE KEY (cyan → gold) — rotates about the keyway pivot ===== */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`,
            transition: reduced ? "none" : "none",
          }}
        >
          {/* the bow (handle) — the round grip the reader "holds" */}
          <circle cx={PIVOT_X + SHAFT_LEN + BOW_R} cy={PIVOT_Y} r={BOW_R} fill="none" stroke="url(#lk-key)" strokeWidth={11} />
          <circle cx={PIVOT_X + SHAFT_LEN + BOW_R} cy={PIVOT_Y} r={BOW_R - 16} fill="none" stroke={keyColor} strokeWidth={2} strokeOpacity={0.55} />

          {/* the shaft */}
          <rect
            x={PIVOT_X}
            y={PIVOT_Y - SHAFT_H / 2}
            width={SHAFT_LEN}
            height={SHAFT_H}
            rx={6}
            fill="url(#lk-key)"
          />

          {/* the teeth (bitting) — each an asset Europe holds, focusable */}
          {TEETH.map((t, i) => {
            const tx = PIVOT_X + 18 + i * TOOTH_W
            const th = TOOTH_MAX * t.cut
            const isActive = active === t.key
            return (
              <g
                key={t.key}
                role="button"
                tabIndex={0}
                aria-label={`${t.label}: ${t.metric}. ${t.detail}`}
                onMouseEnter={() => setActive(t.key)}
                onFocus={() => setActive(t.key)}
                onClick={() => setActive(t.key)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                <path
                  d={`M ${tx} ${PIVOT_Y + SHAFT_H / 2}
                      L ${tx} ${PIVOT_Y + SHAFT_H / 2 + th}
                      L ${tx + TOOTH_W * 0.34} ${PIVOT_Y + SHAFT_H / 2 + th}
                      L ${tx + TOOTH_W * 0.5} ${PIVOT_Y + SHAFT_H / 2 + th * 0.5}
                      L ${tx + TOOTH_W * 0.68} ${PIVOT_Y + SHAFT_H / 2}
                      Z`}
                  fill={isActive ? keyHi : keyColor}
                  fillOpacity={isActive ? 1 : 0.86}
                  stroke={isActive ? keyHi : "none"}
                  strokeWidth={isActive ? 2 : 0}
                />
                {/* engraved metric on the tooth — Plex Mono */}
                <text
                  x={tx + TOOTH_W * 0.32}
                  y={PIVOT_Y + SHAFT_H / 2 + th + 16}
                  textAnchor="middle"
                  fill={isActive ? keyHi : p.muted}
                  style={{ fontSize: 12, fontWeight: 800, letterSpacing: "-0.01em" }}
                >
                  {t.metric}
                </text>
                <text
                  x={tx + TOOTH_W * 0.32}
                  y={PIVOT_Y + SHAFT_H / 2 + th + 30}
                  textAnchor="middle"
                  fill={p.soft}
                  style={{ fontSize: 8.5, letterSpacing: "0.06em" }}
                >
                  {t.label}
                </text>
              </g>
            )
          })}
        </g>

        {/* keyway pivot dot — the axis everything turns on */}
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={6} fill={keyColor} />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={13} fill="none" stroke={keyColor} strokeWidth={1.4} strokeOpacity={0.5} />

        {/* ===== READOUT — the focused asset, named ===== */}
        {(() => {
          const px = 540
          const pw = W - px - 40
          const py = H - 154
          const ph = 130
          return (
            <g>
              <rect x={px} y={py} width={pw} height={ph} rx={14} fill={p.hair} stroke={p.blueprint} strokeWidth={1} />
              <text x={px + 22} y={py + 30} fill={p.soft} style={{ fontSize: 12.5, letterSpacing: "0.2em" }}>
                THE ASSET IN HAND
              </text>
              <text x={px + 22} y={py + 64} fill={keyHi} style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}>
                {cur.metric}
              </text>
              <text x={px + 132} y={py + 64} fill={p.leverage} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
                {cur.label}
              </text>
              {wrapText(cur.detail, 56).map((line, k) => (
                <text
                  key={`det-${k}`}
                  x={px + 22}
                  y={py + 90 + k * 18}
                  fill={p.muted}
                  style={{ fontSize: 12.5, fontFamily: "var(--font-serif), serif" }}
                >
                  {line}
                </text>
              ))}
            </g>
          )
        })()}
      </svg>

      {/* nerve meter + verdict + the hold control */}
      <div className="mt-2 px-1">
        {/* the "nerve" meter — fills cyan→gold past the resist line, drains on release */}
        <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: rgba(p.glowRGB, 0.16) }} aria-hidden>
          <div
            style={{
              width: `${turn * 100}%`,
              height: "100%",
              background: mixHex(p.leverage, p.wonder, past),
              transition: reduced ? "none" : "none",
            }}
          />
          {/* the resist line — where it stops without nerve */}
          <div
            style={{
              position: "absolute",
              left: `${RESIST_FRAC * 100}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: p.squeeze,
            }}
          />
        </div>

        <p className="mt-3 text-[15px]" style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}>
          <span style={{ color: p.wonderHi, fontStyle: "normal", fontWeight: 700 }}>
            Not poor, or stupid, or weak
          </span>{" "}
          — Europe holds the single most irreplaceable chokepoint asset on Earth. The key has simply never been
          turned.
        </p>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={(e) => {
              e.preventDefault()
              startHold()
            }}
            onTouchEnd={endHold}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                startHold()
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                endHold()
              }
            }}
            onBlur={endHold}
            aria-label="Press and hold to turn the key — it completes only while held"
            aria-pressed={holding}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 7,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: holding ? p.wonderHi : keyHi,
              border: `1px solid ${holding ? p.wonder : keyColor}`,
              background: holding ? rgba(p.glowRGB, 0.12) : "transparent",
              userSelect: "none",
              touchAction: "none",
            }}
          >
            {turned ? "✓ turned — keep holding" : holding ? "holding the nerve…" : "▶ press & hold to turn"}
          </button>
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {verdict.word}
          </span>
          <span
            className="ml-auto tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            turn {Math.round(turn * 100)}%
          </span>
        </div>

        <p className="mt-2 text-[13px]" style={{ fontFamily: "var(--font-mono), monospace", color: p.muted }}>
          <span style={{ color: keyHi, fontWeight: 700 }}>{cur.label}</span> · {cur.metric} — {cur.detail}
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
