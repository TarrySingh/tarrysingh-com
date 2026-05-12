type Tone = "amber" | "rose" | "violet" | "teal"

const toneToken: Record<Tone, string> = {
  amber: "var(--memphis-amber)",
  rose: "var(--memphis-rose)",
  violet: "var(--symphony-violet)",
  teal: "var(--memphis-teal)",
}

type NumberedDiskProps = {
  number: string | number
  tone?: Tone
  size?: number
  className?: string
}

export function NumberedDisk({
  number,
  tone = "amber",
  size = 64,
  className = "",
}: NumberedDiskProps) {
  return (
    <span
      aria-hidden
      className={`syn-display inline-flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: toneToken[tone],
        color: "var(--bg-deep)",
        fontSize: Math.round(size * 0.42),
        letterSpacing: 0,
        lineHeight: 1,
      }}
    >
      {number}
    </span>
  )
}
