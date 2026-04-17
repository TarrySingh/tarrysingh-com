"use client"

import { useEffect, useMemo, useState } from "react"
import { X, Calendar, MapPin, Activity, AlertTriangle, Sparkles } from "lucide-react"
import type { PartnerCode, TimelineEvent } from "@/lib/panoraima/types"
import { PARTNER_BY_CODE, WORK_PACKAGES } from "@/lib/panoraima/types"
import { formatDate } from "./helpers"

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
        className={`fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        aria-label={`${partner} partner journey`}
        className={`fixed top-0 bottom-0 right-0 z-50 w-full md:w-[720px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div
          className="relative px-6 md:px-8 pt-7 pb-6 text-white overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #0A1628 0%, ${profile.accent}dd 180%)`,
          }}
        >
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-30"
            style={{ background: `radial-gradient(${profile.accent}, transparent 60%)` }}
          />
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold mb-2 text-white/80">
            <MapPin className="w-3 h-3" />
            <span>{profile.country} · {profile.city}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-1">{profile.code}</h2>
          <div className="text-sm text-white/80 max-w-md">{profile.name}</div>

          {/* Inline stats */}
          <div className="mt-6 grid grid-cols-4 gap-3">
            {[
              { label: "Submitted",  value: `${stats.submitted}/${stats.total}` },
              { label: "Rate",       value: `${Math.round(stats.rate * 100)}%` },
              { label: "Activities", value: stats.activities },
              { label: "Challenges", value: stats.challenges },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-white/10 border border-white/10 p-3">
                <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">{s.label}</div>
                <div className="mt-1 text-xl font-bold tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>

          {/* WP exposure */}
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/60 font-bold mb-1.5">
              Work package exposure
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WORK_PACKAGES.map(wp => {
                const active = stats.wps.includes(wp.id)
                return (
                  <span
                    key={wp.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                      active
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-transparent text-white/30 border border-white/10"
                    }`}
                  >
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: active ? wp.color : "currentColor" }}
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
            <Sparkles className="w-4 h-4 text-navy-600" />
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-navy-900">
              Reporting journey · chronological
            </h3>
          </div>

          {/* Journey timeline */}
          <div className="relative space-y-3">
            {/* Vertical line */}
            <div
              aria-hidden
              className="absolute left-[10px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-gray-200 via-gray-100 to-gray-200"
            />

            {journey.map(({ event, data }, i) => {
              const submitted = data.submitted
              return (
                <div key={event.id} className="relative pl-8">
                  <span
                    className={`absolute left-0 top-3 w-5 h-5 rounded-full border-4 border-white ${
                      submitted ? "" : ""
                    }`}
                    style={{
                      background: submitted ? profile.accent : "#e5e7eb",
                      boxShadow: submitted ? `0 0 0 1px ${profile.accent}66` : "0 0 0 1px #d1d5db",
                    }}
                  />
                  <button
                    onClick={() => onEventClick(event.id)}
                    className={`w-full text-left rounded-xl border transition-all duration-200 ${
                      submitted
                        ? "border-gray-100 hover:border-navy-200 hover:bg-navy-50/40 bg-white"
                        : "border-rose-100 bg-rose-50/40 hover:bg-rose-50"
                    } p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-wider font-semibold">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date || event.id)}
                          <span className="text-gray-300">·</span>
                          <span>{event.title}</span>
                        </div>
                        {submitted ? (
                          <>
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                              {(data.wp_focus || []).map(w => {
                                const wp = WORK_PACKAGES.find(x => x.id === w)
                                return (
                                  <span
                                    key={w}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold"
                                    style={{
                                      color: wp?.color,
                                      background: `${wp?.color}0a`,
                                      border: `1px solid ${wp?.color}30`,
                                    }}
                                  >
                                    {w}
                                  </span>
                                )
                              })}
                            </div>
                            {data.excerpt && (
                              <p className="mt-2 text-[12.5px] text-navy-800 leading-snug italic line-clamp-2">
                                &ldquo;{data.excerpt}&rdquo;
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {data.activities?.length || 0} activities
                              </span>
                              {(data.challenges?.length || 0) > 0 && (
                                <span className="inline-flex items-center gap-1 text-rose-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  {data.challenges?.length} challenges
                                </span>
                              )}
                              <span className="ml-auto text-[10px] text-gray-400">
                                {data.word_count} words
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="mt-1 text-[12px] text-rose-700">Report not submitted</div>
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
