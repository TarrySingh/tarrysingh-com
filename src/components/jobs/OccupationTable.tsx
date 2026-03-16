"use client";

import { useState, useMemo } from "react";
import { OccupationRecord } from "@/lib/jobs/types";
import { formatJobCount, formatEUR, formatExposure } from "@/lib/jobs/format";
import { exposureColor } from "@/lib/jobs/colors";

interface OccupationTableProps {
  data: OccupationRecord[];
  showCountry?: boolean;
  maxRows?: number;
  dark?: boolean;
}

type SortKey = "title" | "jobs_k" | "exposure" | "pay_eur" | "country";
type SortDir = "asc" | "desc";

export default function OccupationTable({
  data,
  showCountry = true,
  maxRows = 50,
  dark = false,
}: OccupationTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("exposure");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.isco.includes(q) ||
          r.major_group.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const displayed = sorted.slice(0, maxRows);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const thClass = dark
    ? "px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 select-none"
    : "px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none";

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th className={thClass} onClick={() => toggleSort(field)}>
      {label}
      {sortKey === field && (
        <span className="ml-1">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>
      )}
    </th>
  );

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search occupations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            dark
              ? "bg-white/10 border-white/20 text-white placeholder-gray-500"
              : "bg-white border-gray-300"
          }`}
        />
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className={`min-w-full divide-y ${dark ? "divide-white/10" : "divide-gray-200"}`}>
          <thead className={dark ? "bg-white/5" : "bg-gray-50"}>
            <tr>
              {showCountry && <SortHeader label="Country" field="country" />}
              <SortHeader label="Occupation" field="title" />
              <th className={thClass}>ISCO</th>
              <SortHeader label="Jobs" field="jobs_k" />
              <SortHeader label="Avg Pay" field="pay_eur" />
              <SortHeader label="AI Exposure" field="exposure" />
            </tr>
          </thead>
          <tbody className={`divide-y ${dark ? "divide-white/5" : "divide-gray-200"}`}>
            {displayed.map((r, i) => (
              <tr
                key={`${r.country}-${r.isco}-${i}`}
                className={dark ? "hover:bg-white/5" : "hover:bg-gray-50"}
              >
                {showCountry && (
                  <td className={`px-3 py-2 text-sm font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>
                    {r.country}
                  </td>
                )}
                <td className={`px-3 py-2 text-sm ${dark ? "text-gray-200" : "text-gray-900"}`}>
                  {r.title}
                </td>
                <td className={`px-3 py-2 text-sm font-mono ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {r.isco}
                </td>
                <td className={`px-3 py-2 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
                  {formatJobCount(r.jobs_k)}
                </td>
                <td className={`px-3 py-2 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
                  {formatEUR(r.pay_eur)}
                </td>
                <td className="px-3 py-2 w-40">
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 ${dark ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${((r.exposure || 0) / 10) * 100}%`,
                          backgroundColor: exposureColor(r.exposure),
                        }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-8 ${dark ? "text-gray-300" : "text-gray-600"}`}>
                      {r.exposure !== null ? `${r.exposure}` : "-"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > maxRows && (
        <p className={`mt-2 text-xs text-center ${dark ? "text-gray-500" : "text-gray-400"}`}>
          Showing {maxRows} of {sorted.length} occupations
        </p>
      )}
    </div>
  );
}
