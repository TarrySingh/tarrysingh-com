/**
 * Sprint 8 — editable copy for the VisionHorizon plate.
 */

export const VISION_HORIZON_DISPLAY_NAME = "Vision Horizon · Symphony"

export interface VisionWaypoint {
  id: string
  numeral: string
  label: string
  body: string
  /** 0…1 fraction across the panorama. Code-owned. */
  x: number
  /** 0…1 peak height. Code-owned. */
  height: number
  /** Hex string. Code-owned. */
  color: string
}

export const VISION_WAYPOINTS: ReadonlyArray<VisionWaypoint> = [
  {
    id: "representation",
    numeral: "I",
    label: "Representation",
    body: "A single substrate capable of holding an industrial-scale codebase coherently, structural, behavioural, historical and rationale layers unified on one graph. The first requirement of the long-term vision.",
    x: 0.22,
    height: 0.62,
    color: "#f4c482",
  },
  {
    id: "reconfiguration",
    numeral: "II",
    label: "Reconfiguration",
    body: "A mechanism for reconfiguring that representation on demand without rebuilding it, multi-scale neuromodulation transposed from cortex to code. The tallest peak; the hardest claim.",
    x: 0.5,
    height: 0.92,
    color: "#a698d4",
  },
  {
    id: "audit",
    numeral: "III",
    label: "Narrow control surface",
    body: "A scalar task-baton interface, deliberately bounded, so the substrate is composable, auditable, and traceable, Siciliano-school shared control transposed into software.",
    x: 0.78,
    height: 0.7,
    color: "#6cb4c2",
  },
]

export const VISION_HORIZON_ARIA_LABEL =
  "SYMPHONY vision horizon, a panoramic landscape with three peaks marking the three minimal requirements of the long-term vision: a coherent representation, a reconfiguration mechanism, and a narrow auditable control surface."

export const VISION_HORIZON_KICKER = "PLATE I · MMXXVI · VISION"
export const VISION_HORIZON_TITLE = "The long-term vision"
export const VISION_HORIZON_BANNER = "THREE MINIMAL REQUIREMENTS · §1.1"

/** Detail panel label prefix — "REQUIREMENT · {numeral}". */
export const VISION_HORIZON_PANEL_KICKER_PREFIX = "REQUIREMENT"

export const VISION_HORIZON_FOOTER =
  "The vision requires, minimally, three things. The substrate is either the bridge by 2030 or the gap is permanent."
