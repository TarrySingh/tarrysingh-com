"use client"

import { useEffect, useState } from "react"
import { Planisphere } from "@/components/synaptic/Planisphere"
import {
  OBJECTIVES,
  RINGS,
  SECTORS,
} from "@/lib/synaptic/planisphere-data"

const ANNOTATION_CARD_STYLE = {
  borderColor: "rgba(200,180,255,0.14)",
  background:
    "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
  backdropFilter: "blur(8px)" as const,
  WebkitBackdropFilter: "blur(8px)" as const,
}

const ANNOTATION_CARD_ACTIVE_STYLE = {
  borderColor: "rgba(255,210,150,0.55)",
  background:
    "linear-gradient(180deg, rgba(28,38,80,0.85), rgba(14,20,45,0.92))",
  backdropFilter: "blur(8px)" as const,
  WebkitBackdropFilter: "blur(8px)" as const,
  boxShadow:
    "0 0 0 1px rgba(255,210,150,0.25), 0 12px 40px rgba(0,0,0,0.45)",
}

export function SymphonyStudio() {
  const [activeSec, setActiveSec] = useState(0)
  const [hoverSec, setHoverSec] = useState<number | null>(null)
  const [autoplay, setAutoplay] = useState(false)
  const [selectedObj, setSelectedObj] = useState("O2")

  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => {
      setActiveSec((s) => (s + 1) % 12)
    }, 2500)
    return () => clearInterval(id)
  }, [autoplay])

  const sector = SECTORS[hoverSec ?? activeSec]
  const objective = OBJECTIVES.find((o) => o.id === selectedObj)

  return (
    <div className="relative w-full px-6 pt-8 pb-12 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        {/* plate header bar */}
        <div className="flex items-start justify-between syn-small-caps" style={{ color: "var(--ink-dim)" }}>
          <div>
            <div style={{ color: "var(--ink)", letterSpacing: "0.2em", fontSize: "0.78rem" }}>
              PLATE  II  ·  MMXXVI
            </div>
            <div className="mt-1">Anno 2026 · Folio 1.2</div>
          </div>
          <div className="text-right">
            <div style={{ color: "var(--ink)", letterSpacing: "0.2em", fontSize: "0.78rem" }}>
              FIG. 1.2
            </div>
            <div className="mt-1">Planisphere of a</div>
            <div>neuromimetic substrate</div>
          </div>
        </div>
        <hr className="syn-hairline mt-4" />

        {/* title block */}
        <div className="mt-10 text-center">
          <h1
            className="syn-display"
            style={{
              fontSize: "clamp(72px, 12vw, 180px)",
              letterSpacing: "0.08em",
              color: "var(--ink)",
              lineHeight: 1,
              margin: 0,
            }}
          >
            SYMPHONY
          </h1>
          <p
            className="syn-italic-caption mt-4"
            style={{ color: "var(--symphony-violet-hi)" }}
          >
            a planisphere of the neuromimetic code substrate
          </p>
          <p
            className="syn-small-caps mt-2"
            style={{
              color: "var(--ink-dim)",
              letterSpacing: "0.3em",
            }}
          >
            · nervous system for software ·
          </p>
        </div>

        {/* task baton bar */}
        <div
          className="mx-auto mt-10 flex max-w-[820px] items-center gap-3 rounded-2xl border px-4 py-3"
          style={ANNOTATION_CARD_STYLE}
        >
          <span className="syn-small-caps" style={{ color: "var(--ink-dim)" }}>
            task baton
          </span>
          <span
            className="syn-mono flex-1 text-center"
            style={{
              color: "var(--ink)",
              letterSpacing: "var(--track-mono)",
              fontSize: "0.86rem",
            }}
          >
            ν ={" "}
            <span style={{ color: "var(--symphony-amber-hi)" }}>
              {SECTORS[activeSec].task}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setAutoplay((a) => !a)}
            className="syn-mono rounded-full border px-3 py-1 transition-colors"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "var(--track-mono)",
              borderColor: autoplay ? "var(--symphony-violet-hi)" : "rgba(255,255,255,0.2)",
              background: autoplay ? "var(--symphony-violet)" : "transparent",
              color: autoplay ? "#0d1027" : "var(--ink)",
            }}
          >
            {autoplay ? "■  STOP" : "▶  AUTO-MOVEMENT"}
          </button>
        </div>
      </div>

      {/* main grid — planisphere left, side panel right */}
      <div className="mx-auto mt-10 grid max-w-[1440px] grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_380px]">
        {/* PLANISPHERE column */}
        <div className="relative">
          <div className="mx-auto" style={{ maxWidth: "820px" }}>
            <Planisphere
              activeSec={activeSec}
              hoverSec={hoverSec}
              onSectorSelect={setActiveSec}
              onSectorHover={setHoverSec}
            />
          </div>
          <div className="mt-2 text-center">
            <div className="syn-small-caps" style={{ color: "var(--ink-dim)" }}>
              click any sector to point the task baton
            </div>
          </div>

          {/* ring legend — four cards */}
          <div className="mx-auto mt-8 grid max-w-[820px] grid-cols-2 gap-3 md:grid-cols-4">
            {RINGS.map((r) => (
              <div
                key={r.name}
                className="rounded-xl border px-3 py-3"
                style={ANNOTATION_CARD_STYLE}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="syn-display"
                    style={{ color: r.color, fontSize: "1.5rem" }}
                  >
                    {r.numeral}
                  </span>
                  <span
                    className="syn-mono"
                    style={{
                      color: "var(--ink)",
                      fontSize: "0.7rem",
                      letterSpacing: "var(--track-mono)",
                      textTransform: "uppercase",
                    }}
                  >
                    {r.name}
                  </span>
                </div>
                <p className="syn-italic-caption mt-1" style={{ fontSize: "0.78rem" }}>
                  {r.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SIDE PANEL — Movement + Tokens */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Movement card */}
          <div
            className="rounded-2xl border p-6"
            style={ANNOTATION_CARD_ACTIVE_STYLE}
          >
            <div
              className="syn-mono"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--ink-dim)",
              }}
            >
              MOVEMENT
            </div>
            <div
              className="syn-display"
              style={{
                fontSize: "2.6rem",
                lineHeight: 1,
                marginTop: "0.2rem",
                color: "var(--symphony-amber-hi)",
              }}
            >
              {String(sector.id + 1).padStart(2, "0")}
            </div>
            <h3
              className="syn-display mt-2"
              style={{
                fontSize: "1.4rem",
                color: "var(--ink)",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {sector.task}
            </h3>
            <p
              className="syn-italic-caption mt-1"
              style={{ color: "var(--symphony-amber)", fontSize: "0.95rem" }}
            >
              {sector.blurb}
            </p>
            <hr className="syn-hairline my-4" />
            <div
              className="syn-mono"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--ink-dim)",
              }}
            >
              MODULATORY SIGNATURE
            </div>
            <p
              className="mt-1"
              style={{
                color: "var(--ink-cool)",
                fontSize: "0.88rem",
                lineHeight: 1.5,
              }}
            >
              {sector.mod}
            </p>
          </div>

          {/* Tokens grid */}
          <div
            className="rounded-2xl border p-5"
            style={ANNOTATION_CARD_STYLE}
          >
            <div className="syn-small-caps" style={{ color: "var(--ink-dim)" }}>
              tokens
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {SECTORS.map((s) => {
                const isActive = s.id === activeSec
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSec(s.id)}
                    className="syn-mono rounded-md border px-2 py-1.5 text-left transition-colors"
                    style={{
                      fontSize: "0.62rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      background: isActive
                        ? "var(--symphony-amber)"
                        : "transparent",
                      color: isActive ? "#0d1027" : "var(--ink)",
                      borderColor: isActive
                        ? "var(--symphony-amber-hi)"
                        : "rgba(255,255,255,0.1)",
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {s.task.length > 13 ? s.task.split(" ")[0] : s.task}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* objectives strip */}
      <div className="mx-auto mt-14 max-w-[1440px]">
        <div
          className="syn-mono text-center"
          style={{
            color: "var(--ink-dim)",
            fontSize: "0.72rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
          }}
        >
          five objectives
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          {OBJECTIVES.map((o) => {
            const isActive = selectedObj === o.id
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedObj(o.id)}
                className="rounded-xl border p-4 text-left transition"
                style={isActive ? ANNOTATION_CARD_ACTIVE_STYLE : ANNOTATION_CARD_STYLE}
              >
                <div
                  className="syn-display"
                  style={{
                    fontSize: "1.8rem",
                    color: isActive
                      ? "var(--symphony-amber-hi)"
                      : "var(--symphony-violet)",
                    lineHeight: 1,
                  }}
                >
                  {o.id}
                </div>
                <div
                  className="syn-mono mt-2"
                  style={{
                    fontSize: "0.66rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                  }}
                >
                  {o.title}
                </div>
                <div
                  className="syn-italic-caption mt-1"
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--ink-dim)",
                  }}
                >
                  {o.subtitle}
                </div>
              </button>
            )
          })}
        </div>
        {objective ? (
          <div
            key={objective.id}
            className="mt-4 rounded-2xl border p-6"
            style={ANNOTATION_CARD_STYLE}
          >
            <div className="flex items-baseline gap-3">
              <span
                className="syn-display"
                style={{
                  fontSize: "2.4rem",
                  color: "var(--symphony-amber-hi)",
                  lineHeight: 1,
                }}
              >
                {objective.id}
              </span>
              <div>
                <div
                  className="syn-mono"
                  style={{
                    fontSize: "0.66rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                  }}
                >
                  {objective.title}
                </div>
                <div
                  className="syn-italic-caption"
                  style={{
                    fontSize: "0.86rem",
                    color: "var(--symphony-amber)",
                  }}
                >
                  {objective.subtitle}
                </div>
              </div>
            </div>
            <p
              className="mt-3"
              style={{
                color: "var(--ink-cool)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              }}
            >
              {objective.body}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
