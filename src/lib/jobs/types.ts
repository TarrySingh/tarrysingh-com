/** Data types matching the Python Pydantic models */

export interface OccupationRecord {
  country: string;
  isco: string;
  title: string;
  major_group: string;
  sub_major_group: string;
  jobs_k: number | null;
  pay_eur: number | null;
  exposure: number | null;
  rationale: string;
  education: Record<string, number>;
  year: number | null;
}

export interface CountrySummary {
  code: string;
  name: string;
  group: "eu27" | "eea" | "efta" | "other_europe";
  total_jobs_k: number;
  avg_exposure: number | null;
  occupations: number;
}

export interface PipelineMeta {
  generated_at: string;
  total_records: number;
  total_countries: number;
  data_year: number;
}

/** Treemap node for rendering */
export interface TreemapNode {
  id: string;
  label: string;
  value: number; // area (employment)
  exposure: number | null;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  country?: string;
  isco?: string;
  major_group?: string;
  rationale?: string;
  pay_eur?: number | null;
}

/** Exposure tier for distribution charts */
export interface ExposureTier {
  label: string;
  range: string;
  min: number;
  max: number;
  color: string;
  count: number;
  jobs_k: number;
}

/** Enrichment data for industry + agentic analysis */
export interface OccupationEnrichment {
  isco_code: string;
  title: string;
  industry_distribution: Record<string, number>;
  task_automation_2025: number;
  task_automation_2027: number;
  task_automation_2030: number;
  skill_decay_years: number;
  wage_pressure: "none" | "low" | "moderate" | "high" | "severe";
  human_advantage: string;
  agent_capability: string;
}

/** Industry labels for display */
export const INDUSTRY_LABELS: Record<string, string> = {
  banking_finance: "Banking & Finance",
  technology: "Technology",
  manufacturing: "Manufacturing",
  healthcare: "Healthcare",
  retail_wholesale: "Retail & Wholesale",
  education: "Education",
  public_admin: "Public Administration",
  construction: "Construction",
  transport_logistics: "Transport & Logistics",
  professional_services: "Professional Services",
  hospitality_tourism: "Hospitality & Tourism",
  agriculture_mining: "Agriculture & Mining",
  other: "Other",
};

/** Industry colors for charts */
export const INDUSTRY_COLORS: Record<string, string> = {
  banking_finance: "#3B82F6",
  technology: "#8B5CF6",
  manufacturing: "#EF4444",
  healthcare: "#10B981",
  retail_wholesale: "#F59E0B",
  education: "#06B6D4",
  public_admin: "#6366F1",
  construction: "#F97316",
  transport_logistics: "#84CC16",
  professional_services: "#EC4899",
  hospitality_tourism: "#14B8A6",
  agriculture_mining: "#A3E635",
  other: "#9CA3AF",
};

/** Wage pressure colors */
export const WAGE_PRESSURE_COLORS: Record<string, string> = {
  none: "#22C55E",
  low: "#84CC16",
  moderate: "#EAB308",
  high: "#F97316",
  severe: "#EF4444",
};

/** Country group labels */
export const COUNTRY_GROUP_LABELS: Record<string, string> = {
  eu27: "EU 27",
  eea: "EEA",
  efta: "EFTA",
  other_europe: "Other Europe",
};
