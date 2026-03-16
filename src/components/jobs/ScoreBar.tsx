"use client";

import { exposureColor, exposureLevel } from "@/lib/jobs/colors";

interface ScoreBarProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ScoreBar({ score, size = "md", showLabel = true }: ScoreBarProps) {
  const heights = { sm: "h-2", md: "h-3", lg: "h-4" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  if (score === null) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex-1 bg-gray-200 rounded-full ${heights[size]}`}>
          <div className="h-full rounded-full bg-gray-400" style={{ width: "0%" }} />
        </div>
        {showLabel && <span className={`${textSizes[size]} text-gray-400`}>N/A</span>}
      </div>
    );
  }

  const level = exposureLevel(score);
  const color = exposureColor(score);
  const widthPercent = (score / 10) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 rounded-full ${heights[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${widthPercent}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className={`${textSizes[size]} font-medium min-w-[3rem] text-right`}>
          {score}/10
        </span>
      )}
    </div>
  );
}
