import { ImageResponse } from "next/og"
import raw from "@/content/cv/public.json"
import { toRoman } from "@/lib/cv/format"

/**
 * Open Graph card for the public profile, in the MEMPHIS plate manner:
 * midnight ground, copper registration marks, the name, a neutral line
 * naming what the page holds, and the address. Deliberately NOT the
 * positioning statement: a link preview travels further than the page, and
 * it must carry no availability or "mandate" wording.
 */
export const alt = "Tarry Singh · Executive profile"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type Raw = { profile?: { name?: string } | null }

const LINE = "Career meridian · signature programmes · leadership matrix"

/** A copper registration mark; only defined properties (satori rejects undefined). */
const mark = (corner: "tl" | "tr" | "bl" | "br") => {
  const top = corner.startsWith("t")
  const left = corner.endsWith("l")
  const line = "1px solid #c98e4f"
  return {
    position: "absolute" as const,
    width: 28,
    height: 28,
    ...(top ? { top: 28, borderTop: line } : { bottom: 28, borderBottom: line }),
    ...(left ? { left: 28, borderLeft: line } : { right: 28, borderRight: line }),
  }
}

export default async function Image() {
  const name = (raw as Raw).profile?.name ?? "Tarry Singh"
  const line = LINE
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c1828",
          backgroundImage: "radial-gradient(ellipse at 80% 0%, #14223b 0%, #0c1828 65%)",
          color: "#f6ead0",
          padding: "84px 88px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={mark("tl")} />
        <div style={mark("tr")} />
        <div style={mark("bl")} />
        <div style={mark("br")} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: 18,
            borderBottom: "1px solid rgba(230, 214, 180, 0.45)",
            fontSize: 20,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#d7c8aa",
          }}
        >
          <span>Folio · Curriculum vitae</span>
          <span style={{ color: "#e8b87a" }}>{`Anno ${toRoman(new Date().getUTCFullYear())}`}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, letterSpacing: 7, lineHeight: 1, color: "#f6ead0" }}>
            {name}
          </div>
          {line ? (
            <div
              style={{
                marginTop: 30,
                maxWidth: 980,
                fontSize: 30,
                fontStyle: "italic",
                lineHeight: 1.35,
                color: "#d7c8aa",
              }}
            >
              {line}
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
            {["#e8b87a", "#5aa9b8", "#e5a896", "#a698d4"].map((c, i) => (
              <div
                key={c}
                style={{
                  width: [220, 180, 120, 90][i],
                  height: 6,
                  marginRight: 14,
                  borderRadius: 2,
                  background: c,
                  opacity: 0.9,
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8e96a8",
          }}
        >
          <span>Executive profile</span>
          <span>tarrysingh.com / curriculumvitae</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
