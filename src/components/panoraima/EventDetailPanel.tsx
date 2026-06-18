"use client"

import { useState, useEffect, useRef } from "react"
import {
  X, Calendar, FileText, AlertTriangle, ChevronRight, Sparkles,
  Layers, Activity, Presentation,
} from "lucide-react"
import type { TimelineEvent, PartnerCode } from "@/lib/panoraima/types"
import { PARTNERS, EVENT_STYLES, WORK_PACKAGES } from "@/lib/panoraima/types"
import { formatDate } from "./helpers"
import {
  NAVY, INK, SLATE, MUTE, FAINT, LINE, COBALT, COBALT_SOFT, COBALT_LINE,
  BAD, BAD_SOFT, WARN, WARN_SOFT, wpColor,
} from "./consortiumTokens"

const COBALT_LIGHT = "#7DA0FF" // light cobalt for text/meta on the navy header band

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
        className={`fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(5,28,44,0.55)" }}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        aria-label="Event details"
        className={`fixed top-0 bottom-0 right-0 z-50 w-full md:w-[640px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header — corporate deep-navy band */}
        <div
          className="relative px-6 md:px-8 pt-7 pb-6 text-white overflow-hidden"
          style={{ background: NAVY }}
        >
          {/* cobalt accent rule along the bottom of the header band */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: COBALT }} />
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
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] font-bold mb-2">
            <span className="w-2 h-2 rounded-full" style={{ background: style.dotColor }} />
            <span style={{ color: COBALT_LIGHT }}>{style.label}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-1">{event.title}</h2>
          <div className="flex items-center gap-4 text-[13px]" style={{ color: COBALT_LIGHT }}>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(event.date) || "Date TBD"}
            </span>
            {event.has_progress_reports && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <FileText className="w-3.5 h-3.5" />
                {submitted.length}/15 reports
              </span>
            )}
            {wpKeys.length > 0 && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
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
            <div className="rounded-xl border p-5" style={{ background: COBALT_SOFT, borderColor: COBALT_LINE }}>
              <div className="flex items-center gap-2 font-semibold text-sm mb-1" style={{ color: COBALT }}>
                <Sparkles className="w-4 h-4" />
                {event.type === "worksprint" ? "Worksprint" : event.type === "kickoff" ? "Kick-off event" : "Meeting"}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                {event.type === "worksprint"
                  ? "Face-to-face consortium gathering. Progress reports were not collected during worksprint weeks."
                  : event.type === "kickoff"
                  ? "The project officially launched. Planning and onboarding documents were shared across the consortium."
                  : "Agenda-only meeting. Progress reports are tracked against PMCs in March 2025 onwards."}
              </p>
              {event.other_docs.length > 0 && (
                <div className="mt-4 space-y-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: COBALT }}>
                    Shared documents
                  </div>
                  {event.other_docs.map(d => (
                    <div key={d} className="text-[12px] font-mono" style={{ color: SLATE }}>· {d}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {event.type === "cancelled" && (
            <div className="rounded-xl border p-5" style={{ background: BAD_SOFT, borderColor: `${BAD}33` }}>
              <div className="flex items-center gap-2 font-semibold text-sm mb-1" style={{ color: BAD }}>
                <AlertTriangle className="w-4 h-4" />
                Cancelled meeting
              </div>
              <p className="text-sm leading-relaxed" style={{ color: BAD }}>
                This PMC meeting was cancelled. Any items were carried forward to the following meeting.
              </p>
            </div>
          )}

          {/* WP Leader reports */}
          {wpKeys.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Presentation className="w-4 h-4" style={{ color: COBALT }} />
                <h3 className="font-mono text-sm font-bold uppercase tracking-[0.15em]" style={{ color: INK }}>
                  Work Package Leader Reports
                </h3>
              </div>
              <div className="space-y-2">
                {wpKeys.map(wpId => {
                  const wpReport = event.wp_reports[wpId]
                  const wpMeta = WORK_PACKAGES.find(w => w.id === wpId)
                  const isOpen = wpOpen.has(wpId)
                  const wpc = wpColor(wpId)
                  return (
                    <div
                      key={wpId}
                      className="rounded-xl border overflow-hidden bg-white"
                      style={{ borderColor: LINE }}
                    >
                      <button
                        onClick={() => toggleWp(wpId)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F7F8FA] transition-colors text-left"
                      >
                        <span
                          className="w-2 h-8 rounded-full"
                          style={{ background: wpc }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold" style={{ color: INK }}>{wpId}</span>
                            <span className="text-[11px]" style={{ color: MUTE }}>
                              {wpMeta?.name}
                            </span>
                          </div>
                          {wpReport.partner && (
                            <div className="text-[11px] mt-0.5" style={{ color: FAINT }}>
                              led by {wpReport.partner}
                            </div>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                          style={{ color: FAINT }}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-0 animate-fade-in border-t" style={{ borderColor: LINE }}>
                          {wpReport.excerpt && (
                            <p
                              className="mt-3 text-[13px] italic leading-relaxed border-l-2 pl-3"
                              style={{ color: SLATE, borderColor: COBALT }}
                            >
                              &ldquo;{wpReport.excerpt}&rdquo;
                            </p>
                          )}
                          {wpReport.activities.length > 0 && (
                            <>
                              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: FAINT }}>
                                Activities
                              </div>
                              <ul className="mt-1.5 space-y-1.5">
                                {wpReport.activities.slice(0, 5).map((a, i) => (
                                  <li key={i} className="text-[12px] leading-snug flex gap-2" style={{ color: SLATE }}>
                                    <Activity className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: COBALT }} />
                                    <span>{a}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {wpReport.challenges.length > 0 && (
                            <>
                              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: BAD }}>
                                Challenges
                              </div>
                              <ul className="mt-1.5 space-y-1.5">
                                {wpReport.challenges.slice(0, 3).map((c, i) => (
                                  <li
                                    key={i}
                                    className="text-[12px] leading-snug flex gap-2 rounded-md px-2 py-1"
                                    style={{ color: BAD, background: BAD_SOFT }}
                                  >
                                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: BAD }} />
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          <div className="mt-3 text-[10px] font-mono" style={{ color: FAINT }}>
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
                <FileText className="w-4 h-4" style={{ color: COBALT }} />
                <h3 className="font-mono text-sm font-bold uppercase tracking-[0.15em]" style={{ color: INK }}>
                  Partner Reports · <span className="tabular-nums">{submitted.length} of 15</span>
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
                      className="rounded-xl border transition-all bg-white"
                      style={
                        isOpen
                          ? { borderColor: COBALT_LINE, boxShadow: "0 1px 2px rgba(10,31,51,0.06)" }
                          : { borderColor: LINE }
                      }
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
                            <span className="font-mono text-xs font-bold" style={{ color: INK }}>{p.code}</span>
                            <span className="text-[11px] truncate" style={{ color: MUTE }}>{p.name}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            {wpTags.map(wp => {
                              const wpc = wpColor(wp)
                              return (
                                <span
                                  key={wp}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border"
                                  style={{
                                    color: wpc,
                                    borderColor: `${wpc}40`,
                                    background: `${wpc}0a`,
                                  }}
                                >
                                  {wp}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                          style={{ color: FAINT }}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-0 animate-fade-in border-t" style={{ borderColor: LINE }}>
                          {pdata.excerpt && (
                            <p
                              className="mt-3 text-[13px] italic leading-relaxed border-l-2 pl-3"
                              style={{ color: SLATE, borderColor: COBALT }}
                            >
                              &ldquo;{pdata.excerpt}&rdquo;
                            </p>
                          )}
                          {pdata.activities && pdata.activities.length > 0 && (
                            <>
                              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] font-bold flex items-center gap-1" style={{ color: FAINT }}>
                                <Activity className="w-3 h-3" />
                                Activities
                              </div>
                              <ul className="mt-2 space-y-1.5">
                                {pdata.activities.slice(0, 6).map((a, i) => (
                                  <li key={i} className="text-[12.5px] leading-snug flex gap-2.5" style={{ color: SLATE }}>
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
                              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] font-bold flex items-center gap-1" style={{ color: BAD }}>
                                <AlertTriangle className="w-3 h-3" />
                                Challenges
                              </div>
                              <ul className="mt-2 space-y-1.5">
                                {pdata.challenges.slice(0, 3).map((c, i) => (
                                  <li
                                    key={i}
                                    className="text-[12.5px] leading-snug flex gap-2.5 rounded-md px-2 py-1"
                                    style={{ color: BAD, background: BAD_SOFT }}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: BAD }} />
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          <div className="mt-3 text-[10px] font-mono truncate" style={{ color: FAINT }}>
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
                <AlertTriangle className="w-4 h-4" style={{ color: BAD }} />
                <h3 className="font-mono text-sm font-bold uppercase tracking-[0.15em]" style={{ color: INK }}>
                  Did not submit · <span className="tabular-nums">{missed.length}</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {missed.map(p => (
                  <span
                    key={p.code}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border"
                    style={{ background: WARN_SOFT, color: WARN, borderColor: `${WARN}33` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: WARN }} />
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
