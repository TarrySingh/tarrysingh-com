"use client"

import Link from "next/link"
import { ArrowRight, FileText, Target, Package, AlertCircle } from "lucide-react"
import type { WpHubEntry } from "@/lib/panoraima/types"

interface Props {
  entry: WpHubEntry
  delay?: number
}

/** One card on the Work Packages hub. */
export default function WPCard({ entry, delay = 0 }: Props) {
  const disabled = entry.status === "empty" || entry.status === "unseen"
  const sparse = entry.status === "sparse"
  const statusLabel = {
    active: "Active",
    sparse: "In progress",
    empty: "Not yet started",
    unseen: "Not yet started",
  }[entry.status]
  const statusColor = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    sparse: "bg-gold-50 text-gold-700 border-gold-200",
    empty: "bg-gray-50 text-gray-400 border-gray-200",
    unseen: "bg-gray-50 text-gray-400 border-gray-200",
  }[entry.status]

  const totalFiles = entry.stats?.total_files ?? 0
  const byExt = entry.stats?.by_ext ?? {}

  const classNames = [
    "relative overflow-hidden rounded-2xl border border-gray-100 bg-white",
    "p-6 md:p-7 animate-fade-up group",
    disabled ? "opacity-60 cursor-not-allowed" : "premium-card",
  ].join(" ")

  const innerContent = (
    <>
      {/* Colored bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${entry.color}, ${entry.color}00)` }}
      />

      {/* Hover gradient wash */}
      {!disabled && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 0%, ${entry.color}10, transparent 60%)`,
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-semibold text-white"
              style={{ background: entry.color }}
            >
              <span aria-hidden>{entry.emoji}</span>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-gray-400">
                {entry.wp}
              </div>
              <h3 className="text-lg font-bold text-navy-900 leading-tight">{entry.short}</h3>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Full name + description */}
        <div className="text-[11px] text-gray-500 mb-1 font-medium">{entry.name}</div>
        <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3 min-h-[60px]">
          {entry.description}
        </p>

        {/* Stats strip */}
        {totalFiles > 0 ? (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <FileText className="w-3 h-3" /> Files
              </div>
              <div className="mt-0.5 text-lg font-bold text-navy-900 tabular-nums">
                {totalFiles}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <Target className="w-3 h-3" /> Tasks
              </div>
              <div className="mt-0.5 text-lg font-bold text-navy-900 tabular-nums">
                {entry.task_count}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <Package className="w-3 h-3" /> Deliv.
              </div>
              <div className="mt-0.5 text-lg font-bold text-navy-900 tabular-nums">
                {entry.deliverable_count}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-5">
            <AlertCircle className="w-3.5 h-3.5" />
            Source folder empty — awaiting first deliverable
          </div>
        )}

        {/* File-type chips (only top 4) */}
        {totalFiles > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {Object.entries(byExt)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([ext, n]) => (
                <span
                  key={ext}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-gray-50 border border-gray-100 text-gray-600"
                >
                  <span className="font-semibold tabular-nums">{n}</span>
                  <span className="text-gray-400">{ext}</span>
                </span>
              ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span
            className={`text-[12px] font-semibold uppercase tracking-[0.15em] ${
              disabled ? "text-gray-300" : "text-gray-400 group-hover:text-navy-900"
            } transition-colors`}
          >
            {disabled && entry.status === "unseen"
              ? "Folder not synced"
              : sparse
              ? "Preview →"
              : totalFiles === 0
              ? "Coming soon"
              : "Open dashboard"}
          </span>
          {!disabled && (
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-navy-900 group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
    </>
  )

  const style = { animationDelay: `${delay}ms` } as React.CSSProperties

  if (disabled) {
    return (
      <div className={classNames} style={style}>
        {innerContent}
      </div>
    )
  }

  return (
    <Link
      href={`/experiments/panoraima/wps/${entry.wp.toLowerCase()}`}
      className={classNames}
      style={style}
      prefetch={false}
    >
      {innerContent}
    </Link>
  )
}
