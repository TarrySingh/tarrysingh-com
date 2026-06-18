"use client"

import {
  PenLine, ListChecks, Bot, Globe, FileText, CheckCircle,
  Sparkles, AlertTriangle, MessageSquare, Chrome,
} from "lucide-react"
import type {
  Wp4Registry, Wp4TemplateSection, Wp4ReviewerCheck, Wp4ClaudeHowto,
} from "@/lib/panoraima/types"

const HOWTO_ICON: Record<string, typeof Globe> = {
  "globe": Globe,
  "file":  FileText,
  "check": CheckCircle,
}

function PanelHead({
  icon: Icon, accent, title, lead,
}: {
  icon: typeof PenLine
  accent: string
  title: string
  lead: string
}) {
  return (
    <div className="flex items-start gap-2.5 mb-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
        style={{ background: accent }}
      >
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-navy-900 leading-tight">{title}</h3>
        <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">{lead}</p>
      </div>
    </div>
  )
}

function TemplateRow({ section }: { section: Wp4TemplateSection }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-navy-900 leading-snug">
          {section.name}
        </span>
        {section.author_owns ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 border border-gold-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-700 flex-shrink-0">
            <PenLine className="w-2.5 h-2.5" />
            you fill this
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 flex-shrink-0">
            pre-filled
          </span>
        )}
      </div>
      <p className="mt-1 text-[11.5px] text-gray-600 leading-relaxed">{section.guidance}</p>
    </div>
  )
}

function ReviewerRow({ check, index }: { check: Wp4ReviewerCheck; index: number }) {
  return (
    <div className="flex gap-2.5">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-bold text-sky-700 tabular-nums flex-shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-navy-900 leading-snug">{check.title}</div>
        <p className="mt-0.5 text-[11.5px] text-gray-600 leading-relaxed">{check.detail}</p>
      </div>
    </div>
  )
}

function HowtoCard({ howto }: { howto: Wp4ClaudeHowto }) {
  const Icon = HOWTO_ICON[howto.icon] ?? Sparkles
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3.5 hover:border-navy-200 transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center text-navy-500 flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[12.5px] font-bold text-navy-900 leading-tight">{howto.context}</span>
      </div>
      <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-navy-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
        <Bot className="w-2.5 h-2.5" />
        {howto.tool}
      </div>
      <p className="mt-2 text-[11.5px] text-gray-600 leading-relaxed">{howto.how}</p>
    </div>
  )
}

export default function WP4Guides({ registry }: { registry: Wp4Registry }) {
  const { template_sections, reviewer_checklist, review_process_note, reviewer_role_summary, claude_howto } =
    registry.guides

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Working guides
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          How to fill in &amp; review
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          The references the team uses to author and review Learning Events efficiently —
          what a finished LE needs, how to review it, and how to drive Claude along the way.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* 1. Author template */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <PanelHead
            icon={PenLine}
            accent="#c9a96e"
            title="Author template"
            lead="Every LE you author should fill these (the complete H-014 example is the reference)."
          />
          <div className="space-y-2">
            {template_sections.map((s, i) => (
              <TemplateRow key={`${s.name}-${i}`} section={s} />
            ))}
          </div>
        </div>

        {/* 2. Reviewer checklist */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <PanelHead
            icon={ListChecks}
            accent="#0ea5e9"
            title="Reviewer checklist"
            lead={reviewer_role_summary}
          />
          <div className="space-y-3">
            {reviewer_checklist.map((c, i) => (
              <ReviewerRow key={`${c.title}-${i}`} check={c} index={i} />
            ))}
          </div>

          {/* Must-do callout */}
          <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gold-700">
              <AlertTriangle className="w-3 h-3" />
              Must do
            </div>
            <p className="mt-1 flex items-start gap-1.5 text-[11.5px] text-gold-800 leading-relaxed">
              <MessageSquare className="w-3.5 h-3.5 text-gold-600 flex-shrink-0 mt-0.5" />
              <span>{review_process_note}</span>
            </p>
          </div>
        </div>

        {/* 3. How to use Claude */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <PanelHead
            icon={Bot}
            accent="#1e293b"
            title="How to use Claude"
            lead="Drive Claude in the wiki via the Chrome extension; in SharePoint via Claude inside the PPT or doc."
          />
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-navy-700">
              <Chrome className="w-3 h-3 text-navy-400" />
              Wiki &rarr; extension
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-navy-700">
              <FileText className="w-3 h-3 text-navy-400" />
              SharePoint &rarr; in-doc
            </span>
          </div>
          <div className="space-y-2.5">
            {claude_howto.map((h, i) => (
              <HowtoCard key={`${h.context}-${i}`} howto={h} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
