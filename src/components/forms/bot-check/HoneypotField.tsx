"use client"

/**
 * <HoneypotField /> - a decoy input that bots fill and people never see.
 *
 * Hidden by an OFF-SCREEN WRAPPER, not by display:none on the input:
 * many bots skip inputs whose own style is display:none, so the input
 * stays "displayed" and only its wrapper is moved off-canvas. Kept away
 * from people three ways: aria-hidden (screen readers), tabIndex -1
 * (keyboard), autoComplete off plus the password-manager ignore hints
 * (autofill). Absolutely positioned, so it never takes part in the
 * form's flex layout.
 *
 * Named `website`, a classic spam-bot magnet, rather than earthscan's
 * `company_website`: browsers map "company" fields to the saved
 * organisation in a person's address profile, and an autofilled
 * honeypot would flag a real subscriber as a bot.
 *
 * Any non-empty value at submit is a bot (realai-crm verifier).
 */

import { useId, type CSSProperties } from "react"

const WRAP_STYLE: CSSProperties = {
  position: "absolute",
  left: "-9999px",
  top: "auto",
  width: 1,
  height: 1,
  overflow: "hidden",
}

export interface HoneypotFieldProps {
  value: string
  onChange: (value: string) => void
}

export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  // Unique per form, so several forms on one page never share an id.
  const id = useId()
  return (
    <div aria-hidden="true" style={WRAP_STYLE}>
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        data-1p-ignore=""
        data-lpignore="true"
        data-bwignore=""
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
