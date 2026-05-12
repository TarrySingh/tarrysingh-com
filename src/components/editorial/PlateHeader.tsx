import type { ReactNode } from "react"
import { ItalicCaption } from "./ItalicCaption"
import { SmallCaps } from "./SmallCaps"

type PlateHeaderProps = {
  plateNumber: string
  anno?: string
  fig?: string
  title: string
  subtitle?: ReactNode
  className?: string
}

export function PlateHeader({
  plateNumber,
  anno,
  fig,
  title,
  subtitle,
  className = "",
}: PlateHeaderProps) {
  return (
    <header className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-1">
        <SmallCaps>{`Plate ${plateNumber}`}</SmallCaps>
        {anno ? <SmallCaps>{`Anno ${anno}`}</SmallCaps> : null}
        {fig ? <SmallCaps>{`Fig. ${fig}`}</SmallCaps> : null}
      </div>
      <h1
        className="syn-display"
        style={{
          fontSize: "var(--text-h1)",
          color: "var(--ink)",
          lineHeight: 1.05,
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle ? <ItalicCaption>{subtitle}</ItalicCaption> : null}
    </header>
  )
}
