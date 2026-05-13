import { NextRequest, NextResponse } from "next/server"
import { aiContinue } from "@/lib/studio/ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60 // extended thinking can take 30–45 s

interface ContinueBody {
  fullDocument?: unknown
  beforeCursor?: unknown
  afterCursor?: unknown
}

/**
 * POST /api/studio/ai/continue
 *
 * Calls Claude Opus 4.7-extended with 4K thinking tokens to continue
 * the Dispatch from the cursor. Returns the generated Markdown plus
 * the thinking trace (for the AI panel's collapsed "thinking" reveal).
 *
 * Body: { fullDocument, beforeCursor, afterCursor }
 *
 * Returns: { ok, output, thinking, inputTokens, outputTokens }
 */
export async function POST(req: NextRequest) {
  let body: ContinueBody
  try {
    body = (await req.json()) as ContinueBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const fullDocument = typeof body.fullDocument === "string" ? body.fullDocument : ""
  const beforeCursor = typeof body.beforeCursor === "string" ? body.beforeCursor : ""
  const afterCursor = typeof body.afterCursor === "string" ? body.afterCursor : ""

  if (!beforeCursor.trim()) {
    return NextResponse.json(
      { ok: false, error: "empty_context", hint: "Write at least one sentence before the cursor before asking AI to continue." },
      { status: 422 },
    )
  }

  const result = await aiContinue({ fullDocument, beforeCursor, afterCursor })
  if (!result.ok) {
    const status = result.error === "ai_unconfigured" ? 503 : 502
    return NextResponse.json(result, { status })
  }
  return NextResponse.json(result)
}
