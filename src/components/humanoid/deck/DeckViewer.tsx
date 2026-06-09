"use client"

/**
 * The Living Report — present-mode deck viewer.
 *
 * One slide at a time on a 16:9 stage. ←/→/Space/PageUp/PageDown step,
 * Home/End jump, C toggles the contents drawer, Esc closes it. The
 * current position syncs to ?s=N (deep-linkable); the stage remounts
 * per slide so each turn plays its entrance cascade. Workshop slides
 * render behind the gold gate until the full-package entitlement is
 * granted (same seam as the canvas; demo mode for Phase A/B).
 */

import { useState, useEffect, useCallback, type ReactNode, type CSSProperties } from "react"
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

function DeckGate({ children }: { children: ReactNode }) {
  const [ok, grant] = useFullPackage()
  const buy = async () => { await HAEntitlement.checkout("full-package") }
  return (
    <div className={"gate " + (ok ? "open" : "locked")}>
      <div className="gate-content">{children}</div>
      {!ok && (
        <div className="gate-overlay">
          <div className="gate-card">
            <div className="gate-lock" />
            <div className="gate-k">Workshop module</div>
            <h3 className="gate-t">This page is part of the premium workshop</h3>
            <p className="gate-d">The 60 hands-on workshop pages unlock with the full package — together with the labs, the certification track, and download access.</p>
            <div className="gate-btns">
              {HAEntitlement.demo && <button className="gate-btn ghost" onClick={grant}>Preview (demo)</button>}
              <button className="gate-btn" onClick={buy}>Unlock the full package ↗</button>
            </div>
            <div className="gate-note">Licensed per cohort · tarrysingh.com</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DeckViewer() {
  const total = SLIDES.length
  const [i, setI] = useState(0)
  const [toc, setToc] = useState(false)
  const [entitled] = useFullPackage()

  // read ?s= on mount; keep the URL in sync as the reader moves
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("s")
    const n = p ? parseInt(p, 10) : NaN
    if (!isNaN(n) && n >= 1 && n <= total) setI(n - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    window.history.replaceState(null, "", `?s=${i + 1}`)
  }, [i])

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(total - 1, n))), [total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      switch (e.key) {
        case "ArrowRight": case " ": case "PageDown": e.preventDefault(); setToc(false); go(i + 1); break
        case "ArrowLeft": case "PageUp": e.preventDefault(); setToc(false); go(i - 1); break
        case "Home": e.preventDefault(); go(0); break
        case "End": e.preventDefault(); go(total - 1); break
        case "c": case "C": setToc((t) => !t); break
        case "Escape": setToc(false); break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [i, go, total])

  const slide = SLIDES[i]
  const chap = slide.chap ?? "var(--accent)"
  const body = renderSlide(slide)

  return (
    <div className="hd-viewer" style={{ "--chap": chap } as CSSProperties}>
      <div className="hd-top">
        <a className="hd-brand" href="/humanoid"><span className="tk" />{DECK_TITLE}<em>{DECK_EDITION}</em></a>
        <div className="hd-top-right">
          <span className="hd-count">{String(i + 1).padStart(2, "0")} / {total}</span>
          <button className="hd-btn" onClick={() => setToc((t) => !t)}>Contents <span className="hd-key">C</span></button>
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
              const t =
                s.kind === "title" ? s.title.replace("\n", " ") :
                s.kind === "divider" ? `${s.part} — ${s.title}` :
                s.kind === "case" ? `${s.robot} at ${s.co}` :
                s.title
              return (
                <button key={n} className={"hd-toc-item" + (n === i ? " on" : "")} onClick={() => { go(n); setToc(false) }}>
                  <span className="hd-toc-n">{String(n + 1).padStart(2, "0")}</span>
                  <span className="hd-toc-t">{t}</span>
                  {s.locked && !entitled && <span className="hd-toc-lock">locked</span>}
                </button>
              )
            })}
          </div>
        ))}
        <div className="hd-drawer-foot">← → navigate · C contents · vertical slice — 10 of ~280 pages</div>
      </div>
      {toc && <button className="hd-scrim" onClick={() => setToc(false)} aria-label="Close contents" />}
    </div>
  )
}
