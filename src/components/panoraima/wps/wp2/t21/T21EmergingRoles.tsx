"use client"

import { useRef, useState } from "react"
import { Briefcase, Quote } from "lucide-react"
import type { Task21Detail } from "@/lib/panoraima/types"

interface Props {
  detail: Task21Detail
}

const ROLE_PALETTE: Record<string, string> = {
  "Law & Compliance":           "#ef4444",
  "Healthcare & Life Sciences": "#10b981",
  "Media & Culture":            "#f59e0b",
  "Management & Finance":       "#8b5cf6",
  "Cross-sectoral":             "#06b6d4",
}

// Skill clusters per role — keyword-based seeds derived from D2.1
const ROLE_SKILLS: Record<string, string[]> = {
  "AI Risk Manager":       ["Risk assessment", "Regulatory frameworks", "Model audit", "Governance"],
  "Clinical AI Analyst":   ["Medical ML", "Explainability", "Data ethics", "Validation"],
  "AI Media Curator":      ["Content synthesis", "AI ethics", "Taxonomy", "Prompt engineering"],
  "AI Compliance Officer": ["EU AI Act", "GDPR", "Audit trails", "Documentation"],
  "AI Governance Lead":    ["Policy design", "Cross-functional", "Risk tiering", "Oversight"],
  "AI Ethics Officer":     ["Bias mitigation", "Fairness audits", "Inclusive design", "Accountability"],
  "AI Product Manager":    ["Roadmap", "Use-case scoping", "Stakeholder mgmt", "ROI modelling"],
  "AI Training Lead":      ["Curriculum design", "Adult learning", "Metrics", "Facilitation"],
  "Data Ethicist":         ["Consent frameworks", "Provenance", "Privacy", "Governance"],
  "Responsible AI Lead":   ["Trustworthy AI", "Risk mgmt", "Oversight", "Policy translation"],
  "Prompt Engineer":       ["LLM internals", "Evaluation", "Grounding", "Chain-of-thought"],
  "AI Operations":         ["MLOps", "Monitoring", "Rollouts", "Incident response"],
  "MLOps Engineer":        ["CI/CD", "Observability", "Scaling", "Deployment"],
  "ML Engineer":           ["Model training", "Feature engg", "Evaluation", "Production"],
  "AI Validator":          ["Clinical trials", "Benchmarking", "Reproducibility", "Red teaming"],
}

export default function T21EmergingRoles({ detail }: Props) {
  const roles = detail.deliverable.emerging_roles ?? []
  const [focus, setFocus] = useState<string | null>(null)

  if (roles.length === 0) return null

  return (
    <section>
      <div className="mb-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400 border border-navy-200 bg-navy-50">
          Emerging roles
        </span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy-900">
          The new π-shaped job roles
        </h2>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Stakeholders highlighted hybrid roles that bridge domain expertise
          and AI practice. Hover for skill clusters; the highlighted card shows
          the deliverable&apos;s context in which the role appeared.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <RoleCard
            key={r.name}
            role={r}
            isFocused={focus === r.name}
            onEnter={() => setFocus(r.name)}
            onLeave={() => setFocus(null)}
            skills={ROLE_SKILLS[r.name] || []}
          />
        ))}
      </div>
    </section>
  )
}

function RoleCard({
  role, isFocused, onEnter, onLeave, skills,
}: {
  role: { name: string; sector: string; context: string }
  isFocused: boolean
  onEnter: () => void
  onLeave: () => void
  skills: string[]
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const color = ROLE_PALETTE[role.sector] || ROLE_PALETTE["Cross-sectoral"]

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({ x: (py - 0.5) * -8, y: (px - 0.5) * 10 })
  }

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onLeave(); setTilt({ x: 0, y: 0 }) }}
      className="relative rounded-2xl bg-white border border-gray-100 p-5 hover:shadow-lg transition-shadow cursor-pointer"
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out, box-shadow 0.3s",
      }}
    >
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }}
      />

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: color }}
        >
          <Briefcase className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-navy-900 text-sm truncate">
            {role.name}
          </div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color }}
          >
            {role.sector}
          </div>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skills.map(s => (
            <span
              key={s}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: `${color}12`, color }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {isFocused && role.context && (
        <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold text-navy-500 mb-1.5">
            <Quote className="w-3 h-3" />
            Context in D2.1
          </div>
          <p className="text-[11.5px] text-gray-600 italic leading-snug line-clamp-4">
            &ldquo;{role.context}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
