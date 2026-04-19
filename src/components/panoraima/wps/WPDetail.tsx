"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import type { WorkPackageDetail, WpDeliverable } from "@/lib/panoraima/types"
import WPHero from "./WPHero"
import TaskBreakdown from "./TaskBreakdown"
import DeliverableTimeline from "./DeliverableTimeline"
import FileInventory from "./FileInventory"
import DocumentDrawer from "./DocumentDrawer"
import GeographicCoverage from "./wp2/GeographicCoverage"

interface Props {
  detail: WorkPackageDetail
}

export default function WPDetail({ detail }: Props) {
  const [activeDeliverable, setActiveDeliverable] = useState<WpDeliverable | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openDeliverable = (d: WpDeliverable) => {
    setActiveDeliverable(d)
    setDrawerOpen(true)
  }

  const hasRegionData =
    detail.wp === "WP2" && Object.keys(detail.stats?.by_region ?? {}).length > 0

  return (
    <div className="relative min-h-screen bg-white">
      <WPHero detail={detail} />

      <div className="relative z-10 -mt-16 max-w-7xl mx-auto px-5 md:px-8 pb-24">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
          <Link
            href="/experiments/panoraima/wps"
            className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-navy-500 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All work packages
          </Link>
          <Link
            href="/experiments/panoraima"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-navy-500 hover:text-navy-900 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Consortium view
          </Link>
        </div>

        <div className="space-y-16 md:space-y-20">
          <section className="animate-fade-up">
            <TaskBreakdown tasks={detail.tasks} onDeliverableClick={openDeliverable} />
          </section>

          {detail.timeline.length > 0 && (
            <section className="animate-fade-up">
              <DeliverableTimeline entries={detail.timeline} color={detail.color} />
            </section>
          )}

          {hasRegionData && (
            <section className="animate-fade-up">
              <GeographicCoverage detail={detail} />
            </section>
          )}

          <section className="animate-fade-up">
            <FileInventory stats={detail.stats} color={detail.color} />
          </section>

          <footer className="pt-10 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-1">
                  About this page
                </div>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  Auto-generated from the SharePoint <code className="font-mono text-gray-700">{detail.wp}</code> folder
                  on {new Date(detail.generated_at).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}.
                  Tasks, deliverable versions and dated artefacts are inferred from filename patterns.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <DocumentDrawer
        deliverable={activeDeliverable}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        wpColor={detail.color}
      />
    </div>
  )
}
