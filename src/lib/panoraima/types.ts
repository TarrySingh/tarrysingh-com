export type EventType = "pmc" | "worksprint" | "kickoff" | "cancelled" | "review"

export type PartnerCode =
  | "BME" | "CeADAR" | "CNR" | "ENEA" | "ESI" | "HAW" | "HU"
  | "KPI" | "NAT" | "QTICS" | "SU" | "TUD" | "UniNa" | "UNIWA" | "RealAI"

export interface PartnerSubmission {
  submitted: boolean
  file?: string
  activities?: string[]
  challenges?: string[]
  wp_focus?: string[]
  excerpt?: string
  word_count?: number
}

export interface WPLeaderReport {
  file: string
  partner: PartnerCode | null
  activities: string[]
  challenges: string[]
  excerpt: string
}

export interface TimelineEvent {
  id: string
  label: string
  title: string
  type: EventType
  date: string
  dirname: string
  has_progress_reports: boolean
  other_docs: string[]
  partners: Record<PartnerCode, PartnerSubmission>
  wp_reports: Record<string, WPLeaderReport>
}

export interface PartnerProfile {
  code: PartnerCode
  name: string
  country: string
  countryCode: string
  city: string
  lat: number
  lng: number
  accent: string
}

// Addresses provided by Tarry on 2026-04-17 from the PANORAIMA consortium records.
// Coordinates geocoded to the actual lab / campus building, not the city centre.
export const PARTNERS: PartnerProfile[] = [
  { code: "BME",    name: "Budapest University of Technology and Economics", country: "Hungary",     countryCode: "HU", city: "Budapest",  lat: 47.4816, lng: 19.0554, accent: "#ef4444" },
  { code: "CeADAR", name: "Centre for Applied Data Analytics Research",       country: "Ireland",     countryCode: "IE", city: "Dublin",    lat: 53.3132, lng: -6.2226, accent: "#10b981" },
  { code: "CNR",    name: "National Research Council",                        country: "Italy",       countryCode: "IT", city: "Naples",    lat: 40.8548, lng: 14.2269, accent: "#14b8a6" },
  { code: "ENEA",   name: "Italian National Agency for New Technologies",     country: "Italy",       countryCode: "IT", city: "Rome",      lat: 41.9280, lng: 12.4693, accent: "#0ea5e9" },
  { code: "ESI",    name: "ESI Center Eastern Europe",                        country: "Bulgaria",    countryCode: "BG", city: "Varna",     lat: 43.1869, lng: 27.9188, accent: "#eab308" },
  { code: "HAW",    name: "Hamburg University of Applied Sciences",           country: "Germany",     countryCode: "DE", city: "Hamburg",   lat: 53.5579, lng: 10.0218, accent: "#f59e0b" },
  { code: "HU",     name: "University of Applied Sciences Utrecht",           country: "Netherlands", countryCode: "NL", city: "Utrecht",   lat: 52.0862, lng: 5.1785,  accent: "#f97316" },
  { code: "KPI",    name: "Igor Sikorsky Kyiv Polytechnic Institute",         country: "Ukraine",     countryCode: "UA", city: "Kyiv",      lat: 50.4501, lng: 30.4629, accent: "#3b82f6" },
  { code: "NAT",    name: "Nathean Technologies",                             country: "Ireland",     countryCode: "IE", city: "Dublin",    lat: 53.3953, lng: -6.4114, accent: "#22c55e" },
  { code: "QTICS",  name: "QTICS Ltd",                                        country: "Hungary",     countryCode: "HU", city: "Budapest",  lat: 47.5123, lng: 19.0716, accent: "#dc2626" },
  { code: "SU",     name: "Sofia University",                                 country: "Bulgaria",    countryCode: "BG", city: "Sofia",     lat: 42.6935, lng: 23.3349, accent: "#ca8a04" },
  { code: "TUD",    name: "Technological University Dublin",                  country: "Ireland",     countryCode: "IE", city: "Dublin",    lat: 53.2877, lng: -6.3728, accent: "#16a34a" },
  { code: "UniNa",  name: "University of Naples Federico II",                 country: "Italy",       countryCode: "IT", city: "Naples",    lat: 40.8474, lng: 14.2595, accent: "#0891b2" },
  { code: "UNIWA", name: "University of West Attica",                         country: "Greece",      countryCode: "GR", city: "Athens",    lat: 37.9930, lng: 23.6737, accent: "#8b5cf6" },
  { code: "RealAI", name: "Real AI Ltd",                                      country: "Netherlands", countryCode: "NL", city: "Assen",     lat: 52.9946, lng: 6.5644,  accent: "#d946ef" },
]

export const PARTNER_BY_CODE: Record<PartnerCode, PartnerProfile> =
  Object.fromEntries(PARTNERS.map(p => [p.code, p])) as Record<PartnerCode, PartnerProfile>

export const WORK_PACKAGES = [
  { id: "WP1", name: "Project Management",       color: "#3b82f6", emoji: "⚙" },
  { id: "WP2", name: "Market & Needs Analysis",   color: "#8b5cf6", emoji: "🔍" },
  { id: "WP3", name: "Curriculum Design",         color: "#06b6d4", emoji: "📚" },
  { id: "WP4", name: "Platform Development",      color: "#10b981", emoji: "🛠" },
  { id: "WP5", name: "Pilots & Evaluation",       color: "#f59e0b", emoji: "🧪" },
  { id: "WP6", name: "Quality & Ethics",          color: "#ef4444", emoji: "⚖" },
  { id: "WP7", name: "Dissemination & Exploit.",  color: "#d946ef", emoji: "📣" },
]

export const EVENT_STYLES: Record<EventType, { bg: string; ring: string; label: string; dotColor: string }> = {
  kickoff:    { bg: "bg-emerald-500",  ring: "ring-emerald-400/40",  label: "Kick-off",   dotColor: "#10b981" },
  pmc:        { bg: "bg-navy-700",     ring: "ring-navy-400/30",     label: "PMC",        dotColor: "#1b376d" },
  worksprint: { bg: "bg-gold-500",     ring: "ring-gold-400/40",     label: "Worksprint", dotColor: "#c9a96e" },
  review:     { bg: "bg-purple-600",   ring: "ring-purple-400/40",   label: "Review",     dotColor: "#9333ea" },
  cancelled:  { bg: "bg-gray-300",     ring: "ring-gray-300/40",     label: "Cancelled",  dotColor: "#d1d5db" },
}

// Basic city coordinates for worksprint locations (for map visualization)
export const WORKSPRINT_CITIES: Record<string, { lat: number; lng: number; country: string }> = {
  "Budapest": { lat: 47.4979, lng: 19.0402, country: "Hungary" },
  "Naples":   { lat: 40.8518, lng: 14.2681, country: "Italy" },
  "Dublin":   { lat: 53.3498, lng: -6.2603, country: "Ireland" },
  "Athens":   { lat: 37.9838, lng: 23.7275, country: "Greece" },
  "Hamburg":  { lat: 53.5511, lng: 9.9937,  country: "Germany" },
}

// ---------------------------------------------------------------------------
// Work-package dashboards (hub + per-WP detail)
// ---------------------------------------------------------------------------

export type WpCode = "WP1" | "WP2" | "WP3" | "WP4" | "WP5" | "WP6" | "WP7"
export type WpStatus = "active" | "sparse" | "empty" | "unseen"
export type DeliverableStatus = "draft" | "reviewed" | "final" | "unknown"

export interface WpStats {
  total_files: number
  size_mb?: number
  by_ext: Record<string, number>
  by_type: Record<string, number>
  by_region: Record<string, number>
}

export interface WpDeliverable {
  id: string
  file: string
  version?: string | null
  status: DeliverableStatus | string
  date?: string | null
  size_kb?: number
  excerpt?: string | null
  rel_path?: string
}

export interface WpTask {
  id: string
  title: string
  file_count: number
  deliverables: WpDeliverable[]
}

export interface WpTimelineEntry {
  date: string
  title: string
  type: string
  file: string
  task?: string | null
  region?: string | null
  status?: string | null
  rel_path?: string
}

export interface WorkPackageDetail {
  wp: WpCode
  name: string
  short: string
  color: string
  emoji: string
  description: string
  stats: WpStats
  tasks: WpTask[]
  timeline: WpTimelineEntry[]
  generated_at: string
}

export interface WpHubEntry {
  wp: WpCode
  name: string
  short: string
  color: string
  emoji: string
  description: string
  status: WpStatus
  stats: WpStats
  task_count: number
  deliverable_count: number
}

export interface WpHubMeta {
  generated_at: string
  wps: WpHubEntry[]
}

// Region coordinates for the WP2 geographic coverage map.
// Data covers focus-group activity for T2.1 across 4 countries.
export const WP_REGION_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  "Greece":      { lat: 37.9838, lng: 23.7275, label: "Greece" },
  "Germany":     { lat: 53.5511, lng: 9.9937,  label: "Hamburg" },
  "Ireland":     { lat: 53.3498, lng: -6.2603, label: "Ireland" },
  "Netherlands": { lat: 52.0862, lng: 5.1785,  label: "Netherlands" },
}
