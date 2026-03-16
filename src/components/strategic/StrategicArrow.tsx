
interface ArrowControl {
  start: { x: number; y: number }
  end: { x: number; y: number }
}

interface StrategicArrowProps {
  arrowControl: ArrowControl
}

export const StrategicArrow = ({ arrowControl }: StrategicArrowProps) => {
  const startX = arrowControl.start.x * (450 / 10);
  const startY = (1 - arrowControl.start.y) * 450;
  const endX = arrowControl.end.x * (450 / 10);
  const endY = (1 - arrowControl.end.y) * 450;

  return (
    <g>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="14"
          markerHeight="10"
          refX="12"
          refY="5"
          orient="auto"
        >
          <polygon points="0 0, 14 5, 0 10" fill="#22c55e" />
        </marker>
      </defs>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="url(#strategicArrowGradient)"
        strokeWidth={6}
        markerEnd="url(#arrowhead)"
      />
      <text
        x={(startX + endX) / 2}
        y={(startY + endY) / 2 - 15}
        fill="#22c55e"
        fontSize={14}
        fontWeight="600"
        textAnchor="middle"
        fontFamily="Inter"
      >
        Strategic Vector
      </text>
    </g>
  )
}
