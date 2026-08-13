import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Software 3.0, Age of Hyper-Automation · an instrument gallery"
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
          background: "#0a0a1e",
          backgroundImage:
            "radial-gradient(ellipse at center 38%, #221f4a 0%, #171633 30%, #0e0d24 66%, #0a0a1e 100%)",
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
            color: "#e8a44a",
          }}
        >
          Synaptic Cartography · Plate III · Anno 2026
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 130,
              letterSpacing: 2,
              lineHeight: 1,
              color: "#f6ead0",
            }}
          >
            SOFTWARE 3.0
          </div>
          <div
            style={{
              fontSize: 30,
              fontStyle: "italic",
              color: "#d7c8aa",
              marginTop: 26,
              maxWidth: 1000,
              lineHeight: 1.3,
            }}
          >
            The age of hyper-automation, a map to 2040, in fifteen interactive
            instruments.
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
          tarrysingh.com / synaptic / software-3
        </div>
      </div>
    ),
    { ...size },
  )
}
