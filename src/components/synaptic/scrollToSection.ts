/**
 * Jump to an in-page section by id.
 *
 * On the tall syn-* pages the <html> element is the scroller, but a bare
 * #fragment navigation (and CSS scroll-behavior:smooth over a very long
 * distance) can silently stall. We force an instant jump on the scrolling
 * element, which is robust, and update the URL hash without the native jump.
 */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const scroller = (document.scrollingElement ||
    document.documentElement) as HTMLElement
  const top = el.getBoundingClientRect().top + scroller.scrollTop - 16
  const prev = scroller.style.scrollBehavior
  scroller.style.scrollBehavior = "auto"
  scroller.scrollTop = Math.max(0, top)
  scroller.style.scrollBehavior = prev
  window.history.replaceState(null, "", `#${id}`)
}
