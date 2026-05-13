import { NextRequest, NextResponse } from "next/server"
import { aiRewrite } from "@/lib/studio/ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

interface RewriteBody {
  selection?: unknown
  instruction?: unknown
  surroundingContext?: unknown
}

/**
 * POST /api/studio/ai/rewrite
 *
 * Rewrites a selected passage in the studio voice. Optional
 * instruction tweaks the rewrite (e.g. "tighter, ditch the second
 * clause", "make the opening sharper"). Surrounding context is
 * passed for tone reference; the model is instructed not to
 * rewrite it.
 *
 * Body: { selection, instruction?, surroundingContext }
 *
 * Returns: { ok, output, thinking, inputTokens, outputTokens }
 */
export async function POST(req: NextRequest) {
  let body: RewriteBody
  try {
    body = (await req.json()) as RewriteBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const selection = typeof body.selection === "string" ? body.selection : ""
  const instruction = typeof body.instruction === "string" ? body.instruction : ""
  const surroundingContext =
    typeof body.surroundingContext === "string" ? body.surroundingContext : ""

  if (!selection.trim()) {
    return NextResponse.json(
      { ok: false, error: "empty_selection", hint: "Select at least one sentence before asking AI to rewrite." },
      { status: 422 },
    )
  }

  const result = await aiRewrite({ selection, instruction, surroundingContext })
  if (!result.ok) {
    const status = result.error === "ai_unconfigured" ? 503 : 502
    return NextResponse.json(result, { status })
  }
  return NextResponse.json(result)
}
