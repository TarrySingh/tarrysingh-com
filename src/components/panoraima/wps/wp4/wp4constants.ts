// WP4 "corporate" design system — modelled on the EarthScan platform/admin
// aesthetic: near-monochrome, hairline flat cards, uppercase tracked micro-
// labels in a single rust accent, technical numerals, generous whitespace.
// Deliberately NOT the navy/gold multi-colour look of the other WP pages.

// --- the single accent + neutral ladder -----------------------------------
export const RUST = "#C0492B"          // the one accent (terracotta/brick)
export const RUST_SOFT = "#FBEAE5"     // rust tint for backgrounds
export const INK = "#16181D"           // near-black headings
export const INK_SOFT = "#3F434C"
export const MUTE = "#6B7280"          // body / muted
export const FAINT = "#9CA3AF"         // faintest labels
export const LINE = "#E7E7EA"          // hairline borders
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
  "In review":             { label: "In review",        color: RUST,      bg: "bg-[#FBEAE5] border-[#E9CFC6]", text: "text-[#A53C22]" },
  "In development":        { label: "In development",    color: "#5B6470", bg: "bg-gray-50 border-gray-200",   text: "text-gray-600" },
  "Materials in progress": { label: "Materials started", color: "#3F7D5E", bg: "bg-[#EEF5F0] border-[#D2E5D9]", text: "text-[#2E6A4B]" },
  "Lesson plan drafted":   { label: "Plan drafted",      color: "#5B6470", bg: "bg-gray-50 border-gray-200",   text: "text-gray-600" },
  "Status not set":        { label: "Status not set",    color: "#A6ABB3", bg: "bg-gray-50 border-dashed border-gray-200", text: "text-gray-400" },
  "Not started":           { label: "Not started",       color: "#C2C5CB", bg: "bg-gray-50 border-gray-200",   text: "text-gray-400" },
}

export function statusStyle(status: string): StatusStyle {
  return STATUS_STYLE[status] || { label: status || "—", color: MUTE, bg: "bg-gray-50 border-gray-200", text: "text-gray-500" }
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
