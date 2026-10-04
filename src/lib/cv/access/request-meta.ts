/**
 * Executive profile · request metadata helpers (pure, no framework imports).
 *
 * Raw IP addresses are never stored: callers hash them with hashIp() and
 * CV_IP_SALT. Country comes from the platform header only.
 */

/** Best available client address, or "unknown". */
export function clientIp(h: Headers): string {
  const candidates = [
    h.get("x-real-ip"),
    h.get("x-vercel-forwarded-for")?.split(",")[0],
    h.get("x-forwarded-for")?.split(",")[0],
  ]
  for (const c of candidates) {
    const v = c?.trim()
    if (v && v.length <= 64 && /^[0-9A-Fa-f:.]+$/.test(v)) return v
  }
  return "unknown"
}

/** ISO 3166 alpha-2 country from Vercel's edge header, or null. */
export function countryOf(h: Headers): string | null {
  const c = h.get("x-vercel-ip-country")?.trim().toUpperCase()
  return c && /^[A-Z]{2}$/.test(c) ? c : null
}

/** Truncated user agent (no personal detail beyond the browser family). */
export function uaShort(h: Headers): string | null {
  const ua = h.get("user-agent")
  if (!ua) return null
  const cleaned = ua.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 120)
  return cleaned || null
}

/**
 * CSRF guard for state-changing endpoints. Browsers always send Origin on
 * a cross-site POST; Sec-Fetch-Site covers GET. Requests carrying neither
 * (curl, scripts) are allowed: they carry no ambient cookie to abuse.
 */
export function isSameOrigin(h: Headers): boolean {
  const origin = h.get("origin")
  if (origin !== null) {
    if (origin === "null") return false
    const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim()
    try {
      return host !== "" && new URL(origin).host === host
    } catch {
      return false
    }
  }
  const site = h.get("sec-fetch-site")
  if (site) return site === "same-origin" || site === "none"
  return true
}
