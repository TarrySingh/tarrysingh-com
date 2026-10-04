import { txt } from "@/lib/cv/format"
import type { ProofFigureT } from "@/lib/cv/schema"
import styles from "./cv.module.css"

/** Figures with a real value and label; placeholders are dropped. */
export function realFigures(figures: readonly ProofFigureT[]): ProofFigureT[] {
  return figures.filter((f) => txt(f.value) && txt(f.label))
}

/**
 * "At a glance": 4 to 6 verified figures as one strip on the midnight plate.
 * Gloock numerals, mono labels, hairline dividers.
 */
export function ProofStrip({ figures }: { figures: readonly ProofFigureT[] }) {
  const shown = realFigures(figures).slice(0, 6)
  if (shown.length === 0) return null
  return (
    <dl className={styles.proofStrip} data-count={shown.length}>
      {shown.map((f) => (
        <div key={f.id} className={styles.proof}>
          <dt className={styles.proofLabel}>{txt(f.label)}</dt>
          <dd className={styles.proofValue}>{txt(f.value)}</dd>
          {txt(f.note) ? <dd className={styles.proofNote}>{txt(f.note)}</dd> : null}
        </div>
      ))}
    </dl>
  )
}
