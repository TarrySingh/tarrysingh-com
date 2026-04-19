import type { Metadata } from "next"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import T21Dashboard from "@/components/panoraima/wps/wp2/t21/T21Dashboard"
import type { Task21Detail } from "@/lib/panoraima/types"

interface Props {
  params: Promise<{ wp: string; task: string }>
}

function loadT21(): Task21Detail | null {
  const fp = path.join(process.cwd(), "src/lib/panoraima/task_2_1_data.json")
  if (!existsSync(fp)) return null
  return JSON.parse(readFileSync(fp, "utf-8")) as Task21Detail
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { wp, task } = await params
  if (wp === "wp2" && task === "t21") {
    return {
      title: "Task 2.1 · Market & Needs Analysis · PANORAIMA",
      description:
        "Deep-dive into WP2 Task 2.1 — 100+ stakeholders across 10 European countries, four working groups, Deliverable 2.1's six headline findings.",
    }
  }
  return { title: `${wp.toUpperCase()} ${task.toUpperCase()} · PANORAIMA` }
}

export default async function Page({ params }: Props) {
  const { wp, task } = await params

  if (wp === "wp2" && task === "t21") {
    const detail = loadT21()
    if (detail) return <T21Dashboard detail={detail} />
  }

  return (
    <div className="relative min-h-screen bg-white">
      <section className="relative overflow-hidden bg-navy-950 pt-24 md:pt-32 pb-16 md:pb-20">
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.4), transparent 45%), radial-gradient(circle at 80% 60%, rgba(201, 169, 110, 0.25), transparent 45%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href={`/experiments/panoraima/wps/${wp}`}
            className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-navy-100/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {wp.toUpperCase()}
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/30 bg-gold-500/5 mb-5">
            {task.toUpperCase()} · Coming soon
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.05] mb-4 max-w-3xl">
            This task deep-dive is on the way
          </h1>
          <p className="text-base md:text-lg text-navy-100/75 leading-relaxed max-w-2xl">
            We&apos;re building per-task dashboards one by one. For now, only WP2
            Task 2.1 has a dedicated page. The rest can be browsed via the
            parent work-package view.
          </p>
        </div>
      </section>
    </div>
  )
}
