"use client"

import Link from "next/link"
import { ArrowRight, FileText, Target, Package, AlertCircle } from "lucide-react"
import type { WpHubEntry } from "@/lib/panoraima/types"
import {
  INK,
  SLATE,
  MUTE,
  FAINT,
  LINE,
  SURFACE,
  OK,
  OK_SOFT,
  WARN,
  WARN_SOFT,
  wpColor,
} from "../consortiumTokens"

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
  const statusStyle = {
    active: { background: OK_SOFT, color: OK, borderColor: OK },
    sparse: { background: WARN_SOFT, color: WARN, borderColor: WARN },
    empty: { background: SURFACE, color: FAINT, borderColor: LINE },
    unseen: { background: SURFACE, color: FAINT, borderColor: LINE },
  }[entry.status]

  const totalFiles = entry.stats?.total_files ?? 0
  const byExt = entry.stats?.by_ext ?? {}

  // WP accent derives from the consortium navy→cobalt→teal ramp, not the data hex.
  const accent = wpColor(entry.wp)

  const classNames = [
    "relative overflow-hidden rounded-2xl border bg-white",
    "p-6 md:p-7 animate-fade-up group",
    disabled ? "opacity-60 cursor-not-allowed" : "premium-card",
  ].join(" ")

  const innerContent = (
    <>
      {/* Accent bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}00)` }}
      />

      {/* Hover wash */}
      {!disabled && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 0%, ${accent}10, transparent 60%)`,
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-semibold text-white"
              style={{ background: accent }}
            >
              <span aria-hidden>{entry.emoji}</span>
            </div>
            <div>
              <div
                className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]"
                style={{ color: FAINT }}
              >
                {entry.wp}
              </div>
              <h3 className="text-lg font-bold leading-tight" style={{ color: INK }}>
                {entry.short}
              </h3>
            </div>
          </div>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
            style={statusStyle}
          >
            {statusLabel}
          </span>
        </div>

        {/* Full name + description */}
        <div className="text-[11px] mb-1 font-medium" style={{ color: MUTE }}>
          {entry.name}
        </div>
        <p
          className="text-sm leading-relaxed mb-5 line-clamp-3 min-h-[60px]"
          style={{ color: SLATE }}
        >
          {entry.description}
        </p>

        {/* Stats strip */}
        {totalFiles > 0 ? (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div>
              <div
                className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider"
                style={{ color: FAINT }}
              >
                <FileText className="w-3 h-3" /> Files
              </div>
              <div className="mt-0.5 text-lg font-bold tabular-nums" style={{ color: INK }}>
                {totalFiles}
              </div>
            </div>
            <div>
              <div
                className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider"
                style={{ color: FAINT }}
              >
                <Target className="w-3 h-3" /> Tasks
              </div>
              <div className="mt-0.5 text-lg font-bold tabular-nums" style={{ color: INK }}>
                {entry.task_count}
              </div>
            </div>
            <div>
              <div
                className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider"
                style={{ color: FAINT }}
              >
                <Package className="w-3 h-3" /> Deliv.
              </div>
              <div className="mt-0.5 text-lg font-bold tabular-nums" style={{ color: INK }}>
                {entry.deliverable_count}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 text-[12px] mb-5"
            style={{ color: MUTE }}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Source folder empty, awaiting first deliverable
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border"
                  style={{ background: SURFACE, borderColor: LINE, color: SLATE }}
                >
                  <span className="font-semibold tabular-nums">{n}</span>
                  <span style={{ color: FAINT }}>{ext}</span>
                </span>
              ))}
          </div>
        )}

        {/* CTA */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: LINE }}
        >
          <span
            className={`text-[12px] font-mono font-semibold uppercase tracking-[0.15em] transition-colors ${
              disabled
                ? ""
                : "group-hover:!text-[#2251FF]"
            }`}
            style={{ color: disabled ? FAINT : MUTE }}
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
            <ArrowRight
              className="w-4 h-4 transition-all group-hover:translate-x-0.5 group-hover:!text-[#2251FF]"
              style={{ color: FAINT }}
            />
          )}
        </div>
      </div>
    </>
  )

  const style = {
    animationDelay: `${delay}ms`,
    borderColor: LINE,
  } as React.CSSProperties

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
