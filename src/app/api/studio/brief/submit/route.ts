import { NextRequest, NextResponse } from "next/server"
import { verifyBriefToken } from "@/lib/studio/brief-token"
import { setBriefDecision } from "@/lib/studio/daily-brief"
import { upsertTextFileInFolder } from "@/lib/drive/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/studio/brief/submit
 *
 * Body: { token: string, brief: string }
 * Auth: signed token (HMAC + 30 h TTL) from the evening prompt email.
 *
 * Records `decision = yes` plus the brief text on the matching
 * studio_daily_briefs row.
 */

const MAX_BRIEF_LENGTH = 8000

export async function POST(req: NextRequest) {
  const secret = process.env.STUDIO_APPROVAL_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "approval_secret_unset" },
      { status: 503 },
    )
  }

  let body: { token?: unknown; brief?: unknown }
  try {
    body = (await req.json()) as { token?: unknown; brief?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const token = typeof body.token === "string" ? body.token : ""
  const brief = typeof body.brief === "string" ? body.brief.trim() : ""
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 })
  }
  if (!brief || brief.length < 4) {
    return NextResponse.json({ ok: false, error: "brief_too_short" }, { status: 422 })
  }
  if (brief.length > MAX_BRIEF_LENGTH) {
    return NextResponse.json(
      { ok: false, error: "brief_too_long" },
      { status: 422 },
    )
  }

  const verify = verifyBriefToken(token, secret)
  if (!verify.ok) {
    return NextResponse.json(
      { ok: false, error: verify.error },
      { status: verify.error === "expired" ? 410 : 401 },
    )
  }

  try {
    await setBriefDecision(verify.payload.forDate, "yes", brief)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { ok: false, error: "brief_save_failed", debug: message },
      { status: 502 },
    )
  }

  // Mirror the brief into the Drive folder Cowork already reads every
  // morning, so its prompt can pick it up via the Drive MCP. Filename
  // is `_brief-<for_date>.md` — leading underscore exempts it from the
  // watcher/cron's `^YYYY-MM-DD_` ingest filter.
  const driveFile = `_brief-${verify.payload.forDate}.md`
  const driveContent = [
    "# Tarry's brief for " + verify.payload.forDate,
    "",
    `_Filed via /studio/brief on ${new Date().toISOString()}_`,
    "",
    "---",
    "",
    brief,
    "",
  ].join("\n")
  const drive = await upsertTextFileInFolder({
    name: driveFile,
    content: driveContent,
  })
  if (!drive.ok) {
    // The brief IS in Supabase already — Drive mirror failure is
    // non-fatal; just log loud so the heartbeat / Tarry notices.
    console.error(
      JSON.stringify({
        tag: "studio.brief.drive_mirror_failed",
        forDate: verify.payload.forDate,
        error: drive.error,
        debug: "debug" in drive ? drive.debug : undefined,
      }),
    )
  }

  console.log(
    JSON.stringify({
      tag: "studio.brief.submitted",
      forDate: verify.payload.forDate,
      length: brief.length,
      driveOk: drive.ok,
      driveFileId: drive.ok ? drive.fileId : undefined,
    }),
  )
  return NextResponse.json({
    ok: true,
    forDate: verify.payload.forDate,
    driveMirror: drive.ok ? "ok" : "failed",
  })
}
