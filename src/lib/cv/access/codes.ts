/**
 * Executive profile · access codes (Web Crypto only; runs in Node and Edge).
 *
 * Format: TS-XXXX-XXXX-XXXX, Crockford base32 (no I, L, O, U), 12 symbols,
 * 60 bits of entropy. Shown once at issuance. Only
 * HMAC-SHA256("cv-code-v1:" + normalised, CV_CODE_PEPPER) is stored.
 * A fast keyed hash is adequate at this entropy and allows an indexed lookup.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const BODY_LENGTH = 12
const encoder = new TextEncoder()

/** Generates a fresh code, e.g. "TS-7Q4M-9XR2-KD3F". */
export function generateCode(): string {
  const bytes = new Uint8Array(BODY_LENGTH)
  crypto.getRandomValues(bytes)
  let body = ""
  // 256 is a multiple of 32, so masking five bits is unbiased.
  for (let i = 0; i < BODY_LENGTH; i++) body += ALPHABET[bytes[i] & 31]
  return `TS-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`
}

/**
 * Canonical form of what a person typed: 12 upper-case Crockford symbols,
 * or null when it cannot be a code. Tolerates case, spaces, hyphens,
 * underscores, the optional "TS" prefix and the Crockford look-alikes
 * (O to 0, I and L to 1).
 */
export function normaliseCode(input: unknown): string | null {
  if (typeof input !== "string" || input.length > 64) return null
  let s = input.toUpperCase().replace(/[\s\-_.]/g, "")
  if (s.length === BODY_LENGTH + 2 && s.startsWith("TS")) s = s.slice(2)
  if (s.length !== BODY_LENGTH) return null
  s = s.replace(/O/g, "0").replace(/[IL]/g, "1")
  for (let i = 0; i < s.length; i++) if (!ALPHABET.includes(s[i])) return null
  return s
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("")
}

async function hmacHex(key: string, message: string): Promise<string> {
  if (!key) throw new Error("hmac key missing")
  const k = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  return toHex(await crypto.subtle.sign("HMAC", k, encoder.encode(message)))
}

/** Hash stored in profile_grants.code_hash. Input must be normalised. */
export function hashCode(normalised: string, pepper: string): Promise<string> {
  return hmacHex(pepper, `cv-code-v1:${normalised}`)
}

/** Hash stored in ip_hash columns. The raw address is never stored. */
export function hashIp(ip: string, salt: string): Promise<string> {
  return hmacHex(salt, `cv-ip-v1:${ip}`)
}

/** Constant-time string comparison (length is not secret here: hex digests). */
export function timingSafeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a)
  const y = encoder.encode(b)
  let diff = x.length ^ y.length
  const n = Math.max(x.length, y.length)
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}

/** Short public reference printed on watermarks, e.g. "G-3F9A1C". */
export function grantRef(grantId: string): string {
  return `G-${grantId.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
