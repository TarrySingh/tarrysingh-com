"use client"

import { useMemo, useState } from "react"
import { Search, FileText, X, Tag, Clock, MapPin, HardDrive } from "lucide-react"
import type { WpCatalogueEntry } from "@/lib/panoraima/types"

interface Props {
  catalogue: WpCatalogueEntry[]
  color: string
}

const EXT_LABEL: Record<string, string> = {
  ".docx": "Word", ".pptx": "Slides", ".xlsx": "Sheet", ".pdf": "PDF",
  ".rtf": "RTF", ".potx": "Template", ".docm": "Word (macro)",
  ".odt": "ODT", ".mp4": "Video", ".mp3": "Audio", ".vtt": "Subtitles", ".txt": "Text",
}

const TYPE_LABEL: Record<string, string> = {
  deliverable: "Deliverable",
  focus_group: "Focus group",
  meeting: "Meeting",
  research: "Research",
  presentation: "Presentation",
  admin: "Admin",
  template: "Template",
  other: "Other",
}

export default function DocumentExplorer({ catalogue, color }: Props) {
  const [q, setQ] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [regionFilter, setRegionFilter] = useState<string | null>(null)
  const [selected, setSelected] = useState<WpCatalogueEntry | null>(null)

  const types = useMemo(() => {
    const s = new Set<string>()
    catalogue.forEach((c) => c.type && s.add(c.type))
    return Array.from(s).sort()
  }, [catalogue])

  const regions = useMemo(() => {
    const s = new Set<string>()
    catalogue.forEach((c) => c.region && s.add(c.region))
    return Array.from(s).sort()
  }, [catalogue])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return catalogue
      .filter((c) => !typeFilter || c.type === typeFilter)
      .filter((c) => !regionFilter || c.region === regionFilter)
      .filter((c) => {
        if (!needle) return true
        return (
          c.name.toLowerCase().includes(needle) ||
          (c.title ?? "").toLowerCase().includes(needle) ||
          (c.excerpt ?? "").toLowerCase().includes(needle) ||
          (c.themes ?? []).some((t) => t.toLowerCase().includes(needle))
        )
      })
      .sort((a, b) => {
        // Prioritise dated → most-recent first
        if (a.date && b.date) return a.date > b.date ? -1 : 1
        if (a.date) return -1
        if (b.date) return 1
        return a.name.localeCompare(b.name)
      })
  }, [catalogue, q, typeFilter, regionFilter])

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Document explorer
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          Every file in the folder
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Search by name or content, filter by type or country, click any card to see the
          extracted excerpt and classification.
        </p>
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search file names, excerpts, themes…"
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:border-navy-400 focus:bg-white focus:outline-none transition-colors"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              aria-label="Clear"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">Type:</span>
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              !typeFilter ? "bg-navy-900 text-white" : "bg-gray-50 text-navy-700 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? null : t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                typeFilter === t ? "bg-navy-900 text-white" : "bg-gray-50 text-navy-700 hover:bg-gray-100"
              }`}
            >
              {TYPE_LABEL[t] || t}
            </button>
          ))}

          {regions.length > 0 && (
            <>
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 ml-3">
                Country:
              </span>
              <button
                onClick={() => setRegionFilter(null)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  !regionFilter ? "bg-navy-900 text-white" : "bg-gray-50 text-navy-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegionFilter(r === regionFilter ? null : r)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    regionFilter === r ? "bg-navy-900 text-white" : "bg-gray-50 text-navy-700 hover:bg-gray-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="text-[11px] text-gray-400 font-mono">
          {filtered.length} of {catalogue.length} files
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.slice(0, 40).map((c) => (
          <button
            key={c.rel_path}
            onClick={() => setSelected(c)}
            className="text-left rounded-xl border border-gray-100 bg-white p-4 hover:border-navy-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-white"
                style={{ background: color }}
              >
                {(EXT_LABEL[c.ext] || c.ext.slice(1)).toUpperCase().slice(0, 4)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-navy-900 group-hover:text-navy-700 line-clamp-1">
                  {c.title || c.name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500 flex-wrap">
                  {c.task && (
                    <span className="font-mono font-bold text-navy-600">{c.task}</span>
                  )}
                  {c.type && (
                    <span className="px-1.5 py-0.5 rounded bg-gray-50 text-navy-700">
                      {TYPE_LABEL[c.type] || c.type}
                    </span>
                  )}
                  {c.region && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {c.region}
                    </span>
                  )}
                  {c.date && (
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {c.date}
                    </span>
                  )}
                </div>
                {c.excerpt && (
                  <p className="mt-2 text-[11.5px] text-gray-600 line-clamp-2 leading-snug">
                    {c.excerpt}
                  </p>
                )}
                {c.themes && c.themes.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    {c.themes.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                        style={{
                          background: `${color}15`,
                          color,
                        }}
                      >
                        <Tag className="w-2 h-2" />
                        {t}
                      </span>
                    ))}
                    {c.themes.length > 3 && (
                      <span className="text-[9px] text-gray-400">+{c.themes.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length > 40 && (
        <div className="mt-4 text-center text-[11px] text-gray-500">
          Showing the first 40 — narrow your search to see more.
        </div>
      )}

      {/* Detail drawer */}
      <DocumentSheet entry={selected} onClose={() => setSelected(null)} color={color} />
    </section>
  )
}

function DocumentSheet({
  entry, onClose, color,
}: {
  entry: WpCatalogueEntry | null
  onClose: () => void
  color: string
}) {
  if (!entry) return null
  const open = !!entry

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />
      <aside
        aria-label="Document details"
        className={`fixed top-0 bottom-0 right-0 z-50 w-full md:w-[640px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div
          className="relative px-6 md:px-8 pt-7 pb-6 text-white overflow-hidden"
          style={{ background: `linear-gradient(135deg, #0A1628 0%, ${color}dd 180%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-gold-300 mb-2">
            <FileText className="w-3 h-3" />
            {TYPE_LABEL[entry.type] || entry.type}
            {entry.task && (
              <>
                <span className="text-white/40">·</span>
                <span className="text-white/80 font-mono">{entry.task}</span>
              </>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold leading-tight mb-3">
            {entry.title || entry.name}
          </h2>
          <div className="flex items-center gap-3 text-[11px] text-white/75 flex-wrap font-mono">
            {entry.date && (
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {entry.date}</span>
            )}
            {entry.region && (
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {entry.region}</span>
            )}
            {entry.size_kb ? (
              <span className="inline-flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {entry.size_kb >= 1024 ? `${(entry.size_kb / 1024).toFixed(1)} MB` : `${entry.size_kb} KB`}
              </span>
            ) : null}
            {entry.word_count ? (
              <span>{entry.word_count.toLocaleString()} words</span>
            ) : null}
            {entry.pages ? <span>{entry.pages} pp</span> : null}
            {entry.slides_count ? <span>{entry.slides_count} slides</span> : null}
            {entry.sheets_count ? <span>{entry.sheets_count} sheets</span> : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          {entry.themes && entry.themes.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500 font-bold mb-2">
                Themes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.themes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: `${color}15`, color }}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.stakeholders && entry.stakeholders.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500 font-bold mb-2">
                Stakeholder types mentioned
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.stakeholders.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-navy-50 text-navy-700 border border-navy-100"
                  >
                    {s.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.excerpt ? (
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500 font-bold mb-2">
                Extracted excerpt
              </div>
              <p className="text-[13px] text-navy-800 leading-relaxed italic border-l-2 border-gold-300 pl-4">
                &ldquo;{entry.excerpt}&rdquo;
              </p>
            </div>
          ) : (
            <div className="mb-6 text-sm text-gray-500 italic">
              No readable excerpt was extracted (scanned PDF or unsupported binary).
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500 font-bold mb-2">
              Source path (SharePoint)
            </div>
            <code className="block text-[11px] font-mono text-gray-600 break-all bg-gray-50 px-3 py-2 rounded-md">
              PANORAIMA - Documents / WP2 / {entry.rel_path}
            </code>
          </div>
        </div>
      </aside>
    </>
  )
}
