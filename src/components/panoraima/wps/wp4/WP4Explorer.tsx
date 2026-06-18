"use client"

import { useMemo, useState } from "react"
import {
  X, Search, FileText, Sparkles, FolderOpen, Clock,
  User, UserCheck, UsersRound, CalendarDays, ExternalLink,
  CheckCircle2, XCircle, AlertCircle, BookOpen, ClipboardCheck,
} from "lucide-react"
import type {
  Wp4Registry, Wp4LE, Wp4Completeness, Wp4WikiSection,
} from "@/lib/panoraima/types"
import {
  TRACK_ORDER, TRACK_COLOR, TRACK_SHORT, statusStyle, ROLE_LABEL, ROLE_COLOR,
} from "./wp4constants"

type MaterialsFilter = "all" | "with" | "pending"

const RENDER_CAP = 120

export default function WP4Explorer({ registry }: { registry: Wp4Registry }) {
  const les = registry.les

  const [query, setQuery] = useState("")
  const [track, setTrack] = useState<string>("All")
  const [materials, setMaterials] = useState<MaterialsFilter>("all")
  const [realaiOnly, setRealaiOnly] = useState(false)
  const [selected, setSelected] = useState<Wp4LE | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return les.filter((le) => {
      if (track !== "All" && le.track !== track) return false
      if (materials === "with" && !le.materials.has) return false
      if (materials === "pending" && le.materials.has) return false
      if (realaiOnly && !le.realai.involved) return false
      if (q) {
        const hay = `${le.code} ${le.title} ${le.author} ${le.reviewer} ${le.coauthor} ${le.track} ${le.status}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [les, query, track, materials, realaiOnly])

  const shown = filtered.slice(0, RENDER_CAP)

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Explore
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          Every Learning Event
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Search across all {les.length} LEs by code, title, track, author, reviewer or status.
        </p>
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 mb-4 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search LEs by code, title, track, author, reviewer, status…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:border-navy-400 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {/* Track */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">Track:</span>
            <Chip active={track === "All"} onClick={() => setTrack("All")}>All</Chip>
            {TRACK_ORDER.map((t) => (
              <Chip key={t} active={track === t} onClick={() => setTrack(t)}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: TRACK_COLOR[t] ?? TRACK_COLOR.Unknown }}
                />
                {TRACK_SHORT[t] ?? t}
              </Chip>
            ))}
          </div>

          {/* Materials */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">Materials:</span>
            <Chip active={materials === "all"} onClick={() => setMaterials("all")}>All</Chip>
            <Chip active={materials === "with"} onClick={() => setMaterials("with")}>With files</Chip>
            <Chip active={materials === "pending"} onClick={() => setMaterials("pending")}>Pending</Chip>
          </div>

          {/* RealAI toggle */}
          <button
            onClick={() => setRealaiOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
              realaiOnly
                ? "bg-gold-500 border-gold-500 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-gold-300"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            RealAI only
          </button>
        </div>

        <div className="text-[11px] text-gray-400 font-mono tabular-nums">
          Showing {shown.length} of {les.length}
          {filtered.length !== shown.length && (
            <span className="text-gray-400"> &middot; {filtered.length} match the filter</span>
          )}
        </div>
      </div>

      {/* Results list */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm divide-y divide-gray-50">
        {shown.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            No Learning Events match your search.
          </div>
        )}
        {shown.map((le) => {
          const ss = statusStyle(le.status)
          const dot = TRACK_COLOR[le.track] ?? TRACK_COLOR.Unknown
          return (
            <button
              key={le.code}
              onClick={() => setSelected(le)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-navy-50/40 transition-colors group"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: dot }}
                title={le.track}
              />
              <span className="font-mono text-[11px] font-bold text-navy-700 tabular-nums w-20 flex-shrink-0">
                {le.code}
              </span>
              <span className="flex-1 min-w-0 text-sm text-navy-900 font-medium truncate group-hover:text-navy-700">
                {le.title || "Untitled"}
              </span>

              {le.realai.involved && (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gold-50 text-gold-700 border border-gold-200 flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  RealAI
                </span>
              )}

              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-gray-400 tabular-nums w-14 justify-end flex-shrink-0">
                <FileText className="w-3 h-3" />
                {le.materials.count}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${ss.bg} ${ss.text} flex-shrink-0`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.color }} />
                {ss.label}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length > RENDER_CAP && (
        <div className="mt-4 text-center text-[11px] text-gray-500">
          Showing the first {RENDER_CAP} of {filtered.length} matches — refine your search to narrow the list.
        </div>
      )}

      {/* Drawer */}
      {selected && <LEDrawer le={selected} onClose={() => setSelected(null)} />}

      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }
      `}</style>
    </section>
  )
}

function Chip({
  active, onClick, children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
        active ? "bg-navy-900 text-white" : "bg-gray-50 text-navy-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  )
}

function LEDrawer({ le, onClose }: { le: Wp4LE; onClose: () => void }) {
  const ss = statusStyle(le.status)
  const trackColor = TRACK_COLOR[le.track] ?? TRACK_COLOR.Unknown

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="fixed top-0 bottom-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl flex flex-col animate-[slide-in_0.4s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 bg-navy-950 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] font-bold text-gold-300 tabular-nums">{le.code}</span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] font-bold text-white/70">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: trackColor }} />
              {le.track || "Unknown track"}
            </span>
          </div>
          <h2 className="text-lg font-bold leading-tight pr-10">{le.title || "Untitled Learning Event"}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${ss.bg} ${ss.text}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.color }} />
              {ss.label}
            </span>
            {le.realai.involved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-200 border border-gold-400/40">
                <Sparkles className="w-2.5 h-2.5" />
                RealAI
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetaCell label="Lesson type" value={le.lesson_type} icon={<FileText className="w-3 h-3" />} />
            <MetaCell label="Duration" value={le.duration} icon={<Clock className="w-3 h-3" />} />
            <MetaCell label="Due date" value={le.due_date} icon={<CalendarDays className="w-3 h-3" />} />
            <MetaCell label="Materials" value={`${le.materials.count} file${le.materials.count === 1 ? "" : "s"}`} icon={<FolderOpen className="w-3 h-3" />} />
          </div>

          {/* People */}
          <div className="space-y-2">
            <SectionLabel>People</SectionLabel>
            <PersonRow icon={<User className="w-3.5 h-3.5" />} role="Author" name={le.author} />
            <PersonRow icon={<UsersRound className="w-3.5 h-3.5" />} role="Co-author" name={le.coauthor} />
            <PersonRow icon={<UserCheck className="w-3.5 h-3.5" />} role="Reviewer" name={le.reviewer} />
          </div>

          {/* RealAI roles */}
          {le.realai.involved && le.realai.roles.length > 0 && (
            <div className="space-y-2">
              <SectionLabel>RealAI routing</SectionLabel>
              <div className="space-y-1.5">
                {le.realai.roles.map((r, i) => {
                  const rc = ROLE_COLOR[r.role] ?? "#94a3b8"
                  return (
                    <div
                      key={`${r.role}-${i}`}
                      className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc }} />
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: rc }}>
                          {ROLE_LABEL[r.role] ?? r.role}
                        </span>
                      </div>
                      {r.recipients.length > 0 && (
                        <div className="mt-1 text-[11px] text-gray-600 font-mono break-all leading-relaxed">
                          {r.recipients.join(", ")}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lesson plan */}
          {le.lesson_plan.doc && (
            <div className="space-y-2">
              <SectionLabel>Lesson plan</SectionLabel>
              <div className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
                <FileText className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                <span className="text-[12px] text-navy-800 truncate">{le.lesson_plan.doc}</span>
                {le.lesson_plan.date && (
                  <span className="ml-auto text-[10px] text-gray-400 tabular-nums flex-shrink-0">{le.lesson_plan.date}</span>
                )}
              </div>
            </div>
          )}

          {/* Material files */}
          <div className="space-y-2">
            <SectionLabel>
              Material files {le.materials.count > 0 && <span className="text-gray-400 font-normal tabular-nums">({le.materials.count})</span>}
            </SectionLabel>
            {le.materials.files.length === 0 ? (
              <div className="text-[12px] text-gray-400 italic px-1">No material files indexed yet.</div>
            ) : (
              <div className="space-y-1.5">
                {le.materials.files.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 hover:border-navy-200 transition-colors"
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-navy-50 text-[9px] font-bold uppercase text-navy-500 flex-shrink-0">
                      {f.ext || "?"}
                    </span>
                    <span className="flex-1 min-w-0 text-[12px] text-navy-800 truncate">{f.name}</span>
                    <span className="text-[10px] text-gray-400 tabular-nums flex-shrink-0">
                      {Math.round(f.kb)} KB
                    </span>
                    {f.date && (
                      <span className="text-[10px] text-gray-400 tabular-nums flex-shrink-0 hidden sm:inline">
                        {f.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completeness */}
          {le.completeness && <CompletenessBlock c={le.completeness} />}

          {/* Wiki content */}
          {le.wiki_sections && le.wiki_sections.length > 0 && (
            <div className="space-y-2">
              <SectionLabel>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" />
                  Wiki content
                  <span className="text-gray-400 font-normal tabular-nums">({le.wiki_sections.length})</span>
                </span>
              </SectionLabel>
              <div className="space-y-2">
                {le.wiki_sections.map((s, i) => (
                  <WikiSectionCard key={`${s.name}-${i}`} section={s} />
                ))}
              </div>
            </div>
          )}

          {/* Wiki link */}
          {le.wiki_page && (
            <a
              href={le.wiki_page}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-sky-600 hover:text-sky-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open wiki page
            </a>
          )}
        </div>
      </aside>
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500 font-bold">
      {children}
    </div>
  )
}

function MetaCell({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-100 px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-[13px] text-navy-800 font-medium tabular-nums">{value || "—"}</div>
    </div>
  )
}

function PersonRow({ icon, role, name }: { icon: React.ReactNode; role: string; name: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy-50 text-navy-400 flex-shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold">{role}</div>
        <div className={`text-[13px] truncate ${name ? "text-navy-800 font-medium" : "text-gray-300 italic"}`}>
          {name || "unassigned"}
        </div>
      </div>
    </div>
  )
}

function CompletenessBlock({ c }: { c: Wp4Completeness }) {
  return (
    <div className="space-y-2">
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <ClipboardCheck className="w-3 h-3" />
          Completeness
          <span className="text-gray-400 font-normal">
            {c.is_author ? "· RealAI authors this" : "· RealAI reviews this"}
          </span>
        </span>
      </SectionLabel>

      {c.is_author ? (
        c.author_needs.length === 0 ? (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            Complete &#10003;
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] text-gray-500">
              Still owed by RealAI (as author):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.author_needs.map((need, i) => (
                <span
                  key={`${need}-${i}`}
                  className="inline-flex items-center gap-1 rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-gold-700"
                >
                  <AlertCircle className="w-3 h-3" />
                  {need}
                </span>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="space-y-2.5">
          {c.ready_to_review ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Ready to review
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] font-medium text-gray-500">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              Not written yet — nothing to review
            </div>
          )}
          <div className="grid grid-cols-1 gap-1.5">
            <CheckIndicator ok={c.outcomes_present} label="Learning outcomes present" />
            <CheckIndicator ok={c.instructions_written} label="Instructions written" />
            <CheckIndicator ok={c.materials_uploaded} label="Materials uploaded" />
          </div>
        </div>
      )}
    </div>
  )
}

function CheckIndicator({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      {ok ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
      )}
      <span className={ok ? "text-navy-800 font-medium" : "text-gray-400"}>{label}</span>
    </div>
  )
}

function WikiSectionCard({ section }: { section: Wp4WikiSection }) {
  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/70 border-b border-gray-100">
        {section.empty ? (
          <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" title="empty" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="filled" />
        )}
        <span className="flex-1 min-w-0 text-[12px] font-semibold text-navy-800 truncate">
          {section.name}
        </span>
        {!section.empty && (
          <span className="text-[10px] text-gray-400 tabular-nums flex-shrink-0">
            {section.len} ch
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        {section.empty ? (
          <div className="text-[12px] text-gray-400 italic">— empty —</div>
        ) : (
          <div className="max-h-44 overflow-y-auto text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">
            {section.text}
          </div>
        )}
      </div>
    </div>
  )
}
