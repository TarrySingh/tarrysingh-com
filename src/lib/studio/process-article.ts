import { parseDailyArticle } from "./ingest"
import { aiFrontmatter } from "./ai"
import { upsertDraft } from "./drafts-store"
import { sendApprovalEmail } from "./email"
import { makeApprovalToken } from "./approval-token"
import { createServiceClient } from "@/lib/supabase/server"
import type { DispatchFrontmatter } from "./types"

/**
 * Sprint 9.1 — shared "drop one article into the publish-approval
 * pipeline" helper. Both the HMAC-authenticated /api/studio/ingest
 * route (called by the local LaunchAgent) and the Vercel-cron
 * /api/cron/ingest-drive route (Google Drive poll) call this so the
 * downstream behaviour stays identical regardless of the upstream.
 *
 * Steps, in order:
 *   1. parseDailyArticle()       — slug + title + body
 *   2. aiFrontmatter()           — category + excerpt + tags
 *   3. upsertDraft()             — Supabase studio_drafts upsert
 *   4. makeApprovalToken()       — 72 h signed token
 *   5. sendApprovalEmail()       — Resend transactional
 *
 * The caller passes the origin (`https://www.tarrysingh.com`) so the
 * preview + approve URLs in the email are absolute. In the cron path
 * we synthesise the origin from a fixed env var; in the HMAC path we
 * read it off the incoming request.
 *
 * Returns a discriminated union so each route can render the right
 * HTTP status. We deliberately keep "draft is in Supabase but email
 * failed" as a soft success (caller decides 200 vs 502) — the article
 * is recoverable via /studio/editor/<slug> even without the email.
 */

export interface ProcessArticleInput {
  /** Filename — must follow `YYYY-MM-DD_kebab.md` for slug derivation. */
  filename: string
  /** Raw markdown content (H1 + byline + body). */
  content: string
  /** Origin for absolute URLs in the email (e.g. https://www.tarrysingh.com). */
  origin: string
}

export type ProcessArticleResult =
  | {
      ok: true
      slug: string
      title: string
      wordCount: number
      category: DispatchFrontmatter["category"]
      excerpt: string
      tags: string[]
      previewUrl: string
      approveUrl: string
      emailId: string
    }
  | {
      // Soft-success "we already have a Dispatch for today" — caller
      // should treat as a no-op and return 200 with a skipped flag.
      ok: false
      stage: "duplicate"
      error: "already_have_draft_for_today"
      slug: string
    }
  | {
      ok: false
      stage:
        | "parse"
        | "ai_frontmatter"
        | "upsert"
        | "approval_secret_missing"
        | "email"
      error: string
      /** Soft-failure data preserved so the caller can surface it. */
      slug?: string
      previewUrl?: string
      approveUrl?: string
      debug?: string
    }

export async function processArticle(
  input: ProcessArticleInput,
): Promise<ProcessArticleResult> {
  // ── 1. Parse article ──────────────────────────────────────────────
  const parsed = parseDailyArticle({
    filename: input.filename,
    content: input.content,
  })
  if (!parsed.ok) {
    return { ok: false, stage: "parse", error: parsed.error }
  }
  const { slug, title, body, wordCount } = parsed

  // ── 1.5. Same-day dedup ───────────────────────────────────────────
  //
  // Multiple writers (Cowork on Mac + backup-writer on Vercel + Drive
  // cron) can all converge on the same day. Without this check, a slow
  // Cowork run can race the 09:45-Amsterdam backup-writer and both
  // succeed, producing two drafts + two approval emails.
  //
  // Rule: if a draft already exists whose frontmatter.date matches
  // today's UTC date, this is the second writer — return a soft
  // "duplicate" so the caller can no-op cleanly. First writer wins.
  const todayUtc = new Date().toISOString().slice(0, 10)
  try {
    const sb = createServiceClient()
    const { data: existing, error: dedupErr } = await sb
      .from("studio_drafts")
      .select("slug, frontmatter")
      .filter("frontmatter->>date", "eq", todayUtc)
      .limit(1)
    if (!dedupErr && existing && existing.length > 0) {
      const existingSlug = (existing[0] as { slug: string }).slug
      if (existingSlug !== slug) {
        console.log(
          JSON.stringify({
            tag: "studio.processArticle.duplicate_skip",
            todayUtc,
            existingSlug,
            attemptedSlug: slug,
          }),
        )
        return {
          ok: false,
          stage: "duplicate",
          error: "already_have_draft_for_today",
          slug: existingSlug,
        }
      }
      // Same slug — fall through to upsert which will update the existing row.
    }
  } catch (err) {
    // Dedup lookup failure is non-fatal — better to risk a duplicate
    // than to lose the article entirely.
    console.warn(
      JSON.stringify({
        tag: "studio.processArticle.dedup_lookup_failed",
        error: err instanceof Error ? err.message : String(err),
      }),
    )
  }

  // ── 2. AI frontmatter ─────────────────────────────────────────────
  const fm = await aiFrontmatter({ title, body })
  if (!fm.ok) {
    return { ok: false, stage: "ai_frontmatter", error: fm.error, slug }
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

  // ── 3. Upsert into Supabase ───────────────────────────────────────
  try {
    await upsertDraft({
      slug,
      frontmatter,
      body,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, stage: "upsert", error: message, slug }
  }

  // ── 4. Mint approval token ────────────────────────────────────────
  const approvalSecret = process.env.STUDIO_APPROVAL_SECRET
  if (!approvalSecret) {
    return {
      ok: false,
      stage: "approval_secret_missing",
      error: "STUDIO_APPROVAL_SECRET not set on the Vercel project.",
      slug,
    }
  }
  const approvalToken = makeApprovalToken({ slug }, approvalSecret)

  // ── 5. Send email ─────────────────────────────────────────────────
  const previewUrl = `${input.origin}/studio/editor/${encodeURIComponent(slug)}`
  const approveUrl = `${input.origin}/api/studio/approve?token=${encodeURIComponent(approvalToken)}`

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
    return {
      ok: false,
      stage: "email",
      error: emailRes.error,
      slug,
      previewUrl,
      approveUrl,
      debug: emailRes.debug,
    }
  }

  return {
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
  }
}
