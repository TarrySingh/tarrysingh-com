"use client"

/**
 * V26 — THE FROZEN GRID  (Chapter 7, "The Electrons We Priced Out: Energy").
 *
 * One kWh failure wears two costumes — factories switched off, the AI build-out
 * un-buildable — and this is the second costume's hardest edge: even the company
 * that WANTS to build cannot get plugged in. The Netherlands grid is full. The
 * connection queue holds ~14,044 regional + 212 national requests — roughly
 * 47 GW — with waits reaching ~10 years. TenneT, the national grid operator,
 * warns the network will fail to meet 2030 electricity demand; the Randstad /
 * Amsterdam-Schiphol core is effectively frozen to ~2035.
 *
 * The instrument is a connection queue. New demand — a factory, a data centre,
 * housing, an electrified plant — joins a line of cyan request-tickets. As a
 * ticket waits past the multi-year threshold it turns red: priced-out by time,
 * not money. A "GW WAITLISTED" + "WAIT (years)" mono counter climbs; a marker
 * shows the 2030 demand-shortfall line. The reader adds demand and watches it
 * freeze in the queue.
 *
 * REVEAL: Europe priced its electrons out and then ran out of wires to carry the
 * ones it has.
 *
 * Theme-aware (re-renders on the Read-mode flip via read-chart-kit), keyboard-
 * reachable (native buttons + ←/→ to scrub the queue), reduced-motion safe (the
 * slide-in is gated behind usePrefersReducedMotion), and meaningful at its
 * default — the queue is already long, already mostly red — as the static
 * fallback.
 *
 * Figures hard-coded. Sources: TenneT / NL Times (Jun 2026): ~14,044 regional +
 * 212 national connection requests (~47 GW) waitlisted, waits reaching ~10 years,
 * 2030 demand-shortfall warning, Randstad frozen to ~2035.
 */

import { useRef, useState } from "react"

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

// ── The headline figures (TenneT / NL Times, Jun 2026).
const REGIONAL_REQUESTS = 14044
const NATIONAL_REQUESTS = 212
const TOTAL_GW = 47 // GW waitlisted across the queue
const MAX_WAIT = 10 // years — the longest waits now reported
const FROZEN_YEAR = 2035 // Randstad / Amsterdam-Schiphol effectively frozen to
const SHORTFALL_YEAR = 2030 // TenneT: grid fails to meet this demand

// The wait (in years) past which a request is effectively priced-out by time.
const FREEZE_AT = 5

// A representative spread of the kinds of demand in the queue. Each carries an
// average GW so the counter sums to a realistic ~47 GW once the queue is full.
type Kind = { label: string; glyph: string; gw: number }
const KINDS: Kind[] = [
  { label: "Data centre", glyph: "▤", gw: 0.42 },
  { label: "Electrified plant", glyph: "▣", gw: 0.30 },
  { label: "Factory", glyph: "▥", gw: 0.24 },
  { label: "Housing block", glyph: "▦", gw: 0.12 },
  { label: "EV depot", glyph: "▧", gw: 0.18 },
]

// The queue we render — N tickets, oldest (longest-waited) first. Each ticket's
// wait is deterministic from its index so the figure is stable on every render.
const QUEUE_LEN = 26
type Ticket = { kind: Kind; wait: number; gw: number }

function buildQueue(): Ticket[] {
  const out: Ticket[] = []
  for (let i = 0; i < QUEUE_LEN; i++) {
    // Front of the line has waited longest; tail has just joined.
    const t = i / (QUEUE_LEN - 1)
    const wait = lerp(MAX_WAIT, 0.4, t)
    const kind = KINDS[i % KINDS.length]
    out.push({ kind, wait, gw: kind.gw })
  }
  return out
}

const QUEUE = buildQueue()

// Grid geometry (viewBox units).
const W = 920
const H = 452
const PADL = 56
const PADR = 56
const PADT = 132 // grid top — clears the big readouts + the FRONT/BACK axis labels above it
const PLOT_W = W - PADL - PADR
const COLS = 13
const ROWS = 2
const CELL_W = PLOT_W / COLS
const CELL_H = 116
const TICKET_W = CELL_W - 12
const TICKET_H = CELL_H - 18

// x for a column, y for a row in the queue grid.
const colX = (c: number) => PADL + c * CELL_W + 6
const rowY = (r: number) => PADT + r * (CELL_H + 8)

// The 2030-shortfall marker sits between the served head of the line and the
// frozen tail: tickets past this fraction of the queue won't be connected by 2030.
const SHORTFALL_FRAC = 0.42

const fmtInt = (v: number) => v.toLocaleString("en-US")
const fmtGw = (v: number) => v.toFixed(1)

export function FrozenGrid() {
  const wrapRef = useRef<HTMLElement | null>(null)
  const mode = useReadMode(wrapRef)
  const reduced = usePrefersReducedMotion()
  const p = cpPalette(mode)

  // How many tickets the reader has admitted into the queue. Default: the queue
  // is already long and already mostly red (the static fallback shows the freeze).
  const [n, setN] = useState(QUEUE_LEN)

  const shown = QUEUE.slice(0, n)
  const frontWait = shown.length ? shown[0].wait : 0 // longest current wait
  const waitlistedGw = (TOTAL_GW * n) / QUEUE_LEN
  const frozenCount = shown.filter((t) => t.wait >= FREEZE_AT).length
  const allFrozen = n > 0 && frozenCount === n

  // The 2030-shortfall column index (where the grid runs out of headroom).
  const shortfallCol = Math.round(COLS * SHORTFALL_FRAC)

  function addOne() {
    setN((v) => clamp(v + 1, 0, QUEUE_LEN))
  }
  function reset() {
    setN(0)
  }
  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      setN((v) => clamp(v + 1, 0, QUEUE_LEN))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      setN((v) => clamp(v - 1, 0, QUEUE_LEN))
    } else if (e.key === "Home") {
      e.preventDefault()
      setN(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setN(QUEUE_LEN)
    }
  }

  // Wait → colour: cyan (just joined) morphs to reserved red as it crosses FREEZE_AT.
  const waitColor = (wait: number) => {
    const t = clamp01(wait / MAX_WAIT)
    return mixHex(p.leverage, p.squeeze, t)
  }
  const waitColorHi = (wait: number) => {
    const t = clamp01(wait / MAX_WAIT)
    return mixHex(p.leverageHi, p.squeezeHi, t)
  }

  const counterColor = allFrozen ? p.squeeze : n === 0 ? p.leverage : waitColor(frontWait)

  const waitX = linScale(0, MAX_WAIT, 0, 1)

  const verdict =
    n === 0
      ? { word: "EMPTY GRID", color: p.leverage, line: "headroom to spare — add demand and watch it freeze" }
      : allFrozen
        ? { word: "FROZEN", color: p.squeeze, line: "the wires are full; even the company that wants to build cannot get plugged in" }
        : { word: "WAITLISTED", color: counterColor, line: "new demand joins the back of a multi-year line" }

  return (
    <PlateFrame
      wrapRef={wrapRef}
      mode={mode}
      palette={p}
      kicker="V26 · The Frozen Grid"
      controls={
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-mono), monospace", color: counterColor }}
        >
          {fmtGw(waitlistedGw)} GW · {frontWait.toFixed(1)} yr wait
        </span>
      }
      caption={
        <>
          The Netherlands grid is full. Some{" "}
          <span style={{ color: p.squeeze }}>~{fmtInt(REGIONAL_REQUESTS)}</span> regional and{" "}
          <span style={{ color: p.squeeze }}>{NATIONAL_REQUESTS}</span> national connection requests —
          roughly <span style={{ color: p.squeeze }}>~{TOTAL_GW} GW</span> — sit on waiting lists, with
          waits reaching <span style={{ color: p.squeeze }}>~{MAX_WAIT} years</span>. Press{" "}
          <span style={{ color: p.leverage }}>add demand</span> (or use ←/→): each request joins the
          queue cyan and turns red as it crosses the multi-year wait. TenneT warns the network will fail
          to meet {SHORTFALL_YEAR} demand; the Randstad / Amsterdam-Schiphol core is frozen to ~
          {FROZEN_YEAR}. Sources: TenneT / NL Times (Jun 2026).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A Netherlands grid-connection queue. ${n} of ${QUEUE_LEN} request-tickets admitted; ${fmtGw(
          waitlistedGw,
        )} gigawatts waitlisted, with the front of the line waiting ${frontWait.toFixed(
          1,
        )} years. ${frozenCount} tickets have crossed the multi-year freeze threshold. TenneT warns the grid will not meet ${SHORTFALL_YEAR} demand.`}
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "var(--font-mono), monospace" }}
      >
        {/* slow, mechanical join — a newly admitted ticket eases in from the back */}
        <style>{`@keyframes fg-join{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}`}</style>
        {/* the big mono counters — GW waitlisted + longest wait */}
        <text x={PADL} y={36} fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.18em" }}>
          GW WAITLISTED
        </text>
        <text x={PADL} y={74} fill={counterColor} style={{ fontSize: 38, fontWeight: 800 }}>
          {fmtGw(waitlistedGw)}
          <tspan dx={6} style={{ fontSize: 16, fontWeight: 600 }} fill={p.muted}>
            / {TOTAL_GW} GW
          </tspan>
        </text>

        <text x={W - PADR} y={36} textAnchor="end" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.18em" }}>
          LONGEST WAIT (YEARS)
        </text>
        <text x={W - PADR} y={74} textAnchor="end" fill={counterColor} style={{ fontSize: 38, fontWeight: 800 }}>
          {frontWait.toFixed(1)}
          <tspan dx={6} style={{ fontSize: 16, fontWeight: 600 }} fill={p.muted}>
            / {MAX_WAIT} yr
          </tspan>
        </text>

        {/* the 2030 demand-shortfall line — a vertical marker through the queue */}
        {(() => {
          const sx = colX(shortfallCol) - 6
          const top = PADT - 14
          const bot = rowY(ROWS - 1) + CELL_H
          return (
            <g>
              <line x1={sx} y1={top} x2={sx} y2={bot} stroke={p.squeeze} strokeWidth={1.2} strokeDasharray="3 5" opacity={0.85} />
              <text
                x={sx + 6}
                y={top + 2}
                fill={p.squeezeHi}
                style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em" }}
              >
                {SHORTFALL_YEAR} SHORTFALL — TenneT: grid fails past here →
              </text>
            </g>
          )
        })()}

        {/* the queue grid — request tickets, oldest (front) at top-left */}
        {shown.map((tk, i) => {
          const c = i % COLS
          const r = Math.floor(i / COLS)
          if (r >= ROWS) return null
          const x = colX(c)
          const y = rowY(r)
          const frozen = tk.wait >= FREEZE_AT
          const base = waitColor(tk.wait)
          const hi = waitColorHi(tk.wait)
          const fillA = frozen ? 0.22 : 0.14
          const isNewest = i === n - 1
          // Wait-bar fill inside the ticket.
          const barW = TICKET_W * waitX(tk.wait)
          return (
            <g
              key={`tk-${i}`}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation:
                  isNewest && !reduced ? "fg-join 420ms cubic-bezier(.4,0,.2,1)" : undefined,
              }}
            >
              <rect
                x={x}
                y={y}
                width={TICKET_W}
                height={TICKET_H}
                rx={5}
                fill={base}
                fillOpacity={fillA}
                stroke={frozen ? hi : base}
                strokeWidth={frozen ? 1.6 : 1.2}
                strokeOpacity={frozen ? 0.9 : 0.6}
              />
              {/* the glyph for the kind of demand */}
              <text
                x={x + TICKET_W / 2}
                y={y + 26}
                textAnchor="middle"
                fill={frozen ? hi : base}
                style={{ fontSize: 18 }}
              >
                {tk.kind.glyph}
              </text>
              {/* wait-progress bar — fills and reddens as the years stack */}
              <rect x={x + 6} y={y + TICKET_H - 20} width={TICKET_W - 12} height={5} rx={2.5} fill={p.hair} />
              <rect x={x + 6} y={y + TICKET_H - 20} width={Math.max(0, barW - 12)} height={5} rx={2.5} fill={base} />
              {/* the wait in years, mono */}
              <text
                x={x + TICKET_W / 2}
                y={y + TICKET_H - 26}
                textAnchor="middle"
                fill={frozen ? hi : p.muted}
                style={{ fontSize: 11, fontWeight: frozen ? 700 : 500 }}
              >
                {tk.wait.toFixed(1)}y
              </text>
            </g>
          )
        })}

        {/* empty-slot hairlines for the remaining queue positions (the line ahead) */}
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          if (i < n) return null
          const c = i % COLS
          const r = Math.floor(i / COLS)
          const x = colX(c)
          const y = rowY(r)
          return (
            <rect
              key={`slot-${i}`}
              x={x}
              y={y}
              width={TICKET_W}
              height={TICKET_H}
              rx={5}
              fill="none"
              stroke={p.blueprint}
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          )
        })}

        {/* the connection point — where the front of the line plugs in (or doesn't) */}
        <g>
          <line x1={PADL} y1={PADT - 22} x2={W - PADR} y2={PADT - 22} stroke={p.hair} strokeWidth={1} />
          <text x={PADL} y={PADT - 28} fill={p.leverage} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em" }}>
            ◂ FRONT OF LINE · CONNECTION POINT
          </text>
          <text x={W - PADR} y={PADT - 28} textAnchor="end" fill={p.soft} style={{ fontSize: 10.5, letterSpacing: "0.14em" }}>
            BACK OF LINE · NEW DEMAND ▸
          </text>
        </g>

        {/* bottom readout — frozen tally + Randstad note */}
        <text x={PADL} y={H - 18} fill={p.soft} style={{ fontSize: 11, letterSpacing: "0.04em" }}>
          {n === 0
            ? `queue empty — ${TOTAL_GW} GW of headroom on paper, ${fmtInt(REGIONAL_REQUESTS + NATIONAL_REQUESTS)} requests waiting in reality`
            : `${frozenCount} of ${n} tickets past the ${FREEZE_AT}-year freeze · Randstad / Amsterdam-Schiphol frozen to ~${FROZEN_YEAR}`}
        </text>
      </svg>

      {/* verdict + controls */}
      <div className="mt-2 px-1" onKeyDown={onKey} tabIndex={-1} style={{ outline: "none" }}>
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif), serif", color: p.muted, fontStyle: "italic" }}
        >
          <span style={{ color: verdict.color, fontStyle: "normal", fontWeight: 700 }}>{verdict.word}</span> —{" "}
          {verdict.line}.
        </p>

        {/* queue-fill meter: cyan (connected-soon) head vs red (frozen) tail */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: p.hair }} aria-hidden>
          <div
            style={{
              width: `${clamp01((n - frozenCount) / QUEUE_LEN) * 100}%`,
              height: "100%",
              background: p.leverage,
              float: "left",
            }}
          />
          <div
            style={{
              width: `${clamp01(frozenCount / QUEUE_LEN) * 100}%`,
              height: "100%",
              background: p.squeeze,
              float: "left",
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addOne}
            disabled={n >= QUEUE_LEN}
            aria-label="Add a connection request to the back of the queue"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "6px 16px",
              borderRadius: 999,
              cursor: n >= QUEUE_LEN ? "default" : "pointer",
              color: n >= QUEUE_LEN ? p.soft : p.bg,
              background: n >= QUEUE_LEN ? "transparent" : p.leverage,
              border: `1px solid ${n >= QUEUE_LEN ? p.hair : p.leverage}`,
              fontWeight: 700,
              opacity: n >= QUEUE_LEN ? 0.6 : 1,
            }}
          >
            + add demand
          </button>
          <button
            type="button"
            onClick={() => setN(QUEUE_LEN)}
            aria-label="Fill the queue to its full waitlist"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "6px 16px",
              borderRadius: 999,
              cursor: "pointer",
              color: p.squeeze,
              background: "transparent",
              border: `1px solid ${rgba(mode === "dark" ? "240,112,138" : "192,69,90", 0.5)}`,
              fontWeight: 700,
            }}
          >
            fill waitlist
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Empty the queue"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              padding: "6px 16px",
              borderRadius: 999,
              cursor: "pointer",
              color: p.muted,
              background: "transparent",
              border: `1px solid ${p.hair}`,
              fontWeight: 700,
            }}
          >
            reset
          </button>
          <span
            className="ml-1 tabular-nums"
            style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: p.soft }}
          >
            {n} / {QUEUE_LEN} in queue
          </span>
        </div>
      </div>
    </PlateFrame>
  )
}
