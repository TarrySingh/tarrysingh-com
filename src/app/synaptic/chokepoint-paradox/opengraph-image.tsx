import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt =
  "The Chokepoint Paradox, Europe Holds the Key, Washington Owns the Lock"
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
          background: "#05070d",
          backgroundImage:
            "radial-gradient(ellipse at 28% 30%, #0c2733 0%, #0a1b2a 34%, #07101c 64%, #05070d 100%)",
          color: "#eef3f6",
          padding: 80,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#46c7d6",
          }}
        >
          Synaptic · A Field Guide · Anno 2026
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 96,
              letterSpacing: 1,
              lineHeight: 1.02,
              color: "#f4f8fa",
            }}
          >
            The Chokepoint
          </div>
          <div
            style={{
              fontSize: 96,
              letterSpacing: 1,
              lineHeight: 1.02,
              color: "#e8b54a",
            }}
          >
            Paradox
          </div>
          <div
            style={{
              fontSize: 30,
              fontStyle: "italic",
              color: "#b8c6cf",
              marginTop: 28,
              maxWidth: 1010,
              lineHeight: 1.32,
            }}
          >
            Europe holds the key; Washington owns the lock. The machine that ships
            a continent&rsquo;s wealth, talent and IP west &mdash; in ~40
            interactive instruments.
          </div>
        </div>

        <div
          style={{
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#7d8a94",
          }}
        >
          tarrysingh.com / synaptic / chokepoint-paradox
        </div>
      </div>
    ),
    { ...size },
  )
}
