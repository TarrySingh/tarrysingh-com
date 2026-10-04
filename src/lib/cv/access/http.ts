import { NextResponse, type NextRequest } from "next/server"

/** Headers for every response in the gated layer and the access endpoints. */
export const GATED_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
}

/** 303 redirect to a site path with optional query parameters. */
export function seeOther(
  request: NextRequest,
  path: string,
  params: Record<string, string> = {},
): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = path
  url.search = ""
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = NextResponse.redirect(url, 303)
  for (const [k, v] of Object.entries(GATED_HEADERS)) res.headers.set(k, v)
  return res
}

export function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: GATED_HEADERS })
}

/** True when the body should be read as an HTML form (and answered with a redirect). */
export function isFormRequest(request: NextRequest): boolean {
  const ct = request.headers.get("content-type") ?? ""
  return (
    ct.includes("application/x-www-form-urlencoded") ||
    ct.includes("multipart/form-data")
  )
}

/** Reads a small form or JSON body into a flat record of values. Null when unreadable. */
export async function readBody(
  request: NextRequest,
  maxBytes = 20_000,
): Promise<Record<string, unknown> | null> {
  const declared = Number(request.headers.get("content-length") ?? "0")
  if (declared > maxBytes) return null
  try {
    if (isFormRequest(request)) {
      const form = await request.formData()
      const out: Record<string, unknown> = {}
      for (const [k, v] of form.entries()) if (typeof v === "string") out[k] = v
      return out
    }
    const text = await request.text()
    if (text.length > maxBytes) return null
    const parsed: unknown = JSON.parse(text)
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}
