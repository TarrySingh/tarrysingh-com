"use client"

import { HardDriveDownload, FileVideo, ExternalLink } from "lucide-react"
import type { LargeFilesManifest } from "@/lib/panoraima/types"
import { INK, SLATE, MUTE, FAINT, LINE, SURFACE, COBALT, COBALT_SOFT, COBALT_LINE } from "../consortiumTokens"

const WP_LABEL: Record<string, string> = {
  WP1: "WP1 · Project management", WP2: "WP2 · Market & needs", WP3: "WP3 · Competences",
  WP4: "WP4 · Curriculum", WP5: "WP5 · Quality", WP6: "WP6 · Ethics", WP7: "WP7 · Dissemination",
}

// Where to open the consortium SharePoint document library.
const SHAREPOINT_URL =
  "https://hogeschoolutrecht.sharepoint.com/sites/ext_Onderwijs_panoraima/Gedeelde%20documenten"

export default function LargeFilesNotice({ manifest }: { manifest: LargeFilesManifest }) {
  if (!manifest?.total) return null
  const wps = Object.keys(manifest.by_wp).sort()

  return (
    <div className="mt-12 rounded-2xl border p-5 md:p-7" style={{ borderColor: LINE, background: SURFACE }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: COBALT }}>
            <HardDriveDownload className="w-3.5 h-3.5" />
            Large files · SharePoint only
          </div>
          <h3 className="text-[18px] font-bold tracking-[-0.01em]" style={{ color: INK }}>
            {manifest.total} files over {manifest.threshold_mb} MB
            <span className="ml-2 font-mono text-[13px] tabular-nums" style={{ color: FAINT }}>
              {manifest.total_gb} GB
            </span>
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed max-w-2xl" style={{ color: SLATE }}>
            Recordings &amp; videos are skipped by default syncs (they grow over time), they live in the
            consortium SharePoint. Look them up there.
          </p>
        </div>
        <a
          href={SHAREPOINT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white transition-colors"
          style={{ background: COBALT }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open SharePoint
        </a>
      </div>

      <div className="mt-5 space-y-4">
        {wps.map((wp) => (
          <div key={wp}>
            <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: MUTE }}>
              {WP_LABEL[wp] ?? wp}
              <span className="ml-1.5 tabular-nums" style={{ color: FAINT }}>· {manifest.by_wp[wp].length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {manifest.by_wp[wp].map((f) => (
                <div
                  key={f.rel}
                  className="flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2"
                  style={{ borderColor: LINE }}
                  title={f.rel}
                >
                  <FileVideo className="w-4 h-4 flex-shrink-0" style={{ color: FAINT }} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium" style={{ color: INK }}>
                    {f.name}
                  </span>
                  {f.local && (
                    <span
                      className="hidden sm:inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: COBALT, background: COBALT_SOFT, border: `1px solid ${COBALT_LINE}` }}
                    >
                      synced
                    </span>
                  )}
                  <span className="font-mono text-[11px] tabular-nums flex-shrink-0" style={{ color: MUTE }}>
                    {f.mb >= 1024 ? `${(f.mb / 1024).toFixed(1)} GB` : `${Math.round(f.mb)} MB`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
