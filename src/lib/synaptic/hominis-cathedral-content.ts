/**
 * Sprint 8 — editable copy for the HominisCathedral plate.
 * Every user-facing string in src/components/synaptic/HominisCathedral.tsx
 * reads from this module.
 */

export const HOMINIS_CATHEDRAL_DISPLAY_NAME =
  "Hominis Cathedral · Symphony"

export interface HominisPillar {
  id: string
  capital: string
  shaft: string
  body: string
  color: string
}

export const HOMINIS_PILLARS: ReadonlyArray<HominisPillar> = [
  {
    id: "situated",
    capital: "I",
    shaft: "Situated",
    body: "Foundation models that read the world they are deployed into — industrial-automation logs, EU regulatory text, multi-lingual scientific corpora — not just the open web. Trained on context that matches the substrate they will be embedded in.",
    color: "#f4c482",
  },
  {
    id: "auditable",
    capital: "II",
    shaft: "Auditable",
    body: "Every output is traceable to a substrate region, every adaptation to a task token. Compositional control surfaces, bounded behaviour, and external evaluation built into the development loop, not bolted on after release.",
    color: "#e5a896",
  },
  {
    id: "compute",
    capital: "III",
    shaft: "Compute-aware",
    body: "Built on EuroHPC allocation time at Leonardo (CINECA, Bologna). Designed to run within the energy and the time budget of European public infrastructure — not against it.",
    color: "#6cb4c2",
  },
]

export const HOMINIS_CATHEDRAL_ARIA_LABEL =
  "Hominis cathedral — three pillars (situated · auditable · compute-aware) standing on the Leonardo / CINECA EuroHPC foundation, with a Hominis pediment above."

export const HOMINIS_PEDIMENT_TITLE = "HOMINIS"
export const HOMINIS_PEDIMENT_TAGLINE = "FOUNDATION MODELS FOR THE REAL WORLD"
export const HOMINIS_FOUNDATION_LABEL = "LEONARDO  ·  CINECA  ·  EUROHPC"

export const HOMINIS_CATHEDRAL_DEFAULT_HINT =
  "Hominis stands on three pillars and a EuroHPC foundation. Hover any pillar to read the property it represents. The cathedral metaphor is deliberate: a foundation model meant to last is built like a cathedral, not a sprint."
