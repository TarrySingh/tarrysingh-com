/**
 * Sprint 8 — editable copy for the ConsortiumGraph plate.
 * Every user-facing string in src/components/synaptic/ConsortiumGraph.tsx
 * reads from this module.
 */

export const CONSORTIUM_DISPLAY_NAME = "Consortium Graph · Symphony"

export const CONSORTIUM_ARIA_LABEL =
  "SYMPHONY consortium across Europe — Real AI in the Netherlands (coordinator), Newcastle / Ramaswamy in the UK, CREATE / PRISMA in Naples Italy, UP Robotics in Croatia. Six edges between every pair of partners showing the work-package couplings."

export const CONSORTIUM_KICKER = "PLATE III · MMXXVI · CONSORTIUM"
export const CONSORTIUM_TITLE = "Four partners, three EU member states"
export const CONSORTIUM_BANNER = "NL · UK · IT · HR"
export const CONSORTIUM_PANEL_LABEL = "PARTNER"
export const CONSORTIUM_ROLE_LABEL = "ROLE"
export const CONSORTIUM_COORDINATOR_LABEL = "◆ COORDINATOR"

export type Partner = {
  id: string
  name: string
  affiliation: string
  country: string
  countryCode: string
  city: string
  role: string
  objective: string
  body: string
  /** Code-owned. */
  pos: { x: number; y: number }
  /** Code-owned. */
  color: string
  /** Code-owned. */
  isCoordinator?: boolean
}

export const CONSORTIUM_PARTNERS: ReadonlyArray<Partner> = [
  {
    id: "realai",
    name: "Real AI",
    affiliation: "Coordinator · Hominis programme",
    country: "Netherlands",
    countryCode: "NL",
    city: "Amsterdam",
    role: "Coordinator",
    objective: "O1 · O4",
    body: "Founded by Tarry Singh. Coordinates SYMPHONY end-to-end, leads the four-layer extraction pipeline (O1, M12) and the pre-registered baseline benchmark (O4, M30). Builds Hominis on EuroHPC allocation at Leonardo / CINECA.",
    pos: { x: 700, y: 320 },
    color: "#f4c482",
    isCoordinator: true,
  },
  {
    id: "newcastle",
    name: "Newcastle · Ramaswamy",
    affiliation: "School of Computing",
    country: "United Kingdom",
    countryCode: "UK",
    city: "Newcastle upon Tyne",
    role: "O2 lead · ethics co-lead",
    objective: "O2",
    body: "Sri Ramaswamy, chair of computational neuroscience. Third author of Mei, Muller & Ramaswamy (2022) — the mathematical primary source for SYMPHONY's mechanism. Blue Brain alumnus. Leads O2 (M18) and co-leads ethics for O5 (M33).",
    pos: { x: 620, y: 180 },
    color: "#e5a896",
  },
  {
    id: "create",
    name: "CREATE · Siciliano",
    affiliation: "PRISMA Lab · UNINA",
    country: "Italy",
    countryCode: "IT",
    city: "Naples",
    role: "O3 lead",
    objective: "O3",
    body: "Bruno Siciliano directs PRISMA Lab. ERC Advanced Grant holder, Engelberger laureate. The architectural primary source for SYMPHONY's task-baton — haptic shared control transposed to software. Leads O3 (M24).",
    pos: { x: 800, y: 540 },
    color: "#6cb4c2",
  },
  {
    id: "uprobotics",
    name: "UP Robotics",
    affiliation: "Industrial demonstrator",
    country: "Croatia",
    countryCode: "HR",
    city: "Zagreb",
    role: "demonstrator codebase",
    objective: "supplier",
    body: "Contributes the industrial-automation demonstrator codebase. The O1 extraction pipeline and the O4 benchmark must both survive contact with this production system whose maintenance logs supply half the held-out task instances.",
    pos: { x: 880, y: 460 },
    color: "#a698d4",
  },
]

export type ConsortiumEdge = {
  /** Code-owned. */
  from: string
  /** Code-owned. */
  to: string
  label?: string
}

export const CONSORTIUM_EDGES: ReadonlyArray<ConsortiumEdge> = [
  { from: "realai", to: "newcastle", label: "O1 → O2" },
  { from: "realai", to: "create", label: "O1 → O3" },
  { from: "realai", to: "uprobotics", label: "O1 corpus" },
  { from: "newcastle", to: "create", label: "co-author" },
  { from: "newcastle", to: "uprobotics", label: "O5 ethics" },
  { from: "create", to: "uprobotics", label: "O3 trials" },
]
