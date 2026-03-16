
import React from 'react'

interface CustomScatterProps {
  cx?: number
  cy?: number
  payload?: {
    name: string
    z: number
  }
  onMouseDown: (event: React.MouseEvent, bubbleName: string) => void
}

export const CustomScatter = ({ cx, cy, payload, onMouseDown }: CustomScatterProps) => {
  if (!cx || !cy || !payload) return null;
  
  const isCurrentTech = payload.name.includes('Current')
  const isAIRegion = payload.name.includes('AI Region')
  const isFixed = isCurrentTech || isAIRegion
  
  return (
    <g
      onMouseDown={(e) => onMouseDown(e, payload.name)}
      style={{ cursor: isFixed ? 'default' : 'move' }}
    >
      <defs>
        <linearGradient id="bubbleGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0BAAEC" />
          <stop offset="100%" stopColor="#0891CA" />
        </linearGradient>
        <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ea384c" />
          <stop offset="100%" stopColor="#dc2b3f" />
        </linearGradient>
        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={payload.z / 4}
        ry={payload.z / 3}
        fill={
          isCurrentTech 
            ? "url(#redGradient)" 
            : isAIRegion 
              ? "url(#greenGradient)"
              : "url(#bubbleGradient)"
        }
        fillOpacity={0.9}
        stroke={
          isCurrentTech 
            ? "#dc2b3f" 
            : isAIRegion
              ? "#16a34a"
              : "#0891CA"
        }
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        fill="#1A1A1A"
        fontSize={14}
        fontFamily="Inter"
        fontWeight={600}
        pointerEvents="none"
      >
        {payload.name}
      </text>
    </g>
  )
}
