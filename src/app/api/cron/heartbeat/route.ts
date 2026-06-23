import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { Octokit } from "@octokit/rest"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Daily server-side heartbeat. Vercel cron fires this once a day at a
 * fixed UTC hour. It looks for evidence that today's Dispatch
 * pipeline actually ran — and emails Tarry only when nothing is
 * found.
 *
 * Why server-side, not local: the LaunchAgent watcher's
 * /api/studio/alert path can only complain when *it* tried and failed.
 * Mac off / LaunchAgent crashed / Cowork didn't write anything are all
 * silent from the watcher's POV. This route runs on Vercel infra so
 * it sees the truth from the cloud side regardless of local state.
 *
 * Signals checked, in order of cheapness:
 *   1. `studio_drafts` rows with `updated_at >= today UTC midnight`.
 *      Proves the ingest pipeline (parse → AI → upsert) ran for some
 *      file today. Survives until Tarry publishes (then the row is
 *      deleted — that's where signal 2 picks up).
 *   2. GitHub commits on main touching `content/blog/` since today UTC
 *      midnight. Proves a Dispatch went live today.
 *
 * If either signal > 0 → silent success, log a green tick.
 * If both = 0 → email Tarry an alert.
 *
 * Auth: Vercel auto-attaches `Authorization: Bearer ${CRON_SECRET}`
 * to cron-triggered requests when CRON_SECRET is set on the project.
 * Same pattern as /api/cron/ingest-drive.
 */

const DEFAULT_TO = "tarry.singh@deepkapha.com"
const DEFAULT_FROM = "Studio · Dispatches <studio@tarrysingh.com>"

/**
 * External watchdog ping (healthchecks.io / cronitor / equivalent).
 *
 * Closes the last silent-failure gap: if Vercel cron itself stops
 * firing — outage, project paused, schedule mis-parse — neither the
 * watcher alert nor the heartbeat email runs, and you'd never know.
 * A third-party uptime monitor expecting a ping every 24 h sends its
 * own alert when no ping arrives in the grace window.
 *
 * Set HEARTBEAT_PING_URL to the unique check URL from your provider.
 * We append `/fail` when the heartbeat detected a silent failure so
 * the watchdog distinguishes "ran but found nothing" from "ran clean".
 * Fire-and-forget: the cron does not block on this ping; a watchdog
 * outage shouldn't itself break the heartbeat.
 */
async function pingWatchdog(state: "ok" | "fail"): Promise<void> {
  const base = process.env.HEARTBEAT_PING_URL
  if (!base) return
  const url = state === "fail" ? `${base.replace(/\/$/, "")}/fail` : base
  try {
    await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(8000),
    })
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "studio.heartbeat.watchdog_ping_failed",
        state,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
  }
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get("authorization") ?? ""
  if (!header.startsWith("Bearer ")) return false
  return header.slice(7).trim() === secret
}

function utcMidnightIso(): string {
  const now = new Date()
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0),
  )
  return midnight.toISOString()
}

interface DraftRow {
  slug: string
  updated_at: string
  frontmatter: { title?: string } | null
}

async function todaysDraftCount(): Promise<{
  count: number
  latest?: DraftRow
  error?: string
}> {
  try {
    const sb = createServiceClient()
    const { data, error } = await sb
      .from("studio_drafts")
      .select("slug, updated_at, frontmatter")
      .gte("updated_at", utcMidnightIso())
      .order("updated_at", { ascending: false })
      .limit(5)
    if (error) {
      return { count: 0, error: error.message }
    }
    const rows = (data as DraftRow[] | null) ?? []
    return { count: rows.length, latest: rows[0] }
  } catch (err) {
    return { count: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

interface BlogCommit {
  sha: string
  message: string
  htmlUrl: string
}

async function todaysBlogCommits(): Promise<{
  count: number
  commits: BlogCommit[]
  error?: string
}> {
  const token = process.env.STUDIO_GITHUB_TOKEN || process.env.GITHUB_TOKEN
  const owner = process.env.STUDIO_GITHUB_OWNER || "TarrySingh"
  const repo = process.env.STUDIO_GITHUB_REPO || "tarrysingh-com"
  if (!token) return { count: 0, commits: [], error: "no_token" }
  try {
    const octokit = new Octokit({ auth: token })
    const res = await octokit.repos.listCommits({
      owner,
      repo,
      path: "content/blog",
      since: utcMidnightIso(),
      per_page: 10,
    })
    const commits = res.data.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: (c.commit.message ?? "").split("\n")[0].slice(0, 120),
      htmlUrl: c.html_url ?? "",
    }))
    return { count: commits.length, commits }
  } catch (err) {
    return {
      count: 0,
      commits: [],
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

async function sendHeartbeatAlert(args: {
  draftError?: string
  commitError?: string
}): Promise<{ ok: boolean; emailId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY unset" }
  const to = process.env.STUDIO_APPROVAL_EMAIL || DEFAULT_TO
  const from = process.env.STUDIO_APPROVAL_FROM || DEFAULT_FROM
  const today = new Date().toISOString().slice(0, 10)
  const subject = `Studio · no Dispatch today (${today})`

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><title>Studio heartbeat</title>
<style>
  body { margin:0; padding:0; background:#fbf7ec; font-family:'IBM Plex Serif',Georgia,serif; color:#0d1b3d; }
  .wrap { max-width:560px; margin:0 auto; padding:32px 24px 48px; }
  .kicker { font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:10.5px; letter-spacing:0.32em; text-transform:uppercase; color:#b45309; font-weight:600; }
  h1 { font-family:Gloock,Georgia,serif; font-weight:400; font-size:26px; line-height:1.2; margin:14px 0 12px; }
  p { font-size:15px; line-height:1.55; margin:0 0 12px; }
  .rule { border:0; height:1px; background:rgba(180,134,11,0.22); margin:16px 0 18px; }
  code { font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:12.5px; background:rgba(13,27,61,0.06); padding:1px 4px; border-radius:3px; }
  ul { padding-left:18px; margin:6px 0 14px; }
  li { font-size:14px; margin-bottom:4px; }
  .footer { margin-top:24px; padding-top:14px; border-top:1px solid rgba(180,134,11,0.18); font-style:italic; font-size:13px; color:rgba(13,27,61,0.55); }
</style></head><body><div class="wrap">
<div class="kicker">Studio · daily heartbeat</div>
<hr class="rule"/>
<h1>No Dispatch landed today.</h1>
<p>Neither a fresh draft nor a publish commit was detected since UTC midnight. The watcher may have died, Cowork may not have written today, or something deeper is broken.</p>
<p><strong>What to check, in order:</strong></p>
<ul>
  <li>Drive folder <code>tarry-daily-blogs</code> — did Cowork write a file today?</li>
  <li><code>tail ~/Library/Logs/studio-blog-watch.log</code> on the Mac — is the LaunchAgent ticking?</li>
  <li><code>launchctl list | grep blog-watch</code> — is the agent loaded at all?</li>
  <li>Vercel function logs for <code>/api/studio/ingest</code> — any 5xx from the cloud side?</li>
</ul>
${args.draftError ? `<p><strong>Supabase note:</strong> <code>${esc(args.draftError)}</code></p>` : ""}
${args.commitError ? `<p><strong>GitHub note:</strong> <code>${esc(args.commitError)}</code></p>` : ""}
<p class="footer">Automated · Vercel cron on the production deployment · independent of the LaunchAgent.</p>
</div></body></html>`

  const text = [
    "Studio · daily heartbeat",
    "—",
    "",
    "No Dispatch landed today.",
    "Neither a fresh draft nor a publish commit was detected since UTC",
    "midnight. Check, in order:",
    "  - Drive folder tarry-daily-blogs (did Cowork write today?)",
    "  - tail ~/Library/Logs/studio-blog-watch.log on the Mac",
    "  - launchctl list | grep blog-watch",
    "  - Vercel function logs for /api/studio/ingest",
    "",
    args.draftError ? `Supabase: ${args.draftError}` : "",
    args.commitError ? `GitHub: ${args.commitError}` : "",
    "",
    "— from the Vercel-side heartbeat (runs whether your Mac is on or not).",
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const resend = new Resend(apiKey)
    const res = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      text,
      headers: {
        "X-Entity-Ref-ID": `studio-heartbeat-${today}-${Date.now()}`,
      },
    })
    if (res.error || !res.data?.id) {
      // Resend's `res.error` is an ErrorResponse-or-null union; just
      // serialise whatever it is.
      const errAny: unknown = res.error
      const errMsg =
        typeof errAny === "string"
          ? errAny
          : errAny
            ? JSON.stringify(errAny)
            : "no_email_id_returned"
      return { ok: false, error: errMsg }
    }
    return { ok: true, emailId: res.data.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// Deterministic frontmatter — NO LLM. Used only as the heartbeat's last-resort
// self-heal when both cloud-prep runs missed an article: the excerpt is the
// piece's own opening, verbatim, so a Dispatch can never silently stall.
function deterministicFallbackFrontmatter(
  slug: string,
  title: string,
  body: string,
): { category: string; excerpt: string; tags: string[] } {
  const paras: string[] = []
  let buf: string[] = []
  for (const raw of (body || "").split("\n")) {
    const line = raw.trim()
    if (!line) {
      if (buf.length) {
        paras.push(buf.join(" "))
        buf = []
      }
      continue
    }
    if (line.startsWith("#")) continue
    if (/^(by |—|\*|>|!\[|\[)/i.test(line)) continue
    buf.push(line)
    if (buf.join(" ").length > 400) break
  }
  if (buf.length) paras.push(buf.join(" "))
  let text = paras.find((p) => p.length > 60) ?? paras[0] ?? title ?? slug
  text = text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  const words = text.split(" ")
  let excerpt = words.slice(0, 55).join(" ")
  if (words.length > 55) excerpt = excerpt.replace(/[,;:]?\s*\S*$/, "") + " …"
  if (excerpt.length < 20) excerpt = `A new Dispatch — ${title || slug}.`
  const stop = new Set([
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with",
    "is", "are", "be", "by", "at", "from", "as", "that", "this", "it", "its",
  ])
  const tags = Array.from(
    new Set(slug.split("-").filter((w) => w.length > 2 && !stop.has(w))),
  ).slice(0, 5)
  return { category: "Essays", excerpt, tags: tags.length ? tags : ["dispatch"] }
}

// Promote any article stuck `awaiting` frontmatter (both cloud-prep runs missed
// it) with deterministic frontmatter, so the Drive-ingest retry pass ships it.
// Only writes to studio_prepared_frontmatter — never the critical ingest path.
async function deterministicallyHealAwaiting(): Promise<{
  healed: number
  slugs: string[]
  error?: string
}> {
  try {
    const sb = createServiceClient()
    const { data, error } = await sb
      .from("studio_prepared_frontmatter")
      .select("slug, title, body")
      .eq("status", "awaiting")
    if (error) return { healed: 0, slugs: [], error: error.message }
    const rows =
      (data as { slug: string; title: string | null; body: string | null }[] | null) ?? []
    const slugs: string[] = []
    for (const r of rows) {
      const fm = deterministicFallbackFrontmatter(r.slug, r.title ?? "", r.body ?? "")
      const { error: upErr } = await sb
        .from("studio_prepared_frontmatter")
        .update({
          category: fm.category,
          excerpt: fm.excerpt,
          tags: fm.tags,
          status: "ready",
          source: "heartbeat-fallback",
        })
        .eq("slug", r.slug)
        .eq("status", "awaiting")
      if (!upErr) slugs.push(r.slug)
    }
    return { healed: slugs.length, slugs }
  } catch (err) {
    return { healed: 0, slugs: [], error: err instanceof Error ? err.message : String(err) }
  }
}

async function handleTick(req: NextRequest) {
  const drafts = await todaysDraftCount()
  const commits = await todaysBlogCommits()
  const evidence = drafts.count + commits.count
  const dryRun = new URL(req.url).searchParams.get("dry") === "1"

  if (evidence > 0) {
    console.log(
      JSON.stringify({
        tag: "studio.heartbeat.ok",
        drafts: drafts.count,
        commits: commits.count,
        latestDraft: drafts.latest?.slug,
        latestCommit: commits.commits[0]?.sha,
      }),
    )
    await pingWatchdog("ok")
    return NextResponse.json({
      ok: true,
      green: true,
      drafts: drafts.count,
      commits: commits.count,
      details: { latestDraftSlug: drafts.latest?.slug ?? null, latestCommit: commits.commits[0] ?? null },
    })
  }

  // Both signals empty — fire the alert (unless ?dry=1 for smoke).
  console.error(
    JSON.stringify({
      tag: "studio.heartbeat.silent_failure",
      drafts: drafts.count,
      commits: commits.count,
      draftError: drafts.error,
      commitError: commits.error,
    }),
  )

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      green: false,
      dryRun: true,
      reason: "no_draft_no_commit_today",
      drafts,
      commits,
    })
  }

  // Self-heal before alarming. If an article is stuck `awaiting` frontmatter
  // (both cloud-prep runs missed it), promote it here with deterministic
  // frontmatter — the piece's own opening as the excerpt, no LLM — so the
  // Dispatch ships anyway. `awaiting_frontmatter` is retryable, so the next
  // Drive-ingest tick turns the now-`ready` row into a draft + approval email
  // within ~15 min. A silent stall is therefore impossible: worst case is a
  // plain excerpt Tarry can polish in the editor before publishing.
  const healed = await deterministicallyHealAwaiting()
  if (healed.healed > 0) {
    console.log(JSON.stringify({ tag: "studio.heartbeat.self_healed", ...healed }))
    await pingWatchdog("ok")
    return NextResponse.json({
      ok: true,
      green: false,
      selfHealed: healed,
      note: "promoted awaiting article(s) with deterministic frontmatter; ingest retry ships within ~15 min",
    })
  }

  const alert = await sendHeartbeatAlert({
    draftError: drafts.error,
    commitError: commits.error,
  })
  // Tell the watchdog the heartbeat detected a problem so the
  // external monitor logs a fail event (in addition to receiving its
  // expected daily ping). Most providers count this as a "down".
  await pingWatchdog("fail")
  return NextResponse.json({
    ok: alert.ok,
    green: false,
    alert,
    drafts: { count: drafts.count, error: drafts.error },
    commits: { count: commits.count, error: commits.error },
  })
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }
  return handleTick(req)
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }
  return handleTick(req)
}
