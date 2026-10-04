/**
 * Mini Career Meridian for the one-page summary: a server-rendered SVG with
 * the technology eras as background bands and the roles as bars, grouped by
 * lane. Units are millimetres (1 unit = 1 mm at print size).
 */
import React from "react"
import type { EraView, Lane, RoleView } from "./data"

const LANE_ORDER: Lane[] = ["founder-ceo", "executive", "board-advisory", "thought-leadership"]
const LANE_LABEL: Record<Lane, string> = {
  "founder-ceo": "Founder · CEO",
  executive: "Executive",
  "board-advisory": "Board · Advisory",
  "thought-leadership": "Thought leadership",
}

const W = 176
const LABEL_W = 25
const X0 = LABEL_W
const X1 = W - 2
const ERA_H = 9.5
const ROW_H = 5.8
const BAR_H = 4.2
const LANE_PAD = 1.5
const AXIS_H = 5

const dec = (p: { y: number; m: number }) => p.y + (p.m - 1) / 12

/** Rough text width in mm for a font size in mm. */
const textW = (s: string, size: number, factor: number) => s.length * size * factor

/**
 * Fit a label into `room` mm. Prefers the whole text, then the part before a
 * colon or dash, then whole words with an ellipsis. Never cuts a word.
 */
function fit(text: string, size: number, factor: number, room: number, minChars = 4): string | null {
  const full = text.trim()
  if (textW(full, size, factor) <= room) return full
  const head = full.split(/[:\u2013\u2014]|\s-\s/)[0].trim()
  if (head && head !== full && textW(head, size, factor) <= room) return head
  let out = ""
  for (const word of (head || full).split(/\s+/)) {
    const next = out ? `${out} ${word}` : word
    if (textW(`${next}\u2026`, size, factor) > room) break
    out = next
  }
  return out.length >= minChars ? `${out}\u2026` : null
}

type Placed = { role: RoleView; row: number }

function pack(roles: RoleView[]): { placed: Placed[]; rows: number } {
  const sorted = [...roles].sort((a, b) => dec(a.start) - dec(b.start))
  const ends: number[] = []
  const placed: Placed[] = []
  for (const role of sorted) {
    let row = ends.findIndex((e) => e <= dec(role.start) + 0.01)
    if (row === -1) {
      row = ends.length
      ends.push(0)
    }
    ends[row] = dec(role.end)
    placed.push({ role, row })
  }
  return { placed, rows: Math.max(1, ends.length) }
}

export function Meridian({ roles, eras, now }: { roles: RoleView[]; eras: EraView[]; now: Date }) {
  if (roles.length === 0) return null
  const nowY = now.getUTCFullYear() + now.getUTCMonth() / 12
  const first = Math.min(...roles.map((r) => dec(r.start)), ...eras.map((e) => e.start))
  const t0 = Math.floor(first / 5) * 5
  const t1 = Math.ceil(nowY + 0.2)
  const x = (y: number) => X0 + ((y - t0) / (t1 - t0)) * (X1 - X0)

  const lanes = LANE_ORDER.map((lane) => ({
    lane,
    ...pack(roles.filter((r) => (r.lane ?? "executive") === lane)),
  })).filter((l) => l.placed.length > 0)

  let y = ERA_H + 1.5
  const laneBoxes = lanes.map((l) => {
    const h = LANE_PAD * 2 + l.rows * ROW_H
    const box = { ...l, top: y, h }
    y += h
    return box
  })
  const plotBottom = y
  const H = plotBottom + AXIS_H

  const ticks: number[] = []
  for (let t = t0; t <= t1; t += 5) ticks.push(t)

  const description = `Career timeline from ${Math.floor(first)} to the present: ${roles.length} roles across ${lanes
    .map((l) => LANE_LABEL[l.lane])
    .join(", ")}.`

  return (
    <svg className="mer" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={description} xmlns="http://www.w3.org/2000/svg">
      <title>{description}</title>

      {/* eras */}
      {eras.map((e, i) => {
        const ex0 = x(e.start)
        const ex1 = x(e.end)
        const room = ex1 - ex0 - 2
        const title = fit(e.title, 2.7, 0.5, room)
        const wave = e.wave ? fit(e.wave.toUpperCase(), 1.65, 0.78, room) : null
        return (
          <g key={e.id}>
            <rect
              x={ex0}
              y={0}
              width={Math.max(0, ex1 - ex0)}
              height={plotBottom}
              fill={i % 2 === 0 ? "rgba(201,142,79,0.10)" : "rgba(26,29,36,0.045)"}
            />
            {title && (
              <text className="era-t" x={ex0 + 1.2} y={3.9} fontSize={2.7} fill="#1a1d24">
                {title}
              </text>
            )}
            {wave && (
              <text x={ex0 + 1.2} y={7.2} fontSize={1.65} letterSpacing={0.18} fill="#666b79">
                {wave}
              </text>
            )}
          </g>
        )
      })}

      {/* year grid */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={ERA_H} y2={plotBottom} stroke="rgba(26,29,36,0.16)" strokeWidth={0.18} />
          {Math.abs(x(t) - x(nowY)) > 9.5 ? (
            <text x={x(t)} y={plotBottom + 3.6} fontSize={1.9} textAnchor="middle" fill="#666b79" letterSpacing={0.12}>
              {t}
            </text>
          ) : null}
        </g>
      ))}

      {/* lanes */}
      {laneBoxes.map((l) => (
        <g key={l.lane}>
          <line x1={0} x2={X1} y1={l.top} y2={l.top} stroke="rgba(26,29,36,0.42)" strokeWidth={0.22} />
          <text x={0} y={l.top + LANE_PAD + 3.4} fontSize={1.8} letterSpacing={0.2} fill="#3b404c">
            {LANE_LABEL[l.lane].toUpperCase()}
          </text>
          {l.placed.map(({ role, row }) => {
            const bx = x(dec(role.start))
            const bw = Math.max(0.9, x(dec(role.end)) - bx)
            const by = l.top + LANE_PAD + row * ROW_H + (ROW_H - BAR_H) / 2
            const hollow = l.lane === "board-advisory"
            const soft = l.lane === "thought-leadership"
            const fill = hollow ? "none" : soft ? "rgba(26,29,36,0.16)" : l.lane === "founder-ceo" ? "#c98e4f" : "#1a1d24"
            const stroke = hollow ? "#3b404c" : "none"
            const textFill = hollow || soft || l.lane === "founder-ceo" ? "#1a1d24" : "#fdfcfa"
            const label = fit(role.org, 2.2, 0.52, bw - 1.8, 2)
            return (
              <g key={role.id}>
                <rect x={bx} y={by} width={bw} height={BAR_H} rx={0.55} fill={fill} stroke={stroke} strokeWidth={0.28} />
                {label && (
                  <text x={bx + 0.9} y={by + BAR_H / 2 + 0.78} fontSize={2.2} fill={textFill} style={{ fontFamily: "var(--f-text)" }}>
                    {label}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      ))}
      <line x1={0} x2={X1} y1={plotBottom} y2={plotBottom} stroke="rgba(26,29,36,0.42)" strokeWidth={0.22} />

      {/* now */}
      <g>
        <line x1={x(nowY)} x2={x(nowY)} y1={ERA_H} y2={plotBottom + 1.2} stroke="#c98e4f" strokeWidth={0.4} />
        <text x={x(nowY) - 0.6} y={plotBottom + 3.6} fontSize={1.9} textAnchor="end" fill="#8d6840" letterSpacing={0.14}>
          NOW
        </text>
      </g>
    </svg>
  )
}
