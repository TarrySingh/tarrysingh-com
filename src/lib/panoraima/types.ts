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

// WP names mirror the authoritative titles in scripts/extract_wp.py (the
// source for wps_meta.json). WP1 is the project-management layer surfaced as
// the main consortium dashboard, not a hub work package.
export const WORK_PACKAGES = [
  { id: "WP1", name: "Project Management",                          color: "#3b82f6", emoji: "⚙" },
  { id: "WP2", name: "Market & Workforce Needs Analysis",          color: "#8b5cf6", emoji: "🔍" },
  { id: "WP3", name: "AI Competence Profiles & Learning Outcomes", color: "#06b6d4", emoji: "📚" },
  { id: "WP4", name: "Curriculum & Pilot Programmes",              color: "#10b981", emoji: "🛠" },
  { id: "WP5", name: "Quality Assurance",                          color: "#f59e0b", emoji: "🧪" },
  { id: "WP6", name: "Ethics & Responsible AI",                    color: "#ef4444", emoji: "⚖" },
  { id: "WP7", name: "Dissemination & Exploitation",              color: "#d946ef", emoji: "📣" },
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

export interface WpThemeCount {
  theme: string
  count: number
}

export interface WpStakeholderCount {
  type: string
  count: number
}

export interface WpQuote {
  kind: "quote" | "finding"
  text: string
  source_file?: string
  task?: string | null
}

export interface WpRegionSummary {
  region: string
  file_count: number
  top_themes: WpThemeCount[]
  quotes: WpQuote[]
  files: Array<{
    name: string
    type: string
    date?: string | null
    excerpt?: string | null
    themes?: string[]
    stakeholders?: string[]
  }>
}

export interface WpCatalogueEntry {
  name: string
  rel_path: string
  task?: string | null
  type: string
  status?: string | null
  region?: string | null
  date?: string | null
  ext: string
  size_kb?: number
  title?: string
  excerpt?: string | null
  themes?: string[]
  stakeholders?: string[]
  slides_count?: number
  sheets_count?: number
  pages?: number
  word_count?: number
}

export interface WorkPackageDetail {
  wp: WpCode
  name: string
  short: string
  color: string
  emoji: string
  description: string
  stats: WpStats & { total_words?: number }
  themes: WpThemeCount[]
  stakeholders: WpStakeholderCount[]
  tasks: WpTask[]
  regions: WpRegionSummary[]
  timeline: WpTimelineEntry[]
  findings: WpQuote[]
  primary_deliverable?: {
    name: string
    size_kb?: number
    pages?: number
    version?: string | null
    excerpt?: string | null
  } | null
  catalogue: WpCatalogueEntry[]
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

// ---------------------------------------------------------------------------
// Task 2.1 deep-dive types
// ---------------------------------------------------------------------------

export interface T21KeyInsight {
  id: number
  title: string
  body: string
}

export interface T21Sector {
  key: string
  name: string
  skills_priority: string[]
  emerging_roles: string[]
  notes: string
}

export interface T21EmergingRole {
  name: string
  sector: string
  context: string
}

export interface T21Version {
  label: string
  file: string
  is_final?: boolean
  is_archive?: boolean
  size_kb?: number
}

export interface T21Deliverable {
  id: string
  title: string
  version: string
  date: string
  pdf_file: string
  size_kb: number
  executive_summary: string
  key_insights: T21KeyInsight[]
  sectors: T21Sector[]
  emerging_roles: T21EmergingRole[]
  versions: T21Version[]
}

export interface T21IrelandSession {
  folder: string
  date: string | null
  kind: string
  focus: string
  recording_mb?: number | null
  has_presentation?: boolean
  has_report?: boolean
  has_transcript?: boolean
  report_excerpt?: string
}

export interface T21RegisterRow {
  org?: string
  type?: string
  sector?: string
  fg_type?: string
  status?: string
  notes?: string
  panoraima_contact?: string
  org_contact?: string
  [k: string]: string | undefined
}

export interface T21Ireland {
  sessions: T21IrelandSession[]
  stakeholder_register: {
    focus_groups: T21RegisterRow[]
    surveys: T21RegisterRow[]
  }
}

export interface T21NLInterview {
  interviewee: string
  role: string
  company: string
  recording_mb?: number | null
  audio_mb?: number | null
  has_transcript?: boolean
  quotes: string[]
  empty?: boolean
}

export interface T21Netherlands {
  interviews: T21NLInterview[]
  consolidated_report_excerpt?: string
  hu_summary?: {
    headers: string[]
    row_count: number
    sample: string[][]
  } | null
}

export interface T21HamburgInterview {
  code: string
  file: string
  excerpt: string
  quotes: string[]
  word_count: number
}

export interface T21Hamburg {
  interviews: T21HamburgInterview[]
  focus_group_excerpt?: string
}

export interface T21GreekSpreadsheet {
  file: string
  title: string
  headers: string[]
  row_count: number
  sample: string[][]
  wg?: boolean
}

export interface T21Greece {
  spreadsheets: T21GreekSpreadsheet[]
}

export interface T21Paper {
  file: string
  title: string
  kb: number
  ext: string
}

export interface T21Topic {
  bucket: string
  folder: string
  count: number
  anchor_papers: string[]
  papers: T21Paper[]
}

export interface T21Video {
  file: string
  session: string
  rel_path: string
  size_mb: number
  kind: "video" | "audio" | "transcript"
}

export interface T21CatalogueEntry {
  file: string
  rel_path: string
  top: string
  ext: string
  size_kb: number
}

export interface Task21Detail {
  task: string
  wp: string
  title: string
  lead: string
  description: string
  stats: {
    total_files: number
    size_mb: number
    countries: string[]
    sectors: string[]
    stakeholders_estimated: number
    video_minutes_estimated?: number
  }
  deliverable: T21Deliverable
  working_groups: {
    ireland: T21Ireland
    netherlands: T21Netherlands
    hamburg: T21Hamburg
    greece: T21Greece
  }
  desktop_research: {
    topics: T21Topic[]
  }
  video_gallery: T21Video[]
  catalogue: T21CatalogueEntry[]
  generated_at: string
}

// Coordinates for the 10 European countries represented in T2.1 stakeholder set
export const T21_COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Ireland":     { lat: 53.3498, lng: -6.2603 },
  "Netherlands": { lat: 52.0862, lng: 5.1785  },
  "Germany":     { lat: 53.5511, lng: 9.9937  },
  "Greece":      { lat: 37.9838, lng: 23.7275 },
  "Belgium":     { lat: 50.8503, lng: 4.3517  },
  "France":      { lat: 48.8566, lng: 2.3522  },
  "Spain":       { lat: 40.4168, lng: -3.7038 },
  "Italy":       { lat: 41.9028, lng: 12.4964 },
  "Portugal":    { lat: 38.7223, lng: -9.1393 },
  "Austria":     { lat: 48.2082, lng: 16.3738 },
}

// ---------------------------------------------------------------------------
// Task 2.2 deep-dive types
// ---------------------------------------------------------------------------

export type T22InstAbbr =
  | "HU" | "TUD" | "UNINA" | "BME" | "UNIWA" | "SU" | "KPI" | "HAW"

export interface T22ParticipantSlot {
  role: "Teaching Staff" | "Researcher" | "Student Representative" | "Administrative" | string
  name: string
  email: string
  consent: boolean
}

export interface T22Institution {
  abbr: T22InstAbbr
  institution: string
  country: string
  coords: [number, number]  // [lng, lat]
  slots: T22ParticipantSlot[]
  consent_count: number
  filled_count: number
}

export interface T22ResearchTeam {
  name: string
  role: string
  affiliation?: string
}

export interface T22Finding {
  id: string
  icon: string
  title: string
  quote: string
}

export interface T22Question {
  id: number
  band: "Teaching methods" | "Student learning" | "AI guidance" | string
  text: string
  summary: string
}

export interface T22AISkillRanked {
  rank: number
  name: string
}

export interface T22FocusGroup {
  date: string
  duration_min: number
  platform: string
  participant_count: number
  description: string
  aim: string
  research_team: T22ResearchTeam[]
  findings: T22Finding[]
  questions: T22Question[]
  ai_skills_ranked: T22AISkillRanked[]
  source_file: string
}

export interface T22ProtocolSection {
  en: string
  el: string
  description: string
}

export interface T22Protocol {
  title_en: string
  title_el: string
  sections: T22ProtocolSection[]
  source_file: string
}

export interface T22EthicsStage {
  stage: string
  date: string
  file: string
  pivotal: boolean
  kb: number
  note: string
}

export interface T22LearningTheory {
  id: "TPACK" | "Bloom" | "Marzano" | "ADDIE" | "Kolb" | string
  slide: number
  full_name: string
  acronym: string
  tagline: string
  why: string
}

export interface T22ModernSchool {
  name: string
  examples: string[]
  tagline: string
}

export interface T22SkillCategory {
  name: string
  icon: string
}

export interface T22LearningOutcome {
  type: string
  domain: string
  question: string
}

export interface T22Risk {
  id: number
  title: string
  action: string
}

export interface T22PedagogicFramework {
  learning_theories: T22LearningTheory[]
  modern_learning_schools: T22ModernSchool[]
  ai_skill_categories: T22SkillCategory[]
  learning_outcomes: T22LearningOutcome[]
  critical_risks: T22Risk[]
  source_file: string
  source_slide_count: number
  source_kb: number
}

export interface T22AnchorPaper {
  title: string
  authors: string
  year: number
  venue: string
  tagline: string
  kb: number
  file: string
}

export interface T22PrototypeRow {
  abbr: T22InstAbbr | string
  institution: string
  cells: string[]
}

export interface T22PrototypeMatrix {
  label: string
  columns: string[]
  rows: T22PrototypeRow[]
  coverage_pct: number
  file: string
}

export interface T22DesktopResearch {
  anchor_papers: T22AnchorPaper[]
  prototype_matrices: {
    pedagogics?: T22PrototypeMatrix
    organisational?: T22PrototypeMatrix
  }
}

export interface T22CatalogueEntry {
  file: string
  rel_path: string
  ext: string
  kb: number
  date: string
  bucket: string
}

export interface Task22Detail {
  task: string
  wp: string
  title: string
  tagline: string
  coordinator: string
  involved: string[]
  kpis: {
    participant_count: number
    institution_count: number
    question_count: number
    finding_count: number
    ai_skills_ranked: number
    consent_total: number
    filled_total: number
    desktop_research_count: number
    file_count: number
  }
  protocol: T22Protocol
  focus_group: T22FocusGroup
  participants: T22Institution[]
  ethics_trail: T22EthicsStage[]
  pedagogic_framework: T22PedagogicFramework
  desktop_research: T22DesktopResearch
  catalogue: T22CatalogueEntry[]
  generated_at: string
}

// ---------------------------------------------------------------------------
// Task 2.3 deep-dive types
// ---------------------------------------------------------------------------

export type T23AccreditationFlag = "yes" | "no" | "blank" | string
export type T23Band = "ready" | "coordinating" | "waiting"
export type T23RoadmapKind = "dated" | "sequential" | "reference"

export interface T23OpsContact {
  name: string
  email: string
  phone: string
  role: string
}

export interface T23TaskBriefSection {
  n: number
  title: string
  slide: number
  bullets: string[]
}

export interface T23TaskBrief {
  authored_by: string
  authored_at: string
  sections: T23TaskBriefSection[]
  source_file: string
  source_kb: number
  source_slide_count: number
}

export interface T23PartnerContact {
  raw: string
  email: string
  phone: string
}

export interface T23Partner {
  abbr: string
  institution: string
  country: string
  coords: [number, number]   // [lng, lat]
  programmes: number
  institutional_accreditation: T23AccreditationFlag
  programme_accreditation: T23AccreditationFlag
  contact: T23PartnerContact
  action_text: string
  links: string[]
  roadmap: T23AccreditationFlag | "not needed"
  band: T23Band
}

export interface T23RoadmapPhase {
  date?: string
  actor: string
  action: string
}

export interface T23Roadmap {
  partner: string
  title: string
  kind: T23RoadmapKind
  phases: T23RoadmapPhase[]
  note?: string
}

export interface T23HcaimFlag {
  who: string
  quote: string
}

export interface T23HcaimLegacy {
  name: string
  description: string
  flagged_by: T23HcaimFlag[]
  open_question: string
}

export interface T23CatalogueEntry {
  file: string
  rel_path: string
  ext: string
  kb: number
  date: string
  bucket: string
}

export interface Task23Detail {
  task: string
  wp: string
  title: string
  tagline: string
  coordinator: string
  coordinator_person: string
  ops_contact: T23OpsContact
  involved: string[]
  kpis: {
    partners_total: number
    existing_programmes: number
    partners_need_help: number
    partners_ready: number
    partners_waiting: number
    file_count: number
  }
  task_brief: T23TaskBrief
  partners: T23Partner[]
  roadmaps: T23Roadmap[]
  hcaim_legacy: T23HcaimLegacy
  catalogue: T23CatalogueEntry[]
  generated_at: string
}

// ---------------------------------------------------------------------------
// WP4 tool — Learning Event registry (dashboard · monitor · productivity)
// ---------------------------------------------------------------------------

export type Wp4Role = "author" | "co-author" | "reviewer"

export interface Wp4MaterialFile {
  name: string
  ext: string
  kb: number
  date: string
  rel: string
}

export interface Wp4RealAIRole {
  role: Wp4Role
  recipients: string[]   // emails routed for this role
}

export interface Wp4WikiSection {
  name: string
  len: number
  empty: boolean
  text: string
}

export interface Wp4Completeness {
  is_author: boolean
  instructions_written: boolean
  outcomes_present: boolean
  materials_uploaded: boolean
  wiki_missing: string[]
  author_needs: string[]
  ready_to_review: boolean
}

export interface Wp4LE {
  code: string
  track: string
  title: string
  lesson_type: string
  duration: string
  job_role?: string
  status: string         // unified display status
  wiki_status: string    // development | review | missing | ""
  due_date: string
  author: string
  coauthor: string
  reviewer: string
  off_wiki?: boolean     // true = from SharePoint registry, not yet on the wiki master
  materials: {
    count: number
    has: boolean
    newest: string
    files: Wp4MaterialFile[]
    folder: string
  }
  lesson_plan: {
    doc: string
    rel: string
    has_meta_block: boolean
    date: string
  }
  wiki_page: string | null
  wiki_sections: Wp4WikiSection[] | null
  realai: {
    involved: boolean
    roles: Wp4RealAIRole[]
  }
  completeness: Wp4Completeness | null
  sources: string[]      // wiki | lesson_plan | registry | materials
}

export interface Wp4TemplateSection {
  name: string
  guidance: string
  author_owns: boolean
}

export interface Wp4ReviewerCheck {
  title: string
  detail: string
}

export interface Wp4ClaudeHowto {
  context: string
  tool: string
  how: string
  icon: string
}

export interface Wp4ReviewRule {
  rule: string
  detail: string
}

export interface Wp4Sharepoint {
  upload_url?: string
  template_url?: string
  note?: string
}

export interface Wp4Guides {
  template_sections: Wp4TemplateSection[]
  reviewer_checklist: Wp4ReviewerCheck[]
  review_process?: Wp4ReviewRule[]
  review_process_note: string
  reviewer_role_summary: string
  sharepoint?: Wp4Sharepoint
  claude_howto: Wp4ClaudeHowto[]
}

export interface Wp4Registry {
  wp: string
  title: string
  tagline: string
  generated_at: string
  data_sources: {
    wiki: { status: string; captured_at?: string; scope?: string; master_total?: number; master_list_total?: number }
    sharepoint: { generated_at?: string; counts?: Record<string, number> }
  }
  summary: {
    total_les: number
    by_track: Record<string, number>
    by_status: Record<string, number>
    with_materials: number
    materials_pending: number
    coverage?: {
      wiki_total: number
      with_sharepoint_material: number
      awaiting_material: number
      off_wiki: number
      off_wiki_realai?: number
    }
    realai: {
      total: number
      author: number
      reviewer: number
      by_status: Record<string, number>
      needs_action: number
      author_todo?: number
      ready_to_review?: number
    }
  }
  guides: Wp4Guides
  les: Wp4LE[]
  realai_board: Wp4LE[]
  off_wiki_codes?: string[]
  roster: { name: string; email: string }[]
}

// Manifest of SharePoint files too large to sync locally (skipped by the size
// cap — they grow over time). Surfaced on the WP hub so they can be looked up
// in SharePoint rather than silently omitted.
export interface LargeFile {
  name: string
  rel: string       // path under the WP folder in SharePoint
  ext: string
  mb: number
  modified: string
  local: boolean     // currently materialised in the local mirror
}

export interface LargeFilesManifest {
  generated_at: string
  threshold_mb: number
  total: number
  total_gb: number
  by_wp: Record<string, LargeFile[]>
  note: string
}
