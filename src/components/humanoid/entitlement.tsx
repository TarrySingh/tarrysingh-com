"use client"

/**
 * The single premium-gating seam.
 *
 * PRODUCTION-SAFE BY DEFAULT: there is NO free unlock. `demo` is off unless
 * NEXT_PUBLIC_HA_DEMO === "1" (a local/dev-only escape hatch), so the
 * "Preview (demo)" buttons never render in production and `grant()` is a
 * no-op unless demo is explicitly on. Every buy path goes to Stripe.
 *
 * Stripe: set per-SKU Payment Link URLs as env vars on the project
 * (NEXT_PUBLIC_STRIPE_LINK_*). `checkout()` sends the buyer straight to the
 * Stripe hosted payment page and NEVER grants access locally. If a link is
 * not configured it falls back to the booking page — it never silently
 * unlocks. (Post-payment entitlement provisioning — webhook → store →
 * server-verified `has()` — is Phase 2; until then `has()` only returns true
 * for a demo grant in a dev build.)
 */

import { useState, useEffect, type ReactNode } from "react"

interface Entitlement {
  demo: boolean
  has(sku: string): boolean
  grant(sku: string): void
  checkout(sku: string): Promise<boolean>
}

// Dev-only preview. Unset / "0" in production → demo is off, content stays locked.
const DEMO = process.env.NEXT_PUBLIC_HA_DEMO === "1"

// High-touch sales fallback when a Stripe Payment Link is not configured.
const BOOKING_URL = "https://www.earthscan.io/book-a-meeting"

// Stripe Payment Links (public URLs — safe to inline; NOT secret keys).
// Create them in the Stripe dashboard and paste as env vars on the project.
const STRIPE_LINKS: Record<string, string | undefined> = {
  "full-package": process.env.NEXT_PUBLIC_STRIPE_LINK_FULL,
  "workshop": process.env.NEXT_PUBLIC_STRIPE_LINK_WORKSHOP || process.env.NEXT_PUBLIC_STRIPE_LINK_FULL,
  "certification": process.env.NEXT_PUBLIC_STRIPE_LINK_CERTIFICATION || process.env.NEXT_PUBLIC_STRIPE_LINK_FULL,
}

export const HAEntitlement: Entitlement = {
  demo: DEMO,
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
    // Hard guard: never grant access outside an explicit dev demo build.
    if (!this.demo) return
    try { sessionStorage.setItem("ha-ent:" + sku, "1") } catch { /* ignore */ }
    try { window.dispatchEvent(new Event("ha-entitlement-change")) } catch { /* ignore */ }
  },
  async checkout(sku) {
    // Always send to payment — never grant locally.
    const link = STRIPE_LINKS[sku] ?? STRIPE_LINKS["full-package"]
    if (link) { window.location.href = link; return false }
    // No Stripe link configured yet → high-touch booking, still no free unlock.
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
              <button className="gate-btn" onClick={buy}>{cta || "Get access"} ↗</button>
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
        <a className="pkg-btn gold" href="/humanoid/deck">Open the full deck — native ↗</a>
        <a className="pkg-btn ghost" href="/humanoid/deck?print=1">Print / save as PDF</a>
        <div className="pkg-note done">✓ Full package unlocked — the workshop pages, labs, certification &amp; downloads are open.</div>
      </div>
    )
  }
  return (
    <div className="pkg-cta">
      <button className="pkg-btn gold" onClick={buy}>Get the full package ↗</button>
      {HAEntitlement.demo && <button className="pkg-btn ghost" onClick={() => HAEntitlement.grant("full-package")}>Preview (demo)</button>}
      <a className="pkg-btn ghost" href="/humanoid/deck">Browse the deck — workshop pages locked ↗</a>
      <div className="pkg-note">The full deck is native now — every page rebuilt, the data live. The 60 workshop pages, the labs and certification unlock on purchase.</div>
    </div>
  )
}
