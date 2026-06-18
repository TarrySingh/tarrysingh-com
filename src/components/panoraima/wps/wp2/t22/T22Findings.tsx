"use client"

import { useRef, useState } from "react"
import {
  Layers, Compass, Sparkles, Smartphone, AlertTriangle,
  Users, FileSignature,
} from "lucide-react"
import type { Task22Detail, T22Finding } from "@/lib/panoraima/types"
import {
  INK, SLATE, MUTE, FAINT, LINE, SURFACE,
  COBALT, COBALT_SOFT, COBALT_LINE, KICKER, NUM,
} from "../../../consortiumTokens"

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

function FindingCard({ finding, index }: { finding: T22Finding; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const Icon = ICON[finding.icon] ?? Sparkles

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
        className="relative rounded-xl overflow-hidden bg-white border p-6 transition-colors duration-200 h-full hover:border-[#C9D4FF]"
        style={{
          borderColor: LINE,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: COBALT }} />

        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
            style={{ backgroundColor: COBALT_SOFT, borderColor: COBALT_LINE, color: COBALT }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className={`${KICKER} ${NUM}`} style={{ color: FAINT }}>
              Finding #{index + 1}
            </div>
            <h3 className="mt-0.5 text-base md:text-lg font-bold leading-tight" style={{ color: INK }}>
              {finding.title}
            </h3>
          </div>
        </div>

        <blockquote className="mt-4 relative pl-4 border-l-2" style={{ borderColor: COBALT_LINE }}>
          <p className="text-[13.5px] leading-relaxed italic" style={{ color: SLATE }}>
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
    <section style={{ backgroundColor: SURFACE }} className="rounded-xl p-1">
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${KICKER}`}
          style={{ color: COBALT, borderColor: COBALT_LINE, backgroundColor: COBALT_SOFT }}
        >
          Distilled findings
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          What the 17 academics actually said
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: MUTE }}>
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
