import Link from "next/link"
import styles from "../profile.module.css"

/**
 * Access forms · plain HTML forms, no client script.
 *
 *   code     POST /api/cv/redeem          field: code
 *   request  POST /api/cv/request-access  fields: name, email, firm, role,
 *            mandate, message, consent, website (honeypot, stays empty)
 *            and t (render time, epoch ms; the server refuses fast fills)
 *
 * Both routes answer a form post with a 303 back to this page carrying
 * ?e=<reason> or ?requested=1, so personal data never enters a URL.
 */

export type AccessStatus = {
  codeError: string | null
  requestError: string | null
  requested: boolean
}

export function AccessForms({
  privacyHref,
  renderedAt,
  status,
}: {
  privacyHref: string
  renderedAt: number
  status: AccessStatus
}) {
  return (
    <div className={styles.forms}>
      <section id="code" aria-labelledby="code-title" className={styles.formCard}>
        <p className={styles.formKicker}>I · Invited readers</p>
        <h2 id="code-title" className={styles.formTitle}>
          Enter an access code
        </h2>
        <p className={styles.formIntro}>
          Codes are issued individually and expire. Enter yours as it appears in
          your invitation; capitals and dashes are optional.
        </p>
        <form method="post" action="/api/cv/redeem">
          <div className={styles.field}>
            <label htmlFor="cv-code" className={styles.label}>
              Access code
            </label>
            <input
              id="cv-code"
              name="code"
              className={`${styles.input} ${styles.codeInput}`}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              required
              maxLength={40}
              aria-describedby={status.codeError ? "cv-code-error cv-code-hint" : "cv-code-hint"}
              aria-invalid={status.codeError ? true : undefined}
            />
            <p id="cv-code-hint" className={styles.hint}>
              Letters and numbers in groups, for example{" "}
              <span className={styles.codeSample}>TS-XXXX-XXXX-XXXX</span>.
            </p>
            {status.codeError ? (
              <p id="cv-code-error" className={styles.error} role="alert">
                {status.codeError}
              </p>
            ) : null}
          </div>
          <button type="submit" className={styles.button}>
            Open the dossier
          </button>
        </form>
      </section>

      <section id="request" aria-labelledby="request-title" className={styles.formCard}>
        <p className={styles.formKicker}>II · Search firms and committees</p>
        <h2 id="request-title" className={styles.formTitle}>
          Request access
        </h2>
        {status.requested ? (
          <div className={styles.success} role="status">
            <p className={styles.successTitle}>Thank you. Your request has arrived.</p>
            <p>
              Every request is read personally, and codes are sent by email. Nothing
              further is needed from you.
            </p>
          </div>
        ) : (
          <>
            <p className={styles.formIntro}>
              For a live mandate. A short note on the seat is enough; no client
              names are needed.
            </p>
            {status.requestError ? (
              <p className={styles.error} role="alert">
                {status.requestError}
              </p>
            ) : null}
            <form method="post" action="/api/cv/request-access">
              <div className={styles.fieldPair}>
                <div className={styles.field}>
                  <label htmlFor="cv-name" className={styles.label}>
                    Full name
                  </label>
                  <input
                    id="cv-name"
                    name="name"
                    className={styles.input}
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="cv-email" className={styles.label}>
                    Work email
                  </label>
                  <input
                    id="cv-email"
                    name="email"
                    className={styles.input}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    maxLength={200}
                  />
                </div>
              </div>
              <div className={styles.fieldPair}>
                <div className={styles.field}>
                  <label htmlFor="cv-firm" className={styles.label}>
                    Firm
                  </label>
                  <input
                    id="cv-firm"
                    name="firm"
                    className={styles.input}
                    type="text"
                    autoComplete="organization"
                    required
                    minLength={2}
                    maxLength={160}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="cv-role" className={styles.label}>
                    Your role<span className={styles.optional}>optional</span>
                  </label>
                  <input
                    id="cv-role"
                    name="role"
                    className={styles.input}
                    type="text"
                    autoComplete="organization-title"
                    maxLength={160}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="cv-mandate" className={styles.label}>
                  The mandate<span className={styles.optional}>optional</span>
                </label>
                <textarea
                  id="cv-mandate"
                  name="mandate"
                  className={styles.textarea}
                  maxLength={1000}
                  aria-describedby="cv-mandate-hint"
                />
                <p id="cv-mandate-hint" className={styles.hint}>
                  Seat, type of organisation and geography.
                </p>
              </div>
              <div className={styles.field}>
                <label htmlFor="cv-message" className={styles.label}>
                  Message<span className={styles.optional}>optional</span>
                </label>
                <textarea id="cv-message" name="message" className={styles.textarea} maxLength={2000} />
              </div>

              {/* Honeypot: hidden from people and assistive technology. */}
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="cv-website">Website</label>
                <input id="cv-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <input type="hidden" name="t" value={String(renderedAt)} />

              <div className={styles.checkRow}>
                <input
                  id="cv-consent"
                  name="consent"
                  value="on"
                  className={styles.checkbox}
                  type="checkbox"
                  required
                  aria-describedby="cv-consent-hint"
                />
                <label htmlFor="cv-consent">
                  I have read the{" "}
                  <Link href={privacyHref} className={styles.link}>
                    privacy notice
                  </Link>
                  .
                </label>
              </div>
              <p id="cv-consent-hint" className={styles.hint}>
                It explains what is kept, why, for how long, and your rights.
              </p>
              <button type="submit" className={styles.button}>
                Request access
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
