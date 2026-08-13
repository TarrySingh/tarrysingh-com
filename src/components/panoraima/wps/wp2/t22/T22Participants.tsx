"use client"

import { useState } from "react"
import { Building2, GraduationCap, FlaskConical, UserCheck, ClipboardList, CheckCircle2, X } from "lucide-react"
import type { Task22Detail, T22Institution, T22ParticipantSlot } from "@/lib/panoraima/types"
import {
  INK, SLATE, MUTE, FAINT, LINE, SURFACE,
  COBALT, COBALT_SOFT, COBALT_LINE, NAVY,
  OK, OK_SOFT,
} from "../../../consortiumTokens"

interface Props {
  detail: Task22Detail
}

const ROLE_ORDER = ["Teaching Staff", "Researcher", "Student Representative", "Administrative"]

const ROLE_ICON: Record<string, typeof GraduationCap> = {
  "Teaching Staff":         GraduationCap,
  "Researcher":             FlaskConical,
  "Student Representative": UserCheck,
  "Administrative":         ClipboardList,
}

function slotFor(inst: T22Institution, role: string): T22ParticipantSlot | null {
  return inst.slots.find(s => s.role === role) ?? null
}

export default function T22Participants({ detail }: Props) {
  const [activeAbbr, setActiveAbbr] = useState<string | null>(null)
  const active = detail.participants.find(p => p.abbr === activeAbbr)

  return (
    <section>
      <div className="mb-6">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: MUTE, border: `1px solid ${LINE}`, background: SURFACE }}
        >
          The participants
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold tabular-nums" style={{ color: INK }}>
          4 roles × 8 universities = 32 invited slots
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
          Each partner university was asked to nominate one Teaching Staff, one
          Researcher, one Student Representative, and one Administrative member.
          Filled slots show nominees; empty slots are gaps in the register.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {detail.participants.map(inst => {
          const isOpen = activeAbbr === inst.abbr
          return (
            <button
              key={inst.abbr}
              onClick={() => setActiveAbbr(isOpen ? null : inst.abbr)}
              className="text-left rounded-2xl border transition-all p-4"
              style={{
                borderColor: isOpen ? COBALT_LINE : LINE,
                background: isOpen ? COBALT_SOFT : "#FFFFFF",
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" style={{ color: isOpen ? COBALT : FAINT }} />
                    <span className="font-mono text-xs font-bold" style={{ color: INK }}>
                      {inst.abbr}
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] leading-tight line-clamp-2" style={{ color: SLATE }}>
                    {inst.institution}
                  </div>
                  <div className="mt-0.5 text-[10px]" style={{ color: FAINT }}>
                    {inst.country}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
                    style={{ background: OK_SOFT, border: `1px solid ${OK}33`, color: OK }}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {inst.consent_count}
                  </div>
                  <div className="mt-1 text-[9px] font-mono tabular-nums" style={{ color: FAINT }}>
                    {inst.filled_count}/4 filled
                  </div>
                </div>
              </div>

              {/* 4 role slots */}
              <div className="grid grid-cols-4 gap-1.5">
                {ROLE_ORDER.map(role => {
                  const slot = slotFor(inst, role)
                  const Icon = ROLE_ICON[role] ?? GraduationCap
                  const filled = !!slot?.name
                  const slotStyle = filled
                    ? slot?.consent
                      ? { background: COBALT_SOFT, border: `1px solid ${COBALT_LINE}`, color: COBALT }
                      : { background: SURFACE, border: `1px solid ${LINE}`, color: SLATE }
                    : { background: SURFACE, border: `1px dashed ${LINE}`, color: FAINT }
                  return (
                    <div
                      key={role}
                      title={`${role}${slot?.name ? ` · ${slot.name}` : " · (not filled)"}`}
                      className="aspect-square rounded-lg flex items-center justify-center relative"
                      style={slotStyle}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {slot?.consent && (
                        <span
                          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                          style={{ background: COBALT, border: "2px solid #FFFFFF" }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>

      {/* Drawer for active institution */}
      {active && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            className="absolute inset-0 pointer-events-auto animate-fade-in"
            style={{ background: `${NAVY}80` }}
            onClick={() => setActiveAbbr(null)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl pointer-events-auto overflow-y-auto animate-slide-in-right">
            <div
              className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between gap-4"
              style={{ borderBottom: `1px solid ${LINE}` }}
            >
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.15em]" style={{ color: COBALT }}>{active.abbr}</div>
                <div className="text-base font-bold leading-tight truncate" style={{ color: INK }}>
                  {active.institution}
                </div>
                <div className="text-[11px]" style={{ color: FAINT }}>{active.country}</div>
              </div>
              <button
                onClick={() => setActiveAbbr(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: MUTE }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              {ROLE_ORDER.map(role => {
                const slot = slotFor(active, role)
                const Icon = ROLE_ICON[role] ?? GraduationCap
                const cardStyle = slot?.name
                  ? slot.consent
                    ? { borderColor: COBALT_LINE, background: COBALT_SOFT }
                    : { borderColor: LINE, background: "#FFFFFF" }
                  : { borderColor: LINE, borderStyle: "dashed" as const, background: SURFACE }
                return (
                  <div
                    key={role}
                    className="rounded-xl border p-4"
                    style={cardStyle}
                  >
                    <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: MUTE }}>
                      <Icon className="w-3 h-3" />
                      {role}
                    </div>
                    {slot?.name ? (
                      <>
                        <div className="text-sm font-semibold" style={{ color: INK }}>{slot.name}</div>
                        {slot.email && (
                          <div className="mt-0.5 text-[11px] font-mono break-all" style={{ color: MUTE }}>
                            {slot.email}
                          </div>
                        )}
                        <div className="mt-2">
                          {slot.consent ? (
                            <span
                              className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ color: COBALT, background: COBALT_SOFT, border: `1px solid ${COBALT_LINE}` }}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" /> Consent signed
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ color: MUTE, background: SURFACE, border: `1px solid ${LINE}` }}
                            >
                              Consent pending
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-[12px] italic" style={{ color: FAINT }}>Not yet nominated</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.22s ease-out;
        }
      `}</style>
    </section>
  )
}
