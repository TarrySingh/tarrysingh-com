/**
 * Sprint 8 — editable copy for the RamaswamyCortexHero plate.
 * Every user-facing string in src/components/synaptic/RamaswamyCortexHero.tsx
 * reads from this module.
 */

export const RAMASWAMY_CORTEX_DISPLAY_NAME = "Ramaswamy Cortex Hero · Symphony"

export const RAMASWAMY_CORTEX_ARIA_LABEL =
  "Ramaswamy cortex hero, a cortical column reconstructed in cross-section across six layers, with four neuromodulator beams (acetylcholine, dopamine, noradrenaline, serotonin) sweeping horizontally through it. The mathematical primary source for SYMPHONY's mechanism."

export const RAMASWAMY_CORTEX_KICKER = "PLATE VII · MMXXVI · NEWCASTLE / RAMASWAMY"
export const RAMASWAMY_CORTEX_TITLE = "A column, four modulators, twenty years"
export const RAMASWAMY_CORTEX_BANNER = "MATHEMATICAL PRIMARY · MEI · MULLER · RAMASWAMY 2022"
export const RAMASWAMY_CORTEX_MODULATOR_LABEL = "Modulator"

export type Modulator = {
  /** Code-owned. */
  id: "ach" | "da" | "ne" | "ht"
  name: string
  full: string
  body: string
  /** Code-owned. */
  color: string
  /** Code-owned. */
  y: number
}

export const RAMASWAMY_CORTEX_MODULATORS: ReadonlyArray<Modulator> = [
  {
    id: "ach",
    name: "Ach",
    full: "Acetylcholine",
    body: "Attention and uncertainty. Modulates the gain of cortical processing under attentional demand, the model's primary substrate for surfacing salient sub-networks.",
    color: "#f4c482",
    y: 200,
  },
  {
    id: "da",
    name: "DA",
    full: "Dopamine",
    body: "Reward and plasticity. Reshapes synaptic weights based on prediction-error signals, the substrate's mechanism for learning-without-retraining.",
    color: "#e5a896",
    y: 320,
  },
  {
    id: "ne",
    name: "NE",
    full: "Noradrenaline",
    body: "Arousal and neural gain. Sets the network's overall responsiveness, Symphony's hyperparameter-scale modulator.",
    color: "#6cb4c2",
    y: 440,
  },
  {
    id: "ht",
    name: "5-HT",
    full: "Serotonin",
    body: "Temporal discounting and tonic state. Tunes how strongly far-temporal signals weigh into the present activation, for code: how much history matters under this task.",
    color: "#a698d4",
    y: 560,
  },
]

export type CortexLayer = {
  /** Code-owned. */
  id: string
  /** Code-owned. */
  y: number
  /** Code-owned. */
  h: number
  label: string
  sub: string
}

// Layers L1–L6, top to bottom
export const RAMASWAMY_CORTEX_LAYERS: ReadonlyArray<CortexLayer> = [
  { id: "L1", y: 130, h: 60, label: "Layer I", sub: "molecular" },
  { id: "L2/3", y: 198, h: 110, label: "Layer II / III", sub: "pyramidal" },
  { id: "L4", y: 312, h: 80, label: "Layer IV", sub: "granular" },
  { id: "L5", y: 396, h: 110, label: "Layer V", sub: "pyramidal" },
  { id: "L6", y: 510, h: 90, label: "Layer VI", sub: "multiform" },
  { id: "WM", y: 604, h: 40, label: "White matter", sub: "axonal" },
]
