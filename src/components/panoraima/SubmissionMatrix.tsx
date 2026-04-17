"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { PARTNERS, type PartnerCode, type TimelineEvent } from "@/lib/panoraima/types"
import { submissionRate } from "./helpers"

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

  return (
    <div className="bg-white">
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
            Submission matrix
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
            Who delivered, and when
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            {reportEvents.length} reporting periods × 15 partners. Click any cell to jump straight to that report.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Submitted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-100 border border-rose-300" /> Missed
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <table className="border-separate border-spacing-[3px] min-w-max">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-10 w-28" />
              {reportEvents.map(e => {
                const isActive = selectedEventId === e.id || hover?.event === e.id
                return (
                  <th key={e.id} className="p-0">
                    <button
                      onClick={() => onEventClick(e.id)}
                      onMouseEnter={() => setHover({ ...hover, event: e.id })}
                      onMouseLeave={() => setHover(null)}
                      className={`h-16 w-10 flex items-center justify-center origin-bottom-left rotate-[-45deg] text-[10px] font-mono font-semibold transition-colors ${
                        isActive ? "text-navy-900" : "text-gray-400"
                      }`}
                    >
                      {e.label}
                    </button>
                  </th>
                )
              })}
              <th className="w-12 px-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">∑</th>
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
                    className={`sticky left-0 bg-white z-10 pr-2 text-right whitespace-nowrap cursor-pointer ${
                      partnerActive ? "text-navy-900 font-bold" : "text-gray-600"
                    }`}
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
                              ? isHighlight
                                ? "bg-emerald-500 text-white scale-110 shadow-md shadow-emerald-200"
                                : "bg-emerald-500/85 text-white hover:scale-105"
                              : isHighlight
                                ? "bg-rose-100 border border-rose-300 scale-105"
                                : "bg-gray-50 border border-gray-100 hover:bg-rose-50"
                          }`}
                          style={{ transformOrigin: "center" }}
                        >
                          <span className="flex items-center justify-center w-full h-full">
                            {submitted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3 text-rose-300" />}
                          </span>
                        </button>
                      </td>
                    )
                  })}
                  <td className="px-2">
                    <div className="text-[11px] font-mono font-bold text-navy-700 tabular-nums">
                      {submitted}
                    </div>
                    <div className="mt-0.5 h-1 w-10 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          rate >= 0.9 ? "bg-emerald-500" : rate >= 0.7 ? "bg-gold-500" : "bg-rose-500"
                        } transition-all duration-500`}
                        style={{ width: `${rate * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
            {/* Event totals row */}
            <tr>
              <td className="sticky left-0 bg-white z-10 pr-2 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">
                Event ∑
              </td>
              {reportEvents.map(e => {
                const n = Object.values(e.partners).filter(p => p.submitted).length
                return (
                  <td key={e.id} className="p-0 pt-2">
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] font-mono font-bold text-navy-700 tabular-nums">
                        {n}
                      </div>
                      <div className="mt-0.5 h-1 w-7 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            n === 15 ? "bg-emerald-500" : n >= 13 ? "bg-gold-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${(n / 15) * 100}%` }}
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
