import type { ReactNode } from "react"
import styles from "./cv.module.css"

/**
 * A numbered section on the paper surface: the numeral and a mono label in
 * the margin, a Gloock title and an optional italic standfirst.
 */
export function Section({
  id,
  numeral,
  label,
  title,
  standfirst,
  wide = false,
  children,
}: {
  id: string
  numeral: string
  label: string
  title: string
  standfirst?: string | null
  /** Full-measure body on large screens (used by the matrix). */
  wide?: boolean
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={wide ? `${styles.section} ${styles.sectionWide}` : styles.section}
    >
      <p className={styles.sectionLabel} aria-hidden="true">
        <span className={styles.sectionNumeral}>{numeral}</span>
        {label}
      </p>
      <div className={styles.sectionBody}>
        <h2 id={`${id}-title`} className={styles.sectionTitle}>
          {title}
        </h2>
        {standfirst ? <p className={styles.standfirst}>{standfirst}</p> : null}
        {children}
      </div>
    </section>
  )
}

/** A block on the midnight plate: "Fig. II" label and a Gloock title. */
export function PlateBlock({
  id,
  fig,
  title,
  standfirst,
  children,
}: {
  id: string
  fig: string
  title: string
  standfirst?: string | null
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={styles.plateBlock}>
      <div className={styles.plateHead}>
        <p className={styles.plateFig}>{fig}</p>
        <h2 id={`${id}-title`} className={styles.plateTitle}>
          {title}
        </h2>
        {standfirst ? <p className={styles.plateStandfirst}>{standfirst}</p> : null}
      </div>
      {children}
    </section>
  )
}

/** Small mono chips: outlined for themes, filled for scale. */
export function Chips({
  items,
  tone = "outline",
  label,
}: {
  items: string[]
  tone?: "outline" | "solid"
  label: string
}) {
  if (items.length === 0) return null
  return (
    <ul className={styles.chips} aria-label={label}>
      {items.map((item) => (
        <li key={item} className={tone === "solid" ? styles.chipSolid : styles.chip}>
          {item}
        </li>
      ))}
    </ul>
  )
}
