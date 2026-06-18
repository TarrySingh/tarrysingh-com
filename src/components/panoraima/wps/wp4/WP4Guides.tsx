"use client"

import {
  PenLine, ListChecks, Bot, Globe, FileText, CheckCircle,
  Sparkles, AlertTriangle, MessageSquare, Chrome,
} from "lucide-react"
import type {
  Wp4Registry, Wp4TemplateSection, Wp4ReviewerCheck, Wp4ClaudeHowto,
} from "@/lib/panoraima/types"
import { RUST, RUST_SOFT } from "./wp4constants"

const HOWTO_ICON: Record<string, typeof Globe> = {
  "globe": Globe,
  "file":  FileText,
  "check": CheckCircle,
}

function PanelHead({
  icon: Icon, kicker, title, lead,
}: {
  icon: typeof PenLine
  kicker: string
  title: string
  lead: string
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-[#9CA3AF]">
          {kicker}
        </span>
      </div>
      <h3 className="text-[15px] font-bold text-[#16181D] leading-tight tracking-[-0.01em]">{title}</h3>
      <p className="mt-1.5 text-[12px] text-[#6B7280] leading-relaxed">{lead}</p>
    </div>
  )
}

function TemplateRow({ section }: { section: Wp4TemplateSection }) {
  return (
    <div className="rounded-lg border border-[#E7E7EA] bg-white px-3 py-2.5 transition-colors hover:border-[#16181D]/20">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-[#16181D] leading-snug">
          {section.name}
        </span>
        {section.author_owns ? (
          <span
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white flex-shrink-0"
            style={{ background: RUST }}
          >
            <PenLine className="w-2.5 h-2.5" />
            you fill this
          </span>
        ) : (
          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-600 flex-shrink-0">
            pre-filled
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11.5px] text-[#6B7280] leading-relaxed">{section.guidance}</p>
    </div>
  )
}

function ReviewerRow({ check, index }: { check: Wp4ReviewerCheck; index: number }) {
  return (
    <div className="flex gap-3">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#E7E7EA] bg-white font-mono text-[10px] font-bold tabular-nums text-[#16181D] flex-shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-[#16181D] leading-snug">{check.title}</div>
        <p className="mt-0.5 text-[11.5px] text-[#6B7280] leading-relaxed">{check.detail}</p>
      </div>
    </div>
  )
}

function HowtoCard({ howto }: { howto: Wp4ClaudeHowto }) {
  const Icon = HOWTO_ICON[howto.icon] ?? Sparkles
  return (
    <div className="rounded-lg border border-[#E7E7EA] bg-white p-3.5 transition-colors hover:border-[#16181D]/20">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
        <span className="text-[12.5px] font-bold text-[#16181D] leading-tight">{howto.context}</span>
      </div>
      <div className="mt-2.5 inline-flex items-center gap-1 rounded bg-[#16181D] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white">
        <Bot className="w-2.5 h-2.5" />
        {howto.tool}
      </div>
      <p className="mt-2 text-[11.5px] text-[#6B7280] leading-relaxed">{howto.how}</p>
    </div>
  )
}

export default function WP4Guides({ registry }: { registry: Wp4Registry }) {
  const { template_sections, reviewer_checklist, review_process_note, reviewer_role_summary, claude_howto } =
    registry.guides

  return (
    <section>
      <div className="mb-8">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: RUST }}>
          Working guides
        </div>
        <h2 className="text-2xl md:text-[2rem] font-bold tracking-[-0.02em] text-[#16181D]">
          How to fill in &amp; review
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280] max-w-2xl">
          The references the team uses to author and review Learning Events efficiently —
          what a finished LE needs, how to review it, and how to drive Claude along the way.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* 1. Author template */}
        <div className="rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 transition-colors hover:border-[#16181D]/20">
          <PanelHead
            icon={PenLine}
            kicker="Author template"
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
        <div className="rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 transition-colors hover:border-[#16181D]/20">
          <PanelHead
            icon={ListChecks}
            kicker="Reviewer checklist"
            title="Reviewer checklist"
            lead={reviewer_role_summary}
          />
          <div className="space-y-3">
            {reviewer_checklist.map((c, i) => (
              <ReviewerRow key={`${c.title}-${i}`} check={c} index={i} />
            ))}
          </div>

          {/* Must-do callout */}
          <div className="mt-5 rounded-lg px-3 py-2.5" style={{ background: RUST_SOFT }}>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: RUST }}>
              <AlertTriangle className="w-3 h-3" />
              Must do
            </div>
            <p className="mt-1 flex items-start gap-1.5 text-[11.5px] leading-relaxed" style={{ color: RUST }}>
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{review_process_note}</span>
            </p>
          </div>
        </div>

        {/* 3. How to use Claude */}
        <div className="rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 transition-colors hover:border-[#16181D]/20">
          <PanelHead
            icon={Bot}
            kicker="How to use Claude"
            title="How to use Claude"
            lead="Drive Claude in the wiki via the Chrome extension; in SharePoint via Claude inside the PPT or doc."
          />
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-600">
              <Chrome className="w-3 h-3 text-[#9CA3AF]" />
              Wiki &rarr; extension
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-600">
              <FileText className="w-3 h-3 text-[#9CA3AF]" />
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
