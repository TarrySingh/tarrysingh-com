/** Editor display name (Sprint 8). Surfaced in /studio/synaptic. */
export const PLANISPHERE_DISPLAY_NAME = "Symphony Planisphere · Symphony"

export type Ring = {
  numeral: string
  name: string
  sub: string
  color: string
  rIn: number
  rOut: number
}

export type Sector = {
  id: number
  task: string
  blurb: string
  mod: string
}

export type PlanisphereNode = {
  ringIdx: number
  sectorIdx: number
  x: number
  y: number
  r: number
  ang: number
}

export const RINGS: ReadonlyArray<Ring> = [
  {
    numeral: "I",
    name: "RATIONALE",
    sub: "design intent",
    color: "#f4c482",
    rIn: 0.2,
    rOut: 0.34,
  },
  {
    numeral: "II",
    name: "HISTORICAL",
    sub: "commits · provenance",
    color: "#e5a896",
    rIn: 0.36,
    rOut: 0.5,
  },
  {
    numeral: "III",
    name: "BEHAVIOURAL",
    sub: "tests · contracts · flow",
    color: "#6cb4c2",
    rIn: 0.52,
    rOut: 0.66,
  },
  {
    numeral: "IV",
    name: "STRUCTURAL",
    sub: "modules · functions",
    color: "#849cc8",
    rIn: 0.68,
    rOut: 0.82,
  },
]

export const SECTORS: ReadonlyArray<Sector> = [
  {
    id: 0,
    task: "LOCALISATION",
    blurb: "Pinpoint the source of an observed bug or behaviour.",
    mod: "Rationale & Behavioural up · Structural narrowed",
  },
  {
    id: 1,
    task: "DIAGNOSIS",
    blurb: "Identify root cause from a symptom across layers.",
    mod: "Historical & Behavioural up",
  },
  {
    id: 2,
    task: "IMPACT ANALYSIS",
    blurb: "Trace ripple effects of a proposed change.",
    mod: "Structural up · Historical up",
  },
  {
    id: 3,
    task: "DEPENDENCY TRACE",
    blurb: "Surface call and data dependencies for an entity.",
    mod: "Structural up · Behavioural up",
  },
  {
    id: 4,
    task: "REFACTORING",
    blurb: "Find candidates for safe structural change.",
    mod: "Rationale up · Structural up",
  },
  {
    id: 5,
    task: "TESTING",
    blurb: "Locate gaps and high-leverage test points.",
    mod: "Behavioural up · Historical up",
  },
  {
    id: 6,
    task: "DOCUMENTATION",
    blurb: "Recover the why behind the what.",
    mod: "Rationale up · Historical up",
  },
  {
    id: 7,
    task: "ONBOARDING",
    blurb: "Build a beginner-friendly view of a strange codebase.",
    mod: "All layers, equal weighting",
  },
  {
    id: 8,
    task: "REVIEW",
    blurb: "Reason about a patch against design intent.",
    mod: "Rationale up · Behavioural up",
  },
  {
    id: 9,
    task: "OPTIMISATION",
    blurb: "Find hot paths and contention points.",
    mod: "Behavioural up · Structural up",
  },
  {
    id: 10,
    task: "MIGRATION",
    blurb: "Stage a transition across versions or stacks.",
    mod: "Historical up · Structural up",
  },
  {
    id: 11,
    task: "ARCHITECTURE",
    blurb: "Survey large-scale form and boundaries.",
    mod: "Structural up · Rationale up",
  },
]

export const VIEW = 800
export const CX = VIEW / 2
export const CY = VIEW / 2
export const OUTER_R = VIEW / 2 - 30

// Linear-congruential PRNG seeded for stable layout across renders.
function seedPositions(seed = 7): PlanisphereNode[] {
  let s = seed
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return (s & 0x7fffffff) / 0x7fffffff
  }
  const nodes: PlanisphereNode[] = []
  RINGS.forEach((ring, ri) => {
    const rIn = ring.rIn * OUTER_R
    const rOut = ring.rOut * OUTER_R
    const baseDensity = [1, 3, 4, 7][ri]
    for (let sec = 0; sec < 12; sec++) {
      const n = baseDensity + Math.floor(rand() * 2)
      const angStart = sec * 30 - 90 - 15
      const angEnd = sec * 30 - 90 + 15
      for (let k = 0; k < n; k++) {
        const r = rIn + rand() * (rOut - rIn)
        const a = angStart + 2 + rand() * (angEnd - angStart - 4)
        const rad = (a * Math.PI) / 180
        nodes.push({
          ringIdx: ri,
          sectorIdx: sec,
          x: CX + r * Math.cos(rad),
          y: CY + r * Math.sin(rad),
          r,
          ang: a,
        })
      }
    }
  })
  return nodes
}

export const NODES: ReadonlyArray<PlanisphereNode> = seedPositions(7)

export type SymphonyObjective = {
  id: string
  title: string
  subtitle: string
  body: string
}

export const OBJECTIVES: ReadonlyArray<SymphonyObjective> = [
  {
    id: "O1",
    title: "MULTI-LAYER EXTRACTION",
    subtitle: "structural · behavioural · historical · rationale",
    body: "Build a pipeline that ingests a software system and emits a four-layer representation over a single graph. Coverage ≥ 90 % of functions, ≥ 80 % of inter-module dependencies, decision milestone M12.",
  },
  {
    id: "O2",
    title: "NEUROMODULATORY RECONFIG",
    subtitle: "four-scale activation",
    body: "Implement the four-scale framework of Mei, Muller & Ramaswamy (2022): hyperparameter, plasticity, neuron-level and dendritic modulation, adapted to symbolic activations. F1 ≥ 0.6 against expert ground-truth, M18.",
  },
  {
    id: "O3",
    title: "LOW-BANDWIDTH CONTROL",
    subtitle: "task-switch < 500 ms",
    body: "Derive a narrow scalar control interface (the task baton) by which task tokens reshape activation without modifying stored structure. State-preservation ≥ 0.95, M24.",
  },
  {
    id: "O4",
    title: "BENCHMARKED ADVANTAGE",
    subtitle: "≥ 20 % F1 over baselines",
    body: "Beat (a) a frontier LLM agent, (b) static-analysis + EAKG, and (c) LLM + RAG on a pre-registered 200-instance benchmark. ≥ 20 % F1 lift and ≥ 15 % expert-rated actionability, M30.",
  },
  {
    id: "O5",
    title: "EQUITABLE-ACCESS STUDY",
    subtitle: "≥ 60 engineers, stratified",
    body: "Pre-registered user study stratified across gender, career stage, and native-language proficiency. Primary endpoint: significant time-to-first-correct-change reduction for under-represented strata, with no stratum disadvantaged. M33.",
  },
]

export function wedgePath(
  sec: number,
  rInner: number,
  rOuter: number,
): string {
  const a0 = ((sec * 30 - 90 - 15) * Math.PI) / 180
  const a1 = ((sec * 30 - 90 + 15) * Math.PI) / 180
  const x0o = CX + rOuter * Math.cos(a0)
  const y0o = CY + rOuter * Math.sin(a0)
  const x1o = CX + rOuter * Math.cos(a1)
  const y1o = CY + rOuter * Math.sin(a1)
  const x0i = CX + rInner * Math.cos(a0)
  const y0i = CY + rInner * Math.sin(a0)
  const x1i = CX + rInner * Math.cos(a1)
  const y1i = CY + rInner * Math.sin(a1)
  return `M ${x0i} ${y0i} L ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 0 0 ${x0i} ${y0i} Z`
}
