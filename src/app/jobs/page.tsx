"use client";

import { useEffect, useState } from "react";
import { OccupationRecord, CountrySummary } from "@/lib/jobs/types";
import {
  loadOccupations,
  loadCountries,
  filterByCountry,
  aggregateByOccupation,
} from "@/lib/jobs/data";
import { useTheme } from "@/lib/jobs/theme";
import Treemap from "@/components/jobs/Treemap";
import OccupationTable from "@/components/jobs/OccupationTable";
import DashboardSidebar from "@/components/jobs/DashboardSidebar";

export default function HomePage() {
  const { isDark } = useTheme();
  const [allData, setAllData] = useState<OccupationRecord[]>([]);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [view, setView] = useState<"treemap" | "table">("treemap");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadOccupations(), loadCountries()]).then(([occ, ctry]) => {
      setAllData(occ);
      setCountries(ctry);
      setLoading(false);
    });
  }, []);

  const displayData = selectedCountry
    ? filterByCountry(allData, selectedCountry)
    : aggregateByOccupation(allData);

  const countryName = selectedCountry
    ? countries.find((c) => c.code === selectedCountry)?.name || selectedCountry
    : undefined;

  const bgColor = isDark ? "bg-[#0f0f1a]" : "bg-gray-100";

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bgColor}`}>
        <div className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading data...</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${bgColor}`}>
      <DashboardSidebar
        data={displayData}
        rawData={selectedCountry ? filterByCountry(allData, selectedCountry) : allData}
        countries={countries}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        countryName={countryName}
        view={view}
        onViewChange={setView}
      />

      <main className="flex-1 overflow-hidden">
        {view === "treemap" ? (
          <Treemap data={displayData} />
        ) : (
          <div className={`h-full overflow-y-auto ${isDark ? "bg-[#12122a]" : "bg-white"} p-4`}>
            <OccupationTable
              data={displayData}
              showCountry={!selectedCountry}
              maxRows={200}
              dark={isDark}
            />
          </div>
        )}
      </main>
    </div>
  );
}
