import { NextRequest, NextResponse } from "next/server"
import {
  listMarkdownFilesInFolder,
  downloadFileContent,
  pingDrive,
  type DriveFile,
} from "@/lib/drive/client"
import {
  getDriveIngest,
  getHighWaterModifiedTime,
  recordDriveIngest,
} from "@/lib/studio/drive-ingest-log"
import { processArticle } from "@/lib/studio/process-article"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Each tick may process several articles. processArticle is ~15 s
// including the AI call; budget 60 s × 3 articles + Drive round-trips.
export const maxDuration = 300

/**
 * Sprint 9.1 — Vercel cron that polls a Google Drive folder for new
 * daily-article markdown files and hands them to the same
 * `processArticle()` pipeline the local LaunchAgent watcher uses.
 *
 * Why this exists: Sprint 9's local LaunchAgent only fires when
 * Tarry's Mac is on. The Claude-Cowork scheduled task writes its
 * articles to Drive regardless of Mac state, so polling Drive from
 * Vercel makes the pipeline truly autonomous.
 *
 * Auth — Vercel's cron auto-attaches `Authorization: Bearer ${CRON_SECRET}`
 * to every cron-triggered request when `CRON_SECRET` is set on the
 * project. We require that token AND verify the `x-vercel-cron` header
 * for ad-hoc smoke testing by Tarry from a terminal. Either path
 * authorises; a leaked URL alone is not enough.
 *
 * Idempotency — every Drive file_id we touch is logged in
 * `studio_drive_ingest_log`. A second cron tick sees the row, compares
 * `modified_time_iso`, and skips unless Cowork has edited the file
 * after our last ingest.
 *
 * Filter — only files whose name matches `YYYY-MM-DD_kebab.md(x)` are
 * eligible (mirrors the same gate the local watcher applies). The
 * prompt file `scheduled-blog-prompt.md` is silently logged as
 * "skipped" so re-ticks don't re-evaluate.
 *
 * GET smoke — hitting GET with the same auth token returns a small
 * JSON health snapshot (`pingDrive` + last-seen high-water). Useful
 * for "did the service account actually see the folder?" after
 * provisioning.
 */

const DATED_ARTICLE_RE = /^\d{4}-\d{2}-\d{2}_[a-z0-9][a-z0-9-]*\.mdx?$/i

// Defence in depth — if the studio_drive_ingest_log table somehow gets
// wiped or fails to write, the high-water filter returns null and the
// cron lists every file in the folder. Without this floor, every old
// already-published article gets re-ingested on the first tick. The
// floor catches that: files older than this window are silently
// skipped regardless of what the log says.
const HARD_AGE_FLOOR_MS = 48 * 60 * 60 * 1000 // 48 hours

interface CronResultLine {
  file_id: string
  filename: string
  modifiedTime: string
  action: "ingested" | "skipped_filter" | "skipped_unchanged" | "failed"
  slug?: string
  emailId?: string
  reason?: string
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get("authorization") ?? ""
  if (!header.startsWith("Bearer ")) return false
  return header.slice(7).trim() === secret
}

function getOrigin(req: NextRequest): string {
  // Prefer the explicit origin var so the email links always point at
  // the production canonical host even if the cron fires against a
  // *.vercel.app URL.
  return (
    process.env.SITE_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(req.url).origin
  )
}

async function handleTick(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now()

  const sinceIso = (await getHighWaterModifiedTime()) ?? undefined
  const list = await listMarkdownFilesInFolder({
    sinceIso,
    pageSize: 20,
  })
  if (!list.ok) {
    console.error(
      JSON.stringify({ tag: "studio.cron.list_failed", error: list }),
    )
    return NextResponse.json(
      { ok: false, error: list.error, debug: "debug" in list ? list.debug : undefined },
      { status: 502 },
    )
  }

  if (list.files.length === 0) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      durationMs: Date.now() - startedAt,
      sinceIso: sinceIso ?? null,
    })
  }

  const origin = getOrigin(req)
  const lines: CronResultLine[] = []

  for (const file of list.files) {
    const line = await processOne(file, origin)
    lines.push(line)
  }

  const durationMs = Date.now() - startedAt
  console.log(
    JSON.stringify({
      tag: "studio.cron.tick",
      processed: lines.length,
      ingested: lines.filter((l) => l.action === "ingested").length,
      durationMs,
      sinceIso: sinceIso ?? null,
    }),
  )
  return NextResponse.json({ ok: true, durationMs, sinceIso: sinceIso ?? null, results: lines })
}

async function processOne(
  file: DriveFile,
  origin: string,
): Promise<CronResultLine> {
  // 0. Hard age floor — never ingest files older than HARD_AGE_FLOOR_MS,
  //    regardless of high-water state. Protects against catastrophic
  //    log-wipe scenarios that would otherwise replay every old file.
  const fileAgeMs = Date.now() - Date.parse(file.modifiedTime)
  if (Number.isFinite(fileAgeMs) && fileAgeMs > HARD_AGE_FLOOR_MS) {
    await recordDriveIngest({
      fileId: file.id,
      filename: file.name,
      modifiedTimeIso: file.modifiedTime,
      status: "skipped",
      failureReason: "older_than_age_floor",
    }).catch(() => {})
    return {
      file_id: file.id,
      filename: file.name,
      modifiedTime: file.modifiedTime,
      action: "skipped_filter",
      reason: "older_than_age_floor",
    }
  }

  // 1. Filter — skip non-dated filenames silently (Cowork's
  //    prompt file, scratch READMEs, etc).
  if (!DATED_ARTICLE_RE.test(file.name)) {
    await recordDriveIngest({
      fileId: file.id,
      filename: file.name,
      modifiedTimeIso: file.modifiedTime,
      status: "skipped",
      failureReason: "filename_not_dated_article",
    }).catch((err) => {
      console.error(
        JSON.stringify({
          tag: "studio.cron.log_skip_failed",
          fileId: file.id,
          error: err instanceof Error ? err.message : String(err),
        }),
      )
    })
    return {
      file_id: file.id,
      filename: file.name,
      modifiedTime: file.modifiedTime,
      action: "skipped_filter",
      reason: "filename_not_dated_article",
    }
  }

  // 2. Idempotency — if we have a row for this file_id whose
  //    modified_time_iso is the same as Drive's current modifiedTime,
  //    it's a re-tick on an unchanged file.
  const prev = await getDriveIngest(file.id)
  if (prev && prev.modified_time_iso === file.modifiedTime) {
    return {
      file_id: file.id,
      filename: file.name,
      modifiedTime: file.modifiedTime,
      action: "skipped_unchanged",
      slug: prev.slug ?? undefined,
    }
  }

  // 3. Download + process.
  const dl = await downloadFileContent(file.id)
  if (!dl.ok) {
    await recordDriveIngest({
      fileId: file.id,
      filename: file.name,
      modifiedTimeIso: file.modifiedTime,
      status: "failed",
      failureReason: `drive_download:${dl.error}`,
    }).catch(() => {})
    return {
      file_id: file.id,
      filename: file.name,
      modifiedTime: file.modifiedTime,
      action: "failed",
      reason: `drive_download:${dl.error}`,
    }
  }

  const result = await processArticle({
    filename: file.name,
    content: dl.content,
    origin,
  })

  if (!result.ok) {
    // "draft is in Supabase, email failed" still counts as a
    // partial-ingest from the cron's perspective — log status=failed
    // with the slug so Tarry can pick it up manually.
    await recordDriveIngest({
      fileId: file.id,
      filename: file.name,
      modifiedTimeIso: file.modifiedTime,
      status: "failed",
      slug: result.slug ?? null,
      failureReason: `${result.stage}:${result.error}`,
    }).catch(() => {})
    return {
      file_id: file.id,
      filename: file.name,
      modifiedTime: file.modifiedTime,
      action: "failed",
      slug: result.slug ?? undefined,
      reason: `${result.stage}:${result.error}`,
    }
  }

  await recordDriveIngest({
    fileId: file.id,
    filename: file.name,
    modifiedTimeIso: file.modifiedTime,
    status: "ingested",
    slug: result.slug,
    emailId: result.emailId,
  }).catch((err) => {
    // Worst case: draft + email already happened but log row didn't
    // commit. Next cron tick would re-process and re-email. Better
    // than dropping the article silently.
    console.error(
      JSON.stringify({
        tag: "studio.cron.log_success_failed",
        fileId: file.id,
        slug: result.slug,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
  })

  return {
    file_id: file.id,
    filename: file.name,
    modifiedTime: file.modifiedTime,
    action: "ingested",
    slug: result.slug,
    emailId: result.emailId,
  }
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

/**
 * GET also runs the tick — Vercel's cron triggers fire as GET by
 * default. Same auth requirement.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    )
  }
  // Allow `?ping=1` for a smoke check that doesn't trigger ingest.
  if (new URL(req.url).searchParams.get("ping") === "1") {
    const result = await pingDrive()
    const high = await getHighWaterModifiedTime()
    return NextResponse.json({
      ok: result.ok,
      drive: result,
      lastIngestedModifiedTime: high,
    })
  }
  return handleTick(req)
}
