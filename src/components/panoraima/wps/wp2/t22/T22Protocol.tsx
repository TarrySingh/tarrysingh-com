"use client"

import { FileText, Users2, Mic2, ShieldCheck } from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"

interface Props {
  detail: Task22Detail
}

export default function T22Protocol({ detail }: Props) {
  const { protocol, focus_group } = detail

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Signature moment · The research protocol
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          How UNIWA designed the study
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
          Before any data was collected, the focus group was governed by a bilingual
          (Greek / English) research protocol laying out aim, methodology, GDPR-grade
          data protection, and expected outputs. The spine below mirrors its actual
          section structure.
        </p>
      </div>

      {/* Large callout: title + research team */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-[#0f2d54] p-6 md:p-10 text-white shadow-xl mb-10">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(circle at 85% 15%, rgba(201, 169, 110, 0.28), transparent 45%),
                         radial-gradient(circle at 10% 100%, rgba(14, 165, 233, 0.25), transparent 45%)`,
          }}
        />
        <div className="relative grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 mb-1.5 flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Πρωτόκολλο · Research Protocol
            </div>
            <h3 className="text-xl md:text-2xl font-bold leading-tight">
              {protocol.title_en}
            </h3>
            <p className="mt-1.5 text-[13px] text-navy-100/70 italic leading-snug">
              {protocol.title_el}
            </p>
            <p className="mt-4 text-sm text-navy-100/85 leading-relaxed">
              Submitted to and approved by the UNIWA Ethics Committee. Two focus
              groups were planned — Pedagogic Needs and Organisational Needs —
              with the first run on {focus_group.date} over {focus_group.duration_min} minutes via {focus_group.platform}.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 mb-2">
              Research team · UNIWA
            </div>
            <ul className="space-y-2">
              {focus_group.research_team.map((m) => (
                <li key={m.name} className="flex items-start gap-2.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-[11.5px] text-navy-100/60 leading-tight">{m.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Protocol spine: 11 sections */}
      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400 mb-3">
          Protocol spine · {protocol.sections.length} sections
        </div>
        <ol className="relative border-l-2 border-gold-200 pl-5 space-y-3">
          {protocol.sections.map((s, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-gold-400" />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[10px] font-mono font-bold text-gold-600 tabular-nums">
                  §{(i + 1).toString().padStart(2, "0")}
                </span>
                <span className="text-sm font-bold text-navy-900">{s.en}</span>
                <span className="text-[11.5px] italic text-gray-500">· {s.el}</span>
              </div>
              <p className="mt-0.5 text-[13px] text-gray-600 leading-snug">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Research instrument spotlight */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-sky-600 mb-1.5">
            <Mic2 className="w-3 h-3" /> Instrument
          </div>
          <div className="text-sm font-bold text-navy-900 mb-1">Mentimeter · two-phase design</div>
          <p className="text-[12.5px] text-gray-600 leading-snug">
            Phase 1 — each participant answers all questions individually.
            Phase 2 — facilitator shares aggregated answers back and opens the
            floor for group discussion.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700 mb-1.5">
            <Users2 className="w-3 h-3" /> Participants
          </div>
          <div className="text-sm font-bold text-navy-900 mb-1">
            {focus_group.participant_count} academics · 4 roles per institution
          </div>
          <p className="text-[12.5px] text-gray-600 leading-snug">
            One Teaching Staff · one Researcher · one Student Representative ·
            one Administrative staff invited from each of the 8 partner universities.
          </p>
        </div>
        <div className="rounded-2xl border border-gold-100 bg-gold-50/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gold-700 mb-1.5">
            <ShieldCheck className="w-3 h-3" /> Ethics & data protection
          </div>
          <div className="text-sm font-bold text-navy-900 mb-1">3 procedural layers</div>
          <p className="text-[12.5px] text-gray-600 leading-snug">
            Administrative (invitations & consent) · Technical (password-protected
            OneDrive storage, MS Teams recording) · Physical (access restricted to
            the 4-person research team only).
          </p>
        </div>
      </div>
    </section>
  )
}
