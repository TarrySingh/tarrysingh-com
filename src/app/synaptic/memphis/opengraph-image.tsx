import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt =
  "MEMPHIS, A Hippocampal · Memristive · Neuromorphic Architecture"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c1828",
          color: "#f6ead0",
          padding: 80,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#e8b87a",
          }}
        >
          Synaptic Cartography · MEMPHIS · Plate I · Anno 2026
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 180,
              letterSpacing: 6,
              lineHeight: 1,
              color: "#f6ead0",
            }}
          >
            MEMPHIS
          </div>
          <div
            style={{
              fontSize: 28,
              fontStyle: "italic",
              color: "#d7c8aa",
              marginTop: 28,
              maxWidth: 1000,
              lineHeight: 1.3,
            }}
          >
            A hippocampal · memristive · neuromorphic architecture.
          </div>
        </div>

        <div
          style={{
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#8e96a8",
          }}
        >
          tarrysingh.com / synaptic / memphis
        </div>
      </div>
    ),
    { ...size },
  )
}
