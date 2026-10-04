import { NextRequest, NextResponse } from "next/server"
import { sessionCookieBase, sessionCookieName } from "@/lib/cv/access/env"
import { isFormRequest, json, seeOther } from "@/lib/cv/access/http"
import { isSameOrigin } from "@/lib/cv/access/request-meta"

/**
 * POST or GET /api/cv/signout: clears the session cookie.
 * form or navigation: 303 to /curriculumvitae. JSON: 200 { ok: true }.
 * Cross-site requests are refused so a third party cannot sign a reader out.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function handle(request: NextRequest): NextResponse {
  if (!isSameOrigin(request.headers)) return json({ ok: false }, 403)

  const wantsJson = (request.headers.get("content-type") ?? "").includes("application/json")
  const res =
    request.method === "POST" && wantsJson && !isFormRequest(request)
      ? json({ ok: true })
      : seeOther(request, "/curriculumvitae")
  res.cookies.set(sessionCookieName(process.env), "", {
    ...sessionCookieBase(process.env),
    maxAge: 0,
  })
  return res
}

export const POST = handle
export const GET = handle
