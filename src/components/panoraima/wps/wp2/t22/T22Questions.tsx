"use client"

import { useState } from "react"
import { ChevronDown, BookOpenCheck, Users, Bot } from "lucide-react"
import type { Task22Detail } from "@/lib/panoraima/types"
import {
  INK,
  SLATE,
  MUTE,
  FAINT,
  LINE,
  COBALT,
  COBALT_DK,
  COBALT_SOFT,
  COBALT_LINE,
  KICKER,
  NUM,
} from "../../../consortiumTokens"

interface Props {
  detail: Task22Detail
}

const BANDS = [
  {
    key: "Teaching methods",
    title: "Teaching methods",
    icon: BookOpenCheck,
    tagline: "How tutors teach today, how they want to teach tomorrow.",
  },
  {
    key: "Student learning",
    title: "Student learning",
    icon: Users,
    tagline: "Media, habits, pedagogical needs, critical-thinking risks.",
  },
  {
    key: "AI guidance",
    title: "AI guidance",
    icon: Bot,
    tagline: "How AI should be used, assessed, and governed in curricula.",
  },
]

export default function T22Questions({ detail }: Props) {
  const [openId, setOpenId] = useState<number | null>(1)

  return (
    <section>
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${KICKER}`}
          style={{ color: COBALT, borderWidth: 1, borderColor: COBALT_LINE, backgroundColor: COBALT_SOFT }}
        >
          The 12 questions
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          What the focus group actually asked
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: MUTE }}>
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
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: COBALT_SOFT, color: COBALT, borderWidth: 1, borderColor: COBALT_LINE }}
                >
                  <band.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: INK }}>
                    {band.title}
                  </h3>
                  <p className="text-[11px]" style={{ color: MUTE }}>{band.tagline}</p>
                </div>
                <span className={`ml-auto text-[10px] font-mono uppercase tracking-[0.15em] ${NUM}`} style={{ color: FAINT }}>
                  Q{band_questions[0]?.id}–Q{band_questions[band_questions.length - 1]?.id}
                </span>
              </div>

              <div className="space-y-2">
                {band_questions.map(q => {
                  const isOpen = openId === q.id
                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border bg-white transition-all"
                      style={{ borderColor: isOpen ? COBALT_LINE : LINE }}
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : q.id)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left"
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`font-mono text-[11px] font-bold flex-shrink-0 ${NUM}`}
                          style={{ color: COBALT }}
                        >
                          Q{q.id.toString().padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-sm leading-snug" style={{ color: INK }}>
                          {q.text}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform flex-shrink-0 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          style={{ color: FAINT }}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-0 animate-fade-in border-t" style={{ borderColor: LINE }}>
                          <div
                            className="mt-3 rounded-lg border-l-2 p-3"
                            style={{ backgroundColor: COBALT_SOFT, borderColor: COBALT }}
                          >
                            <div
                              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1 font-mono"
                              style={{ color: COBALT_DK }}
                            >
                              What they said
                            </div>
                            <p className="text-[13px] leading-relaxed" style={{ color: SLATE }}>
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
