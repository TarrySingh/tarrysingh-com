"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, TrendingUp, Layers, Lightbulb, Globe } from "lucide-react"

const experiments = [
  {
    title: "AI Disruption: Winner-Take-All",
    description:
      "Interactive scatter plot analyzing how AI disruption reshapes market dynamics into winner-take-all competitions. Explore customizable bubbles representing market players across disruption zones.",
    to: "/experiments/disruption",
    tag: "Market Analysis",
    icon: BarChart3,
    gradient: "from-blue-500/8 to-indigo-500/8",
    accent: "bg-blue-500",
  },
  {
    title: "AI Strategy Risk-Return Space",
    description:
      "Map generative AI ventures — OpenAI, Anthropic, DeepSeek — across risk and return dimensions. Drag, resize, and add bubbles to explore technology push vs. market pull strategies.",
    to: "/experiments/risk-return",
    tag: "Strategy",
    icon: TrendingUp,
    gradient: "from-amber-500/8 to-orange-500/8",
    accent: "bg-amber-500",
  },
  {
    title: "Strategic Technology Position",
    description:
      "Analyze competitive strengths vs. technological attractiveness. Visualize the strategic transformation path from current technology positions to AI-driven futures.",
    to: "/experiments/strategic",
    tag: "Positioning",
    icon: Layers,
    gradient: "from-emerald-500/8 to-teal-500/8",
    accent: "bg-emerald-500",
  },
  {
    title: "Financing AI Startups Life Cycle",
    description:
      "Trace the startup financing lifecycle from seed capital through IPO. Visualize cash flow curves, funding rounds, the Valley of Death, and break-even milestones.",
    to: "/experiments/financing",
    tag: "Finance",
    icon: Lightbulb,
    gradient: "from-purple-500/8 to-pink-500/8",
    accent: "bg-purple-500",
  },
  {
    title: "European Jobs AI Exposure",
    description:
      "AI exposure across 40+ European countries and 436+ occupations.",
    to: "/jobs",
    tag: "Labour Market",
    icon: Globe,
    gradient: "from-cyan-500/8 to-blue-500/8",
    accent: "bg-cyan-500",
  },
]

const Experiments = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="relative bg-gradient-to-b from-navy-50/50 to-white pt-28 md:pt-36 pb-4 md:pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="animate-fade-up inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 border border-gold-200 bg-gold-50 mb-5">
              Experiments
            </span>
            <h1 className="animate-fade-up delay-100 text-4xl md:text-5xl font-bold tracking-tight text-navy-900 mb-5">
              Data-Driven Explorations
            </h1>
            <p className="animate-fade-up delay-200 text-base md:text-lg text-gray-500 leading-relaxed">
              Interactive visualizations exploring AI market dynamics, strategy frameworks,
              and technology positioning. Each experiment is built with real analytical
              frameworks used in strategic consulting.
            </p>
          </div>
        </div>
      </section>

      {/* Experiments grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div className="space-y-5">
          {experiments.map((experiment, i) => {
            const cardClassName = `animate-fade-up delay-${(i + 1) * 100} premium-card group flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-2xl border border-gray-100 bg-white relative overflow-hidden`

            const cardContent = (
              <>
                {/* Hover gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${experiment.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 flex-1 min-w-0 flex gap-5 md:gap-6 items-start">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-navy-900 transition-colors duration-300">
                    <experiment.icon className="h-5 w-5 text-navy-400 group-hover:text-gold-400 transition-colors duration-300" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${experiment.accent}`} />
                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                        {experiment.tag}
                      </span>
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold text-navy-900 mb-2 group-hover:text-navy-800 transition-colors">
                      {experiment.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                      {experiment.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-4 md:mt-0 md:ml-8 flex-shrink-0">
                  <span className="inline-flex items-center text-sm font-semibold text-gray-300 group-hover:text-navy-900 transition-colors duration-300">
                    Explore
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </>
            )

            if (experiment.to === "/jobs") {
              return (
                <a
                  key={experiment.to}
                  href="/jobs"
                  className={cardClassName}
                >
                  {cardContent}
                </a>
              )
            }

            return (
              <Link
                key={experiment.to}
                href={experiment.to}
                className={cardClassName}
              >
                {cardContent}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Experiments
