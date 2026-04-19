"use client"

import { useState } from "react"
import {
  Building2, CheckCircle2, XCircle, CircleHelp, BookOpen, ExternalLink, X,
  CheckCircle, Handshake, Hourglass,
} from "lucide-react"
import type { Task23Detail, T23Partner } from "@/lib/panoraima/types"

interface Props {
  detail: Task23Detail
}

const BAND_META: Record<string, { label: string; icon: typeof CheckCircle; bg: string; border: string; chip: string; tagline: string }> = {
  ready: {
    label:   "Ready to go",
    icon:    CheckCircle,
    bg:      "bg-emerald-50/40",
    border:  "border-emerald-200",
    chip:    "bg-emerald-100 text-emerald-800",
    tagline: "Already accredited; no PANORAIMA assistance needed.",
  },
  coordinating: {
    label:   "Need coordination",
    icon:    Handshake,
    bg:      "bg-gold-50/30",
    border:  "border-gold-200",
    chip:    "bg-gold-100 text-gold-800",
    tagline: "Explicit roadmap or support asked for.",
  },
  waiting: {
    label:   "Awaiting info",
    icon:    Hourglass,
    bg:      "bg-slate-50/60",
    border:  "border-slate-200",
    chip:    "bg-slate-100 text-slate-700",
    tagline: "No action text provided yet; follow-up required.",
  },
}

const BANDS = ["ready", "coordinating", "waiting"] as const

function flagIcon(v: string) {
  if (v === "yes") return CheckCircle2
  if (v === "no")  return XCircle
  return CircleHelp
}

function flagClass(v: string) {
  if (v === "yes") return "text-emerald-600 bg-emerald-50 border-emerald-200"
  if (v === "no")  return "text-rose-600 bg-rose-50 border-rose-200"
  return "text-gray-400 bg-gray-50 border-gray-200"
}

function flagLabel(v: string) {
  if (v === "yes") return "Yes"
  if (v === "no")  return "No"
  if (v === "blank" || !v) return "—"
  return v
}

export default function T23Landscape({ detail }: Props) {
  const [activeAbbr, setActiveAbbr] = useState<string | null>(null)
  const active = detail.partners.find(p => p.abbr === activeAbbr)

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          The accreditation landscape
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          Where each partner stands
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Consortium partners grouped by coordination state. Click a card to
          read the full response the partner wrote back to HAW.
        </p>
      </div>

      <div className="space-y-8">
        {BANDS.map(band => {
          const group = detail.partners.filter(p => p.band === band)
          if (group.length === 0) return null
          const meta = BAND_META[band]
          const Icon = meta.icon
          return (
            <div key={band}>
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-4 h-4 text-navy-500" />
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-navy-800">
                  {meta.label}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.chip}`}>
                  {group.length}
                </span>
                <span className="text-[11px] text-gray-500 italic">{meta.tagline}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {group.map(p => <PartnerCard key={p.abbr} p={p} onOpen={() => setActiveAbbr(p.abbr)} />)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Drawer */}
      {active && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            className="absolute inset-0 bg-navy-950/55 pointer-events-auto animate-fade-in"
            onClick={() => setActiveAbbr(null)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[520px] bg-white shadow-2xl pointer-events-auto overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4 z-10">
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold text-navy-400">{active.abbr}</div>
                <div className="text-base font-bold text-navy-900 leading-tight">
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

            <div className="px-6 py-5 space-y-5">
              {/* Status chips */}
              <div className="grid grid-cols-3 gap-2">
                <StatusChip label="Inst. acc."   value={active.institutional_accreditation} />
                <StatusChip label="Programme acc." value={active.programme_accreditation} />
                <StatusChip label="Roadmap"      value={active.roadmap} />
              </div>

              {/* Programme count */}
              <div className="rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-navy-500">
                    Existing study programmes
                  </div>
                  <div className="text-2xl font-bold text-navy-900 tabular-nums">
                    {active.programmes}
                  </div>
                </div>
              </div>

              {/* Contact */}
              {(active.contact.email || active.contact.phone || active.contact.raw) && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-navy-500 mb-2">
                    Contact
                  </div>
                  {active.contact.email && (
                    <div className="text-[12px] font-mono text-navy-900 break-all">{active.contact.email}</div>
                  )}
                  {active.contact.phone && (
                    <div className="mt-0.5 text-[11px] font-mono text-gray-600">{active.contact.phone}</div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="rounded-xl border border-gold-200 bg-gold-50/40 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold-700 mb-2">
                  Actions required in PANORAIMA — in the partner&apos;s own words
                </div>
                {active.action_text ? (
                  <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
                    {active.action_text}
                  </p>
                ) : (
                  <p className="text-[13px] italic text-gray-400">
                    No response filed yet.
                  </p>
                )}
              </div>

              {/* Links */}
              {active.links.length > 0 && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-navy-500 mb-2">
                    Reference links
                  </div>
                  <ul className="space-y-2">
                    {active.links.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[12px] text-navy-700 hover:text-navy-900 underline break-all"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }
        .animate-slide-in-right { animation: slide-in-right 0.22s ease-out; }
      `}</style>
    </section>
  )
}

function PartnerCard({ p, onOpen }: { p: T23Partner; onOpen: () => void }) {
  const InstIcon = flagIcon(p.institutional_accreditation)
  const ProgIcon = flagIcon(p.programme_accreditation)
  const meta = BAND_META[p.band]

  return (
    <button
      onClick={onOpen}
      className={`text-left rounded-2xl border ${meta.border} ${meta.bg} hover:shadow-md p-4 transition-all`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-navy-400" />
            <span className="font-mono text-xs font-bold text-navy-900">{p.abbr}</span>
            {p.abbr === "HAW" && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-gold-700 bg-gold-100 border border-gold-300 px-1.5 py-0.5 rounded-full">
                Lead
              </span>
            )}
          </div>
          <div className="mt-1 text-[12px] text-gray-700 leading-tight line-clamp-2">
            {p.institution}
          </div>
          <div className="mt-0.5 text-[10px] text-gray-400">{p.country}</div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-bold text-navy-900 tabular-nums leading-none">
            {p.programmes}
          </div>
          <div className="text-[9px] uppercase font-bold tracking-wider text-gray-400">
            progs
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${flagClass(p.institutional_accreditation)}`}
          title="Institutional accreditation"
        >
          <InstIcon className="w-2.5 h-2.5" />
          Inst
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${flagClass(p.programme_accreditation)}`}
          title="Programme accreditation"
        >
          <ProgIcon className="w-2.5 h-2.5" />
          Prog
        </span>
      </div>

      {p.action_text && (
        <p className="mt-3 text-[11.5px] text-gray-600 leading-snug italic line-clamp-2 border-l-2 border-gold-300 pl-2.5">
          &ldquo;{p.action_text}&rdquo;
        </p>
      )}
    </button>
  )
}

function StatusChip({ label, value }: { label: string; value: string }) {
  const Icon = flagIcon(value)
  return (
    <div className={`rounded-lg border p-2 text-center ${flagClass(value)}`}>
      <Icon className="w-4 h-4 mx-auto" />
      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">{label}</div>
      <div className="text-[10px] font-semibold">{flagLabel(value)}</div>
    </div>
  )
}
