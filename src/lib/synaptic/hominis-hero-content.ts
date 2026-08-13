/**
 * Sprint 8 — editable copy for the HominisHero plate.
 * Every user-facing string in src/components/synaptic/HominisHero.tsx
 * reads from this module.
 */

export const HOMINIS_HERO_DISPLAY_NAME = "Hominis Hero · Symphony"

export const HOMINIS_HERO_ARIA_LABEL =
  "Hominis cathedral, three pillars (situated · auditable · compute-aware) standing on the Leonardo / CINECA EuroHPC foundation, beneath a pediment carrying the HOMINIS wordmark."

export const HOMINIS_HERO_STUDIO_HEADER = "PLATE VI · MMXXVI · REAL AI / TARRY · COORDINATOR"
export const HOMINIS_HERO_TITLE = "Hominis cathedral"
export const HOMINIS_HERO_TAGLINE = "FOUNDATION MODELS FOR THE REAL WORLD"
export const HOMINIS_HERO_WORDMARK = "HOMINIS"
export const HOMINIS_HERO_WORDMARK_SUBTITLE = "FOUNDATION MODELS FOR THE REAL WORLD"
export const HOMINIS_HERO_FOUNDATION_LABEL = "LEONARDO · CINECA · EUROHPC"
export const HOMINIS_HERO_FOUNDATION_CAPTION = "European public compute · Bologna"

export type HominisPillar = {
  /** Code-owned. */
  id: string
  capital: string
  shaft: string
  body: string
  /** Code-owned. */
  color: string
}

export const HOMINIS_HERO_PILLARS: ReadonlyArray<HominisPillar> = [
  {
    id: "situated",
    capital: "I",
    shaft: "Situated",
    body: "Foundation models that read the world they are deployed into, industrial-automation logs, EU regulatory text, multi-lingual scientific corpora, not just the open web. Trained on the context that matches the substrate they will be embedded in. The model knows where it is.",
    color: "#f4c482",
  },
  {
    id: "auditable",
    capital: "II",
    shaft: "Auditable",
    body: "Every output is traceable to a substrate region; every adaptation to a task token. Compositional control surfaces, bounded behaviour, and external evaluation built into the development loop, not bolted on after release. The model shows its work.",
    color: "#e5a896",
  },
  {
    id: "compute",
    capital: "III",
    shaft: "Compute-aware",
    body: "Built on EuroHPC allocation time at Leonardo (CINECA, Bologna). Designed to run within the energy and the time budget of European public infrastructure, not against it. Per-paper tCO₂e reporting; absolute compute-budget caps declared in the DMP.",
    color: "#6cb4c2",
  },
]
