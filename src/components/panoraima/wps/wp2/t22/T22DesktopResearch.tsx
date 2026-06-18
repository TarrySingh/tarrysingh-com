"use client"

import { BookOpen, FileText, ExternalLink, Grid3x3 } from "lucide-react"
import type { Task22Detail, T22PrototypeMatrix } from "@/lib/panoraima/types"
import {
  INK, SLATE, MUTE, FAINT, LINE, SURFACE,
  COBALT, COBALT_SOFT, COBALT_LINE,
  NAVY_2, KICKER, NUM,
} from "../../../consortiumTokens"

interface Props {
  detail: Task22Detail
}

export default function T22DesktopResearch({ detail }: Props) {
  const { anchor_papers, prototype_matrices } = detail.desktop_research

  return (
    <section>
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${KICKER} text-[10px]`}
          style={{ color: COBALT, borderWidth: 1, borderColor: COBALT_LINE, backgroundColor: COBALT_SOFT }}
        >
          Desktop research foundation
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          4 anchor papers · 2 institutional prototype matrices
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
          The literature informing UNIWA&apos;s protocol, plus the two sparse
          matrices where each partner is expected to declare its own pedagogic
          and organisational posture.
        </p>
      </div>

      {/* Anchor papers */}
      <div className="mb-10">
        <h3 className={`${KICKER} mb-3`} style={{ color: FAINT }}>
          Anchor papers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anchor_papers.map((p) => (
            <div
              key={p.file}
              className="group rounded-2xl border bg-white p-5 transition-all"
              style={{ borderColor: LINE }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ backgroundColor: COBALT_SOFT, color: COBALT }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold leading-tight" style={{ color: INK }}>{p.title}</h4>
                  <div className="mt-0.5 text-[11px] leading-snug" style={{ color: MUTE }}>
                    {p.authors && <span className="font-semibold">{p.authors}</span>}
                    {p.year ? <span> · {p.year}</span> : null}
                    {p.venue ? <span> · <span className="italic">{p.venue}</span></span> : null}
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: SLATE }}>
                    {p.tagline}
                  </p>
                  <div className={`mt-2 flex items-center gap-2 text-[10px] font-mono ${NUM}`} style={{ color: FAINT }}>
                    <FileText className="w-3 h-3" />
                    {p.kb} KB · PDF
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prototype matrices */}
      <div className="space-y-6">
        {prototype_matrices.pedagogics && (
          <MatrixCard matrix={prototype_matrices.pedagogics} hue="sky" />
        )}
        {prototype_matrices.organisational && (
          <MatrixCard matrix={prototype_matrices.organisational} hue="gold" />
        )}
      </div>
    </section>
  )
}

function MatrixCard({
  matrix, hue,
}: {
  matrix: T22PrototypeMatrix
  hue: "sky" | "gold"
}) {
  // Two restrained categorical accents (NOT a rainbow): cobalt primary, navy secondary.
  const hueCls = {
    sky:  { border: COBALT_LINE, bg: COBALT_SOFT, pillBg: COBALT_SOFT, pillFg: COBALT, bar: COBALT },
    gold: { border: LINE,        bg: SURFACE,     pillBg: SURFACE,     pillFg: NAVY_2, bar: NAVY_2 },
  }[hue]

  return (
    <div className="rounded-3xl border p-5 md:p-6" style={{ borderColor: hueCls.border, backgroundColor: hueCls.bg }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-3.5 h-3.5" style={{ color: MUTE }} />
            <h3 className="text-base font-bold" style={{ color: INK }}>{matrix.label}</h3>
          </div>
          <div className={`mt-1 text-[11px] font-mono ${NUM}`} style={{ color: MUTE }}>
            {matrix.rows.length} institutions × {matrix.columns.length} dimensions
          </div>
        </div>
        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-[0.15em] ${NUM}`}
            style={{ backgroundColor: hueCls.pillBg, color: hueCls.pillFg, borderWidth: 1, borderColor: hueCls.border }}
          >
            {matrix.coverage_pct}% filled
          </div>
          <div className="mt-1 w-24 h-1 rounded-full overflow-hidden" style={{ backgroundColor: LINE }}>
            <div
              className="h-full"
              style={{ width: `${Math.max(matrix.coverage_pct, 2)}%`, backgroundColor: hueCls.bar }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: LINE }}>
        <table className="w-full text-left text-[11.5px] border-collapse">
          <thead>
            <tr style={{ backgroundColor: SURFACE, borderBottomWidth: 1, borderColor: LINE }}>
              <th className="px-3 py-2 font-semibold sticky left-0" style={{ color: SLATE, backgroundColor: SURFACE }}>Inst.</th>
              {matrix.columns.map((c) => (
                <th key={c} className="px-3 py-2 font-semibold whitespace-nowrap" style={{ color: SLATE }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((r) => (
              <tr key={r.abbr} className="last:border-0" style={{ borderBottomWidth: 1, borderColor: LINE }}>
                <td className="px-3 py-2 font-mono font-bold sticky left-0 bg-white" style={{ color: INK }}>
                  {r.abbr}
                </td>
                {r.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2 ${cell ? "font-semibold" : "italic"}`}
                    style={{ color: cell ? INK : FAINT }}
                    title={matrix.columns[i]}
                  >
                    {cell || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: MUTE }}>
        <ExternalLink className="w-3 h-3" />
        <span className="font-mono break-all">{matrix.file}</span>
      </div>
    </div>
  )
}
