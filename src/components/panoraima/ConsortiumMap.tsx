"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox"
import Map, { Marker, Popup, Source, Layer, NavigationControl, AttributionControl } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import {
  PARTNERS,
  PARTNER_BY_CODE,
  type PartnerCode,
  type TimelineEvent,
} from "@/lib/panoraima/types"
import { partnerSubmissionCount, partnerTotalEligibleEvents } from "./helpers"
import SectionHeader from "./SectionHeader"
import {
  NAVY,
  NAVY_3,
  INK,
  SLATE,
  MUTE,
  FAINT,
  LINE,
  COBALT,
  WHITE,
  OK,
  WARN,
  BAD,
  engagementColor,
} from "./consortiumTokens"

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
  const [cursor, setCursor] = useState<"" | "pointer">("")
  const totalEligible = partnerTotalEligibleEvents(events)

  const activeCode = hovered ?? selectedPartner

  // Partner points as a GeoJSON source — used for a single invisible circle
  // layer that Mapbox hit-tests natively. Replacing DOM onMouseEnter/Leave on
  // each <Marker> button with this pattern eliminates the hover flicker that
  // the previous implementation had: DOM markers re-render on pan/zoom and
  // fire enter/leave spuriously; Mapbox canvas hit-testing doesn't.
  const partnersGeoJson = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(
    () => ({
      type: "FeatureCollection",
      features: PARTNERS.map((p) => ({
        type: "Feature",
        properties: { code: p.code },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      })),
    }),
    []
  )

  // Precompute per-partner engagement derivatives (submission rate, color bucket)
  const engagement = useMemo(() => {
    const out: Record<PartnerCode, { rate: number; bucket: "strong" | "ok" | "weak"; fill: string; submitted: number }> =
      {} as never
    for (const p of PARTNERS) {
      const submitted = partnerSubmissionCount(events, p.code)
      const rate = totalEligible > 0 ? submitted / totalEligible : 0
      const bucket = rate >= 0.85 ? "strong" : rate >= 0.6 ? "ok" : "weak"
      const fill = engagementColor(bucket)
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

  // Animated "ant march" on connection lines — we loop a progressive
  // line-dasharray sequence via requestAnimationFrame to give the static
  // gray edges a sense of flow. The try/catch tolerates moments when the
  // layer isn't mounted (e.g. during a style switch).
  useEffect(() => {
    const dashSequence: number[][] = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ]
    let rafId: number | null = null
    let step = -1
    const tick = (ts: number) => {
      const raw = mapRef.current?.getMap()
      if (raw) {
        const nextStep = Math.floor((ts / 90) % dashSequence.length)
        if (nextStep !== step) {
          try {
            raw.setPaintProperty("connections-line", "line-dasharray", dashSequence[nextStep])
          } catch {
            /* layer not ready — happens briefly during style switch */
          }
          step = nextStep
        }
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  // Reset view — returns the map to the initial Europe-wide framing.
  const resetView = () => {
    setHovered(null)
    mapRef.current?.easeTo({
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
      zoom: INITIAL_VIEW.zoom,
      duration: 700,
    })
  }

  // Mapbox canvas-level handlers — no DOM-marker flicker
  const handleMapMouseMove = (ev: MapMouseEvent) => {
    const feature = ev.features?.[0]
    const code = (feature?.properties as { code?: PartnerCode } | null)?.code
    if (code) {
      if (code !== hovered) setHovered(code)
      setCursor("pointer")
    } else {
      if (hovered !== null) setHovered(null)
      setCursor("")
    }
  }
  const handleMapMouseLeave = () => {
    setHovered(null)
    setCursor("")
  }
  const handleMapClick = (ev: MapMouseEvent) => {
    const feature = ev.features?.[0]
    const code = (feature?.properties as { code?: PartnerCode } | null)?.code
    if (code) onPartnerSelect(code)
  }

  const tokenMissing = !MAPBOX_TOKEN

  // Map-style toggle — lives in the SectionHeader `right` slot.
  const styleToggle = !tokenMissing ? (
    <div className="flex rounded-lg border border-[#E3E7ED] bg-white p-0.5">
      {STYLE_OPTIONS.map((s) => {
        const active = s.id === styleId
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyleId(s.id)}
            aria-pressed={active}
            className="px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-[0.12em] rounded transition-colors"
            style={
              active
                ? { background: COBALT, color: WHITE }
                : { color: SLATE }
            }
          >
            {s.label}
          </button>
        )
      })}
    </div>
  ) : null

  return (
    <div className="relative">
      <SectionHeader
        index="02"
        kicker="The consortium"
        title="Fifteen partners, eight countries"
        subtitle="Engagement and submission strength by partner, select a marker for its activity profile."
        right={styleToggle}
      />

      {/* Engagement legend */}
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.12em]" style={{ color: MUTE }}>
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: OK }} /> ≥ 85% submissions
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: WARN }} /> 60–85%
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: BAD }} /> &lt; 60%
        </span>
      </div>

      {/* Body */}
      <div className="relative grid md:grid-cols-[1fr,280px] gap-6">
        {/* Map */}
        <div className="relative rounded-xl overflow-hidden border border-[#E3E7ED] h-[520px] bg-white">
          {/* Floating controls — top-left stack */}
          {!tokenMissing && (
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
              {/* Reset view */}
              <button
                type="button"
                onClick={resetView}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-[0.12em] rounded-lg bg-white border border-[#E3E7ED] transition-colors hover:bg-[#EEF2FF]"
                style={{ color: SLATE }}
                title="Reset to the all-partners view"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Reset view
              </button>
            </div>
          )}
          {tokenMissing ? (
            <div className="w-full h-full flex items-center justify-center p-6 text-center">
              <div>
                <div className="text-sm font-semibold" style={{ color: INK }}>Map unavailable</div>
                <div className="mt-1 text-xs max-w-xs" style={{ color: MUTE }}>
                  Set <code className="font-mono" style={{ color: SLATE }}>NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
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
              cursor={cursor}
              interactiveLayerIds={["partners-hit"]}
              onMouseMove={handleMapMouseMove}
              onMouseLeave={handleMapMouseLeave}
              onClick={handleMapClick}
            >
              <NavigationControl position="top-right" showCompass={false} />
              <AttributionControl position="bottom-right" compact />

              {/* Connection lines — animated dashes flow along every edge via
                  an rAF loop that cycles line-dasharray. Active edges (those
                  from a hovered / selected partner) are brighter and bolder. */}
              <Source id="connections" type="geojson" data={linesGeoJson}>
                <Layer
                  id="connections-line"
                  type="line"
                  layout={{ "line-cap": "round", "line-join": "round" }}
                  paint={{
                    "line-color": [
                      "case",
                      ["==", ["get", "active"], true],
                      COBALT,
                      styleId === "dark" ? "#7DA0FF" : NAVY_3,
                    ],
                    "line-opacity": [
                      "case",
                      ["==", ["get", "active"], true],
                      0.85,
                      styleId === "dark" ? 0.32 : 0.22,
                    ],
                    "line-width": [
                      "case",
                      ["==", ["get", "active"], true],
                      2,
                      1,
                    ],
                    "line-dasharray": [0, 4, 3],
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

              {/* Invisible hit-test layer — Mapbox's onMouseMove fires against
                  this, giving rock-solid hover / click without DOM flicker. */}
              <Source id="partners-src" type="geojson" data={partnersGeoJson}>
                <Layer
                  id="partners-hit"
                  type="circle"
                  paint={{
                    "circle-radius": 16,
                    "circle-color": "#000000",
                    "circle-opacity": 0,
                  }}
                />
              </Source>

              {/* Partner markers (dots + labels) — visual only, pointer-events
                  disabled so they don't fight the hit-test layer. */}
              {PARTNERS.map((p) => {
                const isActive = activeCode === p.code
                const dim = activeCode && !isActive
                const e = engagement[p.code]
                const off = offsetFor(p.code)
                const labelColor =
                  styleId === "dark" || styleId === "satellite" ? "#ffffff" : INK
                const labelShadow =
                  styleId === "dark" || styleId === "satellite"
                    ? "0 0 4px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)"
                    : "0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff"
                return (
                  <Marker
                    key={p.code}
                    longitude={p.lng}
                    latitude={p.lat}
                    offset={off}
                    anchor="center"
                  >
                    <div
                      aria-label={`${p.code}: ${Math.round(e.rate * 100)}% submissions`}
                      className="relative"
                      style={{
                        pointerEvents: "none",
                        opacity: dim ? 0.4 : 1,
                        transition: "opacity 0.25s ease",
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
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono font-semibold"
                        style={{
                          top: (isActive ? 18 : 12) + 4,
                          color: labelColor,
                          textShadow: labelShadow,
                          opacity: isActive ? 1 : 0.85,
                        }}
                      >
                        {p.code}
                      </span>
                    </div>
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
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] font-semibold mb-0.5" style={{ color: COBALT }}>
                          {p.country} · {p.city}
                        </div>
                        <div className="text-sm font-bold leading-tight" style={{ color: INK }}>
                          {p.code}
                        </div>
                        <div className="text-[11px] mt-0.5 leading-snug" style={{ color: MUTE }}>
                          {p.name}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-baseline justify-between text-[10px]">
                            <span className="font-mono font-medium uppercase tracking-wider" style={{ color: FAINT }}>
                              Submission rate
                            </span>
                            <span className="font-bold tabular-nums" style={{ color: INK }}>
                              {Math.round(e.rate * 100)}%
                            </span>
                          </div>
                          <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: LINE }}>
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${e.rate * 100}%`,
                                background: e.fill,
                              }}
                            />
                          </div>
                          <div className="text-[10px] mt-1 tabular-nums" style={{ color: FAINT }}>
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
                  <div className="rounded-xl p-6 animate-fade-in" style={{ background: NAVY, color: WHITE }}>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: "#7DA0FF" }}>
                      {p.country} · {p.city}
                    </div>
                    <div className="text-2xl font-bold mb-1">{p.code}</div>
                    <div className="text-sm leading-relaxed mb-4 text-white/70">{p.name}</div>
                    <div className="border-t border-white/10 pt-4 space-y-3">
                      <div>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] font-medium text-white/55">
                            Submission rate
                          </span>
                          <span className="text-sm font-bold tabular-nums text-white">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-700 ease-out"
                            style={{ width: `${pct}%`, background: e.fill }}
                          />
                        </div>
                        <div className="text-[11px] text-white/55 mt-1 tabular-nums">
                          {e.submitted} of {totalEligible} reports
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onPartnerSelect(activeCode)}
                      className="mt-5 w-full text-xs font-mono font-semibold uppercase tracking-[0.15em] px-4 py-2.5 rounded-lg transition-colors"
                      style={{ background: COBALT, color: WHITE }}
                      onMouseEnter={(ev) => (ev.currentTarget.style.background = "#1D43D8")}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = COBALT)}
                    >
                      View all reports →
                    </button>
                  </div>
                )
              })()
            : (
              <div className="rounded-xl bg-white border border-[#E3E7ED] p-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: FAINT }}>
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
                      <span className="flex items-center gap-2" style={{ color: INK }}>
                        <span className="text-base">{country.flag}</span>
                        <span className="font-medium">{country.c}</span>
                      </span>
                      <span className="font-mono text-xs tabular-nums" style={{ color: MUTE }}>
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
          background: #ffffff;
          border: 1px solid #e3e7ed;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(10, 31, 51, 0.1);
          padding: 12px 14px;
          font-family: inherit;
          color: #0a1f33;
        }
        .panoraima-popup .mapboxgl-popup-tip {
          border-top-color: #ffffff !important;
        }
        .mapboxgl-ctrl-attrib.mapboxgl-compact {
          background: rgba(255, 255, 255, 0.9) !important;
        }
      `}</style>
    </div>
  )
}
