import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * One-click unsubscribe tokens carried in the `?t=` query of
 * /blog/unsubscribe. The token is HMAC-SHA256 of `<email>:<ts>`
 * truncated to a URL-safe slug, scoped by CRM_UNSUBSCRIBE_TOKEN_SECRET.
 *
 * The token itself doesn't carry the email — the URL also has
 * `?e=<email>`. The token only proves the URL was issued by us
 * (so a stranger can't unsubscribe an address they don't own by
 * guessing the email + ts).
 *
 * We deliberately don't add a TTL: List-Unsubscribe URLs from old
 * emails should still work. The window is bounded by the lifetime
 * of the secret — if the secret is rotated, every old token
 * becomes invalid at once, which is the right behaviour.
 */

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4))
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64")
}

export function makeUnsubscribeToken(email: string, secret: string): string {
  const normalized = email.trim().toLowerCase()
  const digest = createHmac("sha256", secret)
    .update(normalized, "utf8")
    .digest()
  // First 16 bytes is plenty (128-bit) and keeps URLs short.
  return b64url(digest.subarray(0, 16))
}

export function verifyUnsubscribeToken(
  email: string,
  token: string,
  secret: string,
): boolean {
  const expected = makeUnsubscribeToken(email, secret)
  if (expected.length !== token.length) return false
  try {
    return timingSafeEqual(
      b64urlDecode(expected),
      b64urlDecode(token),
    )
  } catch {
    return false
  }
}
