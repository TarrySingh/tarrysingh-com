"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { Users, Presentation, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import type { TimelineEvent } from "@/lib/panoraima/types"
import { EVENT_STYLES, PARTNERS } from "@/lib/panoraima/types"
import { formatDate, submissionRate } from "./helpers"
import SectionHeader from "./SectionHeader"
import {
  NAVY, INK, SLATE, MUTE, FAINT, LINE, COBALT, COBALT_DK,
  OK, WARN, BAD, wpColor,
} from "./consortiumTokens"

interface Props {
  events: TimelineEvent[]
  selectedId: string | null
  onSelect: (id: string) => void
}

// Event-type → accent colour, mapped onto the new cobalt/navy/teal system.
// (Replaces the old per-type Tailwind bg/ring classes from EVENT_STYLES.)
function eventColor(type: string): string {
  switch (type) {
    case "kickoff":
      return COBALT
    case "pmc":
      return wpColor("WP2")    // deep navy-blue
    case "worksprint":
      return wpColor("WP5")    // teal-blue
    case "review":
      return wpColor("WP6")    // teal
    case "cancelled":
      return BAD
    default:
      return MUTE
  }
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

  // Scroll controls live by the section title via SectionHeader's `right` slot.
  const scrollControls = (
    <div className="hidden md:flex items-center gap-2">
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy(-400)}
        disabled={!canScrollL}
        className="w-9 h-9 rounded-full bg-white border transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        style={{ borderColor: LINE, color: MUTE }}
        onMouseEnter={(ev) => { if (!ev.currentTarget.disabled) ev.currentTarget.style.color = COBALT }}
        onMouseLeave={(ev) => { ev.currentTarget.style.color = MUTE }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy(400)}
        disabled={!canScrollR}
        className="w-9 h-9 rounded-full bg-white border transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        style={{ borderColor: LINE, color: MUTE }}
        onMouseEnter={(ev) => { if (!ev.currentTarget.disabled) ev.currentTarget.style.color = COBALT }}
        onMouseLeave={(ev) => { ev.currentTarget.style.color = MUTE }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="relative">
      <SectionHeader
        index="01"
        kicker="Project timeline"
        title="Eighteen months, meeting by meeting"
        subtitle="Every PMC, worksprint and review across the project calendar — select a node for its full report."
        right={scrollControls}
      />

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
            <div
              className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2"
              style={{ background: `linear-gradient(to right, ${LINE}, ${FAINT}, ${LINE})` }}
            />

            {/* Timeline nodes */}
            <div className="relative flex items-center h-32">
              {chronological.map((e, i) => {
                const style = EVENT_STYLES[e.type]
                const accent = eventColor(e.type)
                const isSelected = selectedId === e.id
                const isHovered = hoveredId === e.id
                const rate = submissionRate(e)
                const x = `${(i / Math.max(1, chronological.length - 1)) * 100}%`
                const isPast = e.date && e.date < today
                const isUpcoming = e.date && e.date > today
                const nodeColor = isSelected ? COBALT : accent

                return (
                  <div
                    key={e.id}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: x }}
                  >
                    {/* Vertical stem connecting node to labels */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-[1.5px]"
                      style={{
                        top: i % 2 === 0 ? -46 : 16,
                        height: 30,
                        background: isSelected ? COBALT : LINE,
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
                      <div
                        className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] tabular-nums"
                        style={{ color: isSelected ? INK : FAINT }}
                      >
                        {e.label}
                      </div>
                      <div
                        className="text-[11px] mt-0.5 font-medium max-w-[90px] leading-tight"
                        style={{ color: isSelected ? INK : SLATE }}
                      >
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
                          className="absolute inset-0 rounded-full opacity-30"
                          style={{ background: COBALT, animation: "pulse-ring 1.8s ease-out infinite" }}
                        />
                      )}
                      {/* Outer ring on hover */}
                      <span
                        aria-hidden
                        className={`absolute -inset-2 rounded-full transition-opacity ${
                          isHovered || isSelected ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ boxShadow: `0 0 0 2px ${nodeColor}` }}
                      />
                      {/* The actual node */}
                      <span
                        className={`relative block rounded-full transition-all duration-300 ${
                          isSelected ? "w-5 h-5" : "w-3.5 h-3.5 group-hover:w-5 group-hover:h-5"
                        } ${isUpcoming ? "opacity-40" : "opacity-100"}`}
                        style={{ background: nodeColor, boxShadow: "0 0 0 4px #FFFFFF" }}
                      />
                      {/* Submission rate mini-bar */}
                      {e.has_progress_reports && (
                        <span
                          className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-1 rounded-full overflow-hidden"
                          style={{ width: 28, background: LINE }}
                          aria-hidden
                        >
                          <span
                            className="block h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${rate * 100}%`,
                              background: rate >= 0.9 ? OK : rate >= 0.7 ? WARN : BAD,
                            }}
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
                        className="absolute left-1/2 -translate-x-1/2 z-20 w-[260px] rounded-xl text-white p-4 animate-fade-in pointer-events-none"
                        style={{ top: i % 2 === 0 ? -148 : 60, background: NAVY, boxShadow: "0 16px 40px -12px rgba(5,28,44,0.55)" }}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: "#7DA0FF" }}>
                          <span>{style.label}</span>
                          {isPast && <span className="text-white/45">· past</span>}
                          {isUpcoming && <span className="text-white/45">· upcoming</span>}
                        </div>
                        <div className="text-sm font-bold mb-1">{e.title}</div>
                        <div className="text-[11px] font-mono tabular-nums text-white/65 mb-3">
                          {formatDate(e.date) || "Date TBD"}
                        </div>
                        {e.has_progress_reports && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-white/60 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Submissions
                              </span>
                              <span className="font-bold tabular-nums">
                                {Object.values(e.partners).filter(p => p.submitted).length}/{PARTNERS.length}
                              </span>
                            </div>
                            {Object.keys(e.wp_reports || {}).length > 0 && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-white/60 flex items-center gap-1">
                                  <Presentation className="w-3 h-3" />
                                  WP reports
                                </span>
                                <span className="font-bold tabular-nums">{Object.keys(e.wp_reports).join(", ")}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {e.type === "cancelled" && (
                          <div className="flex items-center gap-1 text-[11px]" style={{ color: "#F0A8A0" }}>
                            <AlertTriangle className="w-3 h-3" /> Meeting was cancelled
                          </div>
                        )}
                        {/* arrow */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                          style={{ [i % 2 === 0 ? "bottom" : "top"]: -6, background: NAVY }}
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
