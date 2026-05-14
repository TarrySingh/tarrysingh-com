import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALLOWED_TYPES = new Set([
  "passkey",
  "returning-reader",
  "reading-milestone",
  "highlight-share",
  "exit-intent",
  "footer-card",
])

const ALLOWED_EVENTS = new Set(["view", "submit", "dismiss"])

interface LogBody {
  nudgeType?: unknown
  slug?: unknown
  event?: unknown
}

/**
 * POST /api/nudge/log
 *
 * Increment a counter in the `nudge_events` Supabase table. Sprint 5.5
 * measurement endpoint. Surveillance-free: stores nudge_type + slug
 * (when post-scoped) + event + server timestamp. No IP, no UA, no
 * fingerprint, no per-reader tracking.
 *
 * Fails silently with 200 when storage is unconfigured so a missing
 * Supabase setup never breaks the reader-facing nudge components.
 *
 * Body: { nudgeType, slug?, event }
 * Returns: { ok }
 */
export async function POST(req: NextRequest) {
  let body: LogBody
  try {
    body = (await req.json()) as LogBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const nudgeType = typeof body.nudgeType === "string" ? body.nudgeType : null
  const event = typeof body.event === "string" ? body.event : null
  const slug = typeof body.slug === "string" ? body.slug : null

  if (!nudgeType || !ALLOWED_TYPES.has(nudgeType)) {
    return NextResponse.json(
      { ok: false, error: "unknown_nudge_type" },
      { status: 400 },
    )
  }
  if (!event || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json(
      { ok: false, error: "unknown_event" },
      { status: 400 },
    )
  }

  let supabase
  try {
    supabase = createServiceClient()
  } catch {
    // Storage unconfigured — fail silently. The studio is built so that
    // missing analytics never breaks the reader-facing surface.
    return NextResponse.json({ ok: true, persisted: false })
  }

  const { error } = await supabase
    .from("nudge_events")
    .insert({ nudge_type: nudgeType, slug, event })

  if (error) {
    console.error(
      JSON.stringify({
        tag: "nudge.log_error",
        nudgeType,
        slug,
        event,
        error: error.message,
      }),
    )
    return NextResponse.json({ ok: true, persisted: false })
  }

  return NextResponse.json({ ok: true, persisted: true })
}
