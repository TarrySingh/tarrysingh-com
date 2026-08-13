/**
 * Sprint 8 — editable copy for the SubstrateScales plate.
 * Every user-facing string in src/components/synaptic/SubstrateScales.tsx
 * reads from this module.
 */

type LayerKey = "rationale" | "historical" | "behavioural" | "structural"
type ScaleKey = "hyperparameter" | "plasticity" | "neuronal" | "dendritic"

export const SUBSTRATE_DISPLAY_NAME = "Substrate Scales · Symphony"

export const SUBSTRATE_ARIA_LABEL =
  "Substrate × scales matrix, four code-system layers (rationale, historical, behavioural, structural) crossed with four neuromodulatory scales (hyperparameter, plasticity, neuronal, dendritic). Sixteen cells, sixteen behaviours."

export const SUBSTRATE_PLATE_KICKER = "PLATE II · MMXXVI · FIG. 1.2"
export const SUBSTRATE_TITLE = "Substrate × scales"
export const SUBSTRATE_SUBTITLE =
  "Four code-system layers crossed with four neuromodulatory scales, sixteen ways to reshape activation"
export const SUBSTRATE_CITATION = "MEI · MULLER · RAMASWAMY 2022"
export const SUBSTRATE_FOOTER =
  "The substrate is the cell of the matrix the engineer activates next, not the entire matrix re-read."

export type SubstrateLayer = {
  key: LayerKey
  /** Code-owned. */
  numeral: string
  label: string
  sub: string
  /** Code-owned. */
  color: string
}

export const SUBSTRATE_LAYERS: ReadonlyArray<SubstrateLayer> = [
  { key: "rationale", numeral: "I", label: "Rationale", sub: "design intent", color: "#f4c482" },
  { key: "historical", numeral: "II", label: "Historical", sub: "commits · provenance", color: "#e5a896" },
  { key: "behavioural", numeral: "III", label: "Behavioural", sub: "tests · contracts · flow", color: "#6cb4c2" },
  { key: "structural", numeral: "IV", label: "Structural", sub: "modules · functions", color: "#849cc8" },
]

export type SubstrateScale = {
  key: ScaleKey
  label: string
  sub: string
  /** Code-owned. */
  symbol: string
}

export const SUBSTRATE_SCALES: ReadonlyArray<SubstrateScale> = [
  { key: "hyperparameter", label: "Hyperparameter", sub: "global gain", symbol: "η" },
  { key: "plasticity", label: "Plasticity", sub: "connectivity reshape", symbol: "Δω" },
  { key: "neuronal", label: "Neuronal", sub: "per-node gating", symbol: "g" },
  { key: "dendritic", label: "Dendritic", sub: "branch-local compute", symbol: "ξ" },
]

export const SUBSTRATE_CELLS: Record<LayerKey, Record<ScaleKey, { title: string; body: string }>> = {
  rationale: {
    hyperparameter: { title: "Admit rationale globally", body: "How strongly design-rationale evidence is admitted into the active subnetwork at all." },
    plasticity: { title: "Rewire rationale links", body: "Re-weight which rationale fragments connect to which structural anchors · promote, demote, prune." },
    neuronal: { title: "Boost a single note", body: "Gain individual rationale notes (an ADR, a commit message, a comment) up or down per task." },
    dendritic: { title: "Branch within a note", body: "Within one rationale node, surface the branch matching the task context (performance vs. safety)." },
  },
  historical: {
    hyperparameter: { title: "Admit history globally", body: "Decide how heavily commit history weighs against current code in any task." },
    plasticity: { title: "Re-link the trace", body: "Re-link commits to functions and modules where the trace has gone stale; rewire after a rebase." },
    neuronal: { title: "Boost relevant commits", body: "Boost the commits that touched the cells the task baton is pointed at." },
    dendritic: { title: "Hunk within a commit", body: "Within a commit, surface the hunk relevant to the task · not the whole patch." },
  },
  behavioural: {
    hyperparameter: { title: "Trust the contract", body: "Tune how much test and contract evidence the substrate trusts for the current task." },
    plasticity: { title: "Edges as tests land", body: "Add or remove behavioural edges as new tests land · without rebuilding the substrate." },
    neuronal: { title: "Boost an exerciser", body: "Boost individual tests / contracts that exercise the path under inspection." },
    dendritic: { title: "Assertion stack", body: "Within a test, surface the assertion stack that matches the suspected fault region." },
  },
  structural: {
    hyperparameter: { title: "Prune the visible set", body: "Set how aggressively the substrate prunes its visible module / function set for the task." },
    plasticity: { title: "Re-link after refactor", body: "Re-link modules after refactoring; reweight inter-module dependencies under the task." },
    neuronal: { title: "Boost on-path functions", body: "Boost the functions on the active task's salience path; quiet the rest." },
    dendritic: { title: "Block within a function", body: "Within a function, surface the basic blocks the task baton actually needs." },
  },
}
