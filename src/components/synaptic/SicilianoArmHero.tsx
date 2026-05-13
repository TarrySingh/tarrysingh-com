"use client"

import { useState } from "react"

type Pose = {
  id: string
  label: string
  task: string
  body: string
  /** Joint angles for the four-link arm: shoulder, upper, fore, wrist */
  angles: [number, number, number, number]
  color: string
}

const POSES: ReadonlyArray<Pose> = [
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

const VW = 1400
const VH = 760

function armPath(
  cx: number,
  cy: number,
  a: readonly [number, number, number, number],
  lens: readonly [number, number, number, number] = [110, 130, 110, 60],
): { joints: { x: number; y: number }[]; path: string } {
  const joints: { x: number; y: number }[] = [{ x: cx, y: cy }]
  let curAngle = -90 // start pointing up
  let x = cx
  let y = cy
  for (let i = 0; i < a.length; i++) {
    curAngle += a[i]
    const rad = (curAngle * Math.PI) / 180
    x += lens[i] * Math.cos(rad)
    y += lens[i] * Math.sin(rad)
    joints.push({ x, y })
  }
  const path = joints.map((j, i) => `${i === 0 ? "M" : "L"} ${j.x} ${j.y}`).join(" ")
  return { joints, path }
}

export function SicilianoArmHero() {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string>("needle")
  const activeId = hover ?? pinned
  const active = POSES.find((p) => p.id === activeId) ?? POSES[0]

  const baseCx = 460
  const baseCy = 560

  const live = armPath(baseCx, baseCy, active.angles)

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
          aria-label="Siciliano arm hero — a four-link manipulator at the centre, with a low-bandwidth supervisory signal descending from above. Four task poses (needle grasp, dual-arm, teleoperated cut, aerial) show how a single controller adopts qualitatively distinct behaviours under a narrow scalar input. The architectural primitive SYMPHONY transposes."
        >
          <defs>
            <radialGradient id="syn-sa-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1a2154" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0a0b22" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="syn-sa-arm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={active.color} stopOpacity="1" />
              <stop offset="100%" stopColor={active.color} stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="syn-sa-supervisor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8b8ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#c8b8ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c8b8ff" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          <rect x={0} y={0} width={VW} height={VH} fill="url(#syn-sa-bg)" />

          {/* studio header */}
          <text
            x={60}
            y={42}
            fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
            fontSize={14}
            letterSpacing={4}
            fill="rgba(220,200,160,0.85)"
          >
            PLATE VIII · MMXXVI · CREATE / PRISMA · SICILIANO
          </text>
          <text
            x={60}
            y={76}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={36}
            fill="var(--ink)"
            letterSpacing={2}
          >
            One controller, four task behaviours
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
            HAPTIC SHARED CONTROL · ARCHITECTURAL PRIMARY
          </text>

          {/* supervisor channel (descending) */}
          <g>
            <text
              x={baseCx}
              y={138}
              textAnchor="middle"
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={12}
              letterSpacing={3}
              fill="rgba(200,184,255,0.85)"
            >
              SUPERVISOR · LOW-BANDWIDTH SCALAR
            </text>
            <rect
              x={baseCx - 4}
              y={148}
              width={8}
              height={140}
              fill="url(#syn-sa-supervisor)"
            />
            <line
              x1={baseCx}
              x2={baseCx}
              y1={148}
              y2={288}
              stroke="#c8b8ff"
              strokeOpacity={0.7}
              strokeWidth={1.4}
              strokeDasharray="6 4"
              className="syn-anim-ribbon"
            />
            <polygon
              points={`${baseCx - 8},290 ${baseCx + 8},290 ${baseCx},302`}
              fill="#c8b8ff"
              opacity={0.85}
            />
          </g>

          {/* arm — render ghosts of other poses faintly */}
          {POSES.map((p) => {
            if (p.id === active.id) return null
            const { path, joints } = armPath(baseCx, baseCy, p.angles)
            return (
              <g key={`ghost-${p.id}`} opacity={0.12}>
                <path d={path} stroke={p.color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {joints.map((j, i) => (
                  <circle key={i} cx={j.x} cy={j.y} r={4} fill={p.color} />
                ))}
              </g>
            )
          })}

          {/* base pedestal */}
          <rect x={baseCx - 36} y={baseCy + 4} width={72} height={20} rx={3} fill="#1a2150" stroke="rgba(200,184,255,0.4)" strokeWidth={1} />
          <rect x={baseCx - 50} y={baseCy + 22} width={100} height={10} rx={2} fill="#0d1027" stroke="rgba(200,184,255,0.3)" strokeWidth={0.8} />

          {/* live arm */}
          <g>
            <path
              d={live.path}
              fill="none"
              stroke="url(#syn-sa-arm)"
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* lighter outline for depth */}
            <path
              d={live.path}
              fill="none"
              stroke={active.color}
              strokeOpacity={0.6}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* joints */}
            {live.joints.map((j, i) => (
              <g key={i}>
                <circle cx={j.x} cy={j.y} r={i === 0 ? 0 : 11} fill="#0d1027" stroke={active.color} strokeWidth={2} />
                {i > 0 ? (
                  <circle cx={j.x} cy={j.y} r={4} fill={active.color} />
                ) : null}
              </g>
            ))}
            {/* end-effector marker */}
            {(() => {
              const tip = live.joints[live.joints.length - 1]
              return (
                <g>
                  <circle cx={tip.x} cy={tip.y} r={22} fill="none" stroke={active.color} strokeOpacity={0.5} strokeWidth={1.4} className="syn-anim-sweep" />
                  <circle cx={tip.x} cy={tip.y} r={10} fill={active.color} stroke="#0d1027" strokeWidth={2} />
                </g>
              )
            })()}
          </g>

          {/* task selector — right column */}
          <g transform="translate(880, 160)">
            <text
              x={0}
              y={0}
              fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
              fontSize={11}
              letterSpacing={3}
              fill="rgba(220,200,160,0.65)"
            >
              TASK TOKENS
            </text>
            {POSES.map((p, i) => {
              const isActive = activeId === p.id
              return (
                <g
                  key={`btn-${p.id}`}
                  transform={`translate(0, ${24 + i * 92})`}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setPinned(p.id)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={0}
                    y={0}
                    width={440}
                    height={76}
                    rx={8}
                    fill={isActive ? p.color : "transparent"}
                    fillOpacity={isActive ? 0.18 : 0}
                    stroke={p.color}
                    strokeOpacity={isActive ? 0.85 : 0.3}
                    strokeWidth={isActive ? 1.6 : 1}
                  />
                  <text
                    x={20}
                    y={32}
                    fontFamily="var(--font-display), Gloock, serif"
                    fontSize={22}
                    fill={isActive ? p.color : "var(--ink)"}
                    letterSpacing={1}
                  >
                    {p.label}
                  </text>
                  <text
                    x={20}
                    y={56}
                    fontFamily="var(--font-serif), 'IBM Plex Serif', serif"
                    fontStyle="italic"
                    fontSize={13}
                    fill={isActive ? "var(--ink-cool)" : "rgba(220,200,160,0.65)"}
                  >
                    {p.task}
                  </text>
                </g>
              )
            })}
          </g>

          {/* active task description band */}
          {(() => {
            const PX = 60
            const PW = VW - 2 * PX
            const PH = 150
            const PAD = 32
            const IW = PW - 2 * PAD
            return (
              <g transform={`translate(${PX}, ${VH - PH - 24})`}>
                <rect
                  x={0}
                  y={0}
                  width={PW}
                  height={PH}
                  rx={10}
                  fill="rgba(13,16,39,0.85)"
                  stroke={active.color}
                  strokeOpacity={0.55}
                  strokeWidth={1.2}
                />
                <text
                  x={PAD}
                  y={30}
                  fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
                  fontSize={12}
                  letterSpacing={3}
                  fill="rgba(220,200,160,0.65)"
                >
                  ν = {active.label.toUpperCase()}
                </text>
                <foreignObject x={PAD} y={50} width={IW} height={PH - 64}>
                  <div
                    style={{
                      fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                      fontSize: "15px",
                      lineHeight: 1.55,
                      color: "var(--ink-cool)",
                      wordWrap: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {active.body}
                  </div>
                </foreignObject>
              </g>
            )
          })()}
        </svg>
      </div>
    </figure>
  )
}
