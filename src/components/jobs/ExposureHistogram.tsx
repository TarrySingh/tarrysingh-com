"use client";

import { ExposureTier } from "@/lib/jobs/types";
import { exposureColor } from "@/lib/jobs/colors";
import { abbreviateNumber } from "@/lib/jobs/format";

interface ExposureHistogramProps {
  tiers: ExposureTier[];
  mode?: "count" | "jobs";
  title?: string;
  dark?: boolean;
}

export default function ExposureHistogram({
  tiers,
  mode = "count",
  title = "Exposure Distribution",
  dark = false,
}: ExposureHistogramProps) {
  const getValue = (t: ExposureTier) => (mode === "count" ? t.count : t.jobs_k * 1000);
  const maxValue = Math.max(...tiers.map(getValue), 1);

  return (
    <div>
      <h3 className={`text-sm font-semibold ${dark ? "text-gray-300" : "text-gray-600"} mb-3`}>{title}</h3>
      <div className="space-y-2">
        {tiers.map((tier) => {
          const value = getValue(tier);
          const widthPercent = (value / maxValue) * 100;
          const midScore = (tier.min + tier.max) / 2;

          return (
            <div key={tier.label} className="flex items-center gap-2">
              <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"} w-24 text-right shrink-0`}>
                {tier.label}
              </span>
              <div className={`flex-1 h-5 ${dark ? "bg-white/10" : "bg-gray-100"} rounded-sm overflow-hidden`}>
                <div
                  className="h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: tier.color || exposureColor(midScore, 0.8),
                    minWidth: value > 0 ? "2px" : "0",
                  }}
                />
              </div>
              <span className={`text-xs ${dark ? "text-gray-300" : "text-gray-600"} w-16 text-right`}>
                {mode === "jobs" ? abbreviateNumber(value) : value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
