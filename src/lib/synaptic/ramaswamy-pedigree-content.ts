/**
 * Sprint 8 — editable copy for the RamaswamyPedigree plate.
 */

export const RAMASWAMY_PEDIGREE_DISPLAY_NAME =
  "Ramaswamy Pedigree · Symphony"

export interface RamaswamyBeat {
  year: number
  label: string
  detail: string
  weight?: "primary" | "secondary"
}

export const RAMASWAMY_BEATS: ReadonlyArray<RamaswamyBeat> = [
  {
    year: 2005,
    label: "Blue Brain begins",
    detail:
      "EPFL launches the Blue Brain Project — the first attempt to reconstruct a cortical column at biological fidelity.",
  },
  {
    year: 2008,
    label: "PhD in computational neuroscience",
    detail:
      "Joins EPFL as a doctoral researcher on the digital reconstruction of microcircuits.",
    weight: "secondary",
  },
  {
    year: 2015,
    label: "Cortical-column reconstruction",
    detail:
      "Co-author on the first complete cortical-microcircuit reconstruction at biological scale — Cell, 2015.",
    weight: "primary",
  },
  {
    year: 2018,
    label: "Independent group",
    detail:
      "Establishes own group on biologically-grounded artificial neural networks.",
    weight: "secondary",
  },
  {
    year: 2022,
    label: "Mei · Muller · Ramaswamy",
    detail:
      "Trends in Neurosciences (2022) — the four-scale neuromodulatory framework that SYMPHONY transposes from continuous perceptual signals to discrete symbolic activations.",
    weight: "primary",
  },
  {
    year: 2024,
    label: "Newcastle chair",
    detail:
      "Takes the chair in Computational Neuroscience at Newcastle University's School of Computing.",
    weight: "secondary",
  },
  {
    year: 2026,
    label: "SYMPHONY · O2 lead",
    detail:
      "Leads Objective O2 — the implementation of the four-scale neuromodulatory mechanism on the substrate produced by O1. M18 decision milestone.",
    weight: "primary",
  },
]

export const RAMASWAMY_PEDIGREE_ARIA_LABEL =
  "Ramaswamy / Blue Brain pedigree — a timeline from 2005 to 2026 marking the Blue Brain Project, the 2015 cortical-microcircuit reconstruction, the 2022 Mei, Muller and Ramaswamy four-scale neuromodulation paper, and the 2026 SYMPHONY O2 lead."

export const RAMASWAMY_COLUMN_TOP_LABEL = "L1"
export const RAMASWAMY_COLUMN_BOTTOM_LABEL = "L6"
export const RAMASWAMY_COLUMN_KICKER = "CORTICAL COLUMN · L1–L6"

export const RAMASWAMY_NEUROMOD_BEAM_LABELS = ["Ach", "DA", "NE", "5-HT"] as const
export const RAMASWAMY_NEUROMOD_KICKER = "NEUROMODULATOR BEAMS"

export const RAMASWAMY_PEDIGREE_DEFAULT_HINT =
  "Two decades of biologically-grounded neuroscience, ending in SYMPHONY's O2. Hover any beat for the source and the role it plays in the proposal. Primary beats — Cell 2015, TINS 2022 — are the load-bearing citations."
