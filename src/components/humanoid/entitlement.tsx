"use client"

/**
 * The premium-gating seam — two tiers.
 *
 *  1. PEEKABLE premium (Gate peekable): a sneak peek, capped at 3 tries
 *     (persisted in localStorage). After the third peek the gate closes for
 *     good and only the Stripe buy button remains. A peek NEVER grants
 *     entitlement — it just reveals the content for that view.
 *
 *  2. STRICTLY GUARD-RAILED (Gate without peekable, and the deck's full-
 *     curriculum pages): no peek, ever. Always → Stripe checkout. No free
 *     viewing under any path.
 *
 * There is no free unlock: `demo` is off unless NEXT_PUBLIC_HA_DEMO === "1"
 * (a local/dev-only escape hatch) and `grant()` is a hard no-op otherwise —
 * it can't even be triggered from the console. Every buy goes to a Stripe
 * Payment Link (NEXT_PUBLIC_STRIPE_LINK_*); falls back to the booking page
 * only when no link is configured — never a free unlock.
 */

import { useState, useEffect, useCallback, type ReactNode } from "react"

interface Entitlement {
  demo: boolean
  peekMax: number
  has(sku: string): boolean
  grant(sku: string): void
  peeksLeft(sku: string): number
  peek(sku: string): number
  checkout(sku: string): Promise<boolean>
}

const DEMO = process.env.NEXT_PUBLIC_HA_DEMO === "1"
const PEEK_MAX = 3
const BOOKING_URL = "https://www.earthscan.io/book-a-meeting"

// Stripe Payment Links (public URLs — paste from the Stripe dashboard; NOT secret keys).
const STRIPE_LINKS: Record<string, string | undefined> = {
  "full-package": process.env.NEXT_PUBLIC_STRIPE_LINK_FULL,
  "workshop": process.env.NEXT_PUBLIC_STRIPE_LINK_WORKSHOP || process.env.NEXT_PUBLIC_STRIPE_LINK_FULL,
  "certification": process.env.NEXT_PUBLIC_STRIPE_LINK_CERTIFICATION || process.env.NEXT_PUBLIC_STRIPE_LINK_FULL,
}

export const HAEntitlement: Entitlement = {
  demo: DEMO,
  peekMax: PEEK_MAX,
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
    if (!this.demo) return // hard guard: never grant outside an explicit dev demo build
    try { sessionStorage.setItem("ha-ent:" + sku, "1") } catch { /* ignore */ }
    try { window.dispatchEvent(new Event("ha-entitlement-change")) } catch { /* ignore */ }
  },
  peeksLeft(sku) {
    if (typeof window === "undefined") return PEEK_MAX
    try { return Math.max(0, PEEK_MAX - (parseInt(localStorage.getItem("ha-peek:" + sku) || "0", 10) || 0)) } catch { return 0 }
  },
  peek(sku) {
    try {
      const n = (parseInt(localStorage.getItem("ha-peek:" + sku) || "0", 10) || 0) + 1
      localStorage.setItem("ha-peek:" + sku, String(n))
      return Math.max(0, PEEK_MAX - n)
    } catch { return 0 }
  },
  async checkout(sku) {
    const link = STRIPE_LINKS[sku] ?? STRIPE_LINKS["full-package"]
    if (link) { window.location.href = link; return false }
    window.open(BOOKING_URL, "_blank", "noopener")
    return false
  },
}

export function Gate({
  children, sku, title, kind, desc, note, cta, peekable = false,
}: {
  children: ReactNode
  sku: string
  title: string
  kind?: string
  desc: string
  note?: string
  cta?: string
  /** Peekable premium: a sneak peek capped at 3 tries, then it locks. */
  peekable?: boolean
}) {
  const [entitled, setEntitled] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const [left, setLeft] = useState(PEEK_MAX)

  useEffect(() => {
    const check = () => { if (HAEntitlement.has(sku)) setEntitled(true) }
    check()
    setLeft(HAEntitlement.peeksLeft(sku))
    window.addEventListener("ha-entitlement-change", check)
    return () => window.removeEventListener("ha-entitlement-change", check)
  }, [sku])

  const buy = useCallback(async () => { const ok = await HAEntitlement.checkout(sku); if (ok) setEntitled(true) }, [sku])
  const doPeek = useCallback(() => { setLeft(HAEntitlement.peek(sku)); setPeeked(true) }, [sku])

  const revealed = entitled || peeked
  const canPeek = peekable && !entitled && left > 0

  return (
    <div className={"gate " + (revealed ? "open" : "locked")} data-sku={sku}>
      {peeked && !entitled && (
        <div className="gate-peekbar">
          <span>Sneak peek{left > 0 ? ` · ${left} left` : " · last one"}</span>
          <button onClick={buy}>Get access ↗</button>
        </div>
      )}
      <div className="gate-content">{children}</div>
      {!revealed && (
        <div className="gate-overlay">
          <div className="gate-card">
            <div className="gate-lock" />
            <div className="gate-k">{kind || "Premium workshop"}</div>
            <h3 className="gate-t">{title}</h3>
            <p className="gate-d">{desc}</p>
            <div className="gate-btns">
              {canPeek && <button className="gate-btn ghost" onClick={doPeek}>Sneak peek · {left} left</button>}
              {HAEntitlement.demo && <button className="gate-btn ghost" onClick={() => HAEntitlement.grant(sku)}>Preview (demo)</button>}
              <button className="gate-btn" onClick={buy}>{cta || "Get access"} ↗</button>
            </div>
            <div className="gate-note">{peekable && left === 0 ? "Preview limit reached — get access to continue." : (note || "Live workshops & certification — licensed per cohort.")}</div>
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
  // Strictly guard-railed: the full curriculum always goes to Stripe — no peek, no free view.
  return (
    <div className="pkg-cta">
      <button className="pkg-btn gold" onClick={buy}>Get the full package ↗</button>
      {HAEntitlement.demo && <button className="pkg-btn ghost" onClick={() => HAEntitlement.grant("full-package")}>Preview (demo)</button>}
      <a className="pkg-btn ghost" href="/humanoid/deck">Browse the deck — workshop pages locked ↗</a>
      <div className="pkg-note">The full deck is native — every page rebuilt, the data live. The 60 workshop pages, the labs and certification unlock on purchase.</div>
    </div>
  )
}
