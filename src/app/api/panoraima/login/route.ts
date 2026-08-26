import { NextRequest, NextResponse } from "next/server"
import {
  PANORAIMA_COOKIE,
  SESSION_COOKIE_OPTIONS,
  createSessionToken,
} from "@/lib/panoraima/auth"

/**
 * POST /api/panoraima/login
 *
 * Validates the shared consortium credentials and, on success, sets the
 * signed session cookie that middleware checks. Deliberately outside the
 * middleware matcher so it stays reachable while logged out.
 */

export const runtime = "nodejs"

// Small fixed delay on failure so the endpoint is not a fast credential oracle.
function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  let username = ""
  let password = ""

  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}))
    username = typeof body.username === "string" ? body.username : ""
    password = typeof body.password === "string" ? body.password : ""
  } else {
    const form = await request.formData().catch(() => null)
    username = String(form?.get("username") ?? "")
    password = String(form?.get("password") ?? "")
  }

  const expectedUser = process.env.PANORAIMA_USER || ""
  const expectedPass = process.env.PANORAIMA_PASS || ""

  if (!expectedUser || !expectedPass) {
    console.error("[panoraima/login] PANORAIMA_USER or PANORAIMA_PASS is not set")
    return NextResponse.json(
      { ok: false, error: "Login is not configured. Contact the site owner." },
      { status: 500 },
    )
  }

  if (username !== expectedUser || password !== expectedPass) {
    await pause(600)
    return NextResponse.json(
      { ok: false, error: "That username and password did not match." },
      { status: 401 },
    )
  }

  const token = await createSessionToken()
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Could not start a session." },
      { status: 500 },
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(PANORAIMA_COOKIE, token, SESSION_COOKIE_OPTIONS)
  response.headers.set("Cache-Control", "no-store")
  return response
}
