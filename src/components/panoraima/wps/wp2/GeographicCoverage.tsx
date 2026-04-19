"use client"

import { useMemo, useRef, useState } from "react"
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox"
import Map, { Source, Layer, Marker, Popup, NavigationControl, AttributionControl } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import type { WorkPackageDetail } from "@/lib/panoraima/types"
import { WP_REGION_COORDS } from "@/lib/panoraima/types"

interface Props {
  detail: WorkPackageDetail
}

const MAPBOX_TOKEN =
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : "") || ""

const INITIAL_VIEW = { longitude: 10, latitude: 51, zoom: 3.6 }

export default function GeographicCoverage({ detail }: Props) {
  const mapRef = useRef<MapRef | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [cursor, setCursor] = useState<"" | "pointer">("")

  const byRegion = detail.stats?.by_region ?? {}

  // Count focus-group & interview entries per region from the full timeline
  const regionBreakdown = useMemo(() => {
    const out: Record<string, { files: number; focus_groups: number; latest_date?: string }> = {}
    for (const r of Object.keys(WP_REGION_COORDS)) {
      out[r] = { files: byRegion[r] ?? 0, focus_groups: 0 }
    }
    detail.timeline.forEach((e) => {
      if (!e.region) return
      if (!out[e.region]) return
      if (e.type === "focus_group") out[e.region].focus_groups++
      const prev = out[e.region].latest_date
      if (!prev || e.date > prev) out[e.region].latest_date = e.date
    })
    return out
  }, [detail, byRegion])

  const maxFiles = Math.max(1, ...Object.values(regionBreakdown).map((r) => r.files))

  const geojson = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(
    () => ({
      type: "FeatureCollection",
      features: Object.entries(WP_REGION_COORDS).map(([key, coord]) => ({
        type: "Feature",
        properties: { region: key },
        geometry: { type: "Point", coordinates: [coord.lng, coord.lat] },
      })),
    }),
    []
  )

  const handleMouseMove = (ev: MapMouseEvent) => {
    const feat = ev.features?.[0]
    const region = (feat?.properties as { region?: string } | null)?.region
    if (region) {
      if (region !== hovered) setHovered(region)
      setCursor("pointer")
    } else {
      if (hovered !== null) setHovered(null)
      setCursor("")
    }
  }
  const handleMouseLeave = () => { setHovered(null); setCursor("") }

  const resetView = () => {
    setHovered(null)
    mapRef.current?.easeTo({
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
      zoom: INITIAL_VIEW.zoom,
      duration: 600,
    })
  }

  const tokenMissing = !MAPBOX_TOKEN

  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
            Geographic coverage
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
            Four countries, four stakeholder lenses
          </h2>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            Where the WP2 focus groups ran. Dot size scales with file volume.
          </p>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-gray-100 h-[420px] bg-white">
        {!tokenMissing && (
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={resetView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white/95 backdrop-blur shadow-md border border-gray-200 text-navy-700 hover:bg-navy-50 transition-colors"
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
              <div className="text-sm font-semibold text-navy-800">Map unavailable</div>
              <div className="mt-1 text-xs text-gray-500">
                <code className="font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code> missing.
              </div>
            </div>
          </div>
        ) : (
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={INITIAL_VIEW}
            maxBounds={[[-25, 30], [55, 70]]}
            minZoom={2.8}
            maxZoom={9}
            mapStyle="mapbox://styles/mapbox/light-v11"
            attributionControl={false}
            reuseMaps
            style={{ width: "100%", height: "100%" }}
            cursor={cursor}
            interactiveLayerIds={["wp2-region-hit"]}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <NavigationControl position="top-right" showCompass={false} />
            <AttributionControl position="bottom-right" compact />

            <Source id="wp2-regions" type="geojson" data={geojson}>
              <Layer
                id="wp2-region-hit"
                type="circle"
                paint={{
                  "circle-radius": 20,
                  "circle-color": "#000",
                  "circle-opacity": 0,
                }}
              />
            </Source>

            {Object.entries(WP_REGION_COORDS).map(([region, coord]) => {
              const info = regionBreakdown[region]
              const scale = info.files / maxFiles
              const size = 10 + Math.round(20 * scale) // 10px → 30px
              const isActive = hovered === region
              return (
                <Marker key={region} longitude={coord.lng} latitude={coord.lat} anchor="center">
                  <div className="relative" style={{ pointerEvents: "none" }}>
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute rounded-full opacity-30"
                        style={{
                          width: size + 30,
                          height: size + 30,
                          background: detail.color,
                          left: -(size + 30) / 2,
                          top: -(size + 30) / 2,
                          animation: "wp-pulse 1.8s ease-out infinite",
                        }}
                      />
                    )}
                    <span
                      aria-hidden
                      className="block rounded-full border-2 border-white shadow"
                      style={{
                        width: size,
                        height: size,
                        marginLeft: -size / 2,
                        marginTop: -size / 2,
                        background: detail.color,
                        transition: "width 0.25s, height 0.25s",
                      }}
                    />
                    <span
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-mono font-semibold text-navy-900"
                      style={{
                        top: size / 2 + 4,
                        textShadow:
                          "0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff",
                      }}
                    >
                      {region}
                    </span>
                  </div>
                </Marker>
              )
            })}

            {hovered && (
              <Popup
                longitude={WP_REGION_COORDS[hovered].lng}
                latitude={WP_REGION_COORDS[hovered].lat}
                offset={22}
                anchor="bottom"
                closeButton={false}
                closeOnClick={false}
                className="panoraima-popup"
              >
                {(() => {
                  const info = regionBreakdown[hovered]
                  return (
                    <div className="px-1 py-0.5 min-w-[200px]">
                      <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-gold-600 mb-0.5">
                        {hovered}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Files
                          </div>
                          <div className="text-lg font-bold tabular-nums text-navy-900">
                            {info.files}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Focus groups
                          </div>
                          <div className="text-lg font-bold tabular-nums text-navy-900">
                            {info.focus_groups}
                          </div>
                        </div>
                      </div>
                      {info.latest_date && (
                        <div className="mt-2 text-[10px] text-gray-400 font-mono">
                          Latest: {info.latest_date}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </Popup>
            )}
          </Map>
        )}
      </div>

      <style jsx global>{`
        @keyframes wp-pulse {
          0%   { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0;   }
        }
        .panoraima-popup,
        .panoraima-popup .mapboxgl-popup-content,
        .panoraima-popup .mapboxgl-popup-tip { pointer-events: none !important; }
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
      `}</style>
    </section>
  )
}
