"use client"

import { useState } from "react"
import {
  BookOpen, Compass, PenTool, Rocket, CheckCircle, Database, Cpu,
  AlertOctagon,
} from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"
import {
  INK, SLATE, MUTE, COBALT, NAVY_2, OK, WARN, BAD, KICKER, NUM,
} from "../../../consortiumTokens"

interface Props {
  detail: Task22Detail
}

const CATEGORY_ICON: Record<string, typeof BookOpen> = {
  "book-open":    BookOpen,
  "compass":      Compass,
  "pen-tool":     PenTool,
  "rocket":       Rocket,
  "check-circle": CheckCircle,
  "database":     Database,
  "cpu":          Cpu,
}

const THEORY_ACCENT: Record<string, string> = {
  TPACK:   COBALT,
  Bloom:   NAVY_2,
  Marzano: OK,
  ADDIE:   WARN,
  Kolb:    SLATE,
}

export default function T22PedagogicFramework({ detail }: Props) {
  const pf = detail.pedagogic_framework
  const [activeTheory, setActiveTheory] = useState<string>(pf.learning_theories[0]?.id ?? "")
  const active = pf.learning_theories.find(t => t.id === activeTheory) ?? pf.learning_theories[0]

  return (
    <section>
      <div className="mb-6">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${KICKER} text-[10px] text-[#6B7686] border border-[#E3E7ED] bg-[#F7F8FA]`}>
          Pedagogic framework · distilled from the {pf.source_slide_count}-slide deck
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-[#0A1F33]">
          The learning theories PANORAIMA is aligning to
        </h2>
        <p className="mt-1 text-sm text-[#6B7686] max-w-xl">
          Distilled from UNIWA&apos;s <code className="font-mono text-[11px]">WP2-T2.2.pptx</code>
          &nbsp;master deck. Pick a theory to see how it maps onto the PANORAIMA
          curriculum design.
        </p>
      </div>

      {/* 5 learning theory chips + active panel */}
      <div className="rounded-3xl border border-[#E3E7ED] bg-white p-5 md:p-6 mb-8">
        <div className="flex flex-wrap gap-2 mb-5">
          {pf.learning_theories.map(t => {
            const isActive = t.id === active.id
            const accent = THEORY_ACCENT[t.id] ?? MUTE
            return (
              <button
                key={t.id}
                onClick={() => setActiveTheory(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                  isActive
                    ? "text-white"
                    : "text-[#0A1F33] bg-[#F7F8FA] hover:bg-[#EEF1F5]"
                }`}
                style={isActive ? { background: accent } : undefined}
              >
                <span className="font-mono font-bold mr-1.5 opacity-80">{t.acronym}</span>
                <span className="opacity-90">· slide {t.slide}</span>
              </button>
            )
          })}
        </div>

        {active && (
          <div className="animate-fade-in grid md:grid-cols-5 gap-5">
            <div className="md:col-span-3">
              <h3 className="text-lg font-bold text-[#0A1F33]">{active.full_name}</h3>
              <p className="mt-2 text-[13.5px] text-[#51607A] italic leading-relaxed">
                {active.tagline}
              </p>
              <div className="mt-4 rounded-xl bg-[#EEF2FF] border-l-2 border-[#2251FF] p-4">
                <div className={`${KICKER} text-[10px] text-[#2251FF] mb-1`}>
                  Why PANORAIMA uses it
                </div>
                <p className="text-[13px] text-[#51607A] leading-relaxed">{active.why}</p>
              </div>
            </div>
            <div className="md:col-span-2">
              <TheoryGlyph id={active.id} accent={THEORY_ACCENT[active.id] ?? MUTE} />
            </div>
          </div>
        )}
      </div>

      {/* Modern learning schools */}
      <div className="mb-8">
        <h3 className={`${KICKER} text-[10px] text-[#6B7686] mb-3`}>
          Modern learning schools — three lenses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pf.modern_learning_schools.map((s, i) => {
            const accent = [COBALT, OK, NAVY_2][i] ?? MUTE
            return (
              <div
                key={s.name}
                className="rounded-2xl border border-[#E3E7ED] bg-white p-5 hover:border-[#C9D4FF] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: accent }}
                  />
                  <h4 className="text-sm font-bold text-[#0A1F33]">{s.name}</h4>
                </div>
                <p className="text-[12.5px] text-[#51607A] leading-snug mb-3 italic">
                  {s.tagline}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {s.examples.map(ex => (
                    <span
                      key={ex}
                      className="px-2 py-0.5 rounded-md text-[10.5px] font-mono bg-[#F7F8FA] border border-[#E3E7ED] text-[#51607A]"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI skill categories strip */}
      <div className="mb-8">
        <h3 className={`${KICKER} text-[10px] text-[#6B7686] mb-3`}>
          AI skill categories — the 7 buckets
        </h3>
        <div className="flex flex-wrap gap-2">
          {pf.ai_skill_categories.map((c) => {
            const Icon = CATEGORY_ICON[c.icon] ?? BookOpen
            return (
              <div
                key={c.name}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E3E7ED] bg-white text-[12.5px] font-semibold text-[#0A1F33] hover:border-[#C9D4FF] transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-[#2251FF]" />
                {c.name}
              </div>
            )
          })}
        </div>
      </div>

      {/* Learning outcomes triptych */}
      <div className="mb-8 rounded-3xl bg-[#F7F8FA] border border-[#E3E7ED] p-6">
        <h3 className={`${KICKER} text-[10px] text-[#6B7686] mb-4`}>
          Learning outcomes · Trilianos (2004)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pf.learning_outcomes.map((lo, i) => {
            const accent = [COBALT, OK, NAVY_2][i] ?? MUTE
            return (
              <div key={lo.type} className="rounded-2xl bg-white border border-[#E3E7ED] p-5 text-center">
                <div
                  className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm ${NUM}`}
                  style={{ background: accent }}
                >
                  {lo.question}
                </div>
                <div className="mt-3 text-sm font-bold text-[#0A1F33]">{lo.type}</div>
                <div className="text-[11px] text-[#6B7686]">{lo.domain}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Critical risks */}
      <div>
        <h3 className={`${KICKER} text-[10px] text-[#6B7686] mb-3 flex items-center gap-2`}>
          <AlertOctagon className="w-3 h-3" style={{ color: BAD }} />
          Critical risks acknowledged
        </h3>
        <div className="space-y-2">
          {pf.critical_risks.map(r => (
            <div key={r.id} className="rounded-xl border p-4 flex items-start gap-3" style={{ borderColor: "#F7E9E6", background: "#F7E9E6" + "66" }}>
              <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 ${NUM}`} style={{ background: BAD }}>
                R{r.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#0A1F33] leading-tight">{r.title}</div>
                <p className="mt-1 text-[12.5px] text-[#51607A] leading-snug">
                  <span className="font-semibold" style={{ color: BAD }}>Action:</span> {r.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Tiny illustrative SVG glyphs for each learning theory.
function TheoryGlyph({ id, accent }: { id: string; accent: string }) {
  if (id === "TPACK") {
    return (
      <svg viewBox="0 0 220 180" className="w-full h-auto">
        <circle cx="80" cy="80"  r="55" fill={accent} fillOpacity="0.25" stroke={accent} />
        <circle cx="140" cy="80" r="55" fill={NAVY_2} fillOpacity="0.25" stroke={NAVY_2} />
        <circle cx="110" cy="125" r="55" fill={OK} fillOpacity="0.25" stroke={OK} />
        <text x="55" y="50" fontSize="10" fontWeight="700" fill={accent}>T</text>
        <text x="155" y="50" fontSize="10" fontWeight="700" fill={NAVY_2}>P</text>
        <text x="105" y="165" fontSize="10" fontWeight="700" fill={OK}>C</text>
      </svg>
    )
  }
  if (id === "Bloom") {
    const levels = ["Create", "Evaluate", "Analyse", "Apply", "Understand", "Remember"]
    return (
      <svg viewBox="0 0 220 180" className="w-full h-auto">
        {levels.map((lv, i) => {
          const y = 30 + i * 22
          const w = 40 + i * 26
          return (
            <g key={lv}>
              <rect
                x={110 - w / 2} y={y} width={w} height={18}
                fill={accent} fillOpacity={0.15 + i * 0.12} stroke={accent}
              />
              <text x="110" y={y + 12} textAnchor="middle" fontSize="9" fontWeight="600" fill={INK}>
                {lv}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }
  if (id === "ADDIE") {
    const stages = ["Analyse", "Design", "Develop", "Implement", "Evaluate"]
    return (
      <svg viewBox="0 0 240 80" className="w-full h-auto">
        {stages.map((s, i) => (
          <g key={s}>
            <rect x={2 + i * 47} y={20} width={40} height={40} rx={6}
              fill={accent} fillOpacity={0.2} stroke={accent} />
            <text x={22 + i * 47} y={45} textAnchor="middle" fontSize="8" fontWeight="600" fill={INK}>
              {s.slice(0, 4)}
            </text>
            {i < stages.length - 1 && (
              <path d={`M ${42 + i * 47},40 L ${49 + i * 47},40`} stroke={accent} strokeWidth="2" markerEnd="url(#arrow)" />
            )}
          </g>
        ))}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={accent} />
          </marker>
        </defs>
      </svg>
    )
  }
  if (id === "Kolb") {
    const stages = ["Experience", "Reflect", "Conceptualise", "Experiment"]
    return (
      <svg viewBox="0 0 220 220" className="w-full h-auto">
        <circle cx="110" cy="110" r="70" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="4 4" />
        {stages.map((s, i) => {
          const angle = (i / stages.length) * Math.PI * 2 - Math.PI / 2
          const x = 110 + Math.cos(angle) * 70
          const y = 110 + Math.sin(angle) * 70
          return (
            <g key={s}>
              <circle cx={x} cy={y} r="14" fill={accent} />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">{i + 1}</text>
              <text x={x} y={y + 28} textAnchor="middle" fontSize="9" fontWeight="600" fill={INK}>{s}</text>
            </g>
          )
        })}
      </svg>
    )
  }
  // Marzano fallback
  return (
    <svg viewBox="0 0 220 180" className="w-full h-auto">
      <g transform="translate(20, 20)">
        {[0, 1, 2, 3].map(i => (
          <g key={i} transform={`translate(${(i % 2) * 90}, ${Math.floor(i / 2) * 70})`}>
            <rect width="80" height="55" rx="10" fill={accent} fillOpacity="0.2" stroke={accent} />
            <text x="40" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill={INK}>Group {i + 1}</text>
            <text x="40" y="42" textAnchor="middle" fontSize="8" fill={SLATE}>6 skills</text>
          </g>
        ))}
      </g>
    </svg>
  )
}
