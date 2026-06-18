import { PARTNERS } from "@/lib/panoraima/types"
import { projectEurope } from "./helpers"
import { NAVY, NAVY_2, COBALT } from "./consortiumTokens"

/**
 * ConsortiumPlate — a cartographic "plate" background in the McKinsey
 * deep-navy palette, used behind the hero masthead and as subtle bands
 * behind section headers.
 *
 * Pure SVG (no canvas, no hooks) so it server-renders and scales crisply.
 * Draws an equirectangular graticule over the same Europe projection the map
 * uses, survey-style corner ticks + coordinate labels, and — for the hero —
 * the real 15-partner consortium network as cobalt nodes joined by faint arcs.
 *
 * Deliberately distinct from the blog plate-engine (which is canvas + warm
 * gold and shared with blog covers); this one is owned by the dashboard.
 */

type Variant = "hero" | "band"

const VW = 1200
const HERO_H = 620
const BAND_H = 200

// graticule spans (match projectEurope bounds: lng -12..40, lat 35..62)
const LNGS = [-10, 0, 10, 20, 30, 40]
const LATS = [36, 42, 48, 54, 60]

function CornerTicks({ w, h, len = 22, gap = 16, color, opacity }: {
  w: number; h: number; len?: number; gap?: number; color: string; opacity: number
}) {
  const c = (x: number, y: number, dx: number, dy: number) =>
    `M ${x + dx * gap} ${y + dy * gap} h ${dx * len} M ${x + dx * gap} ${y + dy * gap} v ${dy * len}`
  return (
    <path
      d={[c(0, 0, 1, 1), c(w, 0, -1, 1), c(0, h, 1, -1), c(w, h, -1, -1)].join(" ")}
      stroke={color} strokeWidth={1.25} fill="none" opacity={opacity} strokeLinecap="square"
    />
  )
}

export default function ConsortiumPlate({
  variant = "hero",
  className,
}: { variant?: Variant; className?: string }) {
  const H = variant === "hero" ? HERO_H : BAND_H
  const hero = variant === "hero"

  // graticule line endpoints in viewBox space
  const vLines = LNGS.map((lng) => {
    const a = projectEurope(60, lng, VW, H)
    const b = projectEurope(36, lng, VW, H)
    return { x1: a.x, y1: 0, x2: b.x, y2: H, lng }
  })
  const hLines = LATS.map((lat) => {
    const a = projectEurope(lat, -10, VW, H)
    const b = projectEurope(lat, 40, VW, H)
    return { x1: 0, y1: a.y, x2: VW, y2: b.y, lat }
  })

  const pts = hero
    ? PARTNERS.slice(0, 15).map((p) => ({ code: p.code, ...projectEurope(p.lat, p.lng, VW, H) }))
    : []
  const arcs: { x1: number; y1: number; x2: number; y2: number; k: string }[] = []
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
      if (d < 300) arcs.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[j].x, y2: pts[j].y, k: `${i}-${j}` })
    }
  }

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VW} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="cplate-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NAVY_2} />
          <stop offset="55%" stopColor={NAVY} />
          <stop offset="100%" stopColor="#03131F" />
        </linearGradient>
        <radialGradient id="cplate-bloom" cx="22%" cy="30%" r="60%">
          <stop offset="0%" stopColor={COBALT} stopOpacity="0.22" />
          <stop offset="100%" stopColor={COBALT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cplate-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7DA0FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7DA0FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cplate-vignette" cx="50%" cy="48%" r="75%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#00060C" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <rect width={VW} height={H} fill="url(#cplate-field)" />
      <rect width={VW} height={H} fill="url(#cplate-bloom)" />

      {/* graticule */}
      <g stroke="#9FB4CC" strokeWidth={1}>
        {vLines.map((l) => (
          <line key={`v${l.lng}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} opacity={0.07} />
        ))}
        {hLines.map((l) => (
          <line key={`h${l.lat}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} opacity={0.07} />
        ))}
      </g>

      {/* consortium network (hero only) */}
      {hero && (
        <>
          <g stroke={COBALT} strokeWidth={1}>
            {arcs.map((a) => (
              <line key={a.k} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} opacity={0.16} />
            ))}
          </g>
          {pts.map((p) => (
            <g key={p.code}>
              <circle cx={p.x} cy={p.y} r={26} fill="url(#cplate-node)" />
              <circle cx={p.x} cy={p.y} r={3} fill="#A9C0FF" />
            </g>
          ))}
        </>
      )}

      {/* coordinate labels (cartographic survey marks) */}
      <g fill="#8C9BB0" opacity={hero ? 0.5 : 0.38} fontSize={hero ? 13 : 11}
         fontFamily="var(--font-mono, ui-monospace), monospace" letterSpacing="0.12em">
        {LNGS.filter((_, i) => i % 2 === 0).map((lng) => {
          const x = projectEurope(36, lng, VW, H).x
          return <text key={`lx${lng}`} x={x + 6} y={H - 12}>{lng >= 0 ? `${lng}°E` : `${-lng}°W`}</text>
        })}
        {hero && LATS.filter((_, i) => i % 2 === 0).map((lat) => {
          const y = projectEurope(lat, -10, VW, H).y
          return <text key={`ly${lat}`} x={12} y={y - 6}>{lat}°N</text>
        })}
      </g>

      <CornerTicks w={VW} h={H} color="#AFC0D6" opacity={hero ? 0.45 : 0.3} />
      <rect width={VW} height={H} fill="url(#cplate-vignette)" />
    </svg>
  )
}
