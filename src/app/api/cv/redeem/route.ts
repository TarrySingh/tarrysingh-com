import { NextRequest, NextResponse } from "next/server"
import { hashIp } from "@/lib/cv/access/codes"
import {
  ACCESS_PATH,
  DOSSIER_PATH,
  readAccessConfig,
  sessionCookieBase,
  sessionCookieName,
} from "@/lib/cv/access/env"
import { isFormRequest, json, readBody, seeOther } from "@/lib/cv/access/http"
import { notifyInBackground } from "@/lib/cv/access/notify"
import {
  GLOBAL_FAIL_LIMIT,
  GLOBAL_WINDOW_MS,
  REDEEM_FAIL_LIMIT,
  REDEEM_WINDOW_MS,
  countEvents,
  overLimit,
} from "@/lib/cv/access/rate-limit"
import { attemptRedeem, supabaseGrantStore } from "@/lib/cv/access/redeem"
import { clientIp, isSameOrigin } from "@/lib/cv/access/request-meta"
import { logEvent } from "@/lib/cv/access/server"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * POST /api/cv/redeem
 *
 * Accepts an HTML form post (field "code") or JSON ({ "code": "..." }).
 *   form: 303 to /curriculumvitae/dossier, or back to
 *         /curriculumvitae/access?e=invalid | locked | closed
 *   JSON: 200 { ok: true, redirect } or { ok: false, error } with
 *         401 invalid, 429 locked, 503 closed, 403 cross-origin.
 *
 * Every failure looks the same to the caller; the reason goes to the log.
 * Fails closed when the kill switch is off or any secret is missing.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const STATUS = { invalid: 401, locked: 429, closed: 503 } as const
type Failure = keyof typeof STATUS

export async function POST(request: NextRequest) {
  const form = isFormRequest(request)
  const fail = (error: Failure, status: number = STATUS[error]) =>
    form ? seeOther(request, ACCESS_PATH, { e: error }) : json({ ok: false, error }, status)

  if (!isSameOrigin(request.headers)) return fail("invalid", 403)

  const cfg = readAccessConfig(process.env)
  if (!cfg) return fail("closed")

  try {
    const body = await readBody(request, 2_000)
    const db = createServiceClient()
    const ipHash = await hashIp(clientIp(request.headers), cfg.ipSalt)

    const ipFails = await countEvents(db, {
      kind: "redeem_fail",
      ipHash,
      windowMs: REDEEM_WINDOW_MS,
    })
    if (overLimit(ipFails, REDEEM_FAIL_LIMIT)) return fail("locked")

    const globalFails = await countEvents(db, {
      kind: "redeem_fail",
      windowMs: GLOBAL_WINDOW_MS,
    })
    if (overLimit(globalFails, GLOBAL_FAIL_LIMIT)) return fail("closed")

    const result = await attemptRedeem(supabaseGrantStore(db), cfg, body?.code)

    if (!result.ok) {
      await logEvent("redeem_fail", {
        grantId: result.grantId,
        path: `reason:${result.reason}`,
      })
      if (overLimit(ipFails + 1, REDEEM_FAIL_LIMIT)) {
        await logEvent("lockout", { path: "redeem" })
        return fail("locked")
      }
      if (globalFails + 1 === GLOBAL_FAIL_LIMIT) {
        notifyInBackground({
          subject: "Redemption suspended",
          lines: [
            `${GLOBAL_FAIL_LIMIT} failed access-code attempts in the last hour. ` +
              "Redemption is suspended until the window clears. " +
              "Existing sessions are not affected.",
          ],
        })
      }
      return fail("invalid")
    }

    await logEvent("redeem_ok", { grantId: result.grant.id })
    if (result.firstRedemption) {
      const who = [result.grant.recruiter_name, result.grant.firm].filter(Boolean).join(", ")
      notifyInBackground({
        subject: `${who || "A grant holder"} opened the profile`,
        lines: [
          `${who || result.grant.label || "A grant holder"} redeemed an access code for the first time.`,
        ],
      })
    }

    const res = form
      ? seeOther(request, DOSSIER_PATH)
      : json({ ok: true, redirect: DOSSIER_PATH })
    res.cookies.set(sessionCookieName(process.env), result.token, {
      ...sessionCookieBase(process.env),
      maxAge: result.maxAgeSeconds,
    })
    return res
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "cv.redeem_error",
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      }),
    )
    return fail("closed")
  }
}

export function GET(): NextResponse {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } })
}
