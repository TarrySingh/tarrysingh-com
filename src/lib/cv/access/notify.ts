import "server-only"

import { after } from "next/server"
import { Resend } from "resend"

/**
 * Executive profile · owner notifications (best effort, never throws).
 *
 * Goes to a private inbox (CV_NOTIFY_EMAIL, else STUDIO_APPROVAL_EMAIL),
 * deliberately not to the CRM: colleagues must not see that the CEO is
 * talking to search firms. Nothing here may block or fail a request.
 */

export type OwnerNotice = {
  subject: string
  /** Plain-text paragraphs. Treated as untrusted and escaped for HTML. */
  lines: string[]
}

const DEFAULT_FROM = "Studio · Executive profile <studio@tarrysingh.com>"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function oneLine(s: string, max: number): string {
  return s.replace(/[\r\n\t]+/g, " ").trim().slice(0, max)
}

export async function notifyOwner(notice: OwnerNotice): Promise<void> {
  try {
    const key = process.env.RESEND_API_KEY
    const to = process.env.CV_NOTIFY_EMAIL?.trim() || process.env.STUDIO_APPROVAL_EMAIL?.trim()
    if (!key || !to) return
    const from = process.env.STUDIO_APPROVAL_FROM?.trim() || DEFAULT_FROM
    const subject = `Executive profile · ${oneLine(notice.subject, 140)}`
    const paragraphs = notice.lines.map((l) => l.slice(0, 2000))
    const res = await new Resend(key).emails.send({
      from,
      to: [to],
      subject,
      text: paragraphs.join("\n\n"),
      html:
        `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#1a1d24">` +
        paragraphs
          .map((l) => `<p style="margin:0 0 12px">${escapeHtml(l).replace(/\n/g, "<br>")}</p>`)
          .join("") +
        `</div>`,
    })
    if (res.error) {
      console.error(JSON.stringify({ tag: "cv.notify_failed", name: res.error.name }))
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "cv.notify_failed",
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      }),
    )
  }
}

/**
 * Sends after the response where the platform allows (next/server after()),
 * otherwise fire-and-forget. Never throws and never delays the response.
 */
export function notifyInBackground(notice: OwnerNotice): void {
  const work = notifyOwner(notice)
  try {
    after(work)
  } catch {
    void work
  }
}
