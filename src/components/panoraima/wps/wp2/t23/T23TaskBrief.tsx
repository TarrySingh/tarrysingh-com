"use client"

import { FileText, Target, Compass } from "lucide-react"
import type { Task23Detail } from "@/lib/panoraima/types"

interface Props {
  detail: Task23Detail
}

const SECTION_ICON = [Target, FileText, Compass]

export default function T23TaskBrief({ detail }: Props) {
  const brief = detail.task_brief

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7686] border border-[#E3E7ED] bg-[#F7F8FA]">
          Signature moment · The task brief
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[#0A1F33]">
          What HAW means by &ldquo;Internal Accreditation&rdquo;
        </h2>
        <p className="mt-1 text-sm text-[#51607A] max-w-2xl">
          Task 2.3&apos;s scope, distilled from Jakob de Boer&apos;s {brief.source_slide_count}-slide brief circulated
          to the consortium in March 2025. This is the coordination memo that sets the direction.
        </p>
      </div>

      {/* Big memo callout */}
      <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#051C2C] via-[#0A2540] to-[#13334E] p-6 md:p-10 text-white shadow-xl">
        <div
          aria-hidden
          className="absolute inset-0 opacity-55"
          style={{
            background: `radial-gradient(circle at 90% 10%, rgba(34, 81, 255, 0.25), transparent 45%),
                         radial-gradient(circle at 10% 100%, rgba(125, 160, 255, 0.18), transparent 45%)`,
          }}
        />
        <div className="relative">
          {/* Memo header */}
          <div className="flex flex-wrap items-baseline gap-4 border-b border-white/10 pb-4 mb-6">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7DA0FF]">
              MEMO — PANORAIMA · T2.3
            </div>
            <div className="text-[11px] font-mono tabular-nums text-white/55">
              {new Date(brief.authored_at).toLocaleDateString("en-GB", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </div>
            <div className="ml-auto text-[11px] font-mono text-white/55">
              From: <strong className="text-white">{brief.authored_by}</strong>, HAW Hamburg
            </div>
          </div>

          {/* 3 numbered sections */}
          <div className="grid md:grid-cols-3 gap-5">
            {brief.sections.map((s, i) => {
              const Icon = SECTION_ICON[i] ?? FileText
              return (
                <div key={s.n} className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#7DA0FF]/15 border border-[#7DA0FF]/40 flex items-center justify-center text-[#7DA0FF]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] tabular-nums text-[#7DA0FF]">
                      §{s.n} · Slide {s.slide}
                    </div>
                  </div>
                  <h3 className="text-base md:text-lg font-bold leading-tight mb-3">
                    {s.title}
                  </h3>
                  <ul className="space-y-2">
                    {s.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2">
                        <span className="mt-2 w-1 h-1 rounded-full bg-[#7DA0FF] flex-shrink-0" />
                        <span className="text-[13px] text-white/85 leading-relaxed">
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/55">
            <span className="font-mono">{brief.source_file}</span>
            <span className="tabular-nums">{brief.source_slide_count} slides · {brief.source_kb} KB</span>
          </div>
        </div>
      </article>

      {/* Operational contact card */}
      <div className="mt-6 rounded-2xl border border-[#C9D4FF] bg-[#EEF2FF] p-5 flex flex-wrap items-center gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#2251FF] text-white flex items-center justify-center font-bold">
          EQA
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2251FF] mb-0.5">
            Operational contact · {detail.ops_contact.role}
          </div>
          <div className="text-sm font-bold text-[#0A1F33]">{detail.ops_contact.name}</div>
          <div className="text-[11px] font-mono text-[#6B7686]">
            {detail.ops_contact.email}
            {detail.ops_contact.phone && (
              <>  ·  {detail.ops_contact.phone}</>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
