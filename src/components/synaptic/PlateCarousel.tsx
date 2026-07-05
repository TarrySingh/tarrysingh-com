"use client"

/**
 * PlateCarousel — an auto-advancing, full-size showcase of the Synaptic
 * Cartography plates. Each child is one slide (a full plate at featured size).
 * Embla drives the motion; autoplay pauses on hover/focus and is disabled
 * entirely under prefers-reduced-motion. Arrows, dots, and keyboard/ARIA
 * wiring make it navigable without the autoplay.
 */

import { Children, useCallback, useEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"

export function PlateCarousel({
  children,
  autoplayMs = 6500,
}: {
  children: React.ReactNode
  autoplayMs?: number
}) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 32,
  })
  const [selected, setSelected] = useState(0)
  const [snaps, setSnaps] = useState<number[]>([])
  const paused = useRef(false)

  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    setSnaps(embla.scrollSnapList())
    onSelect()
    embla.on("select", onSelect)
    embla.on("reInit", () => {
      setSnaps(embla.scrollSnapList())
      onSelect()
    })
  }, [embla, onSelect])

  // Autoplay: honour reduced-motion, pause on hover/focus.
  useEffect(() => {
    if (!embla) return
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return
    const id = setInterval(() => {
      if (!paused.current) embla.scrollNext()
    }, autoplayMs)
    return () => clearInterval(id)
  }, [embla, autoplayMs])

  const prev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const next = useCallback(() => embla && embla.scrollNext(), [embla])
  const scrollTo = useCallback(
    (i: number) => embla && embla.scrollTo(i),
    [embla],
  )

  const arrowStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
    color: "var(--ink)",
    borderColor: "var(--syn-hair, rgba(233,242,236,0.18))",
    background: "rgba(10,16,24,0.55)",
    backdropFilter: "blur(6px)",
  }

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Synaptic Cartography plates"
      onMouseEnter={() => {
        paused.current = true
      }}
      onMouseLeave={() => {
        paused.current = false
      }}
      onFocusCapture={() => {
        paused.current = true
      }}
      onBlurCapture={() => {
        paused.current = false
      }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {Children.map(children, (child, i) => (
            <div
              className="min-w-0 shrink-0 grow-0 basis-full px-2 sm:px-4"
              role="group"
              aria-roledescription="slide"
              aria-label={`Plate ${i + 1} of ${Children.count(children)}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* arrows */}
      <button
        type="button"
        aria-label="Previous plate"
        onClick={prev}
        className="absolute left-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border text-xl transition-opacity hover:opacity-80 sm:flex lg:-left-4"
        style={arrowStyle}
      >
        &lsaquo;
      </button>
      <button
        type="button"
        aria-label="Next plate"
        onClick={next}
        className="absolute right-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border text-xl transition-opacity hover:opacity-80 sm:flex lg:-right-4"
        style={arrowStyle}
      >
        &rsaquo;
      </button>

      {/* dots */}
      <div className="mt-10 flex items-center justify-center gap-2.5">
        {snaps.map((_, i) => {
          const active = i === selected
          return (
            <button
              key={i}
              type="button"
              aria-label={`Go to plate ${i + 1}`}
              aria-current={active}
              onClick={() => scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                height: 7,
                width: active ? 28 : 7,
                background: active
                  ? "var(--ink)"
                  : "var(--syn-hair, rgba(233,242,236,0.28))",
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
