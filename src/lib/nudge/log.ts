/**
 * Sprint 5.5 — client-side helper to log a nudge event without
 * blocking on the response. Fire-and-forget; the studio's measurement
 * is surveillance-free aggregate counters only.
 */
export type NudgeType =
  | "passkey"
  | "returning-reader"
  | "reading-milestone"
  | "highlight-share"
  | "exit-intent"
  | "footer-card"

export type NudgeEvent = "view" | "submit" | "dismiss"

export function logNudge(
  nudgeType: NudgeType,
  event: NudgeEvent,
  slug?: string,
): void {
  // Use keepalive so the request survives a navigation (e.g. exit-intent
  // submit that triggers a redirect, or a `view` log just before the
  // user closes the tab).
  try {
    void fetch("/api/nudge/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nudgeType, event, slug }),
      keepalive: true,
    })
  } catch {
    // Fail silently — analytics must never break the reader experience.
  }
}
