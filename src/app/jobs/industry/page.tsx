"use client";

import { useEffect, useState, useMemo } from "react";
import {
  OccupationRecord,
  OccupationEnrichment,
  INDUSTRY_LABELS,
  INDUSTRY_COLORS,
} from "@/lib/jobs/types";
import {
  loadOccupations,
  loadEnrichment,
  aggregateByOccupation,
} from "@/lib/jobs/data";
import { useTheme } from "@/lib/jobs/theme";
import { abbreviateNumber } from "@/lib/jobs/format";
import { exposureColor } from "@/lib/jobs/colors";
import Navbar from "@/components/jobs/Navbar";

interface IndustryStats {
  key: string;
  label: string;
  color: string;
  totalJobs: number;
  avgExposure: number;
  occupationCount: number;
  topOccupations: { title: string; exposure: number; jobs_k: number; share: number }[];
}

export default function IndustryPage() {
  const { isDark } = useTheme();
  const [allData, setAllData] = useState<OccupationRecord[]>([]);
  const [enrichment, setEnrichment] = useState<OccupationEnrichment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadOccupations(), loadEnrichment()]).then(([occ, enr]) => {
      setAllData(occ);
      setEnrichment(enr);
      setLoading(false);
    });
  }, []);

  const aggregatedData = useMemo(() => aggregateByOccupation(allData), [allData]);

  const enrichmentMap = useMemo(() => {
    const map = new Map<string, OccupationEnrichment>();
    for (const e of enrichment) {
      map.set(e.isco_code, e);
    }
    return map;
  }, [enrichment]);

  const industries = useMemo(() => {
    if (enrichment.length === 0) return [];

    const industryData = new Map<string, {
      totalWeightedJobs: number;
      exposureSum: number;
      exposureWeight: number;
      occupations: { title: string; exposure: number; jobs_k: number; share: number }[];
    }>();

    // Initialize all industries
    for (const key of Object.keys(INDUSTRY_LABELS)) {
      industryData.set(key, {
        totalWeightedJobs: 0,
        exposureSum: 0,
        exposureWeight: 0,
        occupations: [],
      });
    }

    // For each occupation, distribute its jobs across industries
    for (const occ of aggregatedData) {
      const enr = enrichmentMap.get(occ.isco);
      if (!enr || !occ.jobs_k) continue;

      for (const [industry, pct] of Object.entries(enr.industry_distribution)) {
        const data = industryData.get(industry);
        if (!data) continue;

        const share = pct / 100;
        const jobsInIndustry = occ.jobs_k * share;

        data.totalWeightedJobs += jobsInIndustry;
        if (occ.exposure !== null) {
          data.exposureSum += occ.exposure * jobsInIndustry;
          data.exposureWeight += jobsInIndustry;
        }
        data.occupations.push({
          title: occ.title,
          exposure: occ.exposure || 0,
          jobs_k: jobsInIndustry,
          share: pct,
        });
      }
    }

    // Build sorted industry stats
    const result: IndustryStats[] = [];
    for (const [key, data] of industryData.entries()) {
      if (data.totalWeightedJobs < 1) continue;
      const avgExp = data.exposureWeight > 0
        ? data.exposureSum / data.exposureWeight
        : 0;

      // Top occupations by employment in this industry
      const topOcc = [...data.occupations]
        .sort((a, b) => b.jobs_k - a.jobs_k)
        .slice(0, 10);

      result.push({
        key,
        label: INDUSTRY_LABELS[key] || key,
        color: INDUSTRY_COLORS[key] || "#6B7280",
        totalJobs: data.totalWeightedJobs,
        avgExposure: Math.round(avgExp * 10) / 10,
        occupationCount: data.occupations.length,
        topOccupations: topOcc,
      });
    }

    return result.sort((a, b) => b.totalJobs - a.totalJobs);
  }, [aggregatedData, enrichment, enrichmentMap]);

  const totalAllJobs = industries.reduce((s, i) => s + i.totalJobs, 0);

  const bg = isDark ? "bg-[#0f0f1a]" : "bg-gray-50";
  const cardBg = isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-gray-200";
  const heading = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-400" : "text-gray-500";
  const labelText = isDark ? "text-gray-300" : "text-gray-700";
  const barBg = isDark ? "bg-white/10" : "bg-gray-100";

  if (loading) {
    return (
      <div className={`min-h-screen ${bg}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className={`text-lg ${subText}`}>Loading...</div>
        </div>
      </div>
    );
  }

  if (enrichment.length === 0) {
    return (
      <div className={`min-h-screen ${bg}`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className={`text-2xl font-bold ${heading}`}>AI Exposure by Industry</h1>
          <div className={`mt-6 rounded-xl shadow-sm border p-8 text-center ${cardBg}`}>
            <p className={subText}>
              Industry enrichment data not yet available. Run the enrichment pipeline stage first:
            </p>
            <code className={`block mt-3 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              python scripts/run_pipeline.py --only enrich_occupations
            </code>
          </div>
        </main>
      </div>
    );
  }

  const selected = selectedIndustry
    ? industries.find((i) => i.key === selectedIndustry)
    : null;

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${heading}`}>AI Exposure by Industry</h1>
          <p className={`text-sm ${subText} mt-1`}>
            How AI exposure distributes across major industry verticals in Europe.
            Employment is allocated to industries based on LLM-estimated occupation-to-sector mappings.
          </p>
        </div>

        {/* Industry overview bar chart */}
        <div className={`rounded-xl shadow-sm border p-6 mb-6 ${cardBg}`}>
          <h3 className={`text-sm font-semibold ${labelText} mb-4`}>
            Employment by Industry (colored by avg AI exposure)
          </h3>
          <div className="space-y-3">
            {industries.map((ind) => {
              const pct = totalAllJobs > 0 ? (ind.totalJobs / totalAllJobs) * 100 : 0;
              return (
                <button
                  key={ind.key}
                  onClick={() => setSelectedIndustry(selectedIndustry === ind.key ? null : ind.key)}
                  className={`w-full flex items-center gap-3 group text-left rounded-lg p-1 -m-1 transition-colors ${
                    selectedIndustry === ind.key
                      ? isDark ? "bg-white/10" : "bg-blue-50"
                      : isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-sm ${labelText} w-36 text-right shrink-0 truncate`}>
                    {ind.label}
                  </span>
                  <div className={`flex-1 h-7 ${barBg} rounded overflow-hidden`}>
                    <div
                      className="h-full rounded transition-all duration-500 flex items-center px-2"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: exposureColor(ind.avgExposure, 0.85),
                      }}
                    >
                      {pct > 8 && (
                        <span className="text-[10px] font-bold text-white/90">
                          {abbreviateNumber(ind.totalJobs * 1000)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-mono ${subText} w-10 text-right`}>
                    {ind.avgExposure}/10
                  </span>
                  <span className={`text-xs ${subText} w-14 text-right`}>
                    {abbreviateNumber(ind.totalJobs * 1000)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exposure comparison */}
        <div className={`rounded-xl shadow-sm border p-6 mb-6 ${cardBg}`}>
          <h3 className={`text-sm font-semibold ${labelText} mb-4`}>
            Average AI Exposure by Industry
          </h3>
          <div className="space-y-2">
            {[...industries]
              .sort((a, b) => b.avgExposure - a.avgExposure)
              .map((ind) => (
                <div key={ind.key} className="flex items-center gap-3">
                  <span className={`text-xs ${labelText} w-36 text-right shrink-0 truncate`}>
                    {ind.label}
                  </span>
                  <div className={`flex-1 h-5 ${barBg} rounded overflow-hidden`}>
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${(ind.avgExposure / 10) * 100}%`,
                        backgroundColor: exposureColor(ind.avgExposure, 0.85),
                      }}
                    />
                  </div>
                  <span className={`text-xs font-mono font-medium ${labelText} w-10 text-right`}>
                    {ind.avgExposure}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Selected industry detail */}
        {selected && (
          <div className={`rounded-xl shadow-sm border p-6 mb-6 ${cardBg}`}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: selected.color }}
              />
              <h3 className={`text-lg font-bold ${heading}`}>{selected.label}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`${isDark ? "bg-white/5" : "bg-gray-50"} rounded-lg p-3`}>
                <div className={`text-xs ${subText}`}>Est. Employment</div>
                <div className={`text-xl font-bold ${heading}`}>
                  {abbreviateNumber(selected.totalJobs * 1000)}
                </div>
              </div>
              <div className={`${isDark ? "bg-white/5" : "bg-gray-50"} rounded-lg p-3`}>
                <div className={`text-xs ${subText}`}>Avg AI Exposure</div>
                <div className={`text-xl font-bold ${heading}`}>
                  {selected.avgExposure}/10
                </div>
              </div>
              <div className={`${isDark ? "bg-white/5" : "bg-gray-50"} rounded-lg p-3`}>
                <div className={`text-xs ${subText}`}>Occupations</div>
                <div className={`text-xl font-bold ${heading}`}>
                  {selected.occupationCount}
                </div>
              </div>
            </div>

            <h4 className={`text-sm font-semibold ${labelText} mb-3`}>
              Top Occupations in {selected.label}
            </h4>
            <div className="space-y-2">
              {selected.topOccupations.map((occ, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-sm ${labelText} flex-1 truncate`}>
                    {occ.title}
                  </span>
                  <span className={`text-xs ${subText} w-16 text-right`}>
                    {abbreviateNumber(occ.jobs_k * 1000)}
                  </span>
                  <div className="w-20 flex items-center gap-1">
                    <div className={`flex-1 h-2 ${barBg} rounded-full overflow-hidden`}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(occ.exposure / 10) * 100}%`,
                          backgroundColor: exposureColor(occ.exposure),
                        }}
                      />
                    </div>
                    <span className={`text-xs font-mono ${subText} w-6 text-right`}>
                      {occ.exposure}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stacked industry composition */}
        <div className={`rounded-xl shadow-sm border p-6 ${cardBg}`}>
          <h3 className={`text-sm font-semibold ${labelText} mb-4`}>
            Industry Share of European Employment
          </h3>
          <div className="flex h-10 rounded-lg overflow-hidden mb-4">
            {industries.map((ind) => {
              const pct = totalAllJobs > 0 ? (ind.totalJobs / totalAllJobs) * 100 : 0;
              if (pct < 1) return null;
              return (
                <div
                  key={ind.key}
                  className="relative group cursor-pointer"
                  style={{ width: `${pct}%`, backgroundColor: ind.color }}
                  onClick={() => setSelectedIndustry(selectedIndustry === ind.key ? null : ind.key)}
                  title={`${ind.label}: ${Math.round(pct)}%`}
                >
                  {pct > 5 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90">
                      {Math.round(pct)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            {industries.map((ind) => (
              <div key={ind.key} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: ind.color }}
                />
                <span className={subText}>{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
