import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Sprint — auto-publish pipeline. Signed one-click approval tokens
 * embedded in the "preview is ready" email.
 *
 * Shape: `<base64url(slug)>.<issuedAtMs>.<hexHmac>`
 *
 * The HMAC covers `slug + "." + issuedAtMs` so the slug and timestamp
 * are tamper-evident together. Server verifies the HMAC + checks the
 * issuedAtMs is within `ttlSeconds` of `Date.now()`.
 *
 * Mirrors the `src/lib/crm/sign.ts` HMAC pattern but with TTL baked
 * in (the CRM unsubscribe token has no TTL because unsubscribe is
 * idempotent; a publish is not — it has to expire).
 */

const DEFAULT_TTL_SECONDS = 72 * 60 * 60 // 72 hours

export interface ApprovalTokenInput {
  slug: string
  /** Override `Date.now()` for testing. Optional. */
  issuedAtMs?: number
}

export interface ApprovalTokenPayload {
  slug: string
  issuedAtMs: number
}

function b64urlEncode(s: string): string {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : ""
  const standard = s.replace(/-/g, "+").replace(/_/g, "/") + pad
  return Buffer.from(standard, "base64").toString("utf8")
}

function signRaw(raw: string, secret: string): string {
  return createHmac("sha256", secret).update(raw, "utf8").digest("hex")
}

/**
 * Make a signed approval token for the given slug. URL-safe; embed
 * straight in a `?token=…` query param.
 */
export function makeApprovalToken(
  input: ApprovalTokenInput,
  secret: string,
): string {
  const issuedAtMs = input.issuedAtMs ?? Date.now()
  const slug = input.slug
  const slugB64 = b64urlEncode(slug)
  const raw = `${slug}.${issuedAtMs}`
  const sig = signRaw(raw, secret)
  return `${slugB64}.${issuedAtMs}.${sig}`
}

export type VerifyApprovalTokenResult =
  | { ok: true; payload: ApprovalTokenPayload }
  | { ok: false; error: "malformed" | "bad_signature" | "expired" }

/**
 * Verify an approval token's HMAC + TTL. Returns the decoded payload
 * on success, a stable error code otherwise.
 *
 * @param token — the `<slug>.<ts>.<sig>` string from the email link
 * @param secret — STUDIO_APPROVAL_SECRET
 * @param ttlSeconds — max age; defaults to 72 h
 * @param nowMs — override Date.now() for testing
 */
export function verifyApprovalToken(
  token: string,
  secret: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
  nowMs: number = Date.now(),
): VerifyApprovalTokenResult {
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, error: "malformed" }
  }
  const parts = token.split(".")
  if (parts.length !== 3) {
    return { ok: false, error: "malformed" }
  }
  const [slugB64, issuedAtStr, presentedSig] = parts
  let slug: string
  try {
    slug = b64urlDecode(slugB64)
  } catch {
    return { ok: false, error: "malformed" }
  }
  const issuedAtMs = Number(issuedAtStr)
  if (!Number.isFinite(issuedAtMs) || issuedAtMs <= 0) {
    return { ok: false, error: "malformed" }
  }
  if (!slug || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return { ok: false, error: "malformed" }
  }
  if (!/^[a-f0-9]{64}$/i.test(presentedSig)) {
    return { ok: false, error: "malformed" }
  }
  // Verify HMAC over the canonical raw form.
  const raw = `${slug}.${issuedAtMs}`
  const expectedSig = signRaw(raw, secret)
  try {
    const a = Buffer.from(expectedSig, "hex")
    const b = Buffer.from(presentedSig, "hex")
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: "bad_signature" }
    }
  } catch {
    return { ok: false, error: "bad_signature" }
  }
  // TTL check.
  const ageSeconds = (nowMs - issuedAtMs) / 1000
  if (ageSeconds < 0 || ageSeconds > ttlSeconds) {
    return { ok: false, error: "expired" }
  }
  return { ok: true, payload: { slug, issuedAtMs } }
}
