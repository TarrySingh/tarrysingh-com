import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Signed one-click tokens for the daily-brief prompt email.
 *
 * Shape: `<b64url(forDate)>.<issuedAtMs>.<hexHmac>`
 *
 * HMAC covers `forDate.issuedAtMs` so the date + freshness are
 * tamper-evident together. Reuses STUDIO_APPROVAL_SECRET so we don't
 * mint another env var just for this loop.
 *
 * TTL: 30 hours — covers the evening-prompt-to-morning-Cowork window
 * (23:00 Amsterdam → next morning 09:00 = 10 h, plus margin for late
 * decisions or DST drift).
 */

const DEFAULT_TTL_SECONDS = 30 * 60 * 60

export interface BriefTokenInput {
  /** Amsterdam-local target date, YYYY-MM-DD. */
  forDate: string
  /** Override Date.now() for testing. */
  issuedAtMs?: number
}

export interface BriefTokenPayload {
  forDate: string
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

export function makeBriefToken(
  input: BriefTokenInput,
  secret: string,
): string {
  const issuedAtMs = input.issuedAtMs ?? Date.now()
  const forDate = input.forDate
  const dateB64 = b64urlEncode(forDate)
  const raw = `${forDate}.${issuedAtMs}`
  const sig = signRaw(raw, secret)
  return `${dateB64}.${issuedAtMs}.${sig}`
}

export type VerifyBriefTokenResult =
  | { ok: true; payload: BriefTokenPayload }
  | { ok: false; error: "malformed" | "bad_signature" | "expired" }

export function verifyBriefToken(
  token: string,
  secret: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
  nowMs: number = Date.now(),
): VerifyBriefTokenResult {
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, error: "malformed" }
  }
  const parts = token.split(".")
  if (parts.length !== 3) return { ok: false, error: "malformed" }
  const [dateB64, issuedAtStr, presentedSig] = parts
  let forDate: string
  try {
    forDate = b64urlDecode(dateB64)
  } catch {
    return { ok: false, error: "malformed" }
  }
  const issuedAtMs = Number(issuedAtStr)
  if (!Number.isFinite(issuedAtMs) || issuedAtMs <= 0) {
    return { ok: false, error: "malformed" }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(forDate)) {
    return { ok: false, error: "malformed" }
  }
  if (!/^[a-f0-9]{64}$/i.test(presentedSig)) {
    return { ok: false, error: "malformed" }
  }
  const expectedSig = signRaw(`${forDate}.${issuedAtMs}`, secret)
  try {
    const a = Buffer.from(expectedSig, "hex")
    const b = Buffer.from(presentedSig, "hex")
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: "bad_signature" }
    }
  } catch {
    return { ok: false, error: "bad_signature" }
  }
  const ageSeconds = (nowMs - issuedAtMs) / 1000
  if (ageSeconds < 0 || ageSeconds > ttlSeconds) {
    return { ok: false, error: "expired" }
  }
  return { ok: true, payload: { forDate, issuedAtMs } }
}
