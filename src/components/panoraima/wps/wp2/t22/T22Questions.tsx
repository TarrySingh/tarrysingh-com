"use client"

import { useState } from "react"
import { ChevronDown, BookOpenCheck, Users, Bot } from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"

interface Props {
  detail: Task22Detail
}

const BANDS = [
  {
    key: "Teaching methods",
    title: "Teaching methods",
    icon: BookOpenCheck,
    hue: "from-sky-400 to-sky-600",
    tagline: "How tutors teach today, how they want to teach tomorrow.",
  },
  {
    key: "Student learning",
    title: "Student learning",
    icon: Users,
    hue: "from-emerald-400 to-emerald-600",
    tagline: "Media, habits, pedagogical needs, critical-thinking risks.",
  },
  {
    key: "AI guidance",
    title: "AI guidance",
    icon: Bot,
    hue: "from-gold-400 to-gold-600",
    tagline: "How AI should be used, assessed, and governed in curricula.",
  },
]

export default function T22Questions({ detail }: Props) {
  const [openId, setOpenId] = useState<number | null>(1)

  return (
    <section>
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          The 12 questions
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          What the focus group actually asked
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Questions are verbatim from the Focus Group Report. Click a question
          to see the distilled summary of how the 17 academics answered.
        </p>
      </div>

      <div className="space-y-6">
        {BANDS.map(band => {
          const band_questions = detail.focus_group.questions.filter(q => q.band === band.key)
          return (
            <div key={band.key}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${band.hue} flex items-center justify-center text-white shadow-md`}>
                  <band.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-navy-800">
                    {band.title}
                  </h3>
                  <p className="text-[11px] text-gray-500">{band.tagline}</p>
                </div>
                <span className="ml-auto text-[10px] font-mono text-gray-400">
                  Q{band_questions[0]?.id}–Q{band_questions[band_questions.length - 1]?.id}
                </span>
              </div>

              <div className="space-y-2">
                {band_questions.map(q => {
                  const isOpen = openId === q.id
                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl border transition-all ${
                        isOpen ? "border-navy-200 bg-white shadow-sm" : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : q.id)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="font-mono text-[11px] font-bold text-gold-600 tabular-nums flex-shrink-0">
                          Q{q.id.toString().padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-sm text-navy-900 leading-snug">
                          {q.text}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-0 animate-fade-in border-t border-gray-100">
                          <div className="mt-3 rounded-lg bg-navy-50/50 border-l-2 border-gold-400 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gold-700 mb-1">
                              What they said
                            </div>
                            <p className="text-[13px] text-gray-700 leading-relaxed">
                              {q.summary}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
