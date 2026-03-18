"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Landmark,
  GraduationCap,
  Zap,
  Factory,
  Radio,
  Scale,
  HeartPulse,
  Clapperboard,
  ShoppingCart,
  Truck,
  Lock,
} from "lucide-react"

const verticals = [
  {
    title: "Banking, Financial Services & Insurance",
    shortTitle: "BFSI",
    description:
      "Credit risk modeling, mortgage underwriting, fraud detection, compliance, and more. 56 job roles mapped across 11 domains with AI automation scoring.",
    to: "/experiments/agent-and-me/bfsi",
    icon: Landmark,
    gradient: "from-emerald-500/10 to-teal-500/10",
    accent: "bg-emerald-500",
    accentText: "text-emerald-600",
    active: true,
    roles: "56 roles",
    tasks: "1500+ skills",
  },
  {
    title: "Education",
    description:
      "Curriculum design, student assessment, administrative operations, research coordination, and EdTech integration.",
    icon: GraduationCap,
    gradient: "from-blue-500/10 to-indigo-500/10",
    accent: "bg-blue-500",
    accentText: "text-blue-600",
    active: false,
  },
  {
    title: "Energy & Utilities",
    description:
      "Grid management, demand forecasting, renewable integration, asset maintenance, and regulatory compliance.",
    icon: Zap,
    gradient: "from-amber-500/10 to-yellow-500/10",
    accent: "bg-amber-500",
    accentText: "text-amber-600",
    active: false,
  },
  {
    title: "Manufacturing & Industrial Automation",
    description:
      "Quality control, supply planning, predictive maintenance, production scheduling, and process optimization.",
    icon: Factory,
    gradient: "from-orange-500/10 to-red-500/10",
    accent: "bg-orange-500",
    accentText: "text-orange-600",
    active: false,
  },
  {
    title: "Telecom",
    description:
      "Network optimization, churn prediction, customer service automation, spectrum management, and fraud detection.",
    icon: Radio,
    gradient: "from-sky-500/10 to-cyan-500/10",
    accent: "bg-sky-500",
    accentText: "text-sky-600",
    active: false,
  },
  {
    title: "Legal & Compliance",
    description:
      "Contract analysis, regulatory monitoring, due diligence, case research, and compliance reporting.",
    icon: Scale,
    gradient: "from-slate-500/10 to-gray-500/10",
    accent: "bg-slate-500",
    accentText: "text-slate-600",
    active: false,
  },
  {
    title: "Healthcare & Life Sciences",
    description:
      "Clinical documentation, drug discovery support, patient triage, claims processing, and medical coding.",
    icon: HeartPulse,
    gradient: "from-rose-500/10 to-pink-500/10",
    accent: "bg-rose-500",
    accentText: "text-rose-600",
    active: false,
  },
  {
    title: "Media & Culture",
    description:
      "Content curation, audience analytics, ad optimization, creative production, and rights management.",
    icon: Clapperboard,
    gradient: "from-purple-500/10 to-violet-500/10",
    accent: "bg-purple-500",
    accentText: "text-purple-600",
    active: false,
  },
  {
    title: "Retail & E-Commerce",
    description:
      "Demand forecasting, inventory optimization, personalization, pricing strategy, and customer insights.",
    icon: ShoppingCart,
    gradient: "from-pink-500/10 to-fuchsia-500/10",
    accent: "bg-pink-500",
    accentText: "text-pink-600",
    active: false,
  },
  {
    title: "Logistics & Supply Chain",
    description:
      "Route optimization, warehouse automation, demand planning, customs compliance, and fleet management.",
    icon: Truck,
    gradient: "from-teal-500/10 to-emerald-500/10",
    accent: "bg-teal-500",
    accentText: "text-teal-600",
    active: false,
  },
]

export default function AgentAndMeHub() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="relative bg-gradient-to-b from-navy-50/50 to-white pt-28 md:pt-36 pb-4 md:pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/experiments"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Experiments
            </Link>
          </div>
          <div className="max-w-3xl">
            <span className="animate-fade-up inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 border border-violet-200 bg-violet-50 mb-5">
              Agentic AI
            </span>
            <h1 className="animate-fade-up delay-100 text-4xl md:text-5xl font-bold tracking-tight text-navy-900 mb-5">
              The Agent & Me
            </h1>
            <p className="animate-fade-up delay-200 text-base md:text-lg text-gray-500 leading-relaxed">
              How will agentic AI transform your job? Explore interactive playgrounds across
              10 industry verticals. Each playground maps 40-60+ core functions with
              AI automation scores, scenario analysis, and real-world simulation powered by
              live web search and LLM-as-judge scoring.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Verticals Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {verticals.map((vertical, i) => {
            const content = (
              <>
                {/* Hover gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${vertical.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 flex gap-5 items-start">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-navy-900 transition-colors duration-300">
                    <vertical.icon className="h-6 w-6 text-navy-400 group-hover:text-gold-400 transition-colors duration-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${vertical.accent}`}
                      />
                      {vertical.active ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-500">
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-gray-300">
                          <Lock className="h-3 w-3" />
                          Coming Soon
                        </span>
                      )}
                      {vertical.roles && (
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          {vertical.roles}
                        </span>
                      )}
                      {vertical.tasks && (
                        <span className="text-xs font-medium text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">
                          {vertical.tasks}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-navy-900 mb-2 group-hover:text-navy-800 transition-colors">
                      {vertical.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {vertical.description}
                    </p>
                  </div>
                </div>

                {vertical.active && (
                  <div className="relative z-10 mt-4 flex-shrink-0 self-end">
                    <span className="inline-flex items-center text-sm font-semibold text-gray-300 group-hover:text-navy-900 transition-colors duration-300">
                      Explore
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                )}
              </>
            )

            const cardClassName = `animate-fade-up delay-${
              (i + 1) * 100
            } premium-card group flex flex-col p-6 md:p-8 rounded-2xl border bg-white relative overflow-hidden ${
              vertical.active
                ? "border-gray-100 cursor-pointer"
                : "border-gray-100/60 opacity-75"
            }`

            if (vertical.active && vertical.to) {
              return (
                <Link
                  key={vertical.title}
                  href={vertical.to}
                  className={cardClassName}
                >
                  {content}
                </Link>
              )
            }

            return (
              <div key={vertical.title} className={cardClassName}>
                {content}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
