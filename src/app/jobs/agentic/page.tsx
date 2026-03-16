"use client";

import { useEffect, useState, useMemo } from "react";
import {
  OccupationRecord,
  OccupationEnrichment,
  WAGE_PRESSURE_COLORS,
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

type SortKey = "title" | "exposure" | "automation_2030" | "skill_decay" | "wage_pressure" | "jobs_k";

const WAGE_ORDER: Record<string, number> = { none: 0, low: 1, moderate: 2, high: 3, severe: 4 };

export default function AgenticPage() {
  const { isDark } = useTheme();
  const [allData, setAllData] = useState<OccupationRecord[]>([]);
  const [enrichment, setEnrichment] = useState<OccupationEnrichment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("automation_2030");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [selectedPressure, setSelectedPressure] = useState<string | null>(null);

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
    for (const e of enrichment) map.set(e.isco_code, e);
    return map;
  }, [enrichment]);

  // Merge occupation data with enrichment
  const mergedData = useMemo(() => {
    return aggregatedData
      .filter((occ) => enrichmentMap.has(occ.isco))
      .map((occ) => {
        const enr = enrichmentMap.get(occ.isco)!;
        return { ...occ, enr };
      });
  }, [aggregatedData, enrichmentMap]);

  // Filter and sort
  const displayData = useMemo(() => {
    let data = mergedData;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) => r.title.toLowerCase().includes(q) || r.isco.includes(q)
      );
    }
    if (selectedPressure) {
      data = data.filter((r) => r.enr.wage_pressure === selectedPressure);
    }

    return [...data].sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case "title":
          return sortDir === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case "exposure":
          av = a.exposure || 0; bv = b.exposure || 0; break;
        case "automation_2030":
          av = a.enr.task_automation_2030; bv = b.enr.task_automation_2030; break;
        case "skill_decay":
          av = a.enr.skill_decay_years; bv = b.enr.skill_decay_years; break;
        case "wage_pressure":
          av = WAGE_ORDER[a.enr.wage_pressure] || 0;
          bv = WAGE_ORDER[b.enr.wage_pressure] || 0; break;
        case "jobs_k":
          av = a.jobs_k || 0; bv = b.jobs_k || 0; break;
        default:
          av = 0; bv = 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [mergedData, search, selectedPressure, sortKey, sortDir]);

  // Summary stats
  const stats = useMemo(() => {
    if (mergedData.length === 0) return null;
    const totalJobs = mergedData.reduce((s, r) => s + (r.jobs_k || 0), 0);

    // Jobs at risk by 2030 (>60% task automation)
    const highRiskJobs = mergedData
      .filter((r) => r.enr.task_automation_2030 >= 60)
      .reduce((s, r) => s + (r.jobs_k || 0), 0);

    // Average automation by timeline
    const avgAuto2025 = mergedData.reduce((s, r) => s + r.enr.task_automation_2025 * (r.jobs_k || 1), 0)
      / mergedData.reduce((s, r) => s + (r.jobs_k || 1), 0);
    const avgAuto2027 = mergedData.reduce((s, r) => s + r.enr.task_automation_2027 * (r.jobs_k || 1), 0)
      / mergedData.reduce((s, r) => s + (r.jobs_k || 1), 0);
    const avgAuto2030 = mergedData.reduce((s, r) => s + r.enr.task_automation_2030 * (r.jobs_k || 1), 0)
      / mergedData.reduce((s, r) => s + (r.jobs_k || 1), 0);

    // Average skill decay
    const avgSkillDecay = mergedData.reduce((s, r) => s + r.enr.skill_decay_years * (r.jobs_k || 1), 0)
      / mergedData.reduce((s, r) => s + (r.jobs_k || 1), 0);

    // Wage pressure distribution
    const pressureDist: Record<string, number> = { none: 0, low: 0, moderate: 0, high: 0, severe: 0 };
    for (const r of mergedData) {
      pressureDist[r.enr.wage_pressure] = (pressureDist[r.enr.wage_pressure] || 0) + (r.jobs_k || 0);
    }

    return { totalJobs, highRiskJobs, avgAuto2025, avgAuto2027, avgAuto2030, avgSkillDecay, pressureDist };
  }, [mergedData]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const bg = isDark ? "bg-[#0f0f1a]" : "bg-gray-50";
  const cardBg = isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-gray-200";
  const heading = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-400" : "text-gray-500";
  const labelText = isDark ? "text-gray-300" : "text-gray-700";
  const barBg = isDark ? "bg-white/10" : "bg-gray-100";
  const statBg = isDark ? "bg-white/5" : "bg-gray-50";

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
          <h1 className={`text-2xl font-bold ${heading}`}>Agentic vs Human</h1>
          <div className={`mt-6 rounded-xl shadow-sm border p-8 text-center ${cardBg}`}>
            <p className={subText}>
              Agentic impact data not yet available. Run the enrichment pipeline stage first:
            </p>
            <code className={`block mt-3 text-sm ${labelText}`}>
              python scripts/run_pipeline.py --only enrich_occupations
            </code>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${heading}`}>Agentic vs Human</h1>
          <p className={`text-sm ${subText} mt-1`}>
            How AI agents will progressively take over tasks from human workers.
            Estimates of task automation timelines, skill decay, and wage pressure across European occupations.
          </p>
        </div>

        {/* Summary stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`rounded-xl shadow-sm border p-4 ${cardBg}`}>
              <div className={`text-xs ${subText}`}>Jobs Analyzed</div>
              <div className={`text-2xl font-bold ${heading}`}>
                {abbreviateNumber(stats.totalJobs * 1000)}
              </div>
            </div>
            <div className={`rounded-xl shadow-sm border p-4 ${cardBg}`}>
              <div className={`text-xs ${subText}`}>High Risk by 2030</div>
              <div className="text-2xl font-bold text-red-500">
                {abbreviateNumber(stats.highRiskJobs * 1000)}
              </div>
              <div className={`text-[10px] ${subText}`}>
                {stats.totalJobs > 0 ? Math.round((stats.highRiskJobs / stats.totalJobs) * 100) : 0}% of workforce
              </div>
            </div>
            <div className={`rounded-xl shadow-sm border p-4 ${cardBg}`}>
              <div className={`text-xs ${subText}`}>Avg Skill Decay</div>
              <div className={`text-2xl font-bold ${heading}`}>
                {stats.avgSkillDecay.toFixed(1)} yrs
              </div>
              <div className={`text-[10px] ${subText}`}>until 50% skills obsolete</div>
            </div>
            <div className={`rounded-xl shadow-sm border p-4 ${cardBg}`}>
              <div className={`text-xs ${subText}`}>Avg Task Automation</div>
              <div className={`text-2xl font-bold ${heading}`}>
                {Math.round(stats.avgAuto2030)}%
              </div>
              <div className={`text-[10px] ${subText}`}>by 2030</div>
            </div>
          </div>
        )}

        {/* Automation timeline */}
        {stats && (
          <div className={`rounded-xl shadow-sm border p-6 mb-6 ${cardBg}`}>
            <h3 className={`text-sm font-semibold ${labelText} mb-4`}>
              Task Automation Timeline (employment-weighted average)
            </h3>
            <div className="flex items-end gap-8 h-48">
              {[
                { year: "2025", value: stats.avgAuto2025, color: "#EAB308" },
                { year: "2027", value: stats.avgAuto2027, color: "#F97316" },
                { year: "2030", value: stats.avgAuto2030, color: "#EF4444" },
              ].map((point) => (
                <div key={point.year} className="flex-1 flex flex-col items-center gap-2">
                  <span className={`text-2xl font-bold ${heading}`}>
                    {Math.round(point.value)}%
                  </span>
                  <div className={`w-full ${barBg} rounded-t-lg overflow-hidden relative`} style={{ height: "120px" }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700"
                      style={{
                        height: `${point.value}%`,
                        backgroundColor: point.color,
                      }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${labelText}`}>{point.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wage pressure distribution */}
        {stats && (
          <div className={`rounded-xl shadow-sm border p-6 mb-6 ${cardBg}`}>
            <h3 className={`text-sm font-semibold ${labelText} mb-4`}>
              Wage Pressure Distribution
            </h3>
            <div className="flex h-8 rounded-lg overflow-hidden mb-3">
              {(["none", "low", "moderate", "high", "severe"] as const).map((level) => {
                const jobs = stats.pressureDist[level] || 0;
                const pct = stats.totalJobs > 0 ? (jobs / stats.totalJobs) * 100 : 0;
                if (pct < 0.5) return null;
                return (
                  <button
                    key={level}
                    className="relative group"
                    style={{ width: `${pct}%`, backgroundColor: WAGE_PRESSURE_COLORS[level] }}
                    onClick={() => setSelectedPressure(selectedPressure === level ? null : level)}
                  >
                    {pct > 8 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90">
                        {Math.round(pct)}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4">
              {(["none", "low", "moderate", "high", "severe"] as const).map((level) => {
                const jobs = stats.pressureDist[level] || 0;
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedPressure(selectedPressure === level ? null : level)}
                    className={`flex items-center gap-1.5 text-xs transition-opacity ${
                      selectedPressure && selectedPressure !== level ? "opacity-40" : ""
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: WAGE_PRESSURE_COLORS[level] }}
                    />
                    <span className={labelText} style={{ textTransform: "capitalize" }}>
                      {level}
                    </span>
                    <span className={subText}>
                      ({abbreviateNumber(jobs * 1000)})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Occupation table */}
        <div className={`rounded-xl shadow-sm border p-6 ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${labelText}`}>
              Occupation Detail
              {selectedPressure && (
                <span className={`ml-2 text-xs font-normal ${subText}`}>
                  (filtering: {selectedPressure} wage pressure)
                </span>
              )}
            </h3>
            <input
              type="text"
              placeholder="Search occupations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`px-3 py-1.5 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-white/10 border-white/20 text-white placeholder-gray-500"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? "divide-white/10" : "divide-gray-200"}`}>
              <thead className={isDark ? "bg-white/5" : "bg-gray-50"}>
                <tr>
                  {([
                    ["Occupation", "title"],
                    ["Jobs", "jobs_k"],
                    ["Exposure", "exposure"],
                    ["Auto 2030", "automation_2030"],
                    ["Skill Decay", "skill_decay"],
                    ["Wage Pressure", "wage_pressure"],
                  ] as [string, SortKey][]).map(([label, key]) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                        isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {label}
                      {sortKey === key && (
                        <span className="ml-1">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>
                      )}
                    </th>
                  ))}
                  <th className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Human vs Agent
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-200"}`}>
                {displayData.slice(0, 100).map((r) => (
                  <tr key={r.isco} className={isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}>
                    <td className={`px-3 py-2 text-sm ${labelText} max-w-[200px] truncate`}>
                      {r.title}
                    </td>
                    <td className={`px-3 py-2 text-sm ${subText}`}>
                      {abbreviateNumber((r.jobs_k || 0) * 1000)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-12 h-2 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${((r.exposure || 0) / 10) * 100}%`,
                              backgroundColor: exposureColor(r.exposure),
                            }}
                          />
                        </div>
                        <span className={`text-xs font-mono ${subText}`}>{r.exposure}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-16 h-2 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${r.enr.task_automation_2030}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono ${subText}`}>
                          {r.enr.task_automation_2030}%
                        </span>
                      </div>
                    </td>
                    <td className={`px-3 py-2 text-sm font-mono ${labelText}`}>
                      {r.enr.skill_decay_years}y
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: WAGE_PRESSURE_COLORS[r.enr.wage_pressure] }}
                      >
                        {r.enr.wage_pressure}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-[11px] ${subText} max-w-[250px]`}>
                      <div className="truncate" title={r.enr.human_advantage}>
                        <span className={isDark ? "text-green-400" : "text-green-600"}>H:</span> {r.enr.human_advantage}
                      </div>
                      <div className="truncate" title={r.enr.agent_capability}>
                        <span className={isDark ? "text-red-400" : "text-red-600"}>A:</span> {r.enr.agent_capability}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayData.length > 100 && (
            <p className={`mt-2 text-xs text-center ${subText}`}>
              Showing 100 of {displayData.length} occupations
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
