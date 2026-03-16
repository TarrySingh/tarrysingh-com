"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OccupationRecord, CountrySummary } from "@/lib/jobs/types";
import { loadOccupations, loadCountries } from "@/lib/jobs/data";
import { exposureColor } from "@/lib/jobs/colors";
import { formatJobCount, formatEUR, formatExposure } from "@/lib/jobs/format";
import ScoreBar from "@/components/jobs/ScoreBar";
import Navbar from "@/components/jobs/Navbar";

export default function OccupationPage() {
  const params = useParams();
  const isco = params.isco as string;

  const [allData, setAllData] = useState<OccupationRecord[]>([]);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadOccupations(), loadCountries()]).then(([occ, ctry]) => {
      setAllData(occ);
      setCountries(ctry);
      setLoading(false);
    });
  }, []);

  const records = allData.filter((r) => r.isco === isco);
  const title = records[0]?.title || `ISCO ${isco}`;
  const exposure = records[0]?.exposure;
  const rationale = records[0]?.rationale;
  const majorGroup = records[0]?.major_group;

  const countryMap = new Map(countries.map((c) => [c.code, c.name]));

  // Sort by employment
  const sortedRecords = [...records].sort(
    (a, b) => (b.jobs_k || 0) - (a.jobs_k || 0)
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-gray-400 text-lg">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href="/jobs" className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to Overview
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mt-2">{title}</h1>
          <p className="text-sm text-gray-500">
            ISCO-08: {isco} &middot; {majorGroup}
          </p>
        </div>

        {/* Exposure score card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                AI Exposure Score
              </h3>
              <div className="w-64">
                <ScoreBar score={exposure ?? null} size="lg" />
              </div>
              {rationale && (
                <p className="text-sm text-gray-600 mt-3 italic">{rationale}</p>
              )}
            </div>
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: exposureColor(exposure ?? null) }}
            >
              {exposure !== undefined ? exposure : "?"}
            </div>
          </div>
        </div>

        {/* Cross-country data */}
        {sortedRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              No country-level data available for this occupation.
            </p>
          </div>
        ) : (
          <>
            {/* Employment bar chart by country */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">
                Employment by Country
              </h3>
              <div className="space-y-2">
                {sortedRecords.map((r) => {
                  const maxJobs = sortedRecords[0]?.jobs_k || 1;
                  return (
                    <div key={r.country} className="flex items-center gap-3">
                      <Link
                        href={`/jobs/country/${r.country.toLowerCase()}`}
                        className="text-sm text-blue-600 hover:text-blue-800 w-28 text-right shrink-0"
                      >
                        {countryMap.get(r.country) || r.country}
                      </Link>
                      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${((r.jobs_k || 0) / maxJobs) * 100}%`,
                            backgroundColor: exposureColor(r.exposure),
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-right">
                        {formatJobCount(r.jobs_k)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">
                Country Details
              </h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Country
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Employment
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Avg Pay (EUR)
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Year
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedRecords.map((r) => (
                    <tr key={r.country} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm">
                        <Link
                          href={`/jobs/country/${r.country.toLowerCase()}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {countryMap.get(r.country) || r.country}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-sm text-right text-gray-600">
                        {formatJobCount(r.jobs_k)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right text-gray-600">
                        {formatEUR(r.pay_eur)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right text-gray-500">
                        {r.year || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
}
