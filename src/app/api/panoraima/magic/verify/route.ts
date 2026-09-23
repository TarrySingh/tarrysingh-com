import { NextRequest, NextResponse } from "next/server"
import {
  PANORAIMA_COOKIE,
  PANORAIMA_LOGIN_PATH,
  SESSION_COOKIE_OPTIONS,
  createSessionToken,
} from "@/lib/panoraima/auth"
import {
  consumeLoginToken,
  findMemberByEmail,
  logAccess,
  peekLoginToken,
  resolveRole,
  touchLastLogin,
} from "@/lib/panoraima/members"

/**
 * /api/panoraima/magic/verify?token=...
 *
 * GET shows a confirm page; POST burns the token and starts the session.
 *
 * The split exists because mail security scanners fetch every link in an
 * email before the recipient sees it. Microsoft Defender Safe Links was
 * fetching this URL about 15 seconds after each send (from 104.47.x.x),
 * consuming the single-use token, so the member's own click always landed on
 * "that sign-in link has expired or was already used". Scanners issue GETs,
 * not form POSTs, so only a real click can spend the token now.
 */

export const runtime = "nodejs"

const DASHBOARD = "/experiments/panoraima"

function backToLogin(request: NextRequest, reason: string) {
  const url = new URL(PANORAIMA_LOGIN_PATH, request.nextUrl.origin)
  url.searchParams.set("error", reason)
  const res = NextResponse.redirect(url)
  res.headers.set("Cache-Control", "no-store")
  return res
}

function confirmPage(token: string): NextResponse {
  const safe = token.replace(/[^A-Za-z0-9_-]/g, "")
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Sign in to PANORAIMA</title>
<style>
  :root { color-scheme: light }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#F7F8FA; font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:#14161B }
  .card { background:#fff; border:1px solid #DCDDE1; border-radius:14px; padding:32px; max-width:420px; width:calc(100% - 32px) }
  h1 { font-size:19px; margin:0 0 6px }
  .eyebrow { font:600 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.14em;
             text-transform:uppercase; color:#B23E22; margin:0 0 14px }
  p { color:#444A55; margin:0 0 20px }
  button { background:#B23E22; color:#fff; border:0; border-radius:8px; padding:12px 18px;
           font-size:15px; font-weight:700; cursor:pointer; width:100% }
  button:hover { background:#93331c }
  .note { font-size:12.5px; color:#646B78; margin:18px 0 0 }
</style></head>
<body>
  <main class="card">
    <p class="eyebrow">PANORAIMA Consortium Dashboard</p>
    <h1>Confirm your sign-in</h1>
    <p>Click the button to finish signing in. This step keeps automatic email
       scanners from using your link before you do.</p>
    <form method="POST" action="/api/panoraima/magic/verify">
      <input type="hidden" name="token" value="${safe}" />
      <button type="submit">Sign in to the dashboard</button>
    </form>
    <p class="note">The link works once and expires 30 minutes after it was sent.</p>
  </main>
</body></html>`
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  })
}

/** GET never consumes the token: it only checks it and renders the confirm page. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  if (!token) return backToLogin(request, "missing")

  const peek = await peekLoginToken(token)
  if (!peek.ok) return backToLogin(request, peek.reason === "used" ? "used" : "expired")

  return confirmPage(token)
}

/** POST is the member's actual click: burn the token and start the session. */
export async function POST(request: NextRequest) {
  let token = ""
  const type = request.headers.get("content-type") || ""
  if (type.includes("application/json")) {
    const body = await request.json().catch(() => ({}))
    token = typeof body.token === "string" ? body.token : ""
  } else {
    const form = await request.formData().catch(() => null)
    token = form ? String(form.get("token") || "") : ""
  }
  if (!token) return backToLogin(request, "missing")

  const email = await consumeLoginToken(token)
  if (!email) return backToLogin(request, "expired")

  const member = await findMemberByEmail(email)
  if (!member || member.disabled) return backToLogin(request, "revoked")

  const session = await createSessionToken({
    email: member.email,
    role: resolveRole(member.email, member.role),
  })
  if (!session) return backToLogin(request, "failed")

  await touchLastLogin(member.email)
  await logAccess({
    event: "sign_in_link",
    email: member.email,
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip"),
  })

  // 303 so the browser follows with GET after the form POST.
  const res = NextResponse.redirect(new URL(DASHBOARD, request.nextUrl.origin), 303)
  res.cookies.set(PANORAIMA_COOKIE, session, SESSION_COOKIE_OPTIONS)
  res.headers.set("Cache-Control", "no-store")
  return res
}
