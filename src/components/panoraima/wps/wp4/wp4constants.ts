// Shared design constants for the WP4 tool components — keeps tracks/statuses
// visually consistent across Overview, RealAI board, Explorer, Status views.

export const TRACK_ORDER = [
  "Horizontal",
  "Health",
  "Media",
  "Law & Compliance",
  "Management & Finance",
] as const

export const TRACK_COLOR: Record<string, string> = {
  "Horizontal": "#0ea5e9",            // sky
  "Health": "#10b981",                // emerald
  "Media": "#8b5cf6",                 // violet
  "Law & Compliance": "#f59e0b",      // amber
  "Management & Finance": "#ef4444",  // rose
  "Unknown": "#64748b",               // slate
}

export const TRACK_SHORT: Record<string, string> = {
  "Horizontal": "Horizontal",
  "Health": "Health",
  "Media": "Media",
  "Law & Compliance": "Law & Comp.",
  "Management & Finance": "Mgmt & Fin.",
  "Unknown": "Other",
}

// Unified display status -> {label, tone color, dot}
export interface StatusStyle { label: string; color: string; bg: string; text: string }

export const STATUS_STYLE: Record<string, StatusStyle> = {
  "In review":             { label: "In review",        color: "#c9a96e", bg: "bg-gold-50 border-gold-200",       text: "text-gold-700" },
  "In development":        { label: "In development",    color: "#0ea5e9", bg: "bg-sky-50 border-sky-200",         text: "text-sky-700" },
  "Materials in progress": { label: "Materials started", color: "#10b981", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  "Lesson plan drafted":   { label: "Plan drafted",      color: "#8b5cf6", bg: "bg-violet-50 border-violet-200",   text: "text-violet-700" },
  "Status not set":        { label: "Status not set",    color: "#94a3b8", bg: "bg-gray-50 border-dashed border-gray-200", text: "text-gray-500" },
  "Not started":           { label: "Not started",       color: "#cbd5e1", bg: "bg-gray-50 border-gray-200",       text: "text-gray-400" },
}

export function statusStyle(status: string): StatusStyle {
  return STATUS_STYLE[status] || { label: status || "—", color: "#94a3b8", bg: "bg-gray-50 border-gray-200", text: "text-gray-500" }
}

export const ROLE_LABEL: Record<string, string> = {
  "author": "Author",
  "co-author": "Co-author",
  "reviewer": "Reviewer",
}

export const ROLE_COLOR: Record<string, string> = {
  "author": "#c9a96e",    // gold — we write these
  "co-author": "#f59e0b",
  "reviewer": "#0ea5e9",  // sky — we review these
}
