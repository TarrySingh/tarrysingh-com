"use client"

import { useEffect, useRef, useState } from "react"
import {
  TWO_PHASE_ARIA_AWAKE,
  TWO_PHASE_ARIA_SLEEP,
  TWO_PHASE_AWAKE_CAPTION,
  TWO_PHASE_AWAKE_SUB,
  TWO_PHASE_AWAKE_TITLE,
  TWO_PHASE_AXIS_AWAKE_X,
  TWO_PHASE_AXIS_AWAKE_Y,
  TWO_PHASE_AXIS_SLEEP_X,
  TWO_PHASE_AXIS_SLEEP_Y,
  TWO_PHASE_BANNER,
  TWO_PHASE_BTN_AWAKE,
  TWO_PHASE_BTN_SLEEP,
  TWO_PHASE_FOOTER,
  TWO_PHASE_KICKER,
  TWO_PHASE_LEAD,
  TWO_PHASE_PHASE_LABEL,
  TWO_PHASE_SLEEP_CAPTION,
  TWO_PHASE_SLEEP_SUB,
  TWO_PHASE_SLEEP_TITLE,
  TWO_PHASE_TITLE,
} from "@/lib/synaptic/two-phase-dynamics-content"

type Phase = "awake" | "sleep"

const VW = 1200
const VH = 820
const PAD_TOP = 168
const PAD_BOTTOM = 60
const PAD_LEFT = 60
const PAD_RIGHT = 60

const WAVE_VW = 1080
const WAVE_VH = 280

/** Sparse, sharp event-driven spikes shifting over time. */
function AwakeWave({ t, active }: { t: number; active: boolean }) {
  const spikes: { x: number; h: number; opacity: number }[] = []
  const phaseFloor = Math.floor(t * 0.05)
  for (let i = 0; i < 32; i++) {
    const x = 20 + ((i * 53 + phaseFloor * 11) % (WAVE_VW - 40))
    const h = 28 + ((i * 73) % 90)
    const opacity = 0.6 + ((i * 17) % 40) / 100
    spikes.push({ x, h, opacity })
  }
  return (
    <svg
      viewBox={`0 0 ${WAVE_VW} ${WAVE_VH}`}
      className="block h-auto w-full"
      role="img"
      aria-label={TWO_PHASE_ARIA_AWAKE}
    >
      <defs>
        <filter id="syn-tp-glow-amber" x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1={10}
        x2={WAVE_VW - 10}
        y1={WAVE_VH * 0.62}
        y2={WAVE_VH * 0.62}
        stroke="#5aa9b8"
        strokeOpacity={0.45}
        strokeWidth={1}
      />
      {spikes.map((s, i) => (
        <line
          key={i}
          x1={s.x}
          y1={WAVE_VH * 0.62}
          x2={s.x}
          y2={WAVE_VH * 0.62 - s.h}
          stroke="#e8b87a"
          strokeOpacity={active ? s.opacity : s.opacity * 0.4}
          strokeWidth={2}
          filter={active ? "url(#syn-tp-glow-amber)" : undefined}
        />
      ))}
      {/* axis label */}
      <text
        x={20}
        y={WAVE_VH - 14}
        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
        fontSize={12}
        fill="rgba(220,200,160,0.65)"
        letterSpacing={3}
      >
        {TWO_PHASE_AXIS_AWAKE_X}
      </text>
      <text
        x={WAVE_VW - 20}
        y={WAVE_VH - 14}
        textAnchor="end"
        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
        fontSize={12}
        fill="rgba(220,200,160,0.55)"
        letterSpacing={2}
      >
        {TWO_PHASE_AXIS_AWAKE_Y}
      </text>
    </svg>
  )
}

/** Smooth, slow sinusoidal sharp-wave-ripple-style oscillations. */
function SleepWave({ t, active }: { t: number; active: boolean }) {
  const pts1: string[] = []
  const pts2: string[] = []
  const pts3: string[] = []
  const ph = t * 0.0012
  for (let x = 10; x <= WAVE_VW - 10; x += 3) {
    const u = (x - 10) / (WAVE_VW - 20)
    const y1 =
      WAVE_VH * 0.62 -
      Math.sin(u * Math.PI * 4 + ph) * 50 -
      Math.sin(u * Math.PI * 9 + ph * 2) * 10
    const y2 =
      WAVE_VH * 0.62 -
      Math.sin(u * Math.PI * 2.2 + ph * 0.7 + 0.5) * 36 -
      Math.cos(u * Math.PI * 6 + ph) * 12
    const y3 =
      WAVE_VH * 0.62 -
      Math.cos(u * Math.PI * 1.4 + ph * 0.4) * 26
    pts1.push(`${x},${y1}`)
    pts2.push(`${x},${y2}`)
    pts3.push(`${x},${y3}`)
  }
  return (
    <svg
      viewBox={`0 0 ${WAVE_VW} ${WAVE_VH}`}
      className="block h-auto w-full"
      role="img"
      aria-label={TWO_PHASE_ARIA_SLEEP}
    >
      <line
        x1={10}
        x2={WAVE_VW - 10}
        y1={WAVE_VH * 0.62}
        y2={WAVE_VH * 0.62}
        stroke="#5aa9b8"
        strokeOpacity={0.45}
        strokeWidth={1}
      />
      <polyline
        points={pts3.join(" ")}
        fill="none"
        stroke="#a698d4"
        strokeWidth={1.2}
        strokeOpacity={active ? 0.55 : 0.25}
      />
      <polyline
        points={pts2.join(" ")}
        fill="none"
        stroke="#5aa9b8"
        strokeWidth={1.8}
        strokeOpacity={active ? 0.75 : 0.3}
      />
      <polyline
        points={pts1.join(" ")}
        fill="none"
        stroke="#e5a896"
        strokeWidth={2.6}
        strokeOpacity={active ? 0.95 : 0.4}
      />
      <text
        x={20}
        y={WAVE_VH - 14}
        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
        fontSize={12}
        fill="rgba(220,200,160,0.65)"
        letterSpacing={3}
      >
        {TWO_PHASE_AXIS_SLEEP_X}
      </text>
      <text
        x={WAVE_VW - 20}
        y={WAVE_VH - 14}
        textAnchor="end"
        fontFamily="var(--font-mono), 'IBM Plex Mono', monospace"
        fontSize={12}
        fill="rgba(220,200,160,0.55)"
        letterSpacing={2}
      >
        {TWO_PHASE_AXIS_SLEEP_Y}
      </text>
    </svg>
  )
}

export function TwoPhaseDynamics() {
  const [phase, setPhase] = useState<Phase>("awake")
  const [t, setT] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    let raf = 0
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      setT(now - startRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <figure className="syn-memphis">
      <div
        className="rounded-[var(--radius-card)] border"
        style={{
          borderColor: "rgba(232,184,122,0.32)",
          background:
            "linear-gradient(180deg, rgba(20,34,59,0.92), rgba(12,24,40,0.96))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* studio header */}
        <div
          className="px-8 pt-8"
          style={{ paddingLeft: PAD_LEFT, paddingRight: PAD_LEFT }}
        >
          <div className="flex items-baseline justify-between">
            <p
              className="syn-mono"
              style={{
                fontSize: "13px",
                letterSpacing: "0.3em",
                color: "rgba(220,200,160,0.85)",
              }}
            >
              {TWO_PHASE_KICKER}
            </p>
            <p
              className="syn-mono"
              style={{
                fontSize: "11px",
                letterSpacing: "0.25em",
                color: "rgba(220,200,160,0.65)",
              }}
            >
              {TWO_PHASE_BANNER}
            </p>
          </div>
          <hr
            style={{
              border: 0,
              height: 1,
              background: "rgba(220,200,160,0.35)",
              marginTop: 12,
            }}
          />
          <h3
            className="syn-display mt-7"
            style={{
              fontSize: "42px",
              color: "var(--ink)",
              letterSpacing: "0.04em",
              lineHeight: 1,
              margin: 0,
            }}
          >
            {TWO_PHASE_TITLE}
          </h3>
          <p
            className="syn-italic-caption mt-3"
            style={{ color: "var(--ink-cool)", maxWidth: "72ch" }}
          >
            {TWO_PHASE_LEAD}
          </p>
        </div>

        {/* phase pill bar */}
        <div className="mt-6 flex items-center gap-3 px-12">
          <span
            className="syn-small-caps"
            style={{ color: "var(--ink-dim)" }}
          >
            {TWO_PHASE_PHASE_LABEL}
          </span>
          <div className="flex flex-1 items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPhase("awake")}
              className="syn-mono rounded-full border px-5 py-2 transition-colors"
              style={{
                fontSize: "0.78rem",
                letterSpacing: "var(--track-mono)",
                borderColor:
                  phase === "awake"
                    ? "var(--memphis-amber-hi)"
                    : "rgba(255,255,255,0.15)",
                background:
                  phase === "awake"
                    ? "var(--memphis-amber)"
                    : "transparent",
                color: phase === "awake" ? "#0c1828" : "var(--ink)",
                fontWeight: phase === "awake" ? 700 : 400,
              }}
            >
              {TWO_PHASE_BTN_AWAKE}
            </button>
            <button
              type="button"
              onClick={() => setPhase("sleep")}
              className="syn-mono rounded-full border px-5 py-2 transition-colors"
              style={{
                fontSize: "0.78rem",
                letterSpacing: "var(--track-mono)",
                borderColor:
                  phase === "sleep"
                    ? "var(--memphis-rose)"
                    : "rgba(255,255,255,0.15)",
                background:
                  phase === "sleep" ? "var(--memphis-rose)" : "transparent",
                color: phase === "sleep" ? "#0c1828" : "var(--ink)",
                fontWeight: phase === "sleep" ? 700 : 400,
              }}
            >
              {TWO_PHASE_BTN_SLEEP}
            </button>
          </div>
        </div>

        {/* two waveform cards */}
        <div className="mt-6 grid gap-6 px-12 pb-12 md:grid-cols-2">
          <div
            className="rounded-2xl border p-5 transition-opacity"
            style={{
              borderColor:
                phase === "awake"
                  ? "rgba(232,184,122,0.6)"
                  : "rgba(232,184,122,0.18)",
              background:
                "linear-gradient(180deg, rgba(12,24,40,0.85), rgba(8,16,28,0.9))",
              opacity: phase === "awake" ? 1 : 0.6,
            }}
          >
            <div className="flex items-baseline justify-between">
              <p
                className="syn-mono"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.3em",
                  color: "#e8b87a",
                }}
              >
                {TWO_PHASE_AWAKE_TITLE}
              </p>
              <p
                className="syn-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  color: "rgba(220,200,160,0.55)",
                }}
              >
                {TWO_PHASE_AWAKE_SUB}
              </p>
            </div>
            <div className="mt-3">
              <AwakeWave t={t} active={phase === "awake"} />
            </div>
            <p
              className="syn-italic-caption mt-3"
              style={{ fontSize: "0.9rem", color: "var(--ink-cool)" }}
            >
              {TWO_PHASE_AWAKE_CAPTION}
            </p>
          </div>

          <div
            className="rounded-2xl border p-5 transition-opacity"
            style={{
              borderColor:
                phase === "sleep"
                  ? "rgba(229,168,150,0.6)"
                  : "rgba(229,168,150,0.18)",
              background:
                "linear-gradient(180deg, rgba(12,24,40,0.85), rgba(8,16,28,0.9))",
              opacity: phase === "sleep" ? 1 : 0.6,
            }}
          >
            <div className="flex items-baseline justify-between">
              <p
                className="syn-mono"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.3em",
                  color: "#e5a896",
                }}
              >
                {TWO_PHASE_SLEEP_TITLE}
              </p>
              <p
                className="syn-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  color: "rgba(220,200,160,0.55)",
                }}
              >
                {TWO_PHASE_SLEEP_SUB}
              </p>
            </div>
            <div className="mt-3">
              <SleepWave t={t} active={phase === "sleep"} />
            </div>
            <p
              className="syn-italic-caption mt-3"
              style={{ fontSize: "0.9rem", color: "var(--ink-cool)" }}
            >
              {TWO_PHASE_SLEEP_CAPTION}
            </p>
          </div>
        </div>

        <div
          className="border-t px-6 py-4"
          style={{
            borderColor: "rgba(232,184,122,0.18)",
            color: "var(--ink-cool)",
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontStyle: "italic",
            fontSize: "0.98rem",
            lineHeight: 1.5,
          }}
        >
          {TWO_PHASE_FOOTER}
        </div>
      </div>
    </figure>
  )
}
