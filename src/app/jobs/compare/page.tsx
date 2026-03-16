"use client";

import { useEffect, useState } from "react";
import { OccupationRecord, CountrySummary } from "@/lib/jobs/types";
import { loadOccupations, loadCountries, filterByCountry, computeExposureTiers } from "@/lib/jobs/data";
import { exposureColor } from "@/lib/jobs/colors";
import { abbreviateNumber, formatExposure } from "@/lib/jobs/format";
import { useTheme } from "@/lib/jobs/theme";
import ExposureHistogram from "@/components/jobs/ExposureHistogram";
import Navbar from "@/components/jobs/Navbar";

export default function ComparePage() {
  const { isDark } = useTheme();
  const [allData, setAllData] = useState<OccupationRecord[]>([]);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadOccupations(), loadCountries()]).then(([occ, ctry]) => {
      setAllData(occ);
      setCountries(ctry);
      const top5 = ctry
        .sort((a, b) => b.total_jobs_k - a.total_jobs_k)
        .slice(0, 5)
        .map((c) => c.code);
      setSelected(top5);
      setLoading(false);
    });
  }, []);

  const toggleCountry = (code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code].slice(0, 8)
    );
  };

  const bg = isDark ? "bg-[#0f0f1a]" : "bg-gray-50";
  const cardBg = isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-gray-200";
  const heading = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-400" : "text-gray-500";
  const labelText = isDark ? "text-gray-300" : "text-gray-700";
  const barBg = isDark ? "bg-white/10" : "bg-gray-100";
  const valueText = isDark ? "text-gray-300" : "text-gray-600";
  const sectionTitle = isDark ? "text-gray-300" : "text-gray-600";

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

  const selectedCountries = countries.filter((c) => selected.includes(c.code));

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${heading}`}>Compare Countries</h1>
          <p className={`text-sm ${subText} mt-1`}>
            Select up to 8 countries to compare AI exposure side by side.
          </p>
        </div>

        {/* Country picker */}
        <div className={`rounded-xl shadow-sm border p-4 mb-6 ${cardBg}`}>
          <h3 className={`text-sm font-semibold ${sectionTitle} mb-3`}>Select Countries</h3>
          <div className="flex flex-wrap gap-2">
            {countries
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <button
                  key={c.code}
                  onClick={() => toggleCountry(c.code)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selected.includes(c.code)
                      ? "bg-blue-600 text-white border-blue-600"
                      : isDark
                        ? "bg-white/5 text-gray-300 border-white/20 hover:border-blue-400"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {c.name}
                </button>
              ))}
          </div>
        </div>

        {selectedCountries.length > 0 && (
          <>
            {/* Bar chart: average exposure */}
            <div className={`rounded-xl shadow-sm border p-6 mb-6 ${cardBg}`}>
              <h3 className={`text-sm font-semibold ${sectionTitle} mb-4`}>
                Average AI Exposure by Country
              </h3>
              <div className="space-y-3">
                {selectedCountries
                  .sort((a, b) => (b.avg_exposure || 0) - (a.avg_exposure || 0))
                  .map((c) => (
                    <div key={c.code} className="flex items-center gap-3">
                      <span className={`text-sm ${labelText} w-28 text-right shrink-0`}>
                        {c.name}
                      </span>
                      <div className={`flex-1 h-6 ${barBg} rounded overflow-hidden`}>
                        <div
                          className="h-full rounded transition-all duration-500"
                          style={{
                            width: `${((c.avg_exposure || 0) / 10) * 100}%`,
                            backgroundColor: exposureColor(c.avg_exposure),
                          }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${valueText} w-12 text-right`}>
                        {c.avg_exposure !== null ? `${c.avg_exposure}` : "N/A"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Employment comparison */}
            <div className={`rounded-xl shadow-sm border p-6 mb-6 ${cardBg}`}>
              <h3 className={`text-sm font-semibold ${sectionTitle} mb-4`}>
                Total Employment (in dataset)
              </h3>
              <div className="space-y-3">
                {selectedCountries
                  .sort((a, b) => b.total_jobs_k - a.total_jobs_k)
                  .map((c) => {
                    const maxJobs = Math.max(
                      ...selectedCountries.map((x) => x.total_jobs_k)
                    );
                    return (
                      <div key={c.code} className="flex items-center gap-3">
                        <span className={`text-sm ${labelText} w-28 text-right shrink-0`}>
                          {c.name}
                        </span>
                        <div className={`flex-1 h-6 ${barBg} rounded overflow-hidden`}>
                          <div
                            className="h-full rounded bg-blue-500 transition-all duration-500"
                            style={{
                              width: `${(c.total_jobs_k / maxJobs) * 100}%`,
                            }}
                          />
                        </div>
                        <span className={`text-sm ${valueText} w-16 text-right`}>
                          {abbreviateNumber(c.total_jobs_k * 1000)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Per-country exposure distributions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCountries.map((c) => {
                const data = filterByCountry(allData, c.code);
                const tiers = computeExposureTiers(data);
                return (
                  <div
                    key={c.code}
                    className={`rounded-xl shadow-sm border p-4 ${cardBg}`}
                  >
                    <ExposureHistogram
                      tiers={tiers}
                      mode="jobs"
                      title={`${c.name} — Exposure by Employment`}
                      dark={isDark}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
