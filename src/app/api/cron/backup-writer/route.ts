import fs from "node:fs/promises"
import path from "node:path"
import { NextRequest, NextResponse } from "next/server"
import {
  aiBackupWriter,
  type BackupWriterResult,
} from "@/lib/studio/ai-backup-writer"
import {
  listMarkdownFilesInFolder,
  downloadFileContent,
} from "@/lib/drive/client"
import {
  amsterdamDateToday,
  amsterdamDateTomorrow,
  getBrief,
  setBriefDecision,
} from "@/lib/studio/daily-brief"
import { processArticle } from "@/lib/studio/process-article"
import { hasArticleForDate } from "@/lib/studio/prepared-frontmatter"
import { sendDispatchFailureAlert } from "@/lib/studio/email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Article generation + web_search loop can take 2-3 minutes; budget room.
export const maxDuration = 300

/**
 * Sprint follow-up — Vercel-side backup writer for the daily Dispatch.
 *
 * Cowork's scheduled task runs locally on Tarry's Mac, so a laptop-off
 * day means no article gets written. This route runs server-side on
 * Vercel cron and replaces Cowork as the writer when needed.
 *
 * Logic:
 *   1. Compute today's Amsterdam-local date.
 *   2. List Drive folder; if today's `YYYY-MM-DD_*.md` already exists,
 *      no-op (Cowork already wrote it).
 *   3. Look for `_brief-<today>.md` in Drive — read it if present.
 *   4. Call aiBackupWriter() with the brief (or empty for rotation).
 *   5. Upload the resulting article as `YYYY-MM-DD_<slug>.md` to Drive.
 *   6. The existing Drive cron (15-min schedule) picks it up → ingest
 *      pipeline → approval email.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET}, Vercel auto-attaches on
 * cron triggers. ?force=1 lets Tarry curl-trigger ad-hoc.
 *
 * Schedule (vercel.json): twice with internal Amsterdam-hour check
 * to survive DST. Fires once at 09:45 Amsterdam — 45 min after Cowork's
 * window, giving the local path priority.
 */

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get("authorization") ?? ""
  if (!header.startsWith("Bearer ")) return false
  return header.slice(7).trim() === secret
}

function amsterdamHour(now: Date = new Date()): number {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    hour12: false,
  })
  const parts = fmt.formatToParts(now).find((p) => p.type === "hour")
  return parts ? Number(parts.value) : NaN
}

function dayOfYear(now: Date = new Date()): number {
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0))
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

const DATED_ARTICLE_RE = /^\d{4}-\d{2}-\d{2}_[a-z0-9][a-z0-9-]*\.mdx?$/i

async function handleTick(req: NextRequest) {
  const url = new URL(req.url)
  const force = url.searchParams.get("force") === "1"
  const hour = amsterdamHour()

  // Window: fire between 10:00 and 11:59 Amsterdam local. Two cron
  // entries (08:45 UTC in summer / 09:45 UTC in winter) each call
  // this. The wider 2-hour gate (was: strict hour === 10) lets the
  // SECOND tick run today as a fallback if the first one failed —
  // we widened the window on 2026-05-26 after the first tick was
  // silently skipped by the existing-article filename check, leaving
  // Tarry without a Dispatch. ?force=1 bypasses entirely.
  //
  // Why 10:00-11:59 and not earlier: Cowork on Mac starts at 09:00
  // Amsterdam and typically takes 45-90 min for the full research +
  // write cycle. At 10:00 we're at the early edge of Cowork's normal
  // completion window; by 12:00 we're well past it. If Mac was off,
  // no Drive article exists and we proceed.
  //
  // The downside of widening: in summer the second cron tick (09:45
  // UTC = 11:45 Amsterdam = hour 11) now also runs, even though the
  // first tick already wrote today's article. processArticle's
  // same-day dedup catches the duplicate before commit, but we burn
  // ~$0.50 of Anthropic tokens on the wasted AI call. Acceptable
  // cost for the guarantee that a missed first tick has a retry.
  if (!force && (hour < 10 || hour > 11)) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "outside_amsterdam_send_window",
      amsterdamHour: hour,
    })
  }

  const today = amsterdamDateToday()

  // 1. Did Cowork (or anyone) already write today's article?
  const list = await listMarkdownFilesInFolder({ pageSize: 50 })
  if (!list.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: list.error,
        debug: "debug" in list ? list.debug : undefined,
      },
      { status: 502 },
    )
  }
  const existingToday = list.files.find(
    (f) => DATED_ARTICLE_RE.test(f.name) && f.name.startsWith(`${today}_`),
  )
  if (existingToday) {
    // Bug surfaced 2026-05-26: yesterday's published essay's Drive
    // source was named `2026-05-26_companies-are-workflows-...md`
    // (the rotation date was for the next day's slot). The studio
    // editor publish path didn't clean up the Drive source, so when
    // today's backup writer ran it saw "2026-05-26_..." in Drive and
    // skipped as "article_already_exists" — leaving Tarry without a
    // Dispatch.
    //
    // Fix: extract the slug from the filename and check whether
    // `content/blog/<slug>.mdx` exists. If it does, the Drive file is
    // stale (its content is already published); treat as no-op and
    // proceed with writing a fresh article for today. If the .mdx
    // doesn't exist, the Drive file represents in-progress work
    // (Cowork mid-cycle, or a manual upload we shouldn't clobber),
    // so we skip as before.
    const slugMatch = existingToday.name.match(/^\d{4}-\d{2}-\d{2}_(.+)\.mdx?$/i)
    const fileSlug = slugMatch?.[1]
    let isStale = false
    if (fileSlug) {
      const publishedPath = path.join(process.cwd(), "content", "blog", `${fileSlug}.mdx`)
      try {
        await fs.access(publishedPath)
        isStale = true
      } catch {
        isStale = false
      }
    }

    // An unconsumed brief OUTRANKS an existing article.
    //
    // Until 2026-08-27 this skipped whenever Cowork had already filed
    // something, and Cowork always files first. Cowork reads the brief from
    // a Drive file that a service account cannot create (no storage quota,
    // see the note further down), so Cowork never sees a brief at all. The
    // net effect was that a brief Tarry filed could never be written: it was
    // first silently dropped, then, after the 2026-08-26 fix, rolled forward
    // one day at a time forever, which looked healthy in the logs and was
    // arguably worse.
    //
    // This route CAN read the brief from Supabase. So when a brief is still
    // unconsumed, we write it, even though a rotation piece already exists.
    // Two Dispatches in a day is a far smaller problem than never honouring
    // an explicit request. The brief is marked "done" after a successful
    // write so it cannot fire twice.
    let pendingBrief = ""
    try {
      const row = await getBrief(today)
      if (row && row.decision === "yes" && row.brief.trim()) pendingBrief = row.brief.trim()
    } catch (err) {
      console.error(
        JSON.stringify({
          tag: "studio.backup_writer.brief_lookup_failed",
          today,
          error: err instanceof Error ? err.message : String(err),
        }),
      )
    }

    if (!isStale && !pendingBrief) {
      console.log(
        JSON.stringify({
          tag: "studio.backup_writer.skipped",
          reason: "article_already_exists",
          existing: existingToday.name,
          today,
        }),
      )
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "article_already_exists",
        existingFile: existingToday.name,
      })
    }

    if (pendingBrief) {
      console.warn(
        JSON.stringify({
          tag: "studio.backup_writer.writing_brief_despite_existing_article",
          today,
          existing: existingToday.name,
          briefHead: pendingBrief.slice(0, 120),
        }),
      )
    }

    console.log(
      JSON.stringify({
        tag: "studio.backup_writer.proceed_through_stale_drive_file",
        existing: existingToday.name,
        slug: fileSlug,
        today,
        note: "drive_file_matches_today_prefix_but_slug_already_in_content_blog",
      }),
    )
    // Fall through to article generation below.
  }

  // 1.5. Don't generate a second article for a day that already has one.
  //
  // The backup-writer fires twice (08:45 + 09:45 UTC). Without this gate both
  // ticks generate independently, so a Mac-off day ends with one published
  // Dispatch plus a wasted `ready` dedup-orphan — and which of the two topics
  // wins is a coin-flip decided by processing order. If today already has a
  // row in studio_prepared_frontmatter (awaiting / ready / drafted), the
  // article is already in the pipeline; skip. `hasArticleForDate` fails open,
  // so a Supabase hiccup can never make us miss the day's write. `?force=1`
  // (Tarry's manual regenerate) bypasses, same as the send-window gate.
  if (!force && (await hasArticleForDate(today))) {
    console.log(
      JSON.stringify({
        tag: "studio.backup_writer.skipped",
        reason: "already_queued_today",
        today,
      }),
    )
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "already_queued_today",
      today,
    })
  }

  // 2. Find today's brief — Drive first (Cowork's transport), then
  //    fall back to Supabase (the canonical store). The Drive mirror
  //    occasionally fails silently; Supabase is the source of truth.
  let brief = ""
  let briefSource: "drive" | "supabase" | "none" = "none"

  const briefFile = list.files.find((f) => f.name === `_brief-${today}.md`)
  if (briefFile) {
    const dl = await downloadFileContent(briefFile.id)
    if (dl.ok) {
      // Brief file shape: header + `---` separator + body. Take last segment.
      const split = dl.content.split(/^---\s*$/m)
      brief = (split.length >= 2 ? split[split.length - 1] : dl.content).trim()
      briefSource = "drive"
    } else {
      console.error(
        JSON.stringify({
          tag: "studio.backup_writer.brief_download_failed",
          briefFile: briefFile.name,
          error: dl.error,
        }),
      )
    }
  }

  if (!brief) {
    // Drive miss — fall back to Supabase row. Covers the case where
    // the submit endpoint's Drive mirror failed silently last night.
    const row = await getBrief(today)
    if (row && row.decision === "yes" && row.brief.trim()) {
      brief = row.brief.trim()
      briefSource = "supabase"
      console.log(
        JSON.stringify({
          tag: "studio.backup_writer.brief_supabase_fallback",
          today,
          length: brief.length,
        }),
      )
    }
  }

  // 3. Generate article.
  const startedAt = Date.now()
  const result: BackupWriterResult = await aiBackupWriter({
    brief,
    forDate: today,
    dayOfYear: dayOfYear(),
  })
  const durationMs = Date.now() - startedAt

  if (!result.ok) {
    console.error(
      JSON.stringify({
        tag: "studio.backup_writer.generation_failed",
        today,
        error: result.error,
        durationMs,
        debug: result.debug,
      }),
    )
    // Shout immediately — the whole point of the 2026-06-30 fix: a failed
    // morning write emails Tarry the exact error the instant it happens,
    // instead of silently no-showing for days.
    await sendDispatchFailureAlert({
      stage: "generation",
      error: result.error,
      forDate: today,
      debug: result.debug,
    }).catch(() => {})
    return NextResponse.json(
      { ok: false, error: result.error, durationMs, debug: result.debug },
      { status: 502 },
    )
  }

  // 4. Hand off directly to processArticle. We bypass Drive entirely
  //    on the backup-writer path because Google service accounts have
  //    zero personal storage quota — they cannot CREATE new files in a
  //    My-Drive folder shared with them, only modify existing files.
  //    The article goes straight into studio_drafts where it would have
  //    ended up after a Drive cron ingest anyway, and the approval
  //    email fires immediately. No detour.
  const origin =
    process.env.SITE_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(req.url).origin
  const filename = `${today}_${result.slug}.md`
  const processed = await processArticle({
    filename,
    content: result.body,
    origin,
    // A brief-driven article must clear the same-day dedup; otherwise the
    // rotation piece Cowork already filed would block it, which is the exact
    // failure this whole change exists to remove.
    allowSameDay: briefSource !== "none",
  })

  if (!processed.ok) {
    // Soft skip — another writer beat us. Common race: Cowork finishes
    // around the same time backup-writer fires. Log + return 200.
    if (processed.stage === "duplicate") {
      console.log(
        JSON.stringify({
          tag: "studio.backup_writer.duplicate_skip",
          today,
          existingSlug: processed.slug,
          attemptedSlug: result.slug,
          durationMs,
        }),
      )
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "already_have_draft_for_today",
        existingSlug: processed.slug,
      })
    }
    // `awaiting_frontmatter` is NOT a failure — it is the expected async
    // handoff on the backup-writer path. The body is safely stashed
    // `awaiting`; the frontmatter-prep cloud routine (09:45 UTC), the
    // ingest reprocessor, and the 10:30 UTC heartbeat self-heal all turn it
    // into a draft + approval email within the hour. Alarming here fired a
    // false "nothing publishes today" every Mac-off morning ~2 h before the
    // pipeline healed itself. The 10:30 heartbeat is the single correct alarm
    // for a genuinely stuck day — it only fires when NO draft and NO publish
    // commit exist AND there is nothing left to self-heal. So this stage
    // returns a soft 200 (queued), no alarm.
    if (processed.stage === "awaiting_frontmatter") {
  // Mark the brief consumed. Without a terminal state it stays
  // decision="yes" and the writer picks it up again tomorrow, which is the
  // roll-forward loop this change replaces.
  if (briefSource !== "none") {
    try {
      await setBriefDecision(today, "done", brief)
      console.log(JSON.stringify({ tag: "studio.backup_writer.brief_consumed", today, briefSource }))
    } catch (err) {
      console.error(
        JSON.stringify({
          tag: "studio.backup_writer.brief_mark_failed",
          today,
          error: err instanceof Error ? err.message : String(err),
        }),
      )
    }
  }

      console.log(
        JSON.stringify({
          tag: "studio.backup_writer.queued_awaiting_frontmatter",
          filename,
          slug: result.slug,
          title: result.title,
          durationMs,
        }),
      )
      return NextResponse.json({
        ok: true,
        queued: true,
        reason: "awaiting_frontmatter",
        filename,
        title: result.title,
        slug: result.slug,
        note: "body stashed; frontmatter-prep routine + ingest reprocessor + heartbeat will draft and email within the hour",
      })
    }
    console.error(
      JSON.stringify({
        tag: "studio.backup_writer.process_failed",
        filename,
        stage: processed.stage,
        error: processed.error,
        durationMs,
      }),
    )
    await sendDispatchFailureAlert({
      stage: `process:${processed.stage}`,
      error: processed.error,
      forDate: today,
      debug: "debug" in processed ? processed.debug : undefined,
    }).catch(() => {})
    return NextResponse.json(
      {
        ok: false,
        error: `process_${processed.stage}`,
        detail: processed.error,
        filename,
        title: result.title,
        slug: result.slug,
        previewUrl:
          "previewUrl" in processed ? processed.previewUrl : undefined,
        approveUrl:
          "approveUrl" in processed ? processed.approveUrl : undefined,
        debug: "debug" in processed ? processed.debug : undefined,
      },
      { status: processed.stage === "email" ? 502 : 500 },
    )
  }

  console.log(
    JSON.stringify({
      tag: "studio.backup_writer.ok",
      today,
      filename,
      title: result.title,
      sourcesUsed: result.sourcesUsed,
      modelUsed: result.modelUsed,
      durationMs,
      briefSource,
      slug: processed.slug,
      emailId: processed.emailId,
    }),
  )

  return NextResponse.json({
    ok: true,
    today,
    filename,
    title: processed.title,
    slug: processed.slug,
    sourcesUsed: result.sourcesUsed,
    modelUsed: result.modelUsed,
    durationMs,
    briefUsed: brief.length > 0,
    briefSource,
    emailId: processed.emailId,
    previewUrl: processed.previewUrl,
    approveUrl: processed.approveUrl,
  })
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    )
  }
  return handleTick(req)
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    )
  }
  return handleTick(req)
}
