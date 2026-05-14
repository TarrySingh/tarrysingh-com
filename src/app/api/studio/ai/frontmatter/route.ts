import { NextRequest, NextResponse } from "next/server"
import { aiFrontmatter } from "@/lib/studio/ai"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60 // extended thinking can take 30–45 s

interface FrontmatterBody {
  title?: unknown
  body?: unknown
}

/**
 * POST /api/studio/ai/frontmatter
 *
 * Calls Claude Opus extended-thinking to propose `{category, excerpt, tags}`
 * from a Dispatch's `{title, body}`. Tighter token budget than
 * Continue/Rewrite (1500 thinking, 512 output).
 *
 * Used by the Studio Editor's "Suggest" buttons in FrontmatterForm —
 * removes the most-skipped step in publishing (Sprint 4.1 in the
 * roadmap; see `docs/reports/sprint-4-plus-roadmap.md`).
 *
 * Body: { title, body }
 *
 * Returns: { ok, suggestion: { category, excerpt, tags }, thinking, inputTokens, outputTokens }
 */
export async function POST(req: NextRequest) {
  let payload: FrontmatterBody
  try {
    payload = (await req.json()) as FrontmatterBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const title = typeof payload.title === "string" ? payload.title : ""
  const body = typeof payload.body === "string" ? payload.body : ""

  // Require at least 200 words of body so the suggestion has something
  // to read. Below that, the model would have to guess and that defeats
  // the point of grounding suggestions in the prose.
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  if (wordCount < 200) {
    return NextResponse.json(
      {
        ok: false,
        error: "body_too_short",
        hint: `Write at least 200 words before asking AI to suggest frontmatter (currently ${wordCount}).`,
        wordCount,
      },
      { status: 422 },
    )
  }

  const result = await aiFrontmatter({ title, body })
  if (!result.ok) {
    const status = result.error === "ai_unconfigured" ? 503 : 502
    return NextResponse.json(result, { status })
  }
  return NextResponse.json(result)
}
