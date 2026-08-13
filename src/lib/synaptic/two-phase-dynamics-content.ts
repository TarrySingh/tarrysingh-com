/**
 * Sprint 8 — editable copy for the TwoPhaseDynamics plate.
 * Every user-facing string in `src/components/synaptic/TwoPhaseDynamics.tsx`
 * reads from this module.
 */

export const TWO_PHASE_DISPLAY_NAME = "Two-Phase Dynamics · Memphis"

/** Top-row catalogue marker. */
export const TWO_PHASE_KICKER = "PLATE M-II · MMXXVI · FIG. 1.2.b"

/** Right-side banner explaining the duality at a glance. */
export const TWO_PHASE_BANNER = "ONLINE EVENT-DRIVEN ↔ OFFLINE REPLAY-DRIVEN"

/** Big Gloock display title. */
export const TWO_PHASE_TITLE = "Two-phase dynamics"

/** Lead caption beneath the title — sets up the plate's argument. */
export const TWO_PHASE_LEAD =
  "One physical substrate runs in two regimes. Online events drive sparse, salient computation. Offline intrinsic dynamics replay and consolidate, without external input."

/** Label preceding the phase toggle. */
export const TWO_PHASE_PHASE_LABEL = "Phase"

export const TWO_PHASE_BTN_AWAKE = "Awake · event-driven"
export const TWO_PHASE_BTN_SLEEP = "Sleep · replay-driven"

/** Awake card. */
export const TWO_PHASE_AWAKE_TITLE = "AWAKE · EVENT-DRIVEN"
export const TWO_PHASE_AWAKE_SUB = "online inference"
export const TWO_PHASE_AWAKE_CAPTION =
  "Sparse, salient spikes propagate through CA3 → CA1. Energy is spent only on novelty."

/** Sleep card. */
export const TWO_PHASE_SLEEP_TITLE = "SLEEP · REPLAY-DRIVEN"
export const TWO_PHASE_SLEEP_SUB = "offline consolidation"
export const TWO_PHASE_SLEEP_CAPTION =
  "Intrinsic dynamics replay and consolidate. Memristive thresholds shift; redundant weights fade; salient patterns are reinforced."

/** SVG axis labels. */
export const TWO_PHASE_AXIS_AWAKE_X = "T · MILLISECONDS · INPUT-LOCKED"
export const TWO_PHASE_AXIS_AWAKE_Y = "ENERGY ∝ Σ EVENTS"
export const TWO_PHASE_AXIS_SLEEP_X = "T · MINUTES · INTRINSIC DYNAMICS"
export const TWO_PHASE_AXIS_SLEEP_Y = "ENERGY ≈ CONSTANT · LOW"

/** Accessibility captions on each waveform SVG. */
export const TWO_PHASE_ARIA_AWAKE =
  "Awake-phase waveform, sparse, sharp event-driven spikes."
export const TWO_PHASE_ARIA_SLEEP =
  "Sleep-phase waveform, smooth slow oscillations interspersed with fast sharp-wave ripples."

/** Footer italic close. */
export const TWO_PHASE_FOOTER =
  "One substrate, two regimes. The chip never stops learning, but it stops paying for it during sleep."
