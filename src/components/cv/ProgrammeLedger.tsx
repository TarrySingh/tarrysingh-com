import {
  formatSpan,
  formatValue,
  txt,
  txts,
} from "@/lib/cv/format"
import {
  clientLabel,
  headlineOutcome,
  programmeScale,
  programmeThemes,
} from "@/lib/cv/programmes"
import type { ProgrammeT } from "@/lib/cv/schema"
import { Chips } from "./Section"
import styles from "./cv.module.css"

/** Programmes with a real title, in reverse chronological order. */
export function realProgrammes(programmes: readonly ProgrammeT[]): ProgrammeT[] {
  return programmes
    .filter((p) => txt(p.title))
    .slice()
    .sort((a, b) => String(b.start).localeCompare(String(a.start)))
}

export function programmeAnchor(p: ProgrammeT): string {
  return `programme-${p.slug}`
}

/**
 * Signature programmes as a ledger.
 *   public  anonymised descriptor, sector, years, his role, themes, the
 *           one-line outcome, and scale chips only where the block is public
 *   full    adds sponsor, reporting line, every outcome with its figure,
 *           technologies, and an anchor for links from the matrix
 */
export function ProgrammeLedger({
  programmes,
  variant,
}: {
  programmes: readonly ProgrammeT[]
  variant: "public" | "full"
}) {
  const rows = realProgrammes(
    variant === "public" ? programmes.filter((p) => p.visibility === "public") : programmes,
  )
  if (rows.length === 0) return null
  const full = variant === "full"

  return (
    <ol className={styles.ledger}>
      {rows.map((p, i) => {
        const client = clientLabel(p)
        const span = formatSpan(p.start, p.end)
        const geos = txts(p.geographies)
        const themes = programmeThemes(p)
        const scale = programmeScale(p, !full)
        const outcome = full ? null : headlineOutcome(p)
        const outcomes = full
          ? p.outcomes
              .map((o) => ({
                id: o.id,
                value: formatValue(o.value, o.unit),
                metric: txt(o.metric),
                statement: txt(o.statement),
                timeframe: txt(o.timeframe),
              }))
              .filter((o) => o.statement || (o.value && o.metric))
          : []
        const tech = full ? txts(p.technologies) : []
        return (
          <li
            key={p.id}
            id={full ? programmeAnchor(p) : undefined}
            className={styles.ledgerRow}
          >
            <p className={styles.ledgerNo} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </p>
            <div className={styles.ledgerMain}>
              <h3 className={styles.ledgerTitle}>{txt(p.title)}</h3>
              {txt(p.summary) ? <p className={styles.ledgerSummary}>{txt(p.summary)}</p> : null}
              {outcome ? (
                <p className={styles.ledgerOutcome}>
                  <span className={styles.ledgerOutcomeMark} aria-hidden="true">
                    →
                  </span>{" "}
                  {outcome}
                </p>
              ) : null}
              {outcomes.length > 0 ? (
                <ul className={styles.outcomeList}>
                  {outcomes.map((o) => (
                    <li key={o.id} className={styles.outcomeItem}>
                      {o.value ? <span className={styles.outcomeValue}>{o.value}</span> : null}
                      <span className={styles.outcomeText}>
                        {o.statement ?? o.metric}
                        {o.timeframe ? (
                          <span className={styles.outcomeWhen}> · {o.timeframe}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className={styles.ledgerChips}>
                <Chips items={themes} label="Themes" />
                <Chips items={scale} tone="solid" label="Scale" />
              </div>
              {tech.length > 0 ? (
                <p className={styles.ledgerTech}>
                  <span className={styles.metaKey}>Technologies</span> {tech.join(" · ")}
                </p>
              ) : null}
            </div>
            <dl className={styles.ledgerMeta}>
              {client ? (
                <div>
                  <dt>Client</dt>
                  <dd>{client}</dd>
                </div>
              ) : null}
              {txt(p.sector) ? (
                <div>
                  <dt>Sector</dt>
                  <dd>{txt(p.sector)}</dd>
                </div>
              ) : null}
              {geos.length > 0 ? (
                <div>
                  <dt>Geography</dt>
                  <dd>{geos.join(" · ")}</dd>
                </div>
              ) : null}
              {span ? (
                <div>
                  <dt>Years</dt>
                  <dd>{span}</dd>
                </div>
              ) : null}
              {txt(p.role) ? (
                <div>
                  <dt>Role</dt>
                  <dd>{txt(p.role)}</dd>
                </div>
              ) : null}
              {full && txt(p.sponsor) ? (
                <div>
                  <dt>Sponsor</dt>
                  <dd>{txt(p.sponsor)}</dd>
                </div>
              ) : null}
              {full && txt(p.reportingLine) ? (
                <div>
                  <dt>Reporting to</dt>
                  <dd>{txt(p.reportingLine)}</dd>
                </div>
              ) : null}
            </dl>
          </li>
        )
      })}
    </ol>
  )
}
