"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Search, FileText, X, Tag, Clock, MapPin, HardDrive } from "lucide-react"
import type { WpCatalogueEntry } from "@/lib/panoraima/types"
import { NAVY, INK, SLATE, MUTE, FAINT, LINE, SURFACE, COBALT, COBALT_SOFT, COBALT_LINE } from "../consortiumTokens"

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

export default function DocumentExplorer({ catalogue }: Props) {
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
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: COBALT, borderWidth: 1, borderColor: COBALT_LINE, background: COBALT_SOFT }}
        >
          Document explorer
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          Every file in the folder
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
          Search by name or content, filter by type or country, click any card to see the
          extracted excerpt and classification.
        </p>
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl bg-white p-4 mb-4 space-y-3" style={{ borderWidth: 1, borderColor: LINE }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: FAINT }} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search file names, excerpts, themes…"
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg focus:outline-none transition-colors focus:ring-2"
            style={{ background: SURFACE, borderWidth: 1, borderColor: LINE, color: INK, ["--tw-ring-color" as string]: COBALT }}
            onFocus={(e) => { e.currentTarget.style.borderColor = COBALT; e.currentTarget.style.background = "#FFFFFF" }}
            onBlur={(e) => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.background = SURFACE }}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
              style={{ background: LINE }}
              aria-label="Clear"
            >
              <X className="w-3 h-3" style={{ color: MUTE }} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: FAINT }}>Type:</span>
          <FilterPill active={!typeFilter} onClick={() => setTypeFilter(null)}>
            All
          </FilterPill>
          {types.map((t) => (
            <FilterPill
              key={t}
              active={typeFilter === t}
              onClick={() => setTypeFilter(t === typeFilter ? null : t)}
            >
              {TYPE_LABEL[t] || t}
            </FilterPill>
          ))}

          {regions.length > 0 && (
            <>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-semibold ml-3" style={{ color: FAINT }}>
                Country:
              </span>
              <FilterPill active={!regionFilter} onClick={() => setRegionFilter(null)}>
                All
              </FilterPill>
              {regions.map((r) => (
                <FilterPill
                  key={r}
                  active={regionFilter === r}
                  onClick={() => setRegionFilter(r === regionFilter ? null : r)}
                >
                  {r}
                </FilterPill>
              ))}
            </>
          )}
        </div>

        <div className="text-[11px] font-mono tabular-nums" style={{ color: FAINT }}>
          {filtered.length} of {catalogue.length} files
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.slice(0, 40).map((c) => (
          <button
            key={c.rel_path}
            onClick={() => setSelected(c)}
            className="text-left rounded-xl bg-white p-4 transition-colors group"
            style={{ borderWidth: 1, borderColor: LINE }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = COBALT_LINE }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-white"
                style={{ background: NAVY }}
              >
                {(EXT_LABEL[c.ext] || c.ext.slice(1)).toUpperCase().slice(0, 4)}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="text-sm font-semibold line-clamp-1 transition-colors"
                  style={{ color: INK }}
                >
                  {c.title || c.name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] flex-wrap" style={{ color: MUTE }}>
                  {c.task && (
                    <span className="font-mono font-bold" style={{ color: COBALT }}>{c.task}</span>
                  )}
                  {c.type && (
                    <span className="px-1.5 py-0.5 rounded" style={{ background: SURFACE, color: SLATE }}>
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
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-2.5 h-2.5" />
                      {c.date}
                    </span>
                  )}
                </div>
                {c.excerpt && (
                  <p className="mt-2 text-[11.5px] line-clamp-2 leading-snug" style={{ color: SLATE }}>
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
                          background: COBALT_SOFT,
                          color: COBALT,
                        }}
                      >
                        <Tag className="w-2 h-2" />
                        {t}
                      </span>
                    ))}
                    {c.themes.length > 3 && (
                      <span className="text-[9px]" style={{ color: FAINT }}>+{c.themes.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length > 40 && (
        <div className="mt-4 text-center text-[11px]" style={{ color: MUTE }}>
          Showing the first 40 — narrow your search to see more.
        </div>
      )}

      {/* Detail drawer */}
      <DocumentSheet entry={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function FilterPill({
  active, onClick, children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
      style={
        active
          ? { background: NAVY, color: "#FFFFFF" }
          : { background: "#FFFFFF", color: SLATE, borderWidth: 1, borderColor: LINE }
      }
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = SURFACE }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#FFFFFF" }}
    >
      {children}
    </button>
  )
}

function DocumentSheet({
  entry, onClose,
}: {
  entry: WpCatalogueEntry | null
  onClose: () => void
}) {
  if (!entry) return null
  const open = !!entry

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(5,28,44,0.6)" }}
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
          style={{ background: NAVY }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: "#7DA0FF" }}>
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
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: FAINT }}>
                Themes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.themes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: COBALT_SOFT, color: COBALT }}
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
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: FAINT }}>
                Stakeholder types mentioned
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.stakeholders.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: SURFACE, color: SLATE, borderWidth: 1, borderColor: LINE }}
                  >
                    {s.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.excerpt ? (
            <div className="mb-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: FAINT }}>
                Extracted excerpt
              </div>
              <p className="text-[13px] leading-relaxed italic pl-4" style={{ color: INK, borderLeftWidth: 2, borderColor: COBALT }}>
                &ldquo;{entry.excerpt}&rdquo;
              </p>
            </div>
          ) : (
            <div className="mb-6 text-sm italic" style={{ color: MUTE }}>
              No readable excerpt was extracted (scanned PDF or unsupported binary).
            </div>
          )}

          <div className="mt-8 pt-6" style={{ borderTopWidth: 1, borderColor: LINE }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: FAINT }}>
              Source path (SharePoint)
            </div>
            <code className="block text-[11px] font-mono break-all px-3 py-2 rounded-md" style={{ color: INK, background: SURFACE }}>
              PANORAIMA - Documents / WP2 / {entry.rel_path}
            </code>
          </div>
        </div>
      </aside>
    </>
  )
}
