/**
 * Sprint 8 — editable copy for the EnergyGradient plate.
 * Every user-facing string in src/components/synaptic/EnergyGradient.tsx
 * reads from this module.
 */

export const ENERGY_DISPLAY_NAME = "Energy Gradient · Memphis"

export const ENERGY_ARIA_LABEL =
  "Energy gradient, femtojoules per synaptic event. GPU AI at ~1 nJ, Loihi/TrueNorth at ~10 pJ, mammalian biology at ~100 fJ, MEMPHIS target below 10 fJ. Six orders of magnitude separate today's foundation-model inference from the biological benchmark."

export const ENERGY_PLATE_MARKER = "PLATE M-V · MMXXVI · FIG. 2.1.a"
export const ENERGY_HEADER_EYEBROW = "ENERGY PER SYNAPTIC EVENT · LOG SCALE"
export const ENERGY_TITLE = "The energy gradient"
export const ENERGY_PER_EVENT_LABEL = "PER EVENT"
export const ENERGY_BENCHMARK_LABEL = "BIOLOGICAL BENCHMARK ≈ 100 fJ"
export const ENERGY_SWEEP_LABEL = "− 5 ORDERS OF MAGNITUDE"
export const ENERGY_TIER_LABEL_PREFIX = "TIER · "
export const ENERGY_CAPTION =
  "MEMPHIS targets the biological benchmark, not the next neuromorphic increment. Five orders of magnitude separate it from today’s GPU-borne foundation-model inference."

export type Tier = {
  /** Code-owned. */
  id: string
  label: string
  detail: string
  /** femtojoules per synaptic event. Code-owned. */
  energy: number
  era: string
  /** Code-owned. */
  color: string
  source: string
}

export const ENERGY_TIERS: ReadonlyArray<Tier> = [
  {
    id: "gpu",
    label: "GPU AI",
    detail: "transformer inference",
    energy: 1_000_000, // ~1 nJ
    era: "2023–2026",
    color: "#849cc8",
    source:
      "Foundation-model inference on H100-class accelerators, roughly 1 nJ per equivalent synaptic operation, six orders of magnitude above the biological benchmark.",
  },
  {
    id: "loihi",
    label: "Loihi · TrueNorth",
    detail: "state-of-the-art neuromorphic",
    energy: 10_000, // ~10 pJ
    era: "2014–2024",
    color: "#a698d4",
    source:
      "Intel Loihi 2 and IBM TrueNorth, current best-in-class digital neuromorphic hardware. Per-event energies hover at ~10 pJ.",
  },
  {
    id: "biology",
    label: "Biology",
    detail: "mammalian cortex",
    energy: 100,
    era: "millions of years",
    color: "#6cb4c2",
    source:
      "Mammalian synaptic event, the benchmark every neuromorphic effort is measured against. ~100 fJ per event in cortex.",
  },
  {
    id: "memphis",
    label: "MEMPHIS",
    detail: "target · self-organising memristive",
    energy: 10,
    era: "2026 → 2029 (target)",
    color: "#ffd596",
    source:
      "MEMPHIS target: < 10 fJ per synaptic event for 100×100 nm² memristive devices, three orders below Loihi/TrueNorth and approaching biology.",
  },
]
