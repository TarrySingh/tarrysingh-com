import {
  cefrLabel,
  formatDate,
  formatMoney,
  formatSpan,
  formatTeam,
  formatValue,
  kindLabel,
  paragraphs,
  toRoman,
  txt,
  txts,
  yearFraction,
} from "@/lib/cv/format"
import { clientLabel, programmeThemes } from "@/lib/cv/programmes"
import type {
  ArtefactT,
  CaseStudyT,
  CredentialT,
  EducationT,
  LanguageT,
  OpennessT,
  OutcomeT,
  ProgrammeT,
  RoleT,
  ThemeT,
} from "@/lib/cv/schema"
import { programmeAnchor } from "./ProgrammeLedger"
import { Chips } from "./Section"
import styles from "./cv.module.css"

/* ── Prepared-for bar and downloads ─────────────────────────────────────── */

const ARTEFACT_NOTE: Record<string, string> = {
  "executive-cv": "Two pages, reverse chronological",
  "one-page-summary": "One page, for a long list",
  "long-bio": "Narrative, for board packs",
  "board-bio": "150 words, third person",
}

export function downloadHref(a: ArtefactT): string {
  return `/api/cv/download/${encodeURIComponent(a.id)}`
}

export function Downloads({
  artefacts,
  compact = false,
}: {
  artefacts: readonly ArtefactT[]
  compact?: boolean
}) {
  if (artefacts.length === 0) return null
  return (
    <ul className={compact ? styles.downloadsCompact : styles.downloads}>
      {artefacts.map((a) => (
        <li key={a.id}>
          {/* Plain <a>: no prefetch, so only a real click is logged. */}
          <a href={downloadHref(a)} className={styles.download}>
            <span className={styles.downloadIcon} aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false">
                <path d="M8 2v8m0 0-3-3m3 3 3-3M3 13h10" />
              </svg>
            </span>
            <span className={styles.downloadText}>
              <span className={styles.downloadTitle}>{txt(a.title) ?? "Document"}</span>
              {compact ? null : (
                <span className={styles.downloadMeta}>
                  {txts([
                    "PDF",
                    a.pages ? `${a.pages} ${a.pages === 1 ? "page" : "pages"}` : null,
                    ARTEFACT_NOTE[a.kind] ?? null,
                  ]).join(" · ")}
                </span>
              )}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function PreparedFor({
  recruiterName,
  firm,
  label,
  expiresAt,
  reference,
  artefacts,
}: {
  recruiterName: string | null
  firm: string | null
  label: string | null
  expiresAt: string
  reference: string
  artefacts: readonly ArtefactT[]
}) {
  const who = txts([recruiterName, firm]).join(", ") || label || "Invited reader"
  return (
    <div className={`${styles.preparedBar} no-print`} role="region" aria-label="Your access" data-cv-prepared="">
      <div className={styles.preparedInner}>
        <div className={styles.preparedFor}>
          <p className={styles.preparedLine}>
            <span className={styles.preparedKey}>Prepared for</span>{" "}
            <strong className={styles.preparedName}>{who}</strong>
          </p>
          <p className={styles.preparedLine}>
            <span className={styles.preparedMeta}>
              Access until <time dateTime={expiresAt}>{formatDate(expiresAt)}</time>
            </span>
            <span className={styles.preparedSep} aria-hidden="true">
              ·
            </span>
            <span className={styles.preparedMeta}>Ref {reference}</span>
          </p>
        </div>
        <div className={styles.preparedActions}>
          <Downloads artefacts={artefacts} compact />
          <form method="post" action="/api/cv/signout" className={styles.signout}>
            <button type="submit" className={styles.signoutButton}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Executive summary ──────────────────────────────────────────────────── */

export function Summary({ text }: { text: string | null | undefined }) {
  const paras = paragraphs(text)
  if (paras.length === 0) return null
  return (
    <div className={styles.summary}>
      {paras.map((p, i) => (
        <p key={i} className={i === 0 ? styles.summaryLead : undefined}>
          {p}
        </p>
      ))}
    </div>
  )
}

/* ── Signature achievements ─────────────────────────────────────────────── */

type Achievement = {
  id: string
  statement: string
  value: string | null
  context: string | null
  when: string | null
}

function outcomeValue(o: OutcomeT): string | null {
  return o.metric ? formatValue(o.metric.value, o.metric.unit) : null
}

export function signatureAchievements(roles: readonly RoleT[], cases: readonly CaseStudyT[]): Achievement[] {
  const out: Achievement[] = []
  for (const r of roles) {
    for (const o of r.outcomes) {
      const statement = txt(o.statement)
      if (!o.signature || !statement) continue
      out.push({
        id: o.id,
        statement,
        value: outcomeValue(o),
        context: txts([r.title, r.organisation.name]).join(", ") || null,
        when: txt(o.metric?.timeframe) ?? formatSpan(r.start, r.end),
      })
    }
  }
  for (const c of cases) {
    for (const o of c.results) {
      const statement = txt(o.statement)
      if (!o.signature || !statement) continue
      out.push({
        id: o.id,
        statement,
        value: outcomeValue(o),
        context: txt(c.title),
        when: txt(o.metric?.timeframe),
      })
    }
  }
  return out.slice(0, 8)
}

export function Achievements({ items }: { items: readonly Achievement[] }) {
  if (items.length === 0) return null
  return (
    <ol className={styles.achievements}>
      {items.map((a, i) => (
        <li key={a.id} className={styles.achievement}>
          <p className={styles.achievementNo} aria-hidden="true">
            {toRoman(i + 1)}
          </p>
          <div>
            {a.value ? <p className={styles.achievementValue}>{a.value}</p> : null}
            <p className={styles.achievementText}>{a.statement}</p>
            {a.context || a.when ? (
              <p className={styles.achievementMeta}>{txts([a.context, a.when]).join(" · ")}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ── Case studies ───────────────────────────────────────────────────────── */

type CaseView = {
  id: string
  anchor: string
  title: string
  facts: Array<[string, string]>
  themes: string[]
  situation: string | null
  complication: string | null
  decisions: string[]
  outcomes: Array<{ id: string; value: string | null; text: string }>
  lesson: string | null
  boardLens: string | null
}

export function caseViews(programmes: readonly ProgrammeT[], cases: readonly CaseStudyT[]): CaseView[] {
  const views: CaseView[] = []
  const covered = new Set<string>()
  for (const p of programmes) {
    if (!p.featured || !p.narrative || !txt(p.title)) continue
    covered.add(p.id)
    const linked = cases.find((c) => c.programmeId === p.id)
    views.push({
      id: p.id,
      anchor: `case-${p.slug}`,
      title: txt(p.title)!,
      facts: [
        ["Client", clientLabel(p)],
        ["Sector", txt(p.sector)],
        ["Years", formatSpan(p.start, p.end)],
        ["Role", txt(p.role)],
        ["Budget", p.budget ? formatMoney(p.budget) : null],
        ["Team", p.teamSize ? formatTeam(p.teamSize) : null],
      ].filter((f): f is [string, string] => f[1] != null),
      themes: programmeThemes(p),
      situation: txt(p.narrative.situation),
      complication: txt(p.narrative.complication),
      decisions: txts(p.narrative.keyDecisions),
      outcomes: p.outcomes
        .map((o) => ({
          id: o.id,
          value: formatValue(o.value, o.unit),
          text: txt(o.statement) ?? txt(o.metric) ?? "",
        }))
        .filter((o) => o.text),
      lesson: txt(p.narrative.leadershipLesson),
      boardLens: linked ? txt(linked.boardLens) : null,
    })
  }
  for (const c of cases) {
    if ((c.programmeId && covered.has(c.programmeId)) || !txt(c.title)) continue
    views.push({
      id: c.id,
      anchor: `case-${c.slug}`,
      title: txt(c.title)!,
      facts: [],
      themes: [],
      situation: txt(c.situation),
      complication: txt(c.complication),
      decisions: txts(c.actions),
      outcomes: c.results
        .map((o) => ({ id: o.id, value: outcomeValue(o), text: txt(o.statement) ?? "" }))
        .filter((o) => o.text),
      lesson: txt(c.leadershipLesson),
      boardLens: txt(c.boardLens),
    })
  }
  return views
}

export function CaseStudies({ views }: { views: readonly CaseView[] }) {
  if (views.length === 0) return null
  return (
    <div className={styles.cases}>
      {views.map((c, i) => (
        <article key={c.id} id={c.anchor} className={styles.case} aria-labelledby={`${c.anchor}-t`}>
          <header className={styles.caseHead}>
            <p className={styles.caseKicker}>Case {toRoman(i + 1)}</p>
            <h3 id={`${c.anchor}-t`} className={styles.caseTitle}>
              {c.title}
            </h3>
            {c.facts.length > 0 ? (
              <dl className={styles.caseFacts}>
                {c.facts.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <Chips items={c.themes} label="Themes" />
          </header>
          <div className={styles.caseGrid}>
            {c.situation ? (
              <div>
                <h4 className={styles.caseH}>Situation</h4>
                <p>{c.situation}</p>
              </div>
            ) : null}
            {c.complication ? (
              <div>
                <h4 className={styles.caseH}>Complication</h4>
                <p>{c.complication}</p>
              </div>
            ) : null}
          </div>
          {c.decisions.length > 0 ? (
            <div className={styles.caseBlock}>
              <h4 className={styles.caseH}>His key decisions</h4>
              <ol className={styles.decisions}>
                {c.decisions.map((d, j) => (
                  <li key={j}>{d}</li>
                ))}
              </ol>
            </div>
          ) : null}
          {c.outcomes.length > 0 ? (
            <div className={styles.caseBlock}>
              <h4 className={styles.caseH}>Outcomes</h4>
              <ul className={styles.caseOutcomes}>
                {c.outcomes.map((o) => (
                  <li key={o.id}>
                    {o.value ? <span className={styles.caseOutcomeValue}>{o.value}</span> : null}
                    <span>{o.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {c.lesson ? (
            <blockquote className={styles.lesson}>
              <p className={styles.caseH}>What this says about how he leads</p>
              <p className={styles.lessonText}>{c.lesson}</p>
            </blockquote>
          ) : null}
          {c.boardLens ? (
            <p className={styles.boardLens}>
              <span className={styles.metaKey}>Board lens</span> {c.boardLens}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}

/* ── Leadership themes ──────────────────────────────────────────────────── */

export function Themes({
  themes,
  roles,
  programmes,
}: {
  themes: readonly ThemeT[]
  roles: readonly RoleT[]
  programmes: readonly ProgrammeT[]
}) {
  const shown = themes.filter((t) => txt(t.title) && txt(t.claim))
  if (shown.length === 0) return null
  const roleById = new Map(roles.map((r) => [r.id, r]))
  const progById = new Map(programmes.map((p) => [p.id, p]))
  return (
    <ul className={styles.themes}>
      {shown.map((t) => {
        const links = [
          ...t.programmeIds
            .map((id) => progById.get(id))
            .filter((p): p is ProgrammeT => !!p && !!txt(p.title))
            .map((p) => ({ href: `#${programmeAnchor(p)}`, label: txt(p.title)! })),
          ...t.roleIds
            .map((id) => roleById.get(id))
            .filter((r): r is RoleT => !!r && !!txt(r.title))
            .map((r) => ({
              href: `#${r.id}`,
              label: txts([r.title, r.organisation.name]).join(", "),
            })),
        ]
        return (
          <li key={t.id} className={styles.theme}>
            <h3 className={styles.themeTitle}>{txt(t.title)}</h3>
            <p className={styles.themeClaim}>{txt(t.claim)}</p>
            {links.length > 0 ? (
              <p className={styles.themeLinks}>
                <span className={styles.metaKey}>Evidence</span>{" "}
                {links.map((l, i) => (
                  <span key={l.href}>
                    {i > 0 ? " · " : null}
                    <a href={l.href} className={styles.link}>
                      {l.label}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/* ── Role ledger ────────────────────────────────────────────────────────── */

function RoleEntry({ role: r }: { role: RoleT }) {
  const span = formatSpan(r.start, r.end)
  const team = r.scope?.teamSize ? formatTeam(r.scope.teamSize) : null
  const money = r.scope?.budget ? formatMoney(r.scope.budget) : null
  const moneyKind = r.scope?.budget ? kindLabel(r.scope.budget.kind) : null
  const scope = txts([
    team ? `Team ${team}` : null,
    money ? txts([moneyKind, money]).join(" ") : null,
    ...(r.scope ? r.scope.geography : []),
  ])
  const outcomes = r.outcomes
    .map((o) => ({ id: o.id, text: txt(o.statement), value: outcomeValue(o) }))
    .filter((o): o is { id: string; text: string; value: string | null } => o.text != null)
  return (
    <li id={r.id} className={styles.role}>
      <p className={styles.roleSpan}>{span}</p>
      <div className={styles.roleBody}>
        <h3 className={styles.roleTitle}>{txt(r.title)}</h3>
        <p className={styles.roleOrg}>
          {txts([r.organisation.name, r.organisation.hqCountry]).join(" · ")}
          {txt(r.reportingLine) ? (
            <span className={styles.roleReport}> · reporting to {txt(r.reportingLine)}</span>
          ) : null}
        </p>
        <Chips items={scope} tone="solid" label="Scope" />
        {txt(r.mandate?.text) ? <p className={styles.roleMandate}>{txt(r.mandate?.text)}</p> : null}
        {outcomes.length > 0 ? (
          <ul className={styles.roleOutcomes}>
            {outcomes.map((o) => (
              <li key={o.id}>
                {o.value ? <strong className={styles.roleOutcomeValue}>{o.value}</strong> : null}{" "}
                {o.text}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  )
}

export function RoleLedger({ roles, years = 15 }: { roles: readonly RoleT[]; years?: number }) {
  const shown = roles
    .filter((r) => txt(r.title))
    .slice()
    .sort((a, b) => (yearFraction(b.start) ?? 0) - (yearFraction(a.start) ?? 0))
  if (shown.length === 0) return null
  const cutoff = new Date().getUTCFullYear() - years
  const isRecent = (r: RoleT) => {
    if (r.end === "present") return true
    const end = yearFraction(r.end)
    return end == null || end >= cutoff
  }
  const recent = shown.filter(isRecent)
  const earlier = shown.filter((r) => !isRecent(r))
  return (
    <>
      <ol id="cv-role-ledger" className={styles.roles}>
        {recent.map((r) => (
          <RoleEntry key={r.id} role={r} />
        ))}
      </ol>
      {earlier.length > 0 ? (
        <div className={styles.earlier}>
          <h3 className={styles.subTitle}>Earlier career</h3>
          <ul className={styles.earlierList}>
            {earlier.map((r) => (
              <li key={r.id} id={r.id}>
                <span className={styles.earlierSpan}>{formatSpan(r.start, r.end)}</span>
                <span>
                  {txt(r.title)}
                  {txt(r.organisation.name) ? `, ${txt(r.organisation.name)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  )
}

/* ── Education, credentials, languages ──────────────────────────────────── */

export function Credentials({
  education,
  credentials,
  languages,
}: {
  education: readonly EducationT[]
  credentials: readonly CredentialT[]
  languages: readonly LanguageT[]
}) {
  const edu = education.filter((e) => txt(e.institution) && txt(e.qualification))
  const creds = credentials.filter((c) => txt(c.name))
  const langs = languages.filter((l) => txt(l.language))
  if (edu.length + creds.length + langs.length === 0) return null
  return (
    <div className={styles.credGrid}>
      {edu.length > 0 ? (
        <div>
          <h3 className={styles.subTitle}>Education</h3>
          <ul className={styles.plainList}>
            {edu.map((e) => (
              <li key={e.id}>
                <p className={styles.entryTitle}>
                  {txts([e.qualification, e.field]).join(", ")}
                </p>
                <p className={styles.entryMeta}>
                  {txts([e.institution, formatSpan(e.start ?? null, e.end ?? null)]).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {creds.length > 0 ? (
        <div>
          <h3 className={styles.subTitle}>Credentials</h3>
          <ul className={styles.plainList}>
            {creds.map((c) => (
              <li key={c.id}>
                <p className={styles.entryTitle}>{txt(c.name)}</p>
                <p className={styles.entryMeta}>
                  {txts([c.kind === "other" ? null : kindLabel(c.kind), c.issuer, c.year]).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {langs.length > 0 ? (
        <div>
          <h3 className={styles.subTitle}>Languages</h3>
          <ul className={styles.plainList}>
            {langs.map((l) => (
              <li key={l.id} className={styles.langRow}>
                <span>{txt(l.language)}</span>
                <span className={styles.langLevel}>{cefrLabel(l.level)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/* ── Mandates of interest ───────────────────────────────────────────────── */

export function Mandates({ openness }: { openness: OpennessT | null }) {
  if (!openness) return null
  const seats = openness.targetSeats.filter((s) => txt(s.title))
  const rows: Array<[string, string]> = [
    ["Sectors", txts(openness.sectors).join(" · ")],
    ["Company stage", txts(openness.companyStages).join(" · ")],
    ["Geographies", txts(openness.geographies).join(" · ")],
    ["Format", txts(openness.formats.map((f) => kindLabel(f))).join(" · ")],
    ["Availability", txt(openness.availability) ?? ""],
    ["Horizon", txt(openness.timeHorizon) ?? ""],
    ["Relocation", txt(openness.relocation) ?? ""],
  ].filter((r): r is [string, string] => r[1] !== "")
  const commitments = txt(openness.currentCommitments?.text)
  if (seats.length + rows.length === 0 && !commitments) return null
  return (
    <div className={styles.mandates}>
      {seats.length > 0 ? (
        <ul className={styles.seats}>
          {seats.map((s) => (
            <li key={s.id} className={styles.seat} data-emphasis={s.emphasis}>
              <span className={styles.seatKind}>{s.emphasis === "primary" ? "Primary" : "Also"}</span>
              <span className={styles.seatTitle}>{txt(s.title)}</span>
              {txt(s.note) ? <span className={styles.seatNote}>{txt(s.note)}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {rows.length > 0 ? (
        <dl className={styles.factTable}>
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {commitments ? (
        <p className={styles.commitments}>
          <span className={styles.metaKey}>Current commitments</span> {commitments}
        </p>
      ) : null}
    </div>
  )
}
