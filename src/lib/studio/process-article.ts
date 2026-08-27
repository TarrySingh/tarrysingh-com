import { parseDailyArticle } from "./ingest"
import {
  getPreparedFrontmatter,
  stashAwaitingArticle,
} from "./prepared-frontmatter"
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
  /**
   * Set when the article was written FROM A BRIEF Tarry filed. The same-day
   * dedup below exists to stop two racing writers producing two rotation
   * pieces. A brief is not a race: it is an explicit request, and it has
   * already lost to the rotation once (see backup-writer, 2026-08-27). So it
   * is allowed past the guard.
   */
  allowSameDay?: boolean
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
        | "awaiting_frontmatter"
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
  // Date the Dispatch by the article's own day (the YYYY-MM-DD_ filename
  // prefix), not the ingest day — so a multi-day backlog never collapses under
  // the same-day dedup, and backdated posts slot into the timeline correctly.
  const articleDate =
    input.filename.match(/(\d{4}-\d{2}-\d{2})_/)?.[1] ??
    new Date().toISOString().slice(0, 10)
  try {
    const sb = createServiceClient()
    const { data: existing, error: dedupErr } = await sb
      .from("studio_drafts")
      .select("slug, frontmatter")
      .filter("frontmatter->>date", "eq", articleDate)
      .limit(1)
    if (!dedupErr && existing && existing.length > 0 && !input.allowSameDay) {
      const existingSlug = (existing[0] as { slug: string }).slug
      if (existingSlug !== slug) {
        console.log(
          JSON.stringify({
            tag: "studio.processArticle.duplicate_skip",
            articleDate,
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

  // ── 2. Frontmatter — Claude-Code-prepared, no Anthropic API ───────
  // category/excerpt/tags are generated by a Claude Code session (interactive
  // or the scheduled cloud routine) and stashed in studio_prepared_frontmatter.
  // If none exists yet, leave the file in a retryable "awaiting" state — a later
  // tick picks it up once the prepare step has run. Replaces the old
  // aiFrontmatter API call that coupled the Dispatch to the Anthropic budget.
  const prepared = await getPreparedFrontmatter(slug)
  if (!prepared) {
    // Stash the body so the scheduled cloud routine can generate the
    // frontmatter (Supabase-only on its side, no Drive dependency).
    await stashAwaitingArticle({ slug, title, body, wordCount, articleDate })
    return {
      ok: false,
      stage: "awaiting_frontmatter",
      error: "no_prepared_frontmatter",
      slug,
    }
  }

  const frontmatter: DispatchFrontmatter = {
    title,
    date: articleDate,
    category: prepared.category,
    excerpt: prepared.excerpt,
    theme: "editorial",
    draft: true,
    tags: prepared.tags,
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
    excerpt: prepared.excerpt,
    category: prepared.category,
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
    category: prepared.category,
    excerpt: prepared.excerpt,
    tags: prepared.tags,
    previewUrl,
    approveUrl,
    emailId: emailRes.emailId,
  }
}
