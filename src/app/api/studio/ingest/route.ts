import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"
import { processArticle } from "@/lib/studio/process-article"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// AI frontmatter call takes ~10–15 s; budget room.
export const maxDuration = 60

/**
 * Sprint — auto-publish pipeline. POST /api/studio/ingest
 *
 * Receives a daily-article payload from the local LaunchAgent watcher
 * (scripts/ingest/watch-tarry-blogs.mjs) and runs it through the
 * shared `processArticle` pipeline.
 *
 *   1. Verify HMAC signature (X-Ingest-Signature header).
 *   2. Verify timestamp within 5 minutes (replay protection).
 *   3. Hand off to processArticle({filename, content, origin}).
 *
 * Sprint 9.1 — the heavy lifting (parse → ai → upsert → token → email)
 * has been hoisted to `src/lib/studio/process-article.ts` so the new
 * /api/cron/ingest-drive route (Vercel cron polling Google Drive)
 * can share the exact same downstream behaviour.
 *
 * Auth is HMAC-only — this route is exempted from the Basic Auth gate
 * in src/middleware.ts because the local LaunchAgent doesn't carry
 * STUDIO_USER/STUDIO_PASS credentials and shouldn't have to.
 */

const TIMESTAMP_WINDOW_SECONDS = 5 * 60 // 5 minutes — replay protection

interface IngestBody {
  filename?: unknown
  content?: unknown
  /** Unix ms timestamp the watcher signed at — replay-window check uses this. */
  timestamp?: unknown
}

export async function POST(req: NextRequest) {
  // ── 1. HMAC verification ─────────────────────────────────────────
  const secret = process.env.STUDIO_INGEST_SECRET
  if (!secret) {
    console.error(JSON.stringify({ tag: "studio.ingest.unconfigured" }))
    return NextResponse.json(
      { ok: false, error: "ingest_unconfigured" },
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
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 },
    )
  }

  const expectedSig = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex")
  try {
    const a = Buffer.from(expectedSig, "hex")
    const b = Buffer.from(presentedSig, "hex")
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json(
        { ok: false, error: "bad_signature" },
        { status: 401 },
      )
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "bad_signature" },
      { status: 401 },
    )
  }

  // ── 2. Body shape + timestamp window ────────────────────────────
  let payload: IngestBody
  try {
    payload = JSON.parse(rawBody) as IngestBody
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    )
  }

  const filename = typeof payload.filename === "string" ? payload.filename : ""
  const content = typeof payload.content === "string" ? payload.content : ""
  const timestamp =
    typeof payload.timestamp === "number" ? payload.timestamp : NaN

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return NextResponse.json(
      { ok: false, error: "missing_timestamp" },
      { status: 400 },
    )
  }
  const ageSeconds = Math.abs(Date.now() - timestamp) / 1000
  if (ageSeconds > TIMESTAMP_WINDOW_SECONDS) {
    return NextResponse.json(
      {
        ok: false,
        error: "timestamp_out_of_window",
        hint: `Signed payload age ${Math.round(ageSeconds)}s exceeds the ${TIMESTAMP_WINDOW_SECONDS}s replay window.`,
      },
      { status: 401 },
    )
  }

  // ── 3. Hand off to the shared pipeline ──────────────────────────
  const origin = new URL(req.url).origin
  const result = await processArticle({ filename, content, origin })

  if (!result.ok) {
    // Map shared-helper stage → HTTP status, keeping the legacy
    // response shape the LaunchAgent watcher already logs.
    if (result.stage === "duplicate") {
      // Soft success — another writer already produced today's
      // Dispatch. Return 200 so the LaunchAgent / Drive cron mark
      // the file as handled and stop retrying.
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "already_have_draft_for_today",
        slug: result.slug,
      })
    }
    if (result.stage === "parse") {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 422 },
      )
    }
    if (result.stage === "ai_frontmatter") {
      const status = result.error === "ai_unconfigured" ? 503 : 502
      console.error(
        JSON.stringify({
          tag: "studio.ingest.ai_frontmatter_failed",
          slug: result.slug,
          error: result.error,
        }),
      )
      return NextResponse.json(
        { ok: false, error: result.error },
        { status },
      )
    }
    if (result.stage === "upsert") {
      console.error(
        JSON.stringify({
          tag: "studio.ingest.upsert_failed",
          slug: result.slug,
          error: result.error,
        }),
      )
      return NextResponse.json(
        { ok: false, error: "draft_upsert_failed" },
        { status: 502 },
      )
    }
    if (result.stage === "approval_secret_missing") {
      return NextResponse.json(
        {
          ok: false,
          error: "approval_unconfigured",
          hint: "Set STUDIO_APPROVAL_SECRET on the Vercel project.",
        },
        { status: 503 },
      )
    }
    // stage === "email" — draft is already in Supabase; the email
    // failure is recoverable (Tarry can publish manually). Surface a
    // 502 but include the draft slug so the caller can log and retry.
    console.error(
      JSON.stringify({
        tag: "studio.ingest.email_failed",
        slug: result.slug,
        error: result.error,
      }),
    )
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        slug: result.slug,
        previewUrl: result.previewUrl,
        approveUrl: result.approveUrl,
        debug: result.debug,
      },
      { status: 502 },
    )
  }

  // ── 4. Done ─────────────────────────────────────────────────────
  console.log(
    JSON.stringify({
      tag: "studio.ingest.ok",
      slug: result.slug,
      wordCount: result.wordCount,
      emailId: result.emailId,
    }),
  )
  return NextResponse.json({
    ok: true,
    slug: result.slug,
    title: result.title,
    wordCount: result.wordCount,
    category: result.category,
    excerpt: result.excerpt,
    tags: result.tags,
    previewUrl: result.previewUrl,
    approveUrl: result.approveUrl,
    emailId: result.emailId,
  })
}
