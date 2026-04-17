"use client"

import { useState } from "react"
import { PARTNERS, type PartnerCode, type TimelineEvent } from "@/lib/panoraima/types"
import { partnerSubmissionCount, partnerTotalEligibleEvents, projectEurope } from "./helpers"

interface Props {
  events: TimelineEvent[]
  onPartnerSelect: (code: PartnerCode) => void
  selectedPartner: PartnerCode | null
}

// Simplified Europe country outline (rough multipolygon for visual context).
// Intentionally abstract — a stylized map that frames the partner nodes.
const EUROPE_PATH = `
  M 92 128 L 108 108 L 144 102 L 168 124 L 192 118 L 204 104 L 238 96 L 268 112 L 282 134 L 302 128 L 326 112 L 358 122 L 372 144 L 392 132 L 418 138 L 446 162 L 458 186 L 484 196 L 508 184 L 532 202 L 556 232 L 558 264 L 536 286 L 516 306 L 528 334 L 516 362 L 490 378 L 462 382 L 434 398 L 408 408 L 384 422 L 356 418 L 326 432 L 298 442 L 272 438 L 248 424 L 226 410 L 208 392 L 188 372 L 172 352 L 164 332 L 148 316 L 132 296 L 122 270 L 118 244 L 108 220 L 92 196 L 82 166 L 92 128 Z
`

export default function ConsortiumMap({ events, onPartnerSelect, selectedPartner }: Props) {
  const [hovered, setHovered] = useState<PartnerCode | null>(null)
  const W = 640
  const H = 520
  const activeCode = hovered ?? selectedPartner
  const totalEligible = partnerTotalEligibleEvents(events)

  return (
    <div className="relative bg-gradient-to-br from-navy-50/40 via-white to-gold-50/20 rounded-3xl border border-gray-100 overflow-hidden">
      {/* Background grid */}
      <svg aria-hidden className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#0A1628" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="relative px-6 md:px-10 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
              Consortium
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
              The partners, mapped
            </h2>
            <p className="mt-1 text-sm text-gray-500 max-w-md">
              Hover a dot to preview a partner. Click to trace their activity across every event.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-500" /> Partner
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" /> Active
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Low engagement
            </span>
          </div>
        </div>
      </div>

      <div className="relative grid md:grid-cols-[1fr,280px] gap-6 px-6 md:px-10 pb-10">
        {/* Map */}
        <div className="relative aspect-[640/520] w-full">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
            <defs>
              <radialGradient id="land" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#0A1628" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#0A1628" stopOpacity="0.01" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Europe silhouette */}
            <path d={EUROPE_PATH} fill="url(#land)" stroke="#0A1628" strokeOpacity="0.1" strokeWidth="1" />

            {/* Connection web between partners */}
            <g opacity={activeCode ? 0.25 : 0.12}>
              {PARTNERS.map((a, i) =>
                PARTNERS.slice(i + 1).map((b, j) => {
                  const p1 = projectEurope(a.lat, a.lng, W, H)
                  const p2 = projectEurope(b.lat, b.lng, W, H)
                  return (
                    <line
                      key={`${a.code}-${b.code}`}
                      x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                      stroke="#0A1628"
                      strokeWidth="0.3"
                    />
                  )
                })
              )}
            </g>

            {/* Highlighted connections for active partner */}
            {activeCode && (
              <g>
                {PARTNERS.filter(p => p.code !== activeCode).map(other => {
                  const origin = PARTNERS.find(p => p.code === activeCode)!
                  const p1 = projectEurope(origin.lat, origin.lng, W, H)
                  const p2 = projectEurope(other.lat, other.lng, W, H)
                  return (
                    <line
                      key={`active-${other.code}`}
                      x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                      stroke="#C9A96E"
                      strokeOpacity="0.55"
                      strokeWidth="1.2"
                      style={{ transition: "stroke-opacity 0.3s" }}
                    />
                  )
                })}
              </g>
            )}

            {/* Dots */}
            {PARTNERS.map(partner => {
              const { x, y } = projectEurope(partner.lat, partner.lng, W, H)
              const sub = partnerSubmissionCount(events, partner.code)
              const pct = totalEligible > 0 ? sub / totalEligible : 0
              const isActive = activeCode === partner.code
              const dim = activeCode && !isActive
              const r = isActive ? 10 : 6
              const engagement = pct >= 0.85 ? "strong" : pct >= 0.6 ? "ok" : "weak"
              const fill = engagement === "strong" ? "#10b981" : engagement === "ok" ? "#C9A96E" : "#f43f5e"

              return (
                <g
                  key={partner.code}
                  onMouseEnter={() => setHovered(partner.code)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onPartnerSelect(partner.code)}
                  style={{ cursor: "pointer", opacity: dim ? 0.3 : 1, transition: "opacity 0.25s" }}
                >
                  {/* Pulse ring when active */}
                  {isActive && (
                    <>
                      <circle cx={x} cy={y} r={r + 10} fill={fill} opacity={0.15}>
                        <animate attributeName="r" from={r + 6} to={r + 18} dur="1.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.35" to="0" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  <circle
                    cx={x} cy={y} r={r}
                    fill={fill}
                    stroke="white"
                    strokeWidth={2}
                    style={{ transition: "r 0.3s ease, fill 0.3s" }}
                    filter={isActive ? "url(#glow)" : undefined}
                  />
                  {/* Label */}
                  <text
                    x={x}
                    y={y - r - 8}
                    fontSize="11"
                    fontWeight={600}
                    textAnchor="middle"
                    fill="#0A1628"
                    style={{ opacity: isActive ? 1 : 0.75, transition: "opacity 0.3s" }}
                  >
                    {partner.code}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          {activeCode ? (() => {
            const p = PARTNERS.find(x => x.code === activeCode)!
            const sub = partnerSubmissionCount(events, activeCode)
            const pct = Math.round((sub / Math.max(1, totalEligible)) * 100)
            return (
              <div className="rounded-2xl bg-navy-900 text-white p-6 animate-fade-in">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold-300 font-semibold mb-2">
                  {p.country} · {p.city}
                </div>
                <div className="text-2xl font-bold mb-1">{p.code}</div>
                <div className="text-sm text-navy-100/80 leading-relaxed mb-4">{p.name}</div>
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-navy-100/60 font-medium">Submission rate</span>
                      <span className="text-sm font-bold tabular-nums text-white">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-navy-100/60 mt-1">
                      {sub} of {totalEligible} reports
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onPartnerSelect(activeCode)}
                  className="mt-5 w-full text-xs font-semibold uppercase tracking-[0.15em] px-4 py-2.5 rounded-lg bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors"
                >
                  View all reports →
                </button>
              </div>
            )
          })() : (
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold mb-3">
                By country
              </div>
              <div className="space-y-2">
                {[
                  { c: "Italy",       n: 3, flag: "🇮🇹" },
                  { c: "Ireland",     n: 3, flag: "🇮🇪" },
                  { c: "Hungary",     n: 2, flag: "🇭🇺" },
                  { c: "Bulgaria",    n: 2, flag: "🇧🇬" },
                  { c: "Netherlands", n: 2, flag: "🇳🇱" },
                  { c: "Germany",     n: 1, flag: "🇩🇪" },
                  { c: "Greece",      n: 1, flag: "🇬🇷" },
                  { c: "Ukraine",     n: 1, flag: "🇺🇦" },
                ].map(country => (
                  <div key={country.c} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-navy-900">
                      <span className="text-base">{country.flag}</span>
                      <span className="font-medium">{country.c}</span>
                    </span>
                    <span className="text-gray-400 font-mono text-xs">{country.n} {country.n === 1 ? "partner" : "partners"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
