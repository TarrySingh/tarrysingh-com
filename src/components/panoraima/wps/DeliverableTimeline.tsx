"use client"

import { useState, useMemo } from "react"
import { Users, FileText, BookOpen, Calendar, Package, ChevronLeft, ChevronRight } from "lucide-react"
import type { WpTimelineEntry } from "@/lib/panoraima/types"
import { useRef, useEffect } from "react"
import { NAVY, INK, SLATE, MUTE, FAINT, LINE, SURFACE, COBALT, OK, BAD, WARN, KICKER, NUM } from "../consortiumTokens"

interface Props {
  entries: WpTimelineEntry[]
  color: string
}

const TYPE_META: Record<string, { label: string; icon: typeof FileText; dot: string }> = {
  focus_group:  { label: "Focus group", icon: Users,       dot: COBALT },
  meeting:      { label: "Meeting",     icon: Calendar,    dot: COBALT },
  deliverable:  { label: "Deliverable", icon: Package,     dot: OK    },
  research:     { label: "Research",    icon: BookOpen,    dot: WARN  },
  draft:        { label: "Draft",       icon: FileText,    dot: WARN  },
  admin:        { label: "Admin",       icon: FileText,    dot: MUTE  },
  template:     { label: "Template",    icon: FileText,    dot: MUTE  },
  presentation: { label: "Presentation", icon: BookOpen,   dot: BAD   },
  other:        { label: "Document",    icon: FileText,    dot: MUTE  },
}

export default function DeliverableTimeline({ entries, color }: Props) {
  void color // prop retained for API stability; rail now uses consortium tokens
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
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${KICKER}`}
            style={{ color: MUTE, borderColor: LINE, background: SURFACE }}
          >
            Timeline
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
            How the work unfolded
          </h2>
          <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
            Every dated artefact along a single rail. Hover a node to see the file title.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scrollBy(-400)}
            disabled={!canL}
            aria-label="Scroll earlier"
            className="w-9 h-9 rounded-full bg-white border disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:bg-[#F7F8FA]"
            style={{ borderColor: LINE, color: MUTE }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(400)}
            disabled={!canR}
            aria-label="Scroll later"
            className="w-9 h-9 rounded-full bg-white border disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:bg-[#F7F8FA]"
            style={{ borderColor: LINE, color: MUTE }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-0 w-10 z-10 pointer-events-none" style={{ background: `linear-gradient(90deg, ${SURFACE}, transparent)` }} />
        <div className="absolute top-0 bottom-0 right-0 w-10 z-10 pointer-events-none" style={{ background: `linear-gradient(270deg, ${SURFACE}, transparent)` }} />

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
              style={{ background: `linear-gradient(90deg, ${LINE}, ${MUTE}55, ${LINE})` }}
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
                      className="absolute left-1/2 -translate-x-1/2 w-[1.5px]"
                      style={{
                        top: i % 2 === 0 ? -46 : 16,
                        height: 30,
                        background: LINE,
                      }}
                    />
                    {/* date label */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
                      style={{ top: i % 2 === 0 ? -76 : 46 }}
                    >
                      <div className={`text-[10px] font-mono font-semibold ${NUM}`} style={{ color: FAINT }}>
                        {e.date}
                      </div>
                      <div className="text-[11px] mt-0.5 font-medium" style={{ color: MUTE }}>
                        {meta.label}
                      </div>
                    </div>

                    {/* node */}
                    <button
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="relative block w-3.5 h-3.5 rounded-full ring-4 ring-white shadow hover:scale-125 transition-transform"
                      style={{ background: meta.dot }}
                      aria-label={`${e.date}: ${e.title}`}
                    />

                    {/* hover tooltip */}
                    {isHov && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 z-20 w-[280px] rounded-xl text-white shadow-2xl p-4 animate-fade-in pointer-events-none"
                        style={{ top: i % 2 === 0 ? -148 : 60, background: NAVY }}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: "#7DA0FF" }}>
                          <Icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                          {e.region && (
                            <>
                              <span className="text-white/30">·</span>
                              <span className="text-white/70">{e.region}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm font-bold leading-tight mb-1 line-clamp-3">
                          {e.title}
                        </div>
                        <div className={`text-[11px] font-mono text-white/60 ${NUM}`}>{e.date}</div>
                        {e.task && (
                          <div className="text-[11px] mt-2 text-white/60">
                            Task{" "}
                            <span className="font-mono font-semibold" style={{ color: "#7DA0FF" }}>
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
