"use client"

import Link from "next/link"
import { useId, useState, type FormEvent } from "react"
import styles from "../profile.module.css"

/**
 * Access forms · UI only (Phase 1).
 *
 * Nothing here is sent or stored. Submitting shows a status message and
 * stops. The inputs deliberately have no `name` attributes, so even without
 * JavaScript a native submission carries no field values (and never puts
 * personal data in a URL).
 *
 * Phase 3 wires these to POST /api/cv/redeem and /api/cv/request-access,
 * adds `name` attributes, a honeypot field and a minimum time-to-submit,
 * and records the privacy notice version with the acknowledgement.
 */

const NOT_CONNECTED =
  "Access opens soon. This form is not connected yet, so nothing was sent or stored."

export function AccessForms({ privacyHref }: { privacyHref: string }) {
  const id = useId()
  const [codeStatus, setCodeStatus] = useState("")
  const [requestStatus, setRequestStatus] = useState("")

  const hold =
    (setStatus: (message: string) => void) => (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setStatus(NOT_CONNECTED)
    }

  const f = (name: string) => `${id}-${name}`

  return (
    <div className={styles.forms}>
      <section aria-labelledby={f("code-title")} className={styles.formCard}>
        <h2 id={f("code-title")} className={styles.formTitle}>
          Enter an access code
        </h2>
        <p className={styles.formIntro}>
          Codes are issued individually and expire. Enter yours exactly as it
          appears in your invitation.
        </p>
        <form noValidate onSubmit={hold(setCodeStatus)}>
          <div className={styles.field}>
            <label htmlFor={f("code")} className={styles.label}>
              Access code
            </label>
            <input
              id={f("code")}
              className={`${styles.input} ${styles.codeInput}`}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              required
              aria-describedby={f("code-hint")}
            />
            <p id={f("code-hint")} className={styles.hint}>
              Letters and numbers in groups, for example{" "}
              <span className={styles.codeSample}>TS-XXXX-XXXX-XX</span>.
            </p>
          </div>
          <button type="submit" className={styles.button}>
            Open the profile
          </button>
          <div role="status" aria-live="polite">
            {codeStatus ? <p className={styles.status}>{codeStatus}</p> : null}
          </div>
        </form>
      </section>

      <section aria-labelledby={f("request-title")} className={styles.formCard}>
        <h2 id={f("request-title")} className={styles.formTitle}>
          Request access
        </h2>
        <p className={styles.formIntro}>
          For a live mandate. A short note on the seat is enough.
        </p>
        <form noValidate onSubmit={hold(setRequestStatus)}>
          <div className={styles.field}>
            <label htmlFor={f("name")} className={styles.label}>
              Full name
            </label>
            <input id={f("name")} className={styles.input} type="text" autoComplete="name" required />
          </div>
          <div className={styles.field}>
            <label htmlFor={f("email")} className={styles.label}>
              Work email
            </label>
            <input
              id={f("email")}
              className={styles.input}
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor={f("firm")} className={styles.label}>
              Firm
            </label>
            <input id={f("firm")} className={styles.input} type="text" autoComplete="organization" required />
          </div>
          <div className={styles.field}>
            <label htmlFor={f("role")} className={styles.label}>
              Your role
            </label>
            <input
              id={f("role")}
              className={styles.input}
              type="text"
              autoComplete="organization-title"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor={f("mandate")} className={styles.label}>
              The mandate
            </label>
            <textarea
              id={f("mandate")}
              className={styles.textarea}
              required
              aria-describedby={f("mandate-hint")}
            />
            <p id={f("mandate-hint")} className={styles.hint}>
              Seat, type of organisation and geography. No client names needed.
            </p>
          </div>
          <div className={styles.field}>
            <label htmlFor={f("message")} className={styles.label}>
              Message<span className={styles.optional}>optional</span>
            </label>
            <textarea id={f("message")} className={styles.textarea} />
          </div>
          <div className={styles.checkRow}>
            <input
              id={f("privacy")}
              className={styles.checkbox}
              type="checkbox"
              required
              aria-describedby={f("privacy-hint")}
            />
            <label htmlFor={f("privacy")}>
              I have read the <Link href={privacyHref} className={styles.link}>privacy notice</Link>.
            </label>
          </div>
          <p id={f("privacy-hint")} className={styles.hint}>
            It explains what is kept, why, for how long, and your rights.
          </p>
          <button type="submit" className={styles.button}>
            Request access
          </button>
          <div role="status" aria-live="polite">
            {requestStatus ? <p className={styles.status}>{requestStatus}</p> : null}
          </div>
        </form>
      </section>
    </div>
  )
}
