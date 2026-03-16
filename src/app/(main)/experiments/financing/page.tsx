"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine } from 'recharts'

const FinancingCycle = () => {
  const data = [
    { x: 0, cashFlow: 0, financing: 0 },
    { x: 1, cashFlow: -20, financing: 10 },
    { x: 2, cashFlow: -40, financing: 10 },
    { x: 3, cashFlow: -30, financing: 10 },
    { x: 4, cashFlow: -20, financing: 20 },
    { x: 5, cashFlow: -10, financing: 20 },
    { x: 6, cashFlow: 0, financing: 40 },
    { x: 7, cashFlow: 10, financing: 40 },
    { x: 8, cashFlow: 20, financing: 60 },
    { x: 9, cashFlow: 30, financing: 80 },
    { x: 10, cashFlow: 40, financing: 100 }
  ]

  const stageLabels = [
    { x: 1.5, text: "Seed Capital & Early Stage", y: -70 },
    { x: 4, text: "Early Growth", y: -70 },
    { x: 6, text: "Later Growth", y: -70 },
    { x: 8.5, text: "Public Market", y: -70 }
  ]

  const investorLabels = [
    { x: 1.5, text: "FFF & Angels", y: -90 },
    { x: 4, text: "Venture Capitalist", y: -90 },
    { x: 8, text: "Investment Banks & Banks", y: -90 }
  ]

  const milestoneLabels = [
    { x: 4.5, text: "Break-even point", y: 10 },
    { x: 2, text: "Valley of Death", y: -35 },
    { x: 7, text: "Initial Public Offering", y: 70 },
    { x: 2.5, text: "Emerging Growth", y: -50 }
  ]

  const roundLabels = [
    { x: 5.5, text: "1st", y: 25 },
    { x: 6.5, text: "2nd", y: 45 },
    { x: 7.5, text: "3rd", y: 65 },
    { x: 6, text: "Mezzanine", y: 35 }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-12">
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A] text-center">
            Financing AI Startups Life Cycle
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-8">
          <div className="h-[400px] sm:h-[500px] md:h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 100, right: 20, left: 20, bottom: 30 }}>
                {/* Stage Labels */}
                {stageLabels.map((label, index) => (
                  <text
                    key={`stage-${index}`}
                    x={`${label.x * 10}%`}
                    y={label.y}
                    textAnchor="middle"
                    fill="#FF6B00"
                    className="text-[12px] sm:text-[14px] font-medium"
                  >
                    {label.text}
                  </text>
                ))}

                {/* Investor Labels */}
                {investorLabels.map((label, index) => (
                  <text
                    key={`investor-${index}`}
                    x={`${label.x * 10}%`}
                    y={label.y}
                    textAnchor="middle"
                    fill="#000000"
                    className="text-[12px] sm:text-[14px] font-bold"
                  >
                    {label.text}
                  </text>
                ))}

                {/* Milestone Labels */}
                {milestoneLabels.map((label, index) => (
                  <text
                    key={`milestone-${index}`}
                    x={`${label.x * 10}%`}
                    y={`${50 + label.y}%`}
                    textAnchor="middle"
                    fill="#22C55E"
                    className="text-[12px] sm:text-[14px] font-medium"
                  >
                    {label.text}
                  </text>
                ))}

                {/* Round Labels */}
                {roundLabels.map((label, index) => (
                  <text
                    key={`round-${index}`}
                    x={`${label.x * 10}%`}
                    y={`${50 + label.y}%`}
                    textAnchor="middle"
                    fill="#000000"
                    className="text-[10px] sm:text-[12px]"
                  >
                    {label.text}
                  </text>
                ))}

                {/* Vertical Reference Lines */}
                <ReferenceLine x={3} stroke="#CCCCCC" strokeDasharray="3 3" />
                <ReferenceLine x={5} stroke="#CCCCCC" strokeDasharray="3 3" />
                <ReferenceLine x={7} stroke="#CCCCCC" strokeDasharray="3 3" />

                {/* Axes Labels */}
                <text
                  x="50%"
                  y="95%"
                  textAnchor="middle"
                  className="text-[12px] sm:text-[14px] font-bold"
                  style={{
                    fontFamily: 'Inter',
                    fill: '#374151',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  TIME
                </text>
                <text
                  x="2%"
                  y="5%"
                  className="text-[12px] sm:text-[14px] font-bold"
                  style={{
                    fontFamily: 'Inter',
                    fill: '#374151',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  ENTERPRISE CASH FLOW
                </text>
                <text
                  x="98%"
                  y="5%"
                  textAnchor="end"
                  className="text-[12px] sm:text-[14px] font-bold"
                  style={{
                    fontFamily: 'Inter',
                    fill: '#374151',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  ENTERPRISE FINANCING
                </text>

                {/* Chart Lines */}
                <Line
                  type="stepAfter"
                  dataKey="financing"
                  stroke="#FF1493"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cashFlow"
                  stroke="#0000FF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />

                <XAxis hide />
                <YAxis hide />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 md:mt-8">
            <p className="text-xs sm:text-sm text-gray-500">
              Source: AI Startup Financing Analysis, 2025, https://tarrysingh.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancingCycle
