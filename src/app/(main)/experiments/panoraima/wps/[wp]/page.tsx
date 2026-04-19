import type { Metadata } from "next"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import WPDetail from "@/components/panoraima/wps/WPDetail"
import type { WorkPackageDetail, WpHubMeta } from "@/lib/panoraima/types"

interface Props {
  params: Promise<{ wp: string }>
}

function loadDetail(wp: string): WorkPackageDetail | null {
  const file = path.join(process.cwd(), `src/lib/panoraima/${wp}_data.json`)
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, "utf-8")) as WorkPackageDetail
}

function loadHubEntry(wp: string) {
  const file = path.join(process.cwd(), "src/lib/panoraima/wps_meta.json")
  if (!existsSync(file)) return null
  const meta = JSON.parse(readFileSync(file, "utf-8")) as WpHubMeta
  return meta.wps.find((w) => w.wp.toLowerCase() === wp) || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { wp } = await params
  const entry = loadHubEntry(wp)
  if (!entry) return { title: `${wp.toUpperCase()} · PANORAIMA` }
  return {
    title: `${entry.wp} · ${entry.short} · PANORAIMA`,
    description: entry.description,
  }
}

export default async function Page({ params }: Props) {
  const { wp } = await params
  const detail = loadDetail(wp)
  const entry = loadHubEntry(wp)

  if (detail) return <WPDetail detail={detail} />

  // Fallback — polished "coming soon" state
  return (
    <div className="relative min-h-screen bg-white">
      <section className="relative overflow-hidden bg-navy-950 pt-24 md:pt-32 pb-16 md:pb-20">
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              `radial-gradient(circle at 20% 20%, ${entry?.color ?? "#8b5cf6"}40, transparent 45%), radial-gradient(circle at 80% 60%, rgba(201, 169, 110, 0.25), transparent 45%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/experiments/panoraima/wps"
            className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-navy-100/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All work packages
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/30 bg-gold-500/5 mb-5">
            {entry?.wp ?? wp.toUpperCase()} · Coming next
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.05] mb-4 max-w-3xl">
            {entry?.name ?? "Dashboard coming soon"}
          </h1>
          <p className="text-base md:text-lg text-navy-100/75 leading-relaxed max-w-2xl">
            {entry?.description ||
              "This work package's deep-dive dashboard is on its way. For now, the consortium view shows the high-level progress."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
        {entry && entry.stats.total_files > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 md:p-10">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-2">
              What&apos;s in the folder today
            </div>
            <div className="mt-4 grid grid-cols-3 gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-semibold">Files</div>
                <div className="mt-1 text-3xl font-bold text-navy-900 tabular-nums">
                  {entry.stats.total_files}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-semibold">Tasks</div>
                <div className="mt-1 text-3xl font-bold text-navy-900 tabular-nums">
                  {entry.task_count}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-semibold">Deliverables</div>
                <div className="mt-1 text-3xl font-bold text-navy-900 tabular-nums">
                  {entry.deliverable_count}
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-500 leading-relaxed">
              Run <code className="font-mono">refresh-panoraima.sh --wps={entry.wp}</code> on
              the pipeline host to generate the full deep-dive dashboard for this work package.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
