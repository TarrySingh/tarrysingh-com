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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Signature moment · The task brief
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          What HAW means by &ldquo;Internal Accreditation&rdquo;
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
          Task 2.3&apos;s scope, distilled from Jakob de Boer&apos;s {brief.source_slide_count}-slide brief circulated
          to the consortium in March 2025. This is the coordination memo that sets the direction.
        </p>
      </div>

      {/* Big memo callout */}
      <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-[#12305a] p-6 md:p-10 text-white shadow-xl">
        <div
          aria-hidden
          className="absolute inset-0 opacity-55"
          style={{
            background: `radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.25), transparent 45%),
                         radial-gradient(circle at 10% 100%, rgba(201, 169, 110, 0.25), transparent 45%)`,
          }}
        />
        <div className="relative">
          {/* Memo header */}
          <div className="flex flex-wrap items-baseline gap-4 border-b border-white/10 pb-4 mb-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-400">
              MEMO — PANORAIMA · T2.3
            </div>
            <div className="text-[11px] font-mono text-navy-100/60">
              {new Date(brief.authored_at).toLocaleDateString("en-GB", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </div>
            <div className="ml-auto text-[11px] font-mono text-navy-100/60">
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
                    <div className="w-8 h-8 rounded-full bg-gold-500/15 border border-gold-400/40 flex items-center justify-center text-gold-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">
                      §{s.n} · Slide {s.slide}
                    </div>
                  </div>
                  <h3 className="text-base md:text-lg font-bold leading-tight mb-3">
                    {s.title}
                  </h3>
                  <ul className="space-y-2">
                    {s.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2">
                        <span className="mt-2 w-1 h-1 rounded-full bg-gold-400 flex-shrink-0" />
                        <span className="text-[13px] text-navy-100/85 leading-relaxed">
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
          <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-navy-100/60">
            <span className="font-mono">{brief.source_file}</span>
            <span>{brief.source_slide_count} slides · {brief.source_kb} KB</span>
          </div>
        </div>
      </article>

      {/* Operational contact card */}
      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 flex flex-wrap items-center gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
          EQA
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-0.5">
            Operational contact · {detail.ops_contact.role}
          </div>
          <div className="text-sm font-bold text-navy-900">{detail.ops_contact.name}</div>
          <div className="text-[11px] font-mono text-gray-500">
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
