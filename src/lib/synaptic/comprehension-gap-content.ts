/**
 * Sprint 8 — editable copy for the ComprehensionGap plate.
 * Every user-facing string in src/components/synaptic/ComprehensionGap.tsx
 * reads from this module.
 */

export const COMPREHENSION_DISPLAY_NAME = "Comprehension Gap · Symphony"

export const COMPREHENSION_ARIA_LABEL =
  "The comprehension gap, software-system complexity grows roughly exponentially from 1970 to 2030 while individual human comprehension capacity stays nearly flat."

export const COMPREHENSION_PLATE_MARKER = "PLATE IV · MMXXVI · FIG. 1.2.a"
export const COMPREHENSION_HEADER_EYEBROW = "COMPLEXITY × COMPREHENSION · 1970 → 2030"
export const COMPREHENSION_TITLE = "The comprehension gap"
export const COMPREHENSION_LOG_SCALE_LABEL = "LOG SCALE"
export const COMPREHENSION_LEGEND_COMPLEXITY = "SYSTEM COMPLEXITY"
export const COMPREHENSION_LEGEND_COMPREHENSION = "HUMAN COMPREHENSION"
export const COMPREHENSION_LEGEND_GAP = "THE GAP"
export const COMPREHENSION_PANEL_YEAR_PREFIX = "YEAR · "
export const COMPREHENSION_PANEL_COMPLEXITY_LABEL = "COMPLEXITY"
export const COMPREHENSION_PANEL_COMPREHENSION_LABEL = "COMPREHENSION"
export const COMPREHENSION_FOOTER =
  "SYMPHONY closes the gap not by enlarging the engineer, but by reshaping the substrate they navigate."

export type Era = {
  /** Code-owned. */
  year: number
  /** Code-owned. */
  complexity: number
  /** Code-owned. */
  comprehension: number
  era: string
  detail: string
  source?: string
}

export const COMPREHENSION_ERAS: ReadonlyArray<Era> = [
  {
    year: 1970,
    complexity: 1,
    comprehension: 1,
    era: "Structured programming",
    detail:
      "A single author can hold the whole system in their head. ALGOL, early Pascal, IBM mainframe departments of ~10 engineers.",
    source: "Brooks · The Mythical Man-Month · 1975",
  },
  {
    year: 1980,
    complexity: 5.6,
    comprehension: 1.1,
    era: "Modularity",
    detail:
      "C, early C++, Unix tools, module systems. Teams of dozens. The first time the codebase outruns any one person.",
  },
  {
    year: 1990,
    complexity: 32,
    comprehension: 1.15,
    era: "Object orientation",
    detail:
      "Smalltalk, C++, Java. Class hierarchies grow faster than the people maintaining them. Architecture-recovery research begins.",
    source: "Avgeriou et al. · 2007",
  },
  {
    year: 2000,
    complexity: 180,
    comprehension: 1.2,
    era: "Open source · web stacks",
    detail:
      "Hundreds of dependencies per project. The composability problem and the readability problem split.",
  },
  {
    year: 2010,
    complexity: 1000,
    comprehension: 1.25,
    era: "Microservices · cloud",
    detail:
      "The readable subsystem disappears. A request crosses a dozen services, none of which any single engineer fully owns.",
  },
  {
    year: 2020,
    complexity: 5700,
    comprehension: 1.28,
    era: "LLM coding agents",
    detail:
      "GitHub Copilot, then everything else. Code-completion ubiquitous; comprehension of unfamiliar code still hard.",
  },
  {
    year: 2025,
    complexity: 16000,
    comprehension: 1.3,
    era: "The ceiling becomes visible",
    detail:
      "Claude Opus 4.5 crosses 80 % SWE-bench Verified · ICSE 2025 / ICLR 2026 re-evaluations collapse the same numbers to single digits and 30 %.",
    source: "ICSE 2025 Companion · ICLR 2026 SWE-Bench+",
  },
  {
    year: 2026,
    complexity: 22600,
    comprehension: 1.31,
    era: "SYMPHONY enters",
    detail:
      "EIC Pathfinder 2026. Neuromimetic knowledge substrate begins, not a scaling bet but an architectural one.",
  },
  {
    year: 2030,
    complexity: 45000,
    comprehension: 1.32,
    era: "Projection",
    detail:
      "If the trend holds, software complexity reaches 45 000× the 1970 baseline. Human comprehension is essentially unchanged. The substrate is either the bridge by then or the gap is permanent.",
  },
]
