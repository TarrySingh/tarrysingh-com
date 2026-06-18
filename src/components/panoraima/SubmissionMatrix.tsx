"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { PARTNERS, type PartnerCode, type TimelineEvent } from "@/lib/panoraima/types"
import SectionHeader from "./SectionHeader"
import {
  INK, SLATE, MUTE, FAINT, LINE, LINE_SOFT, COBALT,
  OK, OK_SOFT, BAD, BAD_SOFT,
} from "./consortiumTokens"

interface Props {
  events: TimelineEvent[]
  onCellClick: (eventId: string, partner: PartnerCode) => void
  onEventClick: (eventId: string) => void
  onPartnerClick: (code: PartnerCode) => void
  selectedEventId: string | null
  selectedPartner: PartnerCode | null
}

export default function SubmissionMatrix({
  events, onCellClick, onEventClick, onPartnerClick, selectedEventId, selectedPartner,
}: Props) {
  const [hover, setHover] = useState<{ event?: string; partner?: PartnerCode } | null>(null)

  const reportEvents = events.filter(e => e.has_progress_reports)

  const legend = (
    <div className="hidden md:flex items-center gap-4 text-[11px]" style={{ color: MUTE }}>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm" style={{ background: OK }} /> Submitted
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm" style={{ background: BAD_SOFT, border: `1px solid ${BAD}` }} /> Missed
      </span>
    </div>
  )

  return (
    <div>
      <SectionHeader
        index="03"
        kicker="Progress reporting"
        title="Who reported, and when"
        subtitle="Partner × reporting event. Green = submitted, brick = missed."
        right={legend}
      />

      <div className="overflow-x-auto -mx-2 px-2 pb-2 pt-4">
        <table className="border-separate border-spacing-[3px] min-w-max">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-10 w-32" />
              {reportEvents.map(e => {
                const isActive = selectedEventId === e.id || hover?.event === e.id
                return (
                  <th key={e.id} className="p-0 align-bottom">
                    <div className="relative h-20 w-12">
                      <button
                        onClick={() => onEventClick(e.id)}
                        onMouseEnter={() => setHover({ ...hover, event: e.id })}
                        onMouseLeave={() => setHover(null)}
                        // Centre-rotated label: the text is anchored to the
                        // cell centre and tilted, so nothing leaks into the
                        // sticky partner column on the left (previous
                        // origin-bottom-left pushed ~33px past the left edge
                        // and clipped the first month's label behind the
                        // white sticky header).
                        className="absolute inset-0 flex items-center justify-center rotate-[-45deg] whitespace-nowrap text-[11px] font-mono font-semibold tracking-tight transition-colors"
                        style={{ color: isActive ? INK : MUTE }}
                      >
                        {e.label}
                      </button>
                    </div>
                  </th>
                )
              })}
              <th
                className="w-12 px-2 align-bottom text-[10px] font-mono font-semibold uppercase tracking-[0.15em] tabular-nums"
                style={{ color: FAINT }}
              >
                ∑
              </th>
            </tr>
          </thead>
          <tbody>
            {PARTNERS.map(partner => {
              const partnerActive = selectedPartner === partner.code || hover?.partner === partner.code
              const submitted = reportEvents.filter(e => e.partners[partner.code]?.submitted).length
              const rate = reportEvents.length > 0 ? submitted / reportEvents.length : 0

              return (
                <tr key={partner.code}>
                  <td
                    className="sticky left-0 bg-white z-10 pr-2 text-right whitespace-nowrap cursor-pointer"
                    style={{ color: partnerActive ? INK : SLATE, fontWeight: partnerActive ? 700 : 400 }}
                    onClick={() => onPartnerClick(partner.code)}
                    onMouseEnter={() => setHover({ ...hover, partner: partner.code })}
                    onMouseLeave={() => setHover(null)}
                  >
                    <div className="flex items-center justify-end gap-2 text-xs font-semibold">
                      <span
                        className="w-2 h-2 rounded-full transition-transform"
                        style={{
                          background: partner.accent,
                          transform: partnerActive ? "scale(1.5)" : "scale(1)",
                        }}
                      />
                      {partner.code}
                    </div>
                  </td>
                  {reportEvents.map(e => {
                    const p = e.partners[partner.code]
                    const submitted = !!p?.submitted
                    const isHighlight =
                      selectedEventId === e.id || selectedPartner === partner.code ||
                      hover?.event === e.id || hover?.partner === partner.code

                    return (
                      <td key={e.id} className="p-0">
                        <button
                          onClick={() => onCellClick(e.id, partner.code)}
                          onMouseEnter={() => setHover({ event: e.id, partner: partner.code })}
                          onMouseLeave={() => setHover(null)}
                          aria-label={`${partner.code} on ${e.label}: ${submitted ? "submitted" : "missed"}`}
                          className={`block w-9 h-9 rounded-md transition-all duration-200 ${
                            submitted
                              ? isHighlight ? "text-white scale-110" : "text-white hover:scale-105"
                              : isHighlight ? "scale-105" : ""
                          }`}
                          style={{
                            transformOrigin: "center",
                            background: submitted
                              ? OK
                              : isHighlight ? BAD_SOFT : LINE_SOFT,
                            border: submitted
                              ? undefined
                              : isHighlight ? `1px solid ${BAD}` : `1px solid ${LINE}`,
                            opacity: submitted && !isHighlight ? 0.9 : 1,
                            boxShadow: submitted && isHighlight ? `0 4px 10px ${OK_SOFT}` : undefined,
                          }}
                        >
                          <span className="flex items-center justify-center w-full h-full">
                            {submitted
                              ? <Check className="w-3.5 h-3.5" />
                              : <X className="w-3 h-3" style={{ color: BAD }} />}
                          </span>
                        </button>
                      </td>
                    )
                  })}
                  <td className="px-2">
                    <div className="text-[11px] font-mono font-bold tabular-nums" style={{ color: INK }}>
                      {submitted}
                    </div>
                    <div
                      className="mt-0.5 h-1 w-10 rounded-full overflow-hidden"
                      style={{ background: LINE }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${rate * 100}%`,
                          background: rate >= 0.9 ? OK : rate >= 0.7 ? COBALT : BAD,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
            {/* Event totals row */}
            <tr>
              <td
                className="sticky left-0 bg-white z-10 pr-2 text-right text-[10px] font-mono font-bold uppercase tracking-[0.15em] pt-2"
                style={{ color: FAINT }}
              >
                Event ∑
              </td>
              {reportEvents.map(e => {
                const n = Object.values(e.partners).filter(p => p.submitted).length
                return (
                  <td key={e.id} className="p-0 pt-2">
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] font-mono font-bold tabular-nums" style={{ color: INK }}>
                        {n}
                      </div>
                      <div
                        className="mt-0.5 h-1 w-7 rounded-full overflow-hidden"
                        style={{ background: LINE }}
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${(n / 15) * 100}%`,
                            background: n === 15 ? OK : n >= 13 ? COBALT : BAD,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                )
              })}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
