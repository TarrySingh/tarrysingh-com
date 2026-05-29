"use client"

import { useState } from "react"
import { PlateCanvas } from "./PlateCanvas"
import type { PlateRegister } from "@/lib/blog/plate-engine"

/**
 * Dispatches v2 — cover image with graceful fallback.
 *
 * PNG-first: uses the committed publish-time PNG
 * (`/blog/covers/<slug>.png`, or an explicit bespoke `cover`). If that
 * 404s (not generated yet) it falls back to the runtime PlateCanvas —
 * pixel-identical, since both run plate-engine. Once the GitHub Action
 * commits PNGs, every cover is a cached static image with no
 * main-thread cost.
 */
interface Props {
  slug: string
  cover?: string
  register?: PlateRegister
  detail?: "card" | "full"
  /** Intrinsic canvas render size for the fallback. */
  width?: number
  height?: number
  className?: string
}

export function PlateCover({
  slug,
  cover,
  register,
  detail = "card",
  width = 600,
  height = 400,
  className,
}: Props) {
  const [failed, setFailed] = useState(false)
  const src = cover || `/blog/covers/${slug}.png`

  if (failed) {
    return (
      <PlateCanvas
        slug={slug}
        register={register}
        detail={detail}
        width={width}
        height={height}
        className={className}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  )
}
