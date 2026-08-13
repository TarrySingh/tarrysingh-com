"use client"

import { useState } from "react"
import { Video, Mic, FileText, Sheet as SheetIcon, Quote } from "lucide-react"
import type { Task21Detail } from "@/lib/panoraima/types"
import {
  NAVY_2,
  INK,
  SLATE,
  MUTE,
  FAINT,
  LINE,
  SURFACE,
  COBALT,
  COBALT_SOFT,
  COBALT_LINE,
  OK,
  KICKER,
} from "../../../consortiumTokens"

interface Props {
  detail: Task21Detail
}

const FLAGS: Record<string, string> = {
  ireland: "🇮🇪",
  netherlands: "🇳🇱",
  hamburg: "🇩🇪",
  greece: "🇬🇷",
}

const COUNTRY_LABELS: Record<string, string> = {
  ireland: "Ireland",
  netherlands: "Netherlands",
  hamburg: "Germany (Hamburg)",
  greece: "Greece",
}

const METHOD_SUMMARY: Record<string, string> = {
  ireland: "Five dated focus-group sessions, video-recorded and transcribed. A 67-organisation stakeholder register drives the outreach funnel.",
  netherlands: "Seven CEO 1-1 interviews captured via Otter.ai (video + audio + transcript), synthesised into one consolidated qualitative report.",
  hamburg: "Five written interview reports (AR, BT, JS, LH, MI) + one consolidated focus-group summary. Text-first methodology.",
  greece: "Desktop-research-driven: 148 research rows, 31 academia survey responses, 28 SME interviews, all in spreadsheet form.",
}

export default function T21Methodology({ detail }: Props) {
  const [active, setActive] = useState<keyof typeof FLAGS>("ireland")

  return (
    <section>
      <div className="mb-5">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${KICKER}`}
          style={{ color: COBALT, border: `1px solid ${COBALT_LINE}`, background: COBALT_SOFT }}
        >
          Methodology
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold" style={{ color: INK }}>
          Four countries, four research modes
        </h2>
        <p className="mt-1 text-sm max-w-xl" style={{ color: SLATE }}>
          Each working group designed its own evidence-gathering approach.
          That heterogeneity is a feature, different stakeholder classes
          respond to different instruments.
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(FLAGS) as Array<keyof typeof FLAGS>).map((k) => {
          const isActive = k === active
          return (
            <button
              key={k}
              onClick={() => setActive(k)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all"
              style={
                isActive
                  ? { background: NAVY_2, color: "#FFFFFF", borderColor: NAVY_2 }
                  : { background: "#FFFFFF", color: SLATE, borderColor: LINE }
              }
            >
              <span className="text-lg" aria-hidden>{FLAGS[k]}</span>
              <span className="font-semibold text-sm">{COUNTRY_LABELS[k]}</span>
            </button>
          )
        })}
      </div>

      <div
        className="rounded-2xl border bg-white p-6 md:p-8 animate-fade-in"
        style={{ borderColor: LINE }}
      >
        <p
          className="text-[13px] leading-relaxed mb-6 border-l-2 pl-4 italic"
          style={{ color: SLATE, borderColor: COBALT }}
        >
          {METHOD_SUMMARY[active]}
        </p>

        {active === "ireland"     && <IrelandPanel detail={detail} />}
        {active === "netherlands" && <NetherlandsPanel detail={detail} />}
        {active === "hamburg"     && <HamburgPanel detail={detail} />}
        {active === "greece"      && <GreecePanel detail={detail} />}
      </div>
    </section>
  )
}

function IrelandPanel({ detail }: { detail: Task21Detail }) {
  const ie = detail.working_groups.ireland
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Sessions" value={ie.sessions.length} />
        <Stat label="Register rows" value={ie.stakeholder_register.focus_groups.length} />
        <Stat label="Surveys" value={ie.stakeholder_register.surveys.length} />
        <Stat label="Video (MB)"
              value={ie.sessions.reduce((n, s) => n + (s.recording_mb ?? 0), 0)} />
      </div>
      <div className="space-y-3">
        {ie.sessions.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border p-4 transition-colors"
            style={{ borderColor: LINE }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: MUTE }}>
                  {s.date && <span className="tabular-nums">{s.date}</span>}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: COBALT_SOFT, color: COBALT }}
                  >
                    {s.kind}
                  </span>
                </div>
                <div className="mt-1 font-semibold" style={{ color: INK }}>{s.focus}</div>
                {s.report_excerpt && (
                  <p
                    className="mt-2 text-[12.5px] italic line-clamp-2 border-l-2 pl-3"
                    style={{ color: SLATE, borderColor: COBALT }}
                  >
                    &ldquo;{s.report_excerpt.slice(0, 180)}…&rdquo;
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] flex-shrink-0" style={{ color: FAINT }}>
                {s.recording_mb ? (
                  <span className="inline-flex items-center gap-1" title={`${s.recording_mb} MB recording`}>
                    <Video className="w-3.5 h-3.5" /> {s.recording_mb} MB
                  </span>
                ) : null}
                {s.has_transcript && (
                  <span className="inline-flex items-center gap-1" title="Transcript available">
                    <FileText className="w-3.5 h-3.5" /> transcript
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NetherlandsPanel({ detail }: { detail: Task21Detail }) {
  const nl = detail.working_groups.netherlands
  const real = nl.interviews.filter(i => !i.empty)
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="CEOs interviewed" value={real.length} />
        <Stat label="Transcripts" value={real.filter(i => i.has_transcript).length} />
        <Stat label="Audio (min est.)"
              value={Math.round(real.reduce((n, i) => n + (i.audio_mb ?? 0), 0) / 0.5)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {nl.interviews.map((iv, i) => {
          const initials = iv.interviewee.replace(/([a-z])([A-Z])/g, "$1 $2")
          return (
            <div
              key={i}
              className="rounded-xl border p-4 transition-colors"
              style={{
                borderColor: LINE,
                background: iv.empty ? SURFACE : "#FFFFFF",
                opacity: iv.empty ? 0.7 : 1,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: NAVY_2 }}
                >
                  {initials.split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: INK }}>
                    {initials}
                  </div>
                  <div className="text-[11px]" style={{ color: MUTE }}>
                    {iv.role ? `${iv.role} · ` : ""}{iv.company}
                  </div>
                  {iv.empty ? (
                    <div className="mt-2 text-[11px] italic" style={{ color: FAINT }}>
                      Folder exists, no interview materials yet.
                    </div>
                  ) : (
                    <>
                      {iv.quotes && iv.quotes.length > 0 && iv.quotes[0] && (
                        <div
                          className="mt-2 text-[12px] italic line-clamp-2 border-l-2 pl-2.5"
                          style={{ color: SLATE, borderColor: COBALT }}
                        >
                          &ldquo;{iv.quotes[0].slice(0, 150)}…&rdquo;
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-[10px] font-mono tabular-nums" style={{ color: FAINT }}>
                        {iv.recording_mb ? (
                          <span className="inline-flex items-center gap-1">
                            <Video className="w-3 h-3" /> {iv.recording_mb} MB
                          </span>
                        ) : null}
                        {iv.audio_mb ? (
                          <span className="inline-flex items-center gap-1">
                            <Mic className="w-3 h-3" /> {iv.audio_mb} MB
                          </span>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {nl.consolidated_report_excerpt && (
        <div className="mt-6 rounded-xl border p-4" style={{ background: SURFACE, borderColor: LINE }}>
          <div
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] font-bold mb-2"
            style={{ color: COBALT }}
          >
            <Quote className="w-3 h-3" />
            Consolidated SME qualitative report
          </div>
          <p className="text-[13px] italic leading-relaxed line-clamp-4" style={{ color: SLATE }}>
            &ldquo;{nl.consolidated_report_excerpt.slice(0, 400)}…&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}

function HamburgPanel({ detail }: { detail: Task21Detail }) {
  const hb = detail.working_groups.hamburg
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat label="Interview reports" value={hb.interviews.length} />
        <Stat label="Total words"
              value={hb.interviews.reduce((n, i) => n + (i.word_count ?? 0), 0)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {hb.interviews.map((iv, i) => (
          <div
            key={i}
            className="rounded-xl border bg-white p-4 transition-colors"
            style={{ borderColor: LINE }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: NAVY_2 }}
              >
                {iv.code}
              </div>
              <div className="text-[11px] font-mono tabular-nums" style={{ color: MUTE }}>
                {iv.word_count} words
              </div>
            </div>
            {iv.excerpt && (
              <p className="text-[12px] leading-snug italic line-clamp-3" style={{ color: SLATE }}>
                &ldquo;{iv.excerpt.slice(0, 180)}…&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>
      {hb.focus_group_excerpt && (
        <div className="mt-6 rounded-xl border p-4" style={{ background: SURFACE, borderColor: LINE }}>
          <div
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] font-bold mb-2"
            style={{ color: COBALT }}
          >
            <Quote className="w-3 h-3" />
            Consolidated focus group report
          </div>
          <p className="text-[13px] italic leading-relaxed line-clamp-4" style={{ color: SLATE }}>
            &ldquo;{hb.focus_group_excerpt.slice(0, 400)}…&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}

function GreecePanel({ detail }: { detail: Task21Detail }) {
  const gr = detail.working_groups.greece
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Spreadsheets" value={gr.spreadsheets.length} />
        <Stat label="Total rows"
              value={gr.spreadsheets.reduce((n, s) => n + (s.row_count ?? 0), 0)} />
        <Stat label="Unique columns"
              value={new Set(gr.spreadsheets.flatMap(s => s.headers)).size} />
      </div>
      <div className="space-y-3">
        {gr.spreadsheets.map((s, i) => (
          <div key={i} className="rounded-xl border bg-white p-4" style={{ borderColor: LINE }}>
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SheetIcon className="w-3.5 h-3.5" style={{ color: OK }} />
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider font-bold"
                    style={{ color: OK }}
                  >
                    Spreadsheet
                  </span>
                  {s.wg && (
                    <span
                      className="font-mono text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: COBALT_SOFT, color: COBALT, border: `1px solid ${COBALT_LINE}` }}
                    >
                      GR Working Group
                    </span>
                  )}
                </div>
                <div className="font-semibold text-sm" style={{ color: INK }}>{s.title}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold tabular-nums" style={{ color: INK }}>{s.row_count}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: FAINT }}>rows</div>
              </div>
            </div>
            {s.headers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {s.headers.slice(0, 8).map((h, hi) => (
                  <span
                    key={hi}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                    style={{ background: SURFACE, borderColor: LINE, color: SLATE }}
                  >
                    {h}
                  </span>
                ))}
                {s.headers.length > 8 && (
                  <span className="text-[10px]" style={{ color: FAINT }}>+{s.headers.length - 8}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3" style={{ background: SURFACE, borderColor: LINE }}>
      <div
        className="font-mono text-[10px] uppercase tracking-[0.15em] font-semibold"
        style={{ color: MUTE }}
      >
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: INK }}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}
