"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { Calendar, Users, Presentation, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import type { TimelineEvent } from "@/lib/panoraima/types"
import { EVENT_STYLES, PARTNERS } from "@/lib/panoraima/types"
import { formatDate, submissionRate } from "./helpers"

interface Props {
  events: TimelineEvent[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function EventTimeline({ events, selectedId, onSelect }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [canScrollL, setCanScrollL] = useState(false)
  const [canScrollR, setCanScrollR] = useState(true)

  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  const chronological = useMemo(() => {
    return [...events].sort((a, b) => (a.date || a.id).localeCompare(b.date || b.id))
  }, [events])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const handle = () => {
      setCanScrollL(el.scrollLeft > 8)
      setCanScrollR(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
    }
    handle()
    el.addEventListener("scroll", handle, { passive: true })
    const ro = new ResizeObserver(handle)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", handle)
      ro.disconnect()
    }
  }, [chronological.length])

  const scrollBy = (dx: number) => {
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
            Project timeline
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
            18 months of coordination
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            Every PMC meeting, worksprint, and milestone — click a node to dive in.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            aria-label="Scroll left"
            onClick={() => scrollBy(-400)}
            disabled={!canScrollL}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-navy-600 hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scrollBy(400)}
            disabled={!canScrollR}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-navy-600 hover:bg-navy-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fade edges */}
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scroller */}
        <div
          ref={scrollerRef}
          className="relative overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            // Vertical padding must clear the tooltip in both directions:
            //   tooltip extends ~148px above or ~60+140px below each node.
            // Browsers force overflow-y:auto on the scroller as soon as
            // overflow-x is set, so anything that overflows this padded box
            // gets clipped — hence the generous pt/pb.
            className="relative min-w-max pt-36 pb-44"
            style={{ width: `${Math.max(chronological.length * 130, 800)}px` }}
          >
            {/* Central rail */}
            <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gradient-to-r from-gray-200 via-navy-200 to-gray-200 -translate-y-1/2" />

            {/* Timeline nodes */}
            <div className="relative flex items-center h-32">
              {chronological.map((e, i) => {
                const style = EVENT_STYLES[e.type]
                const isSelected = selectedId === e.id
                const isHovered = hoveredId === e.id
                const rate = submissionRate(e)
                const x = `${(i / Math.max(1, chronological.length - 1)) * 100}%`
                const isPast = e.date && e.date < today
                const isUpcoming = e.date && e.date > today

                return (
                  <div
                    key={e.id}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: x }}
                  >
                    {/* Vertical stem connecting node to labels */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 w-[1.5px] ${isSelected ? "bg-navy-400" : "bg-gray-200"}`}
                      style={{
                        top: i % 2 === 0 ? -46 : 16,
                        height: 30,
                        transition: "background 0.3s",
                      }}
                    />

                    {/* Top/Bottom label */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center transition-all duration-300 ${
                        isHovered || isSelected ? "opacity-100 -translate-y-0" : "opacity-70"
                      }`}
                      style={{ top: i % 2 === 0 ? -76 : 46 }}
                    >
                      <div className={`text-[10px] font-mono font-semibold ${isSelected ? "text-navy-900" : "text-gray-500"}`}>
                        {e.label}
                      </div>
                      <div className={`text-[11px] mt-0.5 font-medium max-w-[90px] leading-tight ${isSelected ? "text-navy-900" : "text-gray-600"}`}>
                        {e.type === "worksprint" && e.title.replace("Worksprint — ", "")}
                        {e.type === "pmc" && "PMC"}
                        {e.type === "kickoff" && "Kick-off"}
                        {e.type === "cancelled" && "—"}
                        {e.type === "review" && "Review"}
                      </div>
                    </div>

                    {/* Node */}
                    <button
                      aria-label={`${e.title} on ${e.label}`}
                      onMouseEnter={() => setHoveredId(e.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        setHoveredId(null)
                        onSelect(e.id)
                      }}
                      className="relative group outline-none"
                    >
                      {/* Pulse ring when selected */}
                      {isSelected && (
                        <span
                          aria-hidden
                          className={`absolute inset-0 rounded-full ${style.bg} opacity-30`}
                          style={{ animation: "pulse-ring 1.8s ease-out infinite" }}
                        />
                      )}
                      {/* Outer ring on hover */}
                      <span
                        aria-hidden
                        className={`absolute -inset-2 rounded-full ring-2 ${style.ring} transition-opacity ${
                          isHovered || isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {/* The actual node */}
                      <span
                        className={`relative block rounded-full ${style.bg} ring-4 ring-white transition-all duration-300 ${
                          isSelected ? "w-5 h-5" : "w-3.5 h-3.5 group-hover:w-5 group-hover:h-5"
                        } ${isUpcoming ? "opacity-40" : "opacity-100"}`}
                      />
                      {/* Submission rate mini-bar */}
                      {e.has_progress_reports && (
                        <span
                          className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-1 bg-gray-200 rounded-full overflow-hidden"
                          style={{ width: 28 }}
                          aria-hidden
                        >
                          <span
                            className={`block h-full rounded-full ${
                              rate >= 0.9 ? "bg-emerald-500" : rate >= 0.7 ? "bg-gold-500" : "bg-rose-500"
                            } transition-all duration-700`}
                            style={{ width: `${rate * 100}%` }}
                          />
                        </span>
                      )}
                    </button>

                    {/* Hover tooltip — shown only while the mouse is over this node.
                         The selected state is conveyed by the pulse ring + the
                         slide-in detail drawer, so we intentionally do not keep
                         the tooltip open on selection. Keeping it would overlap
                         neighbour buttons (tooltip is 260px wide) and leak hover
                         events through pointer-events-none, making adjacent
                         tooltips spuriously pop open. */}
                    {isHovered && (
                      <div
                        // Alternate above/below the rail by chronological index so
                        // successive tooltips never overlap their neighbours.
                        className="absolute left-1/2 -translate-x-1/2 z-20 w-[260px] rounded-xl bg-navy-900 text-white shadow-2xl p-4 animate-fade-in pointer-events-none"
                        style={{ top: i % 2 === 0 ? -148 : 60 }}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gold-300 mb-1">
                          <span>{style.label}</span>
                          {isPast && <span className="text-navy-100/50">· past</span>}
                          {isUpcoming && <span className="text-navy-100/50">· upcoming</span>}
                        </div>
                        <div className="text-sm font-bold mb-1">{e.title}</div>
                        <div className="text-[11px] font-mono text-navy-100/70 mb-3">
                          {formatDate(e.date || e.id)}
                        </div>
                        {e.has_progress_reports && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-navy-100/60 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Submissions
                              </span>
                              <span className="font-bold tabular-nums">
                                {Object.values(e.partners).filter(p => p.submitted).length}/{PARTNERS.length}
                              </span>
                            </div>
                            {Object.keys(e.wp_reports || {}).length > 0 && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-navy-100/60 flex items-center gap-1">
                                  <Presentation className="w-3 h-3" />
                                  WP reports
                                </span>
                                <span className="font-bold">{Object.keys(e.wp_reports).join(", ")}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {e.type === "cancelled" && (
                          <div className="flex items-center gap-1 text-[11px] text-rose-300">
                            <AlertTriangle className="w-3 h-3" /> Meeting was cancelled
                          </div>
                        )}
                        {/* arrow */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-navy-900 rotate-45"
                          style={{ [i % 2 === 0 ? "bottom" : "top"]: -6 }}
                        />
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
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
