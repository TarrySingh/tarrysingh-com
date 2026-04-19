"use client"

import { BookOpen, FileText, ExternalLink, Grid3x3 } from "lucide-react"
import type { Task22Detail, T22PrototypeMatrix } from "@/lib/panoraima/types"

interface Props {
  detail: Task22Detail
}

export default function T22DesktopResearch({ detail }: Props) {
  const { anchor_papers, prototype_matrices } = detail.desktop_research

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Desktop research foundation
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          4 anchor papers · 2 institutional prototype matrices
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          The literature informing UNIWA&apos;s protocol, plus the two sparse
          matrices where each partner is expected to declare its own pedagogic
          and organisational posture.
        </p>
      </div>

      {/* Anchor papers */}
      <div className="mb-10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400 mb-3">
          Anchor papers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anchor_papers.map((p) => (
            <div
              key={p.file}
              className="group rounded-2xl border border-gray-100 bg-white p-5 hover:border-navy-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center text-navy-700 flex-shrink-0 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-navy-900 leading-tight">{p.title}</h4>
                  <div className="mt-0.5 text-[11px] text-gray-500 leading-snug">
                    {p.authors && <span className="font-semibold">{p.authors}</span>}
                    {p.year ? <span> · {p.year}</span> : null}
                    {p.venue ? <span> · <span className="italic">{p.venue}</span></span> : null}
                  </div>
                  <p className="mt-2 text-[12.5px] text-gray-600 leading-relaxed">
                    {p.tagline}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-gray-400">
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
  const hueCls = {
    sky:  { border: "border-sky-100", bg: "bg-sky-50/30",  pill: "bg-sky-100 text-sky-800", bar: "bg-sky-500"  },
    gold: { border: "border-gold-100", bg: "bg-gold-50/30", pill: "bg-gold-100 text-gold-800", bar: "bg-gold-500" },
  }[hue]

  return (
    <div className={`rounded-3xl border ${hueCls.border} ${hueCls.bg} p-5 md:p-6`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-3.5 h-3.5 text-gray-500" />
            <h3 className="text-base font-bold text-navy-900">{matrix.label}</h3>
          </div>
          <div className="mt-1 text-[11px] font-mono text-gray-500">
            {matrix.rows.length} institutions × {matrix.columns.length} dimensions
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${hueCls.pill}`}>
            {matrix.coverage_pct}% filled
          </div>
          <div className="mt-1 w-24 h-1 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full ${hueCls.bar}`}
              style={{ width: `${Math.max(matrix.coverage_pct, 2)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-left text-[11.5px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 font-semibold text-navy-700 sticky left-0 bg-gray-50">Inst.</th>
              {matrix.columns.map((c) => (
                <th key={c} className="px-3 py-2 font-semibold text-navy-700 whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((r) => (
              <tr key={r.abbr} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2 font-mono font-bold text-navy-900 sticky left-0 bg-white">
                  {r.abbr}
                </td>
                {r.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2 ${
                      cell ? "text-navy-900 font-semibold" : "text-gray-300 italic"
                    }`}
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

      <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
        <ExternalLink className="w-3 h-3" />
        <span className="font-mono break-all">{matrix.file}</span>
      </div>
    </div>
  )
}
