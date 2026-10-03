import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { PROFILE_PATHS } from "@/lib/cv/config"
import { Value } from "../_components/Value"
import styles from "../profile.module.css"

export const metadata: Metadata = {
  title: "Privacy notice (draft)",
}

/**
 * Executive profile · privacy notice. DRAFT skeleton of the information
 * required by Articles 13 and 14 GDPR for people who view the profile,
 * request access or use an access code. Not in force, not legal advice.
 * The described processing mirrors the planned Phase 3 design; every
 * decision still open is a [PLACEHOLDER]. Review before access opens.
 */

const SECTIONS: Array<{ title: string; body: ReactNode }> = [
  {
    title: "Who is responsible for your data",
    body: (
      <>
        <p>
          The controller is <Value text="[PLACEHOLDER: controller's name and capacity]" />.
        </p>
        <p>
          Contact for anything in this notice:{" "}
          <Value text="[PLACEHOLDER: privacy contact address]" />.
        </p>
        <p>
          <Value text="[PLACEHOLDER: confirm whether a data protection officer is required]" />
        </p>
      </>
    ),
  },
  {
    title: "Who this notice is for",
    body: (
      <p>
        Search partners, research associates, members of nomination committees
        and in-house recruiters who view this profile, request access to the
        detailed profile, or use an access code.
      </p>
    ),
  },
  {
    title: "What is collected",
    body: (
      <>
        <ul>
          <li>
            When you request access: your name, work email, firm and role, a
            short description of the mandate, an optional message, and the time
            you acknowledged this notice with its version.
          </li>
          <li>
            When you use an access code: when the code was used, which pages of
            the detailed profile were viewed and which documents were
            downloaded, a keyed one-way hash of your IP address (never the
            address itself), a shortened browser identifier, and your country as
            inferred from the connection.
          </li>
          <li>
            One strictly necessary session cookie, set only after a code is
            accepted. No analytics, advertising or third-party cookies.
          </li>
        </ul>
        <p>
          <Value text="[PLACEHOLDER: confirm this list against the launched build]" />
        </p>
      </>
    ),
  },
  {
    title: "Where it comes from",
    body: (
      <p>
        Mostly from you. Where a code is issued before you make contact, your
        business contact details may come from{" "}
        <Value text="[PLACEHOLDER: sources, e.g. your own correspondence or your firm's public website]" />.
      </p>
    ),
  },
  {
    title: "Why, and on what legal basis",
    body: (
      <>
        <p>
          Legitimate interests (Article 6(1)(f) GDPR): controlling access to a
          confidential profile, keeping it secure, responding to requests, and
          keeping a record of who received which documents.
        </p>
        <p>
          <Value text="[PLACEHOLDER: summary of the legitimate-interest assessment]" />
        </p>
        <p>
          Your details are not used for marketing and are not added to any
          mailing list.
        </p>
      </>
    ),
  },
  {
    title: "Who receives it",
    body: (
      <>
        <p>
          <Value text="[PLACEHOLDER: processors to confirm · planned: Vercel (hosting), Supabase (database and private file storage; EU region to be verified), Resend (notification email)]" />
        </p>
        <p>Nothing is sold or shared for marketing.</p>
      </>
    ),
  },
  {
    title: "Transfers outside the EEA",
    body: (
      <p>
        <Value text="[PLACEHOLDER: transfer mechanism for any processor outside the EEA, e.g. the EU–US Data Privacy Framework or standard contractual clauses]" />
      </p>
    ),
  },
  {
    title: "How long it is kept",
    body: (
      <p>
        <Value text="[PLACEHOLDER: retention periods · planned: access logs, and declined or stale requests, deleted after 12 months]" />
      </p>
    ),
  },
  {
    title: "Your rights",
    body: (
      <>
        <ul>
          <li>Access to your data (Article 15)</li>
          <li>Correction (Article 16)</li>
          <li>Erasure (Article 17)</li>
          <li>Restriction of processing (Article 18)</li>
          <li>Portability, where it applies (Article 20)</li>
          <li>
            Objection to processing based on legitimate interests (Article 21)
          </li>
        </ul>
        <p>
          To exercise any of them, write to{" "}
          <Value text="[PLACEHOLDER: privacy contact address]" />.
        </p>
      </>
    ),
  },
  {
    title: "Complaints",
    body: (
      <p>
        You may complain to a data protection supervisory authority, in
        particular in the EU member state where you live or work, or where you
        believe an infringement took place:{" "}
        <Value text="[PLACEHOLDER: lead supervisory authority and link]" />.
      </p>
    ),
  },
  {
    title: "Automated decisions",
    body: (
      <p>
        No automated decision-making or profiling is planned. Access is granted
        by a person.
      </p>
    ),
  },
  {
    title: "Do you have to provide it",
    body: <p>No. Without it, access cannot be requested.</p>,
  },
  {
    title: "Changes to this notice",
    body: (
      <p>
        Each version is dated and numbered.{" "}
        <Value text="[PLACEHOLDER: version history]" />
      </p>
    ),
  },
]

export default function ProfilePrivacyPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div className={`syn-column ${styles.fade}`}>
          <p className={styles.folioRow}>
            <Link href={PROFILE_PATHS.root} className={styles.folioLink}>
              Folio · Executive profile
            </Link>
            <span>Privacy · Draft</span>
          </p>
          <h1 className={styles.pageTitle}>Privacy notice</h1>
          <p className={styles.pageSubtitle}>
            For people who view this profile, request access or use an access code.
          </p>
        </div>
      </header>

      <main className={styles.paper}>
        <div className="syn-column">
          <div className={styles.notice} role="note">
            <p>
              <strong>Draft · not in force.</strong> A working skeleton of the
              information required by Articles 13 and 14 GDPR, for review before
              access opens. Bracketed text is still to be decided. This is not
              legal advice.
            </p>
            <p>
              Version <Value text="[PLACEHOLDER: version]" /> · last reviewed{" "}
              <Value text="[PLACEHOLDER: date]" />
            </p>
          </div>

          <ol className={styles.legal}>
            {SECTIONS.map((s) => (
              <li key={s.title} className={styles.legalSection}>
                <h2 className={styles.legalTitle}>{s.title}</h2>
                <div className={styles.legalBody}>{s.body}</div>
              </li>
            ))}
          </ol>

          <p className={styles.closing}>This notice is a draft and is not yet in force.</p>
        </div>
      </main>
    </>
  )
}
