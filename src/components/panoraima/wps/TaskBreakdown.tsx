"use client"

import { useState } from "react"
import { ChevronDown, FileText, CheckCircle2, Clock, Sparkles } from "lucide-react"
import type { WpTask, WpDeliverable } from "@/lib/panoraima/types"

interface Props {
  tasks: WpTask[]
  onDeliverableClick: (d: WpDeliverable) => void
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  final:    { label: "Final",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  reviewed: { label: "In review", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  draft:    { label: "Draft",     cls: "bg-gold-50 text-gold-700 border-gold-200" },
  unknown:  { label: "—",         cls: "bg-gray-50 text-gray-500 border-gray-200" },
}

export default function TaskBreakdown({ tasks, onDeliverableClick }: Props) {
  const [openId, setOpenId] = useState<string | null>(tasks[0]?.id ?? null)

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Task breakdown
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          What each task produced
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Click a task to see its deliverables and status. Click a deliverable to peek at the
          first few paragraphs of the document.
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => {
          const isOpen = openId === t.id
          const isTask = t.id.startsWith("T")
          const deliverables = t.deliverables ?? []
          return (
            <div
              key={t.id}
              className={`rounded-2xl border transition-all ${
                isOpen ? "border-navy-200 shadow-sm bg-white" : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : t.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left"
                aria-expanded={isOpen}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-xs ${isTask ? "text-navy-900" : "text-gray-400"}`}>
                      {t.id}
                    </span>
                    <span className="font-semibold text-navy-900">{t.title}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {t.file_count} files
                    </span>
                    {deliverables.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {deliverables.length} deliverable{deliverables.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 animate-fade-in border-t border-gray-100">
                  {deliverables.length === 0 ? (
                    <p className="mt-4 text-[12px] text-gray-500 italic">
                      No formal deliverables attached to this task yet — the {t.file_count} file
                      {t.file_count === 1 ? "" : "s"} in this task are working docs, research notes
                      or meeting outputs.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {deliverables.map((d) => {
                        const style = STATUS_STYLE[d.status] || STATUS_STYLE.unknown
                        return (
                          <button
                            key={d.id + d.file}
                            onClick={() => onDeliverableClick(d)}
                            className="w-full text-left rounded-xl border border-gray-100 p-4 hover:border-navy-200 hover:bg-navy-50/30 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-[11px] font-bold text-navy-900">
                                    {d.id}
                                  </span>
                                  {d.version && (
                                    <span className="text-[10px] font-mono text-gray-500">
                                      v{d.version}
                                    </span>
                                  )}
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${style.cls}`}
                                  >
                                    {d.status === "final" ? (
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                    ) : (
                                      <Clock className="w-2.5 h-2.5" />
                                    )}
                                    {style.label}
                                  </span>
                                </div>
                                <div className="mt-1 text-sm font-semibold text-navy-900 group-hover:underline">
                                  {d.file.replace(/\.[^.]+$/, "")}
                                </div>
                                {d.excerpt && (
                                  <p className="mt-2 text-[12.5px] text-gray-600 leading-snug italic line-clamp-2 border-l-2 border-gold-300 pl-3">
                                    &ldquo;{d.excerpt.slice(0, 200)}…&rdquo;
                                  </p>
                                )}
                                <div className="mt-2 text-[10px] font-mono text-gray-400 flex items-center gap-3">
                                  {d.date && <span>{d.date}</span>}
                                  {d.size_kb ? <span>{d.size_kb} KB</span> : null}
                                </div>
                              </div>
                              <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover:text-navy-600 transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
