"use client"

import { useState, useEffect, useRef } from "react"
import {
  X, Calendar, FileText, AlertTriangle, ChevronRight, Sparkles,
  Layers, Activity, Presentation,
} from "lucide-react"
import type { TimelineEvent, PartnerCode } from "@/lib/panoraima/types"
import { PARTNERS, EVENT_STYLES, WORK_PACKAGES } from "@/lib/panoraima/types"
import { formatDate } from "./helpers"

interface Props {
  event: TimelineEvent | null
  open: boolean
  onClose: () => void
  focusedPartner?: PartnerCode | null
  onPartnerFocus?: (code: PartnerCode | null) => void
}

export default function EventDetailPanel({ event, open, onClose, focusedPartner, onPartnerFocus }: Props) {
  const [expanded, setExpanded] = useState<Set<PartnerCode>>(new Set())
  const [wpOpen, setWpOpen] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setExpanded(new Set(focusedPartner ? [focusedPartner] : []))
  }, [event?.id, focusedPartner])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!event) return null

  const style = EVENT_STYLES[event.type]
  const submitted = PARTNERS.filter(p => event.partners[p.code]?.submitted)
  const missed = PARTNERS.filter(p => event.has_progress_reports && !event.partners[p.code]?.submitted)
  const wpKeys = Object.keys(event.wp_reports || {})

  const togglePartner = (code: PartnerCode) => {
    setExpanded(prev => {
      const n = new Set(prev)
      n.has(code) ? n.delete(code) : n.add(code)
      return n
    })
    onPartnerFocus?.(expanded.has(code) ? null : code)
  }

  const toggleWp = (wp: string) => {
    setWpOpen(prev => {
      const n = new Set(prev)
      n.has(wp) ? n.delete(wp) : n.add(wp)
      return n
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        aria-label="Event details"
        className={`fixed top-0 bottom-0 right-0 z-50 w-full md:w-[640px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="relative px-6 md:px-8 pt-7 pb-6 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
            style={{ background: `radial-gradient(${style.dotColor}, transparent 60%)` }}
          />
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold mb-2">
            <span className={`w-2 h-2 rounded-full`} style={{ background: style.dotColor }} />
            <span className="text-gold-300">{style.label}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">{event.title}</h2>
          <div className="flex items-center gap-4 text-[13px] text-navy-100/80">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(event.date || event.id)}
            </span>
            {event.has_progress_reports && (
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {submitted.length}/15 reports
              </span>
            )}
            {wpKeys.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {wpKeys.length} WP reports
              </span>
            )}
          </div>

          {/* Submission avatar cluster */}
          {event.has_progress_reports && (
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {PARTNERS.map(p => {
                const sub = event.partners[p.code]?.submitted
                return (
                  <span
                    key={p.code}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border transition-all ${
                      sub
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-transparent border-white/10 text-white/40 line-through"
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: sub ? p.accent : "rgba(255,255,255,0.2)" }}
                    />
                    {p.code}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          {!event.has_progress_reports && event.type !== "cancelled" && (
            <div className="rounded-xl bg-gold-50 border border-gold-100 p-5">
              <div className="flex items-center gap-2 text-gold-700 font-semibold text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                {event.type === "worksprint" ? "Worksprint" : event.type === "kickoff" ? "Kick-off event" : "Meeting"}
              </div>
              <p className="text-sm text-navy-800 leading-relaxed">
                {event.type === "worksprint"
                  ? "Face-to-face consortium gathering. Progress reports were not collected during worksprint weeks."
                  : event.type === "kickoff"
                  ? "The project officially launched. Planning and onboarding documents were shared across the consortium."
                  : "Agenda-only meeting. Progress reports are tracked against PMCs in March 2025 onwards."}
              </p>
              {event.other_docs.length > 0 && (
                <div className="mt-4 space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-gold-700/70 font-bold">
                    Shared documents
                  </div>
                  {event.other_docs.map(d => (
                    <div key={d} className="text-[12px] font-mono text-navy-700/80">· {d}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {event.type === "cancelled" && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-5">
              <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                Cancelled meeting
              </div>
              <p className="text-sm text-rose-800/80 leading-relaxed">
                This PMC meeting was cancelled. Any items were carried forward to the following meeting.
              </p>
            </div>
          )}

          {/* WP Leader reports */}
          {wpKeys.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Presentation className="w-4 h-4 text-navy-600" />
                <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-navy-900">
                  Work Package Leader Reports
                </h3>
              </div>
              <div className="space-y-2">
                {wpKeys.map(wpId => {
                  const wpReport = event.wp_reports[wpId]
                  const wpMeta = WORK_PACKAGES.find(w => w.id === wpId)
                  const isOpen = wpOpen.has(wpId)
                  return (
                    <div
                      key={wpId}
                      className="rounded-xl border border-gray-100 overflow-hidden bg-white"
                    >
                      <button
                        onClick={() => toggleWp(wpId)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span
                          className="w-2 h-8 rounded-full"
                          style={{ background: wpMeta?.color || "#999" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-navy-900">{wpId}</span>
                            <span className="text-[11px] text-gray-500">
                              {wpMeta?.name}
                            </span>
                          </div>
                          {wpReport.partner && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              led by {wpReport.partner}
                            </div>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-0 animate-fade-in border-t border-gray-100">
                          {wpReport.excerpt && (
                            <p className="mt-3 text-[13px] text-navy-800 italic leading-relaxed border-l-2 border-gold-300 pl-3">
                              &ldquo;{wpReport.excerpt}&rdquo;
                            </p>
                          )}
                          {wpReport.activities.length > 0 && (
                            <>
                              <div className="mt-3 text-[10px] uppercase tracking-[0.15em] text-navy-500 font-bold">
                                Activities
                              </div>
                              <ul className="mt-1.5 space-y-1.5">
                                {wpReport.activities.slice(0, 5).map((a, i) => (
                                  <li key={i} className="text-[12px] text-navy-800 leading-snug flex gap-2">
                                    <Activity className="w-3 h-3 text-gold-500 mt-0.5 flex-shrink-0" />
                                    <span>{a}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {wpReport.challenges.length > 0 && (
                            <>
                              <div className="mt-3 text-[10px] uppercase tracking-[0.15em] text-rose-600 font-bold">
                                Challenges
                              </div>
                              <ul className="mt-1.5 space-y-1.5">
                                {wpReport.challenges.slice(0, 3).map((c, i) => (
                                  <li key={i} className="text-[12px] text-navy-800 leading-snug flex gap-2">
                                    <AlertTriangle className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          <div className="mt-3 text-[10px] text-gray-400 font-mono">
                            {wpReport.file}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Partner submissions */}
          {submitted.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-navy-600" />
                <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-navy-900">
                  Partner Reports · {submitted.length} of 15
                </h3>
              </div>
              <div className="space-y-2">
                {submitted.map(p => {
                  const pdata = event.partners[p.code]!
                  const isOpen = expanded.has(p.code)
                  const wpTags = pdata.wp_focus || []
                  return (
                    <div
                      key={p.code}
                      className={`rounded-xl border transition-all ${
                        isOpen ? "border-navy-200 shadow-sm" : "border-gray-100 hover:border-gray-200"
                      } bg-white`}
                    >
                      <button
                        onClick={() => togglePartner(p.code)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left"
                      >
                        <span
                          className="w-2 h-8 rounded-full transition-transform"
                          style={{
                            background: p.accent,
                            transform: isOpen ? "scaleY(1.1)" : "scaleY(1)",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-navy-900">{p.code}</span>
                            <span className="text-[11px] text-gray-400 truncate">{p.name}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            {wpTags.map(wp => {
                              const wpMeta = WORK_PACKAGES.find(w => w.id === wp)
                              return (
                                <span
                                  key={wp}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border"
                                  style={{
                                    color: wpMeta?.color,
                                    borderColor: `${wpMeta?.color}40`,
                                    background: `${wpMeta?.color}0a`,
                                  }}
                                >
                                  {wp}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-0 animate-fade-in border-t border-gray-100">
                          {pdata.excerpt && (
                            <p className="mt-3 text-[13px] text-navy-800 italic leading-relaxed border-l-2 border-gold-300 pl-3">
                              &ldquo;{pdata.excerpt}&rdquo;
                            </p>
                          )}
                          {pdata.activities && pdata.activities.length > 0 && (
                            <>
                              <div className="mt-3 text-[10px] uppercase tracking-[0.15em] text-navy-500 font-bold flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Activities
                              </div>
                              <ul className="mt-2 space-y-1.5">
                                {pdata.activities.slice(0, 6).map((a, i) => (
                                  <li key={i} className="text-[12.5px] text-navy-800 leading-snug flex gap-2.5">
                                    <span
                                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                      style={{ background: p.accent }}
                                    />
                                    <span>{a}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {pdata.challenges && pdata.challenges.length > 0 && (
                            <>
                              <div className="mt-3 text-[10px] uppercase tracking-[0.15em] text-rose-600 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Challenges
                              </div>
                              <ul className="mt-2 space-y-1.5">
                                {pdata.challenges.slice(0, 3).map((c, i) => (
                                  <li key={i} className="text-[12.5px] text-navy-800 leading-snug flex gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-rose-500" />
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          <div className="mt-3 text-[10px] text-gray-400 font-mono truncate">
                            {pdata.file}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {missed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-navy-900">
                  Did not submit · {missed.length}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {missed.map(p => (
                  <span
                    key={p.code}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-100"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {p.code}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  )
}
