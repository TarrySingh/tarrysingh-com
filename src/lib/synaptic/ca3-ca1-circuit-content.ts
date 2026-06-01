/**
 * Sprint 8 — editable copy for the Ca3Ca1Circuit plate.
 * Every user-facing string in src/components/synaptic/Ca3Ca1Circuit.tsx
 * reads from this module.
 */

export const CA3CA1_DISPLAY_NAME = "CA3–CA1 Circuit · Memphis"

export const CA3CA1_ARIA_LABEL =
  "CA3 ↔ CA1 hippocampal circuit — entorhinal cortex input, dentate gyrus pattern separation, CA3 recurrent collaterals, Schaffer collaterals, CA1 pyramidal layer, and neuromodulatory bus."

export const CA3CA1_KICKER = "PLATE M-III · MMXXVI · FIG. 1.2.c"
export const CA3CA1_CIRCUIT_LABEL = "CA3 ↔ CA1 HIPPOCAMPAL CIRCUIT"
export const CA3CA1_TITLE = "The circuit MEMPHIS reproduces"

export const CA3CA1_LEGEND_LABEL = "EDGE LEGEND"
export const CA3CA1_LEGEND_INPUT = "INPUT · EC → ·"
export const CA3CA1_LEGEND_OUTPUT = "CA3 → CA1 OUTPUT"
export const CA3CA1_LEGEND_MODULATORY = "NEUROMODULATORY"

export const CA3CA1_PANEL_LABEL = "CIRCUIT NODE"

export const CA3CA1_FOOTER =
  "Six circuit motifs — six device-co-design constraints. The substrate succeeds when it reproduces all six in silicon."

export type Spot = {
  /** Code-owned. */
  id: string
  label: string
  subtitle: string
  body: string
  /** Code-owned. */
  x: number
  /** Code-owned. */
  y: number
  /** Hex string. Code-owned. */
  color: string
}

export const CA3CA1_SPOTS: ReadonlyArray<Spot> = [
  {
    id: "ec",
    label: "Entorhinal cortex",
    subtitle: "the input gateway",
    body: "Cortical sensory streams enter the hippocampus through the entorhinal cortex. Layer II projects to the dentate gyrus and CA3; layer III bypasses to CA1. This is where the system first decides what is novel.",
    x: 140,
    y: 200,
    color: "#c98e4f",
  },
  {
    id: "dg",
    label: "Dentate gyrus",
    subtitle: "pattern separation",
    body: "A sparse, expansion-coding bottleneck that turns near-identical inputs into distinct representations. The substrate's mechanism for orthogonalising memories so they do not interfere.",
    x: 320,
    y: 280,
    color: "#f4c482",
  },
  {
    id: "ca3",
    label: "CA3 · recurrent collaterals",
    subtitle: "associative pattern completion",
    body: "Dense recurrent connectivity implementing an auto-associative attractor network. Partial cues retrieve full stored patterns. The 'sea horse' of the hippocampus — the place where Hebb's primitive lives in the loop.",
    x: 560,
    y: 360,
    color: "#e8b87a",
  },
  {
    id: "schaffer",
    label: "Schaffer collaterals",
    subtitle: "CA3 → CA1 read-out path",
    body: "The axon bundle that carries CA3's reconstructed pattern to CA1. STDP at these synapses is the most-studied learning rule in mammalian biology — the canonical primitive MEMPHIS demands from the memristive devices.",
    x: 760,
    y: 360,
    color: "#ffd596",
  },
  {
    id: "ca1",
    label: "CA1 · pyramidal layer",
    subtitle: "novelty detection · read-out",
    body: "Compares CA3's reconstructed prediction against current entorhinal input. Mismatch drives novelty and replay. The system's natural error signal — without an external loss function.",
    x: 920,
    y: 280,
    color: "#e5a896",
  },
  {
    id: "modulator",
    label: "Neuromodulatory bus",
    subtitle: "prioritisation · gain · gating",
    body: "Slow, broadcast signals — analogues of dopamine, acetylcholine, noradrenaline — modulate plasticity gain globally. Set what the system pays attention to and what it commits to long-term memory.",
    x: 600,
    y: 540,
    color: "#a698d4",
  },
]
