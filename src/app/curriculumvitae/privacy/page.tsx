import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { PROFILE_PATHS } from "@/lib/cv/config"
import { formatDate, txt } from "@/lib/cv/format"
import { getPublicProfile } from "@/lib/cv/public-profile"
import styles from "../profile.module.css"

export const metadata: Metadata = {
  title: "Privacy notice",
}

/**
 * Executive profile · privacy notice: the information required by Articles
 * 13 and 14 GDPR for people who view the profile, request access or use an
 * access code. It describes the processing the access build performs.
 */

const PRIVACY_NOTICE_VERSION = "1.0"
const PRIVACY_NOTICE_DATE = "2026-10-04T00:00:00.000Z"

function sections(contact: ReactNode): Array<{ title: string; body: ReactNode }> {
  return [
    {
      title: "Who is responsible for your data",
      body: (
        <>
          <p>
            The controller is Tarry Singh, acting in a professional capacity as the
            owner of this profile.
          </p>
          <p>Contact for anything in this notice: {contact}.</p>
          <p>
            No data protection officer is appointed; the processing described here
            is small in scale and does not require one.
          </p>
        </>
      ),
    },
    {
      title: "Who this notice is for",
      body: (
        <p>
          Search partners, research associates, members of nomination committees and
          in-house recruiters who view this profile, request access to the dossier,
          or use an access code.
        </p>
      ),
    },
    {
      title: "What is collected",
      body: (
        <ul>
          <li>
            When you request access: your name, work email, firm and role, a short
            description of the mandate, an optional message, and the time you
            acknowledged this notice with its version.
          </li>
          <li>
            When you use an access code: when the code was used, when the dossier
            was viewed and which documents were downloaded, a keyed one-way hash of
            your IP address (never the address itself), a shortened browser
            identifier, and your country as inferred from the connection.
          </li>
          <li>
            Each document you download carries your name, firm and a reference, so
            that a forwarded copy can be traced to the access it came from.
          </li>
          <li>
            One strictly necessary session cookie, set only after a code is
            accepted. No analytics, advertising or third-party cookies.
          </li>
        </ul>
      ),
    },
    {
      title: "Where it comes from",
      body: (
        <p>
          From you. Where a code is issued before you make contact, your business
          contact details come from your own correspondence with Tarry Singh.
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
            keeping a record of who received which documents. These interests are
            balanced against yours by collecting little, keeping it briefly and
            never using it for anything else.
          </p>
          <p>
            Your details are not used for marketing and are not added to any mailing
            list.
          </p>
        </>
      ),
    },
    {
      title: "Who receives it",
      body: (
        <>
          <p>Three processors, each under a data processing agreement:</p>
          <ul>
            <li>Vercel, which hosts the site and serves every page;</li>
            <li>Supabase, which holds the access records and the private documents;</li>
            <li>Resend, which delivers the notification email when you make a request.</li>
          </ul>
          <p>Nothing is sold or shared for marketing.</p>
        </>
      ),
    },
    {
      title: "Transfers outside the EEA",
      body: (
        <p>
          Where a processor handles data outside the European Economic Area, the
          transfer relies on the EU–US Data Privacy Framework or on the European
          Commission&rsquo;s standard contractual clauses.
        </p>
      ),
    },
    {
      title: "How long it is kept",
      body: (
        <p>
          Access and download records, and requests that were declined or are no
          longer active, are deleted after twelve months.
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
            <li>Objection to processing based on legitimate interests (Article 21)</li>
          </ul>
          <p>To exercise any of them, write to {contact}.</p>
        </>
      ),
    },
    {
      title: "Complaints",
      body: (
        <p>
          You may complain to a data protection supervisory authority, in particular
          in the EU member state where you live or work, or where you believe an
          infringement took place.
        </p>
      ),
    },
    {
      title: "Automated decisions",
      body: (
        <p>
          There is no automated decision-making or profiling. Access is granted by a
          person.
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
          Each version is dated and numbered, and the version you acknowledged is
          recorded with your request.
        </p>
      ),
    },
  ]
}

export default function ProfilePrivacyPage() {
  const profile = getPublicProfile().profile
  const email = txt(profile?.contact?.email)
  const contact: ReactNode = email ? (
    <a href={`mailto:${email}`} className={styles.link}>
      {email}
    </a>
  ) : (
    <>
      a reply to the message that carried your access code, or the request form on
      the <Link href={PROFILE_PATHS.access} className={styles.link}>access page</Link>
    </>
  )

  return (
    <>
      <header className={styles.pageHeader}>
        <div className={`syn-column ${styles.fade}`}>
          <p className={styles.folioRow}>
            <Link href={PROFILE_PATHS.root} className={styles.folioLink}>
              Folio · Curriculum vitae
            </Link>
            <span>Privacy</span>
          </p>
          <h1 className={styles.pageTitle}>Privacy notice</h1>
          <p className={styles.pageSubtitle}>
            For people who view this profile, request access or use an access code.
          </p>
        </div>
      </header>

      <main id="main" className={styles.paper}>
        <div className="syn-column">
          <p className={styles.versionLine}>
            Version {PRIVACY_NOTICE_VERSION} ·{" "}
            <time dateTime={PRIVACY_NOTICE_DATE}>{formatDate(PRIVACY_NOTICE_DATE)}</time>
          </p>
          <ol className={styles.legal}>
            {sections(contact).map((s) => (
              <li key={s.title} className={styles.legalSection}>
                <h2 className={styles.legalTitle}>{s.title}</h2>
                <div className={styles.legalBody}>{s.body}</div>
              </li>
            ))}
          </ol>
          <p className={styles.closing}>Collected sparingly, kept briefly, used for nothing else.</p>
        </div>
      </main>
    </>
  )
}
