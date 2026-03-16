"use client";

import { CountrySummary, COUNTRY_GROUP_LABELS } from "@/lib/jobs/types";
import { formatExposure } from "@/lib/jobs/format";

interface CountrySelectorProps {
  countries: CountrySummary[];
  selected: string | null;
  onChange: (code: string | null) => void;
  dark?: boolean;
}

export default function CountrySelector({
  countries,
  selected,
  onChange,
  dark = false,
}: CountrySelectorProps) {
  // Group countries
  const groups = new Map<string, CountrySummary[]>();
  for (const c of countries) {
    const existing = groups.get(c.group) || [];
    existing.push(c);
    groups.set(c.group, existing);
  }

  return (
    <div>
      <select
        value={selected || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          dark
            ? "bg-white/10 border-white/20 text-white"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        <option value="">All of Europe</option>
        {Array.from(groups.entries()).map(([group, items]) => (
          <optgroup key={group} label={COUNTRY_GROUP_LABELS[group] || group}>
            {items
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                  {c.avg_exposure !== null ? ` (${formatExposure(c.avg_exposure)})` : ""}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
