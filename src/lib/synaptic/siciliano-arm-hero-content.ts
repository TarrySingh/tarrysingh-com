/**
 * Sprint 8 — editable copy for the SicilianoArmHero plate.
 */

export const SICILIANO_ARM_DISPLAY_NAME = "Siciliano Arm Hero · Symphony"

export interface SicilianoPose {
  id: string
  label: string
  task: string
  body: string
  /** Joint angles for the four-link arm: shoulder, upper, fore, wrist. Code-owned. */
  angles: [number, number, number, number]
  /** Hex string. Code-owned. */
  color: string
}

export const SICILIANO_POSES: ReadonlyArray<SicilianoPose> = [
  {
    id: "needle",
    label: "Needle grasp",
    task: "Surgical · low-force pickup",
    body: "Active constraints prevent contact above 0.5 N at the tip. The autonomous controller plans the trajectory; the supervisor's narrow scalar caps the force budget.",
    angles: [-10, 20, 60, -30],
    color: "#f4c482",
  },
  {
    id: "dual",
    label: "Dual-arm manipulation",
    task: "Industrial · coordinated grasp",
    body: "Two high-DOF arms slaved to a single descending signal — the supervisor names the coordination frame, not the individual joint targets.",
    angles: [10, -20, 80, 40],
    color: "#e5a896",
  },
  {
    id: "cut",
    label: "Teleoperated cut",
    task: "Surgical · gated motion",
    body: "Cutting motion gated by a haptic operator — autonomous trajectory blends with a real-time corrective input, producing safe progress through tissue.",
    angles: [-20, 50, -30, 20],
    color: "#6cb4c2",
  },
  {
    id: "uav",
    label: "Aerial manipulation",
    task: "UAV · load-bearing flight",
    body: "Tethered cooperative aerial manipulation — a flight controller adapts to a payload it cannot fully measure under a low-bandwidth admittance signal.",
    angles: [-30, -40, -50, -10],
    color: "#a698d4",
  },
]

export const SICILIANO_ARM_ARIA_LABEL =
  "Siciliano arm hero — a four-link manipulator at the centre, with a low-bandwidth supervisory signal descending from above. Four task poses (needle grasp, dual-arm, teleoperated cut, aerial) show how a single controller adopts qualitatively distinct behaviours under a narrow scalar input. The architectural primitive SYMPHONY transposes."

export const SICILIANO_ARM_KICKER = "PLATE VIII · MMXXVI · CREATE / PRISMA · SICILIANO"
export const SICILIANO_ARM_TITLE = "One controller, four task behaviours"
export const SICILIANO_ARM_BANNER = "HAPTIC SHARED CONTROL · ARCHITECTURAL PRIMARY"

export const SICILIANO_ARM_SUPERVISOR_LABEL = "SUPERVISOR · LOW-BANDWIDTH SCALAR"
export const SICILIANO_ARM_TASKS_LABEL = "TASK TOKENS"
