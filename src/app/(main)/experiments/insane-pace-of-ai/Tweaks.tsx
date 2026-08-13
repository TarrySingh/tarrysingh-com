"use client"

import { Dispatch, SetStateAction } from "react"
import { NAV } from "./nav"

const ACCENTS = [
  { hex: "#E8542B", label: "E85" },
  { hex: "#E8B84A", label: "E8B" },
  { hex: "#7BAA7E", label: "7BA" },
  { hex: "#6F89A6", label: "6F8" },
  { hex: "#C77069", label: "C77" },
  { hex: "#F3A36B", label: "F3A" },
]

export default function Tweaks({
  accent,
  setAccent,
  onClose,
  onJump,
}: {
  accent: string
  setAccent: Dispatch<SetStateAction<string>>
  onClose: () => void
  onJump: (id: string) => void
}) {
  return (
    <div className="ipoai-tweaks" role="dialog" aria-label="Tweaks">
      <h5>
        <span>TWEAKS</span>
        <button
          onClick={onClose}
          aria-label="Close tweaks"
          style={{
            background: "none",
            border: "none",
            color: "var(--fg-3)",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      </h5>
      <div className="ipoai-tweaks-row">
        <div className="label" style={{ display: "block", marginBottom: 8 }}>Accent color</div>
        <div className="toggle-row">
          {ACCENTS.map((c) => (
            <button
              key={c.hex}
              className={`chip ${accent === c.hex ? "on" : ""}`}
              style={{ background: c.hex, color: "#0B0D10", borderColor: c.hex }}
              onClick={() => setAccent(c.hex)}
              aria-pressed={accent === c.hex}
              aria-label={`Accent ${c.label}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="ipoai-tweaks-row">
        <div className="label" style={{ display: "block", marginBottom: 8 }}>Jump to section</div>
        <select
          onChange={(e) => onJump(e.target.value)}
          defaultValue=""
          style={{
            width: "100%",
            background: "var(--ink-3)",
            color: "var(--fg)",
            border: "1px solid var(--rule)",
            padding: "8px 10px",
            fontFamily: "var(--mono)",
            fontSize: 11,
          }}
        >
          <option value="" disabled>Pick a section…</option>
          {NAV.flatMap((g) => g.items as readonly { id: string; n: string; name: string; pg: string }[]).map((it) => (
            <option key={it.id} value={it.id}>
              § {it.n}, {it.name}
            </option>
          ))}
        </select>
      </div>
      <div className="footnote" style={{ marginTop: 8 }}>
        Accent color is the single brand hue, it reflows through every chart, number, and rule.
      </div>
    </div>
  )
}
