import { NextRequest, NextResponse } from "next/server"
import { verifyApprovalToken } from "@/lib/studio/approval-token"
import { getDraft, deleteDraft } from "@/lib/studio/drafts-store"
import { publishDispatch } from "@/lib/studio/publish"
import {
  deleteFileByNameInFolder,
  deleteFilesBySlugInFolder,
} from "@/lib/drive/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Sprint — auto-publish pipeline. GET /api/studio/approve?token=…
 *
 * One-click email approval handler. Tarry clicks the "Publish now"
 * pill in the approval email; the link lands here; this handler:
 *
 *   1. Verifies the HMAC token (signature + 72-hour TTL).
 *   2. Loads the matching draft from Supabase.
 *   3. Calls publishDispatch() to commit the .mdx to main.
 *   4. Deletes the draft row.
 *   5. Returns a minimal "✓ Published" HTML success page with the
 *      canonical /blog/<slug> URL + the GitHub commit URL.
 *
 * Auth is the signed token only — this route is exempted from the
 * Basic Auth gate in src/middleware.ts so the email click works
 * without Tarry needing to authenticate first (his Apple/Gmail
 * browser session won't have STUDIO_USER/STUDIO_PASS cached).
 *
 * Failure paths render minimal HTML (not JSON) because this URL is
 * opened in a browser by a click. Server still logs structured JSON
 * for telemetry.
 */

const SECRET_ENV = "STUDIO_APPROVAL_SECRET"

function renderHtmlPage({
  status,
  heading,
  body,
}: {
  status: "ok" | "error"
  heading: string
  body: string
}): string {
  const accent = status === "ok" ? "#b45309" : "#be123c"
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${heading}</title>
    <style>
      body { margin: 0; padding: 0; background: #fbf7ec; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Serif', Georgia, serif; color: #0d1b3d; }
      .card { max-width: 540px; margin: 0 auto; padding: 32px; text-align: left; }
      .kicker { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.32em; text-transform: uppercase; color: ${accent}; font-weight: 600; }
      .rule { border: 0; height: 1px; background: rgba(180,134,11,0.22); margin: 14px 0 24px; }
      h1 { font-family: Gloock, Georgia, serif; font-weight: 400; font-size: 28px; line-height: 1.2; margin: 0 0 14px; }
      p { font-size: 16px; line-height: 1.65; margin: 0 0 14px; }
      a { color: ${accent}; text-decoration: underline; text-decoration-color: rgba(180,134,11,0.45); text-underline-offset: 3px; }
      code { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 13px; background: rgba(13,27,61,0.05); padding: 1px 6px; border-radius: 4px; }
      .footer { margin-top: 24px; font-style: italic; font-size: 13px; color: rgba(13,27,61,0.55); }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="kicker">Studio · Dispatches</div>
      <hr class="rule" />
      <h1>${heading}</h1>
      ${body}
      <p class="footer">— the studio</p>
    </div>
  </body>
</html>`
}

function htmlResponse(html: string, status: number): NextResponse {
  return new NextResponse(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  })
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() ?? ""
  const secret = process.env[SECRET_ENV]

  if (!secret) {
    console.error(JSON.stringify({ tag: "studio.approve.unconfigured" }))
    return htmlResponse(
      renderHtmlPage({
        status: "error",
        heading: "Approval endpoint not configured",
        body: `<p>The <code>${SECRET_ENV}</code> environment variable isn't set on the Vercel project. Approval links can't be verified until it's added.</p>`,
      }),
      503,
    )
  }

  if (!token) {
    return htmlResponse(
      renderHtmlPage({
        status: "error",
        heading: "Missing approval token",
        body: `<p>This URL needs a <code>?token=…</code> query parameter from the approval email.</p>`,
      }),
      400,
    )
  }

  const verify = verifyApprovalToken(token, secret)
  if (!verify.ok) {
    const heading =
      verify.error === "expired"
        ? "This approval link has expired"
        : verify.error === "bad_signature"
          ? "Approval signature invalid"
          : "Approval token malformed"
    const body =
      verify.error === "expired"
        ? `<p>Approval links live for 72 hours. The draft is still in your Studio editor, visit it directly and click Publish from there:</p><p><a href="/studio">/studio</a></p>`
        : `<p>The token in the URL didn't pass verification. If you copied it manually, paste the full original link from the email.</p><p><a href="/studio">/studio</a></p>`
    const status = verify.error === "expired" ? 410 : 401
    console.warn(
      JSON.stringify({ tag: "studio.approve.token_invalid", reason: verify.error }),
    )
    return htmlResponse(renderHtmlPage({ status: "error", heading, body }), status)
  }

  const { slug } = verify.payload

  // Load the draft.
  const draft = await getDraft(slug)
  if (!draft) {
    // Either someone already approved (and the row was deleted),
    // or the slug was never ingested. Both look the same from here.
    return htmlResponse(
      renderHtmlPage({
        status: "error",
        heading: "Draft not found",
        body: `<p>No draft exists at <code>${slug}</code> in the studio. It may have been published already, or deleted from the drafts list. Visit <a href="/studio">/studio</a> to check.</p>`,
      }),
      404,
    )
  }

  // Publish.
  const result = await publishDispatch({
    slug: draft.slug,
    frontmatter: draft.frontmatter,
    body: draft.body,
    commitMessage: `feat(blog): publish ${draft.slug}\n\nPublished via the auto-publish approval email.\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`,
  })
  if (!result.ok) {
    console.error(
      JSON.stringify({ tag: "studio.approve.publish_failed", slug, error: result.error }),
    )
    const heading =
      result.error === "slug_already_exists"
        ? "This Dispatch is already live"
        : result.error === "invalid_mdx"
          ? "Post has invalid formatting"
          : "Publish failed"
    const bodyText =
      result.error === "slug_already_exists"
        ? `<p>A post already exists at <code>content/blog/${slug}.mdx</code> on <code>main</code>. The draft was likely approved earlier; you can safely delete it from <a href="/studio">/studio</a>.</p><p><a href="https://www.tarrysingh.com/blog/${slug}">View on /blog/${slug}</a></p>`
        : result.error === "invalid_mdx"
          ? `<p>The post body did not compile as MDX, so it was <strong>not</strong> published, this gate stops a broken post from freezing the whole site's build. Open it in the editor, fix the formatting, and publish again:</p><p><a href="/studio/editor/${slug}">/studio/editor/${slug}</a></p>`
          : `<p>The publish step returned <code>${result.error}</code>. The draft is still in Supabase, so you can re-attempt manually via the editor:</p><p><a href="/studio/editor/${slug}">/studio/editor/${slug}</a></p>`
    const status = result.error === "slug_already_exists" ? 409 : 502
    return htmlResponse(renderHtmlPage({ status: "error", heading, body: bodyText }), status)
  }

  // Delete the draft row (mirrors the studio editor's publish behaviour).
  try {
    await deleteDraft(slug)
  } catch (err) {
    // Non-fatal — log and continue; the post is live.
    console.warn(
      JSON.stringify({
        tag: "studio.approve.draft_delete_failed",
        slug,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
  }

  // Also delete the Drive source file so the Drive cron / watcher can't
  // re-ingest it later. Net invariant: a published article never sits in
  // the tarry-daily-blogs folder. Slug-based search (any `*_<slug>.md`)
  // because the filename's date prefix may not match draft.frontmatter.date.
  // The local Mac copy gets garbage-collected by Drive desktop sync
  // mirroring the delete within ~60 s. Non-fatal — the post is live
  // regardless.
  try {
    const r = await deleteFilesBySlugInFolder(slug)
    console.log(
      JSON.stringify({
        tag: "studio.approve.drive_cleanup",
        slug,
        ok: r.ok,
        deleted: r.ok ? r.deleted : undefined,
        names: r.ok ? r.names : undefined,
        error: r.ok ? undefined : r.error,
      }),
    )
  } catch (err) {
    console.warn(
      JSON.stringify({
        tag: "studio.approve.drive_cleanup_failed",
        slug,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
  }

  // Also trash the daily-brief mirror file if one was filed for the
  // article's date. Cowork's MCP has no delete/move capability so it
  // can't clean up after itself; do it here instead. Best-effort.
  try {
    const briefFilename = `_brief-${draft.frontmatter.date}.md`
    const r = await deleteFileByNameInFolder(briefFilename)
    console.log(
      JSON.stringify({
        tag: "studio.approve.drive_brief_cleanup",
        slug,
        briefFilename,
        ok: r.ok,
        deleted: r.ok ? r.deleted : undefined,
        error: r.ok ? undefined : r.error,
      }),
    )
  } catch (err) {
    console.warn(
      JSON.stringify({
        tag: "studio.approve.drive_brief_cleanup_failed",
        slug,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
  }

  console.log(
    JSON.stringify({
      tag: "studio.approve.ok",
      slug,
      commitSha: result.commitSha,
    }),
  )

  return htmlResponse(
    renderHtmlPage({
      status: "ok",
      heading: "Published",
      body: `
        <p>The Dispatch is on <code>main</code>. Vercel will deploy it within ~90 seconds.</p>
        <p><a href="${result.blogUrl}">${result.blogUrl}</a></p>
        <p><a href="${result.commitUrl}">View commit on GitHub ↗</a></p>
      `,
    }),
    200,
  )
}
