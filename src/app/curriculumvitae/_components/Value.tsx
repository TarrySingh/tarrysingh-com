import { Fragment } from "react"
import { formatPoint } from "@/lib/cv/format"
import { isPlaceholder } from "@/lib/cv/placeholder"
import styles from "../profile.module.css"

/**
 * Renders one content value. A `[PLACEHOLDER: …]` value is marked up so it
 * can never be mistaken for final copy (mono, dashed underline,
 * data-placeholder for QA sweeps).
 */
export function Value({ text }: { text: string | number | null | undefined }) {
  if (text == null || text === "") return null
  if (isPlaceholder(text)) {
    return (
      <span className={styles.placeholder} data-placeholder="">
        {text}
      </span>
    )
  }
  return <>{text}</>
}

/** Start–end with an en dash; either end may be a placeholder or "present". */
export function DateRange({
  start,
  end,
}: {
  start: string | number
  end: string | number
}) {
  return (
    <>
      <Value text={formatPoint(start)} />
      {"–"}
      <Value text={formatPoint(end)} />
    </>
  )
}

/** Values joined by a middot, each rendered through <Value>. */
export function ValueList({ items }: { items: Array<string | number> }) {
  return (
    <>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 ? " · " : null}
          <Value text={item} />
        </Fragment>
      ))}
    </>
  )
}
