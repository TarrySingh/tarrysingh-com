"use client"

import { useEffect, useState } from "react"

/**
 * Dispatches v2 — "The Read" light/dark toggle.
 *
 * Owns the `data-read-mode` attribute on <article id="read-root">
 * imperatively (the article is server-rendered with data-read-mode="light"
 * + suppressHydrationWarning; a no-flash inline script in the page flips
 * it to "dark" pre-paint if stored). This button just toggles + persists.
 * Mermaid diagrams re-theme off the same attribute via a MutationObserver.
 */
export function ReadModeToggle() {
  const [mode, setMode] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = document.getElementById("read-root")
    const current =
      (root?.getAttribute("data-read-mode") as "light" | "dark" | null) ??
      "light"
    setMode(current === "dark" ? "dark" : "light")
  }, [])

  function toggle() {
    const root = document.getElementById("read-root")
    if (!root) return
    const next =
      root.getAttribute("data-read-mode") === "dark" ? "light" : "dark"
    root.setAttribute("data-read-mode", next)
    setMode(next)
    try {
      localStorage.setItem("dispatch-read-mode", next)
    } catch {
      /* private mode / storage disabled — toggle still works for the session */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      data-read-pill
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={mode === "dark"}
      title={mode === "dark" ? "Light mode" : "Dark mode"}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-navy-200 bg-white/60 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-500 transition-colors hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1"
      style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
    >
      <span aria-hidden="true">{mode === "dark" ? "☼" : "☾"}</span>
      <span>{mode === "dark" ? "Light" : "Dark"}</span>
    </button>
  )
}
