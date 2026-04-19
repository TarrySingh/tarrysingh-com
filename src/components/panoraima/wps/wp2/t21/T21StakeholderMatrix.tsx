"use client"

import { useMemo, useState } from "react"
import { X, Users, Target } from "lucide-react"
import type { Task21Detail, T21RegisterRow } from "@/lib/panoraima/types"

interface Props {
  detail: Task21Detail
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Contacted":      { bg: "bg-sky-50",      text: "text-sky-800",      dot: "#0ea5e9" },
  "Accepted":       { bg: "bg-emerald-50",  text: "text-emerald-800",  dot: "#10b981" },
  "Confirmed":      { bg: "bg-emerald-50",  text: "text-emerald-800",  dot: "#10b981" },
  "Commitment":     { bg: "bg-gold-50",     text: "text-gold-800",     dot: "#c9a96e" },
  "No Reply":       { bg: "bg-gray-50",     text: "text-gray-500",     dot: "#9ca3af" },
  "No reply":       { bg: "bg-gray-50",     text: "text-gray-500",     dot: "#9ca3af" },
  "Declined":       { bg: "bg-rose-50",     text: "text-rose-700",     dot: "#f43f5e" },
  "Participated":   { bg: "bg-emerald-100", text: "text-emerald-900",  dot: "#059669" },
  "Pending":        { bg: "bg-gold-50",     text: "text-gold-700",     dot: "#c9a96e" },
}

export default function T21StakeholderMatrix({ detail }: Props) {
  const ie = detail.working_groups.ireland.stakeholder_register
  const rows = useMemo(() => [...(ie.focus_groups ?? []), ...(ie.surveys ?? [])], [ie])

  const [filter, setFilter] = useState<{
    sector?: string
    fg_type?: string
    status?: string
  }>({})
  const [selected, setSelected] = useState<T21RegisterRow | null>(null)
  const [query, setQuery] = useState("")

  const sectors = useMemo(() => uniq(rows.map(r => r.sector).filter(Boolean) as string[]), [rows])
  const fgTypes = useMemo(() => uniq(rows.map(r => r.fg_type).filter(Boolean) as string[]), [rows])
  const statuses = useMemo(() => uniq(rows.map(r => r.status).filter(Boolean) as string[]), [rows])

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (filter.sector && r.sector !== filter.sector) return false
      if (filter.fg_type && r.fg_type !== filter.fg_type) return false
      if (filter.status && r.status !== filter.status) return false
      if (query) {
        const q = query.toLowerCase()
        const hay = `${r.org ?? ""} ${r.panoraima_contact ?? ""} ${r.notes ?? ""} ${r.sector ?? ""}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, filter, query])

  // Funnel counts
  const funnel = useMemo(() => {
    const counts: Record<string, number> = { Contacted: 0, Commitment: 0, Confirmed: 0, Participated: 0 }
    rows.forEach(r => {
      const s = r.status || ""
      if (/contact/i.test(s)) counts.Contacted++
      if (/commit|accept/i.test(s)) counts.Commitment++
      if (/confirm/i.test(s)) counts.Confirmed++
      if (/participat|attended/i.test(s)) counts.Participated++
    })
    return counts
  }, [rows])

  const maxFunnel = Math.max(1, ...Object.values(funnel))

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Stakeholder register
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          {rows.length} organisations on the Irish outreach list
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Parsed from <code className="font-mono text-gray-600">Stakeholders Identification_Register.xlsx</code>.
          Combines the focus-group invite list with the parallel surveys sheet.
        </p>
      </div>

      {/* Funnel strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(funnel).map(([stage, n], i) => {
          const pct = Math.round((n / (rows.length || 1)) * 100)
          const dropoff = i > 0 ? ((Object.values(funnel)[i - 1] - n) / (Object.values(funnel)[i - 1] || 1)) * 100 : null
          return (
            <div key={stage} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-400">
                {i + 1}. {stage}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums text-navy-900">{n}</span>
                <span className="text-[11px] text-gray-400 tabular-nums">{pct}%</span>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-gold-500 transition-all duration-700"
                  style={{ width: `${(n / maxFunnel) * 100}%` }}
                />
              </div>
              {dropoff != null && dropoff > 0 && (
                <div className="mt-1.5 text-[10px] text-rose-500 font-mono">
                  ↓ {dropoff.toFixed(0)}% drop-off
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Filters + search */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 mb-4 space-y-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search organisations, contacts, notes…"
          className="w-full px-4 py-2.5 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:border-navy-400 focus:bg-white focus:outline-none transition-colors"
        />
        <div className="flex flex-wrap gap-3 text-[11px]">
          <FilterGroup
            label="Sector"
            options={sectors}
            value={filter.sector}
            onChange={v => setFilter(f => ({ ...f, sector: v }))}
          />
          <FilterGroup
            label="Focus group"
            options={fgTypes}
            value={filter.fg_type}
            onChange={v => setFilter(f => ({ ...f, fg_type: v }))}
          />
          <FilterGroup
            label="Status"
            options={statuses}
            value={filter.status}
            onChange={v => setFilter(f => ({ ...f, status: v }))}
          />
        </div>
        <div className="text-[11px] text-gray-400 font-mono">
          {filtered.length} of {rows.length} rows
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.slice(0, 30).map((r, i) => {
          const sc = STATUS_COLORS[r.status ?? ""] ?? {
            bg: "bg-gray-50", text: "text-gray-600", dot: "#9ca3af",
          }
          return (
            <button
              key={i}
              onClick={() => setSelected(r)}
              className="text-left rounded-xl border border-gray-100 bg-white p-4 hover:border-navy-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-semibold text-navy-900 text-sm leading-tight truncate">
                  {r.org || "—"}
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${sc.bg} ${sc.text} flex-shrink-0`}
                  style={{ borderColor: `${sc.dot}33` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                  {r.status || "unknown"}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 space-y-0.5">
                {r.sector && <div>Sector: <span className="font-medium text-navy-700">{r.sector}</span></div>}
                {r.fg_type && <div>Focus group: <span className="font-medium text-navy-700">{r.fg_type}</span></div>}
                {r.panoraima_contact && <div className="truncate">PANORAIMA: {r.panoraima_contact}</div>}
              </div>
            </button>
          )
        })}
      </div>
      {filtered.length > 30 && (
        <div className="mt-4 text-center text-[11px] text-gray-500">
          Showing first 30 — narrow your filters to see more.
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <aside className="fixed top-0 bottom-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl flex flex-col animate-[slide-in_0.4s_cubic-bezier(0.22,1,0.36,1)]">
            <div className="relative px-6 pt-6 pb-5 bg-navy-950 text-white">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-gold-300 mb-2">
                <Users className="w-3 h-3" />
                Stakeholder
              </div>
              <h2 className="text-xl font-bold leading-tight">{selected.org}</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {Object.entries(selected).map(([k, v]) => {
                if (!v || k === "org" || k === "") return null
                return (
                  <div key={k}>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500 font-bold mb-1">
                      {k.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm text-navy-800">{v}</div>
                  </div>
                )
              })}
            </div>
          </aside>
        </>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }
      `}</style>
    </section>
  )
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function FilterGroup({
  label, options, value, onChange,
}: {
  label: string
  options: string[]
  value?: string
  onChange: (v: string | undefined) => void
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">
        {label}:
      </span>
      <button
        onClick={() => onChange(undefined)}
        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
          !value ? "bg-navy-900 text-white" : "bg-gray-50 text-navy-700 hover:bg-gray-100"
        }`}
      >
        All
      </button>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o === value ? undefined : o)}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
            value === o ? "bg-navy-900 text-white" : "bg-gray-50 text-navy-700 hover:bg-gray-100"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
