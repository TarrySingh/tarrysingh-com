"use client"

import { useState } from "react"

type Stream = {
  id: string
  label: string
  detail: string
  body: string
  color: string
  /** y position of the entry into the substrate (centre) */
  y: number
}

const STREAMS: ReadonlyArray<Stream> = [
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

const VW = 1400
const VH = 760

export function UpRoboticsFactoryHero() {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string>("logs")
  const activeId = hover ?? pinned
  const active = STREAMS.find((s) => s.id === activeId) ?? STREAMS[3]

  // Substrate centre — the destination of the streams
  const subCx = 1000
  const subCy = 430

  return (
    <figure className="syn-symphony">
      <div
        className="rounded-[var(--radius-card)] border"
        style={{
          borderColor: "rgba(200,180,255,0.22)",
          background:
            "linear-gradient(180deg, rgba(28,38,80,0.92), rgba(14,20,45,0.96))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-auto w-full"
          role="img"
          aria-label="UP Robotics factory hero — an industrial-automation cell on the left, with four data streams (PLC code, robot programs, SCADA configs, maintenance logs) flowing into the SYMPHONY substrate on the right. The codebase that the O1 pipeline and the O4 benchmark have to survive contact with."
        >
          <defs>
            <radialGradient id="syn-up-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1a2154" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="syn-up-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c2058" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="syn-up-arm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a89676" stopOpacity="1" />
              <stop offset="100%" stopColor="#5a4632" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="syn-up-substrate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c8b8ff" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#a698d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5a4a8a" stopOpacity="0" />
            </radialGradient>
            {STREAMS.map((s) => (
              <linearGradient key={`gr-${s.id}`} id={`syn-up-flow-${s.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={s.color} stopOpacity="0" />
                <stop offset="25%" stopColor={s.color} stopOpacity="0.75" />
                <stop offset="75%" stopColor={s.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-up-bg)" />

          {/* header */}
          <text
            x={60}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={14}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            UP ROBOTICS · ZAGREB · INDUSTRIAL DEMONSTRATOR
          </text>
          <text
            x={60}
            y={76}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={36}
            fill="var(--ink)"
            letterSpacing={2}
          >
            The codebase that survives contact
          </text>
          <line x1={60} x2={VW - 60} y1={92} y2={92} stroke="rgba(220,200,160,0.35)" strokeWidth={0.8} />
          <text
            x={VW - 60}
            y={42}
            textAnchor="end"
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={12}
            letterSpacing={3}
            fill="rgba(220,200,160,0.7)"
          >
            O1 CORPUS · O4 EVALUATION HALF
          </text>

          {/* factory floor (left side) */}
          <g transform="translate(140, 200)">
            {/* floor base */}
            <rect x={0} y={300} width={520} height={36} fill="url(#syn-up-floor)" stroke="rgba(200,184,255,0.4)" strokeWidth={1} />
            {Array.from({ length: 14 }).map((_, k) => (
              <line
                key={`floor-${k}`}
                x1={20 + k * 36}
                x2={20 + k * 36}
                y1={300}
                y2={336}
                stroke="rgba(200,184,255,0.18)"
                strokeWidth={0.8}
              />
            ))}

            {/* control cabinet (left) */}
            <g transform="translate(20, 60)">
              <rect x={0} y={0} width={130} height={240} fill="#0d1027" stroke="rgba(200,184,255,0.45)" strokeWidth={1.2} />
              <rect x={6} y={6} width={118} height={228} fill="none" stroke="rgba(200,184,255,0.2)" strokeWidth={0.8} />
              {/* status leds */}
              {[20, 38, 56].map((y) => (
                <circle key={y} cx={20} cy={y} r={3} fill={y === 38 ? "#f4c482" : "rgba(108,180,194,0.7)"} />
              ))}
              {/* relay grid */}
              {Array.from({ length: 6 }).map((_, j) =>
                Array.from({ length: 4 }).map((_, i) => (
                  <rect
                    key={`relay-${i}-${j}`}
                    x={36 + i * 22}
                    y={20 + j * 22}
                    width={16}
                    height={16}
                    fill="rgba(108,180,194,0.18)"
                    stroke="rgba(108,180,194,0.5)"
                    strokeWidth={0.6}
                  />
                )),
              )}
              {/* ladder rungs */}
              {Array.from({ length: 5 }).map((_, k) => (
                <g key={`rung-${k}`} transform={`translate(20, ${168 + k * 14})`}>
                  <line x1={0} x2={90} y1={0} y2={0} stroke="rgba(244,196,130,0.55)" strokeWidth={1} />
                  <rect x={28} y={-3} width={10} height={6} fill="rgba(244,196,130,0.55)" />
                  <rect x={56} y={-3} width={4} height={6} fill="rgba(244,196,130,0.7)" />
                </g>
              ))}
              <text
                x={65}
                y={258}
                textAnchor="middle"
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={10}
                letterSpacing={2.5}
                fill="rgba(220,200,160,0.7)"
              >
                PLC CABINET
              </text>
            </g>

            {/* robot arm (centre-left) */}
            <g transform="translate(220, 110)">
              {/* base */}
              <rect x={-32} y={170} width={64} height={26} rx={3} fill="url(#syn-up-arm)" stroke="rgba(120,98,68,0.65)" strokeWidth={1} />
              <rect x={-44} y={196} width={88} height={6} fill="#0d1027" />
              {/* shoulder pivot */}
              <circle cx={0} cy={170} r={10} fill="#0d1027" stroke="rgba(168,150,118,0.85)" strokeWidth={2} />
              {/* upper arm */}
              <line x1={0} y1={170} x2={70} y2={70} stroke="url(#syn-up-arm)" strokeWidth={14} strokeLinecap="round" />
              <circle cx={70} cy={70} r={8} fill="#0d1027" stroke="rgba(168,150,118,0.85)" strokeWidth={2} />
              {/* forearm */}
              <line x1={70} y1={70} x2={150} y2={40} stroke="url(#syn-up-arm)" strokeWidth={11} strokeLinecap="round" />
              <circle cx={150} cy={40} r={7} fill="#0d1027" stroke="rgba(168,150,118,0.85)" strokeWidth={2} />
              {/* wrist + end effector */}
              <line x1={150} y1={40} x2={186} y2={64} stroke="url(#syn-up-arm)" strokeWidth={8} strokeLinecap="round" />
              <rect x={180} y={56} width={14} height={20} fill="#0d1027" stroke="rgba(168,150,118,0.85)" strokeWidth={1} />
              <line x1={183} y1={76} x2={183} y2={84} stroke="#a89676" strokeWidth={2} />
              <line x1={191} y1={76} x2={191} y2={84} stroke="#a89676" strokeWidth={2} />
              <text
                x={80}
                y={222}
                textAnchor="middle"
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={10}
                letterSpacing={2.5}
                fill="rgba(220,200,160,0.7)"
              >
                MANIPULATOR CELL
              </text>
            </g>

            {/* conveyor (right) */}
            <g transform="translate(450, 240)">
              <rect x={0} y={20} width={70} height={16} fill="#1c2058" stroke="rgba(108,180,194,0.55)" strokeWidth={1} />
              <circle cx={4} cy={28} r={6} fill="#0d1027" stroke="rgba(108,180,194,0.65)" strokeWidth={1.2} />
              <circle cx={66} cy={28} r={6} fill="#0d1027" stroke="rgba(108,180,194,0.65)" strokeWidth={1.2} />
              {/* widget on belt */}
              <rect x={28} y={10} width={14} height={14} rx={2} fill="rgba(244,196,130,0.8)" />
              <text
                x={35}
                y={56}
                textAnchor="middle"
                fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                fontSize={10}
                letterSpacing={2.5}
                fill="rgba(220,200,160,0.7)"
              >
                LINE
              </text>
            </g>
          </g>

          {/* four data streams flowing from factory into substrate */}
          {STREAMS.map((s) => {
            const isActive = activeId === s.id
            const startX = 660
            const endX = subCx - 90
            const cpX = (startX + endX) / 2
            const cpY = (s.y + subCy) / 2
            const dashed = `M ${startX} ${s.y} Q ${cpX} ${cpY} ${endX} ${subCy}`
            return (
              <g
                key={s.id}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setPinned(s.id)}
                style={{ cursor: "pointer" }}
              >
                {/* wide hit zone */}
                <path d={dashed} fill="none" stroke="transparent" strokeWidth={36} />
                <path
                  d={dashed}
                  fill="none"
                  stroke={`url(#syn-up-flow-${s.id})`}
                  strokeWidth={isActive ? 18 : 10}
                  opacity={isActive ? 1 : 0.7}
                />
                <path
                  d={dashed}
                  fill="none"
                  stroke={s.color}
                  strokeOpacity={isActive ? 0.95 : 0.55}
                  strokeWidth={1.4}
                  strokeDasharray={isActive ? "0" : "6 5"}
                  className={isActive ? "syn-anim-ribbon" : undefined}
                />
                {/* origin dot at the factory */}
                <circle cx={startX} cy={s.y} r={isActive ? 10 : 6} fill={s.color} stroke="#0d1027" strokeWidth={2} />
                {/* stream label near origin */}
                <text
                  x={startX + 16}
                  y={s.y - 8}
                  fontFamily="var(--font-display), Gloock, serif"
                  fontSize={isActive ? 20 : 17}
                  fill={isActive ? s.color : "var(--ink)"}
                  letterSpacing={0.5}
                >
                  {s.label}
                </text>
                <text
                  x={startX + 16}
                  y={s.y + 12}
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={2}
                  fill="rgba(220,200,160,0.6)"
                >
                  {s.detail.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* substrate destination — a stylised pulsing node */}
          <g>
            <circle cx={subCx} cy={subCy} r={110} fill="url(#syn-up-substrate)" />
            <circle cx={subCx} cy={subCy} r={80} fill="#0d1027" stroke="rgba(200,184,255,0.6)" strokeWidth={1.5} />
            <circle cx={subCx} cy={subCy} r={62} fill="none" stroke="rgba(200,184,255,0.35)" strokeWidth={1} />
            <circle cx={subCx} cy={subCy} r={44} fill="none" stroke="rgba(200,184,255,0.25)" strokeWidth={0.8} />
            <circle cx={subCx} cy={subCy} r={26} fill="rgba(166,152,212,0.5)" />
            <circle cx={subCx} cy={subCy} r={12} fill="#c8b8ff" />
            <text
              x={subCx}
              y={subCy - 100}
              textAnchor="middle"
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(200,184,255,0.85)"
            >
              SYMPHONY SUBSTRATE
            </text>
            <text
              x={subCx}
              y={subCy + 132}
              textAnchor="middle"
              fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
              fontStyle="italic"
              fontSize={14}
              fill="rgba(220,200,160,0.7)"
            >
              Half of the held-out task instances · O4
            </text>
          </g>

          {/* active stream detail card */}
          <g transform={`translate(60, ${VH - 110})`}>
            <rect
              x={0}
              y={0}
              width={VW - 120}
              height={90}
              rx={10}
              fill="rgba(13,16,39,0.7)"
              stroke={active.color}
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />
            <text
              x={28}
              y={32}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              STREAM · {active.label.toUpperCase()}
            </text>
            <text
              x={28}
              y={60}
              fontFamily="var(--font-display), Gloock, serif"
              fontSize={22}
              fill={active.color}
              letterSpacing={1}
            >
              {active.detail}
            </text>
            <foreignObject x={28} y={68} width={VW - 200} height={42}>
              <div
                style={{
                  fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                  fontSize: "14px",
                  lineHeight: 1.45,
                  color: "var(--ink-cool)",
                }}
              >
                {active.body}
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>
    </figure>
  )
}
