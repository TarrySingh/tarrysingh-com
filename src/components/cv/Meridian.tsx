"use client"

import { useCallback, useState, type CSSProperties, type KeyboardEvent } from "react"
import {
  MERIDIAN_LANES,
  type MeridianData,
  type MeridianItem,
  type MeridianLaneId,
} from "./meridian-model"
import styles from "./cv.module.css"

/**
 * The Career Meridian: the profile's signature figure.
 *
 * A hand-drawn SVG (no chart library) of the career from 1995 to today:
 * faint technology-wave bands for the eras, four lanes (founder and CEO,
 * executive, board and advisory, thought leadership) and one bar per role.
 * Horizontal from 768px, vertical on phones; CSS shows one of the two.
 *
 * Accessibility: each drawing is role="img" with a description that points
 * at the page's <ol> (the real content). Interaction runs through a layer of
 * HTML buttons laid over the bars, so every role is reachable by keyboard
 * and touch, and the caption below reads the focused or hovered role.
 */

type Rect = { x: number; y: number; w: number; h: number }

const LANE_BY_ID = Object.fromEntries(MERIDIAN_LANES.map((l) => [l.id, l])) as Record<
  MeridianLaneId,
  (typeof MERIDIAN_LANES)[number]
>

const LANE_CLASS: Record<MeridianLaneId, string> = {
  "founder-ceo": styles.laneFounder,
  executive: styles.laneExecutive,
  "board-advisory": styles.laneBoard,
  "thought-leadership": styles.laneThought,
}

function clip(text: string, maxChars: number): string | null {
  if (maxChars < 4) return null
  if (text.length <= maxChars) return text
  return `${text.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`
}

function wrap(text: string, width: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (next.length > width && line) {
      lines.push(line)
      line = w
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = clip(`${kept[maxLines - 1]} ${lines[maxLines]}`, width) ?? kept[maxLines - 1]
    return kept
  }
  return lines
}

function tickYears(from: number, to: number): number[] {
  const out: number[] = []
  for (let y = Math.ceil(from / 5) * 5; y <= to; y += 5) out.push(y)
  return out
}

/* ── Horizontal geometry (viewBox units) ───────────────────────────────── */

const H_W = 1000
const H_LEFT = 166
const H_RIGHT = 18
const H_HEAD = 50
const H_ROW = 28
const H_BAR = 8
const H_PAD = 10
const H_AXIS = 36

function horizontalLayout(data: MeridianData) {
  const span = data.to - data.from
  const x = (year: number) => H_LEFT + ((year - data.from) / span) * (H_W - H_LEFT - H_RIGHT)
  const laneTop: Record<string, number> = {}
  const laneH: Record<string, number> = {}
  let y = H_HEAD + 8
  for (const lane of MERIDIAN_LANES) {
    laneTop[lane.id] = y
    laneH[lane.id] = H_PAD * 2 + data.rows[lane.id] * H_ROW
    y += laneH[lane.id]
  }
  const chartBottom = y
  const height = chartBottom + H_AXIS
  const rect = (it: MeridianItem): Rect => {
    const rowTop = laneTop[it.lane] + H_PAD + it.row * H_ROW
    const x0 = x(it.from)
    const w = Math.max(it.kind === "mark" ? 8 : 4, x(it.to) - x0)
    return { x: x0, y: rowTop + H_ROW - H_BAR - 4, w, h: H_BAR }
  }
  return { x, laneTop, laneH, chartBottom, height, rect }
}

/* ── Vertical geometry (phones) ─────────────────────────────────────────── */

const V_W = 360
const V_HEAD = 40
const V_LEFT = 40
const V_LANES_W = 216
const V_ERA_X = V_LEFT + V_LANES_W + 10
const V_PER_YEAR = 22

function verticalLayout(data: MeridianData) {
  const laneW = V_LANES_W / MERIDIAN_LANES.length
  const y = (year: number) => V_HEAD + (year - data.from) * V_PER_YEAR
  const laneX: Record<string, number> = {}
  MERIDIAN_LANES.forEach((lane, i) => {
    laneX[lane.id] = V_LEFT + i * laneW
  })
  const chartBottom = y(data.to)
  const height = chartBottom + 18
  const rect = (it: MeridianItem): Rect => {
    const rows = data.rows[it.lane]
    const colW = (laneW - 12) / rows
    const w = it.kind === "mark" ? Math.min(7, colW - 1) : Math.min(8, colW - 4)
    const x0 = laneX[it.lane] + 6 + it.row * colW + colW / 2 - w / 2
    const y0 = y(it.from)
    const h = Math.max(it.kind === "mark" ? w : 4, y(it.to) - y0)
    return { x: x0, y: y0, w, h }
  }
  return { y, laneX, laneW, chartBottom, height, rect }
}

function accessibleName(it: MeridianItem): string {
  return [it.title, it.org, it.span].filter(Boolean).join(", ")
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function Meridian({
  data,
  label,
  descriptionId,
  emptyLaneNote,
}: {
  data: MeridianData
  /** Short accessible name for the drawing. */
  label: string
  /** id of the <ol> that carries the same content as text. */
  descriptionId?: string
  /** Drawn along a lane with no public items (the teaser says where they are). */
  emptyLaneNote?: string
}) {
  const usedLanes = new Set(data.items.map((it) => it.lane))
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const [focusIdx, setFocusIdx] = useState(0)
  const activeId = hovered ?? pinned
  const active = data.items.find((it) => it.id === activeId) ?? null

  const select = useCallback((it: MeridianItem) => {
    setPinned(it.id)
    if (it.href) {
      const target = document.getElementById(it.href.slice(1))
      if (target) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
      }
    }
  }, [])

  const h = horizontalLayout(data)
  const v = verticalLayout(data)
  const years = tickYears(data.from, data.to)

  const itemClass = (it: MeridianItem) =>
    [
      styles.mItem,
      LANE_CLASS[it.lane],
      it.kind === "mark" ? styles.mMark : "",
      it.ongoing ? styles.mOngoing : "",
      activeId === it.id ? styles.mActive : "",
      activeId && activeId !== it.id ? styles.mMuted : "",
    ].join(" ")

  // Roving tab stop: the meridian is one stop in the tab order; the arrow
  // keys (and Home / End) move between its items in date order.
  const onKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
      Home: -Infinity,
      End: Infinity,
    }
    if (!(e.key in keys)) return
    e.preventDefault()
    const step = keys[e.key]
    const last = data.items.length - 1
    const next =
      step === -Infinity ? 0 : step === Infinity ? last : Math.min(last, Math.max(0, focusIdx + step))
    setFocusIdx(next)
    e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next]?.focus()
  }

  const overlay = (
    rects: Array<{ it: MeridianItem; r: Rect }>,
    vw: number,
    vh: number,
    vertical: boolean,
  ) => (
    <div
      className={styles.mOverlay}
      role="toolbar"
      aria-label="Items on the meridian, in date order. Use the arrow keys to move between them."
      aria-orientation={vertical ? "vertical" : "horizontal"}
      onKeyDown={onKeys}
    >
      {rects.map(({ it, r }, i) => {
        const style: CSSProperties = {
          left: `${((r.x + r.w / 2) / vw) * 100}%`,
          top: `${((r.y + r.h / 2) / vh) * 100}%`,
          width: vertical ? undefined : `${(r.w / vw) * 100}%`,
          height: vertical ? `${(r.h / vh) * 100}%` : undefined,
        }
        return (
          <button
            key={it.id}
            type="button"
            tabIndex={i === focusIdx ? 0 : -1}
            className={`${styles.mHit} ${vertical ? styles.mHitV : styles.mHitH}`}
            style={style}
            aria-label={accessibleName(it)}
            aria-controls="cv-meridian-card"
            onMouseEnter={() => setHovered(it.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => {
              setFocusIdx(i)
              setHovered(it.id)
            }}
            onBlur={() => setHovered(null)}
            onClick={() => select(it)}
          />
        )
      })}
    </div>
  )

  const hRects = data.items.map((it) => ({ it, r: h.rect(it) }))
  const vRects = data.items.map((it) => ({ it, r: v.rect(it) }))

  return (
    <figure className={styles.meridian} onKeyDown={(e) => e.key === "Escape" && setPinned(null)}>
      {/* ── Horizontal (tablet and up) ── */}
      <div className={`${styles.mFrame} ${styles.mHorizontal}`}>
        <svg
          viewBox={`0 0 ${H_W} ${h.height}`}
          className={styles.mSvg}
          role="img"
          aria-label={label}
          aria-describedby={descriptionId}
        >
          {data.bands.map((b, i) => {
            const x0 = h.x(b.from)
            const w = h.x(b.to) - x0
            const head = clip(`${b.numeral} · ${b.wave ?? b.title}`.toUpperCase(), Math.floor((w - 12) / 7.4))
            const title = b.wave ? clip(b.title, Math.floor((w - 12) / 6.3)) : null
            return (
              <g key={b.id}>
                <rect
                  x={x0}
                  y={0}
                  width={w}
                  height={h.chartBottom}
                  className={i % 2 === 0 ? styles.mBandA : styles.mBandB}
                />
                <line x1={x0} x2={x0} y1={0} y2={h.chartBottom} className={styles.mBandEdge} />
                {head ? (
                  <text x={x0 + 8} y={18} className={styles.mBandHead}>
                    {head}
                  </text>
                ) : null}
                {title ? (
                  <text x={x0 + 8} y={36} className={styles.mBandTitle}>
                    {title}
                  </text>
                ) : null}
              </g>
            )
          })}

          {MERIDIAN_LANES.map((lane, i) => (
            <g key={lane.id}>
              <line
                x1={0}
                x2={H_W - H_RIGHT}
                y1={h.laneTop[lane.id]}
                y2={h.laneTop[lane.id]}
                className={i === 0 ? styles.mRuleStrong : styles.mRule}
              />
              <circle
                cx={6}
                cy={h.laneTop[lane.id] + h.laneH[lane.id] / 2 - 3.5}
                r={3}
                className={`${styles.mLaneDot} ${LANE_CLASS[lane.id]}`}
              />
              <text
                x={16}
                y={h.laneTop[lane.id] + h.laneH[lane.id] / 2}
                className={styles.mLaneLabel}
              >
                {lane.label.toUpperCase()}
              </text>
              {emptyLaneNote && !usedLanes.has(lane.id) ? (
                <>
                  <line
                    x1={H_LEFT}
                    x2={H_W - H_RIGHT}
                    y1={h.laneTop[lane.id] + h.laneH[lane.id] / 2 - 3.5}
                    y2={h.laneTop[lane.id] + h.laneH[lane.id] / 2 - 3.5}
                    className={`${styles.mEmpty} ${LANE_CLASS[lane.id]}`}
                  />
                  <text
                    x={H_LEFT + 12}
                    y={h.laneTop[lane.id] + h.laneH[lane.id] / 2 - 8}
                    className={styles.mEmptyNote}
                  >
                    {emptyLaneNote}
                  </text>
                </>
              ) : null}
            </g>
          ))}
          <line
            x1={0}
            x2={H_W - H_RIGHT}
            y1={h.chartBottom}
            y2={h.chartBottom}
            className={styles.mRuleStrong}
          />

          {years.map((y) => (
            <g key={y}>
              <line
                x1={h.x(y)}
                x2={h.x(y)}
                y1={h.chartBottom}
                y2={h.chartBottom + 6}
                className={styles.mTick}
              />
              <text x={h.x(y)} y={h.chartBottom + 22} className={styles.mYear} textAnchor="middle">
                {y}
              </text>
            </g>
          ))}

          <line
            x1={h.x(data.now)}
            x2={h.x(data.now)}
            y1={H_HEAD + 4}
            y2={h.chartBottom + 6}
            className={styles.mNow}
          />
          <text x={h.x(data.now) - 5} y={H_HEAD + 2} className={styles.mNowLabel} textAnchor="end">
            TODAY
          </text>

          {hRects.map(({ it, r }) => {
            const label = r.w > 64 ? clip(it.title, Math.floor((r.w - 2) / 5.4)) : null
            return (
              <g key={it.id} className={itemClass(it)}>
                {it.kind === "mark" ? (
                  <rect
                    x={r.x + r.w / 2 - 4}
                    y={r.y}
                    width={8}
                    height={8}
                    transform={`rotate(45 ${r.x + r.w / 2} ${r.y + 4})`}
                    className={styles.mBar}
                  />
                ) : (
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={1.5} className={styles.mBar} />
                )}
                {it.ongoing ? (
                  <circle cx={r.x + r.w} cy={r.y + r.h / 2} r={3.5} className={styles.mCap} />
                ) : null}
                {label ? (
                  <text x={r.x} y={r.y - 5} className={styles.mBarLabel}>
                    {label}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
        {overlay(hRects, H_W, h.height, false)}
      </div>

      {/* ── Vertical (phones) ── */}
      <div className={`${styles.mFrame} ${styles.mVertical}`}>
        <svg
          viewBox={`0 0 ${V_W} ${v.height}`}
          className={styles.mSvg}
          role="img"
          aria-label={label}
          aria-describedby={descriptionId}
        >
          {data.bands.map((b, i) => {
            const y0 = v.y(b.from)
            const hgt = v.y(b.to) - y0
            const maxLines = Math.max(1, Math.floor((hgt - 22) / 13))
            const lines = wrap(b.title, 14, Math.min(4, maxLines))
            return (
              <g key={b.id}>
                <rect
                  x={0}
                  y={y0}
                  width={V_W}
                  height={hgt}
                  className={i % 2 === 0 ? styles.mBandA : styles.mBandB}
                />
                <line x1={0} x2={V_W} y1={y0} y2={y0} className={styles.mBandEdge} />
                <text x={V_ERA_X} y={y0 + 14} className={styles.mBandHead}>
                  {b.numeral}
                </text>
                {hgt > 30
                  ? lines.map((line, li) => (
                      <text key={li} x={V_ERA_X} y={y0 + 28 + li * 13} className={styles.mBandTitle}>
                        {line}
                      </text>
                    ))
                  : null}
              </g>
            )
          })}

          {MERIDIAN_LANES.map((lane) => (
            <g key={lane.id}>
              <line
                x1={v.laneX[lane.id]}
                x2={v.laneX[lane.id]}
                y1={V_HEAD - 6}
                y2={v.chartBottom}
                className={styles.mRule}
              />
              <text
                x={v.laneX[lane.id] + v.laneW / 2}
                y={V_HEAD - 14}
                className={styles.mLaneLabelV}
                textAnchor="middle"
              >
                {lane.short.toUpperCase()}
              </text>
              <circle
                cx={v.laneX[lane.id] + v.laneW / 2}
                cy={V_HEAD - 30}
                r={2.5}
                className={`${styles.mLaneDot} ${LANE_CLASS[lane.id]}`}
              />
              {emptyLaneNote && !usedLanes.has(lane.id) ? (
                <line
                  x1={v.laneX[lane.id] + v.laneW / 2}
                  x2={v.laneX[lane.id] + v.laneW / 2}
                  y1={V_HEAD}
                  y2={v.chartBottom}
                  className={`${styles.mEmpty} ${LANE_CLASS[lane.id]}`}
                />
              ) : null}
            </g>
          ))}

          {years.map((y) => (
            <g key={y}>
              <line x1={V_LEFT - 6} x2={V_LEFT} y1={v.y(y)} y2={v.y(y)} className={styles.mTick} />
              <text x={V_LEFT - 9} y={v.y(y) + 3.5} className={styles.mYear} textAnchor="end">
                {y}
              </text>
            </g>
          ))}

          <line
            x1={V_LEFT - 6}
            x2={V_LEFT + V_LANES_W}
            y1={v.y(data.now)}
            y2={v.y(data.now)}
            className={styles.mNow}
          />

          {vRects.map(({ it, r }) => (
            <g key={it.id} className={itemClass(it)}>
              {it.kind === "mark" ? (
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w * 0.75}
                  height={r.w * 0.75}
                  transform={`rotate(45 ${r.x + r.w * 0.375} ${r.y + r.w * 0.375})`}
                  className={styles.mBar}
                />
              ) : (
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={1.5} className={styles.mBar} />
              )}
              {it.ongoing ? (
                <circle cx={r.x + r.w / 2} cy={r.y + r.h} r={3.5} className={styles.mCap} />
              ) : null}
            </g>
          ))}
        </svg>
        {overlay(vRects, V_W, v.height, true)}
      </div>

      <figcaption id="cv-meridian-card" className={styles.mCard}>
        {active ? (
          <>
            <p className={styles.mCardLane}>
              <span className={`${styles.mCardDot} ${LANE_CLASS[active.lane]}`} aria-hidden="true" />
              {LANE_BY_ID[active.lane].label}
              {active.span ? <span className={styles.mCardSpan}>{active.span}</span> : null}
            </p>
            <p className={styles.mCardTitle}>{active.title}</p>
            {active.org ? <p className={styles.mCardOrg}>{active.org}</p> : null}
            {active.lines.length > 0 ? (
              <ul className={styles.mCardLines}>
                {active.lines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : null}
            {active.href ? (
              <p className={styles.mCardHint}>Select to read the full entry.</p>
            ) : null}
          </>
        ) : (
          <>
            <p className={styles.mCardLane}>
              Meridian · {data.from}–{Math.floor(data.now)}
            </p>
            <p className={styles.mCardIdle}>
              {data.items.length > 0
                ? "Point at a bar, or tab through them, to read each role."
                : "Eras and technology waves across the career."}
            </p>
          </>
        )}
      </figcaption>
    </figure>
  )
}
