/**
 * Sprint 8 — editable copy for the UpRoboticsFactoryHero plate.
 * Every user-facing string in src/components/synaptic/UpRoboticsFactoryHero.tsx
 * reads from this module.
 */

export const UPROBOTICS_DISPLAY_NAME = "UP Robotics Factory Hero · Symphony"

export const UPROBOTICS_ARIA_LABEL =
  "UP Robotics factory hero — an industrial-automation cell on the left, with four data streams (PLC code, robot programs, SCADA configs, maintenance logs) flowing into the SYMPHONY substrate on the right. The codebase that the O1 pipeline and the O4 benchmark have to survive contact with."

export const UPROBOTICS_KICKER = "UP ROBOTICS · ZAGREB · INDUSTRIAL DEMONSTRATOR"
export const UPROBOTICS_TITLE = "The codebase that survives contact"
export const UPROBOTICS_EVAL_LABEL = "O1 CORPUS · O4 EVALUATION HALF"
export const UPROBOTICS_CABINET_LABEL = "PLC CABINET"
export const UPROBOTICS_MANIPULATOR_LABEL = "MANIPULATOR CELL"
export const UPROBOTICS_LINE_LABEL = "LINE"
export const UPROBOTICS_SUBSTRATE_LABEL = "SYMPHONY SUBSTRATE"
export const UPROBOTICS_SUBSTRATE_CAPTION = "Half of the held-out task instances · O4"

export type UpRoboticsStream = {
  id: string
  label: string
  detail: string
  body: string
  /** Stream colour. Code-owned. */
  color: string
  /** y position of the entry into the substrate (centre). Code-owned. */
  y: number
}

export const UPROBOTICS_STREAMS: ReadonlyArray<UpRoboticsStream> = [
  {
    id: "plc",
    label: "PLC code",
    detail: "ladder logic · IEC 61131-3",
    body: "Ladder diagrams, structured text and function block diagrams from the programmable-logic controllers that run the line. Decades of authorship, rare in-line comments, and the constraint that the system must be predictable in real time.",
    color: "#f4c482",
    y: 280,
  },
  {
    id: "robot",
    label: "Robot programs",
    detail: "manipulator · cell · gripper",
    body: "Robot-program files for the manipulators and end-effectors — motion routines, path libraries, calibration files. Often vendor-specific dialects (KRL · KAREL · RAPID · URScript), often touched by many engineers over a system's life.",
    color: "#e5a896",
    y: 380,
  },
  {
    id: "scada",
    label: "SCADA configs",
    detail: "supervisory · HMI · alarms",
    body: "Supervisory-control configurations, HMI screens, alarm databases, historian tags. The layer that operators see — the one that survives engineer turnover but rarely gets documentation.",
    color: "#6cb4c2",
    y: 480,
  },
  {
    id: "logs",
    label: "Maintenance logs",
    detail: "events · faults · repairs",
    body: "Years of maintenance-engineer log entries — fault descriptions, repair notes, replacement-part references. The closest thing the system has to its own rationale layer; supplies half of the O4 held-out task instances.",
    color: "#a698d4",
    y: 580,
  },
]
