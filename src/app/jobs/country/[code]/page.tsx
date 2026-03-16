"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OccupationRecord, CountrySummary } from "@/lib/jobs/types";
import { loadOccupations, loadCountries, filterByCountry } from "@/lib/jobs/data";
import { useTheme } from "@/lib/jobs/theme";
import Treemap from "@/components/jobs/Treemap";
import StatsPanel from "@/components/jobs/StatsPanel";
import OccupationTable from "@/components/jobs/OccupationTable";
import Navbar from "@/components/jobs/Navbar";

export default function CountryPage() {
  const { isDark } = useTheme();
  const params = useParams();
  const code = params.code as string;

  const [allData, setAllData] = useState<OccupationRecord[]>([]);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [view, setView] = useState<"treemap" | "table">("treemap");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadOccupations(), loadCountries()]).then(([occ, ctry]) => {
      setAllData(occ);
      setCountries(ctry);
      setLoading(false);
    });
  }, []);

  const countryData = filterByCountry(allData, code.toUpperCase());
  const country = countries.find((c) => c.code === code.toUpperCase());

  const bg = isDark ? "bg-[#0f0f1a]" : "bg-gray-50";
  const heading = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-gray-200";
  const backLink = isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800";

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

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href="/jobs" className={`text-sm ${backLink}`}>
            &larr; Back to Overview
          </Link>
          <h1 className={`text-2xl font-bold ${heading} mt-2`}>
            {country?.name || code.toUpperCase()}
          </h1>
          <p className={`text-sm ${subText} mt-1`}>
            AI exposure analysis for {country?.name || code}.
            {country?.avg_exposure !== null &&
              ` Average exposure: ${country?.avg_exposure}/10.`}
          </p>
        </div>

        {countryData.length === 0 ? (
          <div className={`rounded-xl shadow-sm border p-8 text-center ${cardBg}`}>
            <p className={subText}>
              No data available for {country?.name || code}. Run the pipeline to
              fetch Eurostat data.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className={`flex gap-1 ${isDark ? "bg-white/10" : "bg-gray-100"} rounded-lg p-0.5 mb-4 w-fit`}>
                <button
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    view === "treemap"
                      ? isDark ? "bg-white/15 text-white shadow" : "bg-white shadow text-gray-900"
                      : isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                  onClick={() => setView("treemap")}
                >
                  Treemap
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    view === "table"
                      ? isDark ? "bg-white/15 text-white shadow" : "bg-white shadow text-gray-900"
                      : isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                  onClick={() => setView("table")}
                >
                  Table
                </button>
              </div>

              {view === "treemap" ? (
                <div className={`rounded-xl shadow-sm border p-4 ${cardBg}`}>
                  <div className="h-[550px]">
                    <Treemap data={countryData} />
                  </div>
                </div>
              ) : (
                <div className={`rounded-xl shadow-sm border p-4 ${cardBg}`}>
                  <OccupationTable data={countryData} showCountry={false} maxRows={100} dark={isDark} />
                </div>
              )}
            </div>

            <aside className="lg:w-72 shrink-0">
              <div className={`rounded-xl shadow-sm border p-4 sticky top-20 ${cardBg}`}>
                <StatsPanel data={countryData} countryName={country?.name} />
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
