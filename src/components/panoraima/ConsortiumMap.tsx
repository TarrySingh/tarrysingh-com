"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import Map, { Marker, Popup, Source, Layer, NavigationControl, AttributionControl } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  PARTNERS,
  PARTNER_BY_CODE,
  type PartnerCode,
  type TimelineEvent,
} from "@/lib/panoraima/types"
import { partnerSubmissionCount, partnerTotalEligibleEvents } from "./helpers"

interface Props {
  events: TimelineEvent[]
  onPartnerSelect: (code: PartnerCode) => void
  selectedPartner: PartnerCode | null
}

// -----------------------------------------------------------------------------
// All 15 partners now have precise (different) addresses, so no coordinate
// clustering is needed. Keep a noop offset function in case a future partner
// happens to share a building with another. Also keep it so the rest of the
// component doesn't need to change.
// -----------------------------------------------------------------------------
function offsetFor(_code: PartnerCode): [number, number] {
  return [0, 0]
}

const EUROPE_BOUNDS: [[number, number], [number, number]] = [
  [-12, 35], // SW
  [40, 62],  // NE
]

const INITIAL_VIEW = {
  longitude: 15,
  latitude: 48,
  zoom: 3.4,
}

const MAPBOX_TOKEN =
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : "") || ""

const STYLE_OPTIONS = [
  { id: "light", label: "Map",       url: "mapbox://styles/mapbox/light-v11" },
  { id: "satellite", label: "Satellite", url: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "dark",  label: "Dark",      url: "mapbox://styles/mapbox/dark-v11" },
] as const
type StyleId = typeof STYLE_OPTIONS[number]["id"]

export default function ConsortiumMap({
  events,
  onPartnerSelect,
  selectedPartner,
}: Props) {
  const mapRef = useRef<MapRef | null>(null)
  const [hovered, setHovered] = useState<PartnerCode | null>(null)
  const [styleId, setStyleId] = useState<StyleId>("light")
  const totalEligible = partnerTotalEligibleEvents(events)

  const activeCode = hovered ?? selectedPartner

  // Precompute per-partner engagement derivatives (submission rate, color bucket)
  const engagement = useMemo(() => {
    const out: Record<PartnerCode, { rate: number; bucket: "strong" | "ok" | "weak"; fill: string; submitted: number }> =
      {} as never
    for (const p of PARTNERS) {
      const submitted = partnerSubmissionCount(events, p.code)
      const rate = totalEligible > 0 ? submitted / totalEligible : 0
      const bucket = rate >= 0.85 ? "strong" : rate >= 0.6 ? "ok" : "weak"
      const fill = bucket === "strong" ? "#10b981" : bucket === "ok" ? "#C9A96E" : "#f43f5e"
      out[p.code] = { rate, bucket, fill, submitted }
    }
    return out
  }, [events, totalEligible])

  // Connection-line GeoJSON: when a partner is active, draw lines from it to
  // every other partner. Otherwise, a sparse web across the whole consortium.
  const linesGeoJson = useMemo(() => {
    const features: GeoJSON.Feature<GeoJSON.LineString>[] = []
    if (activeCode) {
      const origin = PARTNER_BY_CODE[activeCode]
      for (const other of PARTNERS) {
        if (other.code === activeCode) continue
        features.push({
          type: "Feature",
          properties: { active: true },
          geometry: {
            type: "LineString",
            coordinates: [
              [origin.lng, origin.lat],
              [other.lng, other.lat],
            ],
          },
        })
      }
    } else {
      for (let i = 0; i < PARTNERS.length; i++) {
        for (let j = i + 1; j < PARTNERS.length; j++) {
          const a = PARTNERS[i]
          const b = PARTNERS[j]
          features.push({
            type: "Feature",
            properties: { active: false },
            geometry: {
              type: "LineString",
              coordinates: [
                [a.lng, a.lat],
                [b.lng, b.lat],
              ],
            },
          })
        }
      }
    }
    return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection<GeoJSON.LineString>
  }, [activeCode])

  // When selected partner changes, ease the map toward it
  useEffect(() => {
    if (!selectedPartner) return
    const p = PARTNER_BY_CODE[selectedPartner]
    mapRef.current?.easeTo({ center: [p.lng, p.lat], zoom: 4.5, duration: 900 })
  }, [selectedPartner])

  const tokenMissing = !MAPBOX_TOKEN

  return (
    <div className="relative bg-gradient-to-br from-navy-50/40 via-white to-gold-50/20 rounded-3xl border border-gray-100 overflow-hidden">
      {/* Header */}
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
              Pan and zoom freely. Hover a dot for a quick preview. Click to trace activity
              across every event.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> ≥ 85% submissions
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-500" /> 60–85%
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt; 60%
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative grid md:grid-cols-[1fr,280px] gap-6 px-6 md:px-10 pb-10">
        {/* Map */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 h-[520px] bg-white">
          {/* Layer switcher (floats top-left over the map) */}
          {!tokenMissing && (
            <div className="absolute top-3 left-3 z-10 flex rounded-lg bg-white/95 backdrop-blur shadow-md border border-gray-200 p-0.5">
              {STYLE_OPTIONS.map((s) => {
                const active = s.id === styleId
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyleId(s.id)}
                    className={`px-3 py-1 text-[11px] font-semibold rounded transition-colors ${
                      active
                        ? "bg-navy-900 text-white"
                        : "text-navy-700 hover:bg-navy-50"
                    }`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          )}
          {tokenMissing ? (
            <div className="w-full h-full flex items-center justify-center p-6 text-center">
              <div>
                <div className="text-sm font-semibold text-navy-800">Map unavailable</div>
                <div className="mt-1 text-xs text-gray-500 max-w-xs">
                  Set <code className="font-mono text-gray-700">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
                  in your Vercel project env to render the Mapbox view.
                </div>
              </div>
            </div>
          ) : (
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={INITIAL_VIEW}
              maxBounds={[
                [-25, 30],
                [55, 70],
              ]}
              minZoom={2.8}
              maxZoom={9}
              mapStyle={STYLE_OPTIONS.find(s => s.id === styleId)!.url}
              attributionControl={false}
              reuseMaps
              style={{ width: "100%", height: "100%" }}
            >
              <NavigationControl position="top-right" showCompass={false} />
              <AttributionControl position="bottom-right" compact />

              {/* Connection lines */}
              <Source id="connections" type="geojson" data={linesGeoJson}>
                <Layer
                  id="connections-line"
                  type="line"
                  paint={{
                    "line-color": [
                      "case",
                      ["==", ["get", "active"], true],
                      "#C9A96E",
                      "#0A1628",
                    ],
                    "line-opacity": [
                      "case",
                      ["==", ["get", "active"], true],
                      0.55,
                      0.08,
                    ],
                    "line-width": [
                      "case",
                      ["==", ["get", "active"], true],
                      1.4,
                      0.6,
                    ],
                  }}
                />
              </Source>

              {/* Partner markers (bottom layer: pulse ring for active) */}
              {PARTNERS.map((p) => {
                const isActive = activeCode === p.code
                if (!isActive) return null
                return (
                  <Marker
                    key={`pulse-${p.code}`}
                    longitude={p.lng}
                    latitude={p.lat}
                    offset={offsetFor(p.code)}
                    anchor="center"
                  >
                    <span
                      aria-hidden
                      className="block rounded-full opacity-30"
                      style={{
                        width: 40,
                        height: 40,
                        background: engagement[p.code].fill,
                        animation: "consortium-pulse 1.8s ease-out infinite",
                        marginLeft: -20,
                        marginTop: -20,
                      }}
                    />
                  </Marker>
                )
              })}

              {/* Partner markers (dots + labels) */}
              {PARTNERS.map((p) => {
                const isActive = activeCode === p.code
                const dim = activeCode && !isActive
                const e = engagement[p.code]
                const off = offsetFor(p.code)
                return (
                  <Marker
                    key={p.code}
                    longitude={p.lng}
                    latitude={p.lat}
                    offset={off}
                    anchor="center"
                  >
                    <button
                      onMouseEnter={() => setHovered(p.code)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        onPartnerSelect(p.code)
                      }}
                      aria-label={`${p.code}: ${Math.round(e.rate * 100)}% submissions`}
                      className="group relative block outline-none"
                      style={{
                        opacity: dim ? 0.35 : 1,
                        transition: "opacity 0.25s ease",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        aria-hidden
                        className="block rounded-full border-2 border-white shadow"
                        style={{
                          width: isActive ? 18 : 12,
                          height: isActive ? 18 : 12,
                          background: e.fill,
                          transition: "width 0.25s ease, height 0.25s ease",
                        }}
                      />
                      <span
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono font-semibold text-navy-900"
                        style={{
                          top: (isActive ? 18 : 12) + 4,
                          textShadow:
                            "0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff",
                          opacity: isActive ? 1 : 0.85,
                          pointerEvents: "none",
                        }}
                      >
                        {p.code}
                      </span>
                    </button>
                  </Marker>
                )
              })}

              {/* Hover popup — pointer-events disabled on the content so
                  moving the cursor onto the popup never interrupts the
                  marker's mouseenter/leave, which previously caused flicker. */}
              {hovered && (
                <Popup
                  longitude={PARTNER_BY_CODE[hovered].lng}
                  latitude={PARTNER_BY_CODE[hovered].lat}
                  offset={18}
                  anchor="bottom"
                  closeButton={false}
                  closeOnClick={false}
                  className="panoraima-popup"
                >
                  {(() => {
                    const p = PARTNER_BY_CODE[hovered]
                    const e = engagement[hovered]
                    return (
                      <div className="px-1 py-0.5 min-w-[200px]">
                        <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-gold-600 mb-0.5">
                          {p.country} · {p.city}
                        </div>
                        <div className="text-sm font-bold text-navy-900 leading-tight">
                          {p.code}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          {p.name}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-baseline justify-between text-[10px]">
                            <span className="text-gray-400 font-medium uppercase tracking-wider">
                              Submission rate
                            </span>
                            <span className="font-bold tabular-nums text-navy-900">
                              {Math.round(e.rate * 100)}%
                            </span>
                          </div>
                          <div className="h-1 mt-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${e.rate * 100}%`,
                                background: e.fill,
                              }}
                            />
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            {e.submitted} of {totalEligible} reports
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </Popup>
              )}
            </Map>
          )}
        </div>

        {/* Sidebar (unchanged behavior) */}
        <div className="flex flex-col gap-3">
          {activeCode
            ? (() => {
                const p = PARTNER_BY_CODE[activeCode]
                const e = engagement[activeCode]
                const pct = Math.round(e.rate * 100)
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
                          <span className="text-xs text-navy-100/60 font-medium">
                            Submission rate
                          </span>
                          <span className="text-sm font-bold tabular-nums text-white">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-700 ease-out"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-navy-100/60 mt-1">
                          {e.submitted} of {totalEligible} reports
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
              })()
            : (
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
                  ].map((country) => (
                    <div key={country.c} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-navy-900">
                        <span className="text-base">{country.flag}</span>
                        <span className="font-medium">{country.c}</span>
                      </span>
                      <span className="text-gray-400 font-mono text-xs">
                        {country.n} {country.n === 1 ? "partner" : "partners"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Popup + animation styles scoped to this component */}
      <style jsx global>{`
        @keyframes consortium-pulse {
          0%   { transform: scale(0.5); opacity: 0.55; }
          100% { transform: scale(1.6); opacity: 0;    }
        }
        /* Hover preview: disable pointer events so the popup never
           blocks the marker and never takes its own hover. */
        .panoraima-popup,
        .panoraima-popup .mapboxgl-popup-content,
        .panoraima-popup .mapboxgl-popup-tip {
          pointer-events: none !important;
        }
        .panoraima-popup .mapboxgl-popup-content {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(10, 22, 40, 0.12);
          padding: 12px 14px;
          font-family: inherit;
        }
        .panoraima-popup .mapboxgl-popup-tip {
          border-top-color: rgba(255, 255, 255, 0.96) !important;
        }
        .mapboxgl-ctrl-attrib.mapboxgl-compact {
          background: rgba(255, 255, 255, 0.85) !important;
        }
      `}</style>
    </div>
  )
}
