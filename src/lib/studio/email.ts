import { Resend } from "resend"

/**
 * Sprint — auto-publish pipeline. Resend wrapper that sends the
 * studio-voice "preview is ready" approval email.
 *
 * Independent of realai-crm's Resend integration: the CRM sends
 * cadence broadcasts (Welcome 3-email sequence, Monthly Roundup);
 * this is per-Dispatch transactional. Separate API key, separate
 * sender domain config, no cross-repo coupling.
 *
 * Env:
 *   RESEND_API_KEY            (required — fail-closed 503 when unset)
 *   STUDIO_APPROVAL_EMAIL     (default: tarry.singh@deepkapha.com)
 *   STUDIO_APPROVAL_FROM      (default: "Studio · Dispatches <studio@tarrysingh.com>")
 *
 * Note on the From address: Resend requires the sender domain to be
 * verified on the Resend dashboard. `tarrysingh.com` is the production
 * domain; the CRM already verifies `crm.realai.eu`. Tarry verifies
 * `tarrysingh.com` on Resend as part of the Sprint setup.
 */

const DEFAULT_TO = "tarry.singh@deepkapha.com"
const DEFAULT_FROM = "Studio · Dispatches <studio@tarrysingh.com>"

export interface SendApprovalEmailInput {
  /** Draft slug for the canonical URLs. */
  slug: string
  /** Title extracted from the H1. */
  title: string
  /** AI-suggested excerpt (80–300 chars). */
  excerpt: string
  /** AI-suggested category for the subject-line tag. */
  category: "Essays" | "Notes" | "Studio"
  /** Word count of the cleaned body — surfaces "~7 min read" in the email. */
  wordCount: number
  /** Full preview URL: https://www.tarrysingh.com/studio/editor/<slug> */
  previewUrl: string
  /** Full one-click approve URL with token query: …/api/studio/approve?token=… */
  approveUrl: string
  /** Override recipient for testing. Defaults to STUDIO_APPROVAL_EMAIL. */
  to?: string
}

export type SendApprovalEmailResult =
  | { ok: true; emailId: string }
  | {
      ok: false
      error:
        | "email_unconfigured"
        | "email_send_failed"
      debug?: string
    }

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Studio-voice HTML email. Cream paper + Plex Serif body + Gloock
 * display title + gold pill for the "Publish now" CTA. Mirrors the
 * register already used by the Welcome cadence emails in realai-crm
 * (commit b53ffd4 there) so this email feels consistent with the
 * studio's own correspondence.
 */
function renderHtml(input: SendApprovalEmailInput): string {
  const minutes = Math.max(1, Math.round(input.wordCount / 220))
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Preview ready — ${escapeHtml(input.title)}</title>
    <style>
      body { margin: 0; padding: 0; background: #fbf7ec; }
      .wrap { max-width: 560px; margin: 0 auto; padding: 32px 24px 48px; }
      .kicker {
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 10.5px;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        color: #b45309;
        font-weight: 600;
      }
      .rule { border: 0; height: 1px; background: rgba(180,134,11,0.22); margin: 16px 0 24px; }
      h1 {
        font-family: Gloock, Georgia, serif;
        font-weight: 400;
        font-size: 28px;
        line-height: 1.15;
        color: #0d1b3d;
        margin: 0 0 14px;
      }
      .excerpt {
        font-family: 'IBM Plex Serif', Georgia, serif;
        font-style: italic;
        font-size: 16px;
        line-height: 1.6;
        color: #1e2a4a;
        margin: 0 0 28px;
      }
      .meta {
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 10.5px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: rgba(13,27,61,0.55);
        margin: 0 0 28px;
      }
      .cta-row { margin: 24px 0 28px; }
      .cta {
        display: inline-block;
        padding: 11px 20px;
        border-radius: 999px;
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 10.5px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        text-decoration: none;
        font-weight: 600;
        margin-right: 10px;
      }
      .cta-publish {
        background: #0d1b3d;
        color: #fff !important;
        border: 1px solid #b45309;
      }
      .cta-preview {
        background: #fff;
        color: #0d1b3d !important;
        border: 1px solid rgba(13,27,61,0.18);
      }
      .footer {
        margin-top: 36px;
        padding-top: 18px;
        border-top: 1px solid rgba(180,134,11,0.18);
        font-family: 'IBM Plex Serif', Georgia, serif;
        font-style: italic;
        font-size: 13px;
        color: rgba(13,27,61,0.55);
        line-height: 1.55;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="kicker">Studio · Dispatches</div>
      <hr class="rule" />
      <h1>${escapeHtml(input.title)}</h1>
      <p class="excerpt">${escapeHtml(input.excerpt)}</p>
      <p class="meta">${escapeHtml(input.category)} · ~${minutes} min · ${input.wordCount.toLocaleString("en-GB")} words</p>
      <div class="cta-row">
        <a class="cta cta-publish" href="${escapeHtml(input.approveUrl)}">Publish now</a>
        <a class="cta cta-preview" href="${escapeHtml(input.previewUrl)}">Preview in editor</a>
      </div>
      <p class="footer">
        Your preview is ready. One click sends it to <code>/blog/${escapeHtml(input.slug)}</code> on the live site;
        the alternate link opens the Studio Editor for review first.
        <br /><br />
        <em>Link is valid for 72 hours.</em>
      </p>
    </div>
  </body>
</html>`
}

function renderText(input: SendApprovalEmailInput): string {
  const minutes = Math.max(1, Math.round(input.wordCount / 220))
  return [
    "Studio · Dispatches — preview ready",
    "—",
    "",
    input.title,
    "",
    input.excerpt,
    "",
    `${input.category} · ~${minutes} min · ${input.wordCount.toLocaleString("en-GB")} words`,
    "",
    "Publish now:",
    input.approveUrl,
    "",
    "Preview in editor:",
    input.previewUrl,
    "",
    "Link is valid for 72 hours.",
    "",
    "— the studio",
  ].join("\n")
}

// ───────────────────────── Brief-prompt email ─────────────────────────

export interface SendBriefPromptInput {
  /** Amsterdam-local target date (YYYY-MM-DD) the brief is for. */
  forDate: string
  /** Form URL: …/studio/brief/<date>?token=… */
  yesUrl: string
  /** Decline URL: …/api/studio/brief/decline?token=… */
  noUrl: string
  /** Override recipient. Defaults to STUDIO_APPROVAL_EMAIL. */
  to?: string
}

function renderBriefPromptHtml(input: SendBriefPromptInput): string {
  const pretty = new Date(`${input.forDate}T00:00:00Z`).toLocaleDateString(
    "en-GB",
    {
      timeZone: "Europe/Amsterdam",
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  )
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Anything to shape tomorrow's Dispatch?</title>
    <style>
      body { margin: 0; padding: 0; background: #fbf7ec; }
      .wrap { max-width: 560px; margin: 0 auto; padding: 32px 24px 48px; }
      .kicker {
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 10.5px; letter-spacing: 0.32em; text-transform: uppercase;
        color: #b45309; font-weight: 600;
      }
      .rule { border: 0; height: 1px; background: rgba(180,134,11,0.22); margin: 16px 0 24px; }
      h1 {
        font-family: Gloock, Georgia, serif; font-weight: 400;
        font-size: 28px; line-height: 1.18; color: #0d1b3d; margin: 0 0 12px;
      }
      .meta {
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase;
        color: rgba(13,27,61,0.55); margin: 0 0 22px;
      }
      .body {
        font-family: 'IBM Plex Serif', Georgia, serif;
        font-size: 16px; line-height: 1.6; color: #1e2a4a; margin: 0 0 24px;
      }
      .cta-row { margin: 24px 0 28px; }
      .cta {
        display: inline-block; padding: 11px 20px; border-radius: 999px;
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase;
        text-decoration: none; font-weight: 600; margin-right: 10px;
      }
      .cta-yes  { background: #0d1b3d; color: #fff !important; border: 1px solid #b45309; }
      .cta-no   { background: #fff;    color: #0d1b3d !important; border: 1px solid rgba(13,27,61,0.18); }
      .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(180,134,11,0.18);
        font-family: 'IBM Plex Serif', Georgia, serif; font-style: italic;
        font-size: 13px; color: rgba(13,27,61,0.55); line-height: 1.55; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="kicker">Studio · Tomorrow's Dispatch</div>
      <hr class="rule" />
      <h1>Anything you want me to fold into ${escapeHtml(pretty)}'s piece?</h1>
      <p class="meta">For ${escapeHtml(input.forDate)} · written ~09:00 Amsterdam</p>
      <p class="body">
        News, links, a paper, a memo from the day &mdash; anything you'd like
        the morning's article to take seriously. Click <strong>Yes</strong>
        and you'll get a small form. Click <strong>No</strong> and the
        rotation runs untouched.
      </p>
      <div class="cta-row">
        <a class="cta cta-yes" href="${escapeHtml(input.yesUrl)}">Yes &middot; add a brief</a>
        <a class="cta cta-no" href="${escapeHtml(input.noUrl)}">No &middot; use the default</a>
      </div>
      <p class="footer">
        Link valid for 30 hours. If you do nothing, the morning job
        runs as if you said no.
      </p>
    </div>
  </body>
</html>`
}

function renderBriefPromptText(input: SendBriefPromptInput): string {
  return [
    "Studio · Tomorrow's Dispatch",
    "—",
    "",
    `Anything to fold into the morning piece for ${input.forDate}?`,
    "",
    "Yes — add a brief:",
    input.yesUrl,
    "",
    "No — use the default rotation:",
    input.noUrl,
    "",
    "Link valid for 30 hours. Silence = no.",
  ].join("\n")
}

/** Sends the evening brief-prompt email. Same fail-closed contract as
 *  sendApprovalEmail — 503-shape when Resend is not configured. */
export async function sendBriefPromptEmail(
  input: SendBriefPromptInput,
): Promise<SendApprovalEmailResult> {
  const client = getClient()
  if (!client) {
    return {
      ok: false,
      error: "email_unconfigured",
      debug: "RESEND_API_KEY not set on the Vercel project.",
    }
  }
  const to = input.to || process.env.STUDIO_APPROVAL_EMAIL || DEFAULT_TO
  const from = process.env.STUDIO_APPROVAL_FROM || DEFAULT_FROM
  const subject = `Tomorrow's Dispatch · anything to fold in? (${input.forDate})`
  try {
    const res = await client.emails.send({
      from,
      to: [to],
      subject,
      html: renderBriefPromptHtml(input),
      text: renderBriefPromptText(input),
      headers: {
        "X-Entity-Ref-ID": `studio-brief-${input.forDate}-${Date.now()}`,
      },
    })
    if (res.error || !res.data?.id) {
      console.error(
        JSON.stringify({
          tag: "studio.brief_email.send_error",
          forDate: input.forDate,
          error: res.error,
        }),
      )
      return { ok: false, error: "email_send_failed" }
    }
    return { ok: true, emailId: res.data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({
        tag: "studio.brief_email.send_exception",
        forDate: input.forDate,
        error: message,
      }),
    )
    return { ok: false, error: "email_send_failed" }
  }
}

/**
 * Send the approval email. Fail-closed when RESEND_API_KEY is unset
 * (returns 503-shape; route handler propagates as 503 + a note about
 * unconfigured email — the draft itself is already in Supabase, so
 * Tarry can still publish manually via /studio/editor).
 */
export async function sendApprovalEmail(
  input: SendApprovalEmailInput,
): Promise<SendApprovalEmailResult> {
  const client = getClient()
  if (!client) {
    return {
      ok: false,
      error: "email_unconfigured",
      debug: "RESEND_API_KEY not set on the Vercel project.",
    }
  }

  const to = input.to || process.env.STUDIO_APPROVAL_EMAIL || DEFAULT_TO
  const from = process.env.STUDIO_APPROVAL_FROM || DEFAULT_FROM
  const subject = `Preview ready · ${input.title}`

  try {
    const res = await client.emails.send({
      from,
      to: [to],
      subject,
      html: renderHtml(input),
      text: renderText(input),
      headers: {
        "X-Entity-Ref-ID": `studio-approval-${input.slug}-${Date.now()}`,
      },
    })
    if (res.error || !res.data?.id) {
      console.error(
        JSON.stringify({
          tag: "studio.email.send_error",
          slug: input.slug,
          error: res.error,
        }),
      )
      return {
        ok: false,
        error: "email_send_failed",
        debug:
          process.env.STUDIO_AI_DEBUG === "1"
            ? JSON.stringify(res.error)
            : undefined,
      }
    }
    return { ok: true, emailId: res.data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({
        tag: "studio.email.send_exception",
        slug: input.slug,
        error: message,
      }),
    )
    return {
      ok: false,
      error: "email_send_failed",
      debug: process.env.STUDIO_AI_DEBUG === "1" ? message : undefined,
    }
  }
}
