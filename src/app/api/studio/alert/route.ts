import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"
import { Resend } from "resend"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

/**
 * POST /api/studio/alert
 *
 * Posted by the local LaunchAgent watcher when an article has failed
 * to ingest N consecutive times (default 3). The watcher's previous
 * behaviour was silent retry-forever — Tarry only noticed today that
 * Cowork had changed its source format and the watcher had been
 * 422-looping for 6 hours.
 *
 * Auth: same HMAC + 5-min replay window as /api/studio/ingest. Reuses
 * STUDIO_INGEST_SECRET so the watcher has one secret to hold.
 *
 * Side effect: fires a short studio-voice alert email via Resend.
 * Returns 200 with `{ ok, emailId }` on success, structured errors
 * otherwise. Fail-closed when RESEND_API_KEY or STUDIO_APPROVAL_EMAIL
 * are unset.
 */

const TIMESTAMP_WINDOW_SECONDS = 5 * 60
const DEFAULT_TO = "tarry.singh@deepkapha.com"
const DEFAULT_FROM = "Studio · Dispatches <studio@tarrysingh.com>"

interface AlertBody {
  filename?: unknown
  error?: unknown
  status?: unknown
  attemptCount?: unknown
  /** Optional debug snippet — first ~280 chars of the server's last response. */
  lastBody?: unknown
  /** Unix ms timestamp the watcher signed at. */
  timestamp?: unknown
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function POST(req: NextRequest) {
  // ── 1. HMAC verification (same secret as /api/studio/ingest) ─────
  const secret = process.env.STUDIO_INGEST_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "alert_unconfigured" },
      { status: 503 },
    )
  }

  const presentedSig = req.headers.get("x-ingest-signature")?.trim() ?? ""
  if (!presentedSig || !/^[a-f0-9]{64}$/i.test(presentedSig)) {
    return NextResponse.json(
      { ok: false, error: "missing_or_invalid_signature" },
      { status: 401 },
    )
  }

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 })
  }

  const expectedSig = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")
  try {
    const a = Buffer.from(expectedSig, "hex")
    const b = Buffer.from(presentedSig, "hex")
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 })
  }

  // ── 2. Shape + replay window ─────────────────────────────────────
  let payload: AlertBody
  try {
    payload = JSON.parse(rawBody) as AlertBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const filename = typeof payload.filename === "string" ? payload.filename : "(unknown)"
  const errorCode = typeof payload.error === "string" ? payload.error : "(unknown)"
  const status = typeof payload.status === "number" ? payload.status : 0
  const attempts = typeof payload.attemptCount === "number" ? payload.attemptCount : 0
  const lastBody =
    typeof payload.lastBody === "string" ? payload.lastBody.slice(0, 280) : ""
  const timestamp = typeof payload.timestamp === "number" ? payload.timestamp : NaN

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return NextResponse.json({ ok: false, error: "missing_timestamp" }, { status: 400 })
  }
  const ageSeconds = Math.abs(Date.now() - timestamp) / 1000
  if (ageSeconds > TIMESTAMP_WINDOW_SECONDS) {
    return NextResponse.json(
      { ok: false, error: "timestamp_out_of_window" },
      { status: 401 },
    )
  }

  // ── 3. Email via Resend ──────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "email_unconfigured" },
      { status: 503 },
    )
  }
  const to = process.env.STUDIO_APPROVAL_EMAIL || DEFAULT_TO
  const from = process.env.STUDIO_APPROVAL_FROM || DEFAULT_FROM
  const subject = `Studio · ingest failure · ${filename}`

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><title>Studio ingest alert</title>
<style>
  body { margin:0; padding:0; background:#fbf7ec; font-family:'IBM Plex Serif',Georgia,serif; color:#0d1b3d; }
  .wrap { max-width:560px; margin:0 auto; padding:32px 24px 48px; }
  .kicker { font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:10.5px; letter-spacing:0.32em; text-transform:uppercase; color:#b45309; font-weight:600; }
  h1 { font-family:Gloock,Georgia,serif; font-weight:400; font-size:24px; line-height:1.2; margin:14px 0 12px; }
  p { font-size:15px; line-height:1.55; margin:0 0 12px; }
  .rule { border:0; height:1px; background:rgba(180,134,11,0.22); margin:16px 0 18px; }
  code { font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:13px; background:rgba(13,27,61,0.06); padding:1px 4px; border-radius:3px; }
  pre { font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:11.5px; background:rgba(13,27,61,0.06); padding:10px 12px; border-radius:6px; white-space:pre-wrap; word-break:break-word; }
  .footer { margin-top:24px; padding-top:14px; border-top:1px solid rgba(180,134,11,0.18); font-style:italic; font-size:13px; color:rgba(13,27,61,0.55); }
</style></head><body><div class="wrap">
<div class="kicker">Studio · ingest alert</div>
<hr class="rule"/>
<h1>The watcher has stopped ingesting <code>${esc(filename)}</code>.</h1>
<p><strong>${attempts}</strong> consecutive failures. Last response: <code>${status || ", "}</code> · <code>${esc(errorCode)}</code>.</p>
${lastBody ? `<p><strong>Body snippet:</strong></p><pre>${esc(lastBody)}</pre>` : ""}
<p>The watcher has backed off this file to 15-min retries so it won't keep hammering the endpoint. Fix the ingestion path (parser, env var, Resend, etc.) and the next tick will pick it up.</p>
<p class="footer">Automated. From the LaunchAgent on Tarry's Mac. One alert per file per failure-streak.</p>
</div></body></html>`

  const text = [
    "Studio · ingest alert",
    ", ",
    "",
    `Filename:        ${filename}`,
    `Consecutive #:   ${attempts}`,
    `Last status:     ${status || ", "}`,
    `Error code:      ${errorCode}`,
    "",
    lastBody ? `Body snippet:\n${lastBody}\n` : "",
    "The watcher has backed off to 15-min retries on this file.",
    "Fix the ingestion path and the next tick will pick it up.",
  ].join("\n")

  try {
    const resend = new Resend(apiKey)
    const res = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      text,
      headers: {
        "X-Entity-Ref-ID": `studio-alert-${filename}-${Date.now()}`,
      },
    })
    if (res.error || !res.data?.id) {
      console.error(
        JSON.stringify({ tag: "studio.alert.send_error", filename, error: res.error }),
      )
      return NextResponse.json(
        { ok: false, error: "email_send_failed" },
        { status: 502 },
      )
    }
    console.log(
      JSON.stringify({
        tag: "studio.alert.ok",
        filename,
        attempts,
        emailId: res.data.id,
      }),
    )
    return NextResponse.json({ ok: true, emailId: res.data.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({ tag: "studio.alert.send_exception", filename, error: message }),
    )
    return NextResponse.json(
      { ok: false, error: "email_send_failed" },
      { status: 502 },
    )
  }
}
