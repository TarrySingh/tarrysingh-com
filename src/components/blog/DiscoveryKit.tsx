import type { ReactNode } from "react"

// Flagship rich-MDX components for the "Your AI Doesn't Discover Anything"
// dispatch. Everything is built on the Read tokens (--read-*) so it adapts to
// the light/dark toggle automatically: --read-accent is rust in light, gold in
// dark; --read-fg is navy in light, cream in dark.

const MONO = "var(--font-mono), 'IBM Plex Mono', monospace"
const SERIF = "var(--font-serif), 'IBM Plex Serif', serif"
const DISPLAY = "var(--font-display), 'Gloock', serif"

// A labelled callout box. variant="key" uses the rust/gold accent; default
// uses the navy/cream foreground. Children render as normal MDX prose.
export function Callout({
  label,
  variant = "default",
  children,
}: {
  label?: string
  variant?: "default" | "key"
  children: ReactNode
}) {
  const accent = variant === "key" ? "var(--read-accent)" : "var(--read-fg)"
  return (
    <aside
      className="my-8 rounded-r-md py-4 pl-5 pr-5 [&>p]:mb-3 [&>p:last-child]:mb-0 [&>p]:text-[1rem] [&>p]:leading-[1.62] [&>ul]:mb-0 [&>ul]:text-[1rem]"
      style={{
        background: "var(--read-surface)",
        borderTop: "1px solid var(--read-surface-border)",
        borderRight: "1px solid var(--read-surface-border)",
        borderBottom: "1px solid var(--read-surface-border)",
        borderLeft: `3px solid ${accent}`,
      }}
    >
      {label ? (
        <div
          className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: MONO, color: accent }}
        >
          {label}
        </div>
      ) : null}
      {children}
    </aside>
  )
}

const OPS = [
  {
    tag: "Operation A",
    title: "Retrieval",
    body: "Add an artifact the schema can already express. Nothing about the vocabulary changes — you now simply hold a thing you could always have described.",
    disc: false,
  },
  {
    tag: "Operation B",
    title: "Search",
    body: "Find a new combination, path, or object inside the fixed schema. The space of admissible things is unchanged; you found a better point in it.",
    disc: false,
  },
  {
    tag: "Operation C",
    title: "Discovery",
    body: "Change the regime itself — add or revise the types, operations, tools, or verifiers under which every future artifact will be judged.",
    disc: true,
  },
]

// The three-operations triad (Retrieval / Search / Discovery), as cards. The
// Discovery card carries the accent top-border to signal it's the structural
// break.
export function OpsTriad() {
  return (
    <div className="my-8 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
      {OPS.map((op) => {
        const accent = op.disc ? "var(--read-accent)" : "var(--read-fg)"
        return (
          <div
            key={op.title}
            className="rounded-sm p-4"
            style={{
              background: "var(--read-surface)",
              border: "1px solid var(--read-surface-border)",
              borderTop: `3px solid ${accent}`,
            }}
          >
            <div
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ fontFamily: MONO, color: "var(--read-fg-soft)" }}
            >
              {op.tag}
            </div>
            <div
              className="mb-1.5 text-[1.18rem] leading-tight"
              style={{ fontFamily: DISPLAY, color: accent }}
            >
              {op.title}
            </div>
            <p
              className="text-[0.9rem] leading-[1.5]"
              style={{ fontFamily: SERIF, color: "var(--read-fg-muted)" }}
            >
              {op.body}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// The transport + residual figure: the old state carried by the left Kan
// extension, the comparison map landing in the verified new state, and the
// residual it can't reach. Read-token aware so it works in dark mode.
export function TransportResidual() {
  const fg = "var(--read-fg)"
  const accent = "var(--read-accent)"
  const muted = "var(--read-fg-muted)"
  return (
    <figure className="my-10">
      <div
        className="overflow-x-auto rounded-md px-4 py-7 sm:px-7"
        style={{ background: "var(--read-surface)", border: "1px solid var(--read-surface-border)" }}
      >
        <svg viewBox="0 0 940 300" className="mx-auto block h-auto w-full" style={{ maxWidth: 880 }} role="img" aria-label="Transport plus residual diagram">
          <defs>
            <marker id="dk-ah" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={fg} />
            </marker>
            <marker id="dk-ahr" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={accent} />
            </marker>
          </defs>
          <rect x="14" y="104" width="210" height="86" rx="6" fill="transparent" stroke={fg} strokeWidth="1.6" />
          <text x="119" y="142" textAnchor="middle" fontFamily="serif" fontSize="24" fill={fg}>I&#8348;</text>
          <text x="119" y="166" textAnchor="middle" fontFamily="serif" fontSize="14" fill={muted} fontStyle="italic">old accepted state</text>
          <line x1="230" y1="147" x2="320" y2="147" stroke={fg} strokeWidth="1.6" markerEnd="url(#dk-ah)" />
          <text x="275" y="135" textAnchor="middle" fontFamily="serif" fontSize="15" fill={fg}>Lan&#7524;</text>
          <text x="275" y="171" textAnchor="middle" fontFamily="serif" fontSize="12.5" fill={muted} fontStyle="italic">free transport</text>
          <rect x="326" y="104" width="210" height="86" rx="6" fill="transparent" stroke={fg} strokeWidth="1.6" />
          <text x="431" y="142" textAnchor="middle" fontFamily="serif" fontSize="22" fill={fg}>Lan&#7524; I&#8348;</text>
          <text x="431" y="166" textAnchor="middle" fontFamily="serif" fontSize="14" fill={muted} fontStyle="italic">transported evidence</text>
          <line x1="542" y1="147" x2="632" y2="147" stroke={accent} strokeWidth="1.8" markerEnd="url(#dk-ahr)" />
          <text x="587" y="135" textAnchor="middle" fontFamily="serif" fontSize="16" fill={accent}>&#961;&#772;</text>
          <text x="587" y="171" textAnchor="middle" fontFamily="serif" fontSize="12.5" fill={accent} fontStyle="italic">comparison</text>
          <rect x="638" y="74" width="288" height="150" rx="6" fill="transparent" stroke={accent} strokeWidth="1.8" />
          <rect x="656" y="150" width="252" height="58" rx="4" fill="var(--read-surface)" stroke={fg} strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
          <rect x="656" y="92" width="252" height="46" rx="4" fill={accent} stroke={accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.16" />
          <text x="782" y="108" textAnchor="middle" fontFamily="serif" fontSize="20" fill={fg}>I&#8242;&#8348;&#8330;&#8321;</text>
          <text x="782" y="125" textAnchor="middle" fontFamily="serif" fontSize="12.5" fill={accent} fontStyle="italic">residual = genuinely new content</text>
          <text x="782" y="184" textAnchor="middle" fontFamily="serif" fontSize="12.5" fill={muted} fontStyle="italic">im(&#961;&#772;): explained by transport</text>
          <text x="470" y="270" textAnchor="middle" fontFamily="serif" fontSize="15" fill={muted}>free transport carries what it can &#8212; the gap is the discovery</text>
        </svg>
      </div>
      <figcaption
        className="mx-auto mt-3 max-w-[62ch] text-center text-[0.82rem] italic leading-[1.5]"
        style={{ color: "var(--read-fg-soft)", fontFamily: SERIF }}
      >
        <b style={{ fontStyle: "normal", fontWeight: 600 }}>Transport plus residual.</b> The old state is carried into the new schema by the left Kan extension; the comparison map ρ̄ lands inside the verified new state, and the shaded remainder it cannot reach is the formal trace of discovery.
      </figcaption>
    </figure>
  )
}
