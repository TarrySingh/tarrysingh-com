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

export const PARTNERS: PartnerProfile[] = [
  { code: "BME",    name: "Budapest University of Technology and Economics", country: "Hungary",     countryCode: "HU", city: "Budapest",  lat: 47.4811, lng: 19.0560, accent: "#ef4444" },
  { code: "CeADAR", name: "Centre for Applied Data Analytics Research",       country: "Ireland",     countryCode: "IE", city: "Dublin",    lat: 53.3472, lng: -6.2593, accent: "#10b981" },
  { code: "CNR",    name: "National Research Council",                        country: "Italy",       countryCode: "IT", city: "Naples",    lat: 40.8359, lng: 14.2488, accent: "#14b8a6" },
  { code: "ENEA",   name: "Italian National Agency for New Technologies",     country: "Italy",       countryCode: "IT", city: "Rome",      lat: 41.9028, lng: 12.4964, accent: "#0ea5e9" },
  { code: "ESI",    name: "ESI Center Eastern Europe",                        country: "Bulgaria",    countryCode: "BG", city: "Sofia",     lat: 42.6977, lng: 23.3219, accent: "#eab308" },
  { code: "HAW",    name: "Hamburg University of Applied Sciences",           country: "Germany",     countryCode: "DE", city: "Hamburg",   lat: 53.5511, lng: 9.9937,  accent: "#f59e0b" },
  { code: "HU",     name: "University of Applied Sciences Utrecht",           country: "Netherlands", countryCode: "NL", city: "Utrecht",   lat: 52.0907, lng: 5.1214,  accent: "#f97316" },
  { code: "KPI",    name: "Igor Sikorsky Kyiv Polytechnic Institute",         country: "Ukraine",     countryCode: "UA", city: "Kyiv",      lat: 50.4501, lng: 30.5234, accent: "#3b82f6" },
  { code: "NAT",    name: "Nathean Technologies",                             country: "Ireland",     countryCode: "IE", city: "Dublin",    lat: 53.3498, lng: -6.2603, accent: "#22c55e" },
  { code: "QTICS",  name: "QTICS Ltd",                                        country: "Hungary",     countryCode: "HU", city: "Budapest",  lat: 47.4979, lng: 19.0402, accent: "#dc2626" },
  { code: "SU",     name: "Sofia University",                                 country: "Bulgaria",    countryCode: "BG", city: "Sofia",     lat: 42.6925, lng: 23.3350, accent: "#ca8a04" },
  { code: "TUD",    name: "Technological University Dublin",                  country: "Ireland",     countryCode: "IE", city: "Dublin",    lat: 53.3498, lng: -6.2700, accent: "#16a34a" },
  { code: "UniNa",  name: "University of Naples Federico II",                 country: "Italy",       countryCode: "IT", city: "Naples",    lat: 40.8500, lng: 14.2681, accent: "#0891b2" },
  { code: "UNIWA",  name: "University of West Attica",                        country: "Greece",      countryCode: "GR", city: "Athens",    lat: 37.9838, lng: 23.7275, accent: "#8b5cf6" },
  { code: "RealAI", name: "Real AI Ltd",                                      country: "Netherlands", countryCode: "NL", city: "Rotterdam", lat: 51.9244, lng: 4.4777,  accent: "#d946ef" },
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
