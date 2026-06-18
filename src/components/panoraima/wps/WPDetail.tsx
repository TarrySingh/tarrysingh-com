"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import type { WorkPackageDetail, WpDeliverable, WpQuote } from "@/lib/panoraima/types"
import { SURFACE, INK, SLATE, COBALT, COBALT_DK, LINE } from "../consortiumTokens"
import WPHero from "./WPHero"
import KeyFindings from "./KeyFindings"
import ThemeCloud from "./ThemeCloud"
import CountryComparison from "./CountryComparison"
import TaskBreakdown from "./TaskBreakdown"
import DeliverableTimeline from "./DeliverableTimeline"
import FileInventory from "./FileInventory"
import DocumentExplorer from "./DocumentExplorer"
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

  // Collect all pull-quotes from regions for the KeyFindings component
  const regionQuotes: WpQuote[] = useMemo(() => {
    const out: WpQuote[] = []
    for (const r of detail.regions || []) {
      for (const q of r.quotes) {
        out.push({ ...q, task: q.task ?? undefined })
      }
    }
    return out
  }, [detail.regions])

  const hasFindings = (detail.findings?.length ?? 0) + regionQuotes.length > 0
  const hasThemes = (detail.themes?.length ?? 0) > 0

  return (
    <div className="relative min-h-screen" style={{ background: SURFACE }}>
      <WPHero detail={detail} />

      <div className="relative z-10 -mt-16 max-w-7xl mx-auto px-5 md:px-8 pb-24">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
          <Link
            href="/experiments/panoraima/wps"
            className="group inline-flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-[0.15em] transition-colors"
            style={{ color: SLATE }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COBALT_DK)}
            onMouseLeave={(e) => (e.currentTarget.style.color = SLATE)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All work packages
          </Link>
          <Link
            href="/experiments/panoraima"
            className="group inline-flex items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.15em] transition-colors"
            style={{ color: SLATE }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COBALT_DK)}
            onMouseLeave={(e) => (e.currentTarget.style.color = SLATE)}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Consortium view
          </Link>
        </div>

        <div className="space-y-16 md:space-y-20">
          {/* 1 — Findings: the signature moment of the page */}
          {hasFindings && (
            <section className="animate-fade-up">
              <KeyFindings
                findings={detail.findings || []}
                regionQuotes={regionQuotes}
                deliverableName={detail.primary_deliverable?.name}
                color={detail.color}
              />
            </section>
          )}

          {/* 2 — Task breakdown */}
          <section className="animate-fade-up">
            <TaskBreakdown
              tasks={detail.tasks}
              onDeliverableClick={openDeliverable}
              deepDiveTaskIds={detail.wp === "WP2" ? ["T2.1", "T2.2", "T2.3"] : []}
              wpSlug={detail.wp.toLowerCase()}
            />
          </section>

          {/* 3 — Corpus-wide themes + stakeholder typology */}
          {hasThemes && (
            <section className="animate-fade-up">
              <ThemeCloud
                themes={detail.themes}
                stakeholders={detail.stakeholders || []}
                color={detail.color}
              />
            </section>
          )}

          {/* 4 — Country comparison (WP2-style working groups) */}
          {detail.regions && detail.regions.length > 0 && (
            <section className="animate-fade-up">
              <CountryComparison regions={detail.regions} color={detail.color} />
            </section>
          )}

          {/* 5 — Timeline */}
          {detail.timeline.length > 0 && (
            <section className="animate-fade-up">
              <DeliverableTimeline entries={detail.timeline} color={detail.color} />
            </section>
          )}

          {/* 6 — Geographic coverage map (WP2-only currently) */}
          {hasRegionData && (
            <section className="animate-fade-up">
              <GeographicCoverage detail={detail} />
            </section>
          )}

          {/* 7 — File inventory donut */}
          <section className="animate-fade-up">
            <FileInventory stats={detail.stats} color={detail.color} />
          </section>

          {/* 8 — Document explorer (search + filter + drawer) */}
          {detail.catalogue && detail.catalogue.length > 0 && (
            <section className="animate-fade-up">
              <DocumentExplorer catalogue={detail.catalogue} color={detail.color} />
            </section>
          )}

          <footer className="pt-10 border-t" style={{ borderColor: LINE }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: COBALT }}>
                  About this page
                </div>
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: SLATE }}>
                  Auto-generated from the SharePoint <code className="font-mono" style={{ color: INK }}>{detail.wp}</code> folder
                  on {new Date(detail.generated_at).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}.
                  {detail.stats.total_words
                    ? <> Analysed {detail.stats.total_words.toLocaleString()} words across{" "}
                        {detail.stats.total_files} files.</>
                    : null}
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
