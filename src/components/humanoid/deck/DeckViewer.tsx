"use client"

/**
 * The Living Report — present-mode deck viewer.
 *
 * One slide at a time on a 16:9 stage. ←/→/Space/PageUp/PageDown step,
 * Home/End jump, C toggles the contents drawer, G the grid overview,
 * Esc closes either. Position syncs to ?s=N (deep-linkable); the stage
 * remounts per slide so each turn plays its entrance cascade. Workshop
 * slides render behind the gold gate until the full-package entitlement
 * is granted (same seam as the canvas; demo mode until Stripe lands).
 * ?print=1 renders every page stacked and opens the print dialog —
 * the whole curated deck to PDF in one go.
 */

import { useState, useEffect, useCallback, type ReactNode, type CSSProperties } from "react"
import type { Slide } from "./types"
import { SLIDES, TOC, DECK_TITLE, DECK_EDITION } from "./manifest"
import { renderSlide } from "./templates"
import { HAEntitlement } from "@/components/humanoid/entitlement"

function useFullPackage(): [boolean, () => void] {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const check = () => { if (HAEntitlement.has("full-package")) setOk(true) }
    check()
    window.addEventListener("ha-entitlement-change", check)
    return () => window.removeEventListener("ha-entitlement-change", check)
  }, [])
  return [ok, () => HAEntitlement.grant("full-package")]
}

/**
 * The deck's workshop pages ARE the full curriculum — strictly guard-railed:
 * no sneak peek, and the slide content is not rendered behind the gate at all
 * (no blurred free view). Always → Stripe.
 */
function DeckGate({ children }: { children: ReactNode }) {
  const [ok, grant] = useFullPackage()
  const buy = async () => { await HAEntitlement.checkout("full-package") }
  if (ok) return <div className="gate open"><div className="gate-content">{children}</div></div>
  return (
    <div className="gate locked hard">
      <div className="gate-overlay">
        <div className="gate-card">
          <div className="gate-lock" />
          <div className="gate-k">Workshop module · full curriculum</div>
          <h3 className="gate-t">This page is part of the premium curriculum</h3>
          <p className="gate-d">The 60 hands-on workshop pages come with the full package — together with the labs, the certification track, and download access.</p>
          <div className="gate-btns">
            {HAEntitlement.demo && <button className="gate-btn ghost" onClick={grant}>Preview (demo)</button>}
            <button className="gate-btn" onClick={buy}>Get the full package ↗</button>
          </div>
          <div className="gate-note">Licensed per cohort · tarrysingh.com</div>
        </div>
      </div>
    </div>
  )
}

function slideLabel(s: Slide): string {
  switch (s.kind) {
    case "title": return s.title.replace("\n", " ")
    case "divider": return `${s.part} — ${s.title}`
    case "case": return `${s.robot} at ${s.co}`
    default: return s.title
  }
}

/* ---------- print mode: every page stacked, then the print dialog ---------- */
function PrintDeck() {
  useEffect(() => {
    document.documentElement.closest("html")
    const t = setTimeout(() => window.print(), 1400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="hd-print">
      {SLIDES.map((s, n) => (
        <div className="hd-stagewrap" key={n}>
          {s.locked ? <DeckGate>{renderSlide(s)}</DeckGate> : renderSlide(s)}
        </div>
      ))}
    </div>
  )
}

export function DeckViewer() {
  const total = SLIDES.length
  const [i, setI] = useState(0)
  const [toc, setToc] = useState(false)
  const [grid, setGrid] = useState(false)
  const [printMode, setPrintMode] = useState(false)
  const [entitled] = useFullPackage()

  // read ?s= / ?print= on mount; keep ?s= in sync as the reader moves
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get("print") === "1") { setPrintMode(true); return }
    if (q.get("grid") === "1") setGrid(true)
    const n = q.get("s") ? parseInt(q.get("s") as string, 10) : NaN
    if (!isNaN(n) && n >= 1 && n <= total) setI(n - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!printMode) window.history.replaceState(null, "", `?s=${i + 1}`)
  }, [i, printMode])

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(total - 1, n))), [total])

  useEffect(() => {
    if (printMode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      switch (e.key) {
        case "ArrowRight": case " ": case "PageDown": e.preventDefault(); setToc(false); setGrid(false); go(i + 1); break
        case "ArrowLeft": case "PageUp": e.preventDefault(); setToc(false); setGrid(false); go(i - 1); break
        case "Home": e.preventDefault(); go(0); break
        case "End": e.preventDefault(); go(total - 1); break
        case "c": case "C": setGrid(false); setToc((t) => !t); break
        case "g": case "G": case "t": case "T": setToc(false); setGrid((g) => !g); break
        case "Escape": setToc(false); setGrid(false); break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [i, go, total, printMode])

  if (printMode) return <PrintDeck />

  const slide = SLIDES[i]
  const chap = slide.chap ?? "var(--accent)"
  const body = renderSlide(slide)

  return (
    <div className="hd-viewer" style={{ "--chap": chap } as CSSProperties}>
      <div className="hd-top">
        <a className="hd-brand" href="/humanoid"><span className="tk" />{DECK_TITLE}<em>{DECK_EDITION}</em></a>
        <div className="hd-top-right">
          <span className="hd-count">{String(i + 1).padStart(2, "0")} / {total}</span>
          <button className="hd-btn" onClick={() => { setToc(false); setGrid((g) => !g) }}>Grid <span className="hd-key">G</span></button>
          <button className="hd-btn" onClick={() => { setGrid(false); setToc((t) => !t) }}>Contents <span className="hd-key">C</span></button>
        </div>
        <div className="hd-prog" style={{ width: `${((i + 1) / total) * 100}%`, background: chap }} />
      </div>

      <div className="hd-main">
        <button className="hd-arrow hd-prev" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous slide">←</button>
        <div className="hd-stage" key={i}>
          {slide.locked ? <DeckGate>{body}</DeckGate> : body}
        </div>
        <button className="hd-arrow hd-next" onClick={() => go(i + 1)} disabled={i === total - 1} aria-label="Next slide">→</button>
      </div>

      {grid && (
        <div className="hd-grid">
          <div className="hd-grid-head">
            <span className="hd-grid-title">All pages</span>
            <button className="hd-btn" onClick={() => setGrid(false)}>Close <span className="hd-key">Esc</span></button>
          </div>
          <div className="hd-grid-cells">
            {SLIDES.map((s, n) => (
              <button
                key={n}
                className={"hd-cell" + (n === i ? " on" : "")}
                style={{ "--cc": s.chap ?? "var(--accent)" } as CSSProperties}
                onClick={() => { go(n); setGrid(false) }}
              >
                <span className="hd-cell-n"><span>{String(n + 1).padStart(2, "0")}</span><span className="hd-cell-kind">{s.kind}</span></span>
                <span className="hd-cell-t">{slideLabel(s)}</span>
                {s.locked && !entitled && <span className="hd-cell-lock">locked</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={"hd-drawer" + (toc ? " open" : "")}>
        <div className="hd-drawer-head">
          <span>Contents</span>
          <button className="hd-btn" onClick={() => setToc(false)}>Close <span className="hd-key">Esc</span></button>
        </div>
        {TOC.map((g) => (
          <div className="hd-toc-group" key={g.label}>
            <div className="hd-toc-label">{g.label}</div>
            {g.slides.map((n) => {
              const s = SLIDES[n]
              return (
                <button key={n} className={"hd-toc-item" + (n === i ? " on" : "")} onClick={() => { go(n); setToc(false) }}>
                  <span className="hd-toc-n">{String(n + 1).padStart(2, "0")}</span>
                  <span className="hd-toc-t">{slideLabel(s)}</span>
                  {s.locked && !entitled && <span className="hd-toc-lock">locked</span>}
                </button>
              )
            })}
          </div>
        ))}
        <div className="hd-drawer-foot">← → navigate · G grid · C contents · ?print=1 for PDF<br />{total} native pages, rebuilt from all 375 source slides · every figure traces to its source</div>
      </div>
      {toc && <button className="hd-scrim" onClick={() => setToc(false)} aria-label="Close contents" />}
    </div>
  )
}
