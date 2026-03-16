
import { useMemo, useState, useRef, useEffect } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ComposedChart,
  ResponsiveContainer,
} from "recharts"
import { ColorControls } from "./chart/ColorControls"
import { ChartTooltip } from "./chart/ChartTooltip"
import CustomScatterPoint from "./CustomScatterPoint"

interface ColorConfig {
  winner: string
  loser: string
  battleZone: string
  smallBubbles: string
  purpleBubbles: string
}

interface BubblePosition {
  winner: { x: number; y: number; z: number }
  battleZone: { x: number; y: number; z: number }
}

interface DataPoint {
  x: number
  y: number
  z: number
  category: string
}

const DisruptionChart = () => {
  const [colors, setColors] = useState<ColorConfig>({
    winner: "#9b87f5",
    loser: "#ea384c",
    battleZone: "#0EA5E9",
    smallBubbles: "#8E9196",
    purpleBubbles: "#8E9196",
  })

  const [positions, setPositions] = useState<BubblePosition>({
    winner: { x: 45, y: 70, z: 100 },
    battleZone: { x: 35, y: 30, z: 80 },
  })

  const [customPoints, setCustomPoints] = useState<DataPoint[]>([])

  const [bubbleCounts, setBubbleCounts] = useState({
    small: 50,
    purple: 20,
    winner: 1,
    loser: 1,
  })

  const [winnerBubbleSize, setWinnerBubbleSize] = useState(100)
  const [loserBubbleSize, setLoserBubbleSize] = useState(80)
  const [purpleBubbleSize, setPurpleBubbleSize] = useState(30)
  
  // Dragging functionality
  const chartRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<string | null>(null);

  const data = useMemo(
    () => [
      ...Array.from({ length: bubbleCounts.winner }, () => ({
        x: positions.winner.x + (Math.random() * 10 - 5),
        y: positions.winner.y + (Math.random() * 10 - 5),
        z: winnerBubbleSize,
        category: "winner",
      })),
      ...Array.from({ length: bubbleCounts.loser }, () => ({
        x: positions.battleZone.x + (Math.random() * 10 - 5),
        y: positions.battleZone.y + (Math.random() * 10 - 5),
        z: loserBubbleSize,
        category: "battleZone",
      })),
      ...customPoints,
      ...Array.from({ length: bubbleCounts.small }, () => {
        const x = 20 + Math.random() * 70;
        const xProgress = (x - 20) / 70;
        const winnerY = 30 + (50 * xProgress);
        const loserY = 40 - (20 * xProgress);
        const minY = Math.min(winnerY, loserY);
        const maxY = Math.max(winnerY, loserY);
        const range = maxY - minY;
        const y = minY + (Math.random() * range);

        return {
          x,
          y,
          z: purpleBubbleSize,
          category: "purple",
        };
      }),
    ],
    [positions, customPoints, bubbleCounts.small, bubbleCounts.purple, bubbleCounts.winner, bubbleCounts.loser, purpleBubbleSize, winnerBubbleSize, loserBubbleSize]
  );

  const handleColorChange = (category: keyof ColorConfig, value: string) => {
    setColors((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleBubbleCountChange = (category: 'small' | 'purple', value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 200) {
      setBubbleCounts((prev) => ({
        ...prev,
        [category]: numValue,
      }));
    }
  };

  const handlePurpleSizeChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 100) {
      setPurpleBubbleSize(numValue);
    }
  };

  const handleWinnerCountChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      setBubbleCounts(prev => ({
        ...prev,
        winner: numValue
      }));
    }
  };

  const handleWinnerBubbleSizeChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 200) {
      setWinnerBubbleSize(numValue);
    }
  };

  const handleLoserCountChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      setBubbleCounts(prev => ({
        ...prev,
        loser: numValue
      }));
    }
  };

  const handleLoserBubbleSizeChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 200) {
      setLoserBubbleSize(numValue);
    }
  };

  // Dragging handlers
  const handleMouseDown = (event: React.MouseEvent, category: string) => {
    draggingRef.current = category;
    event.preventDefault();
  };

  const getPositionFromEvent = (event: MouseEvent) => {
    if (!chartRef.current) return null;
    const rect = chartRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = 100 - ((event.clientY - rect.top) / rect.height) * 100;
    return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (draggingRef.current) {
      const pos = getPositionFromEvent(event);
      if (pos) {
        setPositions(prev => ({
          ...prev,
          [draggingRef.current!]: {
            ...prev[draggingRef.current as keyof BubblePosition],
            x: pos.x,
            y: pos.y
          }
        }));
      }
    }
  };

  const handleMouseUp = () => {
    draggingRef.current = null;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const trendData = [
    { x: 20, winnerY: 30, loserY: 40 },
    { x: 90, winnerY: 80, loserY: 20 },
  ]

  const battleZoneLabelData = [
    {
      x: 55,
      y: 45,
      label: "Battle Zone"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={600}>
            <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                dataKey="x"
                name="Time"
                domain={[0, 100]}
                tickFormatter={() => ""}
                label={{
                  value: "TIME",
                  position: "bottom",
                  offset: 0,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Market Share"
                domain={[0, 100]}
                label={{
                  value: "MARKET SHARE (in %)",
                  angle: -90,
                  position: "left",
                }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip content={<ChartTooltip />} />

              <Line
                data={trendData}
                type="monotone"
                dataKey="winnerY"
                stroke={colors.winner}
                strokeWidth={2}
                dot={false}
                name=""
              />
              <Line
                data={trendData}
                type="monotone"
                dataKey="loserY"
                stroke={colors.loser}
                strokeWidth={2}
                dot={false}
                name=""
              />

              <Scatter
                data={battleZoneLabelData}
                fill="none"
                isAnimationActive={false}
                label={{
                  content: ({ value }) => "Battle Zone",
                  position: "center",
                  fill: colors.battleZone,
                  fontSize: 14,
                  fontWeight: "bold"
                }}
              />

              <Scatter
                data={data.filter((d) => d.category === "winner")}
                fill={colors.winner}
                name=""
                shape={<CustomScatterPoint 
                  fill={colors.winner} 
                  category="winner" 
                  onMouseDown={handleMouseDown} 
                />}
              />
              <Scatter
                data={data.filter((d) => d.category === "battleZone")}
                fill={colors.battleZone}
                name=""
                shape={<CustomScatterPoint 
                  fill={colors.battleZone} 
                  category="battleZone" 
                  onMouseDown={handleMouseDown} 
                />}
              />
              <Scatter
                data={data.filter((d) => d.category === "small")}
                fill={colors.smallBubbles}
                opacity={0.5}
              />
              <Scatter
                data={data.filter((d) => d.category === "purple")}
                fill={colors.smallBubbles}
                opacity={0.7}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-sm font-medium">
          <div className="text-left">Aging / Dying technologies</div>
          <div className="text-center">New technologies</div>
          <div className="text-right">Disruptive technologies</div>
        </div>

        <div className="grid md:grid-cols-1 gap-6 mt-8 pt-8 border-t">
          <ColorControls
            colors={colors}
            bubbleCounts={bubbleCounts}
            winnerBubbleSize={winnerBubbleSize}
            loserBubbleSize={loserBubbleSize}
            purpleBubbleSize={purpleBubbleSize}
            onColorChange={handleColorChange}
            onWinnerCountChange={handleWinnerCountChange}
            onWinnerBubbleSizeChange={handleWinnerBubbleSizeChange}
            onLoserCountChange={handleLoserCountChange}
            onLoserBubbleSizeChange={handleLoserBubbleSizeChange}
            onBubbleCountChange={handleBubbleCountChange}
            onPurpleSizeChange={handlePurpleSizeChange}
          />
        </div>
      </div>
    </div>
  )
}

export default DisruptionChart
