"use client"

import { useRef, useState } from "react"
import {
  Layers, Compass, Sparkles, Smartphone, AlertTriangle,
  Users, FileSignature,
} from "lucide-react"
import type { Task22Detail, T22Finding } from "@/lib/panoraima/types"

interface Props {
  detail: Task22Detail
}

const ICON: Record<string, typeof Layers> = {
  "layers":         Layers,
  "compass":        Compass,
  "sparkles":       Sparkles,
  "smartphone":     Smartphone,
  "alert-triangle": AlertTriangle,
  "users":          Users,
  "file-signature": FileSignature,
}

const ACCENT_GRADIENTS = [
  "from-sky-500 to-sky-700",
  "from-emerald-500 to-emerald-700",
  "from-violet-500 to-violet-700",
  "from-amber-500 to-amber-700",
  "from-rose-500 to-rose-700",
  "from-teal-500 to-teal-700",
  "from-gold-500 to-gold-700",
]

function FindingCard({ finding, index }: { finding: T22Finding; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const Icon = ICON[finding.icon] ?? Sparkles
  const accent = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length]

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = (e.clientX - rect.left) / rect.width - 0.5
    const dy = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -dy * 5, y: dx * 7 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative"
      style={{ perspective: "900px" }}
    >
      <div
        className="relative rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl p-6 transition-all duration-200 h-full"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />

        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Finding #{index + 1}
            </div>
            <h3 className="mt-0.5 text-base md:text-lg font-bold text-navy-900 leading-tight">
              {finding.title}
            </h3>
          </div>
        </div>

        <blockquote className="mt-4 relative pl-4 border-l-2 border-gold-300">
          <p className="text-[13.5px] text-gray-700 leading-relaxed italic">
            &ldquo;{finding.quote}&rdquo;
          </p>
        </blockquote>
      </div>
    </div>
  )
}

export default function T22Findings({ detail }: Props) {
  const findings = detail.focus_group.findings

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Distilled findings
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          What the 17 academics actually said
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Each card pulls a verbatim insight from the Interpretation section
          of the Focus Group Report. Hover for subtle 3D parallax.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {findings.map((f, i) => (
          <FindingCard key={f.id} finding={f} index={i} />
        ))}
      </div>
    </section>
  )
}
