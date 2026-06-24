"use client"

/**
 * V36 — THE CLOUD-ACT SWITCH  (Chapter 10, "The Quarter-Trillion Tribute").
 *
 * A continent that hosts its government on a foreign platform has handed someone
 * else the off-switch. The European public sector runs ~80% of its productivity
 * software on Microsoft (Open Cloud Coalition / Compass Lexecon, Jul 2025), and
 * US-hosted / US-company data falls under US jurisdiction (the CLOUD Act).
 *
 * This instrument is a wired panel. A grid of European public-sector accounts —
 * ministries, courts, agencies — sits lit on a RED US-controlled platform. A
 * single master switch labelled "US SANCTIONS / CLOUD ACT" runs along the top.
 * Throw it (click / Space / Enter) and a current sweeps the bus-bar; a set of
 * accounts goes DARK — greyed, struck, inaccessible. The off-switch is real even
 * when no one will admit pressing it.
 *
 * The emblem case is marked precisely: in 2025 ICC Chief Prosecutor Karim Khan's
 * Microsoft email went dark after a US executive-order sanction (Feb 2025); he
 * moved to Switzerland's Proton Mail. Attribution is contested — Microsoft says
 * the ICC chose to disconnect — so the cell is labelled "email went dark after
 * US sanctions; attribution disputed". The GOLD resistance is marked too:
 * Euro-Office (sovereign EU suite) launched Jun 2026; Denmark, Austria and
 * France are migrating off Microsoft.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), reduced-
 * motion safe (the current-sweep is gated; the switch still throws and the cells
 * still go dark — only the animated arc is suppressed), keyboard-reachable
 * (the switch is a native button; each cell is focusable), and meaningful at its
 * default (panel powered, the wiring on show) as the static fallback.
 *
 * Figures hard-coded. Sources: Open Cloud Coalition / Compass Lexecon (~80%
 * Microsoft, Jul 2025); reporting on K. Khan / ICC (2025–26); Euro-Office
 * (Jun 2026).
 */

import { useEffect, useRef, useState } from "react"

import {
  PlateFrame,
  useReadMode,
  usePrefersReducedMotion,
  clamp01,
  lerp,
} from "./read-chart-kit"
import { cpPalette, mixHex, rgba } from "./chokepoint-kit"

// ~80% Microsoft dependence — the headline (Open Cloud Coalition / Compass
// Lexecon, Jul 2025). When the switch is thrown, that share is exposed to the
// foreign veto. We render 25 cells; ~80% (20) ride the US platform.
const MS_SHARE = 0.8

type Cell = {
  label: string
  /** runs on the US-controlled platform — exposed when the switch is thrown */
  exposed: boolean
  /** the emblem case — ICC / Karim Khan, marked precisely */
  emblem?: boolean
  /** sovereign resistance — already off the platform (gold) */
  resist?: boolean
}

// A 5×5 grid of European public-sector accounts. 20 sit on the US platform
// (exposed). The ICC cell is the emblem. Three gold cells have migrated off.
const CELLS: Cell[] = [
  { label: "Min. Justice" }, { label: "Min. Defence" }, { label: "ICC · Prosecutor", exposed: true, emblem: true }, { label: "Tax Agency" }, { label: "Min. Interior" },
  { label: "Health Auth." }, { label: "Denmark", resist: true }, { label: "Police HQ" }, { label: "Min. Finance" }, { label: "Customs" },
  { label: "Parliament" }, { label: "Min. Foreign" }, { label: "Land Registry" }, { label: "Austria", resist: true }, { label: "Audit Court" },
  { label: "Min. Energy" }, { label: "Statistics" }, { label: "Min. Schools" }, { label: "Pensions" }, { label: "France", resist: true },
  { label: "Border Agcy." }, { label: "Min. Health" }, { label: "Civil Reg." }, { label: "Min. Labour" }, { label: "Procurement" },
].map((c, i) => {
  const cell = c as Cell
  // Every non-resist cell rides the US platform (exposed). Resist cells are gold.
  if (!cell.resist) cell.exposed = true
  return cell
})

const EXPOSED = CELLS.filter((c) => c.exposed).length // 22 — the dependent estate
const RESIST = CELLS.filter((c) => c.resist).length // 3 — the sovereign break-aways

// Grid geometry (viewBox units).
const W = 920
const H = 600
const COLS = 5
const ROWS = 5
const GRID_X = 70
const GRID_TOP = 196
const GRID_W = W - GRID_X * 2
const CELL_GAP = 16
const CELL_W = (GRID_W - CELL_GAP * (COLS - 1)) / COLS
const CELL_H = 64
const ROW_GAP = 16

// The bus-bar (the wire the switch sits on).
const BUS_Y = 150

export function CloudActSwitch() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const p = cpPalette(mode)
  const reduced = usePrefersReducedMotion()

  // The master switch. Default OFF (panel powered, wiring on show) — the static
  // fallback shows the dependency before anything is thrown.
  const [thrown, setThrown] = useState(false)
  // sweep ∈ [0,1] — the current travelling the bus-bar after the throw.
  const [sweep, setSweep] = useState(0)
  const [focus, setFocus] = useState<number | null>(null)

  useEffect(() => {
    if (!thrown) {
      setSweep(0)
      return
    }
    if (reduced) {
      setSweep(1)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const s = clamp01((now - t0) / 900)
      setSweep(s)
      if (s < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [thrown, reduced])

  const grey = mode === "dark" ? "#4c5568" : "#9aa2b0"
  // Hex ink for mixHex (p.ink is a hex; p.muted is an rgba() string we can't mix).
  const inkHex = mode === "dark" ? "#f6ead0" : "#0d1b3d"
  const darkN = thrown ? EXPOSED : 0

  const verdict = thrown
    ? { word: "INACCESSIBLE", color: p.squeeze, line: "someone abroad threw the switch — and Europe's government went dark" }
    : { word: "WIRED IN", color: p.leverage, line: "~80% of the public estate runs on a platform with a foreign off-switch" }

  // The current sweep reaches a cell when sweep passes the cell's column fraction.
  function cellLit(col: number): number {
    if (!thrown) return 0
    const reach = clamp01((sweep - col / COLS) * COLS)
    return reach
  }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V36 · The Cloud-Act Switch"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: verdict.color }}
        >
          {thrown ? `${darkN} ACCOUNTS DARK` : `~${Math.round(MS_SHARE * 100)}% ON US PLATFORM`}
        </span>
      }
      caption={
        <>
          Europe&rsquo;s public sector runs <span style={{ color: p.squeeze }}>~80%</span> of its
          productivity software on Microsoft, and US-hosted data falls under US jurisdiction (the{" "}
          <span style={{ color: p.squeeze }}>CLOUD Act</span>). Throw the switch — click, or Space/Enter —
          and watch a set of accounts go <span style={{ color: p.squeeze }}>dark</span>. In 2025 the{" "}
          <span style={{ color: p.squeezeHi }}>ICC prosecutor&rsquo;s</span> Microsoft email went dark after a
          US sanction (he moved to Proton); attribution is disputed. The{" "}
          <span style={{ color: p.wonderHi }}>gold</span> cells — Euro-Office (Jun 2026), Denmark, Austria,
          France — are migrating off. Sources: Open Cloud Coalition / Compass Lexecon (~80% Microsoft,
          Jul 2025); reporting on K. Khan / ICC (2025–26); Euro-Office (Jun 2026).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A panel of ${CELLS.length} European public-sector accounts. ${EXPOSED} run on a US-controlled Microsoft platform, exposed to the CLOUD Act. ${
          thrown
            ? `The switch is thrown: ${darkN} accounts have gone dark and inaccessible, including the ICC prosecutor's email — which went inaccessible after a US sanction in 2025, attribution disputed.`
            : "The switch is off; the panel is powered and the wiring is on show."
        } ${RESIST} accounts have migrated off the platform to sovereign suites.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        <defs>
          <radialGradient id="ca-veto" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.squeezeHi} stopOpacity={lerp(0.04, 0.22, sweep)} />
            <stop offset="100%" stopColor={p.squeeze} stopOpacity={0} />
          </radialGradient>
          <marker id="ca-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={p.squeeze} />
          </marker>
        </defs>

        {/* veto bloom behind the panel, brightening as the current sweeps */}
        <rect x={0} y={120} width={W} height={H - 120} fill="url(#ca-veto)" />

        {/* THE SOURCE — Washington / the CLOUD Act, feeding the bus-bar from off-left */}
        <text x={GRID_X} y={64} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.18em" }}>
          THE PLATFORM &middot; US JURISDICTION (CLOUD ACT) &middot; ~80% MICROSOFT
        </text>
        <text x={GRID_X} y={100} fill={p.squeezeHi} style={{ fontSize: 26, fontWeight: 800 }}>
          THE OFF-SWITCH
        </text>

        {/* the bus-bar the switch sits on — feeds every exposed column */}
        <line
          x1={GRID_X}
          y1={BUS_Y}
          x2={W - GRID_X}
          y2={BUS_Y}
          stroke={thrown ? p.squeeze : p.blueprint}
          strokeWidth={thrown ? 3 : 1.6}
          strokeOpacity={thrown ? lerp(0.5, 0.95, sweep) : 0.7}
        />
        {/* the live current head racing the bus-bar (suppressed under reduced motion) */}
        {thrown && !reduced && sweep < 1 && (
          <circle
            cx={GRID_X + (W - GRID_X * 2) * sweep}
            cy={BUS_Y}
            r={5}
            fill={p.squeezeHi}
          />
        )}

        {/* THE SWITCH — a throw-lever sitting on the bus-bar, centre-top */}
        <g transform={`translate(${W / 2}, ${BUS_Y})`}>
          <circle cx={0} cy={0} r={7} fill={p.bg} stroke={thrown ? p.squeeze : p.leverage} strokeWidth={2} />
          {/* the lever arm — up (live, armed) when off, slammed down when thrown */}
          <line
            x1={0}
            y1={0}
            x2={thrown ? 30 : 24}
            y2={thrown ? 0 : -34}
            stroke={thrown ? p.squeeze : p.leverage}
            strokeWidth={4}
            strokeLinecap="round"
            style={{ transition: reduced ? "none" : "all 320ms cubic-bezier(.4,0,.2,1)" }}
          />
          <circle
            cx={thrown ? 30 : 24}
            cy={thrown ? 0 : -34}
            r={5}
            fill={thrown ? p.squeeze : p.leverage}
            style={{ transition: reduced ? "none" : "all 320ms cubic-bezier(.4,0,.2,1)" }}
          />
          <text x={0} y={-46} textAnchor="middle" fill={thrown ? p.squeezeHi : p.soft} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em" }}>
            US SANCTIONS / CLOUD ACT
          </text>
        </g>

        {/* THE GRID — European public-sector accounts on the platform */}
        {CELLS.map((c, i) => {
          const col = i % COLS
          const row = Math.floor(i / COLS)
          const x = GRID_X + col * (CELL_W + CELL_GAP)
          const y = GRID_TOP + row * (CELL_H + ROW_GAP)
          const lit = cellLit(col) // 0..1 how far the kill-current has reached this column
          const isDark = c.exposed && lit > 0.5
          const isFocus = focus === i

          // colour states: gold (resist) · cyan→grey (exposed, going dark) · base
          let stroke: string
          let fill: string
          let labelColor: string
          if (c.resist) {
            stroke = p.wonder
            fill = rgba(mode === "dark" ? "230,180,90" : "176,122,47", 0.14)
            labelColor = p.wonderHi
          } else {
            // exposed cell: lit cyan when armed, fading to grey as the current hits it
            const t = c.exposed ? lit : 0
            stroke = mixHex(c.emblem ? p.squeezeHi : p.squeeze, grey, t)
            fill = rgba(p.glowRGB, lerp(c.emblem ? 0.16 : 0.1, 0.03, t))
            labelColor = mixHex(c.emblem ? p.squeezeHi : inkHex, grey, t)
          }

          return (
            <g
              key={i}
              tabIndex={0}
              role="button"
              aria-label={
                c.resist
                  ? `${c.label}: migrated off the US platform to a sovereign suite (Euro-Office, Jun 2026)`
                  : c.emblem
                    ? `${c.label}: the ICC chief prosecutor's Microsoft email went dark after a US sanction in 2025 — attribution disputed; he moved to Proton Mail. ${isDark ? "Currently inaccessible." : "On the US platform."}`
                    : `${c.label}: runs on the US-controlled platform. ${isDark ? "Inaccessible — the switch is thrown." : "Powered."}`
              }
              onFocus={() => setFocus(i)}
              onBlur={() => setFocus((f) => (f === i ? null : f))}
              style={{ cursor: "default", outline: "none" }}
            >
              {/* feeder wire from the bus-bar down into the cell (only exposed cells) */}
              {c.exposed && (
                <line
                  x1={x + CELL_W / 2}
                  y1={BUS_Y + 8}
                  x2={x + CELL_W / 2}
                  y2={y}
                  stroke={isDark ? grey : mixHex(p.squeeze, grey, lit)}
                  strokeWidth={1}
                  strokeOpacity={thrown ? lerp(0.5, 0.2, lit) : 0.4}
                  strokeDasharray="2 4"
                />
              )}

              {c.emblem && !isDark && (
                <rect
                  x={x - 3}
                  y={y - 3}
                  width={CELL_W + 6}
                  height={CELL_H + 6}
                  rx={8}
                  fill="none"
                  stroke={p.squeezeHi}
                  strokeWidth={1}
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                />
              )}

              <rect
                x={x}
                y={y}
                width={CELL_W}
                height={CELL_H}
                rx={6}
                fill={fill}
                stroke={stroke}
                strokeWidth={isFocus ? 2.4 : c.emblem || c.resist ? 1.8 : 1.2}
                strokeOpacity={isDark ? 0.5 : 0.9}
                style={{ transition: reduced ? "none" : "stroke 420ms ease, fill 420ms ease" }}
              />

              {/* status LED — bright when live, dim grey when dark, gold when sovereign */}
              <circle
                cx={x + 11}
                cy={y + 12}
                r={3.4}
                fill={c.resist ? p.wonder : isDark ? grey : c.emblem ? p.squeezeHi : p.leverage}
              />

              <text
                x={x + CELL_W / 2}
                y={y + CELL_H / 2 + 2}
                textAnchor="middle"
                fill={labelColor}
                style={{
                  fontSize: c.label.length > 12 ? 10 : 11,
                  fontWeight: c.emblem || c.resist ? 700 : 500,
                  textDecoration: isDark ? "line-through" : "none",
                }}
              >
                {c.label}
              </text>

              {/* the emblem strike caption — only on the ICC cell */}
              {c.emblem && (
                <text
                  x={x + CELL_W / 2}
                  y={y + CELL_H - 8}
                  textAnchor="middle"
                  fill={isDark ? p.squeeze : p.soft}
                  style={{ fontSize: 7.5, letterSpacing: "0.02em" }}
                >
                  {isDark ? "went dark · disputed" : "Feb 2025 · → Proton"}
                </text>
              )}

              {/* DARK overlay — the inaccessible cross */}
              {isDark && (
                <g stroke={p.squeeze} strokeWidth={1.4} strokeOpacity={0.55}>
                  <line x1={x + 6} y1={y + 6} x2={x + CELL_W - 6} y2={y + CELL_H - 6} />
                  <line x1={x + CELL_W - 6} y1={y + 6} x2={x + 6} y2={y + CELL_H - 6} />
                </g>
              )}
            </g>
          )
        })}

        {/* legend row beneath the grid */}
        {(() => {
          const ly = GRID_TOP + ROWS * (CELL_H + ROW_GAP) + 14
          return (
            <g>
              <circle cx={GRID_X + 6} cy={ly} r={3.4} fill={p.leverage} />
              <text x={GRID_X + 16} y={ly + 4} fill={p.muted} style={{ fontSize: 10.5 }}>
                on US platform
              </text>
              <circle cx={GRID_X + 168} cy={ly} r={3.4} fill={grey} />
              <text x={GRID_X + 178} y={ly + 4} fill={p.muted} style={{ fontSize: 10.5 }}>
                gone dark / inaccessible
              </text>
              <circle cx={GRID_X + 372} cy={ly} r={3.4} fill={p.wonder} />
              <text x={GRID_X + 382} y={ly + 4} fill={p.muted} style={{ fontSize: 10.5 }}>
                Euro-Office · sovereign (Jun 2026)
              </text>
            </g>
          )
        })()}
      </svg>

      {/* verdict + the throw control */}
      <div className="mt-2 px-1">
        {/* exposure meter — share of the estate that the foreign switch can darken */}
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: p.hair }}
          aria-hidden
        >
          <div
            style={{
              width: `${(EXPOSED / CELLS.length) * 100}%`,
              height: "100%",
              background: thrown ? p.squeeze : mixHex(p.leverage, p.squeeze, 0.5),
              float: "left",
              transition: reduced ? "none" : "background 420ms ease",
            }}
          />
          <div
            style={{ width: `${(RESIST / CELLS.length) * 100}%`, height: "100%", background: p.wonder, float: "left" }}
          />
        </div>

        <p
          className="mt-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setThrown((v) => !v)}
            aria-pressed={thrown}
            aria-label={
              thrown
                ? "Reset the switch — restore the accounts"
                : "Throw the US SANCTIONS / CLOUD ACT switch — darken the accounts on the US platform"
            }
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "7px 16px",
              borderRadius: 8,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: thrown ? p.bg : p.squeezeHi,
              border: `1px solid ${p.squeeze}`,
              background: thrown ? p.squeeze : "transparent",
            }}
          >
            {thrown ? "◼ RESET — RESTORE ACCOUNTS" : "⏻ THROW THE SWITCH"}
          </button>
          <span
            className="tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", color: p.soft, fontSize: 11, whiteSpace: "nowrap" }}
          >
            {Math.round(MS_SHARE * 100)}% on Microsoft · {RESIST} migrating off
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
