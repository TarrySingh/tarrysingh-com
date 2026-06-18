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
  RUST, TRACK_ORDER, TRACK_COLOR, TRACK_SHORT, statusStyle, ROLE_LABEL, ROLE_COLOR,
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
      {/* Section header */}
      <div className="mb-8">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: RUST }}>
          Explore
        </div>
        <h2 className="text-2xl md:text-[2rem] font-bold tracking-[-0.02em] text-[#16181D]">
          Every Learning Event
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280] max-w-2xl">
          Search across all {les.length} LEs by code, title, track, author, reviewer or status.
        </p>
      </div>

      {/* Search + filters */}
      <div className="rounded-xl border border-[#E7E7EA] bg-white p-5 md:p-6 mb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search LEs by code, title, track, author, reviewer, status…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-white border border-[#E7E7EA] text-[#16181D] placeholder:text-[#9CA3AF] focus:border-[#C0492B] focus:ring-2 focus:ring-[#C0492B]/15 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {/* Track */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9CA3AF]">Track</span>
            <Chip active={track === "All"} onClick={() => setTrack("All")}>All</Chip>
            {TRACK_ORDER.map((t) => (
              <Chip key={t} active={track === t} onClick={() => setTrack(t)}>
                <span
                  className="w-1.5 h-1.5 rounded-[2px]"
                  style={{ background: TRACK_COLOR[t] ?? TRACK_COLOR.Unknown }}
                />
                {TRACK_SHORT[t] ?? t}
              </Chip>
            ))}
          </div>

          {/* Materials */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9CA3AF]">Materials</span>
            <Chip active={materials === "all"} onClick={() => setMaterials("all")}>All</Chip>
            <Chip active={materials === "with"} onClick={() => setMaterials("with")}>With files</Chip>
            <Chip active={materials === "pending"} onClick={() => setMaterials("pending")}>Pending</Chip>
          </div>

          {/* RealAI toggle */}
          <button
            onClick={() => setRealaiOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors ${
              realaiOnly
                ? "border-transparent text-white"
                : "bg-white border-[#E7E7EA] text-[#6B7280] hover:border-[#16181D]/20"
            }`}
            style={realaiOnly ? { background: RUST } : undefined}
          >
            <Sparkles className="w-3 h-3" />
            RealAI only
          </button>
        </div>

        <div className="font-mono text-[11px] text-[#9CA3AF] tabular-nums">
          Showing {shown.length} of {les.length}
          {filtered.length !== shown.length && (
            <span> &middot; {filtered.length} match the filter</span>
          )}
        </div>
      </div>

      {/* Results list */}
      <div className="rounded-xl border border-[#E7E7EA] bg-white overflow-hidden divide-y divide-[#E7E7EA]">
        {shown.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-[#9CA3AF]">
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
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#FAFAF9] transition-colors group"
            >
              <span
                className="w-2 h-2 rounded-[2px] flex-shrink-0"
                style={{ background: dot }}
                title={le.track}
              />
              <span className="font-mono text-[11px] font-bold text-[#16181D] tabular-nums w-20 flex-shrink-0">
                {le.code}
              </span>
              <span className="flex-1 min-w-0 text-sm text-[#16181D] font-medium truncate group-hover:text-[#3F434C]">
                {le.title || "Untitled"}
              </span>

              {le.realai.involved && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-[0.1em] text-white flex-shrink-0"
                  style={{ background: RUST }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  RealAI
                </span>
              )}

              <span className="hidden md:inline-flex items-center gap-1 font-mono text-[11px] text-[#9CA3AF] tabular-nums w-14 justify-end flex-shrink-0">
                <FileText className="w-3 h-3" />
                {le.materials.count}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-[0.1em] border ${ss.bg} ${ss.text} flex-shrink-0`}
              >
                <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: ss.color }} />
                {ss.label}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length > RENDER_CAP && (
        <div className="mt-4 text-center font-mono text-[11px] text-[#6B7280]">
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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
        active
          ? "bg-[#16181D] text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
        className="fixed inset-0 z-40 bg-[#16181D]/40"
        onClick={onClose}
      />
      <aside className="fixed top-0 bottom-0 right-0 z-50 w-full md:w-[480px] bg-white border-l border-[#E7E7EA] shadow-xl flex flex-col animate-[slide-in_0.4s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 bg-white border-b border-[#E7E7EA]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full border border-[#E7E7EA] text-[#6B7280] hover:bg-[#FAFAF9] hover:text-[#16181D] flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: RUST }}>{le.code}</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6B7280]">
              <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: trackColor }} />
              {le.track || "Unknown track"}
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-[-0.01em] leading-tight text-[#16181D] pr-10">{le.title || "Untitled Learning Event"}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-[0.1em] border ${ss.bg} ${ss.text}`}
            >
              <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: ss.color }} />
              {ss.label}
            </span>
            {le.realai.involved && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-[0.1em] text-white"
                style={{ background: RUST }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                RealAI
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetaCell label="Lesson type" value={le.lesson_type} icon={<FileText className="w-3 h-3" />} />
            <MetaCell label="Duration" value={le.duration} icon={<Clock className="w-3 h-3" />} />
            <MetaCell label="Due date" value={le.due_date} icon={<CalendarDays className="w-3 h-3" />} />
            <MetaCell label="Materials" value={`${le.materials.count} file${le.materials.count === 1 ? "" : "s"}`} icon={<FolderOpen className="w-3 h-3" />} />
          </div>

          {/* People */}
          <div className="space-y-2.5">
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
                  const rc = ROLE_COLOR[r.role] ?? "#6B7280"
                  return (
                    <div
                      key={`${r.role}-${i}`}
                      className="rounded-lg border border-[#E7E7EA] bg-[#FAFAF9] px-3 py-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-[2px]" style={{ background: rc }} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: rc }}>
                          {ROLE_LABEL[r.role] ?? r.role}
                        </span>
                      </div>
                      {r.recipients.length > 0 && (
                        <div className="mt-1 text-[11px] text-[#6B7280] font-mono break-all leading-relaxed">
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
              <div className="flex items-center gap-2 rounded-lg border border-[#E7E7EA] px-3 py-2">
                <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: RUST }} />
                <span className="text-[12px] text-[#3F434C] truncate">{le.lesson_plan.doc}</span>
                {le.lesson_plan.date && (
                  <span className="ml-auto font-mono text-[10px] text-[#9CA3AF] tabular-nums flex-shrink-0">{le.lesson_plan.date}</span>
                )}
              </div>
            </div>
          )}

          {/* Material files */}
          <div className="space-y-2">
            <SectionLabel>
              Material files {le.materials.count > 0 && <span className="text-[#9CA3AF] font-normal tabular-nums">({le.materials.count})</span>}
            </SectionLabel>
            {le.materials.files.length === 0 ? (
              <div className="text-[12px] text-[#9CA3AF] italic px-1">No material files indexed yet.</div>
            ) : (
              <div className="space-y-1.5">
                {le.materials.files.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-[#E7E7EA] px-3 py-2 hover:border-[#16181D]/20 transition-colors"
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 font-mono text-[9px] font-bold uppercase text-[#6B7280] flex-shrink-0">
                      {f.ext || "?"}
                    </span>
                    <span className="flex-1 min-w-0 text-[12px] text-[#3F434C] truncate">{f.name}</span>
                    <span className="font-mono text-[10px] text-[#9CA3AF] tabular-nums flex-shrink-0">
                      {Math.round(f.kb)} KB
                    </span>
                    {f.date && (
                      <span className="font-mono text-[10px] text-[#9CA3AF] tabular-nums flex-shrink-0 hidden sm:inline">
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
                  <span className="text-[#9CA3AF] font-normal tabular-nums">({le.wiki_sections.length})</span>
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
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:opacity-70"
              style={{ color: RUST }}
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
    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9CA3AF] font-semibold">
      {children}
    </div>
  )
}

function MetaCell({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#E7E7EA] px-3 py-2">
      <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#9CA3AF] font-semibold">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-[13px] text-[#16181D] font-medium tabular-nums">{value || "—"}</div>
    </div>
  )
}

function PersonRow({ icon, role, name }: { icon: React.ReactNode; role: string; name: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-[#6B7280] flex-shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9CA3AF] font-semibold">{role}</div>
        <div className={`text-[13px] truncate ${name ? "text-[#16181D] font-medium" : "text-[#C2C5CB] italic"}`}>
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
          <span className="text-[#9CA3AF] font-normal normal-case tracking-normal">
            {c.is_author ? "· RealAI authors this" : "· RealAI reviews this"}
          </span>
        </span>
      </SectionLabel>

      {c.is_author ? (
        c.author_needs.length === 0 ? (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#D2E5D9] bg-[#EEF5F0] px-3 py-2 text-[12px] font-semibold text-[#2E6A4B]">
            <CheckCircle2 className="w-4 h-4" />
            Complete &#10003;
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] text-[#6B7280]">
              Still owed by RealAI (as author):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.author_needs.map((need, i) => (
                <span
                  key={`${need}-${i}`}
                  className="inline-flex items-center gap-1 rounded border border-[#E9CFC6] bg-[#FBEAE5] px-2.5 py-1 text-[11px] font-semibold"
                  style={{ color: "#A53C22" }}
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
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#D2E5D9] bg-[#EEF5F0] px-3 py-2 text-[12px] font-semibold text-[#2E6A4B]">
              <CheckCircle2 className="w-4 h-4" />
              Ready to review
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E7EA] bg-[#FAFAF9] px-3 py-2 text-[12px] font-medium text-[#6B7280]">
              <AlertCircle className="w-4 h-4 text-[#9CA3AF]" />
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
        <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7D5E] flex-shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-[#C2C5CB] flex-shrink-0" />
      )}
      <span className={ok ? "text-[#16181D] font-medium" : "text-[#9CA3AF]"}>{label}</span>
    </div>
  )
}

function WikiSectionCard({ section }: { section: Wp4WikiSection }) {
  return (
    <div className="rounded-lg border border-[#E7E7EA] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#FAFAF9] border-b border-[#E7E7EA]">
        {section.empty ? (
          <span className="w-2 h-2 rounded-[2px] bg-[#C2C5CB] flex-shrink-0" title="empty" />
        ) : (
          <span className="w-2 h-2 rounded-[2px] bg-[#3F7D5E] flex-shrink-0" title="filled" />
        )}
        <span className="flex-1 min-w-0 text-[12px] font-semibold text-[#16181D] truncate">
          {section.name}
        </span>
        {!section.empty && (
          <span className="font-mono text-[10px] text-[#9CA3AF] tabular-nums flex-shrink-0">
            {section.len} ch
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        {section.empty ? (
          <div className="text-[12px] text-[#9CA3AF] italic">— empty —</div>
        ) : (
          <div className="max-h-44 overflow-y-auto text-[12px] text-[#4F535B] leading-relaxed whitespace-pre-line">
            {section.text}
          </div>
        )}
      </div>
    </div>
  )
}
