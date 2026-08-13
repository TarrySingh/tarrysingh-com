/**
 * ChokepointPlate — the cover plate for "The Chokepoint Paradox".
 *
 * A self-contained, museum-grade folio in the essay's "Atlas Luminous" palette
 * (cyan leverage · gold key · rose squeeze), built to sit beside the SYMPHONY
 * and MEMPHIS plates: a titled plate with a dense, labelled central instrument
 * (the wealth-transfer orrery — Europe at the core, the gold EU-star key as its
 * emblem, the continent's value streaming west, two empires pressing in), a
 * "four strokes" panel, a tagline, and a baked plate footer. Portrait 4:5 so it
 * fills both the /synaptic featured slot and the homepage Studio card. The card
 * adds no overlay — the plate carries its own ENTER footer.
 *
 * Decorative; aria-labelled. Numbers are the essay's, current to July 2026.
 */

const GOLD = "#e8b54a"
const GOLD_HI = "#f6d38a"
const CYAN = "#46c7d6"
const ROSE = "#e0607a"
const CREAM = "#f6ead0"
const DIM = "#8595a0"

function P(cx: number, cy: number, r: number, deg: number) {
  const a = (deg - 90) * (Math.PI / 180)
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
}

const CX = 500
const CY = 612
const RMAX = 290

// labelled chokepoints around the orrery
const NODES = [
  // right half — where the value lands (west / US)
  { deg: 18, r: 196, side: "R", ly: 452, name: "THE CLOUD TRIBUTE", val: "€264 bn / year", c: CYAN },
  { deg: 52, r: 250, side: "R", ly: 566, name: "THE AI CANYON", val: "Europe ~5% of compute", c: CYAN },
  { deg: 86, r: 214, side: "R", ly: 680, name: "THE TALENT EXPORT", val: "net inflow halved", c: GOLD_HI },
  // left half — what leaves, and who squeezes
  { deg: -20, r: 200, side: "L", ly: 452, name: "THE SAVINGS DRAIN", val: "€300 bn / year west", c: GOLD_HI },
  { deg: -54, r: 252, side: "L", ly: 566, name: "THE PENSION GAP", val: "0.018% to venture", c: GOLD_HI },
  { deg: -90, r: 214, side: "L", ly: 680, name: "THE TWO-EMPIRE VICE", val: "China ~92% rare earths", c: ROSE },
] as const

// faint unlabelled scatter, for texture
const SCATTER = [
  [40, 240], [128, 168], [255, 132], [70, 305], [305, 96], [200, 210],
  [-40, 250], [-128, 175], [-250, 140], [-72, 300], [-300, 100], [-205, 205],
  [150, 70], [-150, 72], [120, 268], [-118, 266],
] as const

const RINGS = [70, 130, 195, 258, RMAX]
const AXIS = [0, 45, 90, 135, 180, 225, 270, 315]

const FLOWS = [
  { dy: -34, dur: "7.5s", b: "0s" },
  { dy: -10, dur: "9.5s", b: "0.8s" },
  { dy: 16, dur: "6.6s", b: "1.6s" },
  { dy: 40, dur: "11s", b: "2.4s" },
  { dy: 64, dur: "8.4s", b: "3.2s" },
]

export function ChokepointPlate({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1250"
      className={className}
      role="img"
      aria-label="The Chokepoint Paradox, a folio plate: a luminous gold key as Europe's core, its value streaming west, two empires pressing in."
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="cpp-bg" cx="50%" cy="46%" r="72%">
          <stop offset="0%" stopColor="#0e2738" />
          <stop offset="40%" stopColor="#0a1b2b" />
          <stop offset="74%" stopColor="#07111d" />
          <stop offset="100%" stopColor="#050810" />
        </radialGradient>
        <linearGradient id="cpp-key" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_HI} />
          <stop offset="50%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#b6852a" />
        </linearGradient>
        <linearGradient id="cpp-flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0" />
          <stop offset="18%" stopColor={GOLD} stopOpacity="0.9" />
          <stop offset="68%" stopColor={CYAN} stopOpacity="0.5" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cpp-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GOLD_HI} stopOpacity="0.95" />
          <stop offset="40%" stopColor={GOLD} stopOpacity="0.35" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cpp-vig" cx="50%" cy="48%" r="62%">
          <stop offset="62%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      <rect width="1000" height="1250" fill="url(#cpp-bg)" />

      {/* folio frame */}
      <rect x="26" y="26" width="948" height="1198" fill="none" stroke={CYAN} strokeOpacity="0.18" strokeWidth="1" />
      <rect x="33" y="33" width="934" height="1184" fill="none" stroke={GOLD} strokeOpacity="0.10" strokeWidth="0.6" />

      {/* ── top header ── */}
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }} fill={DIM}>
        <text x="54" y="64" fontSize="13" letterSpacing="3">PLATE IV · MMXXVI</text>
        <text x="946" y="64" textAnchor="end" fontSize="13" letterSpacing="3">FIG. 1.0</text>
        <text x="54" y="82" fontSize="9.5" letterSpacing="2" opacity="0.7">ANNO 2026 · FOLIO IV</text>
        <text x="946" y="82" textAnchor="end" fontSize="9.5" letterSpacing="2" opacity="0.7">THE WEALTH-TRANSFER MACHINE</text>
      </g>

      {/* ── title block ── */}
      <text x="500" y="138" textAnchor="middle" fill={GOLD} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="12.5" letterSpacing="6">
        A FIELD GUIDE TO TECH SOVEREIGNTY
      </text>
      <text x="500" y="206" textAnchor="middle" fill={CREAM} style={{ fontFamily: "'Gloock', 'Italiana', Georgia, serif" }} fontSize="62" letterSpacing="1.5">
        THE CHOKEPOINT PARADOX
      </text>
      <text x="500" y="246" textAnchor="middle" fill="#cfe6ec" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="21">
        Europe holds the key; Washington owns the lock
      </text>

      {/* rule + Europe's hand */}
      <g>
        <line x1="190" y1="284" x2="360" y2="284" stroke={CYAN} strokeOpacity="0.3" strokeWidth="0.8" />
        <line x1="640" y1="284" x2="810" y2="284" stroke={CYAN} strokeOpacity="0.3" strokeWidth="0.8" />
        <text x="500" y="289" textAnchor="middle" fill={DIM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11" letterSpacing="3.5">
          THE FOUR-STROKE ENGINE OF DECLINE
        </text>
      </g>
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11.5" letterSpacing="2.5">
        <rect x="262" y="306" width="476" height="30" rx="15" fill="none" stroke={GOLD} strokeOpacity="0.32" />
        <text x="500" y="326" textAnchor="middle" fill="#e9dcbf">
          SAVE&#160;&#160;◇&#160;&#160;FUND&#160;&#160;◇&#160;&#160;TRAIN&#160;&#160;◇&#160;&#160;BUY&#160;BACK
        </text>
      </g>

      {/* ════════ central instrument: the wealth-transfer orrery ════════ */}
      {/* graticule */}
      <g fill="none" stroke={CYAN} strokeWidth="0.7" opacity="0.13">
        {RINGS.map((r) => <circle key={r} cx={CX} cy={CY} r={r} />)}
        {AXIS.map((d) => {
          const a = P(CX, CY, RMAX, d)
          return <line key={d} x1={CX} y1={CY} x2={a.x} y2={a.y} />
        })}
      </g>
      {/* degree numerals */}
      <g fill={DIM} opacity="0.6" style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="9">
        {AXIS.map((d) => {
          const a = P(CX, CY, RMAX + 16, d)
          return <text key={d} x={a.x} y={a.y + 3} textAnchor="middle">{String(d).padStart(3, "0")}</text>
        })}
      </g>

      {/* the two-empire squeeze arcs */}
      <g fill="none" strokeLinecap="round">
        <path d={`M${CX - RMAX - 26} ${CY} q70 -150 210 -200`} stroke={ROSE} strokeWidth="2.6" opacity="0.5" />
        <path d={`M${CX - RMAX - 26} ${CY} q70 150 210 200`} stroke={ROSE} strokeWidth="2.6" opacity="0.5" />
        <path d={`M${CX - RMAX - 26} ${CY} l24 -11 m-24 11 l24 11`} stroke={ROSE} strokeWidth="2.6" opacity="0.7" />
        <path d={`M${CX + RMAX + 26} ${CY} q-70 -150 -210 -200`} stroke={CYAN} strokeWidth="2.6" opacity="0.5" />
        <path d={`M${CX + RMAX + 26} ${CY} q-70 150 -210 200`} stroke={CYAN} strokeWidth="2.6" opacity="0.5" />
        <path d={`M${CX + RMAX + 26} ${CY} l-24 -11 m24 11 l-24 11`} stroke={CYAN} strokeWidth="2.6" opacity="0.7" />
      </g>
      <text x={CX - RMAX - 6} y={CY - 224} textAnchor="middle" fill={ROSE} opacity="0.75" style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="10" letterSpacing="2">CHINA</text>
      <text x={CX + RMAX + 6} y={CY - 224} textAnchor="middle" fill={CYAN} opacity="0.8" style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="10" letterSpacing="2">U.S.A.</text>

      {/* faint scatter */}
      <g fill={CREAM}>
        {SCATTER.map(([dx, dy], i) => (
          <circle key={i} cx={CX + dx} cy={CY + dy} r={i % 3 === 0 ? 1.5 : 1} opacity={0.18 + (i % 4) * 0.07} />
        ))}
      </g>

      {/* wealth streaming west */}
      <g>
        {FLOWS.map((f, i) => {
          const d = `M${CX} ${CY} C ${CX + 150} ${CY + f.dy - 26}, ${CX + 320} ${CY + f.dy}, ${CX + 470} ${CY + f.dy}`
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="url(#cpp-flow)" strokeWidth="1.5" opacity="0.8" />
              <circle r="2.4" fill={GOLD_HI}>
                <animateMotion dur={f.dur} repeatCount="indefinite" path={d} begin={f.b} />
                <animate attributeName="opacity" values="0;0.95;0.95;0" dur={f.dur} repeatCount="indefinite" begin={f.b} />
              </circle>
            </g>
          )
        })}
      </g>

      {/* labelled chokepoints */}
      <g>
        {NODES.map((n, i) => {
          const p = P(CX, CY, n.r, n.deg)
          const lx = n.side === "R" ? 768 : 232
          const anchor = n.side === "R" ? "start" : "end"
          const elbow = n.side === "R" ? lx - 14 : lx + 14
          return (
            <g key={i}>
              <path d={`M${p.x} ${p.y} L${elbow} ${n.ly - 5} L${n.side === "R" ? lx - 2 : lx + 2} ${n.ly - 5}`} fill="none" stroke={n.c} strokeOpacity="0.5" strokeWidth="0.8" />
              <circle cx={p.x} cy={p.y} r="4.5" fill={n.c} />
              <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={n.c} strokeOpacity="0.4" strokeWidth="1" />
              <text x={lx} y={n.ly} textAnchor={anchor} fill={CREAM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11.5" letterSpacing="1.2">{n.name}</text>
              <text x={lx} y={n.ly + 17} textAnchor={anchor} fill={n.c} style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="13">{n.val}</text>
            </g>
          )
        })}
      </g>

      {/* ── the core: Europe, holding the key ── */}
      <g transform={`translate(${CX} ${CY})`}>
        <circle r="118" fill="url(#cpp-core)">
          <animate attributeName="opacity" values="0.78;1;0.78" dur="6s" repeatCount="indefinite" />
        </circle>
        {/* EU bow ring of twelve stars */}
        <circle r="56" fill="#0c1d12" opacity="0.5" />
        <circle r="56" fill="none" stroke="url(#cpp-key)" strokeWidth="7" />
        <g fill={GOLD_HI}>
          {Array.from({ length: 12 }, (_, i) => {
            const s = P(0, 0, 41, i * 30)
            return <Star key={i} cx={s.x} cy={s.y} r={3.4} />
          })}
        </g>
        {/* key shaft + bit, pointing toward the lock (down-right) */}
        <g transform="rotate(34)">
          <rect x="-5.5" y="48" width="11" height="92" rx="4" fill="url(#cpp-key)" />
          <rect x="5.5" y="118" width="20" height="9" rx="2" fill="url(#cpp-key)" />
          <rect x="5.5" y="100" width="13" height="9" rx="2" fill="url(#cpp-key)" />
        </g>
        <text x="0" y="-78" textAnchor="middle" fill={CREAM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="10.5" letterSpacing="3">EUROPE</text>
        <text x="0" y="96" textAnchor="middle" fill={GOLD} style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="12.5">ASML · 100% of EUV</text>
      </g>

      {/* the lock the key cannot turn alone */}
      <g transform={`translate(${CX + 150} ${CY + 150})`} opacity="0.92">
        <circle r="34" fill="#08151f" stroke={CYAN} strokeWidth="1.8" />
        <circle cy="-6" r="8" fill={CYAN} />
        <path d="M-4 -1 L4 -1 L7 17 L-7 17 Z" fill={CYAN} />
        <path d="M-30 -20 a30 30 0 0 1 60 0" fill="none" stroke={CYAN} strokeOpacity="0.5" strokeWidth="1.6" />
      </g>

      {/* ════════ FIG. A — the four strokes ════════ */}
      <line x1="54" y1="906" x2="946" y2="906" stroke={CYAN} strokeOpacity="0.2" strokeWidth="0.7" />
      <text x="54" y="934" fill={DIM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11" letterSpacing="2.5">FIG. A, THE WHEEL TURNS WEST · save · fund · train · buy back</text>

      <g>
        {[
          { x: 80, t: "I · THE DRAIN", cap: "wealth saved, then sent west", kind: "drain" },
          { x: 388, t: "II · THE LEASH", cap: "own the asset, rent the control", kind: "leash" },
          { x: 696, t: "III · THE DOOR", cap: "the narrow way still open", kind: "door" },
        ].map((m, i) => (
          <g key={i} transform={`translate(${m.x} 956)`}>
            <rect x="0" y="0" width="224" height="150" rx="8" fill="#0a1a29" stroke={CYAN} strokeOpacity="0.18" />
            <Movement kind={m.kind} />
            <text x="20" y="118" fill={CREAM} style={{ fontFamily: "'IBM Plex Mono', monospace" }} fontSize="11.5" letterSpacing="1.5">{m.t}</text>
            <text x="20" y="136" fill={DIM} style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="11.5">{m.cap}</text>
          </g>
        ))}
      </g>

      {/* tagline */}
      <text x="500" y="1148" textAnchor="middle" fill="#dfeaef" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontStyle: "italic" }} fontSize="18">
        The key fits. The lock is someone else&rsquo;s.
      </text>

      {/* ── plate footer ── */}
      <line x1="54" y1="1176" x2="946" y2="1176" stroke={GOLD} strokeOpacity="0.22" strokeWidth="0.7" />
      <g style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <text x="54" y="1200" fill={DIM} fontSize="11" letterSpacing="2.5">INTERACTIVE FIELD GUIDE · THE CHOKEPOINT PARADOX</text>
        <text x="946" y="1200" textAnchor="end" fill={CYAN} fontSize="13" letterSpacing="3">ENTER →</text>
        <text x="54" y="1216" fill={DIM} fontSize="9" letterSpacing="2" opacity="0.7">SYNAPTIC CARTOGRAPHY SERIES · CURRENT TO JULY 2026</text>
        <text x="946" y="1216" textAnchor="end" fill={DIM} fontSize="9" letterSpacing="2" opacity="0.7">PLATE IV OF IV</text>
      </g>

      <rect width="1000" height="1250" fill="url(#cpp-vig)" pointerEvents="none" />
    </svg>
  )
}

function Movement({ kind }: { kind: string }) {
  if (kind === "drain") {
    return (
      <g transform="translate(112 52)">
        <path d="M-46 -22 L46 -22 L14 10 L14 30 L-14 22 L-14 10 Z" fill="none" stroke={GOLD} strokeOpacity="0.6" strokeWidth="1.4" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={-30 + i * 20} cy={-22} r="2.4" fill={GOLD_HI}>
            <animate attributeName="cy" values="-22;30" dur="2.4s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="2.4s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    )
  }
  if (kind === "leash") {
    return (
      <g transform="translate(112 50)">
        <circle cx="-22" cy="0" r="16" fill="none" stroke={GOLD} strokeWidth="3" />
        <rect x="-24" y="14" width="5" height="26" rx="2" fill={GOLD} />
        <circle cx="30" cy="2" r="18" fill="#08151f" stroke={CYAN} strokeWidth="1.6" />
        <circle cx="30" cy="-3" r="5" fill={CYAN} />
        <path d="M30 0 L30 12" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
        <path d="M-4 0 L12 0" stroke={CYAN} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 3" />
      </g>
    )
  }
  return (
    <g transform="translate(112 50)">
      <rect x="-30" y="-28" width="60" height="56" rx="3" fill="none" stroke={CYAN} strokeOpacity="0.45" strokeWidth="1.4" />
      <path d="M2 -28 L2 28 L34 16 L34 -16 Z" fill={GOLD} fillOpacity="0.12" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="26" cy="0" r="2.6" fill={GOLD_HI} />
      <circle cx="60" cy="0" r="20" fill="url(#cpp-core)" opacity="0.7" />
    </g>
  )
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.42
    return `${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`
  }).join(" ")
  return <polygon points={pts} />
}
