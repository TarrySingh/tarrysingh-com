import type { Metadata } from "next"
import Link from "next/link"
import { PROFILE_PATHS, PROFILE_ROBOTS_NEVER } from "@/lib/cv/config"
import styles from "../profile.module.css"
import { AccessForms, type AccessStatus } from "./AccessForms"

export const metadata: Metadata = {
  title: "Access",
  robots: PROFILE_ROBOTS_NEVER,
}

/**
 * Executive profile · access. Enter a code (POST /api/cv/redeem) or request
 * one (POST /api/cv/request-access). Both routes answer with a 303 back to
 * this page, carrying only a reason code (?e=…) or ?requested=1.
 */

const CODE_ERRORS: Record<string, string> = {
  invalid:
    "That code was not accepted. Check it against your invitation; codes expire, and each can be withdrawn.",
  locked: "Too many attempts from this connection. Please wait fifteen minutes and try again.",
  closed: "Access is paused just now. Please try again later.",
}

const REQUEST_ERRORS: Record<string, string> = {
  request_invalid:
    "The request could not be sent. Please check your name, work email and firm, and tick the privacy acknowledgement.",
  request_fast: "That was quicker than expected. Please check the details and send it once more.",
  request_rate: "Several requests have come from this connection. Please try again in an hour.",
  request_closed: "Requests are paused just now. Please try again later.",
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ProfileAccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const e = typeof params.e === "string" ? params.e : null
  const status: AccessStatus = {
    codeError: e && !e.startsWith("request_") ? (CODE_ERRORS[e] ?? CODE_ERRORS.invalid) : null,
    requestError: e && e.startsWith("request_") ? (REQUEST_ERRORS[e] ?? REQUEST_ERRORS.request_invalid) : null,
    requested: params.requested === "1",
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <div className={`syn-column ${styles.fade}`}>
          <p className={styles.folioRow}>
            <Link href={PROFILE_PATHS.root} className={styles.folioLink}>
              Folio · Curriculum vitae
            </Link>
            <span>Access</span>
          </p>
          <h1 className={styles.pageTitle}>The dossier</h1>
          <p className={styles.pageSubtitle}>
            For retained search firms and nomination committees: case studies, the
            full programme record and documents prepared for search.
          </p>
        </div>
      </header>

      <main id="main" className={styles.paper}>
        <div className="syn-column">
          <AccessForms
            privacyHref={PROFILE_PATHS.privacy}
            renderedAt={Date.now()}
            status={status}
          />
          <p className={styles.closing}>References available at the appropriate stage.</p>
        </div>
      </main>
    </>
  )
}
