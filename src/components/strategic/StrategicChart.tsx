
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from 'recharts'
import { RefObject } from 'react'
import { CustomScatter } from './CustomScatter'
import { StrategicArrow } from './StrategicArrow'
import { BubblePositions } from '@/hooks/useDraggableBubble'

interface ArrowControl {
  start: { x: number; y: number }
  end: { x: number; y: number }
}

interface StrategicChartProps {
  positions: BubblePositions
  arrowControl: ArrowControl
  chartRef: RefObject<HTMLDivElement | null>
  onMouseDown: (event: React.MouseEvent, bubbleName: string) => void
}

export const StrategicChart = ({ 
  positions, 
  arrowControl, 
  chartRef, 
  onMouseDown 
}: StrategicChartProps) => {
  
  const data = [
    { x: 3, y: 0.3, z: 200, name: 'Current\nTechnology' },
    { x: 8, y: 0.8, z: 200, name: 'AI\nRegion' },
    { x: positions.ecosystem.x, y: positions.ecosystem.y, z: 150, name: 'Ecosystem' },
    { x: positions.platform.x, y: positions.platform.y, z: 150, name: 'Platform' },
    { x: positions.scale.x, y: positions.scale.y, z: 150, name: 'Scale' },
    { x: positions.aiEcosystem.x, y: positions.aiEcosystem.y, z: 150, name: 'AI Ecosystem' },
    { x: positions.aiPlatform.x, y: positions.aiPlatform.y, z: 150, name: 'AI Platform' },
    { x: positions.aiScale.x, y: positions.aiScale.y, z: 150, name: 'AI Scale' }
  ];

  return (
    <div className="h-[400px] sm:h-[500px] md:h-[600px]" ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 100 }}>
          <defs>
            <linearGradient id="strategicArrowGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            dataKey="x"
            name="Competitive Technological Strengths"
            domain={[0, 10]}
            label={{
              value: 'COMPETITIVE TECHNOLOGICAL STRENGTHS',
              position: "bottom",
              offset: 45,
              style: { 
                fontFamily: 'Inter',
                fontSize: 12,
                fill: '#374151',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }
            }}
            tick={{ 
              fontSize: 10, 
              fontFamily: 'Inter',
              fill: '#666666'
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Technological Attractiveness"
            domain={[0, 1]}
            label={{
              value: 'TECHNOLOGICAL ATTRACTIVENESS',
              angle: -90,
              position: "center",
              offset: 0,
              style: { 
                fontFamily: 'Inter',
                fontSize: 12,
                fill: '#374151',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }
            }}
            tick={{ 
              fontSize: 10, 
              fontFamily: 'Inter',
              fill: '#666666'
            }}
          />
          <Scatter
            data={data}
            shape={<CustomScatter onMouseDown={onMouseDown} />}
          />
          <StrategicArrow arrowControl={arrowControl} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
