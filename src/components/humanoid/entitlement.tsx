"use client"

/**
 * The single premium-gating seam (ported from the reference canvas).
 * Phase 1 runs in DEMO mode: "Preview (demo)" grants locally so the gated
 * Workshop + Certification + package are explorable. Phase 2 swaps `has()`
 * (server-verified JWT) and `checkout()` (Stripe Checkout) — nothing else
 * on the page changes. `full-package` unlocks everything.
 */

import { useState, useEffect, type ReactNode } from "react"

interface Entitlement {
  demo: boolean
  has(sku: string): boolean
  grant(sku: string): void
  checkout(sku: string): Promise<boolean>
}

// Where "book a cohort / buy" sends people until Stripe is wired (Phase 2).
const BOOKING_URL = "https://www.earthscan.io/book-a-meeting"

export const HAEntitlement: Entitlement = {
  demo: true, // ← set false in production so content stays locked until purchase
  has(sku) {
    if (typeof window === "undefined") return false
    try {
      if (sessionStorage.getItem("ha-ent:full-package") === "1") return true
      return sessionStorage.getItem("ha-ent:" + sku) === "1"
    } catch {
      return false
    }
  },
  grant(sku) {
    try { sessionStorage.setItem("ha-ent:" + sku, "1") } catch { /* ignore */ }
    try { window.dispatchEvent(new Event("ha-entitlement-change")) } catch { /* ignore */ }
  },
  async checkout(sku) {
    if (this.demo) { this.grant(sku); return true }
    // Phase 2: open Stripe Checkout for `sku`, resolve true only on confirmed payment.
    window.open(BOOKING_URL, "_blank", "noopener")
    return false
  },
}

export function Gate({
  children, sku, title, kind, desc, note, cta,
}: {
  children: ReactNode
  sku: string
  title: string
  kind?: string
  desc: string
  note?: string
  cta?: string
}) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const check = () => { if (HAEntitlement.has(sku)) setOpen(true) }
    check()
    window.addEventListener("ha-entitlement-change", check)
    return () => window.removeEventListener("ha-entitlement-change", check)
  }, [sku])
  const buy = async () => { const ok = await HAEntitlement.checkout(sku); if (ok) setOpen(true) }
  return (
    <div className={"gate " + (open ? "open" : "locked")} data-sku={sku}>
      <div className="gate-content">{children}</div>
      {!open && (
        <div className="gate-overlay">
          <div className="gate-card">
            <div className="gate-lock" />
            <div className="gate-k">{kind || "Premium workshop"}</div>
            <h3 className="gate-t">{title}</h3>
            <p className="gate-d">{desc}</p>
            <div className="gate-btns">
              {HAEntitlement.demo && <button className="gate-btn ghost" onClick={() => HAEntitlement.grant(sku)}>Preview (demo)</button>}
              <button className="gate-btn" onClick={buy}>{cta || "Unlock access"} ↗</button>
            </div>
            <div className="gate-note">{note || "Live workshops & certification — licensed per cohort."}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function PremiumDownloads() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const check = () => { if (HAEntitlement.has("full-package")) setOpen(true) }
    check()
    window.addEventListener("ha-entitlement-change", check)
    return () => window.removeEventListener("ha-entitlement-change", check)
  }, [])
  const buy = async () => { const ok = await HAEntitlement.checkout("full-package"); if (ok) setOpen(true) }
  if (open) {
    return (
      <div className="pkg-cta unlocked">
        <div className="pkg-note done">✓ Full package unlocked — workshop, certification &amp; downloads are open.</div>
        <div className="pkg-note">The complete 375-slide deck is being rebuilt as native pages — it ships, with downloads, in the next release.</div>
      </div>
    )
  }
  return (
    <div className="pkg-cta">
      <button className="pkg-btn gold" onClick={buy}>Unlock the full package ↗</button>
      {HAEntitlement.demo && <button className="pkg-btn ghost" onClick={() => HAEntitlement.grant("full-package")}>Preview (demo)</button>}
      <div className="pkg-note">Unlocks the hands-on labs, certification — and, in the next release, the full 375-slide deck + download access.</div>
    </div>
  )
}
