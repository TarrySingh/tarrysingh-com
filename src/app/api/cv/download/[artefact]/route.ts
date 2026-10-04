import { NextRequest, NextResponse } from "next/server"
import { ACCESS_PATH } from "@/lib/cv/access/env"
import { GATED_HEADERS, json, seeOther } from "@/lib/cv/access/http"
import { notifyInBackground } from "@/lib/cv/access/notify"
import { getDossierAccess, hasScope, logEvent } from "@/lib/cv/access/server"
import { stampPdf } from "@/lib/cv/access/watermark"
import { loadGatedProfile, loadMasterPdf } from "@/lib/cv/gated-store"
import { isPlaceholder } from "@/lib/cv/schema"

/**
 * GET /api/cv/download/<artefact id or kind>
 *
 * Authoritative checks, in order: a valid grant (re-read from the database),
 * the artefact exists in the gated profile, the grant carries the artefact's
 * requiredScope, the artefact has a real filename and a master PDF. The
 * master is stamped for this reader on every page, then streamed as an
 * attachment with no-store headers. Each download is logged and the owner
 * is told (best effort).
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ artefact: string }> },
) {
  const access = await getDossierAccess()
  if (!access) return seeOther(request, ACCESS_PATH)

  const { artefact: key } = await context.params
  if (!ID_RE.test(key)) return json({ ok: false, error: "not_found" }, 404)

  let profile
  try {
    profile = await loadGatedProfile()
  } catch {
    return json({ ok: false, error: "unavailable" }, 503)
  }

  const artefact = profile.artefacts.find((a) => a.id === key || a.kind === key)
  if (!artefact || artefact.visibility === "private") {
    return json({ ok: false, error: "not_found" }, 404)
  }
  if (!hasScope(access, artefact.requiredScope)) {
    return json({ ok: false, error: "forbidden" }, 403)
  }
  if (!artefact.storageKey || isPlaceholder(artefact.filename) || isPlaceholder(artefact.storageKey)) {
    return json({ ok: false, error: "unavailable" }, 503)
  }

  let stamped: Uint8Array
  try {
    const master = await loadMasterPdf(artefact.storageKey)
    stamped = await stampPdf(master, {
      recruiterName: access.recruiterName,
      firm: access.firm,
      ref: access.ref,
    })
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "cv.download_failed",
        artefact: artefact.id,
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      }),
    )
    return json({ ok: false, error: "unavailable" }, 503)
  }

  await logEvent("download", {
    grantId: access.grantId,
    artefact: artefact.id,
    path: `/api/cv/download/${artefact.id}`,
  })
  const who = [access.recruiterName, access.firm].filter(Boolean).join(", ")
  notifyInBackground({
    subject: `${who || access.ref} downloaded ${artefact.title}`,
    lines: [`${who || access.ref} (${access.ref}) downloaded: ${artefact.title}.`],
  })

  return new NextResponse(stamped as BodyInit, {
    status: 200,
    headers: {
      ...GATED_HEADERS,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${artefact.filename.replace(/[^A-Za-z0-9._ -]/g, "_")}"`,
      "Content-Length": String(stamped.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  })
}
