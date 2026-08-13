// WP4 "corporate" design system — modelled on the EarthScan platform/admin
// aesthetic: near-monochrome, hairline flat cards, uppercase tracked micro-
// labels in a single rust accent, technical numerals, generous whitespace.
// Deliberately NOT the navy/gold multi-colour look of the other WP pages.

// --- the single accent + neutral ladder -----------------------------------
export const RUST = "#B23E22"          // the one accent (terracotta/brick) — a touch deeper for contrast
export const RUST_SOFT = "#FBEAE5"     // rust tint for backgrounds
export const INK = "#14161B"           // near-black headings
export const INK_SOFT = "#363A42"
export const MUTE = "#444A55"          // body / muted — darkened for readability (was #6B7280)
export const FAINT = "#646B78"         // secondary labels — darkened so they're actually readable (was #9CA3AF)
export const LINE = "#DCDDE1"          // hairline borders — a touch stronger
export const SURFACE = "#FAFAF9"       // off-white section bg

// --- tracks: muted, desaturated stone/slate tones (no rainbow) ------------
export const TRACK_ORDER = [
  "Horizontal",
  "Health",
  "Media",
  "Law & Compliance",
  "Management & Finance",
] as const

export const TRACK_COLOR: Record<string, string> = {
  "Horizontal": "#7C8DA6",            // slate
  "Health": "#5E8C7B",                // muted teal-green
  "Media": "#8A7CA8",                 // muted violet-gray
  "Law & Compliance": "#C0492B",      // rust (the compliance/RealAI-author track gets the accent)
  "Management & Finance": "#A98B6B",  // taupe
  "Unknown": "#9CA3AF",               // gray
}

export const TRACK_SHORT: Record<string, string> = {
  "Horizontal": "Horizontal",
  "Health": "Health",
  "Media": "Media",
  "Law & Compliance": "Law & Comp.",
  "Management & Finance": "Mgmt & Fin.",
  "Unknown": "Other",
}

// --- status: monochrome with rust/green/amber used sparingly --------------
export interface StatusStyle { label: string; color: string; bg: string; text: string }

export const STATUS_STYLE: Record<string, StatusStyle> = {
  "In review":             { label: "In review",        color: RUST,      bg: "bg-[#FBEAE5] border-[#E6BFB4]", text: "text-[#9A3318]" },
  "In development":        { label: "In development",    color: "#3F6FB0", bg: "bg-[#EAF1FA] border-[#C7DAF0]", text: "text-[#2A5594]" },
  "Materials in progress": { label: "Materials started", color: "#2E7D55", bg: "bg-[#E7F4EC] border-[#BFE2CC]", text: "text-[#1F6B41]" },
  "Lesson plan drafted":   { label: "Plan drafted",      color: "#5B6470", bg: "bg-[#F1F2F4] border-[#D7D9DE]", text: "text-[#3F434C]" },
  "Status not set":        { label: "Status not set",    color: "#6B7280", bg: "bg-[#F1F2F4] border-dashed border-[#C9CCD2]", text: "text-[#5B616B]" },
  "Not started":           { label: "Not started",       color: "#6B7280", bg: "bg-[#F1F2F4] border-[#D7D9DE]", text: "text-[#5B616B]" },
}

export function statusStyle(status: string): StatusStyle {
  return STATUS_STYLE[status] || { label: status || ", ", color: MUTE, bg: "bg-[#F1F2F4] border-[#D7D9DE]", text: "text-[#444A55]" }
}

export const ROLE_LABEL: Record<string, string> = {
  "author": "Author", "co-author": "Co-author", "reviewer": "Reviewer",
}

// roles: author = rust (we own it), reviewer = ink/gray
export const ROLE_COLOR: Record<string, string> = {
  "author": "#C0492B",
  "co-author": "#C0492B",
  "reviewer": "#3F434C",
}
