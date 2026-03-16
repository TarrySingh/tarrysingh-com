"use client"

import { useDraggableBubble } from '@/hooks/useDraggableBubble'
import { StrategicChart } from '@/components/strategic/StrategicChart'
import { BubbleControls } from '@/components/strategic/BubbleControls'
import { ExplanationSection } from '@/components/strategic/ExplanationSection'

const StrategicTechnology = () => {
  const initialPositions = {
    ecosystem: { x: 2.5, y: 0.4 },
    platform: { x: 3.5, y: 0.2 },
    scale: { x: 2.8, y: 0.25 },
    aiEcosystem: { x: 7.5, y: 0.9 },
    aiPlatform: { x: 8.5, y: 0.7 },
    aiScale: { x: 7.8, y: 0.8 }
  };

  const arrowControl = {
    start: { x: 3, y: 0.3 },
    end: { x: 8, y: 0.8 }
  };

  const { positions, chartRef, handlePositionChange, handleMouseDown } = useDraggableBubble(initialPositions);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-12">
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-[32px] font-bold tracking-tight text-[#1A1A1A]">
            Strategic Technology Position
          </h1>
          <p className="text-base md:text-lg text-[#666666] max-w-3xl">
            Analysis of technological attractiveness and competitive strengths across different sectors
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-8">
          <StrategicChart
            positions={positions}
            arrowControl={arrowControl}
            chartRef={chartRef}
            onMouseDown={handleMouseDown}
          />

          <BubbleControls
            positions={positions}
            onPositionChange={handlePositionChange}
          />

          <ExplanationSection />
        </div>
      </div>
    </div>
  );
};

export default StrategicTechnology;
