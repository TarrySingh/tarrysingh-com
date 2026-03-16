"use client";

import Link from "next/link";
import Navbar from "@/components/jobs/Navbar";
import { useTheme } from "@/lib/jobs/theme";

export default function AboutPage() {
  const { isDark } = useTheme();

  const bg = isDark ? "bg-[#0f0f1a]" : "bg-gray-50";
  const heading = isDark ? "text-white" : "text-gray-900";
  const sectionHeading = isDark ? "text-gray-200" : "text-gray-800";
  const bodyText = isDark ? "text-gray-400" : "text-gray-600";
  const link = isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800";
  const cardBg = (light: string, dark: string) => isDark ? dark : light;

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-2xl font-bold ${heading} mb-6`}>
          About This Project
        </h1>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* Overview */}
          <section>
            <h2 className={`text-xl font-semibold ${sectionHeading}`}>Overview</h2>
            <p className={`${bodyText} leading-relaxed`}>
              EuroJobs AI Exposure analyzes how susceptible every occupation
              across Europe is to AI automation and augmentation. It covers 40+
              European countries (EU27, EEA, EFTA, UK, and candidate countries)
              and uses the ISCO-08 classification with 436+ occupation groups.
            </p>
            <p className={`${bodyText} leading-relaxed`}>
              This project is inspired by{" "}
              <a
                href="https://karpathy.ai/jobs/"
                className={link}
                target="_blank"
              >
                Andrej Karpathy&apos;s US jobs treemap
              </a>
              , but redesigned with a superior DAG-based architecture for the
              European context.
            </p>
          </section>

          {/* Data Sources */}
          <section>
            <h2 className={`text-xl font-semibold ${sectionHeading}`}>Data Sources</h2>
            <div className="space-y-4">
              <div className={`rounded-lg p-4 ${cardBg("bg-blue-50", "bg-blue-900/20 border border-blue-800/30")}`}>
                <h3 className={`font-semibold ${cardBg("text-blue-900", "text-blue-300")}`}>Eurostat</h3>
                <p className={`text-sm mt-1 ${cardBg("text-blue-800", "text-blue-400")}`}>
                  Employment statistics from the EU&apos;s official statistical
                  authority. Datasets include employment by occupation
                  (lfsa_egan22d), earnings (earn_ses18_48), and education levels
                  (lfsa_egised).
                </p>
              </div>
              <div className={`rounded-lg p-4 ${cardBg("bg-green-50", "bg-green-900/20 border border-green-800/30")}`}>
                <h3 className={`font-semibold ${cardBg("text-green-900", "text-green-300")}`}>ESCO</h3>
                <p className={`text-sm mt-1 ${cardBg("text-green-800", "text-green-400")}`}>
                  The European Skills, Competences, Qualifications and
                  Occupations classification. Provides structured occupation
                  descriptions, skills profiles, and ISCO-08 mappings.
                </p>
              </div>
              <div className={`rounded-lg p-4 ${cardBg("bg-purple-50", "bg-purple-900/20 border border-purple-800/30")}`}>
                <h3 className={`font-semibold ${cardBg("text-purple-900", "text-purple-300")}`}>LLM Scoring</h3>
                <p className={`text-sm mt-1 ${cardBg("text-purple-800", "text-purple-400")}`}>
                  Each occupation is scored 0-10 for AI exposure by a large
                  language model (Gemini 2.5 Flash via OpenRouter), using ESCO descriptions and skill profiles as
                  context. Calibrated against known anchor occupations.
                </p>
              </div>
            </div>
          </section>

          {/* Scoring Methodology */}
          <section>
            <h2 className={`text-xl font-semibold ${sectionHeading}`}>
              Scoring Methodology
            </h2>
            <p className={`${bodyText} leading-relaxed`}>
              The AI exposure score (0-10) reflects how susceptible an
              occupation&apos;s core tasks are to AI automation or augmentation:
            </p>
            <div className="mt-3 space-y-2">
              {[
                { range: "0-1", label: "Minimal", desc: "Primarily physical, unpredictable manual work", examples: "Construction labourers, refuse workers", lightColor: "bg-green-100 text-green-800", darkColor: "bg-green-900/30 text-green-300 border border-green-800/30" },
                { range: "2-3", label: "Low", desc: "Skilled trades requiring physical presence", examples: "Electricians, plumbers, firefighters", lightColor: "bg-green-50 text-green-700", darkColor: "bg-green-900/20 text-green-400 border border-green-800/20" },
                { range: "4-5", label: "Moderate", desc: "Mix of cognitive and physical tasks", examples: "Nurses, police officers, physicians", lightColor: "bg-yellow-50 text-yellow-800", darkColor: "bg-yellow-900/20 text-yellow-300 border border-yellow-800/30" },
                { range: "6-7", label: "Significant", desc: "Primarily cognitive, substantial portions automatable", examples: "Teachers, accountants, engineers", lightColor: "bg-orange-50 text-orange-800", darkColor: "bg-orange-900/20 text-orange-300 border border-orange-800/30" },
                { range: "8-9", label: "High", desc: "Predominantly information-processing tasks", examples: "Software developers, translators, analysts", lightColor: "bg-red-50 text-red-800", darkColor: "bg-red-900/20 text-red-300 border border-red-800/30" },
                { range: "10", label: "Maximum", desc: "Core tasks are essentially AI-native", examples: "Data entry clerks, switchboard operators", lightColor: "bg-red-100 text-red-900", darkColor: "bg-red-900/30 text-red-300 border border-red-800/30" },
              ].map((tier) => (
                <div
                  key={tier.range}
                  className={`rounded-lg p-3 ${isDark ? tier.darkColor : tier.lightColor}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{tier.range}</span>
                    <span className="font-medium">{tier.label}</span>
                  </div>
                  <p className="text-sm mt-0.5">{tier.desc}</p>
                  <p className="text-xs mt-0.5 opacity-75">
                    Examples: {tier.examples}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* European Context */}
          <section>
            <h2 className={`text-xl font-semibold ${sectionHeading}`}>
              European Context
            </h2>
            <p className={`${bodyText} leading-relaxed`}>
              The scoring accounts for European-specific factors:
            </p>
            <ul className={`list-disc pl-5 ${bodyText} space-y-1 mt-2`}>
              <li>
                <strong>EU AI Act</strong> — Regulations that may limit AI
                deployment in high-risk domains (healthcare, education, employment)
              </li>
              <li>
                <strong>Worker protections</strong> — Strong unions and labour
                laws may slow automation adoption compared to the US
              </li>
              <li>
                <strong>Digital maturity</strong> — Varies significantly across
                EU member states (Nordic vs. Southern vs. Eastern Europe)
              </li>
              <li>
                <strong>Public sector</strong> — Larger public sector employment
                in many EU countries creates different automation dynamics
              </li>
            </ul>
          </section>

          {/* Architecture */}
          <section>
            <h2 className={`text-xl font-semibold ${sectionHeading}`}>
              Technical Architecture
            </h2>
            <p className={`${bodyText} leading-relaxed`}>
              The data pipeline uses a DAG-based architecture with 9 stages:
              data fetching (Eurostat API, ESCO API), transformation, LLM
              scoring, merging, and frontend data generation. All stages support
              content-addressed caching and incremental processing.
            </p>
            <p className={`${bodyText} leading-relaxed mt-2`}>
              See the{" "}
              <a
                href="https://github.com/TarrySingh/eurojobs-ai-exposure"
                className={link}
                target="_blank"
              >
                GitHub repository
              </a>{" "}
              for the full source code and documentation.
            </p>
          </section>

          {/* Countries */}
          <section>
            <h2 className={`text-xl font-semibold ${sectionHeading}`}>
              Countries Covered
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className={`rounded-lg p-3 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <h3 className={`font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>EU 27</h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"} mt-1`}>
                  Austria, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark,
                  Estonia, Finland, France, Germany, Greece, Hungary, Ireland,
                  Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands,
                  Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden
                </p>
              </div>
              <div className={`rounded-lg p-3 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <h3 className={`font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  EEA + EFTA
                </h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"} mt-1`}>
                  Norway, Iceland, Liechtenstein, Switzerland
                </p>
              </div>
              <div className={`rounded-lg p-3 col-span-2 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <h3 className={`font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Other European
                </h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"} mt-1`}>
                  United Kingdom, Serbia, Montenegro, North Macedonia, Albania,
                  Bosnia and Herzegovina, Kosovo, Moldova, Ukraine, Georgia,
                  Turkey, Belarus, Armenia, Azerbaijan
                </p>
              </div>
            </div>
          </section>

          {/* Credits */}
          <section className={`border-t ${isDark ? "border-white/10" : "border-gray-200"} pt-6`}>
            <h2 className={`text-xl font-semibold ${sectionHeading}`}>Credits</h2>
            <ul className={`list-disc pl-5 ${bodyText} space-y-1 mt-2`}>
              <li>
                Created by{" "}
                <a
                  href="https://tarrysingh.com"
                  className={link}
                  target="_blank"
                >
                  Tarry Singh
                </a>
              </li>
              <li>
                Inspired by{" "}
                <a
                  href="https://karpathy.ai/jobs/"
                  className={link}
                  target="_blank"
                >
                  Andrej Karpathy&apos;s AI Jobs Treemap
                </a>
              </li>
              <li>
                Employment data from{" "}
                <a
                  href="https://ec.europa.eu/eurostat"
                  className={link}
                  target="_blank"
                >
                  Eurostat
                </a>
              </li>
              <li>
                Occupation taxonomy from{" "}
                <a
                  href="https://esco.ec.europa.eu/"
                  className={link}
                  target="_blank"
                >
                  ESCO
                </a>
              </li>
              <li>
                AI exposure scoring via Gemini 2.5 Flash (OpenRouter)
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
