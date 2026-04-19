"use client"

import { useState } from "react"
import { Building2, GraduationCap, FlaskConical, UserCheck, ClipboardList, CheckCircle2, X } from "lucide-react"
import type { Task22Detail, T22Institution, T22ParticipantSlot } from "@/lib/panoraima/types"

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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          The participants
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          4 roles × 8 universities = 32 invited slots
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
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
              className={`text-left rounded-2xl border transition-all p-4 ${
                isOpen
                  ? "border-navy-400 bg-navy-50/40 shadow-md"
                  : "border-gray-100 bg-white hover:border-navy-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-navy-400" />
                    <span className="font-mono text-xs font-bold text-navy-900">
                      {inst.abbr}
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] text-gray-700 leading-tight line-clamp-2">
                    {inst.institution}
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-400">
                    {inst.country}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {inst.consent_count}
                  </div>
                  <div className="mt-1 text-[9px] font-mono text-gray-400">
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
                  return (
                    <div
                      key={role}
                      title={`${role}${slot?.name ? ` — ${slot.name}` : " — (not filled)"}`}
                      className={`aspect-square rounded-lg flex items-center justify-center relative ${
                        filled
                          ? slot?.consent
                            ? "bg-gold-500/15 border border-gold-400/40 text-gold-700"
                            : "bg-navy-100/60 border border-navy-200 text-navy-700"
                          : "bg-gray-50 border border-dashed border-gray-200 text-gray-300"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {slot?.consent && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold-500 border-2 border-white" />
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
            className="absolute inset-0 bg-navy-950/50 pointer-events-auto animate-fade-in"
            onClick={() => setActiveAbbr(null)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl pointer-events-auto overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold text-navy-400">{active.abbr}</div>
                <div className="text-base font-bold text-navy-900 leading-tight truncate">
                  {active.institution}
                </div>
                <div className="text-[11px] text-gray-400">{active.country}</div>
              </div>
              <button
                onClick={() => setActiveAbbr(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              {ROLE_ORDER.map(role => {
                const slot = slotFor(active, role)
                const Icon = ROLE_ICON[role] ?? GraduationCap
                return (
                  <div
                    key={role}
                    className={`rounded-xl border p-4 ${
                      slot?.name
                        ? slot.consent
                          ? "border-gold-300 bg-gold-50/40"
                          : "border-navy-200 bg-white"
                        : "border-dashed border-gray-200 bg-gray-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-navy-500 mb-1.5">
                      <Icon className="w-3 h-3" />
                      {role}
                    </div>
                    {slot?.name ? (
                      <>
                        <div className="text-sm font-semibold text-navy-900">{slot.name}</div>
                        {slot.email && (
                          <div className="mt-0.5 text-[11px] font-mono text-gray-500 break-all">
                            {slot.email}
                          </div>
                        )}
                        <div className="mt-2">
                          {slot.consent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold-700 bg-gold-100 border border-gold-300 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Consent signed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                              Consent pending
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-[12px] text-gray-400 italic">Not yet nominated</div>
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
