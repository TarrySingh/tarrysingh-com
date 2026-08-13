export type ChipAnnotation = {
  id: string
  title: string
  subtitle: string
  body: string
  anchor: { x: number; y: number }
  color: string
}

/**
 * Top-level chip-plate microcopy. Sprint 8 surfaces these in
 * `/studio/synaptic` alongside the six annotations below.
 */
export const CHIP_ARIA_LABEL =
  "MEMPHIS chip plate, a ceramic-substrate hippocampal-memristive die. A 22×22 memristor crossbar with a CA3↔CA1 module at its centre; amber on the warm flank, rose on the cool flank; six annotation anchors naming the architectural elements."

export const CHIP_HINT =
  "Click any numbered anchor to inspect its role"

export const CHIP_DISPLAY_NAME = "Chip Plate · Memphis"

export const CHIP_ANNOTATIONS: ReadonlyArray<ChipAnnotation> = [
  {
    id: "01",
    title: "CA3 recurrent collaterals",
    subtitle: "associative pattern completion",
    body: "A dense mesh of recurrent memristive connections implementing the CA3 auto-associative network. Partial cues reinstate full stored patterns, the hardware substrate of associative recall.",
    anchor: { x: 330, y: 240 },
    color: "#e8b87a",
  },
  {
    id: "02",
    title: "CA1 pyramidal layer",
    subtitle: "read-out and novelty detection",
    body: "The output layer that compares CA3-reconstructed predictions against current input, signalling novelty, mismatch, and drive for replay. Rose-tinted plasticity zones on the die's right flank.",
    anchor: { x: 670, y: 240 },
    color: "#e5a896",
  },
  {
    id: "03",
    title: "Memristive crossbar",
    subtitle: "co-localised memory and compute",
    body: "A self-organising memristor array where each intersection stores a synaptic weight and performs analogue multiply-accumulate in place. Energy is spent only when events flow, not on shuffling activations.",
    anchor: { x: 860, y: 500 },
    color: "#5aa9b8",
  },
  {
    id: "04",
    title: "Event-driven input",
    subtitle: "camera · head-direction",
    body: "Asynchronous spikes from vision and proprioceptive streams enter the chip's left edge, time-stamped in the picosecond domain. No clock, no frames, only salience.",
    anchor: { x: 140, y: 500 },
    color: "#c98e4f",
  },
  {
    id: "05",
    title: "Offline replay drive",
    subtitle: "consolidation without input",
    body: "During sleep-like phases, intrinsic dynamics reactivate stored traces. Memristive thresholds shift; redundant weights fade; salient patterns are reinforced. Learning continues in the dark.",
    anchor: { x: 330, y: 760 },
    color: "#b89256",
  },
  {
    id: "06",
    title: "Neuromodulatory bus",
    subtitle: "prioritisation and gating",
    body: "A slow, broadcast-style channel modulating global plasticity gain, the hardware analogue of dopamine and acetylcholine. Enables the system to decide what to remember and what to let go.",
    anchor: { x: 670, y: 760 },
    color: "#e5a896",
  },
]

export type ChipPhase = "awake" | "sleep"

export const CHIP_N = 22
export const CHIP_CB0 = 240
export const CHIP_CB1 = 760
export const CHIP_STEP = (CHIP_CB1 - CHIP_CB0) / (CHIP_N - 1)

export type ChipCellIntensity = {
  base: number
  inModule: boolean
  warmT: number
  dm: number
}

export function computeIntensities(): ChipCellIntensity[][] {
  const out: ChipCellIntensity[][] = []
  const cx = (CHIP_N - 1) / 2
  const cy = (CHIP_N - 1) / 2
  for (let j = 0; j < CHIP_N; j += 1) {
    const row: ChipCellIntensity[] = []
    for (let i = 0; i < CHIP_N; i += 1) {
      const dm = Math.hypot(i - cx, j - cy)
      const base = Math.max(0, 1 - dm / (CHIP_N * 0.62)) ** 1.3
      const inModule = dm <= 4.2
      const jitter = 0.55 + (((i * 131 + j * 17) % 1000) / 1000) * 0.45
      row.push({
        base: base * jitter,
        inModule,
        warmT: (Math.sin(i * 0.9 + j * 0.7) + 1) / 2,
        dm,
      })
    }
    out.push(row)
  }
  return out
}

export const CHIP_INTENSITIES = computeIntensities()
