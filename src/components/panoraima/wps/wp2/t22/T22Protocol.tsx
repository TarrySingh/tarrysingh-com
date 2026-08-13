"use client"

import { FileText, Users2, Mic2, ShieldCheck } from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"
import {
  NAVY,
  NAVY_2,
  INK,
  SLATE,
  MUTE,
  COBALT,
  COBALT_SOFT,
  COBALT_LINE,
  OK,
  OK_SOFT,
  WARN,
  WARN_SOFT,
  KICKER,
} from "../../../consortiumTokens"

interface Props {
  detail: Task22Detail
}

export default function T22Protocol({ detail }: Props) {
  const { protocol, focus_group } = detail

  return (
    <section>
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${KICKER} text-[10px]`}
          style={{ color: COBALT, borderWidth: 1, borderStyle: "solid", borderColor: COBALT_LINE, backgroundColor: COBALT_SOFT }}
        >
          Signature moment · The research protocol
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          How UNIWA designed the study
        </h2>
        <p className="mt-1 text-sm max-w-2xl" style={{ color: SLATE }}>
          Before any data was collected, the focus group was governed by a bilingual
          (Greek / English) research protocol laying out aim, methodology, GDPR-grade
          data protection, and expected outputs. The spine below mirrors its actual
          section structure.
        </p>
      </div>

      {/* Large callout: title + research team */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-10 text-white mb-10"
        style={{ backgroundColor: NAVY, borderWidth: 1, borderStyle: "solid", borderColor: NAVY_2 }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(circle at 85% 15%, rgba(34, 81, 255, 0.22), transparent 45%),
                         radial-gradient(circle at 10% 100%, rgba(34, 81, 255, 0.16), transparent 45%)`,
          }}
        />
        <div className="relative grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3">
            <div className={`${KICKER} text-[10px] mb-1.5 flex items-center gap-2`} style={{ color: "#7DA0FF" }}>
              <FileText className="w-3 h-3" />
              Πρωτόκολλο · Research Protocol
            </div>
            <h3 className="text-xl md:text-2xl font-bold leading-tight">
              {protocol.title_en}
            </h3>
            <p className="mt-1.5 text-[13px] italic leading-snug text-white/70">
              {protocol.title_el}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/85">
              Submitted to and approved by the UNIWA Ethics Committee. Two focus
              groups were planned, Pedagogic Needs and Organisational Needs,
              with the first run on {focus_group.date} over {focus_group.duration_min} minutes via {focus_group.platform}.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className={`${KICKER} text-[10px] mb-2`} style={{ color: "#7DA0FF" }}>
              Research team · UNIWA
            </div>
            <ul className="space-y-2">
              {focus_group.research_team.map((m) => (
                <li key={m.name} className="flex items-start gap-2.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#7DA0FF" }} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-[11.5px] leading-tight text-white/60">{m.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Protocol spine: 11 sections */}
      <div className="mb-8">
        <div className={`${KICKER} text-[10px] mb-3`} style={{ color: MUTE }}>
          Protocol spine · {protocol.sections.length} sections
        </div>
        <ol className="relative pl-5 space-y-3" style={{ borderLeftWidth: 2, borderLeftStyle: "solid", borderLeftColor: COBALT_LINE }}>
          {protocol.sections.map((s, i) => (
            <li key={i} className="relative">
              <span
                className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-white"
                style={{ borderWidth: 2, borderStyle: "solid", borderColor: COBALT }}
              />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: COBALT }}>
                  §{(i + 1).toString().padStart(2, "0")}
                </span>
                <span className="text-sm font-bold" style={{ color: INK }}>{s.en}</span>
                <span className="text-[11.5px] italic" style={{ color: MUTE }}>· {s.el}</span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug" style={{ color: SLATE }}>{s.description}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Research instrument spotlight */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl p-5" style={{ borderWidth: 1, borderStyle: "solid", borderColor: COBALT_LINE, backgroundColor: COBALT_SOFT }}>
          <div className={`flex items-center gap-2 ${KICKER} text-[10px] mb-1.5`} style={{ color: COBALT }}>
            <Mic2 className="w-3 h-3" /> Instrument
          </div>
          <div className="text-sm font-bold mb-1" style={{ color: INK }}>Mentimeter · two-phase design</div>
          <p className="text-[12.5px] leading-snug" style={{ color: SLATE }}>
            Phase 1, each participant answers all questions individually.
            Phase 2, facilitator shares aggregated answers back and opens the
            floor for group discussion.
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ borderWidth: 1, borderStyle: "solid", borderColor: OK, backgroundColor: OK_SOFT }}>
          <div className={`flex items-center gap-2 ${KICKER} text-[10px] mb-1.5`} style={{ color: OK }}>
            <Users2 className="w-3 h-3" /> Participants
          </div>
          <div className="text-sm font-bold mb-1" style={{ color: INK }}>
            {focus_group.participant_count} academics · 4 roles per institution
          </div>
          <p className="text-[12.5px] leading-snug" style={{ color: SLATE }}>
            One Teaching Staff · one Researcher · one Student Representative ·
            one Administrative staff invited from each of the 8 partner universities.
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ borderWidth: 1, borderStyle: "solid", borderColor: WARN, backgroundColor: WARN_SOFT }}>
          <div className={`flex items-center gap-2 ${KICKER} text-[10px] mb-1.5`} style={{ color: WARN }}>
            <ShieldCheck className="w-3 h-3" /> Ethics & data protection
          </div>
          <div className="text-sm font-bold mb-1" style={{ color: INK }}>3 procedural layers</div>
          <p className="text-[12.5px] leading-snug" style={{ color: SLATE }}>
            Administrative (invitations & consent) · Technical (password-protected
            OneDrive storage, MS Teams recording) · Physical (access restricted to
            the 4-person research team only).
          </p>
        </div>
      </div>
    </section>
  )
}
