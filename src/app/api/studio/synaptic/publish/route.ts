import { NextRequest, NextResponse } from "next/server"
import { publishPlate } from "@/lib/synaptic/editor/publish"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30 // GitHub Contents API can take a few seconds

const PLATE_ID_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

interface PublishBody {
  plateId?: unknown
}

/**
 * POST /api/studio/synaptic/publish  { plateId }
 *
 * Serializes the plate's draft back into its committed content module and
 * commits to main via Octokit (authored as Tarry Singh), then clears the
 * draft. Vercel redeploys; the live plate updates in ~90 s.
 *
 * Failure modes (fail-closed):
 *   422 invalid_plate / not_editor_ready / unknown_plate
 *   404 draft_not_found / content_missing
 *   503 github_unconfigured
 *   500 serialize_failed
 *   502 github_api_error
 */
export async function POST(req: NextRequest) {
  let body: PublishBody
  try {
    body = (await req.json()) as PublishBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const plateId = typeof body.plateId === "string" ? body.plateId.trim() : ""
  if (!plateId || !PLATE_ID_RE.test(plateId)) {
    return NextResponse.json({ ok: false, error: "invalid_plate" }, { status: 422 })
  }

  const result = await publishPlate(plateId)

  if (!result.ok) {
    const status =
      result.error === "github_unconfigured"
        ? 503
        : result.error === "draft_not_found" || result.error === "content_missing"
          ? 404
          : result.error === "serialize_failed"
            ? 500
            : result.error === "github_api_error"
              ? 502
              : 422
    return NextResponse.json(result, { status })
  }

  return NextResponse.json(result)
}
