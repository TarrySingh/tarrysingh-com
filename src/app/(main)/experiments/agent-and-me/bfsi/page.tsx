"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import CreditRiskModelerApp from "@/components/agent-and-me/CreditRiskModeler"

export default function BFSIPlayground() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb nav */}
      <div className="bg-gradient-to-b from-navy-50/50 to-white pt-20 pb-2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link
              href="/experiments"
              className="hover:text-navy-900 transition-colors"
            >
              Experiments
            </Link>
            <span>/</span>
            <Link
              href="/experiments/agent-and-me"
              className="hover:text-navy-900 transition-colors"
            >
              The Agent & Me
            </Link>
            <span>/</span>
            <span className="text-navy-900 font-medium">BFSI</span>
          </div>
          <div className="mt-3 mb-2">
            <Link
              href="/experiments/agent-and-me"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Industry Verticals
            </Link>
          </div>
        </div>
      </div>

      {/* Credit Risk Modeler App */}
      <CreditRiskModelerApp />
    </div>
  )
}
