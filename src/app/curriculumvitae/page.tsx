import Link from "next/link"
import type { ReactNode } from "react"
import { PROFILE_PATHS } from "@/lib/cv/config"
import { formatDate, formatMoney, formatTeam, toRoman } from "@/lib/cv/format"
import { isPlaceholder } from "@/lib/cv/placeholder"
import {
  summarisePublicProgrammes,
  type PublicProgrammeSummary,
  type Tally,
} from "@/lib/cv/programmes"
import { getPublicProfile } from "@/lib/cv/public-profile"
import type {
  BoardRoleT,
  LanguageT,
  ProgrammeT,
  PublicationT,
  ReachItemT,
  TalkT,
} from "@/lib/cv/schema"
import { DateRange, Value, ValueList } from "./_components/Value"
import styles from "./profile.module.css"

/**
 * Executive profile · public teaser.
 *
 * Renders ONLY src/content/cv/public.json (validated and checked for
 * non-public items at build time). Everything gated lives in the private
 * folder and, from Phase 3, behind an access code at /curriculumvitae/dossier.
 */

const CHANNEL_KINDS = new Set(["channel", "repository", "course", "essay-series"])
const MAX_PROGRAMME_CARDS = 3

/** "supervisory-board" → "Supervisory board". Placeholders pass through. */
function kindLabel(kind: string): string {
  if (isPlaceholder(kind)) return kind
  const words = kind.replace(/-/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function EntryLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={styles.link}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={styles.link} rel="noopener noreferrer">
      {children}
    </a>
  )
}

function Section({
  id,
  numeral,
  label,
  title,
  children,
}: {
  id: string
  numeral: string
  label: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={styles.section}>
      <p className={styles.sectionLabel} aria-hidden="true">
        <span className={styles.sectionNumeral}>{numeral}</span>
        {label}
      </p>
      <div>
        <h2 id={`${id}-title`} className={styles.sectionTitle}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}

function Languages({ items }: { items: LanguageT[] }) {
  return (
    <ul className={styles.inlineList}>
      {items.map((l) => (
        <li key={l.id}>
          <Value text={l.language} />{" "}
          <span className={styles.level}>
            (<Value text={l.level} />)
          </span>
        </li>
      ))}
    </ul>
  )
}

function Tallies({ items }: { items: Tally[] }) {
  if (items.length === 0) return <>None listed</>
  return (
    <ul className={styles.tallies}>
      {items.map((t) => (
        <li key={t.label}>
          <Value text={t.label} />
          <span className={styles.tallyCount}>({t.count})</span>
        </li>
      ))}
    </ul>
  )
}

function ProgrammeCard({ programme: p }: { programme: ProgrammeT }) {
  // Each audience sees either the client's name (when it survived that
  // audience's visibility filter) or the anonymised descriptor.
  const client = p.client ? (p.client.name?.text ?? p.client.descriptor) : null
  const budget = p.budget ? formatMoney(p.budget) : null
  const team = p.teamSize ? formatTeam(p.teamSize) : null
  return (
    <li className={styles.programmeCard}>
      {p.themes.length > 0 ? (
        <ul className={styles.chips} aria-label="Themes">
          {p.themes.map((theme, i) => (
            <li key={i} className={styles.chip}>
              <Value text={theme} />
            </li>
          ))}
        </ul>
      ) : null}
      <h3 className={styles.programmeTitle}>
        <Value text={p.title} />
      </h3>
      <p className={styles.programmeSummary}>
        <Value text={p.summary} />
      </p>
      <dl className={styles.meta}>
        {client ? (
          <>
            <dt>Client</dt>
            <dd>
              <Value text={client} />
            </dd>
          </>
        ) : null}
        <dt>Sector</dt>
        <dd>
          <Value text={p.sector} />
        </dd>
        {p.geographies.length > 0 ? (
          <>
            <dt>Geography</dt>
            <dd>
              <ValueList items={p.geographies} />
            </dd>
          </>
        ) : null}
        <dt>Years</dt>
        <dd>
          <DateRange start={p.start} end={p.end} />
        </dd>
        <dt>Role</dt>
        <dd>
          <Value text={p.role} />
        </dd>
        {budget && p.budget ? (
          <>
            <dt>{kindLabel(p.budget.kind)}</dt>
            <dd>{budget}</dd>
          </>
        ) : null}
        {team ? (
          <>
            <dt>Team</dt>
            <dd>{team}</dd>
          </>
        ) : null}
      </dl>
    </li>
  )
}

function Programmes({
  programmes,
  summary,
}: {
  programmes: ProgrammeT[]
  summary: PublicProgrammeSummary
}) {
  const total = summary.budgetTotal
  const totalText = total
    ? formatMoney({
        currency: total.currency,
        exact: total.exact,
        rangeLow: total.low,
        rangeHigh: total.high,
      })
    : null
  return (
    <>
      <dl className={styles.stats}>
        <div>
          <dt className={styles.statLabel}>Programmes</dt>
          <dd className={styles.statFigure}>{summary.count}</dd>
        </div>
        {summary.yearSpan ? (
          <div>
            <dt className={styles.statLabel}>Span</dt>
            <dd className={styles.statFigure}>
              {summary.yearSpan.from}–{summary.yearSpan.to}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className={styles.statLabel}>Sectors</dt>
          <dd>
            <Tallies items={summary.sectors} />
          </dd>
        </div>
        <div>
          <dt className={styles.statLabel}>Themes</dt>
          <dd>
            <Tallies items={summary.themes} />
          </dd>
        </div>
        {/* Shown only when EVERY public programme carries a public budget of
            the same kind and currency; otherwise the total is omitted. */}
        {total && totalText ? (
          <div>
            <dt className={styles.statLabel}>Combined {total.kind}</dt>
            <dd className={styles.statFigure}>{totalText}</dd>
          </div>
        ) : null}
      </dl>
      <p className={styles.statNote}>
        Figures cover only the programmes cleared for this page. The full record is
        shared by access code.
      </p>
      <ul className={styles.programmeGrid}>
        {programmes.slice(0, MAX_PROGRAMME_CARDS).map((p) => (
          <ProgrammeCard key={p.id} programme={p} />
        ))}
      </ul>
    </>
  )
}

function Leaders({ items }: { items: ReachItemT[] }) {
  return (
    <ul className={styles.leaders}>
      {items.map((item) => (
        <li key={item.id} className={styles.leader}>
          <span className={styles.leaderLabel}>
            <Value text={item.label} />
          </span>
          {item.years ? (
            <>
              <span className={styles.leaderDots} aria-hidden="true" />
              <span className={styles.leaderValue}>
                <Value text={item.years} />
              </span>
            </>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function BoardEntry({ role: b }: { role: BoardRoleT }) {
  return (
    <li className={styles.entry}>
      <p className={styles.entryKind}>
        <Value text={kindLabel(b.kind)} />
      </p>
      <div className={styles.entryBody}>
        <p className={styles.entryTitle}>
          <Value text={b.title} />
          {", "}
          <Value text={b.organisation.name} />
        </p>
        <p className={styles.entryMeta}>
          <DateRange start={b.start} end={b.end} />
          {b.committees.length > 0 ? (
            <>
              {" · Committees: "}
              <ValueList items={b.committees} />
            </>
          ) : null}
        </p>
        {b.remit ? (
          <p className={styles.entryMeta}>
            <Value text={b.remit} />
          </p>
        ) : null}
      </div>
    </li>
  )
}

function PublicationEntry({ item }: { item: PublicationT }) {
  const title = <Value text={item.title} />
  const meta: Array<string | number> = []
  if (item.venue) meta.push(item.venue)
  if (item.year != null) meta.push(item.year)
  return (
    <li className={styles.entry}>
      <p className={styles.entryKind}>
        <Value text={kindLabel(item.kind)} />
      </p>
      <div className={styles.entryBody}>
        <p className={styles.entryTitle}>
          {item.url ? <EntryLink href={item.url}>{title}</EntryLink> : title}
        </p>
        {meta.length > 0 ? (
          <p className={styles.entryMeta}>
            <ValueList items={meta} />
          </p>
        ) : null}
        {item.doi ? (
          <p className={styles.entryMeta}>
            <EntryLink href={`https://doi.org/${item.doi}`}>doi:{item.doi}</EntryLink>
          </p>
        ) : null}
        {item.description ? (
          <p className={styles.entryMeta}>
            <Value text={item.description} />
          </p>
        ) : null}
      </div>
    </li>
  )
}

function TalkEntry({ item }: { item: TalkT }) {
  const title = <Value text={item.title} />
  const meta: Array<string | number> = [item.event]
  if (item.location) meta.push(item.location)
  meta.push(item.year)
  return (
    <li className={styles.entry}>
      <p className={styles.entryKind}>
        <Value text={kindLabel(item.kind)} />
      </p>
      <div className={styles.entryBody}>
        <p className={styles.entryTitle}>
          {item.url ? <EntryLink href={item.url}>{title}</EntryLink> : title}
        </p>
        <p className={styles.entryMeta}>
          <ValueList items={meta} />
        </p>
      </div>
    </li>
  )
}

function ContactValue({ email }: { email: string }) {
  if (isPlaceholder(email)) return <Value text={email} />
  return (
    <a href={`mailto:${email}`} className={styles.link}>
      {email}
    </a>
  )
}

function AccessPanel({ referencesPolicy }: { referencesPolicy: string | null }) {
  return (
    <section aria-labelledby="access-title" className={styles.accessPanel}>
      <span className={styles.seal} aria-hidden="true">
        TS
      </span>
      <div>
        <p className={styles.accessKicker}>Detailed profile · by access code</p>
        <h2 id="access-title" className={styles.accessTitle}>
          For retained search firms and nomination committees
        </h2>
        <p className={styles.accessText}>
          A detailed profile, with programmes, case studies and documents prepared
          for search, is shared by access code.
        </p>
        {referencesPolicy ? (
          <p className={styles.accessRefs}>
            <Value text={referencesPolicy} />
          </p>
        ) : null}
        <Link href={PROFILE_PATHS.access} className={styles.accessCta}>
          Enter a code or request access <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

export default function ExecutiveProfilePage() {
  const data = getPublicProfile()
  const profile = data.profile
  const folioYear = toRoman(new Date(data.generatedAt).getUTCFullYear())
  const programmeSummary = summarisePublicProgrammes(data.programmes)
  const channels = data.publications.filter((p) => CHANNEL_KINDS.has(p.kind))
  const writing = data.publications.filter((p) => !CHANNEL_KINDS.has(p.kind))

  const sections: Array<{ id: string; label: string; title: string; body: ReactNode }> = []

  if (data.programmes.length > 0) {
    // Teaser: public programmes only, as anonymised cards plus aggregates
    // derived from public facts alone (summarisePublicProgrammes).
    // Gated dossier (Phase 3, /curriculumvitae/dossier, from gated.json):
    // lists ALL programmes, public and gated, and renders the 3 to 5 with
    // `featured: true` as full case studies (situation, complication, key
    // decisions, outcomes, leadership lesson) at
    // /curriculumvitae/dossier/cases/[slug]. This page never reads gated data.
    sections.push({
      id: "programmes",
      label: "Programmes",
      title: "Transformation programmes",
      body: <Programmes programmes={data.programmes} summary={programmeSummary} />,
    })
  }

  if (data.sectors.length + data.geographies.length > 0) {
    sections.push({
      id: "reach",
      label: "Reach",
      title: "Sectors and geographies",
      body: (
        <div className={styles.reachGrid}>
          {data.sectors.length > 0 ? (
            <div>
              <h3 className={styles.subTitle}>Sectors</h3>
              <Leaders items={data.sectors} />
            </div>
          ) : null}
          {data.geographies.length > 0 ? (
            <div>
              <h3 className={styles.subTitle}>Geographies</h3>
              <Leaders items={data.geographies} />
            </div>
          ) : null}
        </div>
      ),
    })
  }

  if (data.boardRoles.length > 0) {
    sections.push({
      id: "governance",
      label: "Governance",
      title: "Board and advisory",
      body: (
        <ul className={styles.entries}>
          {data.boardRoles.map((b) => (
            <BoardEntry key={b.id} role={b} />
          ))}
        </ul>
      ),
    })
  }

  if (channels.length + writing.length + data.talks.length > 0) {
    sections.push({
      id: "writing",
      label: "Writing and talks",
      title: "Thought leadership",
      body: (
        <>
          {channels.length > 0 ? (
            <>
              <h3 className={styles.subTitle}>Channels</h3>
              <ul className={styles.entries}>
                {channels.map((p) => (
                  <PublicationEntry key={p.id} item={p} />
                ))}
              </ul>
            </>
          ) : null}
          {writing.length > 0 ? (
            <>
              <h3 className={styles.subTitle}>Publications</h3>
              <ul className={styles.entries}>
                {writing.map((p) => (
                  <PublicationEntry key={p.id} item={p} />
                ))}
              </ul>
            </>
          ) : null}
          {data.talks.length > 0 ? (
            <>
              <h3 className={styles.subTitle}>Talks</h3>
              <ul className={styles.entries}>
                {data.talks.map((t) => (
                  <TalkEntry key={t.id} item={t} />
                ))}
              </ul>
            </>
          ) : null}
        </>
      ),
    })
  }

  return (
    <>
      <header className={styles.masthead}>
        <div className={`syn-column ${styles.fade}`}>
          <p className={styles.folioRow}>
            <span>Folio · Executive profile</span>
            <span>Anno {folioYear}</span>
          </p>
          <h1 className={styles.name}>{profile?.name ?? "Executive profile"}</h1>
          {profile ? (
            <p className={styles.positioning}>
              <Value text={profile.positioning} />
            </p>
          ) : null}
          <dl className={styles.colophon}>
            {profile ? (
              <div>
                <dt>Base</dt>
                <dd>
                  <Value text={profile.base} />
                </dd>
              </div>
            ) : null}
            {data.languages.length > 0 ? (
              <div>
                <dt>Languages</dt>
                <dd>
                  <Languages items={data.languages} />
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </header>

      <main id="profile">
        <div className={styles.plate}>
          <div className={`syn-column ${styles.fade} ${styles.fadeLate}`}>
            {data.proofFigures.length > 0 ? (
              <section aria-labelledby="glance-title" className={styles.block}>
                <div className={styles.blockHead}>
                  <p className={styles.blockLabel}>Fig. I</p>
                  <h2 id="glance-title" className={styles.blockTitle}>
                    At a glance
                  </h2>
                </div>
                <dl className={styles.figures}>
                  {data.proofFigures.map((f) => (
                    <div key={f.id} className={styles.figure}>
                      <dt className={styles.figureLabel}>
                        <Value text={f.label} />
                      </dt>
                      <dd className={styles.figureValue}>
                        <Value text={f.value} />
                      </dd>
                      {f.note ? (
                        <dd className={styles.figureNote}>
                          <Value text={f.note} />
                        </dd>
                      ) : null}
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {data.eras.length > 0 ? (
              <section aria-labelledby="eras-title" className={styles.block}>
                <div className={styles.blockHead}>
                  <p className={styles.blockLabel}>Fig. II</p>
                  <h2 id="eras-title" className={styles.blockTitle}>
                    Career eras
                  </h2>
                </div>
                {/* Phase 2 replaces this strip with the Career Meridian
                    (eras and lanes); this <ol> stays as its text equivalent. */}
                <ol className={styles.eraList}>
                  {data.eras.map((era, i) => (
                    <li key={era.id} className={styles.era}>
                      <span className={styles.eraMarker} aria-hidden="true" />
                      <p className={styles.eraYears}>
                        <span className={styles.eraNumeral} aria-hidden="true">
                          {toRoman(i + 1)}
                        </span>
                        <DateRange start={era.start} end={era.end} />
                      </p>
                      <h3 className={styles.eraTitle}>
                        <Value text={era.title} />
                      </h3>
                      <p className={styles.eraThesis}>
                        <Value text={era.thesis} />
                      </p>
                      <p className={styles.eraWave}>
                        Wave · <Value text={era.wave} />
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
        </div>

        <div className={styles.paper}>
          <div className="syn-column">
            {sections.map((s, i) => (
              <Section
                key={s.id}
                id={s.id}
                numeral={toRoman(i + 1)}
                label={s.label}
                title={s.title}
              >
                {s.body}
              </Section>
            ))}
            <AccessPanel referencesPolicy={profile?.referencesPolicy?.text ?? null} />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="syn-column">
          <dl className={styles.footerGrid}>
            {profile?.contact ? (
              <div>
                <dt className={styles.footerLabel}>Contact</dt>
                <dd>
                  <ContactValue email={profile.contact.email} />
                </dd>
              </div>
            ) : null}
            <div>
              <dt className={styles.footerLabel}>Privacy</dt>
              <dd>
                <Link href={PROFILE_PATHS.privacy} className={styles.link}>
                  Privacy notice
                </Link>
              </dd>
            </div>
            <div>
              <dt className={styles.footerLabel}>Last updated</dt>
              <dd>
                <time dateTime={data.generatedAt}>{formatDate(data.generatedAt)}</time>
              </dd>
            </div>
          </dl>
          {profile?.closingLine ? (
            <p className={styles.closing}>
              <Value text={profile.closingLine.text} />
            </p>
          ) : null}
        </div>
      </footer>
    </>
  )
}
