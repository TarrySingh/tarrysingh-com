/**
 * Sprint 8 — registry of every editable surface in the Synaptic library.
 *
 * Each entry tells the editor:
 *   - what to call it in the index
 *   - which kebab-case id is used in the `synaptic_plate_drafts` table
 *   - which path to fetch the canonical content from (relative to repo root)
 *   - which slot categories the editor should surface
 *
 * Adding a new plate to the library = adding a row here. The editor
 * picks it up automatically.
 *
 * Initial entries are sparse — only ChipPlate is fully extracted today.
 * Each subsequent micro-commit registers one more plate as its
 * extraction lands.
 */

export type SlotCategory = "annotations" | "captions" | "prose"

export interface PlateRegistryEntry {
  /** Stable kebab-case id used everywhere (DB, URL, file naming). */
  id: string
  /** Human-readable label shown in the editor index. */
  displayName: string
  /** Where the canonical content .ts file lives (relative to repo root). */
  contentPath: string
  /** Which slot categories this surface uses. */
  slots: SlotCategory[]
  /** Optional grouping — "memphis", "symphony", etc. for the index. */
  group?: string
  /** Optional preview-route hint; defaults to /synaptic homepage. */
  previewPath?: string
}

export const PLATE_REGISTRY: ReadonlyArray<PlateRegistryEntry> = [
  {
    id: "chip-plate",
    displayName: "Chip Plate · Memphis",
    contentPath: "src/lib/synaptic/chipplate-data.ts",
    slots: ["annotations"],
    group: "memphis",
    previewPath: "/synaptic/memphis",
  },
  {
    id: "two-phase-dynamics",
    displayName: "Two-Phase Dynamics · Memphis",
    contentPath: "src/lib/synaptic/two-phase-dynamics-content.ts",
    slots: ["captions", "prose"],
    group: "memphis",
    previewPath: "/synaptic/memphis",
  },
  {
    id: "siciliano-rose",
    displayName: "Siciliano Rose · Symphony",
    contentPath: "src/lib/synaptic/siciliano-rose-content.ts",
    slots: ["annotations", "captions"],
    group: "symphony",
    previewPath: "/synaptic/symphony/siciliano",
  },
]

export function getPlateEntry(id: string): PlateRegistryEntry | null {
  return PLATE_REGISTRY.find((p) => p.id === id) ?? null
}
