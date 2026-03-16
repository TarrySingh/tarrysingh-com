"use client";

import { useMemo } from "react";
import Link from "next/link";
import { OccupationRecord, CountrySummary } from "@/lib/jobs/types";
import { EXPOSURE_TIERS } from "@/lib/jobs/colors";
import { abbreviateNumber } from "@/lib/jobs/format";
import { useTheme } from "@/lib/jobs/theme";
import CountrySelector from "./CountrySelector";

interface DashboardSidebarProps {
  data: OccupationRecord[];
  countries: CountrySummary[];
  selectedCountry: string | null;
  onCountryChange: (code: string | null) => void;
  countryName?: string;
  view: "treemap" | "table";
  onViewChange: (view: "treemap" | "table") => void;
}

export default function DashboardSidebar({
  data,
  countries,
  selectedCountry,
  onCountryChange,
  countryName,
  view,
  onViewChange,
}: DashboardSidebarProps) {
  const { isDark, toggleTheme } = useTheme();

  const stats = useMemo(() => {
    const totalJobs = data.reduce((sum, r) => sum + (r.jobs_k || 0), 0);
    const scored = data.filter((r) => r.exposure !== null);
    const weightedSum = scored.reduce(
      (sum, r) => sum + (r.exposure || 0) * (r.jobs_k || 1),
      0
    );
    const weightedCount = scored.reduce((sum, r) => sum + (r.jobs_k || 1), 0);
    const avgExposure = weightedCount > 0 ? weightedSum / weightedCount : null;
    const uniqueOccupations = new Set(data.map((r) => r.isco)).size;
    const uniqueCountries = selectedCountry ? 1 : countries.length;

    return { totalJobs, avgExposure, uniqueOccupations, uniqueCountries };
  }, [data, selectedCountry, countries.length]);

  const tiers = useMemo(() => {
    return EXPOSURE_TIERS.map((tier) => {
      const matching = data.filter(
        (r) => r.exposure !== null && r.exposure >= tier.min && r.exposure <= tier.max
      );
      const jobs_k = matching.reduce((sum, r) => sum + (r.jobs_k || 0), 0);
      return { ...tier, count: matching.length, jobs_k };
    });
  }, [data]);

  const totalTierJobs = tiers.reduce((sum, t) => sum + t.jobs_k, 0);

  const { mostExposed, leastExposed } = useMemo(() => {
    const uniqueByIsco = new Map<string, OccupationRecord>();
    for (const r of data) {
      if (r.exposure !== null) {
        const existing = uniqueByIsco.get(r.isco);
        if (!existing || (r.jobs_k || 0) > (existing.jobs_k || 0)) {
          uniqueByIsco.set(r.isco, r);
        }
      }
    }
    const sorted = Array.from(uniqueByIsco.values()).sort(
      (a, b) => (b.exposure || 0) - (a.exposure || 0)
    );
    return {
      mostExposed: sorted.slice(0, 5),
      leastExposed: sorted.slice(-5).reverse(),
    };
  }, [data]);

  const bg = isDark ? "bg-[#1a1a2e]" : "bg-white";
  const text = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";
  const textFaint = isDark ? "text-gray-500" : "text-gray-400";
  const textVeryFaint = isDark ? "text-gray-600" : "text-gray-400";
  const border = isDark ? "border-white/10" : "border-gray-200";
  const cardBg = isDark ? "bg-white/5" : "bg-gray-50";
  const toggleActiveBg = isDark ? "bg-white/15" : "bg-gray-200";

  return (
    <aside className={`w-[380px] shrink-0 ${bg} ${text} overflow-y-auto flex flex-col`}>
      {/* Header */}
      <div className={`px-5 pt-5 pb-4 border-b ${border}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            AI Exposure of European Jobs
          </h1>
          <button
            onClick={toggleTheme}
            className={`ml-2 p-1.5 rounded-md transition-colors ${
              isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        <p className={`text-xs ${textMuted} mt-1`}>
          How susceptible are occupations across Europe to AI automation?
        </p>
        <p className={`text-[10px] ${textFaint} mt-1`}>
          Data: Eurostat + ESCO | Scoring: LLM-based (Gemini 2.5 Flash) |
          Created by:{" "}
          <a
            href="https://tarrysingh.com"
            className="underline hover:text-gray-300"
            target="_blank"
          >
            Tarry Singh
          </a>
          , inspired by{" "}
          <a
            href="https://karpathy.ai/jobs/"
            className="underline hover:text-gray-300"
            target="_blank"
          >
            Karpathy&apos;s Repo on US Job Data
          </a>
        </p>

        {/* Back to experiments */}
        <div className="mt-3">
          <a
            href="/experiments"
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-colors ${
              isDark
                ? "bg-gold-500/10 hover:bg-gold-500/20 text-gold-400"
                : "bg-amber-50 hover:bg-amber-100 text-amber-700"
            }`}
          >
            &larr; Back to Experiments
          </a>
        </div>

        {/* Navigation links */}
        <div className={`flex flex-wrap gap-2 mt-3 text-xs`}>
          {[
            { href: "/jobs/industry", label: "Industry" },
            { href: "/jobs/agentic", label: "Agentic vs Human" },
            { href: "/jobs/compare", label: "Compare" },
            { href: "/jobs/about", label: "About" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                isDark
                  ? "bg-white/10 hover:bg-white/15 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Country selector + view toggle */}
      <div className={`px-5 py-3 border-b ${border} space-y-3`}>
        <div>
          <label className={`text-[10px] uppercase tracking-wider ${textFaint} mb-1 block`}>
            Region
          </label>
          <CountrySelector
            countries={countries}
            selected={selectedCountry}
            onChange={onCountryChange}
            dark={isDark}
          />
        </div>
        <div className={`flex gap-1 ${cardBg} rounded-md p-0.5`}>
          <button
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              view === "treemap"
                ? `${toggleActiveBg} ${text}`
                : `${textMuted} hover:${text}`
            }`}
            onClick={() => onViewChange("treemap")}
          >
            Treemap
          </button>
          <button
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              view === "table"
                ? `${toggleActiveBg} ${text}`
                : `${textMuted} hover:${text}`
            }`}
            onClick={() => onViewChange("table")}
          >
            Table
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={`px-5 py-3 border-b ${border}`}>
        <h2 className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>
          {countryName || "All of Europe"}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className={`${cardBg} rounded-lg px-3 py-2`}>
            <div className={`text-[10px] ${textFaint} uppercase tracking-wider`}>
              Total Jobs
            </div>
            <div className="text-lg font-bold">
              {abbreviateNumber(stats.totalJobs * 1000)}
            </div>
          </div>
          <div className={`${cardBg} rounded-lg px-3 py-2`}>
            <div className={`text-[10px] ${textFaint} uppercase tracking-wider`}>
              Avg Exposure
            </div>
            <div className="text-lg font-bold">
              {stats.avgExposure !== null
                ? `${stats.avgExposure.toFixed(1)}/10`
                : "N/A"}
            </div>
          </div>
          <div className={`${cardBg} rounded-lg px-3 py-2`}>
            <div className={`text-[10px] ${textFaint} uppercase tracking-wider`}>
              Occupations
            </div>
            <div className="text-lg font-bold">{stats.uniqueOccupations}</div>
          </div>
          <div className={`${cardBg} rounded-lg px-3 py-2`}>
            <div className={`text-[10px] ${textFaint} uppercase tracking-wider`}>
              Countries
            </div>
            <div className="text-lg font-bold">{stats.uniqueCountries}</div>
          </div>
        </div>
      </div>

      {/* Exposure distribution - stacked bar */}
      <div className={`px-5 py-3 border-b ${border}`}>
        <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>
          Jobs by AI Exposure
        </h3>
        <div className="flex h-6 rounded overflow-hidden mb-2">
          {tiers.map((tier) => {
            const pct = totalTierJobs > 0 ? (tier.jobs_k / totalTierJobs) * 100 : 0;
            if (pct < 0.5) return null;
            return (
              <div
                key={tier.label}
                className="relative group"
                style={{ width: `${pct}%`, backgroundColor: tier.color }}
              >
                {pct > 8 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90">
                    {Math.round(pct)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="space-y-1">
          {tiers.map((tier) => (
            <div key={tier.label} className="flex items-center text-xs gap-2">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: tier.color }}
              />
              <span className={`${textMuted} w-16`}>{tier.label}</span>
              <span className={`${textFaint} w-8 text-right`}>{tier.range}</span>
              <span className={`${isDark ? "text-gray-300" : "text-gray-700"} flex-1 text-right`}>
                {tier.count} jobs
              </span>
              <span className={`${textMuted} w-14 text-right`}>
                {abbreviateNumber(tier.jobs_k * 1000)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Most exposed */}
      <div className={`px-5 py-3 border-b ${border}`}>
        <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>
          Most Exposed to AI
        </h3>
        <div className="space-y-1">
          {mostExposed.map((r) => (
            <div
              key={r.isco}
              className="flex items-center justify-between text-xs"
            >
              <span className={`${isDark ? "text-gray-300" : "text-gray-700"} truncate mr-2`}>{r.title}</span>
              <span className="text-red-400 font-mono shrink-0">
                {r.exposure}/10
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Least exposed */}
      <div className={`px-5 py-3 border-b ${border}`}>
        <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>
          Least Exposed to AI
        </h3>
        <div className="space-y-1">
          {leastExposed.map((r) => (
            <div
              key={r.isco}
              className="flex items-center justify-between text-xs"
            >
              <span className={`${isDark ? "text-gray-300" : "text-gray-700"} truncate mr-2`}>{r.title}</span>
              <span className="text-green-400 font-mono shrink-0">
                {r.exposure}/10
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Color legend */}
      <div className={`px-5 py-3 mt-auto border-t ${border}`}>
        <div className={`flex items-center gap-1.5 text-[10px] ${textFaint}`}>
          <span>Low</span>
          <div className="flex h-2 flex-1 rounded-full overflow-hidden">
            {EXPOSURE_TIERS.map((tier) => (
              <div
                key={tier.label}
                className="flex-1 h-full"
                style={{ backgroundColor: tier.color }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
        <p className={`text-[10px] ${textVeryFaint} mt-1 text-center`}>
          Area = employment size | Color = AI exposure score
        </p>
      </div>
    </aside>
  );
}
