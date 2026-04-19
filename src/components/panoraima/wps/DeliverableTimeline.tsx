"use client"

import { useState, useMemo } from "react"
import { Users, FileText, BookOpen, Calendar, Package, ChevronLeft, ChevronRight } from "lucide-react"
import type { WpTimelineEntry } from "@/lib/panoraima/types"
import { useRef, useEffect } from "react"

interface Props {
  entries: WpTimelineEntry[]
  color: string
}

const TYPE_META: Record<string, { label: string; icon: typeof FileText; dot: string }> = {
  focus_group:  { label: "Focus group", icon: Users,       dot: "bg-sky-500"     },
  meeting:      { label: "Meeting",     icon: Calendar,    dot: "bg-violet-500"  },
  deliverable:  { label: "Deliverable", icon: Package,     dot: "bg-emerald-500" },
  research:     { label: "Research",    icon: BookOpen,    dot: "bg-gold-500"    },
  draft:        { label: "Draft",       icon: FileText,    dot: "bg-gold-500"    },
  admin:        { label: "Admin",       icon: FileText,    dot: "bg-gray-400"    },
  template:     { label: "Template",    icon: FileText,    dot: "bg-gray-400"    },
  presentation: { label: "Presentation", icon: BookOpen,   dot: "bg-rose-500"    },
  other:        { label: "Document",    icon: FileText,    dot: "bg-gray-400"    },
}

export default function DeliverableTimeline({ entries, color }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [canL, setCanL] = useState(false)
  const [canR, setCanR] = useState(true)

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries]
  )

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const handle = () => {
      setCanL(el.scrollLeft > 8)
      setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
    }
    handle()
    el.addEventListener("scroll", handle, { passive: true })
    const ro = new ResizeObserver(handle)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", handle)
      ro.disconnect()
    }
  }, [sorted.length])

  if (sorted.length === 0) return null

  const scrollBy = (dx: number) => scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" })

  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
            Timeline
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
            How the work unfolded
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            Every dated artefact along a single rail. Hover a node to see the file title.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scrollBy(-400)}
            disabled={!canL}
            aria-label="Scroll earlier"
            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-navy-600 hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(400)}
            disabled={!canR}
            aria-label="Scroll later"
            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-navy-600 hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollerRef}
          className="overflow-x-auto pt-36 pb-36 scrollbar-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="relative min-w-max"
            style={{ width: `${Math.max(sorted.length * 130, 800)}px` }}
          >
            {/* Rail */}
            <div
              className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
              style={{ background: `linear-gradient(90deg, #e5e7eb, ${color}55, #e5e7eb)` }}
            />

            <div className="relative flex items-center h-32">
              {sorted.map((e, i) => {
                const meta = TYPE_META[e.type] || TYPE_META.other
                const Icon = meta.icon
                const x = `${(i / Math.max(1, sorted.length - 1)) * 100}%`
                const isHov = hoveredIdx === i
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: x }}
                  >
                    {/* stem */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-[1.5px] bg-gray-200"
                      style={{
                        top: i % 2 === 0 ? -46 : 16,
                        height: 30,
                      }}
                    />
                    {/* date label */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
                      style={{ top: i % 2 === 0 ? -76 : 46 }}
                    >
                      <div className="text-[10px] font-mono font-semibold text-gray-500">
                        {e.date}
                      </div>
                      <div className="text-[11px] mt-0.5 font-medium text-gray-500">
                        {meta.label}
                      </div>
                    </div>

                    {/* node */}
                    <button
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className={`relative block w-3.5 h-3.5 rounded-full ring-4 ring-white shadow ${meta.dot} hover:scale-125 transition-transform`}
                      aria-label={`${e.date}: ${e.title}`}
                    />

                    {/* hover tooltip */}
                    {isHov && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 z-20 w-[280px] rounded-xl bg-navy-900 text-white shadow-2xl p-4 animate-fade-in pointer-events-none"
                        style={{ top: i % 2 === 0 ? -148 : 60 }}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gold-300 mb-1">
                          <Icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                          {e.region && (
                            <>
                              <span className="text-navy-100/30">·</span>
                              <span className="text-navy-100/70">{e.region}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm font-bold leading-tight mb-1 line-clamp-3">
                          {e.title}
                        </div>
                        <div className="text-[11px] font-mono text-navy-100/60">{e.date}</div>
                        {e.task && (
                          <div className="text-[11px] mt-2 text-navy-100/60">
                            Task{" "}
                            <span className="font-mono font-semibold text-gold-300">
                              {e.task}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
