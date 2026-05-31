"use client"

import type { PlateContent } from "@/lib/synaptic/types"

/**
 * Copy preview for the plate editor. Renders the PlateContent being edited in
 * the Synaptic plate palette (navy / cream / copper) so changes are visible
 * live. This previews the COPY, not the rendered geometry — the real plate
 * visual (canvas/SVG layout) is on the live page, linked at the top.
 */
export function PlatePreview({
  content,
  previewPath,
}: {
  content: PlateContent
  previewPath?: string
}) {
  const MONO = "var(--font-mono), 'IBM Plex Mono', monospace"
  const SERIF = "var(--font-serif), 'IBM Plex Serif', serif"

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "#1f3350", background: "#0c1828" }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-2.5"
        style={{ borderColor: "#1f3350", background: "#0a1422" }}
      >
        <span
          className="text-[9.5px] font-semibold uppercase tracking-[0.28em]"
          style={{ fontFamily: MONO, color: "#c98e4f" }}
        >
          Copy preview
        </span>
        {previewPath && (
          <a
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9.5px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
            style={{ fontFamily: MONO, color: "#8aa0bd" }}
          >
            Open live plate ↗
          </a>
        )}
      </div>

      <div className="px-5 py-5">
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.26em]"
          style={{ fontFamily: MONO, color: "#c98e4f" }}
        >
          {content.displayName || "Untitled plate"}
        </div>
        {content.hint && (
          <p
            className="mt-2 text-[13px] italic leading-relaxed"
            style={{ fontFamily: SERIF, color: "#cdd9ea" }}
          >
            {content.hint}
          </p>
        )}

        {content.annotations && content.annotations.length > 0 && (
          <ol className="mt-5 space-y-4">
            {content.annotations.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{
                    fontFamily: MONO,
                    color: "#0c1828",
                    background: a.color || "#c98e4f",
                  }}
                >
                  {a.id}
                </span>
                <div className="min-w-0">
                  <div
                    className="text-[14px] leading-snug"
                    style={{ fontFamily: SERIF, color: "#f6ead0", fontWeight: 600 }}
                  >
                    {a.title || <span style={{ color: "#5a6e8c" }}>(untitled)</span>}
                  </div>
                  {a.subtitle && (
                    <div
                      className="mt-0.5 text-[10px] uppercase tracking-[0.14em]"
                      style={{ fontFamily: MONO, color: "#8aa0bd" }}
                    >
                      {a.subtitle}
                    </div>
                  )}
                  {a.body && (
                    <p
                      className="mt-1.5 text-[12.5px] leading-relaxed"
                      style={{ fontFamily: SERIF, color: "#cdd9ea" }}
                    >
                      {a.body}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {content.captions && content.captions.length > 0 && (
          <ul className="mt-5 space-y-2">
            {content.captions.map((c) => (
              <li
                key={c.id}
                className="border-l-2 pl-3 text-[12.5px] leading-relaxed"
                style={{ borderColor: "#c98e4f", fontFamily: SERIF, color: "#cdd9ea" }}
              >
                {c.text || <span style={{ color: "#5a6e8c" }}>(empty caption)</span>}
              </li>
            ))}
          </ul>
        )}

        {content.prose && content.prose.length > 0 && (
          <div className="mt-5 space-y-3">
            {content.prose.map((block) => (
              <div key={block.id}>
                {block.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="mb-2 text-[12.5px] leading-relaxed"
                    style={{ fontFamily: SERIF, color: "#cdd9ea" }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {content.ariaLabel && (
          <p
            className="mt-6 border-t pt-3 text-[10.5px] leading-relaxed"
            style={{ borderColor: "#1f3350", fontFamily: MONO, color: "#5a6e8c" }}
          >
            <span style={{ color: "#7d92b0" }}>aria · </span>
            {content.ariaLabel}
          </p>
        )}
      </div>
    </div>
  )
}
