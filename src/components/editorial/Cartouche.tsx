import type { ReactNode } from "react"
import { SmallCaps } from "./SmallCaps"

type CartoucheProps = {
  title: string
  meta?: string
  children: ReactNode
  className?: string
}

export function Cartouche({
  title,
  meta,
  children,
  className = "",
}: CartoucheProps) {
  return (
    <figure
      className={`relative rounded-[var(--radius-card)] border p-6 ${className}`}
      style={{
        borderColor: "var(--panel-edge)",
        backgroundColor: "var(--panel-deep)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <header
        className="mb-4 flex items-baseline justify-between gap-4 border-b pb-3"
        style={{ borderColor: "var(--hairline)" }}
      >
        <SmallCaps>{title}</SmallCaps>
        {meta ? (
          <SmallCaps className="text-right">{meta}</SmallCaps>
        ) : null}
      </header>
      {children}
    </figure>
  )
}
