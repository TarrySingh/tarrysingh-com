"use client"

/**
 * The Humanoid Ascendancy — shell (ported from the reference canvas).
 * Nav (fixed, scroll-progress bar), ChapterRail (left dot rail tracking the
 * sections), and Reveal (IntersectionObserver fade-in). SSR-safe.
 */

import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from "react"

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [prog, setProg] = useState(0)
  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 40)
      const sc = document.documentElement.scrollHeight - window.innerHeight
      setProg(sc > 0 ? (window.scrollY / sc) * 100 : 0)
    }
    window.addEventListener("scroll", h)
    h()
    return () => window.removeEventListener("scroll", h)
  }, [])
  return (
    <div className={"nav" + (scrolled ? " scrolled" : "")}>
      <a className="logo" href="#top">
        <span className="tk" />
        The Humanoid Ascendancy
      </a>
      <div className="links">
        <a href="#map">Contents</a>
        <a href="#market">Market</a>
        <a href="#chain">Value chain</a>
        <a href="#frameworks">Compare</a>
        <a href="#timeline">Timeline</a>
        <a href="#workshop">Workshop</a>
        <a href="#tools">Tools</a>
      </div>
      <div className="nav-prog" style={{ width: prog + "%" }} />
    </div>
  )
}

const CHAPTERS_RAIL: [string, string, string][] = [
  ["top", "Start", "var(--accent)"], ["map", "Contents", "var(--accent)"], ["market", "Market", "var(--c-cyan)"],
  ["drivers", "Drivers", "var(--c-green)"], ["chain", "Value chain", "var(--c-amber)"], ["ecosystem", "Ecosystem", "var(--c-blue)"],
  ["tech", "Tech", "var(--c-cyan)"], ["compete", "Compare", "var(--c-violet)"], ["concentration", "Concentration", "var(--c-magenta)"], ["frameworks", "Frameworks", "var(--c-blue)"],
  ["roi", "ROI", "var(--c-green)"], ["geo", "Geopolitics", "var(--c-red)"], ["regions", "Regions", "var(--c-violet)"],
  ["timeline", "Timeline", "var(--c-violet)"], ["cases", "Cases", "var(--c-blue)"], ["workshop", "Workshop", "var(--c-magenta)"],
  ["cert", "Certify", "var(--c-cyan)"], ["about", "About", "var(--c-cyan)"], ["package", "Package", "var(--c-amber)"], ["tools", "Toolkit", "var(--accent)"],
]

export function ChapterRail() {
  const [active, setActive] = useState("top")
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive((e.target as HTMLElement).id) }),
      { rootMargin: "-45% 0px -45% 0px" },
    )
    CHAPTERS_RAIL.forEach(([id]) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])
  return (
    <div className="crail">
      {CHAPTERS_RAIL.map(([id, label, color]) => (
        <button
          key={id}
          className={"crail-item" + (active === id ? " on" : "")}
          style={{ "--cc": color } as CSSProperties}
          onClick={() => {
            const el = document.getElementById(id)
            if (el) el.scrollIntoView({ behavior: "smooth" })
          }}
        >
          <span className="crail-tick" />
          <span className="crail-label">{label}</span>
        </button>
      ))}
    </div>
  )
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("in"); io.unobserve(el) } }),
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={"reveal " + className}>
      {children}
    </div>
  )
}
