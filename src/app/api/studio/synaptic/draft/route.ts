import { NextRequest, NextResponse } from "next/server"
import {
  getPlateDraft,
  upsertPlateDraft,
  deletePlateDraft,
} from "@/lib/synaptic/content-store"
import { getAdapter } from "@/lib/synaptic/editor/adapters"
import { getPlateEntry } from "@/lib/synaptic/registry"
import type {
  PlateContent,
  PlateAnnotation,
  PlateCaption,
  ProseBlock,
} from "@/lib/synaptic/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PLATE_ID_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined
}

/** Lenient PlateContent validator — keep well-formed slots, drop garbage. The
 *  adapter only serializes the slots its plate uses, so extra slots are
 *  harmless; this just guarantees we never persist a malformed row. */
function parseAnnotations(v: unknown): PlateAnnotation[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: PlateAnnotation[] = []
  for (const item of v) {
    if (typeof item !== "object" || item === null) continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string") continue
    const ann: PlateAnnotation = {
      id: o.id,
      title: str(o.title) ?? "",
      subtitle: str(o.subtitle) ?? "",
      body: str(o.body) ?? "",
    }
    if (o.anchor && typeof o.anchor === "object") {
      const a = o.anchor as Record<string, unknown>
      if (typeof a.x === "number" && typeof a.y === "number") {
        ann.anchor = { x: a.x, y: a.y }
      }
    }
    if (typeof o.color === "string") ann.color = o.color
    out.push(ann)
  }
  return out
}

function parseCaptions(v: unknown): PlateCaption[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: PlateCaption[] = []
  for (const item of v) {
    if (typeof item !== "object" || item === null) continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string") continue
    out.push({ id: o.id, text: str(o.text) ?? "" })
  }
  return out
}

function parseProse(v: unknown): ProseBlock[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: ProseBlock[] = []
  for (const item of v) {
    if (typeof item !== "object" || item === null) continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string") continue
    const paragraphs = Array.isArray(o.paragraphs)
      ? (o.paragraphs as unknown[]).filter((p): p is string => typeof p === "string")
      : []
    out.push({ id: o.id, paragraphs })
  }
  return out
}

function parsePlateContent(v: unknown): PlateContent | null {
  if (typeof v !== "object" || v === null) return null
  const o = v as Record<string, unknown>
  if (typeof o.displayName !== "string") return null
  const c: PlateContent = { displayName: o.displayName }
  const aria = str(o.ariaLabel)
  if (aria !== undefined) c.ariaLabel = aria
  const hint = str(o.hint)
  if (hint !== undefined) c.hint = hint
  const annotations = parseAnnotations(o.annotations)
  if (annotations) c.annotations = annotations
  const captions = parseCaptions(o.captions)
  if (captions) c.captions = captions
  const prose = parseProse(o.prose)
  if (prose) c.prose = prose
  return c
}

function validPlate(plateId: string): boolean {
  return PLATE_ID_RE.test(plateId) && getPlateEntry(plateId) !== null
}

/**
 * GET /api/studio/synaptic/draft?plateId=<id>
 *
 * Returns the editor's starting content: the saved draft if one exists,
 * otherwise the committed module's content via the adapter.
 *   { ok, plateId, content, source: "draft" | "file", updatedAt? }
 */
export async function GET(req: NextRequest) {
  const plateId = new URL(req.url).searchParams.get("plateId")?.trim() ?? ""
  if (!validPlate(plateId)) {
    return NextResponse.json({ ok: false, error: "invalid_plate" }, { status: 422 })
  }
  const adapter = getAdapter(plateId)
  if (!adapter) {
    return NextResponse.json({ ok: false, error: "not_editor_ready" }, { status: 422 })
  }

  try {
    const draft = await getPlateDraft(plateId)
    if (draft) {
      return NextResponse.json({
        ok: true,
        plateId,
        content: draft.content,
        source: "draft",
        updatedAt: draft.updatedAt,
      })
    }
    return NextResponse.json({
      ok: true,
      plateId,
      content: adapter.load(),
      source: "file",
    })
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "synaptic.api.draft_get_error",
        plateId,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    // Drafts service unavailable (Supabase env/migration) — still let the
    // editor open against the committed file so it's never fully broken.
    return NextResponse.json({
      ok: true,
      plateId,
      content: adapter.load(),
      source: "file",
      degraded: true,
    })
  }
}

interface DraftBody {
  plateId?: unknown
  content?: unknown
}

/**
 * PUT /api/studio/synaptic/draft  { plateId, content }
 * Upserts the in-progress draft (autosave).
 */
export async function PUT(req: NextRequest) {
  let body: DraftBody
  try {
    body = (await req.json()) as DraftBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  const plateId = typeof body.plateId === "string" ? body.plateId.trim() : ""
  if (!validPlate(plateId) || !getAdapter(plateId)) {
    return NextResponse.json({ ok: false, error: "invalid_plate" }, { status: 422 })
  }
  const content = parsePlateContent(body.content)
  if (!content) {
    return NextResponse.json({ ok: false, error: "invalid_content" }, { status: 422 })
  }
  try {
    await upsertPlateDraft(plateId, content)
    return NextResponse.json({ ok: true, plateId, savedAt: new Date().toISOString() })
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "synaptic.api.draft_put_error",
        plateId,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 })
  }
}

/**
 * DELETE /api/studio/synaptic/draft?plateId=<id>
 * Discards the draft — the editor reverts to the committed file content.
 */
export async function DELETE(req: NextRequest) {
  const plateId = new URL(req.url).searchParams.get("plateId")?.trim() ?? ""
  if (!validPlate(plateId)) {
    return NextResponse.json({ ok: false, error: "invalid_plate" }, { status: 422 })
  }
  try {
    await deletePlateDraft(plateId)
    return NextResponse.json({ ok: true, plateId })
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "synaptic.api.draft_delete_error",
        plateId,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 500 })
  }
}
