import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"
import { parseDailyArticle } from "@/lib/studio/ingest"
import { aiFrontmatter } from "@/lib/studio/ai"
import { upsertDraft } from "@/lib/studio/drafts-store"
import { sendApprovalEmail } from "@/lib/studio/email"
import { makeApprovalToken } from "@/lib/studio/approval-token"
import type { DispatchFrontmatter } from "@/lib/studio/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// AI frontmatter call takes ~10–15 s; budget room.
export const maxDuration = 60

/**
 * Sprint — auto-publish pipeline. POST /api/studio/ingest
 *
 * Receives a daily-article payload from the local watcher, runs the
 * full ingestion pipeline:
 *
 *   1. Verify HMAC signature (X-Ingest-Signature header).
 *   2. Verify timestamp within 5 minutes (replay protection).
 *   3. Parse the article (slug, title, body extracted from filename + H1).
 *   4. Call aiFrontmatter() to get suggested {category, excerpt, tags}.
 *   5. Upsert into studio_drafts (or 409 if the slug already exists).
 *   6. Mint a signed approval token (72 h TTL).
 *   7. Send the "preview ready" email via Resend.
 *   8. Return 200 with the draft slug + email id.
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

  // ── 3. Parse article ────────────────────────────────────────────
  const parsed = parseDailyArticle({ filename, content })
  if (!parsed.ok) {
    return NextResponse.json(parsed, { status: 422 })
  }
  const { slug, title, body, wordCount } = parsed

  // ── 4. AI frontmatter ───────────────────────────────────────────
  const fm = await aiFrontmatter({ title, body })
  if (!fm.ok) {
    const status = fm.error === "ai_unconfigured" ? 503 : 502
    console.error(
      JSON.stringify({ tag: "studio.ingest.ai_frontmatter_failed", slug, error: fm.error }),
    )
    return NextResponse.json(fm, { status })
  }

  const today = new Date().toISOString().slice(0, 10)
  const frontmatter: DispatchFrontmatter = {
    title,
    date: today,
    category: fm.suggestion.category,
    excerpt: fm.suggestion.excerpt,
    theme: "editorial",
    draft: true,
    tags: fm.suggestion.tags,
    hero: "",
    linkedin_url: "",
  }

  // ── 5. Upsert into Supabase ─────────────────────────────────────
  try {
    await upsertDraft({
      slug,
      frontmatter,
      body,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({ tag: "studio.ingest.upsert_failed", slug, error: message }),
    )
    return NextResponse.json(
      { ok: false, error: "draft_upsert_failed" },
      { status: 502 },
    )
  }

  // ── 6. Mint approval token ──────────────────────────────────────
  const approvalSecret = process.env.STUDIO_APPROVAL_SECRET
  if (!approvalSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "approval_unconfigured",
        hint: "Set STUDIO_APPROVAL_SECRET on the Vercel project.",
      },
      { status: 503 },
    )
  }
  const approvalToken = makeApprovalToken({ slug }, approvalSecret)

  // ── 7. Send email ───────────────────────────────────────────────
  const origin = new URL(req.url).origin
  const previewUrl = `${origin}/studio/editor/${encodeURIComponent(slug)}`
  const approveUrl = `${origin}/api/studio/approve?token=${encodeURIComponent(approvalToken)}`

  const emailRes = await sendApprovalEmail({
    slug,
    title,
    excerpt: fm.suggestion.excerpt,
    category: fm.suggestion.category,
    wordCount,
    previewUrl,
    approveUrl,
  })
  if (!emailRes.ok) {
    // Draft is already in Supabase; the email failure is recoverable
    // (Tarry can publish manually). Surface a 502 but include the draft
    // slug so the caller can log and retry the email separately.
    console.error(
      JSON.stringify({ tag: "studio.ingest.email_failed", slug, error: emailRes.error }),
    )
    return NextResponse.json(
      {
        ok: false,
        error: emailRes.error,
        slug,
        previewUrl,
        approveUrl,
        debug: emailRes.debug,
      },
      { status: 502 },
    )
  }

  // ── 8. Done ─────────────────────────────────────────────────────
  console.log(
    JSON.stringify({
      tag: "studio.ingest.ok",
      slug,
      wordCount,
      emailId: emailRes.emailId,
    }),
  )
  return NextResponse.json({
    ok: true,
    slug,
    title,
    wordCount,
    category: fm.suggestion.category,
    excerpt: fm.suggestion.excerpt,
    tags: fm.suggestion.tags,
    previewUrl,
    approveUrl,
    emailId: emailRes.emailId,
  })
}
