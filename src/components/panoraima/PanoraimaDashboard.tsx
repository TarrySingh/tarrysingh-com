"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Download, ExternalLink, Github, Layers } from "lucide-react"
import type { PartnerCode, TimelineEvent } from "@/lib/panoraima/types"
import HeroSection from "./HeroSection"
import ConsortiumMap from "./ConsortiumMap"
import EventTimeline from "./EventTimeline"
import SubmissionMatrix from "./SubmissionMatrix"
import WorkPackageLens from "./WorkPackageLens"
import EventDetailPanel from "./EventDetailPanel"
import PartnerDrawer from "./PartnerDrawer"
import { challengeCount, totalSubmissions } from "./helpers"
import { SURFACE, INK, SLATE, FAINT, COBALT, COBALT_DK } from "./consortiumTokens"

const SECTION_CARD =
  "animate-fade-up rounded-2xl border border-[#E3E7ED] bg-white p-5 md:p-7 shadow-[0_1px_2px_rgba(10,31,51,0.04)]"

interface Props {
  events: TimelineEvent[]
}

export default function PanoraimaDashboard({ events }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner]   = useState<PartnerCode | null>(null)
  const [openEvent, setOpenEvent]   = useState(false)
  const [openPartner, setOpenPartner] = useState(false)
  const [focusPartner, setFocusPartner] = useState<PartnerCode | null>(null)

  const selectedEvent = useMemo(
    () => events.find(e => e.id === selectedEventId) || null,
    [events, selectedEventId]
  )

  const kpi = useMemo(() => ({
    totalEvents: events.length,
    submissions: totalSubmissions(events),
    challenges: challengeCount(events),
  }), [events])

  const handleEventSelect = (id: string) => {
    setSelectedEventId(id)
    setOpenEvent(true)
  }

  const handleCellClick = (id: string, partner: PartnerCode) => {
    setSelectedEventId(id)
    setFocusPartner(partner)
    setOpenEvent(true)
  }

  const handlePartnerSelect = (code: PartnerCode) => {
    setSelectedPartner(code)
    setOpenPartner(true)
  }

  useEffect(() => {
    if (!openEvent && !openPartner) {
      document.body.style.overflow = ""
      return
    }
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [openEvent, openPartner])

  return (
    <div className="relative min-h-screen" style={{ background: SURFACE }}>
      <HeroSection
        totalEvents={kpi.totalEvents}
        totalSubmissions={kpi.submissions}
        totalChallenges={kpi.challenges}
      />

      {/* Toolbar overlaps the hero's lower edge — a crisp white command bar
          (McKinsey light-on-navy) with a cobalt primary action. */}
      <div className="relative z-20 -mt-20 max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-[#E3E7ED] shadow-[0_8px_30px_rgba(5,28,44,0.12)] px-4 md:px-5 py-3">
          <Link
            href="/experiments"
            className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors"
            style={{ color: SLATE }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to experiments
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="https://cordis.europa.eu/project/id/101201268"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[#E3E7ED] hover:border-[#C9D4FF] hover:bg-[#EEF2FF] transition-all"
              style={{ color: INK }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CORDIS record</span>
              <span className="sm:hidden">CORDIS</span>
            </a>
            <a
              href="/experiments/panoraima#data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[#E3E7ED] hover:border-[#C9D4FF] hover:bg-[#EEF2FF] transition-all"
              style={{ color: INK }}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download JSON</span>
              <span className="sm:hidden">JSON</span>
            </a>
            <Link
              href="/experiments/panoraima/wps"
              prefetch={false}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold text-white transition-colors"
              style={{ background: COBALT }}
              onMouseEnter={(e) => (e.currentTarget.style.background = COBALT_DK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = COBALT)}
            >
              <Layers className="w-3.5 h-3.5" />
              Work packages
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-24 pt-10">

        <div className="space-y-8 md:space-y-10">
          {/* Timeline */}
          <section className={SECTION_CARD}>
            <EventTimeline
              events={events}
              selectedId={selectedEventId}
              onSelect={handleEventSelect}
            />
          </section>

          {/* Consortium Map */}
          <section className={SECTION_CARD}>
            <ConsortiumMap
              events={events}
              onPartnerSelect={handlePartnerSelect}
              selectedPartner={selectedPartner}
            />
          </section>

          {/* Submission Matrix */}
          <section className={SECTION_CARD}>
            <SubmissionMatrix
              events={events}
              onCellClick={handleCellClick}
              onEventClick={handleEventSelect}
              onPartnerClick={handlePartnerSelect}
              selectedEventId={selectedEventId}
              selectedPartner={selectedPartner}
            />
          </section>

          {/* WP Lens */}
          <section className={SECTION_CARD}>
            <WorkPackageLens events={events} onEventClick={handleEventSelect} />
          </section>

          {/* Footer credit */}
          <footer className="pt-8 mt-2 border-t border-[#E3E7ED]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: COBALT }}>
                  About this dashboard
                </div>
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: SLATE }}>
                  Auto-generated from the consortium&apos;s monthly progress reports. The pipeline scans
                  DOCX files, extracts activities and challenges, and rebuilds the visualization.
                  A weekly cron job keeps it current.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]" style={{ color: FAINT }}>
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Github className="w-3.5 h-3.5" />
                  tarrysingh-com/experiments/panoraima
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <EventDetailPanel
        event={selectedEvent}
        open={openEvent}
        onClose={() => { setOpenEvent(false); setFocusPartner(null) }}
        focusedPartner={focusPartner}
      />
      <PartnerDrawer
        partner={selectedPartner}
        events={events}
        open={openPartner}
        onClose={() => setOpenPartner(false)}
        onEventClick={(id) => {
          setSelectedEventId(id)
          setOpenPartner(false)
          setOpenEvent(true)
        }}
      />
    </div>
  )
}
