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
    bg:      "bg-[#E8F3ED]/40",
    border:  "border-[#1F8A5B]/30",
    chip:    "bg-[#E8F3ED] text-[#1F8A5B]",
    tagline: "Already accredited; no PANORAIMA assistance needed.",
  },
  coordinating: {
    label:   "Need coordination",
    icon:    Handshake,
    bg:      "bg-[#EEF2FF]/40",
    border:  "border-[#C9D4FF]",
    chip:    "bg-[#EEF2FF] text-[#2251FF]",
    tagline: "Explicit roadmap or support asked for.",
  },
  waiting: {
    label:   "Awaiting info",
    icon:    Hourglass,
    bg:      "bg-[#F7F8FA]",
    border:  "border-[#E3E7ED]",
    chip:    "bg-[#EEF1F5] text-[#51607A]",
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
  if (v === "yes") return "text-[#1F8A5B] bg-[#E8F3ED] border-[#1F8A5B]/30"
  if (v === "no")  return "text-[#C0392B] bg-[#F7E9E6] border-[#C0392B]/30"
  return "text-[#97A0AD] bg-[#F7F8FA] border-[#E3E7ED]"
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2251FF] border border-[#C9D4FF] bg-[#EEF2FF]">
          The accreditation landscape
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[#0A1F33]">
          Where each partner stands
        </h2>
        <p className="mt-1 text-sm text-[#6B7686] max-w-xl">
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
                <Icon className="w-4 h-4 text-[#51607A]" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-[#0A1F33]">
                  {meta.label}
                </h3>
                <span className={`font-mono text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full ${meta.chip}`}>
                  {group.length}
                </span>
                <span className="text-[11px] text-[#6B7686] italic">{meta.tagline}</span>
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
            className="absolute inset-0 bg-[#051C2C]/55 pointer-events-auto animate-fade-in"
            onClick={() => setActiveAbbr(null)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[520px] bg-white shadow-2xl pointer-events-auto overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white border-b border-[#E3E7ED] px-6 py-4 flex items-center justify-between gap-4 z-10">
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-[#2251FF]">{active.abbr}</div>
                <div className="text-base font-bold text-[#0A1F33] leading-tight">
                  {active.institution}
                </div>
                <div className="text-[11px] text-[#97A0AD]">{active.country}</div>
              </div>
              <button
                onClick={() => setActiveAbbr(null)}
                className="p-2 hover:bg-[#F7F8FA] rounded-lg"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[#6B7686]" />
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
              <div className="rounded-xl border border-[#E3E7ED] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#2251FF] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#51607A]">
                    Existing study programmes
                  </div>
                  <div className="text-2xl font-bold text-[#0A1F33] tabular-nums">
                    {active.programmes}
                  </div>
                </div>
              </div>

              {/* Contact */}
              {(active.contact.email || active.contact.phone || active.contact.raw) && (
                <div className="rounded-xl border border-[#E3E7ED] p-4">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#51607A] mb-2">
                    Contact
                  </div>
                  {active.contact.email && (
                    <div className="text-[12px] font-mono text-[#0A1F33] break-all">{active.contact.email}</div>
                  )}
                  {active.contact.phone && (
                    <div className="mt-0.5 text-[11px] font-mono text-[#6B7686]">{active.contact.phone}</div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="rounded-xl border border-[#C9D4FF] bg-[#EEF2FF]/40 p-4">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#2251FF] mb-2">
                  Actions required in PANORAIMA — in the partner&apos;s own words
                </div>
                {active.action_text ? (
                  <p className="text-[13px] text-[#51607A] leading-relaxed whitespace-pre-line">
                    {active.action_text}
                  </p>
                ) : (
                  <p className="text-[13px] italic text-[#97A0AD]">
                    No response filed yet.
                  </p>
                )}
              </div>

              {/* Links */}
              {active.links.length > 0 && (
                <div className="rounded-xl border border-[#E3E7ED] p-4">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#51607A] mb-2">
                    Reference links
                  </div>
                  <ul className="space-y-2">
                    {active.links.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[12px] text-[#2251FF] hover:text-[#1D43D8] underline break-all"
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
            <Building2 className="w-3.5 h-3.5 text-[#97A0AD]" />
            <span className="font-mono text-xs font-bold text-[#0A1F33]">{p.abbr}</span>
            {p.abbr === "HAW" && (
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#2251FF] bg-[#EEF2FF] border border-[#C9D4FF] px-1.5 py-0.5 rounded-full">
                Lead
              </span>
            )}
          </div>
          <div className="mt-1 text-[12px] text-[#51607A] leading-tight line-clamp-2">
            {p.institution}
          </div>
          <div className="mt-0.5 text-[10px] text-[#97A0AD]">{p.country}</div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-bold text-[#0A1F33] tabular-nums leading-none">
            {p.programmes}
          </div>
          <div className="font-mono text-[9px] uppercase font-bold tracking-wider text-[#97A0AD]">
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
        <p className="mt-3 text-[11.5px] text-[#6B7686] leading-snug italic line-clamp-2 border-l-2 border-[#C9D4FF] pl-2.5">
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
