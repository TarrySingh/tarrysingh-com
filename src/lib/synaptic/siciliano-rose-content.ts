/**
 * Sprint 8 — editable copy for the SicilianoRose plate.
 * Every user-facing string in src/components/synaptic/SicilianoRose.tsx
 * reads from this module.
 */

export const SICILIANO_DISPLAY_NAME = "Siciliano Rose · Symphony"

export interface SicilianoSector {
  id: string
  label: string
  body: string
}

export const SICILIANO_SECTORS: ReadonlyArray<SicilianoSector> = [
  {
    id: "industrial",
    label: "Industrial manipulation",
    body: "Multi-degree-of-freedom manipulators for assembly, machining and inspection lines, the substrate of every modern factory.",
  },
  {
    id: "service",
    label: "Service robotics",
    body: "Robots that share space with humans outside the factory: domestic, retail, hospitality, and assistive systems.",
  },
  {
    id: "aerial",
    label: "Aerial robotics",
    body: "UAVs and aerial manipulators, load-bearing flight under shared control. PRISMA pioneered tethered cooperative aerial manipulation.",
  },
  {
    id: "surgical",
    label: "Surgical robotics",
    body: "Tele-operated and shared-autonomy systems for needle insertion, suturing and tissue handling, the original test-bed for haptic active constraints.",
  },
  {
    id: "haptic",
    label: "Haptic shared control",
    body: "Low-bandwidth supervisory signals reshape a high-DOF autonomous controller into qualitatively different behaviours, the architectural primitive SYMPHONY transposes.",
  },
  {
    id: "hri",
    label: "Human–robot interaction",
    body: "The cognitive and communicative layer of shared autonomy: when to defer, when to ask, when to refuse, the auditability question SYMPHONY inherits.",
  },
  {
    id: "planning",
    label: "Motion planning",
    body: "Real-time path planning under contact constraints, the substrate that downstream control sits on top of.",
  },
]

export const SICILIANO_ARIA_LABEL =
  "Siciliano / PRISMA seven-sector rose, industrial manipulation, service, aerial, surgical, haptic shared control, human-robot interaction, motion planning. ERC Advanced Grant holder and Engelberger laureate; lab motto 'Keep the gradient'."

export const SICILIANO_CENTRE_LABEL = "PRISMA"
export const SICILIANO_CENTRE_MOTTO = "Keep the gradient."

export const SICILIANO_AWARDS_STRIP =
  "ERC ADVANCED GRANT  ·  ENGELBERGER AWARD  ·  CREATE / UNINA"
export const SICILIANO_AWARDS_BYLINE =
  "Bruno Siciliano · director, PRISMA Lab · O3 lead, SYMPHONY"

export const SICILIANO_DEFAULT_HINT =
  "PRISMA Lab spans seven domains of robotics. Hover any sector for the slice and what it brings to SYMPHONY. The haptic shared-control sector is the architectural primitive being transposed, the rest of the rose is the pedigree the lab brings to bear on it."
