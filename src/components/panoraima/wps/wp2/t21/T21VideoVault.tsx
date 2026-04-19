"use client"

import { Video, Mic, FileText, ExternalLink } from "lucide-react"
import type { Task21Detail } from "@/lib/panoraima/types"

interface Props {
  detail: Task21Detail
}

const KIND_LABEL: Record<string, string> = {
  video:      "Video",
  audio:      "Audio",
  transcript: "Transcript",
}

const KIND_COLOR: Record<string, string> = {
  video:      "#ef4444",
  audio:      "#8b5cf6",
  transcript: "#0ea5e9",
}

export default function T21VideoVault({ detail }: Props) {
  const videos = detail.video_gallery
  if (videos.length === 0) return null

  const byGroup: Record<string, typeof videos> = {
    "Irish focus groups": videos.filter(v => v.rel_path.startsWith("05_Focus Groups and Relevant Work/Irish")),
    "Dutch CEO interviews": videos.filter(v => v.rel_path.startsWith("05_Focus Groups and Relevant Work/NL")),
    "Other":              videos.filter(v =>
      !v.rel_path.startsWith("05_Focus Groups and Relevant Work/Irish") &&
      !v.rel_path.startsWith("05_Focus Groups and Relevant Work/NL")),
  }

  const totalMB = videos.reduce((n, v) => n + v.size_mb, 0)
  const totalCount = videos.length

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Video &amp; audio vault
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          {totalCount} recordings · {(totalMB / 1024).toFixed(1)} GB of primary evidence
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Focus-group and interview recordings aren&apos;t embedded here
          (each file is too large) but live on SharePoint alongside their
          transcripts. The files are classified by session.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(byGroup).map(([group, items]) => {
          if (items.length === 0) return null
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-navy-700">
                  {group}
                </h3>
                <span className="text-[11px] font-mono text-gray-400 tabular-nums">
                  {items.length} files · {items.reduce((n, i) => n + i.size_mb, 0).toFixed(0)} MB
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((v) => {
                  const Icon = v.kind === "video" ? Video : v.kind === "audio" ? Mic : FileText
                  const color = KIND_COLOR[v.kind]
                  return (
                    <a
                      key={v.rel_path}
                      href="https://stichtinghogeschoolutrecht.sharepoint.com/sites/PANORAIMA"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-gray-100 bg-white p-3 hover:bg-navy-50/30 hover:border-navy-200 transition-all flex items-center gap-3 group"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                          <span className="uppercase font-bold">{KIND_LABEL[v.kind]}</span>
                          <span>·</span>
                          <span>{v.size_mb} MB</span>
                        </div>
                        <div className="text-sm font-semibold text-navy-900 leading-tight truncate mt-0.5">
                          {v.session}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-navy-600 transition-colors flex-shrink-0" />
                    </a>
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
