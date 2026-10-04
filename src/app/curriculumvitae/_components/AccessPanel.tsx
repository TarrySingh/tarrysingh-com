import { PROFILE_PATHS } from "@/lib/cv/config"
import { txt } from "@/lib/cv/format"
import styles from "../profile.module.css"

const DEFAULT_REFERENCES = "References available at the appropriate stage."

/**
 * "For retained search firms and nomination committees": a midnight
 * cartouche on the paper. The code form is a plain HTML form (no script)
 * that posts to /api/cv/redeem; requests go through the access page.
 */
export function AccessPanel({ referencesPolicy }: { referencesPolicy: string | null | undefined }) {
  const refs = txt(referencesPolicy) ?? DEFAULT_REFERENCES
  return (
    <section id="access" aria-labelledby="access-title" className={styles.accessPanel}>
      <span className={styles.seal} aria-hidden="true">
        TS
      </span>
      <div>
        <p className={styles.accessKicker}>The dossier · by access code</p>
        <h2 id="access-title" className={styles.accessTitle}>
          For retained search firms and nomination committees
        </h2>
        <p className={styles.accessText}>
          A fuller dossier, with case studies, the complete programme record and
          documents prepared for search, is shared individually by access code.
        </p>
        <form method="post" action="/api/cv/redeem" className={styles.panelForm}>
          <label htmlFor="cv-panel-code" className={styles.panelLabel}>
            Access code
          </label>
          <div className={styles.panelRow}>
            <input
              id="cv-panel-code"
              name="code"
              className={styles.panelInput}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="TS-XXXX-XXXX-XX"
              required
              aria-describedby="cv-panel-hint"
            />
            <button type="submit" className={styles.panelButton}>
              Open the dossier
            </button>
          </div>
          <p id="cv-panel-hint" className={styles.panelHint}>
            No code yet?{" "}
            <a href={`${PROFILE_PATHS.access}#request`} className={styles.panelLink}>
              Request access
            </a>{" "}
            with a short note on the mandate.
          </p>
        </form>
        <p className={styles.accessRefs}>{refs}</p>
      </div>
    </section>
  )
}
