/**
 * Sprint 8 — per-plate content adapters.
 *
 * The live plates render from bespoke hand-authored modules in
 * `src/lib/synaptic/` whose export *shapes* differ per plate (ChipPlate exports
 * a `CHIP_ANNOTATIONS` array; TwoPhaseDynamics exports flat `TWO_PHASE_*`
 * scalars; etc.). The editor, the draft store and the preview all speak the one
 * normalized `PlateContent` shape (`./types`).
 *
 * An **adapter** is the bridge for one plate:
 *   - `load()`      reads the plate's committed module → `PlateContent`
 *                   (the editor's starting point when there's no draft yet, and
 *                   the source of truth for the live preview).
 *   - `serialize()` writes an edited `PlateContent` back into the module's
 *                   source text (via the surgical rewriter in `./serialize`),
 *                   touching only the editable exports.
 *
 * A plate is **editor-ready** exactly when it has an adapter here. The editor
 * index lists every registry plate but only lets you open the ready ones; each
 * additional plate becomes editable by adding one adapter (no UI changes).
 */
import type { PlateContent, PlateAnnotation } from "../types"
import { replaceExportInitializer, tsLiteral, type TsValue } from "./serialize"

import {
  CHIP_DISPLAY_NAME,
  CHIP_ARIA_LABEL,
  CHIP_HINT,
  CHIP_ANNOTATIONS,
} from "../chipplate-data"

export interface PlateAdapter {
  /** Registry id this adapter serves. */
  plateId: string
  /** Read the committed module into normalized PlateContent. */
  load(): PlateContent
  /**
   * Rewrite `currentSrc` (the module's current source text) so its editable
   * exports reflect `content`. Only the named editable exports change; every
   * other byte — types, geometry, compute — is preserved.
   */
  serialize(content: PlateContent, currentSrc: string): string
}

/** Normalize an annotation to a fixed key order so the emitted literal matches
 *  the hand-authored field order (id, title, subtitle, body, anchor, color). */
function orderedAnnotation(a: PlateAnnotation): TsValue {
  return {
    id: a.id,
    title: a.title,
    subtitle: a.subtitle,
    body: a.body,
    anchor: a.anchor ? { x: a.anchor.x, y: a.anchor.y } : undefined,
    color: a.color,
  }
}

const chipPlateAdapter: PlateAdapter = {
  plateId: "chip-plate",
  load() {
    return {
      displayName: CHIP_DISPLAY_NAME,
      ariaLabel: CHIP_ARIA_LABEL,
      hint: CHIP_HINT,
      annotations: CHIP_ANNOTATIONS.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        body: a.body,
        anchor: { x: a.anchor.x, y: a.anchor.y },
        color: a.color,
      })),
    }
  },
  serialize(content, currentSrc) {
    let out = currentSrc
    if (typeof content.displayName === "string") {
      out = replaceExportInitializer(out, "CHIP_DISPLAY_NAME", tsLiteral(content.displayName))
    }
    if (typeof content.ariaLabel === "string") {
      out = replaceExportInitializer(out, "CHIP_ARIA_LABEL", tsLiteral(content.ariaLabel))
    }
    if (typeof content.hint === "string") {
      out = replaceExportInitializer(out, "CHIP_HINT", tsLiteral(content.hint))
    }
    if (content.annotations && content.annotations.length > 0) {
      const arr: TsValue = content.annotations.map(orderedAnnotation)
      out = replaceExportInitializer(
        out,
        "CHIP_ANNOTATIONS",
        tsLiteral(arr, { inlineSmallObjects: true }),
      )
    }
    return out
  },
}

const ADAPTERS: Record<string, PlateAdapter> = {
  [chipPlateAdapter.plateId]: chipPlateAdapter,
}

/** The adapter for a plate, or null if the plate isn't editor-ready yet. */
export function getAdapter(plateId: string): PlateAdapter | null {
  return ADAPTERS[plateId] ?? null
}

/** Whether a plate can be opened in the editor (has an adapter). */
export function isEditorReady(plateId: string): boolean {
  return plateId in ADAPTERS
}
