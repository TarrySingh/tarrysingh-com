import {
  CHIP_ANNOTATIONS,
  CHIP_CB0,
  CHIP_CB1,
  CHIP_INTENSITIES,
  CHIP_N,
  CHIP_STEP,
} from "@/lib/synaptic/chipplate-data"

type ChipPlateProps = {
  className?: string
}

export function ChipPlate({ className = "" }: ChipPlateProps) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label="MEMPHIS chip plate — a ceramic-substrate hippocampal-memristive die. A 22×22 memristor crossbar with a CA3↔CA1 module at its centre, amber on the warm flank, rose on the cool flank, six annotation anchors naming the architectural elements."
    >
      <defs>
        <radialGradient id="syn-chip-halo-teal" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#6cb6c4" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#3e7b8c" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0c1828" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="syn-chip-halo-amber" cx="50%" cy="50%" r="30%">
          <stop offset="0%" stopColor="#ffd296" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#c98e4f" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0c1828" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="syn-chip-ceramic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8d6ae" />
          <stop offset="100%" stopColor="#c8b48a" />
        </linearGradient>
      </defs>

      {/* outer halo */}
      <rect x={0} y={0} width={1000} height={1000} fill="url(#syn-chip-halo-teal)" />

      {/* ceramic substrate */}
      <rect
        x={110}
        y={110}
        width={780}
        height={780}
        rx={24}
        fill="url(#syn-chip-ceramic)"
        stroke="#a89676"
        strokeWidth={2}
      />

      {/* inner bevel */}
      <rect
        x={126}
        y={126}
        width={748}
        height={748}
        rx={18}
        fill="none"
        stroke="rgba(140,118,82,0.6)"
        strokeWidth={1}
      />

      {/* engravings on the ceramic */}
      <text
        x={160}
        y={158}
        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
        fontSize={11}
        fill="rgba(90,70,48,0.9)"
      >
        MEMPHIS  Rev.A  ·  NMR-01
      </text>
      <text
        x={840}
        y={158}
        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
        fontSize={11}
        fill="rgba(90,70,48,0.9)"
        textAnchor="end"
      >
        v · ii
      </text>
      <text
        x={160}
        y={852}
        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
        fontSize={11}
        fill="rgba(90,70,48,0.9)"
      >
        LOT  2026 / IV
      </text>
      <text
        x={840}
        y={852}
        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
        fontSize={11}
        fill="rgba(90,70,48,0.9)"
        textAnchor="end"
      >
        CA3·CA1  HIPPOCAMPAL CORE
      </text>

      {/* contact pads — 22 on each of the four edges */}
      {Array.from({ length: CHIP_N }).map((_, i) => {
        const tt = (i + 0.5) / CHIP_N
        const x = 110 + tt * 780
        const y = 110 + tt * 780
        return (
          <g key={`pads-${i}`}>
            <rect x={x - 8} y={116} width={16} height={8} fill="#97805c" stroke="#5a4a32" strokeWidth={0.6} />
            <rect x={x - 8} y={876} width={16} height={8} fill="#97805c" stroke="#5a4a32" strokeWidth={0.6} />
            <rect x={116} y={y - 5} width={8} height={10} fill="#97805c" stroke="#5a4a32" strokeWidth={0.6} />
            <rect x={876} y={y - 5} width={8} height={10} fill="#97805c" stroke="#5a4a32" strokeWidth={0.6} />
          </g>
        )
      })}

      {/* silicon die */}
      <rect x={200} y={200} width={600} height={600} rx={10} fill="#102030" stroke="#2c4458" strokeWidth={2} />
      <rect x={210} y={210} width={580} height={580} rx={8} fill="none" stroke="rgba(60,90,118,0.8)" strokeWidth={1} />

      {/* crossbar backing */}
      <rect
        x={CHIP_CB0 - 18}
        y={CHIP_CB0 - 18}
        width={CHIP_CB1 - CHIP_CB0 + 36}
        height={CHIP_CB1 - CHIP_CB0 + 36}
        rx={6}
        fill="#101c2c"
        stroke="rgba(60,94,120,0.9)"
        strokeWidth={1}
      />

      {/* vertical bitlines (teal) */}
      {Array.from({ length: CHIP_N }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={CHIP_CB0 + i * CHIP_STEP}
          y1={CHIP_CB0}
          x2={CHIP_CB0 + i * CHIP_STEP}
          y2={CHIP_CB1}
          stroke="#468ca0"
          strokeOpacity={0.75}
          strokeWidth={1}
        />
      ))}

      {/* horizontal wordlines (gold) */}
      {Array.from({ length: CHIP_N }).map((_, j) => (
        <line
          key={`h-${j}`}
          x1={CHIP_CB0}
          y1={CHIP_CB0 + j * CHIP_STEP}
          x2={CHIP_CB1}
          y2={CHIP_CB0 + j * CHIP_STEP}
          stroke="#b89256"
          strokeOpacity={0.88}
          strokeWidth={1}
        />
      ))}

      {/* module halo */}
      <circle cx={500} cy={500} r={120} fill="url(#syn-chip-halo-amber)" />

      {/* memristor nodes — warm inside the CA3↔CA1 module, cool outside */}
      {CHIP_INTENSITIES.map((row, j) =>
        row.map((v, i) => {
          const x = CHIP_CB0 + i * CHIP_STEP
          const y = CHIP_CB0 + j * CHIP_STEP
          const r = Math.round(232 * (1 - v.warmT) + 229 * v.warmT)
          const g = Math.round(184 * (1 - v.warmT) + 168 * v.warmT)
          const b = Math.round(122 * (1 - v.warmT) + 150 * v.warmT)
          if (v.inModule) {
            const rad = 2 + v.base * 2.8
            return (
              <g key={`n-${i}-${j}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={rad * 2}
                  fill={`rgb(${r},${g},${b})`}
                  opacity={0.14 + v.base * 0.18}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={rad}
                  fill={`rgb(${r},${g},${b})`}
                  opacity={0.75 + v.base * 0.25}
                />
              </g>
            )
          }
          const rad = 1.5 + v.base * 1.4
          const rr = Math.round(70 + 140 * v.base)
          const gg = Math.round(100 + 80 * v.base)
          const bb = Math.round(120 + 40 * v.base)
          return (
            <circle
              key={`n-${i}-${j}`}
              cx={x}
              cy={y}
              r={rad}
              fill={`rgb(${rr},${gg},${bb})`}
              opacity={0.55 + v.base * 0.35}
            />
          )
        }),
      )}

      {/* module frame (200×200 amber border at die centre) */}
      <rect
        x={500 - 100}
        y={500 - 100}
        width={200}
        height={200}
        fill="none"
        stroke="#e8b87a"
        strokeOpacity={0.65}
        strokeWidth={1}
      />

      {/* module cartouche */}
      <g>
        <rect
          x={500 - 82}
          y={370}
          width={164}
          height={26}
          rx={2}
          fill="#0d1a2a"
          stroke="#e8b87a"
          strokeOpacity={0.7}
          strokeWidth={1}
        />
        <text
          x={500}
          y={388}
          textAnchor="middle"
          fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
          fontSize={11}
          letterSpacing={2}
          fill="#e8b87a"
        >
          CA3 ↔ CA1  MODULE
        </text>
      </g>

      {/* corner sigils */}
      {[
        [230, 230],
        [770, 230],
        [230, 770],
        [770, 770],
      ].map(([px, py], i) => (
        <g
          key={`sig-${i}`}
          stroke="#c98e4f"
          strokeOpacity={0.8}
          strokeWidth={1}
          fill="none"
        >
          <line x1={px - 10} y1={py} x2={px + 10} y2={py} />
          <line x1={px} y1={py - 10} x2={px} y2={py + 10} />
          <circle cx={px} cy={py} r={3} />
        </g>
      ))}

      {/* annotation anchors (six hotspots) */}
      {CHIP_ANNOTATIONS.map((a) => (
        <g key={a.id}>
          <circle
            cx={a.anchor.x}
            cy={a.anchor.y}
            r={6}
            fill="#e8b87a"
            stroke="#c98e4f"
            strokeWidth={1.5}
          />
          <text
            x={a.anchor.x + 12}
            y={a.anchor.y - 6}
            fontFamily="var(--font-display), Gloock, serif"
            fontSize={14}
            fill="#f6ead0"
          >
            {a.id}
          </text>
        </g>
      ))}
    </svg>
  )
}
