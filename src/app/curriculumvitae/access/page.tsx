import type { Metadata } from "next"
import Link from "next/link"
import { PROFILE_PATHS, PROFILE_ROBOTS_NEVER } from "@/lib/cv/config"
import styles from "../profile.module.css"
import { AccessForms } from "./AccessForms"

export const metadata: Metadata = {
  title: "Access",
  robots: PROFILE_ROBOTS_NEVER,
}

/**
 * Executive profile · access (Phase 1: UI only).
 * Code entry and request-access forms that post nowhere yet. Phase 3 adds
 * /api/cv/redeem, /api/cv/request-access and the signed session cookie.
 */
export default function ProfileAccessPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div className={`syn-column ${styles.fade}`}>
          <p className={styles.folioRow}>
            <Link href={PROFILE_PATHS.root} className={styles.folioLink}>
              Folio · Executive profile
            </Link>
            <span>Access</span>
          </p>
          <h1 className={styles.pageTitle}>Access</h1>
          <p className={styles.pageSubtitle}>
            For retained search firms and nomination committees.
          </p>
        </div>
      </header>

      <main className={styles.paper}>
        <div className="syn-column">
          <p className={styles.notice} role="note">
            <strong>Access opens soon.</strong> These forms are not connected yet:
            nothing you enter here is sent or stored.
          </p>
          <AccessForms privacyHref={PROFILE_PATHS.privacy} />
          <p className={styles.closing}>
            Nothing on this page leaves your browser until access opens.
          </p>
        </div>
      </main>
    </>
  )
}
