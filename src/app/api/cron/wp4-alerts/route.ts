import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createServiceClient } from "@/lib/supabase/server"
import registry from "@/lib/panoraima/wp4_le_registry.json"
import type { Wp4Registry, Wp4LE } from "@/lib/panoraima/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * WP4 daily material-drop alert digest.
 *
 * Diffs the DEPLOYED LE registry's material files against the
 * `wp4_alert_state` Supabase table. New material in a Learning Event RealAI
 * authors/reviews → a once-daily digest to the responsible teammate
 * (author → Tarry, reviewer → Tannistha + Monira — routing comes straight
 * from registry.realai_board[].realai.roles[].recipients).
 *
 * First run seeds the state silently (no flood). Resend key + Supabase live
 * server-side on Vercel, so nothing is needed on Tarry's Mac.
 *
 * Auth: Vercel attaches `Authorization: Bearer ${CRON_SECRET}` to cron runs.
 * Manual: append `?dry=1` (report only) or `?test=email@…` (sample to one
 * address, no state change) — still requires the bearer.
 */

const FROM = "PANORAIMA WP4 · Monitor <studio@tarrysingh.com>"
const DASHBOARD = "https://www.tarrysingh.com/experiments/panoraima/wps/wp4"
const REG = registry as unknown as Wp4Registry

const ROLE_VERB: Record<string, string> = {
  author: "author", "co-author": "co-author", reviewer: "review",
}

interface Item { code: string; title: string; role: string; file: string; kb: number; key: string }

function fileKey(code: string, f: { rel?: string; name?: string; date?: string; kb?: number }): string {
  return `${code}::${f.rel || f.name || ""}::${f.date || ""}::${f.kb || 0}`
}

function currentItemsByRecipient(): { byEmail: Map<string, Item[]>; allKeys: Set<string> } {
  const byEmail = new Map<string, Item[]>()
  const allKeys = new Set<string>()
  for (const le of REG.realai_board as Wp4LE[]) {
    if (!le.realai.involved) continue
    for (const f of le.materials.files) {
      const key = fileKey(le.code, f)
      allKeys.add(key)
      const recipients = new Set<string>()
      for (const r of le.realai.roles) for (const e of r.recipients) recipients.add(e)
      const role = le.realai.roles[0]?.role || "reviewer"
      for (const email of recipients) {
        const item: Item = { code: le.code, title: le.title || le.code, role, file: f.name, kb: f.kb, key }
        const arr = byEmail.get(email) || []
        arr.push(item)
        byEmail.set(email, arr)
      }
    }
  }
  return { byEmail, allKeys }
}

function personName(email: string): string {
  return REG.roster.find((p) => p.email === email)?.name || email.split("@")[0]
}

function renderEmail(name: string, items: Item[]): { subject: string; html: string } {
  const n = items.length
  const subject = `PANORAIMA WP4 — ${n} new learning-material drop${n === 1 ? "" : "s"} for you`
  const rows = items.map((it) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:ui-monospace,monospace;font-weight:700">${it.code}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${it.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6B7280">${ROLE_VERB[it.role] || it.role}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${it.file} <span style="color:#9CA3AF">(${it.kb} KB)</span></td>
    </tr>`).join("")
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;color:#16181D">
    <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C0492B;font-weight:700;font-family:ui-monospace,monospace">PANORAIMA · WP4 monitor</p>
    <h2 style="margin:4px 0 2px;font-weight:700">Hi ${name},</h2>
    <p style="color:#4F535B;line-height:1.55">${n} new material file${n === 1 ? "" : "s"} just landed in Learning Events you're responsible for. Please take a look and act.</p>
    <table style="border-collapse:collapse;width:100%;font-size:13px;margin:14px 0">
      <thead><tr style="text-align:left;color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:.08em">
        <th style="padding:6px 12px">LE</th><th style="padding:6px 12px">Title</th><th style="padding:6px 12px">Your role</th><th style="padding:6px 12px">File</th>
      </tr></thead><tbody>${rows}</tbody>
    </table>
    <p><a href="${DASHBOARD}" style="display:inline-block;background:#16181D;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Open the WP4 tool →</a></p>
    <p style="color:#6B7280;font-size:12px;line-height:1.55;margin-top:18px">Reviewers: log remarks directly in the SharePoint documents or on the Learning Event's wiki discussion page — never by email — so the review is documented in the right place.</p>
  </div>`
  return { subject, html }
}

export async function GET(req: NextRequest) {
  const authed = req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  const url = new URL(req.url)
  const dry = url.searchParams.get("dry") === "1"
  const testTo = url.searchParams.get("test")
  // ?test is allowed without the cron secret ONLY for a known roster address,
  // so a sample can be fired safely; everything else requires the bearer.
  const testToRoster = testTo && REG.roster.some((p) => p.email === testTo)
  if (!authed && !testToRoster) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { byEmail, allKeys } = currentItemsByRecipient()
  const resendKey = process.env.RESEND_API_KEY
  const resend = resendKey ? new Resend(resendKey) : null

  // --- test mode: sample digest to one address, no state ---
  if (testTo) {
    const sample = [...byEmail.values()].flat().slice(0, 6)
    if (!sample.length) sample.push({ code: "HL-048", title: "(sample) Communication of AI output", role: "reviewer", file: "sample.pptx", kb: 1200, key: "" })
    if (!resend) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })
    const { subject, html } = renderEmail("Tarry", sample)
    const r = await resend.emails.send({ from: FROM, to: [testTo], subject: "[TEST] " + subject, html })
    return NextResponse.json({ test: testTo, items: sample.length, resend: r.error ? r.error : "sent" })
  }

  const sb = createServiceClient()
  const { data: existing, error: readErr } = await sb.from("wp4_alert_state").select("file_key")
  if (readErr) return NextResponse.json({ error: "supabase read", detail: readErr.message }, { status: 500 })
  const seen = new Set((existing || []).map((r) => r.file_key as string))
  const firstRun = seen.size === 0

  // first run → seed baseline silently
  if (firstRun) {
    if (!dry && allKeys.size) {
      await sb.from("wp4_alert_state").upsert(
        [...allKeys].map((k) => ({ file_key: k, le_code: k.split("::")[0] })), { onConflict: "file_key" })
    }
    return NextResponse.json({ seeded: allKeys.size, sent: 0, note: "first run baseline — no emails" })
  }

  // compute new per recipient
  const toSend = new Map<string, Item[]>()
  const newKeys = new Set<string>()
  for (const [email, items] of byEmail) {
    const fresh = items.filter((it) => !seen.has(it.key))
    if (fresh.length) {
      toSend.set(email, fresh)
      fresh.forEach((it) => newKeys.add(it.key))
    }
  }

  if (dry) {
    return NextResponse.json({
      dry: true,
      recipients: [...toSend].map(([e, items]) => ({ email: e, n: items.length, codes: items.map((i) => i.code) })),
    })
  }

  if (!toSend.size) return NextResponse.json({ sent: 0, note: "no new material drops" })
  if (!resend) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })

  const results: Record<string, string> = {}
  const sentKeys = new Set<string>()
  for (const [email, items] of toSend) {
    const { subject, html } = renderEmail(personName(email), items)
    const r = await resend.emails.send({ from: FROM, to: [email], subject, html })
    results[email] = r.error ? `error:${r.error.message}` : "sent"
    if (!r.error) items.forEach((it) => sentKeys.add(it.key))
  }
  if (sentKeys.size) {
    await sb.from("wp4_alert_state").upsert(
      [...sentKeys].map((k) => ({ file_key: k, le_code: k.split("::")[0] })), { onConflict: "file_key" })
  }
  return NextResponse.json({ sent: sentKeys.size, recipients: results })
}
