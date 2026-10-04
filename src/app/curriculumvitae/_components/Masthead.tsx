import Image from "next/image"
import type { ReactNode } from "react"
import { cefrLabel, txt } from "@/lib/cv/format"
import { SEAT_LABELS } from "@/lib/cv/programmes"
import type { ExportData } from "@/lib/cv/schema"
import styles from "../profile.module.css"

type MastheadData = Pick<ExportData, "profile" | "languages" | "matrix" | "openness">

/**
 * Seats shown under the name: the owner's target seats when they are
 * public, otherwise the seats the leadership matrix covers.
 */
export function seatsOf(data: MastheadData): string[] {
  const target = (data.openness?.targetSeats ?? [])
    .slice()
    .sort((a, b) => (a.emphasis === b.emphasis ? 0 : a.emphasis === "primary" ? -1 : 1))
    .map((s) => txt(s.title))
    .filter((s): s is string => s != null)
  if (target.length > 0) return target
  const covered = new Set(data.matrix.filter((c) => txt(c.competency)).map((c) => c.seat))
  return (["CEO", "CAIO", "CTO"] as const).filter((s) => covered.has(s)).map((s) => SEAT_LABELS[s])
}

/** The midnight masthead: folio row, Gloock name, positioning, colophon. */
export function Masthead({
  data,
  folioLeft,
  folioRight,
  children,
}: {
  data: MastheadData
  folioLeft: ReactNode
  folioRight: ReactNode
  children?: ReactNode
}) {
  const profile = data.profile
  const positioning = txt(profile?.positioning)
  const base = txt(profile?.base)
  const seats = seatsOf(data)
  const languages = data.languages
    .map((l) => ({ id: l.id, name: txt(l.language), level: cefrLabel(l.level) }))
    .filter((l) => l.name)
  const portrait =
    profile?.portrait && txt(profile.portrait.src)?.startsWith("/") ? profile.portrait : null
  const credentials = txt(profile?.postNominals)

  return (
    <header className={styles.masthead}>
      <div className={`syn-column ${styles.fade}`}>
        <p className={styles.folioRow}>
          <span>{folioLeft}</span>
          <span>{folioRight}</span>
        </p>
        <div className={portrait ? styles.mastGrid : undefined}>
          <div>
            <h1 className={styles.name}>
              {profile?.name ?? "Executive profile"}
              {credentials ? <span className={styles.postNominals}>{credentials}</span> : null}
            </h1>
            {positioning ? <p className={styles.positioning}>{positioning}</p> : null}
          </div>
          {portrait ? (
            <figure className={styles.portrait}>
              <span className={styles.portraitFrame}>
                <Image
                  src={txt(portrait.src)!}
                  alt={portrait.alt}
                  fill
                  sizes="(min-width: 1024px) 240px, 160px"
                  className={styles.portraitImg}
                  priority
                />
              </span>
              {txt(portrait.credit) ? (
                <figcaption className={styles.portraitCredit}>{txt(portrait.credit)}</figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>
        {seats.length + languages.length > 0 || base ? (
          <dl className={styles.colophon}>
            {seats.length > 0 ? (
              <div>
                <dt>Seats</dt>
                <dd>
                  <ul className={styles.seatList}>
                    {seats.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {base ? (
              <div>
                <dt>Base</dt>
                <dd>{base}</dd>
              </div>
            ) : null}
            {languages.length > 0 ? (
              <div>
                <dt>Languages</dt>
                <dd>
                  <ul className={styles.inlineList}>
                    {languages.map((l) => (
                      <li key={l.id}>
                        {l.name}
                        {l.level ? <span className={styles.level}> {l.level}</span> : null}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {children}
      </div>
    </header>
  )
}
