"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp, Lightbulb, Globe, Cpu, BarChart3, Layers, Bot } from "lucide-react"

const stats = [
  { value: "30+", label: "Years of Experience" },
  { value: "10+", label: "Industries" },
  { value: "5", label: "Continents" },
]

const highlights = [
  {
    icon: TrendingUp,
    title: "Strategic Vision",
    description:
      "Three decades navigating market disruptions — from the commercial internet boom to the AI revolution. Turning complexity into competitive advantage.",
  },
  {
    icon: Cpu,
    title: "AI & Deep Tech",
    description:
      "Pioneering work in artificial intelligence, deep learning, and autonomous systems. Building the technology layer that reshapes industries.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description:
      "Experience spanning multiple continents, industries, and market cycles. From founding startups to advising enterprise transformation at scale.",
  },
]

const experiments = [
  {
    title: "The Agent & Me",
    description: "Explore how agentic AI transforms job roles across 10 industry verticals with interactive AI automation scoring.",
    to: "/experiments/agent-and-me",
    tag: "Agentic AI",
    icon: Bot,
    gradient: "from-violet-500/10 to-fuchsia-500/10",
    isNew: true,
    date: "Mar 2026",
  },
  {
    title: "European Jobs AI Exposure",
    description: "AI exposure across 40+ European countries and 436+ occupations.",
    to: "/jobs",
    tag: "Labour Market",
    icon: Globe,
    gradient: "from-cyan-500/10 to-blue-500/10",
    isNew: true,
    date: "Mar 2026",
  },
  {
    title: "AI Disruption: Winner-Take-All",
    description: "How AI reshapes market dynamics into winner-take-all competitions.",
    to: "/experiments/disruption",
    tag: "Market Analysis",
    icon: BarChart3,
    gradient: "from-blue-500/10 to-indigo-500/10",
  },
  {
    title: "Risk-Return Strategy Space",
    description: "Mapping AI ventures across risk and return dimensions.",
    to: "/experiments/risk-return",
    tag: "Strategy",
    icon: TrendingUp,
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    title: "Strategic Technology Position",
    description: "Competitive strengths vs. technological attractiveness.",
    to: "/experiments/strategic",
    tag: "Positioning",
    icon: Layers,
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    title: "Financing AI Startups",
    description: "From seed capital through IPO — the startup lifecycle.",
    to: "/experiments/financing",
    tag: "Finance",
    icon: Lightbulb,
    gradient: "from-purple-500/10 to-pink-500/10",
  },
]

const Landing = () => {
  return (
    <div className="bg-white">
      {/* ========== HERO ========== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-navy-900 noise-overlay">
        {/* Gradient mesh orbs */}
        <div className="mesh-gradient w-[600px] h-[600px] bg-gold-500/20 top-[-10%] right-[-5%] animate-pulse-subtle" />
        <div className="mesh-gradient w-[500px] h-[500px] bg-blue-600/15 bottom-[-15%] left-[-10%] animate-pulse-subtle delay-200" />
        <div className="mesh-gradient w-[300px] h-[300px] bg-indigo-500/10 top-[40%] left-[30%] animate-float" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32 md:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Text column */}
            <div className="lg:col-span-7">
            {/* Eyebrow */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/20 bg-gold-500/5 mb-6">
                Entrepreneur &middot; Technologist &middot; AI Strategist
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up delay-100 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Building at the
              <br />
              <span className="gradient-text">intersection</span> of
              <br />
              technology & business.
            </h1>

            {/* Subhead */}
            <p className="animate-fade-up delay-200 mt-6 md:mt-8 text-base md:text-lg text-white/50 leading-relaxed max-w-xl">
              For over 30 years, I've been at the forefront of technological
              disruption — from the early internet era to today's AI revolution. I
              help organizations navigate complexity and seize transformative
              opportunities.
            </p>

            {/* CTA */}
            <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/experiments"
                className="group inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full hover:from-gold-300 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/20"
              >
                View Experiments
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white/80 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                About Me
              </Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-up delay-500 mt-16 md:mt-20 flex gap-10 md:gap-16">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/30 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            </div>

            {/* Portrait column */}
            <div className="hidden lg:flex lg:col-span-5 justify-center animate-fade-up delay-400">
              <div className="relative">
                {/* Glow behind portrait */}
                <div className="absolute -inset-4 bg-gradient-to-br from-gold-500/20 via-blue-500/10 to-gold-500/10 rounded-3xl blur-2xl" />
                {/* Border frame */}
                <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-gold-400/40 via-white/10 to-gold-500/20">
                  <img
                    src="/tarry-portrait.jpg"
                    alt="Tarry Singh"
                    className="w-[340px] h-[420px] object-cover object-top rounded-2xl"
                  />
                </div>
                {/* Decorative accent */}
                <div className="absolute -bottom-3 -right-3 w-24 h-24 border-2 border-gold-500/20 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ========== HIGHLIGHTS ========== */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-3">
            What I Bring
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900">
            Decades of Deep Expertise
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {highlights.map((item, i) => (
            <div
              key={item.title}
              className={`animate-fade-up delay-${(i + 1) * 100} group text-center md:text-left`}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-50 to-navy-100 mb-5 group-hover:from-gold-50 group-hover:to-gold-100 transition-all duration-500">
                <item.icon className="h-5 w-5 text-navy-600 group-hover:text-gold-600 transition-colors duration-500" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== DIVIDER ========== */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* ========== EXPERIMENTS ========== */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-3">
              Latest Work
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900">
              Data-Driven Experiments
            </h2>
          </div>
          <Link
            href="/experiments"
            className="group hidden sm:inline-flex items-center text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors"
          >
            View all
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {experiments.map((experiment, i) => {
            const cardContent = (
              <>
                {/* Subtle gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${experiment.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-navy-900 transition-colors duration-300">
                      <experiment.icon className="h-4 w-4 text-navy-400 group-hover:text-gold-400 transition-colors duration-300" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                      {experiment.tag}
                    </span>
                    {experiment.isNew && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 rounded-full">
                        New!
                      </span>
                    )}
                    {experiment.date && (
                      <span className="text-[10px] font-medium text-gray-400">
                        {experiment.date}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2 group-hover:text-navy-800 transition-colors">
                    {experiment.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {experiment.description}
                  </p>
                </div>

                <ArrowRight className="absolute top-7 right-7 md:top-8 md:right-8 h-4 w-4 text-gray-200 group-hover:text-navy-900 transition-all duration-300 group-hover:translate-x-0.5" />
              </>
            )

            if (experiment.to === "/jobs") {
              return (
                <a
                  key={experiment.to}
                  href="/jobs"
                  className={`animate-fade-up delay-${(i + 1) * 100} premium-card group relative p-7 md:p-8 rounded-2xl border border-gray-100 bg-white overflow-hidden`}
                >
                  {cardContent}
                </a>
              )
            }

            return (
              <Link
                key={experiment.to}
                href={experiment.to}
                className={`animate-fade-up delay-${(i + 1) * 100} premium-card group relative p-7 md:p-8 rounded-2xl border border-gray-100 bg-white overflow-hidden`}
              >
                {cardContent}
              </Link>
            )
          })}
        </div>

        <div className="mt-8 sm:hidden">
          <Link
            href="/experiments"
            className="group inline-flex items-center text-sm font-semibold text-navy-900"
          >
            View all experiments
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24 md:pb-32">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 md:px-16 py-16 md:py-20 noise-overlay">
          <div className="mesh-gradient w-[400px] h-[400px] bg-gold-500/20 -top-32 -right-32" />
          <div className="mesh-gradient w-[300px] h-[300px] bg-blue-500/15 bottom-[-20%] left-[-10%]" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Interested in working together?
            </h2>
            <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8">
              Whether it's AI strategy, technology advisory, or exploring new ventures —
              I'm always open to meaningful conversations.
            </p>
            <a
              href="https://linkedin.com/in/tarrysingh"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center px-7 py-3.5 text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full hover:from-gold-300 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/20"
            >
              Let's Connect
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
