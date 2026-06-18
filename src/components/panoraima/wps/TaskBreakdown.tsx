"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, FileText, CheckCircle2, Clock, Sparkles, ArrowRight } from "lucide-react"
import type { WpTask, WpDeliverable } from "@/lib/panoraima/types"
import {
  INK, SLATE, MUTE, FAINT, LINE, SURFACE,
  COBALT, COBALT_DK, COBALT_SOFT, COBALT_LINE,
  OK, OK_SOFT, WARN, WARN_SOFT, KICKER, NUM,
} from "../consortiumTokens"

interface Props {
  tasks: WpTask[]
  onDeliverableClick: (d: WpDeliverable) => void
  /** Task IDs that have a dedicated deep-dive page under /wps/[wp]/[task]. */
  deepDiveTaskIds?: string[]
  /** Slug of the parent WP (for building the deep-dive URL). */
  wpSlug?: string
}

// done=OK, in-review=COBALT, draft/at-risk=WARN, unknown=neutral.
const STATUS_STYLE: Record<string, { label: string; fg: string; bg: string; bd: string }> = {
  final:    { label: "Final",     fg: OK,    bg: OK_SOFT,     bd: OK },
  reviewed: { label: "In review", fg: COBALT, bg: COBALT_SOFT, bd: COBALT_LINE },
  draft:    { label: "Draft",     fg: WARN,  bg: WARN_SOFT,   bd: WARN },
  unknown:  { label: "—",         fg: MUTE,  bg: SURFACE,     bd: LINE },
}

export default function TaskBreakdown({
  tasks, onDeliverableClick, deepDiveTaskIds = [], wpSlug = "",
}: Props) {
  const [openId, setOpenId] = useState<string | null>(tasks[0]?.id ?? null)

  const hasDeepDive = (id: string) => deepDiveTaskIds.includes(id)
  const deepDiveSlug = (id: string) => `t${id.replace(/\D/g, "")}`

  return (
    <section>
      <div className="mb-5">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${KICKER}`}
          style={{ color: FAINT, border: `1px solid ${LINE}`, background: SURFACE }}
        >
          Task breakdown
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          What each task produced
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
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
              className="rounded-2xl border bg-white transition-all"
              style={{ borderColor: isOpen ? COBALT_LINE : LINE }}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : t.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left"
                aria-expanded={isOpen}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono font-bold text-xs tabular-nums"
                      style={{ color: isTask ? INK : FAINT }}
                    >
                      {t.id}
                    </span>
                    <span className="font-semibold" style={{ color: INK }}>{t.title}</span>
                  </div>
                  <div className="mt-1 text-[11px] flex items-center gap-3" style={{ color: MUTE }}>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span className={NUM}>{t.file_count}</span> files
                    </span>
                    {deliverables.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span className={NUM}>{deliverables.length}</span> deliverable{deliverables.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  style={{ color: FAINT }}
                />
              </button>

              {isOpen && (
                <div
                  className="px-5 pb-5 pt-0 animate-fade-in border-t"
                  style={{ borderColor: LINE }}
                >
                  {hasDeepDive(t.id) && wpSlug && (
                    <Link
                      href={`/experiments/panoraima/wps/${wpSlug}/${deepDiveSlug(t.id)}`}
                      prefetch={false}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold text-white transition-colors"
                      style={{ background: COBALT }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = COBALT_DK)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = COBALT)}
                    >
                      <Sparkles className="w-3.5 h-3.5" style={{ color: "#FFFFFF" }} />
                      Dive deeper into {t.id}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {deliverables.length === 0 ? (
                    <p className="mt-4 text-[12px] italic" style={{ color: MUTE }}>
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
                            className="w-full text-left rounded-xl border p-4 transition-colors group"
                            style={{ borderColor: LINE }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = COBALT_LINE
                              e.currentTarget.style.background = COBALT_SOFT
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = LINE
                              e.currentTarget.style.background = "transparent"
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: INK }}>
                                    {d.id}
                                  </span>
                                  {d.version && (
                                    <span className="text-[10px] font-mono tabular-nums" style={{ color: MUTE }}>
                                      v{d.version}
                                    </span>
                                  )}
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                                    style={{ color: style.fg, background: style.bg, borderColor: style.bd }}
                                  >
                                    {d.status === "final" ? (
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                    ) : (
                                      <Clock className="w-2.5 h-2.5" />
                                    )}
                                    {style.label}
                                  </span>
                                </div>
                                <div className="mt-1 text-sm font-semibold group-hover:underline" style={{ color: INK }}>
                                  {d.file.replace(/\.[^.]+$/, "")}
                                </div>
                                {d.excerpt && (
                                  <p
                                    className="mt-2 text-[12.5px] leading-snug italic line-clamp-2 border-l-2 pl-3"
                                    style={{ color: SLATE, borderColor: COBALT }}
                                  >
                                    &ldquo;{d.excerpt.slice(0, 200)}…&rdquo;
                                  </p>
                                )}
                                <div className="mt-2 text-[10px] font-mono tabular-nums flex items-center gap-3" style={{ color: FAINT }}>
                                  {d.date && <span>{d.date}</span>}
                                  {d.size_kb ? <span>{d.size_kb} KB</span> : null}
                                </div>
                              </div>
                              <ChevronDown
                                className="w-4 h-4 -rotate-90 transition-colors flex-shrink-0 mt-1"
                                style={{ color: FAINT }}
                              />
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
