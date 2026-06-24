/**
 * ChokepointPlate — the cover plate for "The Chokepoint Paradox".
 *
 * A self-contained, museum-grade SVG illustration in the essay's "Atlas
 * Luminous" palette (cyan leverage · gold key · rose squeeze). Centered,
 * radial composition so it crops gracefully in both the wide /synaptic slot
 * and the portrait homepage Studio card. Decorative only — aria-hidden; the
 * card's figcaption carries the title and meaning.
 *
 * Motif: Europe holds the key (the gold key, its bow a ring of twelve EU
 * stars); Washington owns the lock (the cyan keyhole inside a bracket of
 * external control); the continent's wealth streams west (the warm filaments);
 * and two empires press in from either side (the cyan and rose squeeze arcs).
 */
export function ChokepointPlate({ className }: { className?: string }) {
  // twelve EU stars arranged in the key's bow
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    return { x: 600 + Math.cos(a) * 70, y: 250 + Math.sin(a) * 70, r: 5.2 }
  })
  // the wealth-flow filaments sweeping west (to the right edge)
  const flows = [
    { y: 372, c: 36, dur: "7s" },
    { y: 398, c: 60, dur: "9s" },
    { y: 420, c: 22, dur: "6.2s" },
    { y: 446, c: 80, dur: "10.5s" },
    { y: 470, c: 44, dur: "8s" },
  ]

  return (
    <svg
      viewBox="0 0 1200 760"
      className={className}
      role="img"
      aria-label="The Chokepoint Paradox — a luminous key, a foreign lock, and wealth streaming west."
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="cp-bg" cx="46%" cy="40%" r="78%">
          <stop offset="0%" stopColor="#0d2535" />
          <stop offset="38%" stopColor="#0a1a2a" />
          <stop offset="72%" stopColor="#07111c" />
          <stop offset="100%" stopColor="#05070d" />
        </radialGradient>
        <linearGradient id="cp-key" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6d38a" />
          <stop offset="48%" stopColor="#e8b54a" />
          <stop offset="100%" stopColor="#b6852a" />
        </linearGradient>
        <linearGradient id="cp-flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8b54a" stopOpacity="0" />
          <stop offset="22%" stopColor="#e8b54a" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#46c7d6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#46c7d6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f6d38a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f6d38a" stopOpacity="0" />
        </radialGradient>
        <filter id="cp-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ground */}
      <rect width="1200" height="760" fill="url(#cp-bg)" />

      {/* faint cartographic graticule */}
      <g stroke="#46c7d6" strokeWidth="0.8" opacity="0.10" fill="none">
        {[150, 280, 410, 540].map((r) => (
          <circle key={r} cx="600" cy="372" r={r} />
        ))}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return (
            <line
              key={i}
              x1="600"
              y1="372"
              x2={600 + Math.cos(a) * 560}
              y2={372 + Math.sin(a) * 560}
            />
          )
        })}
      </g>

      {/* faint starfield */}
      <g fill="#f6ead0">
        {[
          [120, 90, 1.1, 0.5], [240, 160, 0.8, 0.32], [980, 110, 1.3, 0.55],
          [1080, 220, 0.9, 0.38], [180, 620, 1, 0.4], [1040, 640, 1.2, 0.46],
          [330, 70, 0.7, 0.3], [880, 680, 0.8, 0.34], [60, 360, 1, 0.4],
          [1140, 420, 0.9, 0.36],
        ].map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={o} />
        ))}
      </g>

      {/* ── the two-empire squeeze ── */}
      {/* China presses from the left (rose) */}
      <g fill="none" strokeLinecap="round">
        <path d="M150 372 q90 -150 250 -190" stroke="#e0607a" strokeWidth="3" opacity="0.5" />
        <path d="M150 372 q90 150 250 190" stroke="#e0607a" strokeWidth="3" opacity="0.5" />
        <path d="M150 372 l26 -12 m-26 12 l26 12" stroke="#e0607a" strokeWidth="3" opacity="0.7" />
        {/* United States presses from the right (cyan) */}
        <path d="M1050 372 q-90 -150 -250 -190" stroke="#46c7d6" strokeWidth="3" opacity="0.5" />
        <path d="M1050 372 q-90 150 -250 190" stroke="#46c7d6" strokeWidth="3" opacity="0.5" />
        <path d="M1050 372 l-26 -12 m26 12 l-26 12" stroke="#46c7d6" strokeWidth="3" opacity="0.7" />
      </g>

      {/* ── wealth streaming west ── */}
      <g>
        {flows.map((f, i) => (
          <g key={i}>
            <path
              d={`M600 372 C 760 ${f.y - 30}, 940 ${f.y}, 1180 ${f.y}`}
              fill="none"
              stroke="url(#cp-flow)"
              strokeWidth="1.6"
              opacity="0.8"
            />
            <circle r="2.6" fill="#f6d38a">
              <animateMotion
                dur={f.dur}
                repeatCount="indefinite"
                path={`M600 372 C 760 ${f.y - 30}, 940 ${f.y}, 1180 ${f.y}`}
                begin={`${i * 0.7}s`}
              />
              <animate attributeName="opacity" values="0;0.9;0.9;0" dur={f.dur} repeatCount="indefinite" begin={`${i * 0.7}s`} />
            </circle>
          </g>
        ))}
      </g>

      {/* ── the lock Washington owns ── */}
      <g transform="translate(600 372)">
        {/* external-control bracket around the keyhole */}
        <g stroke="#46c7d6" fill="none" strokeWidth="2.4" opacity="0.55" strokeLinecap="round">
          <path d="M150 -78 a86 86 0 0 1 0 156" />
          <path d="M150 -78 l22 0 M150 78 l22 0" />
        </g>
        {/* keyhole */}
        <g transform="translate(150 0)">
          <circle r="86" fill="#08151f" stroke="#46c7d6" strokeWidth="2.2" opacity="0.9" />
          <circle r="86" fill="none" stroke="#46c7d6" strokeWidth="10" opacity="0.12" filter="url(#cp-soft)" />
          <circle cy="-14" r="20" fill="#46c7d6" opacity="0.92" />
          <path d="M-9 -2 L9 -2 L15 40 L-15 40 Z" fill="#46c7d6" opacity="0.92" />
          <animate attributeName="opacity" values="0.85;1;0.85" dur="5s" repeatCount="indefinite" />
        </g>
      </g>

      {/* ── the key Europe holds ── */}
      <g transform="translate(600 372)">
        {/* glow behind the bow */}
        <circle cx="0" cy="-122" r="120" fill="url(#cp-glow)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="6s" repeatCount="indefinite" />
        </circle>
        {/* bow ring */}
        <circle cx="0" cy="-122" r="86" fill="#0c1d12" opacity="0.55" />
        <circle cx="0" cy="-122" r="86" fill="none" stroke="url(#cp-key)" strokeWidth="11" />
        <circle cx="0" cy="-122" r="64" fill="none" stroke="url(#cp-key)" strokeWidth="2.4" opacity="0.6" />
        {/* twelve EU stars in the bow */}
        <g fill="#f6d38a">
          {stars.map((s, i) => (
            <Star key={i} cx={s.x - 600} cy={s.y - 372 - 0} r={s.r} />
          ))}
        </g>
        {/* shaft */}
        <rect x="-9" y="-36" width="18" height="150" rx="6" fill="url(#cp-key)" />
        {/* bit / teeth */}
        <g fill="url(#cp-key)">
          <rect x="9" y="86" width="34" height="15" rx="3" />
          <rect x="9" y="58" width="22" height="15" rx="3" />
        </g>
        {/* a soft highlight down the shaft */}
        <rect x="-4" y="-30" width="3.2" height="138" rx="2" fill="#fff3cf" opacity="0.5" />
      </g>

      {/* ── ledger ticks along the foot (the Source-Ledger motif) ── */}
      <g stroke="#7d8a94" strokeWidth="1" opacity="0.5">
        {Array.from({ length: 41 }, (_, i) => {
          const x = 120 + i * 24
          const tall = i % 5 === 0
          return <line key={i} x1={x} y1="712" x2={x} y2={tall ? 696 : 704} />
        })}
      </g>

      {/* ── title cartouche ── */}
      <text
        x="600"
        y="744"
        textAnchor="middle"
        fill="#e8b54a"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, letterSpacing: 7 }}
      >
        THE CHOKEPOINT PARADOX
      </text>
    </svg>
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
