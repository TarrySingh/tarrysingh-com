"use client";

import { OccupationRecord } from "@/lib/jobs/types";
import { abbreviateNumber } from "@/lib/jobs/format";
import ExposureHistogram from "./ExposureHistogram";
import { computeExposureTiers } from "@/lib/jobs/data";
import { useTheme } from "@/lib/jobs/theme";

interface StatsPanelProps {
  data: OccupationRecord[];
  countryName?: string;
}

export default function StatsPanel({ data, countryName }: StatsPanelProps) {
  const { isDark } = useTheme();
  const totalJobs = data.reduce((sum, r) => sum + (r.jobs_k || 0) * 1000, 0);

  const scoredData = data.filter((r) => r.exposure !== null);
  const avgExposure =
    scoredData.length > 0
      ? scoredData.reduce((sum, r) => {
          const weight = r.jobs_k || 1;
          return sum + (r.exposure || 0) * weight;
        }, 0) / scoredData.reduce((sum, r) => sum + (r.jobs_k || 1), 0)
      : null;

  const uniqueOccupations = new Set(data.map((r) => r.isco)).size;
  const tiers = computeExposureTiers(data);

  const sorted = [...data].filter((r) => r.exposure !== null).sort((a, b) => (b.exposure || 0) - (a.exposure || 0));
  const mostExposed = sorted.slice(0, 3);
  const leastExposed = sorted.slice(-3).reverse();

  const statCard = (lightBg: string, darkBg: string, lightLabel: string, darkLabel: string, lightValue: string, darkValue: string) =>
    `${isDark ? darkBg : lightBg} rounded-lg p-3`;
  const labelClass = (light: string, dark: string) => `text-xs font-medium ${isDark ? dark : light}`;
  const valueClass = (light: string, dark: string) => `text-xl font-bold ${isDark ? dark : light}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
          {countryName || "Europe"}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className={isDark ? "bg-blue-900/30 rounded-lg p-3" : "bg-blue-50 rounded-lg p-3"}>
            <div className={labelClass("text-blue-600", "text-blue-300")}>Total Jobs</div>
            <div className={valueClass("text-blue-900", "text-blue-200")}>
              {abbreviateNumber(totalJobs)}
            </div>
          </div>
          <div className={isDark ? "bg-orange-900/30 rounded-lg p-3" : "bg-orange-50 rounded-lg p-3"}>
            <div className={labelClass("text-orange-600", "text-orange-300")}>Avg Exposure</div>
            <div className={valueClass("text-orange-900", "text-orange-200")}>
              {avgExposure !== null ? `${avgExposure.toFixed(1)}/10` : "N/A"}
            </div>
          </div>
          <div className={isDark ? "bg-green-900/30 rounded-lg p-3" : "bg-green-50 rounded-lg p-3"}>
            <div className={labelClass("text-green-600", "text-green-300")}>Occupations</div>
            <div className={valueClass("text-green-900", "text-green-200")}>{uniqueOccupations}</div>
          </div>
          <div className={isDark ? "bg-purple-900/30 rounded-lg p-3" : "bg-purple-50 rounded-lg p-3"}>
            <div className={labelClass("text-purple-600", "text-purple-300")}>Countries</div>
            <div className={valueClass("text-purple-900", "text-purple-200")}>
              {new Set(data.map((r) => r.country)).size}
            </div>
          </div>
        </div>
      </div>

      <ExposureHistogram tiers={tiers} mode="count" title="By Occupation Count" dark={isDark} />
      <ExposureHistogram tiers={tiers} mode="jobs" title="By Employment" dark={isDark} />

      {mostExposed.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-600"} mb-2`}>Most Exposed</h3>
          <div className="space-y-1">
            {mostExposed.map((r) => (
              <div key={`${r.country}-${r.isco}`} className="flex justify-between text-xs">
                <span className={`${isDark ? "text-gray-300" : "text-gray-700"} truncate mr-2`}>{r.title}</span>
                <span className="font-medium text-red-500 shrink-0">
                  {r.exposure}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {leastExposed.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-600"} mb-2`}>Least Exposed</h3>
          <div className="space-y-1">
            {leastExposed.map((r) => (
              <div key={`${r.country}-${r.isco}`} className="flex justify-between text-xs">
                <span className={`${isDark ? "text-gray-300" : "text-gray-700"} truncate mr-2`}>{r.title}</span>
                <span className="font-medium text-green-500 shrink-0">
                  {r.exposure}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
