"use client"

import { useEffect, useId, useRef, useState } from "react"

/**
 * Sprint 10 / Dispatches v2 — in-blog diagram rendering.
 *
 * Renders a Mermaid source string to SVG, client-side, in the Synaptic
 * studio palette so diagrams read like plates, not GitHub-issue charts.
 *
 * v2: two palettes (light cream / dark navy) chosen from the nearest
 * `[data-read-mode]` ancestor (The Read's light/dark toggle). A
 * MutationObserver re-themes the diagram live when the reader flips the
 * toggle — zero per-post work; the publish flow's on-the-fly ```mermaid
 * emission is untouched.
 *
 * Mermaid is lazy-loaded so the ~280 kB ES module only ships on pages
 * that actually have a diagram. Errors render as a small editorial
 * fallback (source + parse error) rather than a blank space.
 */

interface Props {
  code: string
  /** Optional one-sentence italic caption rendered below the diagram. */
  caption?: string
}

type ReadMode = "light" | "dark"

// Light palette — the cream studio register (mirrors globals.css).
const LIGHT_THEME_VARIABLES = {
  background: "#fbf7ec",
  mainBkg: "#fdfaf2",
  secondBkg: "#f6efd9",
  tertiaryBkg: "#efe4c0",
  primaryColor: "#fdfaf2",
  primaryTextColor: "#0d1b3d",
  primaryBorderColor: "#b45309",
  lineColor: "rgba(13,27,61,0.4)",
  textColor: "#0d1b3d",
  nodeBkg: "#fdfaf2",
  nodeBorder: "#b45309",
  nodeTextColor: "#0d1b3d",
  clusterBkg: "rgba(180,134,11,0.06)",
  clusterBorder: "rgba(180,134,11,0.35)",
  edgeLabelBackground: "#fbf7ec",
  noteBkgColor: "#fffaf0",
  noteBorderColor: "#b45309",
  noteTextColor: "#0d1b3d",
  actorBkg: "#fdfaf2",
  actorBorder: "#b45309",
  actorTextColor: "#0d1b3d",
  signalColor: "rgba(13,27,61,0.55)",
  signalTextColor: "#0d1b3d",
  labelBoxBkgColor: "#fdfaf2",
  labelBoxBorderColor: "#b45309",
  labelTextColor: "#0d1b3d",
  mindmapBkg: "#fdfaf2",
} as const

// Dark palette — warm navy + cream + brightened copper (The Read dark).
const DARK_THEME_VARIABLES = {
  background: "#0c1828",
  mainBkg: "#14223b",
  secondBkg: "#1b2b47",
  tertiaryBkg: "#22344f",
  primaryColor: "#14223b",
  primaryTextColor: "#f6ead0",
  primaryBorderColor: "#e8a44a",
  lineColor: "rgba(246,234,208,0.4)",
  textColor: "#f6ead0",
  nodeBkg: "#14223b",
  nodeBorder: "#e8a44a",
  nodeTextColor: "#f6ead0",
  clusterBkg: "rgba(232,164,74,0.08)",
  clusterBorder: "rgba(232,164,74,0.4)",
  edgeLabelBackground: "#0c1828",
  noteBkgColor: "#1b2b47",
  noteBorderColor: "#e8a44a",
  noteTextColor: "#f6ead0",
  actorBkg: "#14223b",
  actorBorder: "#e8a44a",
  actorTextColor: "#f6ead0",
  signalColor: "rgba(246,234,208,0.55)",
  signalTextColor: "#f6ead0",
  labelBoxBkgColor: "#14223b",
  labelBoxBorderColor: "#e8a44a",
  labelTextColor: "#f6ead0",
  mindmapBkg: "#14223b",
} as const

function themeCSSFor(mode: ReadMode): string {
  const edge = mode === "dark" ? "rgba(246,234,208,0.72)" : "rgba(13,27,61,0.72)"
  const clusterLabel = mode === "dark" ? "#e8a44a" : "#b45309"
  return `
    .nodeLabel, .edgeLabel, .label, foreignObject div {
      font-family: 'IBM Plex Serif', Georgia, serif !important;
    }
    .nodeLabel, foreignObject div {
      font-size: 20px !important;
      line-height: 1.4 !important;
    }
    .edgeLabel {
      font-family: 'IBM Plex Mono', ui-monospace, monospace !important;
      font-size: 12px !important;
      letter-spacing: 0.06em !important;
      color: ${edge} !important;
    }
    .cluster-label .nodeLabel,
    .cluster-label foreignObject div {
      font-family: 'IBM Plex Mono', ui-monospace, monospace !important;
      font-size: 12px !important;
      letter-spacing: 0.22em !important;
      text-transform: uppercase !important;
      color: ${clusterLabel} !important;
    }
  `
}

export function MermaidDiagram({ code, caption }: Props) {
  const baseId = useId().replace(/:/g, "")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const figureRef = useRef<HTMLElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendered, setRendered] = useState(false)
  const [mode, setMode] = useState<ReadMode>("light")
  const renderSeq = useRef(0)

  // Track the nearest [data-read-mode] ancestor + re-theme on its change.
  useEffect(() => {
    const root = figureRef.current?.closest(
      "[data-read-mode]",
    ) as HTMLElement | null
    const apply = () =>
      setMode(root?.getAttribute("data-read-mode") === "dark" ? "dark" : "light")
    apply()
    if (!root) return
    const obs = new MutationObserver(apply)
    obs.observe(root, { attributes: true, attributeFilter: ["data-read-mode"] })
    return () => obs.disconnect()
  }, [])

  // Render (and re-render when code or mode changes).
  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables:
            mode === "dark" ? DARK_THEME_VARIABLES : LIGHT_THEME_VARIABLES,
          fontFamily: "'IBM Plex Serif', Georgia, serif",
          flowchart: { curve: "basis", padding: 18, htmlLabels: true },
          sequence: {
            actorFontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            actorFontSize: 13,
            messageFontFamily: "'IBM Plex Serif', Georgia, serif",
            messageFontSize: 14,
            wrap: true,
          },
          themeCSS: themeCSSFor(mode),
        })
        // Bump the render id each pass so a re-theme never collides with
        // the previous render's element ids in the document.
        renderSeq.current += 1
        const result = await mermaid.render(
          `mermaid-${baseId}-${renderSeq.current}`,
          code.trim(),
        )
        if (cancelled) return
        if (containerRef.current) {
          containerRef.current.innerHTML = result.svg
          // Strip the fixed width/height so the viewBox + width:100%
          // scale the diagram to the figure's content area (also enlarges
          // node labels for readability).
          const svg = containerRef.current.querySelector("svg")
          if (svg) {
            svg.setAttribute("role", "img")
            svg.setAttribute("aria-label", caption ?? "Diagram")
            svg.removeAttribute("width")
            svg.removeAttribute("height")
            svg.style.width = "100%"
            svg.style.height = "auto"
            svg.style.maxWidth = "100%"
          }
        }
        setRendered(true)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (!cancelled) setError(message)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [code, caption, baseId, mode])

  const dark = mode === "dark"

  return (
    <figure
      ref={figureRef}
      data-read-surface
      // Breakout — at lg/xl the figure pulls outside the max-w-3xl
      // column (48/96 px each side) so wide diagrams get room.
      className="my-10 rounded-xl border p-4 sm:p-5 lg:-mx-12 xl:-mx-24"
      style={{
        background: dark ? "#11203a" : "#fdfaf2",
        borderColor: dark ? "rgba(232,164,74,0.25)" : "rgba(180,134,11,0.18)",
        boxShadow: dark
          ? "0 1px 0 rgba(232,164,74,0.08)"
          : "0 1px 0 rgba(180,134,11,0.08)",
      }}
    >
      {error ? (
        <div
          className="text-xs text-rose-600"
          style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        >
          <p className="mb-2 font-semibold">Mermaid render error:</p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-rose-50 p-3 text-rose-700">
            {error}
          </pre>
          <details className="mt-2 opacity-70">
            <summary>Source</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-rose-50 p-3 text-[10.5px] text-rose-700">
              {code}
            </pre>
          </details>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex justify-center"
          aria-busy={!rendered}
        />
      )}
      {caption && !error ? (
        <figcaption
          className="mt-4 text-center text-[0.9rem] italic"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            lineHeight: 1.55,
            color: dark ? "rgba(246,234,208,0.66)" : "rgba(13,27,61,0.6)",
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
