"use client"

import { useEffect, useRef } from "react"
import { renderPlate, type PlateRegister } from "@/lib/blog/plate-engine"

/**
 * Dispatches v2 — runtime plate cover (browser canvas).
 *
 * Used as the studio editor live preview + the on-page fallback when a
 * committed PNG cover is absent. Production covers are the pre-rendered
 * PNGs (same plate-engine, rendered headless at publish time), so this
 * is intentionally the secondary path — but it's pixel-identical to the
 * PNG because both run plate-engine.renderPlate.
 */
interface Props {
  slug: string
  register?: PlateRegister
  accent?: number
  detail?: "card" | "full"
  className?: string
  /** Intrinsic render size; CSS scales it to the container. */
  width?: number
  height?: number
}

export function PlateCanvas({
  slug,
  register,
  accent = 1,
  detail = "card",
  className,
  width = 600,
  height = 380,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    renderPlate(ctx, width, height, { slug, register, accent, detail })
  }, [slug, register, accent, detail, width, height])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  )
}
