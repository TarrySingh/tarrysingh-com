/**
 * Shared building blocks for the three PDF artefacts. Server-rendered with
 * react-dom/server; no hooks, no client code, no next/* imports.
 */
import React from "react"
import type { MatrixCellView, OutcomeView, ProgrammeView, RoleView, View } from "./data"

export const SITE = "tarrysingh.com/curriculumvitae"
export const ACCESS = "tarrysingh.com/curriculumvitae/access"

/* ── Page furniture ────────────────────────────────────────────────────── */

export function Sheet({
  page,
  pages,
  label,
  children,
}: {
  page: number
  pages: number
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="sheet" data-sheet={page}>
      <div className="body">{children}</div>
      <footer className="foot">
        <span>Confidential {"·"} {SITE}</span>
        <span className="mid">{label}</span>
        <span className="end">
          Page {page} of {pages}
        </span>
      </footer>
    </section>
  )
}

export function Section({
  n,
  title,
  aside,
  children,
}: {
  n: string
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="sec">
      <div className="sh mono">
        <span className="n">{n}</span>
        <span className="t">{title}</span>
        {aside ? <span className="aside">{aside}</span> : null}
      </div>
      {children}
    </section>
  )
}

/** Running section numbers: 01, 02, 03 across the pages of one document. */
export function counter() {
  let i = 0
  return () => String(++i).padStart(2, "0")
}

export function Masthead({
  view,
  kicker,
  compact,
}: {
  view: View
  kicker: string
  compact?: boolean
}) {
  return (
    <header className={compact ? "mast sm" : "mast"}>
      <div>
        <div className="kicker mono">{kicker}</div>
        <h1 className="name">{view.name}</h1>
        {view.positioning ? (
          <p className={view.positioning.split(/\s+/).length > 40 ? "pos long" : "pos"}>{view.positioning}</p>
        ) : null}
      </div>
      <div className="contact mono">
        {view.base ? (
          <div>
            <span className="k">Based in</span>
            <span className="v">{view.base}</span>
          </div>
        ) : null}
        <div>
          <span className="k">Profile</span>
          <span className="v">{SITE}</span>
        </div>
        <div>
          <span className="k">Access by request</span>
          <span className="v">{ACCESS}</span>
        </div>
        {view.contactEmail ? (
          <div>
            <span className="k">Contact</span>
            <span className="v">{view.contactEmail}</span>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export function RunningHead({ view, doc }: { view: View; doc: string }) {
  return (
    <div className="runhead mono">
      <b>{view.name}</b>
      <span>{doc}</span>
    </div>
  )
}

export function Closing({ view }: { view: View }) {
  return view.closingLine ? <p className="close">{view.closingLine}</p> : null
}

/* ── Content blocks ────────────────────────────────────────────────────── */

/** "EUR 120m" -> a small currency prefix and the figure at display size. */
function figureValue(value: string): React.ReactNode {
  const m = /^([A-Z]{3})\s+(\S.*)$/.exec(value)
  return m ? (
    <>
      <span className="cur">{m[1]}</span>
      {m[2]}
    </>
  ) : (
    value
  )
}

export function Figures({ view, limit = 4 }: { view: View; limit?: number }) {
  if (view.figures.length === 0) return null
  return (
    <>
      {view.figures.slice(0, limit).map((f, i) => (
        <div className="fig" key={i}>
          <div className="v">{figureValue(f.value)}</div>
          <div className="l mono">{f.label}</div>
        </div>
      ))}
    </>
  )
}

/** The metric is only appended when the statement carries no figure of its own. */
function achievementText(o: OutcomeView): string {
  return o.metric && !/\d/.test(o.text) ? `${o.text} (${o.metric})` : o.text
}

export function SignatureList({ items }: { items: OutcomeView[] }) {
  return (
    <ol className="ach">
      {items.map((o, i) => (
        <li key={o.id}>
          <span className="i">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <div className="tx">{achievementText(o)}</div>
            <div className="cx mono">{o.context}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

const SEAT_LABEL = { CEO: "Chief Executive", CAIO: "Chief AI Officer", CTO: "Chief Technology Officer" } as const
const PILLARS = ["People", "Process", "Technology"] as const
const SEATS = ["CEO", "CAIO", "CTO"] as const

/** Legend for the matrix, set inside the section heading. */
export const MatrixKey = (
  <span className="key">
    <i className="dot" /> Strong <i className="dot partial" /> Partial
  </span>
)

export function MatrixStrip({ view }: { view: View }) {
  if (!view.hasMatrix) return null
  const cell = (c: MatrixCellView | null, key: string) =>
    c ? (
      <div className="c" key={key}>
        <span className={c.rating === "strong" ? "dot" : "dot partial"} aria-label={c.rating} />
        <span>{c.competency}</span>
      </div>
    ) : (
      <div className="c none" key={key}>
        <span />
        <span>{"–"}</span>
      </div>
    )
  return (
    <>
      <div className="mx">
        <div className="h" />
        {SEATS.map((s) => (
          <div className="h mono" key={s}>
            {SEAT_LABEL[s]}
          </div>
        ))}
        {PILLARS.map((p) => (
          <React.Fragment key={p}>
            <div className="r mono">{p}</div>
            {SEATS.map((s) => cell(view.matrix[s][p], `${s}-${p}`))}
          </React.Fragment>
        ))}
      </div>
    </>
  )
}

export function RoleEntry({
  role,
  perRole,
  signatureIndex,
}: {
  role: RoleView
  perRole: number
  /** outcome id -> 1-based number in the signature list */
  signatureIndex: Map<string, number>
}) {
  const own = role.outcomes.filter((o) => !signatureIndex.has(o.id)).slice(0, perRole)
  const refs = role.outcomes
    .map((o) => signatureIndex.get(o.id))
    .filter((n): n is number => typeof n === "number")
    .sort((a, b) => a - b)
  const facts = [
    role.reportingLine ? `Reports to ${role.reportingLine}` : null,
    ...role.scope,
    role.geography.length ? role.geography.join(", ") : null,
  ].filter((x): x is string => Boolean(x))
  return (
    <article className="role">
      <div className="d mono">
        <b>
          {role.startLabel} {"–"} {role.endLabel}
        </b>
      </div>
      <div>
        <h3>
          {role.title}
          <span>, {role.org}</span>
        </h3>
        {facts.length ? <p className="sc mono">{facts.join(" · ")}</p> : null}
        {role.mandate ? <p className="md">{role.mandate}</p> : null}
        {own.length ? (
          <ul>
            {own.map((o) => (
              <li key={o.id}>{achievementText(o)}</li>
            ))}
          </ul>
        ) : null}
        {refs.length ? (
          <p className="see mono">
            Signature achievement{refs.length > 1 ? "s" : ""} {refs.map((n) => String(n).padStart(2, "0")).join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export function EarlyCareer({ roles }: { roles: RoleView[] }) {
  if (roles.length === 0) return null
  return (
    <div className="early">
      <div className="d mono">Earlier career</div>
      <ul>
        {roles.map((r) => (
          <li key={r.id}>
            <b>{r.years}</b>
            {r.title}, {r.org}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProgrammeGrid({ items, detail = true }: { items: ProgrammeView[]; detail?: boolean }) {
  return (
    <div className="prog">
      {items.map((p) => {
        const meta = [p.descriptor, p.sector, p.years].filter((x): x is string => Boolean(x))
        return (
          <article key={p.id}>
            <h4>{p.title}</h4>
            {meta.length ? <p className="m mono">{meta.join(" · ")}</p> : null}
            {p.result ? <p>{p.result}</p> : null}
            {detail && (p.role || p.scale) ? (
              <p className="m mono" style={{ marginTop: "0.8mm" }}>
                {[p.role, p.scale].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

export function Trio({
  view,
  credentialLimit = 99,
  languagesInline,
}: {
  view: View
  credentialLimit?: number
  languagesInline?: boolean
}) {
  const cols: React.ReactNode[] = []
  const credentials = view.credentials.slice(0, credentialLimit)
  if (view.education.length || credentials.length) {
    cols.push(
      <div key="edu">
        <h5 className="mono">Education and credentials</h5>
        <ul>
          {view.education.map((e, i) => (
            <li key={`e${i}`}>
              <b>{e.qualification}</b>
              <small>
                {e.institution}
                {e.years ? ` · ${e.years}` : ""}
              </small>
            </li>
          ))}
          {credentials.map((c, i) => (
            <li key={`c${i}`}>{c}</li>
          ))}
        </ul>
      </div>,
    )
  }
  if (view.board.length) {
    cols.push(
      <div key="board">
        <h5 className="mono">Board and advisory</h5>
        <ul>
          {view.board.map((b, i) => (
            <li key={i}>
              <b>{b.title}</b>, {b.org}
              <small>
                {b.years}
                {b.detail ? ` · ${b.detail}` : ""}
              </small>
            </li>
          ))}
        </ul>
      </div>,
    )
  }
  if (view.languages.length && !languagesInline) {
    cols.push(
      <div key="lang">
        <h5 className="mono">Languages</h5>
        <ul>
          {view.languages.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>,
    )
  }
  if (cols.length === 0) return null
  return <div className="trio">{cols}</div>
}

export function CareerBrief({ roles }: { roles: RoleView[] }) {
  if (roles.length === 0) return null
  return (
    <div className="brief">
      <ul>
        {roles.map((r) => (
          <li key={r.id}>
            <b>{r.years}</b>
            <strong>{r.title}</strong>, {r.org}
          </li>
        ))}
      </ul>
    </div>
  )
}
