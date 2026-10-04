import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { hashIp } from "@/lib/cv/access/codes"
import { ACCESS_PATH, PRIVACY_NOTICE_VERSION, readAccessConfig } from "@/lib/cv/access/env"
import { isFormRequest, json, readBody, seeOther } from "@/lib/cv/access/http"
import { notifyInBackground } from "@/lib/cv/access/notify"
import { REQUEST_LIMIT, REQUEST_WINDOW_MS, countRequests, overLimit } from "@/lib/cv/access/rate-limit"
import { clientIp, isSameOrigin } from "@/lib/cv/access/request-meta"
import { logEvent } from "@/lib/cv/access/server"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * POST /api/cv/request-access
 *
 * Fields (form or JSON): name, email, firm, role (or roleTitle), mandate
 * (or mandateSummary), message, consent (the privacy-notice acknowledgement),
 * website (HONEYPOT: must stay empty) and t.
 *
 * t is when the form was rendered, as epoch milliseconds set by the client
 * (Date.now() on mount), or the elapsed milliseconds; both are understood.
 * Anything under 3 seconds is refused.
 *
 *   form: 303 to /curriculumvitae/access?requested=1 on success, else
 *         /curriculumvitae/access?e=request_invalid | request_fast |
 *         request_rate | request_closed
 *   JSON: 200 { ok: true } or { ok: false, error } with 400 invalid/fast,
 *         429 rate, 503 closed, 403 cross-origin.
 *
 * A filled honeypot gets the success response and stores nothing.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MIN_FILL_MS = 3_000
const EPOCH_MS_FLOOR = 1e11

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g

const line = (max: number) =>
  z.string().transform((s) => s.replace(CONTROL, "").replace(/\s+/g, " ").trim()).pipe(z.string().max(max))
const para = (max: number) =>
  z.string().transform((s) => s.replace(CONTROL, "").trim()).pipe(z.string().max(max))
const optional = <T extends z.ZodTypeAny>(s: T) =>
  z.union([s, z.undefined(), z.null()]).transform((v) => (v ? v : null))

const RequestSchema = z.object({
  name: line(120).pipe(z.string().min(2)),
  email: z.string().trim().toLowerCase().max(200).email(),
  firm: line(160).pipe(z.string().min(2)),
  role: optional(line(160)),
  mandate: optional(para(1000)),
  message: optional(para(2000)),
  consent: z.literal(true),
})

const truthy = (v: unknown) =>
  v === true || (typeof v === "string" && ["on", "true", "1", "yes"].includes(v.toLowerCase()))

type Failure = "request_invalid" | "request_fast" | "request_rate" | "request_closed"
const STATUS: Record<Failure, number> = {
  request_invalid: 400,
  request_fast: 400,
  request_rate: 429,
  request_closed: 503,
}

export async function POST(request: NextRequest) {
  const form = isFormRequest(request)
  const ok = () =>
    form ? seeOther(request, ACCESS_PATH, { requested: "1" }) : json({ ok: true })
  const fail = (error: Failure, status: number = STATUS[error]) =>
    form
      ? seeOther(request, ACCESS_PATH, { e: error })
      : json({ ok: false, error: error.replace("request_", "") }, status)

  if (!isSameOrigin(request.headers)) return fail("request_invalid", 403)

  const cfg = readAccessConfig(process.env)
  if (!cfg) return fail("request_closed")

  const raw = await readBody(request)
  if (!raw) return fail("request_invalid")

  // Honeypot: a person never sees this field.
  if (typeof raw.website === "string" && raw.website.trim() !== "") return ok()

  const t = Number(raw.t)
  const elapsed = t > EPOCH_MS_FLOOR ? Date.now() - t : t
  if (!Number.isFinite(t) || !(elapsed >= MIN_FILL_MS)) return fail("request_fast")

  const parsed = RequestSchema.safeParse({
    name: raw.name,
    email: raw.email,
    firm: raw.firm,
    role: raw.role ?? raw.roleTitle,
    mandate: raw.mandate ?? raw.mandateSummary,
    message: raw.message,
    consent: truthy(raw.consent),
  })
  if (!parsed.success) return fail("request_invalid")
  const input = parsed.data

  try {
    const db = createServiceClient()
    const ipHash = await hashIp(clientIp(request.headers), cfg.ipSalt)

    const recent = await countRequests(db, { ipHash, windowMs: REQUEST_WINDOW_MS })
    if (overLimit(recent, REQUEST_LIMIT)) return fail("request_rate")

    const { data, error } = await db
      .from("profile_access_requests")
      .insert({
        name: input.name,
        email: input.email,
        firm: input.firm,
        role_title: input.role,
        mandate_summary: input.mandate,
        message: input.message,
        consent_at: new Date().toISOString(),
        privacy_notice_version: PRIVACY_NOTICE_VERSION,
        status: "new",
        ip_hash: ipHash,
      })
      .select("id")
      .single()
    if (error || !data) throw new Error(error?.message ?? "insert returned no row")

    await logEvent("request", { path: "request-access" })
    notifyInBackground({
      subject: `Access request from ${input.name}, ${input.firm}`,
      lines: [
        `${input.name} (${input.firm}) asked for access to the profile.`,
        [
          `Email: ${input.email}`,
          input.role ? `Role: ${input.role}` : null,
          input.mandate ? `Mandate: ${input.mandate}` : null,
          input.message ? `Message: ${input.message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        `To issue a code: npm run cv:grant -- issue --request ${data.id} --days 30`,
      ],
    })
    return ok()
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "cv.request_access_error",
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      }),
    )
    return fail("request_closed")
  }
}

export function GET(): NextResponse {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } })
}
