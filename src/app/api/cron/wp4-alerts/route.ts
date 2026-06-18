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

// Escape values interpolated into the email HTML (LE titles + file names are
// registry-/SharePoint-derived; a file name with & < > " ' would otherwise
// break the markup or inject content). Escape & first.
function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function fileKey(code: string, f: { sha?: string; rel?: string; name?: string; date?: string; kb?: number }): string {
  // Content hash is the STABLE identity — survives OneDrive re-materialisation,
  // folder moves and mtime/size churn, and changes only when bytes change.
  // Older registries without a sha fall back to the path+date+size key.
  return f.sha ? `${code}::${f.sha}` : `${code}::${f.rel || f.name || ""}::${f.date || ""}::${f.kb || 0}`
}

function currentItemsByRecipient(): { byEmail: Map<string, Item[]>; allKeys: Set<string> } {
  const byEmail = new Map<string, Item[]>()
  const allKeys = new Set<string>()
  for (const le of REG.realai_board as Wp4LE[]) {
    if (!le.realai.involved) continue
    for (const f of le.materials.files) {
      const key = fileKey(le.code, f)
      allKeys.add(key)
      // Tag each recipient's item with the role THEY hold on this LE. If the same
      // file reaches a recipient under two roles (e.g. author + co-author), merge
      // the role labels onto the one row rather than listing the file twice.
      for (const r of le.realai.roles) {
        const verb = ROLE_VERB[r.role] || r.role
        for (const email of r.recipients) {
          const arr = byEmail.get(email) || []
          const dup = arr.find((x) => x.key === key)
          if (dup) {
            if (!dup.role.split(" + ").includes(verb)) dup.role += ` + ${verb}`
            continue
          }
          arr.push({ code: le.code, title: le.title || le.code, role: verb, file: f.name, kb: f.kb, key })
          byEmail.set(email, arr)
        }
      }
    }
  }
  return { byEmail, allKeys }
}

function personName(email: string): string {
  return REG.roster.find((p) => p.email === email)?.name || email.split("@")[0]
}

// The role(s) an address holds across the board — used to label a test sample
// for a recipient who has no real material queued yet.
function rolesForEmail(email: string): Set<string> {
  const roles = new Set<string>()
  for (const le of REG.realai_board as Wp4LE[]) {
    if (!le.realai.involved) continue
    for (const r of le.realai.roles) if (r.recipients.includes(email)) roles.add(r.role)
  }
  return roles
}

function renderEmail(name: string, items: Item[]): { subject: string; html: string } {
  const n = items.length
  const subject = `PANORAIMA WP4 — ${n} new learning-material drop${n === 1 ? "" : "s"} for you`
  const rows = items.map((it) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:ui-monospace,monospace;font-weight:700">${esc(it.code)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(it.title)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6B7280">${esc(it.role)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(it.file)} <span style="color:#9CA3AF">(${it.kb} KB)</span></td>
    </tr>`).join("")
  // Footer matches the recipient's role: reviewers get the track-lead review
  // rule; authors get the upload reminder (no reviewer-only instructions).
  const anyReviewer = items.some((it) => /review/.test(it.role))
  const footer = anyReviewer
    ? `Reviewers: post your review in the Learning Event's <strong>wiki Discussion section</strong> — with a minor or major revision suggestion, signed with your name — never by email, so it's documented in the right place. The slides are the primary review target; the lesson plan is re-evaluated together with them.`
    : `As author/co-author: drop your slides &amp; notebooks in the Utrecht SharePoint WP4 folder and keep the lesson plan on the wiki current. Reviewers post their feedback in the LE's wiki Discussion section.`
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;color:#16181D">
    <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C0492B;font-weight:700;font-family:ui-monospace,monospace">PANORAIMA · WP4 monitor</p>
    <h2 style="margin:4px 0 2px;font-weight:700">Hi ${esc(name)},</h2>
    <p style="color:#4F535B;line-height:1.55">${n} new material file${n === 1 ? "" : "s"} just landed in Learning Events you're responsible for. Please take a look and act.</p>
    <table style="border-collapse:collapse;width:100%;font-size:13px;margin:14px 0">
      <thead><tr style="text-align:left;color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:.08em">
        <th style="padding:6px 12px">LE</th><th style="padding:6px 12px">Title</th><th style="padding:6px 12px">Your role</th><th style="padding:6px 12px">File</th>
      </tr></thead><tbody>${rows}</tbody>
    </table>
    <p><a href="${DASHBOARD}" style="display:inline-block;background:#16181D;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Open the WP4 tool →</a></p>
    <p style="color:#6B7280;font-size:12px;line-height:1.55;margin-top:18px">${footer}</p>
  </div>`
  return { subject, html }
}

export async function GET(req: NextRequest) {
  // Deny if CRON_SECRET is unset/empty — otherwise the literal "Bearer undefined"
  // (or "Bearer ") would authenticate a caller and bypass the cron guard.
  const secret = process.env.CRON_SECRET
  const authed = !!secret && req.headers.get("authorization") === `Bearer ${secret}`
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

  // --- test mode: sample digest to ONE roster address, no state ---
  if (testTo) {
    // Show exactly what THIS recipient would receive. If they have nothing
    // queued, render a clearly-marked synthetic sample tagged with the role
    // they actually hold — never borrow another recipient's real items (that
    // leaked their LEs and mislabelled the role/footer).
    let sample = (byEmail.get(testTo) || []).slice(0, 12)
    if (!sample.length) {
      const verb = rolesForEmail(testTo).has("reviewer") ? "review" : "author"
      sample = [{ code: "HL-048", title: "(sample) Communication of AI output to patients & peers",
                  role: verb, file: "(sample) HL-048_slides.pptx", kb: 1200, key: "" }]
    }
    if (!resend) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })
    const { subject, html } = renderEmail(personName(testTo), sample)
    const r = await resend.emails.send({ from: FROM, to: [testTo], subject: "[TEST] " + subject, html })
    return NextResponse.json({ test: testTo, items: sample.length, resend: r.error ? r.error : "sent" })
  }

  let sb
  try {
    sb = createServiceClient()
  } catch {
    return NextResponse.json({ error: "supabase config missing" }, { status: 500 })
  }
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
