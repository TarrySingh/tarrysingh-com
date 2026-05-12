type PlateNumberProps = {
  numeral: string
  className?: string
}

export function PlateNumber({ numeral, className = "" }: PlateNumberProps) {
  return (
    <span
      aria-hidden
      className={`syn-display ${className}`}
      style={{
        color: "var(--ink-soft)",
        letterSpacing: "var(--track-display)",
        textTransform: "uppercase",
      }}
    >
      {numeral}
    </span>
  )
}
