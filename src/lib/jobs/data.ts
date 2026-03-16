/** Data loading and transformation utilities */

import { OccupationRecord, CountrySummary, PipelineMeta, ExposureTier, OccupationEnrichment } from "./types";
import { EXPOSURE_TIERS } from "./colors";

// In production, data comes from data/output/ via static JSON
// During development, we use sample data
const DATA_BASE = "/data";

export async function loadOccupations(): Promise<OccupationRecord[]> {
  const res = await fetch(`${DATA_BASE}/data.json`);
  if (!res.ok) return getSampleData();
  return res.json();
}

export async function loadCountries(): Promise<CountrySummary[]> {
  const res = await fetch(`${DATA_BASE}/countries.json`);
  if (!res.ok) return getSampleCountries();
  return res.json();
}

export async function loadMeta(): Promise<PipelineMeta> {
  const res = await fetch(`${DATA_BASE}/meta.json`);
  if (!res.ok)
    return {
      generated_at: new Date().toISOString(),
      total_records: 0,
      total_countries: 0,
      data_year: 2023,
    };
  return res.json();
}

export async function loadEnrichment(): Promise<OccupationEnrichment[]> {
  const res = await fetch(`${DATA_BASE}/enrichment.json`);
  if (!res.ok) return [];
  return res.json();
}

/** Filter occupations by country */
export function filterByCountry(
  data: OccupationRecord[],
  countryCode: string | null
): OccupationRecord[] {
  if (!countryCode) return data;
  return data.filter((r) => r.country === countryCode);
}

/** Filter occupations by exposure range */
export function filterByExposure(
  data: OccupationRecord[],
  min: number,
  max: number
): OccupationRecord[] {
  return data.filter((r) => r.exposure !== null && r.exposure >= min && r.exposure <= max);
}

/** Compute exposure distribution tiers */
export function computeExposureTiers(data: OccupationRecord[]): ExposureTier[] {
  return EXPOSURE_TIERS.map((tier) => {
    const matching = data.filter(
      (r) => r.exposure !== null && r.exposure >= tier.min && r.exposure <= tier.max
    );
    return {
      ...tier,
      count: matching.length,
      jobs_k: matching.reduce((sum, r) => sum + (r.jobs_k || 0), 0),
    };
  });
}

/** Aggregate data across countries for a given occupation */
export function aggregateByOccupation(data: OccupationRecord[]): OccupationRecord[] {
  const groups = new Map<string, OccupationRecord[]>();
  for (const r of data) {
    const existing = groups.get(r.isco) || [];
    existing.push(r);
    groups.set(r.isco, existing);
  }

  return Array.from(groups.entries()).map(([isco, records]) => ({
    country: "EU",
    isco,
    title: records[0].title,
    major_group: records[0].major_group,
    sub_major_group: records[0].sub_major_group,
    jobs_k: records.reduce((sum, r) => sum + (r.jobs_k || 0), 0),
    pay_eur: null, // Can't meaningfully aggregate pay across countries
    exposure: records[0].exposure, // Same score for all countries
    rationale: records[0].rationale,
    education: records[0].education,
    year: records[0].year,
  }));
}

/** Get unique major groups from data */
export function getMajorGroups(data: OccupationRecord[]): string[] {
  const groups = new Set(data.map((r) => r.major_group).filter(Boolean));
  return Array.from(groups).sort();
}

// ─── Sample Data (for development before pipeline runs) ───

function getSampleData(): OccupationRecord[] {
  return [
    { country: "DE", isco: "25", title: "ICT professionals", major_group: "Professionals", sub_major_group: "ICT professionals", jobs_k: 1850, pay_eur: 62000, exposure: 8, rationale: "High AI exposure due to code generation and automation tools.", education: {}, year: 2023 },
    { country: "DE", isco: "24", title: "Business and administration professionals", major_group: "Professionals", sub_major_group: "Business and administration professionals", jobs_k: 2100, pay_eur: 58000, exposure: 7, rationale: "Significant exposure through AI-driven analytics and reporting.", education: {}, year: 2023 },
    { country: "DE", isco: "71", title: "Building and related trades workers", major_group: "Craft and related trades workers", sub_major_group: "Building and related trades workers", jobs_k: 1600, pay_eur: 38000, exposure: 2, rationale: "Low exposure due to physical, on-site work requirements.", education: {}, year: 2023 },
    { country: "DE", isco: "93", title: "Labourers in mining, construction, manufacturing", major_group: "Elementary occupations", sub_major_group: "Labourers in mining, construction, manufacturing and transport", jobs_k: 950, pay_eur: 28000, exposure: 1, rationale: "Minimal AI exposure — primarily manual labor.", education: {}, year: 2023 },
    { country: "DE", isco: "22", title: "Health professionals", major_group: "Professionals", sub_major_group: "Health professionals", jobs_k: 1400, pay_eur: 72000, exposure: 4, rationale: "Moderate exposure — AI assists diagnosis but physical care remains essential.", education: {}, year: 2023 },
    { country: "DE", isco: "41", title: "General and keyboard clerks", major_group: "Clerical support workers", sub_major_group: "General and keyboard clerks", jobs_k: 1200, pay_eur: 34000, exposure: 9, rationale: "Very high exposure — data entry and clerical tasks highly automatable.", education: {}, year: 2023 },
    { country: "FR", isco: "25", title: "ICT professionals", major_group: "Professionals", sub_major_group: "ICT professionals", jobs_k: 1200, pay_eur: 55000, exposure: 8, rationale: "High AI exposure due to code generation and automation tools.", education: {}, year: 2023 },
    { country: "FR", isco: "24", title: "Business and administration professionals", major_group: "Professionals", sub_major_group: "Business and administration professionals", jobs_k: 1800, pay_eur: 52000, exposure: 7, rationale: "Significant exposure through AI-driven analytics.", education: {}, year: 2023 },
    { country: "FR", isco: "71", title: "Building and related trades workers", major_group: "Craft and related trades workers", sub_major_group: "Building and related trades workers", jobs_k: 1300, pay_eur: 32000, exposure: 2, rationale: "Low exposure due to physical work.", education: {}, year: 2023 },
    { country: "FR", isco: "22", title: "Health professionals", major_group: "Professionals", sub_major_group: "Health professionals", jobs_k: 1100, pay_eur: 65000, exposure: 4, rationale: "Moderate exposure — AI assists but physical care essential.", education: {}, year: 2023 },
    { country: "ES", isco: "52", title: "Sales workers", major_group: "Service and sales workers", sub_major_group: "Sales workers", jobs_k: 1500, pay_eur: 22000, exposure: 5, rationale: "Moderate — e-commerce AI and chatbots impact some roles.", education: {}, year: 2023 },
    { country: "ES", isco: "23", title: "Teaching professionals", major_group: "Professionals", sub_major_group: "Teaching professionals", jobs_k: 900, pay_eur: 35000, exposure: 6, rationale: "Significant — AI tutoring tools changing education delivery.", education: {}, year: 2023 },
    { country: "PL", isco: "25", title: "ICT professionals", major_group: "Professionals", sub_major_group: "ICT professionals", jobs_k: 600, pay_eur: 28000, exposure: 8, rationale: "High exposure to code generation tools.", education: {}, year: 2023 },
    { country: "PL", isco: "93", title: "Labourers in mining, construction, manufacturing", major_group: "Elementary occupations", sub_major_group: "Labourers in mining, construction, manufacturing and transport", jobs_k: 800, pay_eur: 12000, exposure: 1, rationale: "Minimal — manual labor.", education: {}, year: 2023 },
    { country: "NL", isco: "24", title: "Business and administration professionals", major_group: "Professionals", sub_major_group: "Business and administration professionals", jobs_k: 700, pay_eur: 65000, exposure: 7, rationale: "Significant exposure.", education: {}, year: 2023 },
    { country: "IT", isco: "51", title: "Personal service workers", major_group: "Service and sales workers", sub_major_group: "Personal service workers", jobs_k: 1100, pay_eur: 24000, exposure: 3, rationale: "Low — personal interaction and physical presence required.", education: {}, year: 2023 },
  ];
}

function getSampleCountries(): CountrySummary[] {
  return [
    { code: "DE", name: "Germany", group: "eu27", total_jobs_k: 9100, avg_exposure: 5.2, occupations: 6 },
    { code: "FR", name: "France", group: "eu27", total_jobs_k: 5400, avg_exposure: 5.3, occupations: 4 },
    { code: "ES", name: "Spain", group: "eu27", total_jobs_k: 2400, avg_exposure: 5.5, occupations: 2 },
    { code: "PL", name: "Poland", group: "eu27", total_jobs_k: 1400, avg_exposure: 4.5, occupations: 2 },
    { code: "NL", name: "Netherlands", group: "eu27", total_jobs_k: 700, avg_exposure: 7.0, occupations: 1 },
    { code: "IT", name: "Italy", group: "eu27", total_jobs_k: 1100, avg_exposure: 3.0, occupations: 1 },
  ];
}
