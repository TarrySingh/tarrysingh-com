/**
 * EngineRoomPlate — the cover plate for "The Engine Room".
 *
 * A self-contained, museum-grade folio in the essay's terminal-graphite palette
 * (phosphor-green signal · amber verdict · rose danger), built to sit beside the
 * CHOKEPOINT, SYMPHONY and MEMPHIS plates. The central instrument is the thesis
 * in one figure: THE LOOP (gather · act · verify · persist, a token running it
 * clockwise) enclosed by THE HARNESS (the standing structure it runs inside),
 * with six labelled callouts pinned to real numbers from the manual. A "three
 * organs" panel, a tagline, and a baked plate footer. Portrait 4:5 so it fills
 * both the /synaptic featured slot and the homepage Studio card. The card adds
 * no overlay — the plate carries its own ENTER footer.
 *
 * Decorative; aria-labelled. Figures are the essay's, current to July 2026.
 */

const SIGNAL = "#53e08c"
const SIGNAL_HI = "#8df0b4"
const VERDICT = "#e6b45a"
const VERDICT_HI = "#f4cd86"
const ROSE = "#f0708a"
const INK = "#e9f2ec"
const DIM = "#7c95a6"

function P(cx: number, cy: number, r: number, deg: number) {
  const a = (deg - 90) * (Math.PI / 180)
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
}

const CX = 500
const CY = 621
const RMAX = 258
const RLOOP = 150 // the loop ring
const RHARN = 240 // the harness frame half-extent

// clockwise full-circle path for the running token
const loopPath = `M ${CX} ${CY - RLOOP} A ${RLOOP} ${RLOOP} 0 1 1 ${CX} ${
  CY + RLOOP
} A ${RLOOP} ${RLOOP} 0 1 1 ${CX} ${CY - RLOOP}`

// the four loop stations (clockwise from top)
const STATIONS = [
  { deg: 0, label: "GATHER" },
  { deg: 90, label: "ACT" },
  { deg: 180, label: "VERIFY" },
  { deg: 270, label: "PERSIST" },
] as const

// labelled callouts around the instrument, each a real figure from the manual
const NODES = [
  // right half
  { deg: 24, r: 206, side: "R", ly: 452, name: "GOODPUT HELD", val: "> 90% · one fail / 3 hrs", c: SIGNAL_HI },
  { deg: 62, r: 250, side: "R", ly: 566, name: "THE CONTEXT TAX", val: "90% is tool results", c: VERDICT_HI },
  { deg: 100, r: 214, side: "R", ly: 680, name: "THE VAULT", val: "1 : ~4 billion", c: VERDICT_HI },
  // left half
  { deg: -24, r: 208, side: "L", ly: 452, name: "REWARD HACK", val: "o3 hacked 80%", c: ROSE },
  { deg: -62, r: 250, side: "L", ly: 566, name: "CONTEXT ROT", val: "11 of 13 models", c: ROSE },
  { deg: -100, r: 214, side: "L", ly: 680, name: "THE VERIFIER", val: "the load-bearing organ", c: SIGNAL_HI },
] as const

// the harness organs, on the four edges of the frame
const ORGANS = [
  { x: CX, y: CY - RHARN - 8, t: "MEMORY", anchor: "middle" as const },
  { x: CX + RHARN + 8, y: CY + 4, t: "TOOLS", anchor: "start" as const },
  { x: CX, y: CY + RHARN + 18, t: "HOOKS", anchor: "middle" as const },
  { x: CX - RHARN - 8, y: CY + 4, t: "CONTEXT", anchor: "end" as const },
]

const RINGS = [72, 132, 196, 244]
const AXIS = [0, 45, 90, 135, 180, 225, 270, 315]

export function EngineRoomPlate({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1250"
      className={className}
      role="img"
      aria-label="The Engine Room, a folio plate: a phosphor-green loop (gather, act, verify, persist) running clockwise inside the harness that holds it, ringed by six figures from the field manual."
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="err-bg" cx="50%" cy="44%" r="74%">
          <stop offset="0%" stopColor="#16241f" />
          <stop offset="42%" stopColor="#0e1a18" />
          <stop offset="74%" stopColor="#0a1211" />
          <stop offset="100%" stopColor="#060b0c" />
        </radialGradient>
        <radialGradient id="err-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SIGNAL_HI} stopOpacity="0.9" />
          <stop offset="42%" stopColor={SIGNAL} stopOpacity="0.28" />
          <stop offset="100%" stopColor={SIGNAL} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="err-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={SIGNAL_HI} />
          <stop offset="60%" stopColor={SIGNAL} />
          <stop offset="100%" stopColor="#2f9c63" />
        </linearGradient>
        <radialGradient id="err-vig" cx="50%" cy="47%" r="63%">
          <stop offset="62%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      <rect width="1000" height="1250" fill="url(#err-bg)" />

      {/* folio frame */}
      <rect x="26" y="26" width="948" height="1198" fill="none" stroke={SIGNAL} strokeOpacity="0.16" strokeWidth="1" />
      <rect x="33" y="33" width="934" height="1184" fill="none" stroke={VERDICT} strokeOpacity="0.09" strokeWidth="0.6" />

      {/* ── top header ── */}
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }} fill={DIM}>
        <text x="54" y="64" fontSize="13" letterSpacing="3">PLATE V · MMXXVI</text>
        <text x="946" y="64" textAnchor="end" fontSize="13" letterSpacing="3">FIG. 1.0</text>
        <text x="54" y="82" fontSize="9.5" letterSpacing="2" opacity="0.7">ANNO 2026 · FOLIO V</text>
        <text x="946" y="82" textAnchor="end" fontSize="9.5" letterSpacing="2" opacity="0.7">THE STANDING MACHINE</text>
      </g>

      {/* ── title block ── */}
      <text x="500" y="138" textAnchor="middle" fill={SIGNAL} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="12.5" letterSpacing="5.5">
        A FIELD MANUAL · LOOP &amp; HARNESS ENGINEERING
      </text>
      <text x="500" y="206" textAnchor="middle" fill={INK} style={{ fontFamily: "'Gloock', 'Italiana', Georgia, serif" }} fontSize="62" letterSpacing="1.5">
        THE ENGINE ROOM
      </text>
      <text x="500" y="246" textAnchor="middle" fill="#cfe6da" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="20">
        The model is the engine. This is the room it runs in.
      </text>

      {/* rule + the two-word vocabulary */}
      <line x1="190" y1="284" x2="360" y2="284" stroke={SIGNAL} strokeOpacity="0.28" strokeWidth="0.8" />
      <line x1="640" y1="284" x2="810" y2="284" stroke={SIGNAL} strokeOpacity="0.28" strokeWidth="0.8" />
      <text x="500" y="289" textAnchor="middle" fill={DIM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11" letterSpacing="3.5">
        THE TWO-WORD VOCABULARY
      </text>
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11.5" letterSpacing="2.5">
        <rect x="286" y="306" width="428" height="30" rx="15" fill="none" stroke={SIGNAL} strokeOpacity="0.3" />
        <text x="500" y="326" textAnchor="middle" fill="#d7ecdd">
          GATHER&#160;&#160;◇&#160;&#160;ACT&#160;&#160;◇&#160;&#160;VERIFY&#160;&#160;◇&#160;&#160;PERSIST
        </text>
      </g>

      {/* ════════ central instrument: the loop inside the harness ════════ */}
      {/* graticule */}
      <g fill="none" stroke={SIGNAL} strokeWidth="0.7" opacity="0.11">
        {RINGS.map((r) => <circle key={r} cx={CX} cy={CY} r={r} />)}
        {AXIS.map((d) => {
          const a = P(CX, CY, RMAX, d)
          return <line key={d} x1={CX} y1={CY} x2={a.x} y2={a.y} />
        })}
      </g>
      {/* degree numerals — diagonals only, so the cardinal axes stay clear for
          the harness organ labels (MEMORY / TOOLS / HOOKS / CONTEXT) */}
      <g fill={DIM} opacity="0.55" style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="9">
        {AXIS.filter((d) => d % 90 !== 0).map((d) => {
          const a = P(CX, CY, RMAX + 16, d)
          return <text key={d} x={a.x} y={a.y + 3} textAnchor="middle">{String(d).padStart(3, "0")}</text>
        })}
      </g>

      {/* the harness frame — the standing structure the loop runs inside */}
      <rect
        x={CX - RHARN}
        y={CY - RHARN}
        width={RHARN * 2}
        height={RHARN * 2}
        rx="26"
        fill="none"
        stroke={SIGNAL}
        strokeOpacity="0.26"
        strokeWidth="1.3"
        strokeDasharray="2 7"
      />
      {/* corner brackets */}
      <g fill="none" stroke={SIGNAL} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round">
        {[
          [CX - RHARN, CY - RHARN, 1, 1],
          [CX + RHARN, CY - RHARN, -1, 1],
          [CX - RHARN, CY + RHARN, 1, -1],
          [CX + RHARN, CY + RHARN, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M ${x + sx * 4} ${y + sy * 22} L ${x + sx * 4} ${y + sy * 4} L ${x + sx * 22} ${y + sy * 4}`} />
        ))}
      </g>
      <rect x={CX - RHARN + 24} y={CY - RHARN - 22} width="92" height="18" rx="9" fill="#0a1211" stroke={SIGNAL} strokeOpacity="0.34" />
      <text x={CX - RHARN + 70} y={CY - RHARN - 9} textAnchor="middle" fill={SIGNAL} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="10" letterSpacing="3">THE HARNESS</text>
      <g fill={DIM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="9.5" letterSpacing="2">
        {ORGANS.map((o) => (
          <text key={o.t} x={o.x} y={o.y} textAnchor={o.anchor}>{o.t}</text>
        ))}
      </g>

      {/* the loop ring */}
      <circle cx={CX} cy={CY} r={RLOOP} fill="none" stroke="url(#err-ring)" strokeWidth="2.4" opacity="0.9" />
      {/* clockwise direction arrows on the ring */}
      <g fill={SIGNAL} opacity="0.8">
        {[45, 135, 225, 315].map((d) => {
          const p = P(CX, CY, RLOOP, d)
          return (
            <g key={d} transform={`translate(${p.x} ${p.y}) rotate(${d})`}>
              <path d="M -5 -4 L 5 0 L -5 4 Z" />
            </g>
          )
        })}
      </g>
      {/* running tokens */}
      {[
        { begin: "0s", c: SIGNAL_HI, r: 4 },
        { begin: "2s", c: VERDICT_HI, r: 3 },
        { begin: "4s", c: SIGNAL, r: 3 },
      ].map((t, i) => (
        <circle key={i} r={t.r} fill={t.c}>
          <animateMotion dur="6s" repeatCount="indefinite" path={loopPath} begin={t.begin} rotate="auto" />
        </circle>
      ))}

      {/* the four stations */}
      <g>
        {STATIONS.map((s) => {
          const p = P(CX, CY, RLOOP, s.deg)
          const lp = P(CX, CY, RLOOP + 24, s.deg)
          return (
            <g key={s.label}>
              <circle cx={p.x} cy={p.y} r="6.5" fill="#0a1211" stroke={SIGNAL_HI} strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="2.4" fill={SIGNAL_HI} />
              <text
                x={lp.x}
                y={lp.y + (s.deg === 180 ? 12 : s.deg === 0 ? -4 : 3)}
                textAnchor="middle"
                fill={INK}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                fontSize="10.5"
                letterSpacing="1.5"
              >
                {s.label}
              </text>
            </g>
          )
        })}
      </g>

      {/* the core */}
      <g transform={`translate(${CX} ${CY})`}>
        <circle r="64" fill="url(#err-core)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="5.5s" repeatCount="indefinite" />
        </circle>
        <circle r="30" fill="#0a1512" stroke={SIGNAL} strokeOpacity="0.5" strokeWidth="1.4" />
        <text x="0" y="-2" textAnchor="middle" fill={SIGNAL_HI} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11" letterSpacing="1.5">THE</text>
        <text x="0" y="14" textAnchor="middle" fill={SIGNAL_HI} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11" letterSpacing="1.5">LOOP</text>
      </g>

      {/* labelled callouts — six figures from the manual */}
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

      {/* ════════ FIG. A — the three organs ════════ */}
      <line x1="54" y1="906" x2="946" y2="906" stroke={SIGNAL} strokeOpacity="0.18" strokeWidth="0.7" />
      <text x="54" y="934" fill={DIM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11" letterSpacing="2.5">FIG. A, SAME ANATOMY, LAPTOP TO CLUSTER · loop · harness · verifier</text>

      <g>
        {[
          { x: 80, t: "I · THE LOOP", cap: "gather, act, verify, repeat", kind: "loop" },
          { x: 388, t: "II · THE HARNESS", cap: "the standing structure it runs in", kind: "harness" },
          { x: 696, t: "III · THE VERIFIER", cap: "a green suite is not proof of work", kind: "verifier" },
        ].map((m, i) => (
          <g key={i} transform={`translate(${m.x} 956)`}>
            <rect x="0" y="0" width="224" height="150" rx="8" fill="#0b1512" stroke={SIGNAL} strokeOpacity="0.18" />
            <Organ kind={m.kind} />
            <text x="20" y="118" fill={INK} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11.5" letterSpacing="1.5">{m.t}</text>
            <text x="20" y="136" fill={DIM} style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="11.5">{m.cap}</text>
          </g>
        ))}
      </g>

      {/* tagline */}
      <text x="500" y="1148" textAnchor="middle" fill="#dfeae4" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="18">
        Scale did not change the anatomy. It changed the flesh.
      </text>

      {/* ── plate footer ── */}
      <line x1="54" y1="1176" x2="946" y2="1176" stroke={VERDICT} strokeOpacity="0.2" strokeWidth="0.7" />
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <text x="54" y="1200" fill={DIM} fontSize="11" letterSpacing="2.5">INTERACTIVE FIELD MANUAL · THE ENGINE ROOM</text>
        <text x="946" y="1200" textAnchor="end" fill={SIGNAL} fontSize="13" letterSpacing="3">ENTER →</text>
        <text x="54" y="1216" fill={DIM} fontSize="9" letterSpacing="2" opacity="0.7">SYNAPTIC CARTOGRAPHY SERIES · CURRENT TO JULY 2026</text>
        <text x="946" y="1216" textAnchor="end" fill={DIM} fontSize="9" letterSpacing="2" opacity="0.7">PLATE V OF V</text>
      </g>

      <rect width="1000" height="1250" fill="url(#err-vig)" pointerEvents="none" />
    </svg>
  )
}

function Organ({ kind }: { kind: string }) {
  if (kind === "loop") {
    return (
      <g transform="translate(112 52)">
        <circle cx="0" cy="0" r="28" fill="none" stroke={SIGNAL} strokeOpacity="0.7" strokeWidth="2" />
        <g fill={SIGNAL} opacity="0.85">
          {[45, 225].map((d) => {
            const a = (d - 90) * (Math.PI / 180)
            const x = Math.cos(a) * 28
            const y = Math.sin(a) * 28
            return (
              <g key={d} transform={`translate(${x} ${y}) rotate(${d})`}>
                <path d="M -4 -3 L 4 0 L -4 3 Z" />
              </g>
            )
          })}
        </g>
        <circle r="4" fill={SIGNAL_HI}>
          <animateMotion dur="3.4s" repeatCount="indefinite" path="M 0 -28 A 28 28 0 1 1 0 28 A 28 28 0 1 1 0 -28" />
        </circle>
      </g>
    )
  }
  if (kind === "harness") {
    return (
      <g transform="translate(112 52)">
        <rect x="-30" y="-28" width="60" height="56" rx="6" fill="none" stroke={SIGNAL} strokeOpacity="0.3" strokeWidth="1.3" strokeDasharray="2 6" />
        <g fill="none" stroke={SIGNAL} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round">
          <path d="M -26 -18 L -26 -24 L -20 -24" />
          <path d="M 26 -18 L 26 -24 L 20 -24" />
          <path d="M -26 18 L -26 24 L -20 24" />
          <path d="M 26 18 L 26 24 L 20 24" />
        </g>
        <circle cx="0" cy="0" r="12" fill="none" stroke={VERDICT} strokeOpacity="0.7" strokeWidth="1.6" />
        <circle cx="0" cy="0" r="2.6" fill={VERDICT_HI} />
      </g>
    )
  }
  return (
    <g transform="translate(112 52)">
      <rect x="-30" y="-26" width="60" height="52" rx="4" fill="none" stroke={SIGNAL} strokeOpacity="0.4" strokeWidth="1.3" />
      <path d="M -14 0 L -3 12 L 18 -14" fill="none" stroke={SIGNAL_HI} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="0" cy="0" r="26" fill="none" stroke={SIGNAL} strokeOpacity="0.14" strokeWidth="1" />
    </g>
  )
}
