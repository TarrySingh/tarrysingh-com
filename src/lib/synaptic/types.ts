/**
 * Sprint 8 — Synaptic plate-library linked editing.
 *
 * Shared shapes for the data files under `src/lib/synaptic/`. Every
 * plate component reads its user-facing copy through these slot
 * categories so `/studio/synaptic` can edit the copy without touching
 * the plate's TSX (geometry, palette, animation stay code-owned).
 */

/**
 * A numbered annotation pinned to a position on the plate's SVG.
 * The shape mirrors ChipPlate's existing `ChipAnnotation`.
 */
export interface PlateAnnotation {
  id: string
  title: string
  subtitle: string
  body: string
  /** SVG coords inside the plate's viewBox. Code-owned. */
  anchor?: { x: number; y: number }
  /** Hex string. Code-owned. */
  color?: string
}

/**
 * A short caption — hover hint, axis label, sector copy.
 */
export interface PlateCaption {
  id: string
  text: string
}

/**
 * One block of essay prose (multiple paragraphs). Pages around the
 * plates (`src/app/synaptic/*/page.tsx`) store their `<p>` blocks here.
 */
export interface ProseBlock {
  id: string
  paragraphs: string[]
}

/**
 * Top-level content shape for one plate or page. All fields optional
 * so a plate that has no annotations can simply omit the key.
 */
export interface PlateContent {
  /** Short label for the editor index (e.g. "Chip Plate · Memphis"). */
  displayName: string
  /** aria-label / overall accessibility caption. */
  ariaLabel?: string
  /** "Click any numbered anchor…"-style helper microcopy. */
  hint?: string
  annotations?: PlateAnnotation[]
  captions?: PlateCaption[]
  prose?: ProseBlock[]
}
