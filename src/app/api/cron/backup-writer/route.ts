import { NextRequest, NextResponse } from "next/server"
import {
  aiBackupWriter,
  type BackupWriterResult,
} from "@/lib/studio/ai-backup-writer"
import {
  listMarkdownFilesInFolder,
  downloadFileContent,
  upsertTextFileInFolder,
} from "@/lib/drive/client"
import { amsterdamDateToday, getBrief } from "@/lib/studio/daily-brief"

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

  // Window: fire once a day around 09:45 Amsterdam. Two cron entries
  // (07:45 UTC summer / 08:45 UTC winter) each call this; only the
  // one whose Amsterdam clock reads 09 actually proceeds. `?force=1`
  // bypasses for manual testing.
  if (!force && hour !== 9) {
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
    return NextResponse.json(
      { ok: false, error: result.error, durationMs, debug: result.debug },
      { status: 502 },
    )
  }

  // 4. Upload to Drive. The watcher / Drive cron then ingests it
  //    naturally on the next 15-min tick.
  const filename = `${today}_${result.slug}.md`
  const up = await upsertTextFileInFolder({
    name: filename,
    content: result.body,
  })
  if (!up.ok) {
    console.error(
      JSON.stringify({
        tag: "studio.backup_writer.upload_failed",
        filename,
        error: up.error,
        debug: "debug" in up ? up.debug : undefined,
      }),
    )
    return NextResponse.json(
      {
        ok: false,
        error: "drive_upload_failed",
        filename,
        title: result.title,
        debug: "debug" in up ? up.debug : undefined,
      },
      { status: 502 },
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
      driveFileId: up.fileId,
    }),
  )

  return NextResponse.json({
    ok: true,
    today,
    filename,
    title: result.title,
    slug: result.slug,
    sourcesUsed: result.sourcesUsed,
    modelUsed: result.modelUsed,
    durationMs,
    briefUsed: brief.length > 0,
    briefSource,
    driveFileId: up.fileId,
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
