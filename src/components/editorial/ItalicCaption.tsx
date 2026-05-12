import type { ReactNode } from "react"

type ItalicCaptionProps = {
  children: ReactNode
  className?: string
}

export function ItalicCaption({
  children,
  className = "",
}: ItalicCaptionProps) {
  return <p className={`syn-italic-caption ${className}`}>{children}</p>
}
