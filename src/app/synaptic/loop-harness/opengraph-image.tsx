import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "The Engine Room — Loop & Harness Engineering"
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
          background: "#060b0c",
          backgroundImage:
            "radial-gradient(ellipse at 30% 28%, #16241f 0%, #0e1a18 34%, #0a1211 64%, #060b0c 100%)",
          color: "#e9f2ec",
          padding: 80,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#53e08c",
          }}
        >
          Synaptic · A Field Manual · Anno 2026
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, letterSpacing: 1, lineHeight: 1.0, color: "#f2faf5" }}>
            The Engine Room
          </div>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#f4cd86",
              marginTop: 14,
            }}
          >
            Loop &amp; Harness Engineering
          </div>
          <div
            style={{
              fontSize: 29,
              fontStyle: "italic",
              color: "#9fb3a9",
              marginTop: 28,
              maxWidth: 1010,
              lineHeight: 1.32,
            }}
          >
            Whether a model ever does useful work is decided by two other things:
            the loop it runs in, and the standing structure that loop runs inside.
            A 30,000-word field manual &mdash; fifteen interactive instruments.
          </div>
        </div>

        <div
          style={{
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#7c95a6",
          }}
        >
          tarrysingh.com / synaptic / loop-harness
        </div>
      </div>
    ),
    { ...size },
  )
}
