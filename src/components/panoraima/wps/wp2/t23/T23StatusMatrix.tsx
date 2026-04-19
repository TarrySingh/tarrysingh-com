"use client"

import type { Task23Detail } from "@/lib/panoraima/types"

interface Props {
  detail: Task23Detail
}

type Cell = {
  value: string
  tone: "positive" | "negative" | "caution" | "neutral" | "muted"
  display: string
}

function classify(raw: string, axis: "acc" | "action" | "roadmap"): Cell {
  const v = (raw || "").toLowerCase().trim()
  if (axis === "acc") {
    if (v === "yes") return { value: v, tone: "positive", display: "✓" }
    if (v === "no")  return { value: v, tone: "negative", display: "✗" }
    return { value: v, tone: "muted", display: "—" }
  }
  if (axis === "action") {
    // treat filled non-"no further" action text as "action needed"
    if (v && !v.includes("no further actions")) {
      if (v.includes("don't expect that you can help")) return { value: "declined", tone: "neutral", display: "declined" }
      return { value: "needed", tone: "caution", display: "needed" }
    }
    if (v.includes("no further actions"))             return { value: "done", tone: "positive", display: "done" }
    return { value: "blank", tone: "muted", display: "—" }
  }
  // roadmap
  if (v === "yes")          return { value: "yes",  tone: "caution",  display: "planned" }
  if (v === "not needed")   return { value: "none", tone: "positive", display: "not needed" }
  return { value: "blank", tone: "muted", display: "—" }
}

const TONE: Record<string, string> = {
  positive: "bg-emerald-100 text-emerald-800 border-emerald-200",
  caution:  "bg-gold-100 text-gold-800 border-gold-200",
  negative: "bg-rose-100 text-rose-800 border-rose-200",
  neutral:  "bg-sky-100 text-sky-800 border-sky-200",
  muted:    "bg-gray-50 text-gray-400 border-dashed border-gray-200",
}

export default function T23StatusMatrix({ detail }: Props) {
  const cols: { key: string; label: string; axis: "acc" | "action" | "roadmap" }[] = [
    { key: "inst",     label: "Inst. acc.",     axis: "acc"     },
    { key: "prog",     label: "Prog. acc.",     axis: "acc"     },
    { key: "action",   label: "Action status",  axis: "action"  },
    { key: "roadmap",  label: "Roadmap",        axis: "roadmap" },
  ]

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          At-a-glance status
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          8 partners × 4 status dimensions
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          The whole T2.3 coordination state on one grid — quickly spot where
          HAW still needs to chase, and where the next follow-up belongs.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-5 md:p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-2 pr-4 text-[11px] font-bold uppercase tracking-wider text-navy-500 sticky left-0 bg-white">
                Partner
              </th>
              <th className="py-2 px-3 text-[11px] font-bold uppercase tracking-wider text-navy-500 text-center">
                Country
              </th>
              <th className="py-2 px-3 text-[11px] font-bold uppercase tracking-wider text-navy-500 text-center">
                Progs
              </th>
              {cols.map(c => (
                <th key={c.key} className="py-2 px-3 text-[11px] font-bold uppercase tracking-wider text-navy-500 text-center">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detail.partners.map(p => {
              const cells: Cell[] = [
                classify(p.institutional_accreditation, "acc"),
                classify(p.programme_accreditation, "acc"),
                classify(p.action_text, "action"),
                classify(p.roadmap, "roadmap"),
              ]
              return (
                <tr key={p.abbr} className="border-b border-gray-50 last:border-0 hover:bg-navy-50/30">
                  <td className="py-2.5 pr-4 sticky left-0 bg-white hover:bg-navy-50/30">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-navy-900">{p.abbr}</span>
                      {p.abbr === "HAW" && (
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-gold-700 bg-gold-100 border border-gold-300 px-1 py-0.5 rounded">
                          Lead
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 leading-tight max-w-[180px] truncate">
                      {p.institution}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-gray-600 text-center">
                    {p.country}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono text-sm font-bold tabular-nums text-navy-900">
                      {p.programmes || "—"}
                    </span>
                  </td>
                  {cells.map((c, i) => (
                    <td key={i} className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[3.5rem] px-2 py-1 rounded-md text-[10.5px] font-bold border ${TONE[c.tone]}`}>
                        {c.display}
                      </span>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-gray-500">
          {Object.entries({
            positive: "Good / done / not needed",
            caution:  "Planned / action needed",
            neutral:  "Declined / other",
            negative: "Not accredited",
            muted:    "Empty / blank",
          }).map(([tone, desc]) => (
            <span key={tone} className="inline-flex items-center gap-1.5">
              <span className={`inline-block w-3 h-3 rounded border ${TONE[tone]}`} />
              {desc}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
