"use client"

import { useEffect, useMemo, useState } from "react"
import { X, Calendar, MapPin, Activity, AlertTriangle, Sparkles } from "lucide-react"
import type { PartnerCode, TimelineEvent } from "@/lib/panoraima/types"
import { PARTNER_BY_CODE, WORK_PACKAGES } from "@/lib/panoraima/types"
import { formatDate } from "./helpers"
import {
  NAVY, INK, SLATE, MUTE, FAINT, LINE,
  COBALT, COBALT_SOFT, COBALT_LINE, OK, BAD, BAD_SOFT,
  wpColor,
} from "./consortiumTokens"

interface Props {
  partner: PartnerCode | null
  events: TimelineEvent[]
  open: boolean
  onClose: () => void
  onEventClick: (id: string) => void
}

export default function PartnerDrawer({ partner, events, open, onClose, onEventClick }: Props) {
  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [open, onClose])

  const profile = partner ? PARTNER_BY_CODE[partner] : null

  const journey = useMemo(() => {
    if (!partner) return []
    return events
      .filter(e => e.has_progress_reports)
      .map(e => ({
        event: e,
        data: e.partners[partner],
      }))
  }, [events, partner])

  const stats = useMemo(() => {
    if (!partner) return null
    const submitted = journey.filter(j => j.data.submitted).length
    const total = journey.length
    const missed = total - submitted
    const wpSet = new Set<string>()
    let activities = 0
    let challenges = 0
    journey.forEach(j => {
      if (j.data.submitted) {
        (j.data.wp_focus || []).forEach(w => wpSet.add(w))
        activities += j.data.activities?.length || 0
        challenges += j.data.challenges?.length || 0
      }
    })
    return {
      submitted,
      missed,
      total,
      rate: total ? submitted / total : 0,
      wps: Array.from(wpSet).sort(),
      activities,
      challenges,
    }
  }, [partner, journey])

  if (!partner || !profile || !stats) return null

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: `${NAVY}99` }}
      />
      <aside
        aria-label={`${partner} partner journey`}
        className={`fixed top-0 bottom-0 right-0 z-50 w-full md:w-[720px] bg-white border-l transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
        style={{ borderColor: LINE, boxShadow: "-24px 0 48px -24px rgba(5,28,44,0.25)" }}
      >
        {/* Header */}
        <div
          className="relative px-6 md:px-8 pt-7 pb-6 text-white overflow-hidden"
          style={{ background: NAVY }}
        >
          {/* faint cobalt survey-mark wash, top-right — corporate plate accent */}
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-25"
            style={{ background: `radial-gradient(${COBALT}, transparent 62%)` }}
          />
          {/* thin cobalt rule under the header band */}
          <div aria-hidden className="absolute left-0 right-0 bottom-0 h-px" style={{ background: COBALT }} />
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] font-semibold mb-2 text-white/70">
            <MapPin className="w-3 h-3" style={{ color: "#7DA0FF" }} />
            <span>{profile.country} · {profile.city}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-1 tracking-[-0.02em]">{profile.code}</h2>
          <div className="text-sm text-white/70 max-w-md">{profile.name}</div>

          {/* Inline stats */}
          <div className="mt-6 grid grid-cols-4 gap-3">
            {[
              { label: "Submitted",  value: `${stats.submitted}/${stats.total}`, accent: "#7DA0FF" },
              { label: "Missed",     value: stats.missed, accent: stats.missed > 0 ? "#F2A8A0" : undefined },
              { label: "Activities", value: stats.activities, accent: undefined },
              { label: "Challenges", value: stats.challenges, accent: undefined },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-white/10 border border-white/10 p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/55 font-semibold">{s.label}</div>
                <div className="mt-1 text-xl font-bold tabular-nums" style={s.accent ? { color: s.accent } : undefined}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* WP exposure */}
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 font-semibold mb-1.5">
              Work package exposure
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WORK_PACKAGES.map(wp => {
                const active = stats.wps.includes(wp.id)
                return (
                  <span
                    key={wp.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-[0.04em] transition-all ${
                      active
                        ? "bg-white/15 text-white border border-white/30"
                        : "bg-transparent text-white/30 border border-white/10"
                    }`}
                  >
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: active ? wpColor(wp.id) : "currentColor" }}
                    />
                    {wp.id}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Journey */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: COBALT }} />
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: INK }}>
              Reporting journey · chronological
            </h3>
          </div>

          {/* Journey timeline */}
          <div className="relative space-y-3">
            {/* Vertical line */}
            <div
              aria-hidden
              className="absolute left-[10px] top-2 bottom-2 w-px"
              style={{ background: LINE }}
            />

            {journey.map(({ event, data }, i) => {
              const submitted = data.submitted
              return (
                <div key={event.id} className="relative pl-8">
                  <span
                    className="absolute left-0 top-3 w-5 h-5 rounded-full border-4 border-white"
                    style={{
                      background: submitted ? OK : "#E5E8EE",
                      boxShadow: submitted ? `0 0 0 1px ${OK}66` : `0 0 0 1px ${LINE}`,
                    }}
                  />
                  <button
                    onClick={() => onEventClick(event.id)}
                    className="group w-full text-left rounded-xl border transition-all duration-200 p-4"
                    style={{
                      borderColor: submitted ? LINE : BAD_SOFT,
                      background: submitted ? "#FFFFFF" : BAD_SOFT,
                    }}
                    onMouseEnter={(e) => {
                      if (submitted) {
                        e.currentTarget.style.borderColor = COBALT_LINE
                        e.currentTarget.style.background = COBALT_SOFT
                      } else {
                        e.currentTarget.style.background = "#F2DDD9"
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = submitted ? LINE : BAD_SOFT
                      e.currentTarget.style.background = submitted ? "#FFFFFF" : BAD_SOFT
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] font-semibold tabular-nums" style={{ color: MUTE }}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date) || "Date TBD"}
                          <span style={{ color: FAINT }}>·</span>
                          <span style={{ color: SLATE }}>{event.title}</span>
                        </div>
                        {submitted ? (
                          <>
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                              {(data.wp_focus || []).map(w => {
                                const c = wpColor(w)
                                return (
                                  <span
                                    key={w}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.04em]"
                                    style={{
                                      color: c,
                                      background: `${c}0F`,
                                      border: `1px solid ${c}33`,
                                    }}
                                  >
                                    {w}
                                  </span>
                                )
                              })}
                            </div>
                            {data.excerpt && (
                              <p className="mt-2 text-[12.5px] leading-snug italic line-clamp-2" style={{ color: SLATE }}>
                                &ldquo;{data.excerpt}&rdquo;
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-4 text-[11px]" style={{ color: MUTE }}>
                              <span className="inline-flex items-center gap-1 tabular-nums">
                                <Activity className="w-3 h-3" />
                                {data.activities?.length || 0} activities
                              </span>
                              {(data.challenges?.length || 0) > 0 && (
                                <span className="inline-flex items-center gap-1 tabular-nums" style={{ color: BAD }}>
                                  <AlertTriangle className="w-3 h-3" />
                                  {data.challenges?.length} challenges
                                </span>
                              )}
                              <span className="ml-auto text-[10px] tabular-nums" style={{ color: FAINT }}>
                                {data.word_count} words
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="mt-1 text-[12px] font-medium" style={{ color: BAD }}>Report not submitted</div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
