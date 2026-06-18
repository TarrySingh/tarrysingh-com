"use client"

import { useMemo } from "react"
import {
  Layers, FolderCheck, FileClock, Handshake, AlertTriangle,
} from "lucide-react"
import type { Wp4Registry } from "@/lib/panoraima/types"
import { TRACK_ORDER, TRACK_COLOR, TRACK_SHORT, statusStyle } from "./wp4constants"

interface KpiTile {
  label: string
  value: number
  icon: typeof Layers
  accent: string   // tailwind gradient classes for the top-accent bar + icon tint
}

export default function WP4Overview({ registry }: { registry: Wp4Registry }) {
  const { summary } = registry

  const kpis: KpiTile[] = [
    { label: "Total LEs",          value: summary.total_les,           icon: Layers,        accent: "from-sky-500 to-sky-700" },
    { label: "With materials",     value: summary.with_materials,      icon: FolderCheck,   accent: "from-emerald-500 to-emerald-700" },
    { label: "Materials pending",  value: summary.materials_pending,   icon: FileClock,     accent: "from-amber-500 to-amber-700" },
    { label: "RealAI commitments", value: summary.realai.total,        icon: Handshake,     accent: "from-gold-500 to-gold-700" },
    { label: "Needs action",       value: summary.realai.needs_action, icon: AlertTriangle, accent: "from-rose-500 to-rose-700" },
  ]

  // By-track bars — only tracks present in the summary, in canonical order.
  const trackRows = useMemo(() => {
    const rows = TRACK_ORDER
      .filter((t) => t in summary.by_track)
      .map((t) => ({ track: t as string, count: summary.by_track[t] }))
    const maxCount = Math.max(1, ...rows.map((r) => r.count))
    return { rows, maxCount }
  }, [summary.by_track])

  // By-status chips — ordered by count desc.
  const statusRows = useMemo(() => {
    return Object.entries(summary.by_status).sort((a, b) => b[1] - a[1])
  }, [summary.by_status])

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Overview
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          Where WP4 stands
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          A live read on the {summary.total_les} Learning Events spread across the four
          curriculum tracks — what has materials, what is pending, and where our
          RealAI authoring &amp; review commitments sit.
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <div
              key={k.label}
              className="relative rounded-2xl overflow-hidden border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${k.accent}`} />
              <div className="flex items-start justify-between gap-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 leading-snug">
                  {k.label}
                </div>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${k.accent} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-bold tabular-nums text-navy-900">
                {k.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Wiki ↔ SharePoint reconciliation — the LE list is the wiki master;
          SharePoint is where material gets dropped against it. */}
      {registry.summary.coverage && (
        <div className="mb-8 rounded-2xl border border-gray-100 bg-gradient-to-br from-navy-50/40 to-white p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-navy-500 mb-3">
            Wiki master <span className="text-gray-300">↔</span> SharePoint material
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums text-navy-900">{registry.summary.coverage.wiki_total}</span>
              <span className="text-gray-500">Learning Events on the wiki (the canonical list)</span>
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums text-emerald-600">{registry.summary.coverage.with_sharepoint_material}</span>
              <span className="text-gray-500">have material dropped in SharePoint</span>
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums text-amber-600">{registry.summary.coverage.awaiting_material}</span>
              <span className="text-gray-500">still awaiting material</span>
            </span>
          </div>
          {registry.summary.coverage.off_wiki > 0 && (
            <div className="mt-3 text-[12px] text-gray-500">
              <span className="font-semibold text-gray-600">{registry.summary.coverage.off_wiki}</span> draft/planned codes exist in SharePoint registries but aren&apos;t on the wiki master yet — a reconciliation gap to close (ideally the two lists match exactly).
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By track */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-6 md:p-7 shadow-sm">
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-navy-700">
              By track
            </h3>
            <span className="text-[11px] text-gray-400 font-mono tabular-nums">
              {trackRows.rows.length} tracks
            </span>
          </div>
          <ul className="space-y-3">
            {trackRows.rows.map(({ track, count }) => {
              const color = TRACK_COLOR[track] ?? TRACK_COLOR["Unknown"]
              const widthPct = (count / trackRows.maxCount) * 100
              return (
                <li key={track} className="flex items-center gap-3">
                  <span className="w-24 md:w-28 text-[12px] font-semibold text-navy-800 truncate text-right flex-shrink-0">
                    {TRACK_SHORT[track] ?? track}
                  </span>
                  <div className="flex-1 relative h-7 rounded-lg bg-gray-50 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                      style={{
                        width: `${widthPct}%`,
                        background: `linear-gradient(90deg, ${color}dd, ${color}aa)`,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-[13px] font-bold tabular-nums text-navy-900 flex-shrink-0">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* By status */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-7 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-navy-700 mb-5">
            By status
          </h3>
          <ul className="space-y-2.5">
            {statusRows.map(([status, count]) => {
              const s = statusStyle(status)
              return (
                <li key={status} className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text}`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="text-[13px] font-bold tabular-nums text-navy-900 flex-shrink-0">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
