/**
 * Sprint 8 — per-plate content adapters.
 *
 * The live plates render from bespoke hand-authored modules in
 * `src/lib/synaptic/` whose export *shapes* differ per plate (ChipPlate exports
 * a `CHIP_ANNOTATIONS` array; TwoPhaseDynamics exports flat `TWO_PHASE_*`
 * scalars; the Symphony plates export typed item arrays + scalars). The editor,
 * the draft store and the preview all speak the one normalized `PlateContent`
 * shape (`./types`).
 *
 * An **adapter** is the bridge for one plate:
 *   - `load()`      reads the plate's committed module → `PlateContent`.
 *   - `serialize()` writes an edited `PlateContent` back into the module's
 *                   source text (via the surgical rewriter in `./serialize`),
 *                   touching only the editable exports and preserving every
 *                   code-owned field (colour, geometry, angles, weights…).
 *
 * A plate is **editor-ready** exactly when it has an adapter here. Most plates
 * are described declaratively via `makeAdapter`; ChipPlate is spelled out as the
 * reference implementation.
 */
import type { PlateContent, PlateAnnotation } from "../types"
import { replaceExportInitializer, tsLiteral, type TsValue } from "./serialize"

import {
  CHIP_DISPLAY_NAME,
  CHIP_ARIA_LABEL,
  CHIP_HINT,
  CHIP_ANNOTATIONS,
} from "../chipplate-data"
import * as twoPhase from "../two-phase-dynamics-content"
import * as sicRose from "../siciliano-rose-content"
import * as hominis from "../hominis-cathedral-content"
import * as vision from "../vision-horizon-content"
import * as sicArm from "../siciliano-arm-hero-content"
import * as ramaswamy from "../ramaswamy-pedigree-content"
import * as plani from "../planisphere-data"

export interface PlateAdapter {
  /** Registry id this adapter serves. */
  plateId: string
  /** Read the committed module into normalized PlateContent. */
  load(): PlateContent
  /**
   * Rewrite `currentSrc` (the module's current source text) so its editable
   * exports reflect `content`. Only the named editable exports change.
   */
  serialize(content: PlateContent, currentSrc: string): string
}

// ---------------------------------------------------------------------------
// ChipPlate — reference adapter (annotations carry anchor + colour).
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Declarative adapter factory — scalars + an optional typed item array.
// ---------------------------------------------------------------------------

interface ScalarCfg {
  /** Export name in the module, e.g. "TWO_PHASE_TITLE". */
  exportName: string
  /** Where it lands in PlateContent. */
  as: "displayName" | "ariaLabel" | "hint" | "caption"
  /** Caption id (stable, kebab) — required when `as: "caption"`. */
  captionId?: string
}

interface ArrayCfg {
  /** Export name of the typed array, e.g. "SICILIANO_SECTORS". */
  exportName: string
  /** Item field used as the annotation id. */
  idField: string
  /** Item field shown as the annotation title (editable). */
  titleField: string
  /** Item field shown as the annotation body (editable). */
  bodyField: string
  /** Optional item field shown as the annotation subtitle (editable). */
  subtitleField?: string
  /** Optional item field used as the annotation colour (preview only). */
  colorField?: string
  /** Full field order for re-emitting each item (preserves authored layout). */
  order: string[]
}

interface PlateMapping {
  scalars: ScalarCfg[]
  array?: ArrayCfg
}

type Item = Record<string, unknown>

function makeAdapter(
  plateId: string,
  ns: Record<string, unknown>,
  map: PlateMapping,
): PlateAdapter {
  return {
    plateId,
    load() {
      const content: PlateContent = { displayName: plateId }
      for (const s of map.scalars) {
        const v = ns[s.exportName]
        if (typeof v !== "string") continue
        if (s.as === "displayName") content.displayName = v
        else if (s.as === "ariaLabel") content.ariaLabel = v
        else if (s.as === "hint") content.hint = v
        else {
          ;(content.captions ??= []).push({ id: s.captionId ?? s.exportName, text: v })
        }
      }
      if (map.array) {
        const a = map.array
        const items = (ns[a.exportName] as ReadonlyArray<Item>) ?? []
        content.annotations = items.map((it) => {
          const ann: PlateAnnotation = {
            id: String(it[a.idField]),
            title: String(it[a.titleField] ?? ""),
            subtitle: a.subtitleField ? String(it[a.subtitleField] ?? "") : "",
            body: String(it[a.bodyField] ?? ""),
          }
          if (a.colorField && typeof it[a.colorField] === "string") {
            ann.color = it[a.colorField] as string
          }
          return ann
        })
      }
      return content
    },
    serialize(content, currentSrc) {
      let out = currentSrc
      for (const s of map.scalars) {
        let v: string | undefined
        if (s.as === "displayName") v = content.displayName
        else if (s.as === "ariaLabel") v = content.ariaLabel
        else if (s.as === "hint") v = content.hint
        else v = content.captions?.find((c) => c.id === (s.captionId ?? s.exportName))?.text
        if (typeof v === "string") {
          out = replaceExportInitializer(out, s.exportName, tsLiteral(v))
        }
      }
      if (map.array && content.annotations && content.annotations.length > 0) {
        const a = map.array
        const originals = (ns[a.exportName] as ReadonlyArray<Item>) ?? []
        const byId = new Map(originals.map((o) => [String(o[a.idField]), o]))
        const newItems = content.annotations.map((ann) => {
          const merged: Item = { ...(byId.get(ann.id) ?? {}) }
          merged[a.titleField] = ann.title
          merged[a.bodyField] = ann.body
          if (a.subtitleField) merged[a.subtitleField] = ann.subtitle
          const ordered: Item = {}
          for (const k of a.order) if (k in merged) ordered[k] = merged[k]
          return ordered
        })
        out = replaceExportInitializer(
          out,
          a.exportName,
          tsLiteral(newItems as unknown as TsValue, {
            inlineSmallObjects: true,
            inlineSmallArrays: true,
          }),
        )
      }
      return out
    },
  }
}

// ---------------------------------------------------------------------------
// The Symphony / Memphis plates, declaratively.
// ---------------------------------------------------------------------------

const twoPhaseAdapter = makeAdapter("two-phase-dynamics", twoPhase as unknown as Record<string, unknown>, {
  scalars: [
    { exportName: "TWO_PHASE_DISPLAY_NAME", as: "displayName" },
    { exportName: "TWO_PHASE_KICKER", as: "caption", captionId: "kicker" },
    { exportName: "TWO_PHASE_BANNER", as: "caption", captionId: "banner" },
    { exportName: "TWO_PHASE_TITLE", as: "caption", captionId: "title" },
    { exportName: "TWO_PHASE_LEAD", as: "caption", captionId: "lead" },
    { exportName: "TWO_PHASE_PHASE_LABEL", as: "caption", captionId: "phase-label" },
    { exportName: "TWO_PHASE_BTN_AWAKE", as: "caption", captionId: "btn-awake" },
    { exportName: "TWO_PHASE_BTN_SLEEP", as: "caption", captionId: "btn-sleep" },
    { exportName: "TWO_PHASE_AWAKE_TITLE", as: "caption", captionId: "awake-title" },
    { exportName: "TWO_PHASE_AWAKE_SUB", as: "caption", captionId: "awake-sub" },
    { exportName: "TWO_PHASE_AWAKE_CAPTION", as: "caption", captionId: "awake-caption" },
    { exportName: "TWO_PHASE_SLEEP_TITLE", as: "caption", captionId: "sleep-title" },
    { exportName: "TWO_PHASE_SLEEP_SUB", as: "caption", captionId: "sleep-sub" },
    { exportName: "TWO_PHASE_SLEEP_CAPTION", as: "caption", captionId: "sleep-caption" },
    { exportName: "TWO_PHASE_AXIS_AWAKE_X", as: "caption", captionId: "axis-awake-x" },
    { exportName: "TWO_PHASE_AXIS_AWAKE_Y", as: "caption", captionId: "axis-awake-y" },
    { exportName: "TWO_PHASE_AXIS_SLEEP_X", as: "caption", captionId: "axis-sleep-x" },
    { exportName: "TWO_PHASE_AXIS_SLEEP_Y", as: "caption", captionId: "axis-sleep-y" },
    { exportName: "TWO_PHASE_ARIA_AWAKE", as: "caption", captionId: "aria-awake" },
    { exportName: "TWO_PHASE_ARIA_SLEEP", as: "caption", captionId: "aria-sleep" },
    { exportName: "TWO_PHASE_FOOTER", as: "caption", captionId: "footer" },
  ],
})

const sicilianoRoseAdapter = makeAdapter("siciliano-rose", sicRose as unknown as Record<string, unknown>, {
  scalars: [
    { exportName: "SICILIANO_DISPLAY_NAME", as: "displayName" },
    { exportName: "SICILIANO_ARIA_LABEL", as: "ariaLabel" },
    { exportName: "SICILIANO_DEFAULT_HINT", as: "hint" },
    { exportName: "SICILIANO_CENTRE_LABEL", as: "caption", captionId: "centre-label" },
    { exportName: "SICILIANO_CENTRE_MOTTO", as: "caption", captionId: "centre-motto" },
    { exportName: "SICILIANO_AWARDS_STRIP", as: "caption", captionId: "awards-strip" },
    { exportName: "SICILIANO_AWARDS_BYLINE", as: "caption", captionId: "awards-byline" },
  ],
  array: {
    exportName: "SICILIANO_SECTORS",
    idField: "id",
    titleField: "label",
    bodyField: "body",
    order: ["id", "label", "body"],
  },
})

const hominisCathedralAdapter = makeAdapter("hominis-cathedral", hominis as unknown as Record<string, unknown>, {
  scalars: [
    { exportName: "HOMINIS_CATHEDRAL_DISPLAY_NAME", as: "displayName" },
    { exportName: "HOMINIS_CATHEDRAL_ARIA_LABEL", as: "ariaLabel" },
    { exportName: "HOMINIS_CATHEDRAL_DEFAULT_HINT", as: "hint" },
    { exportName: "HOMINIS_PEDIMENT_TITLE", as: "caption", captionId: "pediment-title" },
    { exportName: "HOMINIS_PEDIMENT_TAGLINE", as: "caption", captionId: "pediment-tagline" },
    { exportName: "HOMINIS_FOUNDATION_LABEL", as: "caption", captionId: "foundation-label" },
  ],
  array: {
    exportName: "HOMINIS_PILLARS",
    idField: "id",
    titleField: "shaft",
    subtitleField: "capital",
    bodyField: "body",
    colorField: "color",
    order: ["id", "capital", "shaft", "body", "color"],
  },
})

const visionHorizonAdapter = makeAdapter("vision-horizon", vision as unknown as Record<string, unknown>, {
  scalars: [
    { exportName: "VISION_HORIZON_DISPLAY_NAME", as: "displayName" },
    { exportName: "VISION_HORIZON_ARIA_LABEL", as: "ariaLabel" },
    { exportName: "VISION_HORIZON_KICKER", as: "caption", captionId: "kicker" },
    { exportName: "VISION_HORIZON_TITLE", as: "caption", captionId: "title" },
    { exportName: "VISION_HORIZON_BANNER", as: "caption", captionId: "banner" },
    { exportName: "VISION_HORIZON_PANEL_KICKER_PREFIX", as: "caption", captionId: "panel-kicker-prefix" },
    { exportName: "VISION_HORIZON_FOOTER", as: "caption", captionId: "footer" },
  ],
  array: {
    exportName: "VISION_WAYPOINTS",
    idField: "id",
    titleField: "label",
    subtitleField: "numeral",
    bodyField: "body",
    colorField: "color",
    order: ["id", "numeral", "label", "body", "x", "height", "color"],
  },
})

const sicilianoArmAdapter = makeAdapter("siciliano-arm-hero", sicArm as unknown as Record<string, unknown>, {
  scalars: [
    { exportName: "SICILIANO_ARM_DISPLAY_NAME", as: "displayName" },
    { exportName: "SICILIANO_ARM_ARIA_LABEL", as: "ariaLabel" },
    { exportName: "SICILIANO_ARM_KICKER", as: "caption", captionId: "kicker" },
    { exportName: "SICILIANO_ARM_TITLE", as: "caption", captionId: "title" },
    { exportName: "SICILIANO_ARM_BANNER", as: "caption", captionId: "banner" },
    { exportName: "SICILIANO_ARM_SUPERVISOR_LABEL", as: "caption", captionId: "supervisor-label" },
    { exportName: "SICILIANO_ARM_TASKS_LABEL", as: "caption", captionId: "tasks-label" },
  ],
  array: {
    exportName: "SICILIANO_POSES",
    idField: "id",
    titleField: "label",
    subtitleField: "task",
    bodyField: "body",
    colorField: "color",
    order: ["id", "label", "task", "body", "angles", "color"],
  },
})

const ramaswamyPedigreeAdapter = makeAdapter("ramaswamy-pedigree", ramaswamy as unknown as Record<string, unknown>, {
  scalars: [
    { exportName: "RAMASWAMY_PEDIGREE_DISPLAY_NAME", as: "displayName" },
    { exportName: "RAMASWAMY_PEDIGREE_ARIA_LABEL", as: "ariaLabel" },
    { exportName: "RAMASWAMY_PEDIGREE_DEFAULT_HINT", as: "hint" },
    { exportName: "RAMASWAMY_COLUMN_TOP_LABEL", as: "caption", captionId: "column-top-label" },
    { exportName: "RAMASWAMY_COLUMN_BOTTOM_LABEL", as: "caption", captionId: "column-bottom-label" },
    { exportName: "RAMASWAMY_COLUMN_KICKER", as: "caption", captionId: "column-kicker" },
    { exportName: "RAMASWAMY_NEUROMOD_KICKER", as: "caption", captionId: "neuromod-kicker" },
  ],
  array: {
    // Beats carry a numeric `year` (the id) and an optional `weight`
    // ("primary"/"secondary") — both preserved untouched on serialize.
    exportName: "RAMASWAMY_BEATS",
    idField: "year",
    titleField: "label",
    bodyField: "detail",
    order: ["year", "label", "detail", "weight"],
  },
})

// ---------------------------------------------------------------------------
// Symphony planisphere — custom adapter (three editable arrays: the O1–O5
// objectives, the 12 task sectors, the 4 layer rings). Shared by the
// Planisphere + SymphonyStudio components, both rendering planisphere-data.ts.
// ---------------------------------------------------------------------------

const SECTOR_CAPTION = (task: string) => `Sector · ${task}`
const RING_CAPTION = (name: string) => `Ring · ${name}`

const planisphereAdapter: PlateAdapter = {
  plateId: "symphony-planisphere",
  load() {
    return {
      displayName: plani.PLANISPHERE_DISPLAY_NAME,
      // O1–O5 objectives map cleanly to annotations.
      annotations: plani.OBJECTIVES.map((o) => ({
        id: o.id,
        title: o.title,
        subtitle: o.subtitle,
        body: o.body,
      })),
      // Sector blurbs + ring sub-labels are the rest of the editable copy;
      // their structural fields (task/mod, numeral/colour/radii) ride along.
      captions: [
        ...plani.SECTORS.map((s) => ({ id: SECTOR_CAPTION(s.task), text: s.blurb })),
        ...plani.RINGS.map((r) => ({ id: RING_CAPTION(r.name), text: r.sub })),
      ],
    }
  },
  serialize(content, currentSrc) {
    let out = currentSrc
    if (typeof content.displayName === "string") {
      out = replaceExportInitializer(out, "PLANISPHERE_DISPLAY_NAME", tsLiteral(content.displayName))
    }
    if (content.annotations && content.annotations.length > 0) {
      const items: TsValue = content.annotations.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        body: a.body,
      }))
      out = replaceExportInitializer(out, "OBJECTIVES", tsLiteral(items))
    }
    if (content.captions && content.captions.length > 0) {
      const cap = new Map(content.captions.map((c) => [c.id, c.text]))
      const sectors: TsValue = plani.SECTORS.map((s) => ({
        id: s.id,
        task: s.task,
        blurb: cap.get(SECTOR_CAPTION(s.task)) ?? s.blurb,
        mod: s.mod,
      }))
      out = replaceExportInitializer(out, "SECTORS", tsLiteral(sectors))
      const rings: TsValue = plani.RINGS.map((r) => ({
        numeral: r.numeral,
        name: r.name,
        sub: cap.get(RING_CAPTION(r.name)) ?? r.sub,
        color: r.color,
        rIn: r.rIn,
        rOut: r.rOut,
      }))
      out = replaceExportInitializer(out, "RINGS", tsLiteral(rings))
    }
    return out
  },
}

const ADAPTERS: Record<string, PlateAdapter> = {
  [chipPlateAdapter.plateId]: chipPlateAdapter,
  [planisphereAdapter.plateId]: planisphereAdapter,
  [twoPhaseAdapter.plateId]: twoPhaseAdapter,
  [sicilianoRoseAdapter.plateId]: sicilianoRoseAdapter,
  [hominisCathedralAdapter.plateId]: hominisCathedralAdapter,
  [visionHorizonAdapter.plateId]: visionHorizonAdapter,
  [sicilianoArmAdapter.plateId]: sicilianoArmAdapter,
  [ramaswamyPedigreeAdapter.plateId]: ramaswamyPedigreeAdapter,
}

/** The adapter for a plate, or null if the plate isn't editor-ready yet. */
export function getAdapter(plateId: string): PlateAdapter | null {
  return ADAPTERS[plateId] ?? null
}

/** Whether a plate can be opened in the editor (has an adapter). */
export function isEditorReady(plateId: string): boolean {
  return plateId in ADAPTERS
}
