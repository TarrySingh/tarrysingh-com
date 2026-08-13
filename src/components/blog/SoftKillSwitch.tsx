"use client"

/**
 * V28 — THE SOFT KILL-SWITCH  (Chapter 8, "Paying for Dependence, Calling It
 * Autonomy: Defence").
 *
 * Europe is buying its security with a foreign off-switch baked in. European
 * NATO members have ordered ~630–668 F-35s (~180–200 delivered). There is no
 * literal kill switch — the Pentagon's Joint Program Office denied one in Mar
 * 2025 — but US logistical and software control IS the functional equivalent:
 * spares, the ODIN/ALIS mission-data + software-update pipeline, and
 * maintenance support can all be withheld.
 *
 * The reader turns a single DEPENDENCY DIAL through the four real levers —
 * SPARES · SOFTWARE/ODIN · MISSION DATA · MAINTENANCE. As the dial moves toward
 * "support withdrawn", the fleet greys from operable CYAN to inoperable RED, a
 * mono counter climbs the number of jets affected, and the 2025 trigger (the US
 * policy shift on Ukraine) lights the fallout: Portugal and Canada publicly
 * reconsidered their buys.
 *
 * REVEAL: not a switch you can see — a leash you cannot cut. Sovereignty with
 * someone else's hand on the supply line.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the ▶ sweep is gated; reduced → the dial just snaps to the
 * end-state), keyboard-reachable (native range input + play button), meaningful
 * at its default (dial set at the SOFTWARE/ODIN lever — the day-one chokepoint).
 *
 * Figures hard-coded. Sources: SIPRI / Lockheed Martin (orders & deliveries);
 * Pentagon Joint Program Office denial (Mar 2025); Breaking Defense (2025).
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

// European NATO order book (SIPRI / Lockheed). We render the fleet against the
// mid-point order figure and count delivered airframes as the ones already
// exposed to the leash today.
const ORDERED = 668 // upper bound of the European NATO order book
const DELIVERED = 190 // ~180–200 delivered into European hands

// The four real levers — each a degree on the same dial. `bite` is the share of
// the in-service fleet that lever alone can ground when withheld, cumulative.
type Lever = {
  key: string
  label: string
  detail: string
  bite: number // 0..1 — share of the fleet rendered inoperable at this stop
}

const LEVERS: Lever[] = [
  {
    key: "ready",
    label: "SUPPORT FLOWING",
    detail: "spares, ODIN feeds + maintenance all delivered, fleet mission-capable",
    bite: 0,
  },
  {
    key: "spares",
    label: "SPARES",
    detail: "spare-parts pipeline slowed, availability decays within weeks",
    bite: 0.28,
  },
  {
    key: "software",
    label: "SOFTWARE / ODIN",
    detail: "ODIN/ALIS software + update pipeline frozen, no patches, degraded health",
    bite: 0.55,
  },
  {
    key: "mission",
    label: "MISSION DATA",
    detail: "mission-data files withheld, sensors can't classify the threat library",
    bite: 0.82,
  },
  {
    key: "maint",
    label: "MAINTENANCE",
    detail: "depot + sustainment support withdrawn, the fleet is grounded",
    bite: 1,
  },
]
const N = LEVERS.length - 1

// Plot frame (viewBox units).
const W = 920
const H = 588

// Fleet grid — a hangar of jet silhouettes the reader greys to red.
const COLS = 28
const ROWS = 6
const FLEET = COLS * ROWS // 168 glyphs standing in for the in-service fleet
const GRID_X = 60
const GRID_Y = 196
const GRID_W = W - 120
const CELL = GRID_W / COLS
const GLYPH_W = CELL * 0.66
const GLYPH_H = 22
const ROW_GAP = 34

const intFmt = (v: number) => Math.round(v).toLocaleString("en-GB")

// A small top-down F-35 silhouette, drawn around (0,0), pointing up.
function jetPath(w: number, h: number): string {
  const hw = w / 2
  const hh = h / 2
  return [
    `M 0 ${-hh}`, // nose
    `L ${hw * 0.34} ${-hh * 0.2}`,
    `L ${hw * 0.34} ${hh * 0.05}`,
    `L ${hw} ${hh * 0.5}`, // wing tip R
    `L ${hw * 0.3} ${hh * 0.55}`,
    `L ${hw * 0.26} ${hh}`, // tail R
    `L ${-hw * 0.26} ${hh}`, // tail L
    `L ${-hw * 0.3} ${hh * 0.55}`,
    `L ${-hw} ${hh * 0.5}`, // wing tip L
    `L ${-hw * 0.34} ${hh * 0.05}`,
    `L ${-hw * 0.34} ${-hh * 0.2}`,
    "Z",
  ].join(" ")
}

export function SoftKillSwitch() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // step ∈ [0, N] — how far the dial has turned. Default: SOFTWARE/ODIN, the
  // day-one chokepoint the JPO controls outright.
  const [step, setStep] = useState(2)
  const [playing, setPlaying] = useState(false)

  // ▶ — mechanical sweep toward "support withdrawn". Off under reduced motion.
  useEffect(() => {
    if (!playing || reduced) return
    if (step >= N) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => clamp(s + 1, 0, N)), 1050)
    return () => window.clearTimeout(id)
  }, [playing, reduced, step])

  const cur = LEVERS[step]
  // tighten 0 → 1 across the dial; drives the grey-to-red wash + counters.
  const tighten = clamp01(step / N)
  const grounded = Math.round(FLEET * cur.bite) // glyphs rendered inoperable
  // jets affected, scaled to the real in-service number Europe holds today.
  const jetsAffected = Math.round(DELIVERED * cur.bite)

  // The 2025 trigger lights once the dial leaves "support flowing".
  const triggered = step >= 1

  function play() {
    if (reduced) {
      setStep(N)
      return
    }
    if (step >= N) setStep(0)
    setPlaying(true)
  }

  // Dial geometry — a half-clock the reader turns one way.
  const dialCx = W - 150
  const dialCy = 96
  const dialR = 52
  const a0 = Math.PI * 0.86 // dial start angle (left)
  const a1 = Math.PI * 0.14 // dial end angle (right) — sweeps clockwise down
  const dialAng = lerp(a0, a1, tighten)
  const needleColor = mixHex(p.leverage, p.squeeze, tighten)

  // Operable-fleet meter geometry.
  const trackX0 = 60
  const trackX1 = W - 320
  const tx = linScale(0, N, trackX0, trackX1)

  const grey = mode === "dark" ? "#5a6478" : "#8a93a4"

  const verdict =
    step === 0
      ? { word: "MISSION-CAPABLE", color: p.leverage, line: "every jet flies, while the supply line runs through Washington" }
      : step <= 2
        ? { word: "THE LEASH PULLS", color: p.squeezeHi, line: "no literal switch, but spares and ODIN are leverage all the same" }
        : { word: "GROUNDED", color: p.squeeze, line: "not a switch you can see, a leash you cannot cut" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V28 · The Soft Kill-Switch"
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
          European NATO has ordered ~630–668 <span style={{ color: p.leverage }}>F-35s</span> (~180–200
          delivered). There is no literal kill switch, the Pentagon&rsquo;s JPO{" "}
          <span style={{ color: p.muted }}>denied one (Mar 2025)</span>, but US control of the supply line is
          the functional equivalent. Turn the dial through{" "}
          <span style={{ color: p.squeeze }}>SPARES</span>,{" "}
          <span style={{ color: p.squeeze }}>SOFTWARE/ODIN</span>,{" "}
          <span style={{ color: p.squeeze }}>MISSION DATA</span> and{" "}
          <span style={{ color: p.squeeze }}>MAINTENANCE</span>, or press ▶, and watch the fleet grey to{" "}
          <span style={{ color: p.squeeze }}>inoperable</span>. The 2025 US policy shift on Ukraine had{" "}
          <span style={{ color: p.wonderHi }}>Portugal</span> and{" "}
          <span style={{ color: p.wonderHi }}>Canada</span> reconsider their buys. Sources: SIPRI / Lockheed
          Martin (orders); Pentagon JPO (Mar 2025); Breaking Defense (2025).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A European F-35 fleet on a dependency dial. With the dial at "${cur.label}", ${intFmt(
          jetsAffected,
        )} of the ~${DELIVERED} delivered jets are rendered inoperable through ${cur.detail}. There is no literal kill switch, US control of spares, the ODIN/ALIS software pipeline, mission data and maintenance is the functional equivalent.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="sks-veto" cx="50%" cy="40%" r="62%">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={lerp(0, 0.2, tighten)} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
          <marker id="sks-head" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={needleColor} />
          </marker>
        </defs>

        {/* veto bloom behind the hangar, swelling red as the dial turns */}
        <rect x={40} y={GRID_Y - 30} width={W - 80} height={ROWS * ROW_GAP + 30} fill="url(#sks-veto)" />

        {/* READOUT — jets affected + order book */}
        <text x={60} y={56} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          F-35s inoperable · of ~{DELIVERED} delivered
        </text>
        <text x={57} y={118} fill={needleColor} style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.01em" }}>
          {intFmt(jetsAffected)}
        </text>
        <text x={60} y={146} fill={p.muted} style={{ fontSize: 13 }}>
          ~630–668 on order · European NATO
        </text>

        {/* THE DEPENDENCY DIAL — a half-clock the reader turns one way */}
        <g>
          <text
            x={dialCx}
            y={dialCy - dialR - 14}
            textAnchor="middle"
            fill={p.soft}
            style={{ fontSize: 10, letterSpacing: "0.18em" }}
          >
            DEPENDENCY DIAL
          </text>
          {/* arc track */}
          <path
            d={`M ${dialCx + Math.cos(a0) * dialR} ${dialCy - Math.sin(a0) * dialR} A ${dialR} ${dialR} 0 0 1 ${
              dialCx + Math.cos(a1) * dialR
            } ${dialCy - Math.sin(a1) * dialR}`}
            fill="none"
            stroke={p.hair}
            strokeWidth={6}
            strokeLinecap="round"
          />
          {/* filled portion */}
          <path
            d={`M ${dialCx + Math.cos(a0) * dialR} ${dialCy - Math.sin(a0) * dialR} A ${dialR} ${dialR} 0 0 1 ${
              dialCx + Math.cos(dialAng) * dialR
            } ${dialCy - Math.sin(dialAng) * dialR}`}
            fill="none"
            stroke={needleColor}
            strokeWidth={6}
            strokeLinecap="round"
            strokeOpacity={0.9}
          />
          {/* lever ticks round the dial */}
          {LEVERS.map((lv, i) => {
            const a = lerp(a0, a1, i / N)
            const on = i <= step
            return (
              <circle
                key={`tick-${lv.key}`}
                cx={dialCx + Math.cos(a) * dialR}
                cy={dialCy - Math.sin(a) * dialR}
                r={i === step ? 4.5 : 2.6}
                fill={on ? needleColor : p.bg}
                stroke={on ? needleColor : p.soft}
                strokeWidth={1.4}
              />
            )
          })}
          {/* needle */}
          <line
            x1={dialCx}
            y1={dialCy}
            x2={dialCx + Math.cos(dialAng) * (dialR - 6)}
            y2={dialCy - Math.sin(dialAng) * (dialR - 6)}
            stroke={needleColor}
            strokeWidth={2.6}
            strokeLinecap="round"
            markerEnd="url(#sks-head)"
          />
          <circle cx={dialCx} cy={dialCy} r={4} fill={needleColor} />
          {/* "support withdrawn" label under the dial */}
          <text x={dialCx - dialR} y={dialCy + 26} textAnchor="start" fill={p.leverage} style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            flowing
          </text>
          <text x={dialCx + dialR} y={dialCy + 26} textAnchor="end" fill={p.squeeze} style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            withdrawn
          </text>
          <text
            x={dialCx}
            y={dialCy + 8}
            textAnchor="middle"
            fill={needleColor}
            style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em" }}
          >
            {cur.label}
          </text>
        </g>

        {/* THE FLEET — hangar of jet glyphs greying to inoperable red */}
        {Array.from({ length: FLEET }, (_, idx) => {
          const r = Math.floor(idx / COLS)
          const c = idx % COLS
          const cx = GRID_X + CELL * (c + 0.5)
          const cy = GRID_Y + r * ROW_GAP
          // glyphs fill grounded-first from the top-left reading order.
          const out = idx < grounded
          const fill = out
            ? mixHex(p.squeeze, grey, 0.18)
            : mixHex(p.leverage, p.leverageHi, 0.3)
          return (
            <path
              key={`jet-${idx}`}
              d={jetPath(GLYPH_W, GLYPH_H)}
              transform={`translate(${cx} ${cy})`}
              fill={out ? rgba(p.glowRGB, 0) : fill}
              fillOpacity={out ? 0.34 : 0.92}
              stroke={fill}
              strokeWidth={out ? 1 : 0.6}
              strokeOpacity={out ? 0.9 : 0.5}
            />
          )
        })}

        {/* grounded / operable tally under the hangar */}
        <text x={60} y={GRID_Y + ROWS * ROW_GAP + 8} fill={p.squeeze} style={{ fontSize: 12, fontWeight: 700 }}>
          {Math.round((grounded / FLEET) * 100)}% of the in-service fleet inoperable
        </text>
        <text x={W - 60} y={GRID_Y + ROWS * ROW_GAP + 8} textAnchor="end" fill={p.leverage} style={{ fontSize: 12, fontWeight: 700 }}>
          {FLEET - grounded} still flying
        </text>

        {/* THE 2025 TRIGGER + FALLOUT — lights once the dial leaves "flowing" */}
        <g opacity={triggered ? 1 : 0.32}>
          <line
            x1={60}
            y1={H - 86}
            x2={W - 60}
            y2={H - 86}
            stroke={triggered ? p.squeeze : p.hair}
            strokeWidth={1.2}
            strokeDasharray="5 5"
          />
          <circle cx={88} cy={H - 86} r={5} fill={triggered ? p.squeeze : p.soft} />
          <text x={104} y={H - 90} fill={triggered ? p.squeezeHi : p.soft} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
            2025 · US POLICY SHIFT ON UKRAINE, THE TRIGGER
          </text>
          {/* fallout: Portugal + Canada reconsider */}
          {[
            { x: 200, name: "PORTUGAL", note: "reconsidered its F-35 buy" },
            { x: 560, name: "CANADA", note: "reviewed its 88-jet order" },
          ].map((f) => (
            <g key={f.name} transform={`translate(${f.x} ${H - 54})`}>
              <circle cx={0} cy={-4} r={3.4} fill={triggered ? p.wonderHi : p.soft} />
              <text x={12} y={0} fill={triggered ? p.wonderHi : p.soft} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}>
                {f.name}
              </text>
              <text x={12} y={16} fill={p.muted} style={{ fontSize: 11, fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}>
                {f.note}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* meter + verdict + dial scrubber */}
      <div className="mt-2 px-1">
        {/* operable-fleet meter — drains to red as the dial turns */}
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: rgba(p.glowRGB, 0.18) }} aria-hidden>
          <div
            style={{
              width: `${clamp01(1 - cur.bite) * 100}%`,
              height: "100%",
              background: mixHex(p.leverage, p.squeeze, tighten),
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

        {/* dial scrubber + play — the reader turns the leash */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? setPlaying(false) : play())}
            aria-label={playing ? "Pause the dial" : "Turn the dependency dial toward support withdrawn"}
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
            {playing ? "❙❙ pause" : "▶ turn dial"}
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
            aria-label="Turn the dependency dial through the four withholding levers"
            aria-valuetext={`${cur.label}: ${cur.detail}, ${intFmt(jetsAffected)} of ~${DELIVERED} delivered jets inoperable`}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: p.squeeze, background: p.hair }}
          />
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {step + 1}/{N + 1} levers
          </span>
        </div>

        {/* the focused lever's detail line */}
        <p className="mt-2 text-[13px]" style={{ fontFamily: "var(--font-mono), monospace", color: p.muted }}>
          <span style={{ color: needleColor, fontWeight: 700 }}>{cur.label}</span>, {cur.detail}.
        </p>
      </div>
    </PlateFrame>
  )
}
