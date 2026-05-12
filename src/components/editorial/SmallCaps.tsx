import type { ElementType, ReactNode } from "react"

type SmallCapsProps = {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function SmallCaps({
  children,
  className = "",
  as: As = "span",
}: SmallCapsProps) {
  return <As className={`syn-small-caps ${className}`}>{children}</As>
}
