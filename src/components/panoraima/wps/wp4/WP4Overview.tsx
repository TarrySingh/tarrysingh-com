"use client"

import { useMemo } from "react"
import {
  Layers, FolderCheck, FileClock, Handshake, AlertTriangle,
} from "lucide-react"
import type { Wp4Registry } from "@/lib/panoraima/types"
import { TRACK_ORDER, TRACK_COLOR, TRACK_SHORT, statusStyle, RUST } from "./wp4constants"

interface KpiTile {
  label: string
  value: number
  icon: typeof Layers
  accent?: boolean   // rust emphasis (reserved for "needs action")
}

export default function WP4Overview({ registry }: { registry: Wp4Registry }) {
  const { summary } = registry

  const kpis: KpiTile[] = [
    { label: "Total LEs",          value: summary.total_les,           icon: Layers },
    { label: "With materials",     value: summary.with_materials,      icon: FolderCheck },
    { label: "Materials pending",  value: summary.materials_pending,   icon: FileClock },
    { label: "RealAI commitments", value: summary.realai.total,        icon: Handshake },
    { label: "Needs action",       value: summary.realai.needs_action, icon: AlertTriangle, accent: true },
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
      {/* ── Section header ───────────────────────────────────────── */}
      <div className="mb-8">
        <div className="font-mono text-[13px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: RUST }}>
          Overview
        </div>
        <h2 className="text-2xl md:text-[2rem] font-bold tracking-[-0.02em] text-[#16181D]">
          Where WP4 stands
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#444A55] max-w-2xl">
          A live read on the {summary.total_les} Learning Events spread across the four
          curriculum tracks — what has materials, what is pending, and where our
          RealAI authoring &amp; review commitments sit.
        </p>
      </div>

      {/* ── KPI stat band ────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 border-t border-[#E7E7EA]">
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <div
              key={k.label}
              className={`py-5 ${i > 0 ? "md:border-l border-[#E7E7EA] md:pl-6" : ""}`}
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: k.accent ? RUST : "#5B616B" }}
                />
                <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-[#444A55] leading-snug">
                  {k.label}
                </span>
              </div>
              <div
                className="mt-2 text-3xl md:text-[2.4rem] leading-none font-bold tabular-nums tracking-[-0.02em] text-[#16181D]"
                style={k.accent ? { color: RUST } : undefined}
              >
                {k.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Wiki ↔ SharePoint reconciliation ─────────────────────────
          the LE list is the wiki master; SharePoint is where material
          gets dropped against it. */}
      {registry.summary.coverage && (
        <div className="mb-8 rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 shadow-[0_1px_3px_rgba(20,22,27,0.06)] transition-all hover:shadow-[0_4px_14px_rgba(20,22,27,0.08)] hover:border-[#16181D]/25">
          <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-[#444A55] mb-4">
            Wiki master <span className="text-[#D7D7DB]">↔</span> SharePoint material
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E7EA]">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <div className="text-[2.4rem] leading-none font-bold tabular-nums tracking-[-0.02em] text-[#16181D]">
                {registry.summary.coverage.wiki_total}
              </div>
              <div className="mt-2 text-[14.5px] leading-snug text-[#444A55]">
                Learning Events on the wiki <span className="text-[#5B616B]">(the canonical list)</span>
              </div>
            </div>
            <div className="py-4 sm:py-0 sm:px-6">
              <div className="text-[2.4rem] leading-none font-bold tabular-nums tracking-[-0.02em] text-[#16181D]">
                {registry.summary.coverage.with_sharepoint_material}
              </div>
              <div className="mt-2 text-[14.5px] leading-snug text-[#444A55]">
                have material dropped in SharePoint
              </div>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <div className="text-[2.4rem] leading-none font-bold tabular-nums tracking-[-0.02em]" style={{ color: RUST }}>
                {registry.summary.coverage.awaiting_material}
              </div>
              <div className="mt-2 text-[14.5px] leading-snug text-[#444A55]">
                still awaiting material
                <span className="ml-1.5 font-mono text-[11px] uppercase tracking-[0.1em] px-2 py-1 rounded bg-[#16181D] text-white align-middle">
                  to reconcile
                </span>
              </div>
            </div>
          </div>
          {registry.summary.coverage.off_wiki > 0 && (
            <div className="mt-5 pt-4 border-t border-[#E7E7EA] text-[13.5px] leading-relaxed text-[#444A55]">
              <span className="font-mono font-bold tabular-nums text-[#16181D]">{registry.summary.coverage.off_wiki}</span> draft/planned codes exist in SharePoint registries but aren&apos;t on the wiki master yet — a reconciliation gap to close (ideally the two lists match exactly).
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── By track ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 shadow-[0_1px_3px_rgba(20,22,27,0.06)] transition-all hover:shadow-[0_4px_14px_rgba(20,22,27,0.08)] hover:border-[#16181D]/25">
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h3 className="font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-[#16181D]">
              By track
            </h3>
            <span className="font-mono text-[12px] uppercase tracking-[0.12em] tabular-nums text-[#444A55]">
              {trackRows.rows.length} tracks
            </span>
          </div>
          <ul className="space-y-3.5">
            {trackRows.rows.map(({ track, count }) => {
              const color = TRACK_COLOR[track] ?? TRACK_COLOR["Unknown"]
              const widthPct = (count / trackRows.maxCount) * 100
              return (
                <li key={track} className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 w-24 md:w-32 flex-shrink-0 justify-end">
                    <span className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{ background: color }} />
                    <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#444A55] truncate">
                      {TRACK_SHORT[track] ?? track}
                    </span>
                  </span>
                  <div className="flex-1 relative h-2 rounded-[2px] bg-[#F1F1F0] overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-[2px] transition-all duration-700 ease-out"
                      style={{ width: `${widthPct}%`, background: color }}
                    />
                  </div>
                  <span className="w-9 text-right font-mono text-[13.5px] font-bold tabular-nums text-[#16181D] flex-shrink-0">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── By status ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 shadow-[0_1px_3px_rgba(20,22,27,0.06)] transition-all hover:shadow-[0_4px_14px_rgba(20,22,27,0.08)] hover:border-[#16181D]/25">
          <h3 className="font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-[#16181D] mb-5">
            By status
          </h3>
          <ul className="space-y-2.5">
            {statusRows.map(([status, count]) => {
              const s = statusStyle(status)
              return (
                <li key={status} className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border font-mono text-[12px] uppercase tracking-[0.06em] ${s.bg} ${s.text}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-[2px] flex-shrink-0" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-mono text-[13.5px] font-bold tabular-nums text-[#16181D] flex-shrink-0">
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
