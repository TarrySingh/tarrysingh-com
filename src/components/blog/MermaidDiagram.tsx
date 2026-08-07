"use client"

import { useEffect, useId, useRef, useState } from "react"

/**
 * Sprint 10 / Dispatches v2 — in-blog diagram rendering.
 *
 * Renders a Mermaid source string to SVG, client-side, themed to match The
 * Read it sits in — so diagrams read like plates, not GitHub-issue charts.
 *
 * v3: the palette is READ from the nearest `[data-read-mode]` ancestor's
 * `--read-*` CSS tokens instead of being hard-coded. So the diagram follows
 * whatever the reader wears — /blog's "Slate" (slate paper + indigo/periwinkle)
 * or /synaptic's own register — with zero per-surface work, and stays correct
 * for any future repaint. A MutationObserver re-renders live when the reader
 * flips the light/dark toggle (Mermaid bakes concrete colours into the SVG, so
 * it must re-render; the figure chrome uses the vars directly and just reflows).
 *
 * Mermaid is lazy-loaded so the ~280 kB ES module only ships on pages that
 * actually have a diagram.
 */

interface Props {
  code: string
  /** Optional one-sentence italic caption rendered below the diagram. */
  caption?: string
}

type ReadMode = "light" | "dark"

// Fallback palette if a diagram ever renders outside a [data-read-mode] reader
// (mirrors the /blog Slate light tokens).
const FALLBACK = {
  bg: "#eceff3",
  fg: "#101a2c",
  muted: "rgba(16,26,44,0.63)",
  soft: "rgba(16,26,44,0.44)",
  accent: "#3355cc",
  accentSoft: "rgba(51,85,204,0.42)",
  surface: "rgba(16,26,44,0.045)",
  hair: "rgba(16,26,44,0.11)",
}
type Tokens = typeof FALLBACK

function readTokens(root: HTMLElement | null): Tokens {
  if (!root) return { ...FALLBACK }
  const cs = getComputedStyle(root)
  const v = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb
  return {
    bg: v("--read-bg", FALLBACK.bg),
    fg: v("--read-fg", FALLBACK.fg),
    muted: v("--read-fg-muted", FALLBACK.muted),
    soft: v("--read-fg-soft", FALLBACK.soft),
    accent: v("--read-accent", FALLBACK.accent),
    accentSoft: v("--read-accent-soft", FALLBACK.accentSoft),
    surface: v("--read-surface", FALLBACK.surface),
    hair: v("--read-hair", FALLBACK.hair),
  }
}

// Map the reader tokens onto Mermaid's base-theme variables. Boxes use the
// faint --read-surface fill over the paper with the accent as their border;
// text is the ink; arrows/lines are the soft ink.
function themeVariablesFrom(t: Tokens) {
  return {
    background: t.bg,
    mainBkg: t.surface,
    secondBkg: t.surface,
    tertiaryBkg: t.surface,
    primaryColor: t.surface,
    primaryTextColor: t.fg,
    primaryBorderColor: t.accent,
    lineColor: t.soft,
    textColor: t.fg,
    nodeBkg: t.surface,
    nodeBorder: t.accent,
    nodeTextColor: t.fg,
    clusterBkg: t.surface,
    clusterBorder: t.accentSoft,
    edgeLabelBackground: t.bg,
    noteBkgColor: t.surface,
    noteBorderColor: t.accent,
    noteTextColor: t.fg,
    actorBkg: t.surface,
    actorBorder: t.accent,
    actorTextColor: t.fg,
    signalColor: t.muted,
    signalTextColor: t.fg,
    labelBoxBkgColor: t.surface,
    labelBoxBorderColor: t.accent,
    labelTextColor: t.fg,
    mindmapBkg: t.surface,
  }
}

function themeCSSFrom(t: Tokens): string {
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
      color: ${t.muted} !important;
    }
    .cluster-label .nodeLabel,
    .cluster-label foreignObject div {
      font-family: 'IBM Plex Mono', ui-monospace, monospace !important;
      font-size: 12px !important;
      letter-spacing: 0.22em !important;
      text-transform: uppercase !important;
      color: ${t.accent} !important;
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

  // Track the nearest [data-read-mode] ancestor + re-render on its change.
  // `mode` is only a re-render trigger — the actual colours are read from the
  // reader's live tokens at render time, so a repaint needs no change here.
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
        const root = figureRef.current?.closest(
          "[data-read-mode]",
        ) as HTMLElement | null
        const tokens = readTokens(root)
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: themeVariablesFrom(tokens),
          fontFamily: "'IBM Plex Serif', Georgia, serif",
          flowchart: { curve: "basis", padding: 18, htmlLabels: true },
          sequence: {
            actorFontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            actorFontSize: 13,
            messageFontFamily: "'IBM Plex Serif', Georgia, serif",
            messageFontSize: 14,
            wrap: true,
          },
          themeCSS: themeCSSFrom(tokens),
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

  return (
    <figure
      ref={figureRef}
      data-read-surface
      // Breakout — at lg/xl the figure pulls outside the max-w-3xl
      // column (48/96 px each side) so wide diagrams get room. Chrome uses
      // the reader tokens directly, so it follows any repaint automatically.
      className="my-10 rounded-xl border p-4 sm:p-5 lg:-mx-12 xl:-mx-24"
      style={{
        background: "var(--read-bg)",
        borderColor: "var(--read-hair)",
        boxShadow: "none",
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
            color: "var(--read-fg-muted)",
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
