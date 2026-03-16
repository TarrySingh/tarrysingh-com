"use client"

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, ReferenceLine } from "recharts"
import { useState, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

const RiskReturn = () => {
  const [bubblePositions, setBubblePositions] = useState([
    { x: 50, y: 50, z: 90, name: 'Peripheral', color: '#1A1F2C' },
    { x: 70, y: 60, z: 120, name: 'Pull', color: '#DAA520' },
    { x: 90, y: 45, z: 400, name: 'Push', color: '#ea384c' }
  ])

  const [newBubbleName, setNewBubbleName] = useState('')

  const handleNameChange = (oldName: string, newName: string) => {
    if (!newName.trim()) return // Prevent empty names
    setBubblePositions(prev => prev.map(bubble => {
      if (bubble.name === oldName) {
        return { ...bubble, name: newName }
      }
      return bubble
    }))
  }

  const addNewBubble = () => {
    if (!newBubbleName.trim()) return

    // Find the Pull bubble to copy its properties
    const pullBubble = bubblePositions.find(bubble => bubble.name === 'Pull')

    const newBubble = {
      x: pullBubble?.x ?? 70, // Pull bubble's x position or fallback
      y: pullBubble?.y ?? 60, // Pull bubble's y position or fallback
      z: pullBubble?.z ?? 120, // Pull bubble's size or fallback
      name: newBubbleName,
      color: pullBubble?.color ?? '#DAA520' // Pull bubble's color or fallback
    }

    setBubblePositions(prev => [...prev, newBubble])
    setNewBubbleName('') // Reset input
  }

  const deleteBubble = (bubbleName: string) => {
    setBubblePositions(prev => prev.filter(bubble => bubble.name !== bubbleName))
  }

  const draggingBubbleRef = useRef<string | null>(null)
  const resizingBubbleRef = useRef<string | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const initialYRef = useRef<number>(0)
  const initialSizeRef = useRef<number>(0)

  const handleBubbleMouseDown = (event: React.MouseEvent, bubbleName: string) => {
    draggingBubbleRef.current = bubbleName
    event.preventDefault()
  }

  const handleResizeMouseDown = (event: React.MouseEvent, bubbleName: string, initialZ: number) => {
    resizingBubbleRef.current = bubbleName
    initialYRef.current = event.clientY
    initialSizeRef.current = initialZ
    event.preventDefault()
    event.stopPropagation()
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!chartRef.current) return

    if (draggingBubbleRef.current) {
      const chartRect = chartRef.current.getBoundingClientRect()
      const x = ((event.clientX - chartRect.left) / chartRect.width) * 100
      const y = 100 - ((event.clientY - chartRect.top) / chartRect.height) * 100

      setBubblePositions(prev => prev.map(bubble => {
        if (bubble.name === draggingBubbleRef.current) {
          return {
            ...bubble,
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(-25, Math.min(100, y))
          }
        }
        return bubble
      }))
    } else if (resizingBubbleRef.current) {
      const deltaY = event.clientY - initialYRef.current
      const scaleFactor = 2
      const newSize = Math.max(50, Math.min(400, initialSizeRef.current + deltaY * scaleFactor))

      setBubblePositions(prev => prev.map(bubble => {
        if (bubble.name === resizingBubbleRef.current) {
          return {
            ...bubble,
            z: newSize
          }
        }
        return bubble
      }))
    }
  }

  const handleMouseUp = () => {
    draggingBubbleRef.current = null
    resizingBubbleRef.current = null
  }

  const handleColorChange = (bubbleName: string, newColor: string) => {
    setBubblePositions(prev => prev.map(bubble => {
      if (bubble.name === bubbleName) {
        return { ...bubble, color: newColor }
      }
      return bubble
    }))
  }

  const getSafePatternId = (name: string) => {
    return `meshPattern-${name.replace(/\s+/g, '-')}` // Replace spaces with dashes
  }

  const CustomScatter = (props: any) => {
    const { cx, cy, payload } = props
    const [editingName, setEditingName] = useState(payload.name)
    const patternId = getSafePatternId(payload.name)

    return (
      <g>
        <g
          onMouseDown={(e) => {
            if (e.button === 2) { // Right click
              e.preventDefault()
              deleteBubble(payload.name)
            } else {
              handleBubbleMouseDown(e, payload.name)
            }
          }}
          onContextMenu={(e) => e.preventDefault()} // Prevent context menu
          style={{ cursor: 'move' }}
        >
          <defs>
            <pattern id={patternId} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill={payload.color} fillOpacity={0.2} />
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                    style={{stroke: payload.color, strokeWidth: 1}} />
            </pattern>
          </defs>
          <Popover>
            <PopoverTrigger asChild>
              <ellipse
                cx={cx}
                cy={cy}
                rx={payload.z / 4}
                ry={payload.z / 1.5}
                fill={`url(#${patternId})`}
                stroke={payload.color}
                strokeWidth={1}
                style={{ filter: 'url(#water)' }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Bubble Name</label>
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleNameChange(payload.name, editingName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNameChange(payload.name, editingName)
                      }
                    }}
                    className="w-32"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Bubble Color</label>
                  <Input
                    type="color"
                    value={payload.color}
                    onChange={(e) => handleColorChange(payload.name, e.target.value)}
                    className="w-32 h-8"
                  />
                </div>
                <button
                  onClick={() => deleteBubble(payload.name)}
                  className="w-full px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Delete Bubble
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </g>
        {/* Resize handle */}
        <rect
          x={cx - 4}
          y={cy + payload.z / 1.5}
          width={8}
          height={8}
          fill={payload.color}
          style={{ cursor: 'ns-resize' }}
          onMouseDown={(e) => handleResizeMouseDown(e, payload.name, payload.z)}
        />
      </g>
    )
  }

  return (
    <div
      className="min-h-screen bg-white"
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on the entire component
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-12">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            AI Strategy Risk-Return Space
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Analysis of different technology strategies and their risk-return profiles
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 mt-3 md:mt-4">
            <div className="w-full sm:max-w-xs">
              <input
                type="text"
                value={newBubbleName}
                onChange={(e) => setNewBubbleName(e.target.value)}
                placeholder="Enter bubble name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={addNewBubble}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={!newBubbleName.trim()}
            >
              Add Bubble
            </button>
          </div>
        </div>

        <div className="mt-8 md:mt-16 bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
          <div
            className="h-[400px] sm:h-[500px] md:h-[600px]"
            ref={chartRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 80 }}>
              <defs>
                <filter id="water" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                  <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
                  <feFlood floodColor="#E3F2FD" floodOpacity="0.5" result="waterColor" />
                  <feComposite in="waterColor" in2="offsetBlur" operator="in" result="waterBlur" />
                  <feMerge>
                    <feMergeNode in="waterBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                dataKey="x"
                name="Risk"
                label={{
                  value: 'RISK',
                  position: 'bottom',
                  offset: 30,
                  style: {
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fill: '#374151',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }
                }}
                domain={[0, 100]}
                tick={{ fontSize: 12, fontFamily: 'Inter' }}
                axisLine={{ stroke: '#000' }}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Return"
                label={{
                  value: 'RETURN',
                  angle: -90,
                  position: 'left',
                  offset: 60,
                  style: {
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fill: '#374151',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }
                }}
                domain={[-25, 100]}
                tick={{ fontSize: 12, fontFamily: 'Inter' }}
                axisLine={{ stroke: '#000' }}
                tickLine={false}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
              <Scatter
                data={bubblePositions}
                shape={<CustomScatter />}
              />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {bubblePositions.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    border: `1px solid ${item.color}`,
                    background: `url(#meshPattern-${item.name})`,
                  }}
                />
                <span className="text-sm text-gray-700 font-bold">{item.name.replace('\n', ' ')}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-12 prose max-w-none space-y-6 md:space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Understanding the Risk-Return Space</h2>
              <p className="text-gray-600 leading-relaxed">
                This visualization maps different technology strategies across two key dimensions: risk and potential return.
                The size of each bubble represents the relative market impact of each strategy, while their position
                indicates the balance between risk and potential returns.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Generative AI in the Risk-Return Space</h3>
              <p className="text-gray-600 mb-4">
                Using the risk-return space, we can map generative AI ventures along a spectrum where:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6">
                <li>Low-risk, low-return strategies might involve incremental improvements to existing systems or platforms.</li>
                <li>High-risk, high-return strategies encompass breakthrough innovations or entirely new platforms that could redefine markets.</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-900 mb-3">Technology Push vs. Market Pull in Generative AI</h4>

              <div className="space-y-6">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Technology Push:</h5>
                  <p className="text-gray-600">
                    OpenAI, Anthropic, DeepSeek, and similar generative AI companies are primarily operating from a technology-push perspective. They are building breakthrough models—like GPT, Anthropic's Claude, or DeepSeek's unique approaches—based on state-of-the-art research in deep learning and natural language processing. Their innovations are often not directly a response to a well-defined market need but are driven by the promise of a new technology paradigm. This places them toward the high-risk, high-return end of the spectrum: if their technologies achieve widespread adoption, they can create entirely new markets and set industry standards, but the inherent risk is high given the unproven nature of such transformative ideas.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Market Pull Elements:</h5>
                  <p className="text-gray-600">
                    Even though the initial push is technological, these companies are quickly aligning with market pull signals. They work with developers, enterprise clients, and even consumer-facing applications to fine-tune their models to real-world needs—be it content generation, coding assistance, or creative applications. This hybrid approach helps mitigate some risk by ensuring there's a feedback loop with actual users, thereby steering their innovation toward market fit without losing the potential for breakthrough returns.
                  </p>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Maneuvering the Risk-Return Space</h4>

              <div className="space-y-6">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">OpenAI:</h5>
                  <p className="text-gray-600">
                    OpenAI has embraced a strategy that is both aggressive in technological innovation and adaptive in terms of market engagement. By offering API services and licensing deals, OpenAI leverages its breakthrough technology to capture a wide range of applications—spanning from enterprise solutions to creative tools. This dual strategy—pioneering new capabilities while ensuring market pull through partnerships—places it in the high-return quadrant, albeit with significant technological and regulatory risks.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Anthropic:</h5>
                  <p className="text-gray-600">
                    Similarly, Anthropic is investing heavily in building AI systems with a strong emphasis on safety and reliability. Their focus on ethical and controlled AI is a strategic move to differentiate themselves in a crowded field, responding to growing market and regulatory concerns. By doing so, they position themselves to capture a niche within the high-risk area where responsible AI practices are becoming a strong market pull signal, particularly among enterprises worried about AI ethics and compliance.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">DeepSeek and Other Emerging Players:</h5>
                  <p className="text-gray-600">
                    Companies like DeepSeek are often more nimble and can target very specific application niches. Their approach may involve innovative algorithms or novel deployment models that serve underserved segments of the market. Their strategies tend to be riskier on a technical front but could yield very high returns if they manage to capture or create a new niche within the broader generative AI ecosystem.
                  </p>
                </div>
              </div>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Source: AI Strategy Risk-Return Space, 2025, https://tarrysingh.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskReturn
