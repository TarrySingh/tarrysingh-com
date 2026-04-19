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
    <div className="relative min-h-screen bg-white">
      <HeroSection
        totalEvents={kpi.totalEvents}
        totalSubmissions={kpi.submissions}
        totalChallenges={kpi.challenges}
      />

      {/* Toolbar sits directly on the hero's lower edge; dark-glass pill
          style keeps contrast whatever the mesh gradient is doing behind it. */}
      <div className="relative z-20 -mt-24 max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-950/60 backdrop-blur-md border border-white/10 shadow-xl px-4 md:px-5 py-3">
          <Link
            href="/experiments"
            className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to experiments
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="https://cordis.europa.eu/project/id/101201268"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white/80 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CORDIS record</span>
              <span className="sm:hidden">CORDIS</span>
            </a>
            <a
              href="/experiments/panoraima#data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white/80 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download JSON</span>
              <span className="sm:hidden">JSON</span>
            </a>
            <Link
              href="/experiments/panoraima/wps"
              prefetch={false}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-lg shadow-gold-500/30 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              Work packages
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-24 pt-10">

        <div className="space-y-16 md:space-y-20">
          {/* Timeline */}
          <section className="animate-fade-up">
            <EventTimeline
              events={events}
              selectedId={selectedEventId}
              onSelect={handleEventSelect}
            />
          </section>

          {/* Consortium Map */}
          <section className="animate-fade-up">
            <ConsortiumMap
              events={events}
              onPartnerSelect={handlePartnerSelect}
              selectedPartner={selectedPartner}
            />
          </section>

          {/* Submission Matrix */}
          <section className="animate-fade-up">
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
          <section className="animate-fade-up">
            <WorkPackageLens events={events} onEventClick={handleEventSelect} />
          </section>

          {/* Footer credit */}
          <footer className="pt-10 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-1">
                  About this dashboard
                </div>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Auto-generated from the consortium&apos;s monthly progress reports. The pipeline scans
                  DOCX files, extracts activities and challenges, and rebuilds the visualization.
                  A weekly cron job keeps it current.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1.5">
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
