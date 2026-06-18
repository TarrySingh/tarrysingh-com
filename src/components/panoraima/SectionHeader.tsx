import type { ReactNode } from "react"
import { COBALT, INK, SLATE, FAINT } from "./consortiumTokens"

/**
 * SectionHeader — the standard corporate header used above every dashboard
 * section (timeline, map, submission matrix, WP lens). Cobalt mono kicker with
 * a plate index, bold ink title, slate subtitle, an optional controls slot, and
 * a faint cartographic "survey mark" that ties each section to the plate motif.
 */
export default function SectionHeader({
  index, kicker, title, subtitle, right,
}: {
  index?: string
  kicker: string
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="relative mb-6">
      {/* faint survey mark, top-right — the section-level plate accent */}
      <svg aria-hidden viewBox="0 0 80 80" className="absolute -top-1 right-0 w-16 h-16 hidden sm:block">
        <g stroke={COBALT} fill="none" opacity={0.18}>
          <path d="M58 6 h16 M74 6 v16 M58 74 h16 M74 74 v-16" strokeWidth={1.25} />
          <rect x="58" y="22" width="16" height="16" strokeWidth={0.75} opacity={0.6} />
          <line x1="66" y1="6" x2="66" y2="74" strokeWidth={0.5} opacity={0.4} />
        </g>
      </svg>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {index && (
              <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: COBALT }}>
                {index}
              </span>
            )}
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: COBALT }}>
              {kicker}
            </span>
          </div>
          <h2 className="text-[22px] md:text-[26px] font-bold tracking-[-0.02em] leading-tight" style={{ color: INK }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-[13.5px] leading-relaxed max-w-2xl" style={{ color: SLATE }}>
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>

      <div className="mt-4 h-px w-full" style={{ background: `linear-gradient(to right, ${FAINT}55, transparent)` }} />
    </div>
  )
}
