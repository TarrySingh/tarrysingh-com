"use client"

import type { CSSProperties } from "react"
import type { Task23Detail } from "@/lib/panoraima/types"
import {
  INK, SLATE, MUTE, FAINT, LINE, LINE_SOFT, SURFACE,
  COBALT, COBALT_SOFT, COBALT_LINE,
  OK, OK_SOFT, WARN, WARN_SOFT, BAD, BAD_SOFT,
} from "../../../consortiumTokens"

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
    return { value: v, tone: "muted", display: ", " }
  }
  if (axis === "action") {
    // treat filled non-"no further" action text as "action needed"
    if (v && !v.includes("no further actions")) {
      if (v.includes("don't expect that you can help")) return { value: "declined", tone: "neutral", display: "declined" }
      return { value: "needed", tone: "caution", display: "needed" }
    }
    if (v.includes("no further actions"))             return { value: "done", tone: "positive", display: "done" }
    return { value: "blank", tone: "muted", display: ", " }
  }
  // roadmap
  if (v === "yes")          return { value: "yes",  tone: "caution",  display: "planned" }
  if (v === "not needed")   return { value: "none", tone: "positive", display: "not needed" }
  return { value: "blank", tone: "muted", display: ", " }
}

const TONE: Record<string, { style: CSSProperties; dashed?: boolean }> = {
  positive: { style: { backgroundColor: OK_SOFT, color: OK, borderColor: OK } },
  caution:  { style: { backgroundColor: WARN_SOFT, color: WARN, borderColor: WARN } },
  negative: { style: { backgroundColor: BAD_SOFT, color: BAD, borderColor: BAD } },
  neutral:  { style: { backgroundColor: COBALT_SOFT, color: COBALT, borderColor: COBALT_LINE } },
  muted:    { style: { backgroundColor: SURFACE, color: FAINT, borderColor: LINE }, dashed: true },
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
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.2em] border"
          style={{ color: COBALT, borderColor: COBALT_LINE, backgroundColor: COBALT_SOFT }}
        >
          At-a-glance status
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          8 partners × 4 status dimensions
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
          The whole T2.3 coordination state on one grid, quickly spot where
          HAW still needs to chase, and where the next follow-up belongs.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5 md:p-6 overflow-x-auto" style={{ borderColor: LINE }}>
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b" style={{ borderColor: LINE }}>
              <th className="py-2 pr-4 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] sticky left-0 bg-white" style={{ color: FAINT }}>
                Partner
              </th>
              <th className="py-2 px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-center" style={{ color: FAINT }}>
                Country
              </th>
              <th className="py-2 px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-center" style={{ color: FAINT }}>
                Progs
              </th>
              {cols.map(c => (
                <th key={c.key} className="py-2 px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-center" style={{ color: FAINT }}>
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
                <tr key={p.abbr} className="border-b last:border-0 hover:bg-[#F7F8FA]" style={{ borderColor: LINE_SOFT }}>
                  <td className="py-2.5 pr-4 sticky left-0 bg-white hover:bg-[#F7F8FA]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold" style={{ color: INK }}>{p.abbr}</span>
                      {p.abbr === "HAW" && (
                        <span
                          className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.15em] border px-1 py-0.5 rounded"
                          style={{ color: COBALT, backgroundColor: COBALT_SOFT, borderColor: COBALT_LINE }}
                        >
                          Lead
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] leading-tight max-w-[180px] truncate" style={{ color: MUTE }}>
                      {p.institution}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-center" style={{ color: SLATE }}>
                    {p.country}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono text-sm font-bold tabular-nums" style={{ color: INK }}>
                      {p.programmes || ", "}
                    </span>
                  </td>
                  {cells.map((c, i) => (
                    <td key={i} className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[3.5rem] px-2 py-1 rounded-md text-[10.5px] font-bold border ${TONE[c.tone].dashed ? "border-dashed" : ""}`}
                        style={TONE[c.tone].style}
                      >
                        {c.display}
                      </span>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-5 pt-5 border-t flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]" style={{ borderColor: LINE, color: MUTE }}>
          {Object.entries({
            positive: "Good / done / not needed",
            caution:  "Planned / action needed",
            neutral:  "Declined / other",
            negative: "Not accredited",
            muted:    "Empty / blank",
          }).map(([tone, desc]) => (
            <span key={tone} className="inline-flex items-center gap-1.5">
              <span
                className={`inline-block w-3 h-3 rounded border ${TONE[tone].dashed ? "border-dashed" : ""}`}
                style={TONE[tone].style}
              />
              {desc}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
