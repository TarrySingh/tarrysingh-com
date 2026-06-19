import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import registry from "@/lib/panoraima/wp4_le_registry.json"
import type { Wp4Registry, Wp4LE } from "@/lib/panoraima/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

/**
 * WP4 WEEKLY RealAI digest — the "stay abreast" email.
 *
 * Material DROPS are notified separately, as they happen, by /api/cron/wp4-alerts
 * (silent unless something lands). This one is the low-noise weekly overview of
 * the whole RealAI board — what we author, what we review, what's actionable —
 * so the team stays current without per-item pings.
 *
 * State-driven (just reads the deployed registry, no Supabase). Goes to the whole
 * RealAI team. Auth: Vercel `Authorization: Bearer ${CRON_SECRET}`. Manual test:
 * `?test=a@realai.eu,b@realai.eu` (+ optional `?cc=c@realai.eu`) — roster
 * addresses only, so it can be fired safely without the bearer.
 */

const FROM = "PANORAIMA WP4 · Monitor <studio@tarrysingh.com>"
const DASHBOARD = "https://www.tarrysingh.com/experiments/panoraima/wps/wp4"
const REG = registry as unknown as Wp4Registry
const RUST = "#C0492B"

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

const isAuthor = (le: Wp4LE) => le.realai.roles.some((r) => r.role === "author" || r.role === "co-author")
const isReviewer = (le: Wp4LE) => le.realai.roles.some((r) => r.role === "reviewer")

function row(le: Wp4LE, note: string): string {
  return `<tr>
    <td style="padding:7px 12px;border-bottom:1px solid #eee;font-family:ui-monospace,monospace;font-weight:700;white-space:nowrap">${esc(le.code)}</td>
    <td style="padding:7px 12px;border-bottom:1px solid #eee">${esc(le.title || le.code)}</td>
    <td style="padding:7px 12px;border-bottom:1px solid #eee;color:#6B7280;font-size:12px">${note}</td>
  </tr>`
}

function section(title: string, accent: string, les: Wp4LE[], noteFor: (le: Wp4LE) => string): string {
  if (!les.length) return ""
  const rows = les.map((le) => row(le, noteFor(le))).join("")
  return `
  <div style="margin:20px 0 6px">
    <span style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${accent}">${esc(title)} · ${les.length}</span>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:13px">${rows}</table>`
}

function renderEmail(): { subject: string; html: string } {
  const board = REG.realai_board as Wp4LE[]
  const authoring = board.filter(isAuthor)
  const reviewing = board.filter(isReviewer)
  const authorNeeds = authoring.filter((le) => le.completeness?.author_needs?.length)
  const readyToReview = reviewing.filter((le) => le.completeness?.ready_to_review && !le.realai_wiki_gap)
  const wikiGap = reviewing.filter((le) => le.realai_wiki_gap)        // M&F 'RAI' reviews the wiki omits
  const awaiting = reviewing.filter((le) => !le.completeness?.ready_to_review && !le.realai_wiki_gap)

  const subject = `PANORAIMA WP4 — weekly RealAI digest (${authoring.length} authoring · ${reviewing.length} reviewing)`

  const stat = (n: number, label: string) => `
    <td style="padding:0 14px 0 0">
      <div style="font-size:26px;font-weight:700;color:#16181D;font-variant-numeric:tabular-nums;line-height:1">${n}</div>
      <div style="font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-top:3px">${label}</div>
    </td>`

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:660px;margin:0 auto;color:#16181D">
    <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${RUST};font-weight:700;font-family:ui-monospace,monospace">PANORAIMA · WP4 weekly digest</p>
    <h2 style="margin:4px 0 2px;font-weight:700">RealAI's plate this week</h2>
    <p style="color:#4F535B;line-height:1.55;font-size:14px">A low-noise overview of everything RealAI authors or reviews. New material <strong>drops</strong> are emailed separately as they land — this weekly note keeps the whole board in view.</p>

    <table style="border-collapse:collapse;margin:16px 0 4px"><tr>
      ${stat(authoring.length, "Authoring")}
      ${stat(authorNeeds.length, "Need content")}
      ${stat(reviewing.length, "Reviewing")}
      ${stat(readyToReview.length, "Ready now")}
      ${stat(wikiGap.length, "Wiki omits us")}
    </tr></table>

    ${section("Authoring — content still owed", RUST, authorNeeds, (le) =>
      (le.completeness?.author_needs || []).slice(0, 3).join(" · ") || "draft outstanding")}

    ${section("Reviewing — ready for you now", "#2E6A4B", readyToReview, () => "author content is in — review it")}

    ${section("Reviewing — M&F (wiki hasn't credited us yet)", RUST, wikiGap, (le) =>
      le.off_wiki ? "SharePoint registry only" : "we're 'RAI' in SharePoint — review via the lesson plan")}

    ${awaiting.length ? `<p style="margin:18px 0 0;font-size:13px;color:#6B7280">+ <strong>${awaiting.length}</strong> more reviewing assignments still awaiting author content (nothing to do yet).</p>` : ""}

    <p style="margin:22px 0 4px"><a href="${DASHBOARD}" style="display:inline-block;background:#16181D;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Open the WP4 tool →</a></p>

    <div style="margin-top:22px;padding:14px 16px;border:1px solid #E7E7EA;border-radius:8px;background:#FAFAF9">
      <div style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${RUST};margin-bottom:8px">How &amp; where to file your review</div>
      <p style="margin:0 0 8px;font-size:13px;color:#4F535B;line-height:1.55"><strong>What:</strong> review only the RealAI-mandated Learning Events — the ones listed above as <em>your</em> reviewing assignments. Nothing outside that list.</p>
      <p style="margin:0 0 8px;font-size:13px;color:#4F535B;line-height:1.55"><strong>Where:</strong> on the LE's wiki page, open the <strong>&ldquo;Discussion&rdquo;</strong> tab &rarr; <strong>Edit source</strong> &rarr; paste your review &rarr; <strong>Save page</strong>. Not by email, not in SharePoint comments &mdash; the Discussion tab is the record, and it's what turns the LE green on the dashboard.</p>
      <p style="margin:0 0 8px;font-size:13px;color:#4F535B;line-height:1.55"><strong>How:</strong> open with an overall <strong>minor / major revision</strong> verdict; then go criterion by criterion (credible practice &middot; current relevance &middot; track &amp; job-roles &middot; professional judgement &middot; when/why/how of the tools &middot; risks &amp; trade-offs); be specific (cite slide numbers); name what works as well as what's missing; sign with your name + email.</p>
      <p style="margin:0;font-size:13px;color:#4F535B;line-height:1.55"><strong>Two worked examples to copy the format:</strong> <a href="https://hcaim.bme.hu/wiki/Talk:MC-001_Scientific_Landscape:_Bibliometric_Analysis_and_Visualization_in_Media_and_Culture_Research" style="color:${RUST}">MC-001</a> and <a href="https://hcaim.bme.hu/wiki/Talk:MC-003_Social_Network_Analysis:_Theoretical_Foundations" style="color:${RUST}">MC-003</a> Discussion pages.</p>
    </div>
  </div>`
  return { subject, html }
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authed = !!secret && req.headers.get("authorization") === `Bearer ${secret}`
  const url = new URL(req.url)
  const roster = new Set(REG.roster.map((p) => p.email))
  const team = REG.roster.map((p) => p.email)   // weekly digest → the whole RealAI team

  // ?test=a@…,b@…  (+ optional ?cc=c@…) — roster addresses only, no bearer needed
  const testRaw = url.searchParams.get("test")
  const ccRaw = url.searchParams.get("cc")
  const testTo = testRaw ? testRaw.split(",").map((s) => s.trim()).filter(Boolean) : []
  const cc = ccRaw ? ccRaw.split(",").map((s) => s.trim()).filter(Boolean) : []
  const allRoster = [...testTo, ...cc].every((e) => roster.has(e))
  const isTest = testTo.length > 0

  if (!authed && !(isTest && allRoster)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })
  const resend = new Resend(key)

  const { subject, html } = renderEmail()
  const to = isTest ? testTo : team
  const r = await resend.emails.send({
    from: FROM,
    to,
    ...(cc.length ? { cc } : {}),
    subject: isTest ? "[TEST] " + subject : subject,
    html,
  })
  return NextResponse.json({ sent: r.error ? `error:${r.error.message}` : "sent", to, cc, test: isTest })
}
