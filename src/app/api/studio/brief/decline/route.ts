import { NextRequest, NextResponse } from "next/server"
import { verifyBriefToken } from "@/lib/studio/brief-token"
import { setBriefDecision } from "@/lib/studio/daily-brief"
import { deleteFileByNameInFolder } from "@/lib/drive/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Decline endpoint — the "No" button in the evening email links here.
 *
 * Supports both GET (one-click from email) and POST (called by the
 * form's "Skip" button). On success, GET renders a tiny HTML
 * confirmation page; POST returns JSON for the form to consume.
 */

const SUCCESS_HTML = (forDate: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Declined · Tomorrow's Dispatch</title>
  <style>
    body { margin:0; padding:0; background:#fbf7ec; color:#0d1b3d; font-family:'IBM Plex Serif',Georgia,serif; }
    .wrap { max-width:520px; margin:0 auto; padding:64px 24px; text-align:center; }
    .kicker { font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:10.5px; letter-spacing:0.32em; text-transform:uppercase; color:#b45309; font-weight:600; }
    h1 { font-family:Gloock,Georgia,serif; font-weight:400; font-size:32px; margin:14px 0 12px; line-height:1.15; }
    p { font-size:16px; line-height:1.6; font-style:italic; color:rgba(13,27,61,0.7); }
    code { font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:13px; background:rgba(13,27,61,0.06); padding:1px 4px; border-radius:3px; font-style:normal; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="kicker">Studio · Tomorrow's Dispatch</div>
    <h1>Declined.</h1>
    <p>The morning rotation for <code>${forDate}</code> will run as scheduled.</p>
  </div>
</body>
</html>`

async function handle(forDate: string) {
  await setBriefDecision(forDate, "no")
  // Best-effort cleanup of any stale brief file in Drive so Cowork
  // doesn't pick up yesterday's brief on a no-day. Non-fatal.
  const r = await deleteFileByNameInFolder(`_brief-${forDate}.md`)
  if (!r.ok) {
    console.error(
      JSON.stringify({
        tag: "studio.brief.drive_decline_cleanup_failed",
        forDate,
        error: r.error,
      }),
    )
  }
}

export async function GET(req: NextRequest) {
  const secret = process.env.STUDIO_APPROVAL_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: "approval_secret_unset" }, { status: 503 })
  }
  const token = new URL(req.url).searchParams.get("token") ?? ""
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 })
  }
  const verify = verifyBriefToken(token, secret)
  if (!verify.ok) {
    return NextResponse.json(
      { ok: false, error: verify.error },
      { status: verify.error === "expired" ? 410 : 401 },
    )
  }
  try {
    await handle(verify.payload.forDate)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { ok: false, error: "brief_save_failed", debug: message },
      { status: 502 },
    )
  }
  console.log(
    JSON.stringify({ tag: "studio.brief.declined", forDate: verify.payload.forDate }),
  )
  return new NextResponse(SUCCESS_HTML(verify.payload.forDate), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  })
}

export async function POST(req: NextRequest) {
  const secret = process.env.STUDIO_APPROVAL_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: "approval_secret_unset" }, { status: 503 })
  }
  let body: { token?: unknown }
  try {
    body = (await req.json()) as { token?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  const token = typeof body.token === "string" ? body.token : ""
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 })
  }
  const verify = verifyBriefToken(token, secret)
  if (!verify.ok) {
    return NextResponse.json(
      { ok: false, error: verify.error },
      { status: verify.error === "expired" ? 410 : 401 },
    )
  }
  try {
    await handle(verify.payload.forDate)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { ok: false, error: "brief_save_failed", debug: message },
      { status: 502 },
    )
  }
  return NextResponse.json({ ok: true, forDate: verify.payload.forDate })
}
