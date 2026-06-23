import type { ReactNode } from "react"

/**
 * Prose primitives for the Chokepoint flagship essay.
 *
 * The reading column is a comfortable measure (~690px); the interactive
 * instruments break out wider via `.cp-gallery` (see page.tsx / Stage). These
 * are plain server components — no hooks — so a section file can interleave
 * them with the client instruments freely. Colours come from the `--cp-*`
 * tokens the route already defines, with literal fallbacks.
 */

const SERIF = "var(--font-serif), Georgia, serif"
const MONO = "var(--font-mono), ui-monospace, monospace"
const INK = "var(--cp-ink, #eef2ff)"
const MUTED = "var(--cp-muted, rgba(238,242,255,0.78))"
const GOLD = "var(--cp-wonder-hi, #f4cd86)"
const CYAN = "var(--cp-leverage-hi, #9ad8ef)"
const ROSE = "var(--cp-squeeze-hi, #f59ab0)"
const HAIR = "rgba(238,242,255,0.14)"

/** The essay reading column. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className="cp-prose mx-auto w-full px-5"
      style={{ maxWidth: 690, color: MUTED, fontFamily: SERIF, fontSize: 19, lineHeight: 1.74 }}
    >
      {children}
    </div>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: "0 0 1.4em" }}>{children}</p>
}

/** Opening paragraph of a section — slightly larger, full ink. */
export function Lead({ children }: { children: ReactNode }) {
  return <p style={{ margin: "0 0 1.4em", color: INK, fontSize: 21, lineHeight: 1.62 }}>{children}</p>
}

/** A chapter / section marker: mono kicker + serif title, centred. */
export function ChapterMark({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mx-auto mb-12 mt-28 max-w-2xl text-center sm:mt-32">
      <p
        style={{
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: "0.22em",
          color: GOLD,
          textTransform: "uppercase",
        }}
      >
        {kicker}
      </p>
      <h2 className="syn-display mt-4 text-3xl font-bold sm:text-4xl" style={{ color: INK, lineHeight: 1.12 }}>
        {title}
      </h2>
    </div>
  )
}

/** A verdict pull-quote. */
export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      className="mx-auto my-11 w-full px-5"
      style={{
        maxWidth: 760,
        borderLeft: `2px solid ${GOLD}`,
        color: INK,
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: 23,
        lineHeight: 1.5,
      }}
    >
      <div style={{ paddingLeft: 22 }}>{children}</div>
    </blockquote>
  )
}

/** Inline accents: leverage (cyan), wonder (gold), squeeze (rose). */
export function Lev({ children }: { children: ReactNode }) {
  return <strong style={{ color: CYAN, fontWeight: 600 }}>{children}</strong>
}
export function Won({ children }: { children: ReactNode }) {
  return <strong style={{ color: GOLD, fontWeight: 600 }}>{children}</strong>
}
export function Sq({ children }: { children: ReactNode }) {
  return <strong style={{ color: ROSE, fontWeight: 600 }}>{children}</strong>
}

/** Per-chapter Source Ledger — the citable spine, made visible. */
export function Sources({ items }: { items: ReactNode[] }) {
  return (
    <div className="mx-auto mt-14 w-full px-5" style={{ maxWidth: 690 }}>
      <p
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.18em",
          color: GOLD,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Sources
      </p>
      <ol
        style={{
          fontFamily: MONO,
          fontSize: 12.5,
          lineHeight: 1.7,
          color: MUTED,
          paddingLeft: 20,
          margin: 0,
          borderTop: `1px solid ${HAIR}`,
          paddingTop: 12,
        }}
      >
        {items.map((it, i) => (
          <li key={i} style={{ marginBottom: 5 }}>
            {it}
          </li>
        ))}
      </ol>
    </div>
  )
}
