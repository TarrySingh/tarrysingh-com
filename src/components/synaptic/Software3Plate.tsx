/**
 * Software3Plate — the cover plate for "Software 3.0 · the age of hyper-automation".
 *
 * A self-contained, museum-grade folio in the essay's warm amber / copper
 * palette, built to sit beside the CHOKEPOINT and ENGINE ROOM plates. The
 * central instrument is a planisphere of the automated future: three concentric
 * era rings (1.0 code · 2.0 weights · 3.0 intent), a luminous hand sweeping to a
 * 2040 apex with streaming tokens, and six constellation nodes pinned to real
 * figures from the essay. A "three eras" panel, a tagline, and a baked plate
 * footer. Portrait 4:5 so it fills both the /synaptic carousel slot and the
 * homepage Studio card. The card adds no overlay — the plate carries its own
 * ENTER footer.
 *
 * Decorative; aria-labelled. Figures are the essay's, mapped to 2040.
 */

const AMBER = "#e8a44a"
const AMBER_HI = "#f4c482"
const COPPER = "#c2691c"
const GOLD = "#f6cf8f"
const CYAN = "#6cc6e6"
const INK = "#f6ead0"
const DIM = "#9a8b76"

function P(cx: number, cy: number, r: number, deg: number) {
  const a = (deg - 90) * (Math.PI / 180)
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
}

const CX = 500
const CY = 621
const RMAX = 258

// three era rings (outer 1.0 · mid 2.0 · inner 3.0)
const ERAS = [
  { r: 236, label: "SOFTWARE 1.0", sub: "code", dash: "1 6" },
  { r: 168, label: "SOFTWARE 2.0", sub: "weights", dash: "1 5" },
  { r: 100, label: "SOFTWARE 3.0", sub: "intent", dash: "" },
] as const

// the apex — the future the dial is set to
const APEX = P(CX, CY, 236, 0)

// labelled constellation nodes, each a real figure from the essay
const NODES = [
  // right half
  { deg: 40, r: 214, side: "R", ly: 452, name: "LLMFLATION", val: "~1000× / 3 yr", c: AMBER_HI },
  { deg: 74, r: 256, side: "R", ly: 566, name: "THE TOKEN FLOOD", val: "~24× by 2030", c: GOLD },
  { deg: 112, r: 214, side: "R", ly: 680, name: "OFF-WORLD COMPUTE", val: "trained in orbit", c: CYAN },
  // left half
  { deg: -40, r: 214, side: "L", ly: 452, name: "THE ZERO-PERSON FIRM", val: "one → none", c: AMBER_HI },
  { deg: -74, r: 256, side: "L", ly: 566, name: "THE GENOME", val: "read 10⁷ cheaper", c: GOLD },
  { deg: -112, r: 214, side: "L", ly: 680, name: "HUMANOID LABOUR", val: "screen → world", c: COPPER },
] as const

const SCATTER = [
  [60, -160], [140, -90], [220, 40], [96, 150], [180, -30],
  [-70, -150], [-150, -80], [-220, 60], [-110, 140], [-190, -20],
  [24, 210], [-30, -220], [250, -70], [-250, -60],
] as const

const RINGS = [72, 132, 196, 244]
const AXIS = [0, 45, 90, 135, 180, 225, 270, 315]

export function Software3Plate({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1250"
      className={className}
      role="img"
      aria-label="Software 3.0, a folio plate: a planisphere of the automated future, three era rings dialled to a luminous 2040 apex, ringed by six figures from the essay."
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="s3-bg" cx="50%" cy="43%" r="76%">
          <stop offset="0%" stopColor="#271a33" />
          <stop offset="40%" stopColor="#180f24" />
          <stop offset="74%" stopColor="#0e0916" />
          <stop offset="100%" stopColor="#07050d" />
        </radialGradient>
        <radialGradient id="s3-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={AMBER_HI} stopOpacity="0.95" />
          <stop offset="44%" stopColor={AMBER} stopOpacity="0.30" />
          <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s3-hand" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={COPPER} stopOpacity="0" />
          <stop offset="30%" stopColor={AMBER} stopOpacity="0.9" />
          <stop offset="100%" stopColor={AMBER_HI} stopOpacity="1" />
        </linearGradient>
        <radialGradient id="s3-vig" cx="50%" cy="47%" r="63%">
          <stop offset="62%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      <rect width="1000" height="1250" fill="url(#s3-bg)" />

      {/* folio frame */}
      <rect x="26" y="26" width="948" height="1198" fill="none" stroke={AMBER} strokeOpacity="0.16" strokeWidth="1" />
      <rect x="33" y="33" width="934" height="1184" fill="none" stroke={COPPER} strokeOpacity="0.12" strokeWidth="0.6" />

      {/* ── top header ── */}
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }} fill={DIM}>
        <text x="54" y="64" fontSize="13" letterSpacing="3">PLATE III · MMXXVI</text>
        <text x="946" y="64" textAnchor="end" fontSize="13" letterSpacing="3">FIG. 1.2</text>
        <text x="54" y="82" fontSize="9.5" letterSpacing="2" opacity="0.7">ANNO 2026 · FOLIO III</text>
        <text x="946" y="82" textAnchor="end" fontSize="9.5" letterSpacing="2" opacity="0.7">THE AUTOMATED FUTURE</text>
      </g>

      {/* ── title block ── */}
      <text x="500" y="138" textAnchor="middle" fill={AMBER} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="12.5" letterSpacing="5.5">
        A PLANISPHERE OF THE AUTOMATED FUTURE
      </text>
      <text x="500" y="206" textAnchor="middle" fill={INK} style={{ fontFamily: "'Gloock', 'Italiana', Georgia, serif" }} fontSize="66" letterSpacing="2">
        SOFTWARE 3.0
      </text>
      <text x="500" y="246" textAnchor="middle" fill="#ecdcc0" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="20">
        The most plausible breathtaking future, mapped to 2040.
      </text>

      {/* rule + the three eras */}
      <line x1="190" y1="284" x2="360" y2="284" stroke={AMBER} strokeOpacity="0.28" strokeWidth="0.8" />
      <line x1="640" y1="284" x2="810" y2="284" stroke={AMBER} strokeOpacity="0.28" strokeWidth="0.8" />
      <text x="500" y="289" textAnchor="middle" fill={DIM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11" letterSpacing="3.5">
        THE THREE ERAS OF SOFTWARE
      </text>
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11.5" letterSpacing="2.5">
        <rect x="300" y="306" width="400" height="30" rx="15" fill="none" stroke={AMBER} strokeOpacity="0.3" />
        <text x="500" y="326" textAnchor="middle" fill="#eeddc2">
          CODE&#160;&#160;◇&#160;&#160;WEIGHTS&#160;&#160;◇&#160;&#160;INTENT
        </text>
      </g>

      {/* ════════ central instrument: the 2040 planisphere ════════ */}
      {/* graticule */}
      <g fill="none" stroke={AMBER} strokeWidth="0.7" opacity="0.10">
        {RINGS.map((r) => <circle key={r} cx={CX} cy={CY} r={r} />)}
        {AXIS.map((d) => {
          const a = P(CX, CY, RMAX, d)
          return <line key={d} x1={CX} y1={CY} x2={a.x} y2={a.y} />
        })}
      </g>
      {/* year ticks on the outer rim (diagonals only, to stay clear of era labels) */}
      <g fill={DIM} opacity="0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="9">
        {AXIS.filter((d) => d % 90 !== 0).map((d, i) => {
          const a = P(CX, CY, RMAX + 16, d)
          const years = ["2028", "2031", "2034", "2037"]
          return <text key={d} x={a.x} y={a.y + 3} textAnchor="middle">{years[i]}</text>
        })}
      </g>

      {/* three era rings */}
      {ERAS.map((e) => (
        <g key={e.label}>
          <circle
            cx={CX}
            cy={CY}
            r={e.r}
            fill="none"
            stroke={AMBER}
            strokeOpacity={0.34}
            strokeWidth="1.2"
            strokeDasharray={e.dash || undefined}
          />
          {/* label sits on the top-left of each ring, off the vertical hand */}
          <text
            x={P(CX, CY, e.r, -34).x}
            y={P(CX, CY, e.r, -34).y}
            textAnchor="middle"
            fill={AMBER}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            fontSize="9.5"
            letterSpacing="1.5"
          >
            {e.label}
          </text>
        </g>
      ))}

      {/* faint stars */}
      <g fill={GOLD}>
        {SCATTER.map(([dx, dy], i) => (
          <circle key={i} cx={CX + dx} cy={CY + dy} r={i % 3 === 0 ? 1.5 : 1} opacity={0.2 + (i % 4) * 0.08}>
            <animate attributeName="opacity" values={`${0.2 + (i % 4) * 0.08};0.75;${0.2 + (i % 4) * 0.08}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
          </circle>
        ))}
      </g>

      {/* the hand — from core to the 2040 apex, streaming tokens up it */}
      <line x1={CX} y1={CY} x2={APEX.x} y2={APEX.y} stroke="url(#s3-hand)" strokeWidth="3" strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <circle key={i} r="3" fill={AMBER_HI}>
          <animateMotion dur="2.6s" repeatCount="indefinite" begin={`${i * 0.85}s`} path={`M${CX} ${CY} L${APEX.x} ${APEX.y}`} />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.6s" repeatCount="indefinite" begin={`${i * 0.85}s`} />
        </circle>
      ))}
      {/* the 2040 apex node */}
      <circle cx={APEX.x} cy={APEX.y} r="7" fill="#100a18" stroke={AMBER_HI} strokeWidth="2">
        <animate attributeName="r" values="7;9;7" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={APEX.x} cy={APEX.y} r="3" fill={AMBER_HI} />
      <text x={APEX.x} y={APEX.y - 16} textAnchor="middle" fill={AMBER_HI} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="13" letterSpacing="2">2040</text>

      {/* labelled constellation nodes */}
      <g>
        {NODES.map((n, i) => {
          const p = P(CX, CY, n.r, n.deg)
          const lx = n.side === "R" ? 768 : 232
          const anchor = n.side === "R" ? "start" : "end"
          const elbow = n.side === "R" ? lx - 14 : lx + 14
          return (
            <g key={i}>
              <path d={`M${p.x} ${p.y} L${elbow} ${n.ly - 5} L${n.side === "R" ? lx - 2 : lx + 2} ${n.ly - 5}`} fill="none" stroke={n.c} strokeOpacity="0.45" strokeWidth="0.8" />
              <circle cx={p.x} cy={p.y} r="4" fill={n.c} />
              <circle cx={p.x} cy={p.y} r="8.5" fill="none" stroke={n.c} strokeOpacity="0.35" strokeWidth="1" />
              <text x={lx} y={n.ly} textAnchor={anchor} fill={INK} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11.5" letterSpacing="1.2">{n.name}</text>
              <text x={lx} y={n.ly + 17} textAnchor={anchor} fill={n.c} style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="13">{n.val}</text>
            </g>
          )
        })}
      </g>

      {/* the core — intent, glowing */}
      <g transform={`translate(${CX} ${CY})`}>
        <circle r="60" fill="url(#s3-core)">
          <animate attributeName="opacity" values="0.72;1;0.72" dur="5.5s" repeatCount="indefinite" />
        </circle>
        <circle r="30" fill="#150e10" stroke={AMBER} strokeOpacity="0.5" strokeWidth="1.4" />
        <text x="0" y="-2" textAnchor="middle" fill={AMBER_HI} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="10" letterSpacing="1.5">THE</text>
        <text x="0" y="13" textAnchor="middle" fill={AMBER_HI} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="10" letterSpacing="1.5">INTENT</text>
      </g>

      {/* ════════ FIG. A — the three eras ════════ */}
      <line x1="54" y1="906" x2="946" y2="906" stroke={AMBER} strokeOpacity="0.18" strokeWidth="0.7" />
      <text x="54" y="934" fill={DIM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11" letterSpacing="2.5">FIG. A, THE INSTRUCTION MOVES UP THE STACK · code · weights · intent</text>

      <g>
        {[
          { x: 80, t: "I · SOFTWARE 1.0", cap: "code, written by hand", kind: "code" },
          { x: 388, t: "II · SOFTWARE 2.0", cap: "weights, learned from data", kind: "weights" },
          { x: 696, t: "III · SOFTWARE 3.0", cap: "intent, executed by agents", kind: "intent" },
        ].map((m, i) => (
          <g key={i} transform={`translate(${m.x} 956)`}>
            <rect x="0" y="0" width="224" height="150" rx="8" fill="#150d1c" stroke={AMBER} strokeOpacity="0.18" />
            <Era kind={m.kind} />
            <text x="20" y="118" fill={INK} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11.5" letterSpacing="1.5">{m.t}</text>
            <text x="20" y="136" fill={DIM} style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="11.5">{m.cap}</text>
          </g>
        ))}
      </g>

      {/* tagline */}
      <text x="500" y="1148" textAnchor="middle" fill="#eadfce" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="18">
        Intent becomes the program. Agents become the workforce.
      </text>

      {/* ── plate footer ── */}
      <line x1="54" y1="1176" x2="946" y2="1176" stroke={COPPER} strokeOpacity="0.24" strokeWidth="0.7" />
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <text x="54" y="1200" fill={DIM} fontSize="11" letterSpacing="2.5">INTERACTIVE GALLERY · SOFTWARE 3.0</text>
        <text x="946" y="1200" textAnchor="end" fill={AMBER} fontSize="13" letterSpacing="3">ENTER →</text>
        <text x="54" y="1216" fill={DIM} fontSize="9" letterSpacing="2" opacity="0.7">SYNAPTIC CARTOGRAPHY SERIES · A MAP TO 2040</text>
        <text x="946" y="1216" textAnchor="end" fill={DIM} fontSize="9" letterSpacing="2" opacity="0.7">PLATE III OF V</text>
      </g>

      <rect width="1000" height="1250" fill="url(#s3-vig)" pointerEvents="none" />
    </svg>
  )
}

function Era({ kind }: { kind: string }) {
  if (kind === "code") {
    return (
      <g transform="translate(112 52)" fill="none" stroke={AMBER} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round">
        <path d="M-30 -22 q-10 0 -10 10 v6 q0 8 -8 8 q8 0 8 8 v6 q0 10 10 10" />
        <path d="M30 -22 q10 0 10 10 v6 q0 8 8 8 q-8 0 -8 8 v6 q0 10 -10 10" />
        <line x1="-6" y1="-8" x2="8" y2="-8" strokeOpacity="0.5" />
        <line x1="-10" y1="2" x2="6" y2="2" strokeOpacity="0.5" />
        <line x1="-6" y1="12" x2="2" y2="12" strokeOpacity="0.5" />
      </g>
    )
  }
  if (kind === "weights") {
    return (
      <g transform="translate(112 52)">
        <g stroke={AMBER} strokeOpacity="0.4" strokeWidth="1">
          {[-24, 0, 24].map((y1) =>
            [-14, 14].map((y2) => <line key={`${y1}-${y2}`} x1="-30" y1={y1} x2="0" y2={y2} />),
          )}
          {[-14, 14].map((y1) =>
            [-8, 12].map((y2) => <line key={`b${y1}-${y2}`} x1="0" y1={y1} x2="30" y2={y2} />),
          )}
        </g>
        {[[-30, -24], [-30, 0], [-30, 24], [0, -14], [0, 14], [30, -8], [30, 12]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.4" fill={i === 4 || i === 3 ? AMBER_HI : "#150d1c"} stroke={AMBER} strokeWidth="1.4" />
        ))}
      </g>
    )
  }
  return (
    <g transform="translate(112 52)">
      <rect x="-34" y="-16" width="36" height="20" rx="4" fill="none" stroke={AMBER} strokeOpacity="0.6" strokeWidth="1.4" />
      <text x="-16" y="-2" textAnchor="middle" fill={AMBER_HI} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="10">›_</text>
      <path d="M2 -6 L20 -6" stroke={AMBER} strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 -11 L22 -6 L14 -1" fill="none" stroke={AMBER} strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="-6" r="9" fill="none" stroke={AMBER_HI} strokeWidth="1.6" />
      <circle cx="30" cy="-6" r="2.4" fill={AMBER_HI} />
      <g stroke={AMBER_HI} strokeWidth="1.4" strokeLinecap="round">
        <line x1="30" y1="-18" x2="30" y2="-22" />
        <line x1="30" y1="6" x2="30" y2="10" />
        <line x1="18" y1="-6" x2="14" y2="-6" />
        <line x1="42" y1="-6" x2="46" y2="-6" />
      </g>
    </g>
  )
}
