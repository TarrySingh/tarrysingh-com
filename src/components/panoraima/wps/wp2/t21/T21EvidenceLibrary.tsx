"use client"

import { useState } from "react"
import {
  BookOpen, Shield, GraduationCap, Factory, Lightbulb,
  Github, Gavel, FileText, Star,
} from "lucide-react"
import type { Task21Detail, T21Topic, T21Paper } from "@/lib/panoraima/types"

interface Props {
  detail: Task21Detail
}

const BUCKET_ICONS: Record<string, typeof BookOpen> = {
  "AI regulatory & strategy": Gavel,
  "Skills & competences":     GraduationCap,
  "Industry insights":        Factory,
  "University programs":      BookOpen,
  "Training content":         Lightbulb,
  "Other governance":         Shield,
  "Github":                   Github,
}

const BUCKET_COLORS: Record<string, string> = {
  "AI regulatory & strategy": "#ef4444",
  "Skills & competences":     "#8b5cf6",
  "Industry insights":        "#f59e0b",
  "University programs":      "#06b6d4",
  "Training content":         "#10b981",
  "Other governance":         "#6366f1",
  "Github":                   "#1f2937",
}

export default function T21EvidenceLibrary({ detail }: Props) {
  const topics = detail.desktop_research.topics
  const [active, setActive] = useState<T21Topic | null>(null)

  if (topics.length === 0) return null
  const total = topics.reduce((n, t) => n + t.count, 0)

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Evidence base
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          {total} papers across 7 topic buckets
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          The literature base that grounded the Market &amp; Needs analysis.
          Click a bucket to see anchor papers and browse the full list.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {topics.map((t) => {
          const Icon = BUCKET_ICONS[t.bucket] || FileText
          const color = BUCKET_COLORS[t.bucket] || "#64748b"
          const isActive = active?.bucket === t.bucket
          return (
            <button
              key={t.bucket}
              onClick={() => setActive(isActive ? null : t)}
              className={`relative rounded-2xl p-4 text-left transition-all overflow-hidden ${
                isActive
                  ? "bg-navy-950 text-white shadow-xl scale-[1.02]"
                  : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div
                aria-hidden
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }}
              />
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                style={{
                  background: isActive ? `${color}40` : `${color}15`,
                  color: isActive ? "#ffffff" : color,
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className={`text-[10px] uppercase tracking-[0.18em] font-semibold mb-0.5 ${
                isActive ? "text-gold-300" : "text-gray-400"
              }`}>
                Bucket
              </div>
              <div className={`text-sm font-bold leading-tight mb-1 ${
                isActive ? "text-white" : "text-navy-900"
              }`}>
                {t.bucket}
              </div>
              <div className={`text-3xl font-bold tabular-nums ${
                isActive ? "text-gold-300" : "text-navy-900"
              }`}>
                {t.count}
              </div>
              {t.anchor_papers.length > 0 && (
                <div className={`mt-2 text-[10px] ${
                  isActive ? "text-navy-100/70" : "text-gray-500"
                }`}>
                  Key: {t.anchor_papers[0].slice(0, 28)}…
                </div>
              )}
            </button>
          )
        })}
      </div>

      {active && (
        <div className="rounded-2xl bg-white border border-gray-100 p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-2 h-8 rounded-full"
              style={{ background: BUCKET_COLORS[active.bucket] || "#64748b" }}
            />
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-navy-500">
                Bucket
              </div>
              <h3 className="text-lg font-bold text-navy-900 leading-tight">
                {active.bucket}
              </h3>
            </div>
            <span className="ml-auto text-[11px] font-mono text-gray-400 tabular-nums">
              {active.papers.length} papers
            </span>
          </div>

          {active.anchor_papers.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold text-gold-600 mb-2">
                <Star className="w-3 h-3" />
                Anchor papers
              </div>
              <div className="flex flex-wrap gap-2">
                {active.anchor_papers.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gold-50 border border-gold-200 text-gold-800"
                  >
                    <Star className="w-3 h-3" />
                    {p.slice(0, 48)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
            {active.papers.map((p: T21Paper) => (
              <div
                key={p.file}
                className="rounded-lg border border-gray-100 p-3 hover:bg-navy-50/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-[9px] uppercase font-bold text-gray-400">{p.ext.replace(".", "")}</span>
                  <span className="text-[10px] text-gray-400 font-mono ml-auto">{p.kb} KB</span>
                </div>
                <div className="text-[12.5px] text-navy-800 font-medium leading-snug line-clamp-2">
                  {p.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
