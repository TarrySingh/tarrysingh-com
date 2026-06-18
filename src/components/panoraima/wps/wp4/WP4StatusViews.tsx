"use client"

import { useMemo } from "react"
import { FolderCheck, FolderClock, AlertCircle } from "lucide-react"
import type { Wp4Registry, Wp4LE } from "@/lib/panoraima/types"
import {
  TRACK_ORDER,
  TRACK_COLOR,
  TRACK_SHORT,
  statusStyle,
  RUST,
} from "./wp4constants"

// Status order for the stacked bars — most "done" first, so the warm tones
// (review/development) sit at the leading edge of each track row.
const STATUS_ORDER = [
  "In review",
  "In development",
  "Materials in progress",
  "Lesson plan drafted",
  "Not started",
  "Status not set",
] as const

interface TrackRow {
  track: string
  total: number
  segments: { status: string; count: number; color: string }[]
}

export default function WP4StatusViews({ registry }: { registry: Wp4Registry }) {
  const les = registry.les

  // ---- Per-track breakdown, segmented by status -------------------------
  const trackRows = useMemo<TrackRow[]>(() => {
    return TRACK_ORDER.map((track) => {
      const inTrack = les.filter((l: Wp4LE) => l.track === track)
      const byStatus = new Map<string, number>()
      inTrack.forEach((l: Wp4LE) => {
        byStatus.set(l.status, (byStatus.get(l.status) ?? 0) + 1)
      })
      const ordered = [...byStatus.keys()].sort(
        (a, b) => statusRank(a) - statusRank(b),
      )
      const segments = ordered.map((status) => ({
        status,
        count: byStatus.get(status) ?? 0,
        color: statusStyle(status).color,
      }))
      return { track, total: inTrack.length, segments }
    })
  }, [les])

  // Shared scale: widest track defines 100% of the bar lane (proportional).
  const maxTrackTotal = Math.max(1, ...trackRows.map((r) => r.total))

  // Distinct statuses actually present, for the legend.
  const presentStatuses = useMemo(() => {
    const set = new Set<string>()
    trackRows.forEach((r) => r.segments.forEach((s) => set.add(s.status)))
    return [...set].sort((a, b) => statusRank(a) - statusRank(b))
  }, [trackRows])

  // ---- Materials coverage ----------------------------------------------
  const withMaterials = registry.summary.with_materials
  const pending = registry.summary.materials_pending
  const materialsTotal = Math.max(1, withMaterials + pending)
  const coveragePct = Math.round((withMaterials / materialsTotal) * 100)

  // ---- Missing status (data-quality nudge) ------------------------------
  const missingStatus = registry.summary.by_status["Status not set"] ?? 0
  const missingPct = Math.round(
    (missingStatus / Math.max(1, registry.summary.total_les)) * 100,
  )

  return (
    <section>
      <div className="mb-8">
        <div
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
          style={{ color: RUST }}
        >
          Coverage
        </div>
        <h2 className="text-2xl md:text-[2rem] font-bold tracking-[-0.02em] text-[#16181D]">
          Progress across the tracks
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280] max-w-2xl">
          How far each track has come, and where lesson materials are still
          pending.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ---- Per-track stacked bars ---- */}
        <div className="lg:col-span-2 rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 transition-colors hover:border-[#16181D]/20">
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
              Lesson events by track &amp; status
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-[#9CA3AF]">
              {les.length} LEs total
            </span>
          </div>

          <ol className="space-y-5">
            {trackRows.map((row) => {
              const laneWidth = (row.total / maxTrackTotal) * 100
              return (
                <li key={row.track}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#16181D]">
                      <span
                        className="w-2 h-2 rounded-[2px] flex-shrink-0"
                        style={{ background: TRACK_COLOR[row.track] ?? "#9CA3AF" }}
                      />
                      {TRACK_SHORT[row.track] ?? row.track}
                    </span>
                    <span className="font-mono text-[11px] font-bold tabular-nums text-[#16181D]">
                      {row.total}
                    </span>
                  </div>
                  <div className="h-3 rounded-[3px] bg-[#F4F4F2] overflow-hidden">
                    <div
                      className="flex h-full overflow-hidden transition-all duration-700 ease-out"
                      style={{ width: `${laneWidth}%` }}
                    >
                      {row.segments.map((seg) => {
                        const segPct = (seg.count / Math.max(1, row.total)) * 100
                        return (
                          <div
                            key={seg.status}
                            className="h-full min-w-0"
                            style={{
                              width: `${segPct}%`,
                              background: seg.color,
                            }}
                            title={`${seg.status}: ${seg.count}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Legend */}
          <div className="mt-7 pt-5 border-t border-[#E7E7EA] flex flex-wrap items-center gap-x-5 gap-y-2">
            {presentStatuses.map((status) => (
              <span
                key={status}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6B7280]"
              >
                <span
                  className="w-2 h-2 rounded-[2px]"
                  style={{ background: statusStyle(status).color }}
                />
                {statusStyle(status).label}
              </span>
            ))}
          </div>
        </div>

        {/* ---- Right rail: materials coverage + missing status ---- */}
        <div className="flex flex-col gap-4">
          {/* Materials coverage */}
          <div className="rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 transition-colors hover:border-[#16181D]/20">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF] mb-5">
              Materials coverage
            </h3>

            <div className="flex items-center gap-5">
              <Ring pct={coveragePct} />
              <div className="space-y-3 min-w-0">
                <CoverageRow
                  icon={<FolderCheck className="w-3.5 h-3.5" />}
                  label="With materials"
                  value={withMaterials}
                  color={RUST}
                />
                <CoverageRow
                  icon={<FolderClock className="w-3.5 h-3.5" />}
                  label="Pending"
                  value={pending}
                  color="#9CA3AF"
                />
              </div>
            </div>

            <p className="mt-5 text-[12px] text-[#6B7280] leading-relaxed">
              <span
                className="font-mono font-bold tabular-nums"
                style={{ color: RUST }}
              >
                {coveragePct}%
              </span>{" "}
              of lesson events already have at least one file in their materials
              folder.
            </p>
          </div>

          {/* Missing-status callout */}
          <div className="rounded-xl border border-[#E7E7EA] bg-[#FAFAF9] p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E7E7EA] flex items-center justify-center text-[#6B7280] flex-shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: RUST }}
                >
                  Data quality nudge
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span
                    className="text-3xl font-bold tabular-nums tracking-[-0.02em]"
                    style={{ color: missingStatus === 0 ? "#16181D" : RUST }}
                  >
                    {missingStatus}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#9CA3AF] tabular-nums">
                    of {registry.summary.total_les} · {missingPct}%
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-[#6B7280] leading-relaxed">
                  {missingStatus === 0
                    ? "Every lesson event has a status set — the register is clean."
                    : "lesson events have no status set. Setting these unlocks accurate progress tracking across the tracks."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ----------------------------------------------------------------------- */

function statusRank(status: string): number {
  const i = STATUS_ORDER.indexOf(status as (typeof STATUS_ORDER)[number])
  return i === -1 ? STATUS_ORDER.length : i
}

function CoverageRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-white flex-shrink-0"
        style={{ background: color }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-lg font-bold tabular-nums text-[#16181D] leading-none">
          {value}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9CA3AF] mt-1">
          {label}
        </div>
      </div>
    </div>
  )
}

// Thin hairline ring — flat, single rust arc on a faint track.
function Ring({ pct }: { pct: number }) {
  const size = 96
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const filled = (pct / 100) * c

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E7E7EA"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={RUST}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c - filled}`}
        strokeDashoffset={c / 4}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.7s ease-out" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-[#16181D] font-bold tabular-nums"
        style={{ fontSize: "20px", fontFamily: "var(--font-mono, monospace)" }}
      >
        {pct}%
      </text>
    </svg>
  )
}
