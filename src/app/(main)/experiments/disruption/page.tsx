"use client"

import Link from "next/link"
import DisruptionChart from "@/components/DisruptionChart"

const Index = () => {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="space-y-3 md:space-y-4">
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              Market Analysis
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              AI Disruption changed the rules
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-800">
              A New Kind of Competition: Winner-Take-All
            </h2>
          </div>
        </div>
        <DisruptionChart />
        <div className="text-center mt-6 md:mt-8 space-y-3 md:space-y-0 flex flex-col md:flex-row justify-center md:space-x-4">
          <Link
            href="/experiments/risk-return"
            className="inline-flex items-center justify-center px-4 md:px-6 py-2 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            View Risk-Return Analysis
          </Link>
          <Link
            href="/experiments/strategic"
            className="inline-flex items-center justify-center px-4 md:px-6 py-2 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Strategic Technology Position
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Index
