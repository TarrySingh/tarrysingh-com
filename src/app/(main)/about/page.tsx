"use client"

import Link from "next/link"
import { ArrowRight, Award, Briefcase, GraduationCap, Rocket } from "lucide-react"

const milestones = [
  {
    icon: Rocket,
    era: "Mid-1990s",
    title: "The Internet Era",
    description:
      "Entered the technology industry at the dawn of the commercial internet, building some of the earliest digital solutions and web-based platforms.",
  },
  {
    icon: Briefcase,
    era: "2000s",
    title: "Enterprise & Scale",
    description:
      "Led enterprise transformation initiatives, working across financial services, telecommunications, and technology sectors on multiple continents.",
  },
  {
    icon: GraduationCap,
    era: "2010s",
    title: "Deep Learning & AI",
    description:
      "Dove deep into artificial intelligence and deep learning research, bridging the gap between cutting-edge research and practical business applications.",
  },
  {
    icon: Award,
    era: "2020s",
    title: "The AI Revolution",
    description:
      "At the forefront of the generative AI revolution, advising organizations on AI strategy, building AI-native products, and exploring the future of autonomous systems.",
  },
]

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 noise-overlay">
        <div className="mesh-gradient w-[500px] h-[500px] bg-gold-500/15 top-[-20%] right-[-10%] animate-pulse-subtle" />
        <div className="mesh-gradient w-[400px] h-[400px] bg-blue-600/10 bottom-[-10%] left-[-5%]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="animate-fade-up">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 border border-gold-500/20 bg-gold-500/5 mb-6">
              About
            </span>
          </div>
          <h1 className="animate-fade-up delay-100 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            Tarry Singh
          </h1>
          <p className="animate-fade-up delay-200 text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl">
            Entrepreneur and technologist with over 30 years of experience building
            and scaling technology ventures across multiple industries and geographies.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              The Journey
            </span>
          </div>
          <div className="md:col-span-8">
            <div className="space-y-6 text-gray-600 leading-relaxed text-base">
              <p>
                Since the mid-1990s, I've been at the intersection of technology and business —
                from the early days of the commercial internet through the mobile revolution,
                cloud computing, and now the transformative era of artificial intelligence.
              </p>
              <p>
                My work spans founding and advising startups, leading enterprise transformation,
                and deep technical research in AI and deep learning. I believe in the power of
                data-driven decision making and building technology that creates genuine impact.
              </p>
              <p>
                Today, my focus is on AI strategy — helping organizations understand and leverage
                the disruptive potential of generative AI, large language models, and autonomous systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-20 md:py-28">
        <div className="mb-12 md:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-3">
            Career Arc
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-navy-900">
            30 Years of Innovation
          </h2>
        </div>

        <div className="space-y-8">
          {milestones.map((milestone, i) => (
            <div
              key={milestone.era}
              className={`animate-fade-up delay-${(i + 1) * 100} premium-card group flex gap-5 md:gap-8 p-6 md:p-8 rounded-2xl border border-gray-100 bg-white`}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-50 to-navy-100 flex items-center justify-center group-hover:from-gold-50 group-hover:to-gold-100 transition-all duration-500">
                  <milestone.icon className="h-5 w-5 text-navy-500 group-hover:text-gold-600 transition-colors duration-500" />
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-600">
                  {milestone.era}
                </span>
                <h3 className="text-lg font-semibold text-navy-900 mt-1 mb-2">
                  {milestone.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 italic">
            Full bio and detailed experience coming soon.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-24 md:pb-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 px-8 md:px-12 py-12 md:py-16 noise-overlay text-center">
          <div className="mesh-gradient w-[300px] h-[300px] bg-gold-500/15 -top-20 -right-20" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Explore My Work
            </h2>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
              See how I apply data-driven thinking to analyze AI markets, strategy, and technology positioning.
            </p>
            <Link
              href="/experiments"
              className="group inline-flex items-center px-7 py-3.5 text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full hover:from-gold-300 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/20"
            >
              View Experiments
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
