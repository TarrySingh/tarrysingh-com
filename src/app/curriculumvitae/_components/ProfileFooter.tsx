import Link from "next/link"
import { PROFILE_PATHS } from "@/lib/cv/config"
import { formatDate, txt } from "@/lib/cv/format"
import type { ProfileT } from "@/lib/cv/schema"
import styles from "../profile.module.css"

/** Paper footer: contact alias, privacy notice, last updated, closing line. */
export function ProfileFooter({
  profile,
  generatedAt,
  note,
}: {
  profile: ProfileT | null
  generatedAt: string
  note?: string
}) {
  const email = txt(profile?.contact?.email)
  const closing = txt(profile?.closingLine?.text)
  return (
    <footer className={styles.footer}>
      <div className="syn-column">
        <dl className={styles.footerGrid}>
          {email ? (
            <div>
              <dt className={styles.footerLabel}>{txt(profile?.contact?.label) ?? "Contact"}</dt>
              <dd>
                <a href={`mailto:${email}`} className={styles.link}>
                  {email}
                </a>
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
              <time dateTime={generatedAt}>{formatDate(generatedAt)}</time>
            </dd>
          </div>
        </dl>
        {note ? <p className={styles.footerNote}>{note}</p> : null}
        {closing ? <p className={styles.closing}>{closing}</p> : null}
      </div>
    </footer>
  )
}
