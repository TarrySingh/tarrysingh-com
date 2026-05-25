"use client"

import { useEffect, useId, useRef, useState } from "react"

/**
 * Sprint 10 — in-blog diagram rendering for Dispatches.
 *
 * Renders a Mermaid source string to SVG, client-side, with the
 * Synaptic-cream studio palette so diagrams feel like plates and not
 * GitHub-issue charts.
 *
 * Used by mdx-components.tsx via the auto-wired Pre/code path —
 * triple-backtick `mermaid` fenced blocks in a .mdx become this
 * component at render time.
 *
 * Mermaid is lazy-loaded so the ~280 kB ES module only ships on pages
 * that actually have a diagram. Lazy import keeps the rest of /blog
 * fast.
 *
 * Errors render as a small editorial-looking fallback (the source as
 * a mono code block + the parse error) rather than a blank space —
 * Tarry should be able to spot a malformed diagram in preview.
 */

interface Props {
  code: string
  /** Optional one-sentence italic caption rendered below the diagram. */
  caption?: string
}

// Studio-palette tokens (mirror src/app/globals.css)
const STUDIO_THEME_VARIABLES = {
  // Backgrounds
  background: "#fbf7ec",
  mainBkg: "#fdfaf2",
  secondBkg: "#f6efd9",
  tertiaryBkg: "#efe4c0",
  // Text / lines
  primaryColor: "#fdfaf2",
  primaryTextColor: "#0d1b3d",
  primaryBorderColor: "#b45309",
  lineColor: "rgba(13,27,61,0.4)",
  textColor: "#0d1b3d",
  // Nodes
  nodeBkg: "#fdfaf2",
  nodeBorder: "#b45309",
  nodeTextColor: "#0d1b3d",
  // Clusters / subgraphs
  clusterBkg: "rgba(180,134,11,0.06)",
  clusterBorder: "rgba(180,134,11,0.35)",
  // Edge labels
  edgeLabelBackground: "#fbf7ec",
  // Notes
  noteBkgColor: "#fffaf0",
  noteBorderColor: "#b45309",
  noteTextColor: "#0d1b3d",
  // Sequence diagrams
  actorBkg: "#fdfaf2",
  actorBorder: "#b45309",
  actorTextColor: "#0d1b3d",
  signalColor: "rgba(13,27,61,0.55)",
  signalTextColor: "#0d1b3d",
  labelBoxBkgColor: "#fdfaf2",
  labelBoxBorderColor: "#b45309",
  labelTextColor: "#0d1b3d",
  // Mindmap
  mindmapBkg: "#fdfaf2",
} as const

export function MermaidDiagram({ code, caption }: Props) {
  const id = useId().replace(/:/g, "")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: STUDIO_THEME_VARIABLES,
          fontFamily:
            "'IBM Plex Serif', Georgia, serif",
          flowchart: {
            curve: "basis",
            padding: 18,
            htmlLabels: true,
          },
          sequence: {
            actorFontFamily:
              "'IBM Plex Mono', ui-monospace, monospace",
            actorFontSize: 13,
            messageFontFamily:
              "'IBM Plex Serif', Georgia, serif",
            messageFontSize: 14,
            wrap: true,
          },
          themeCSS: `
            /*
             * Node label sizing — 2026-05-26 round 2.
             * 18 px wasn't enough for the wide multi-row diagrams once
             * the SVG scaled down to fit even the new lg/xl breakout
             * width. 20 px on the natural render + the figure breakout
             * (see <figure className=…>) gives ~17 px effective inside
             * the three-ways failure-chain diagram on xl screens and
             * 20 px native on diagrams that fit the column natively
             * (org graph, PE compounding).
             */
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
              color: rgba(13, 27, 61, 0.72) !important;
            }
            .cluster-label .nodeLabel,
            .cluster-label foreignObject div {
              font-family: 'IBM Plex Mono', ui-monospace, monospace !important;
              font-size: 12px !important;
              letter-spacing: 0.22em !important;
              text-transform: uppercase !important;
              color: #b45309 !important;
            }
          `,
        })
        const result = await mermaid.render(`mermaid-${id}`, code.trim())
        if (cancelled) return
        if (containerRef.current) {
          containerRef.current.innerHTML = result.svg
          // Make the SVG fluid + accessibility-friendly.
          //
          // Mermaid emits SVG with a fixed `width` attribute (e.g.
          // width="640") which caps the diagram at its natural laid-out
          // size — so an 800-px diagram sits at 800 px inside a 1000-px
          // figure with empty margins either side. We strip the width
          // and height attributes and let the viewBox + width:100%
          // scale the diagram up to the figure's content area, which
          // also enlarges the node labels for readability. Captioned
          // 2026-05-26 after Tarry called out small diagrams in the
          // editor preview.
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
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (!cancelled) setError(message)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [code, id, caption])

  return (
    <figure
      // Breakout — at lg (1024 px+) the figure pulls 48 px outside the
      // max-w-3xl (768 px) article column on each side, at xl (1280 px+)
      // it pulls 96 px outside. Net widths: 768 → 864 → 960 px. Gives
      // wide diagrams (multi-row failure chains, multi-portco grids)
      // enough horizontal room that the SVG scale-down doesn't crush
      // the labels. Studio editor preview-pane width is also lg+, but
      // its preview container is narrower than the article column, so
      // the same -mx values would extend the figure beyond the pane.
      // The overflow is fine for layout purposes (preview is for
      // editing readability, not pixel-perfect production match).
      className="my-10 rounded-xl border border-gold-200/60 bg-[#fdfaf2] p-4 sm:p-5 lg:-mx-12 xl:-mx-24"
      style={{ boxShadow: "0 1px 0 rgba(180,134,11,0.08)" }}
    >
      {error ? (
        <div
          className="text-xs text-rose-700"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          <p className="mb-2 font-semibold">Mermaid render error:</p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-rose-50 p-3">
            {error}
          </pre>
          <details className="mt-2 opacity-70">
            <summary>Source</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-rose-50 p-3 text-[10.5px]">
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
          className="mt-4 text-center text-[0.9rem] italic text-navy-600"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            lineHeight: 1.55,
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
