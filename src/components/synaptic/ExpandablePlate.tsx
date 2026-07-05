"use client"

/**
 * ExpandablePlate — wraps a plate cover so it can be inspected up close.
 *
 * Renders the cover (any 4:5 element — an SVG plate or an <Image>) in a framed
 * card with an "expand" affordance; clicking it opens a full-viewport lightbox
 * that shows the same cover at ~88vh. Close on the ✕, a click outside, or Esc.
 * The cover element is passed as children so this component stays agnostic to
 * SVG-vs-image. Used on the /synaptic/plates wall.
 */

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"

export function ExpandablePlate({
  children,
  label,
  accent = "rgba(233,242,236,0.8)",
  frameBg = "#0a0e16",
}: {
  children: React.ReactNode
  label: string
  accent?: string
  frameBg?: string
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Expand ${label} to full size`}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2"
        style={{
          aspectRatio: "4 / 5",
          background: frameBg,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 22px 70px rgba(0,0,0,0.5)",
        }}
      >
        <span className="absolute inset-0">{children}</span>
        {/* expand hint */}
        <span
          className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[15px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "rgba(8,12,18,0.6)",
            backdropFilter: "blur(6px)",
            color: accent,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          aria-hidden="true"
        >
          ⤢
        </span>
      </button>

      {mounted && open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${label}, full size`}
              onClick={close}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
              style={{
                background: "rgba(4,6,10,0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative overflow-hidden rounded-[var(--radius-card)]"
                style={{
                  height: "min(88vh, 1150px)",
                  aspectRatio: "4 / 5",
                  maxWidth: "94vw",
                  background: frameBg,
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 120px rgba(0,0,0,0.6)",
                }}
              >
                {children}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-opacity hover:opacity-80"
                style={{
                  background: "rgba(8,12,18,0.7)",
                  color: "rgba(233,242,236,0.9)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(6px)",
                }}
              >
                ×
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
