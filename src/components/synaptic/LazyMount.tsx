"use client"

/**
 * LazyMount — defers mounting heavy client islands (the interactive plates)
 * until they are near the viewport, so a gallery of a dozen-plus instruments
 * doesn't initialise all at once on first paint.
 *
 * SSR-safe: server and first client render both emit the same empty,
 * `minHeight`-sized placeholder (no hydration mismatch). Once the
 * IntersectionObserver fires, the children mount and fade in. The reserved
 * `minHeight` keeps scroll offsets — and therefore JumpNav anchors — stable
 * as plates appear.
 */

import { useEffect, useRef, useState, type ReactNode } from "react"

export function LazyMount({
  children,
  minHeight = 480,
  rootMargin = "600px",
  className,
}: {
  children: ReactNode
  /** reserved height (px) of the placeholder before mount — prevents layout shift */
  minHeight?: number
  /** how early to mount, relative to the viewport */
  rootMargin?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown, rootMargin])

  return (
    <div ref={ref} className={className} style={!shown ? { minHeight } : undefined}>
      {shown ? <div className="sw3-fade-in">{children}</div> : null}
    </div>
  )
}
