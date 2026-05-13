import { NextResponse } from "next/server"
import { listDrafts } from "@/lib/studio/drafts-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/studio/drafts — list every Dispatch draft in Supabase
 * Returns: { drafts: DispatchDraft[] }
 */
export async function GET() {
  try {
    const drafts = await listDrafts()
    return NextResponse.json({ ok: true, drafts })
  } catch (err) {
    console.error(JSON.stringify({ tag: "studio.api.drafts_error", error: err instanceof Error ? err.message : String(err) }))
    return NextResponse.json({ ok: false, error: "drafts_list_failed" }, { status: 500 })
  }
}
