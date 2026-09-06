"use client"

import { useMemo, useState } from "react"
import { Check, Lock, RotateCcw, AlertTriangle } from "lucide-react"
import type { MC102Article, MC102Sentence } from "@/lib/panoraima/types"

const LABELS = ["CLAIM", "PREMISE", "NON-ARG", "UNCLEAR"] as const
type Label = (typeof LABELS)[number]

const LABEL_HELP: Record<Label, string> = {
  CLAIM: "A position advanced as needing acceptance.",
  PREMISE: "Offered as a reason for a claim.",
  "NON-ARG": "Reporting, procedure or background. No argumentative force.",
  UNCLEAR: "Undecidable from the text given. A real answer, not a cop-out.",
}
const LABEL_COLOR: Record<string, string> = {
  CLAIM: "#B23E22", PREMISE: "#1C7293", "NON-ARG": "#5B616B", UNCLEAR: "#8A6D1F",
}

/**
 * Choose before you look. You label the sentence, then the panel opens and shows
 * what the model said under each condition. Where a value does not exist yet it
 * says so; nothing here is interpolated to fill a gap.
 */
export default function MC102Console({ articles }: { articles: MC102Article[] }) {
  const pool = useMemo(() => {
    const out: { s: MC102Sentence; a: MC102Article }[] = []
    for (const a of articles) for (const s of a.sentences) if (s.in_sample) out.push({ s, a })
    return out
  }, [articles])

  const [i, setI] = useState(0)
  const [choices, setChoices] = useState<Record<string, Label>>({})
  const cur = pool[i]
  const mine = cur ? choices[cur.s.uid] : undefined
  const committed = !!mine

  if (!cur) {
    return <p className="text-[14px] text-[#5B616B]">No sampled sentences in this corpus.</p>
  }

  const decided = Object.keys(choices).length
  const agreeWithModel =
    committed && cur.s.pred_gold ? mine === cur.s.pred_gold : null

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      {/* rail */}
      <nav aria-label="Sampled sentences" className="lg:max-h-[560px] lg:overflow-y-auto rounded-xl border border-[#DCDDE1] bg-white p-2">
        <div className="px-2 py-2 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B616B]">
            {decided} of {pool.length} labelled
          </span>
          {decided > 0 && (
            <button
              type="button"
              onClick={() => setChoices({})}
              className="inline-flex items-center gap-1 font-mono text-[10px] text-[#767C87] hover:text-[#16181D]"
            >
              <RotateCcw className="h-3 w-3" /> reset
            </button>
          )}
        </div>
        <ul className="space-y-0.5">
          {pool.map((p, k) => {
            const done = choices[p.s.uid]
            return (
              <li key={p.s.uid}>
                <button
                  type="button"
                  onClick={() => setI(k)}
                  aria-current={k === i ? "true" : undefined}
                  aria-label={`Sentence ${k + 1}${done ? `, you labelled it ${done}` : ", not yet labelled"}${p.s.iaa ? ", in the double-coded subset" : ""}`}
                  className={`w-full text-left rounded-lg px-2.5 py-1.5 text-[12px] flex items-center gap-2 transition-colors ${
                    k === i ? "bg-[#16181D] text-white" : "hover:bg-[#F2F3F5] text-[#3F434C]"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70 w-8 flex-shrink-0">
                    {String(k + 1).padStart(3, "0")}
                  </span>
                  <span className="truncate flex-1">{p.s.text.slice(0, 34)}</span>
                  {done && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: LABEL_COLOR[done] }}
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* console */}
      <div className="min-w-0">
        <div className="rounded-xl border border-[#DCDDE1] bg-white overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#EDEDEF] bg-[#FAFAFB] px-5 py-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B616B]">
              {cur.a.community}
            </span>
            <span className="text-[11px] text-[#767C87]">{cur.a.date}</span>
            {cur.s.iaa && (
              <span className="ml-auto rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] bg-[#EAF1F4] text-[#1C7293]">
                double-coded
              </span>
            )}
          </div>

          <div className="px-5 py-5">
            <p className="mb-1 text-[11px] text-[#767C87] truncate">{cur.a.headline}</p>
            <p className="text-[17px] leading-relaxed text-[#16181D]">{cur.s.text}</p>
          </div>

          {/* levers */}
          <div className="border-t border-[#EDEDEF] px-5 py-4">
            <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B616B]">
              {committed ? "You labelled it" : "Label it before you look"}
            </p>
            <div className="flex flex-wrap gap-2">
              {LABELS.map(l => {
                const on = mine === l
                return (
                  <button
                    key={l}
                    type="button"
                    disabled={committed}
                    title={LABEL_HELP[l]}
                    onClick={() => setChoices(c => ({ ...c, [cur.s.uid]: l }))}
                    className={`rounded-lg border px-3 py-2 font-mono text-[11.5px] font-bold uppercase tracking-[0.08em] transition-all disabled:cursor-default ${
                      on ? "text-white" : "text-[#3F434C] hover:border-[#16181D]/45"
                    } ${committed && !on ? "opacity-35" : ""}`}
                    style={on ? { background: LABEL_COLOR[l], borderColor: LABEL_COLOR[l] } : { borderColor: "#DCDDE1" }}
                  >
                    {l}
                  </button>
                )
              })}
            </div>
            {!committed && (
              <p className="mt-2.5 text-[12px] text-[#767C87]">
                {LABEL_HELP.UNCLEAR} Use it freely: a forced label is worse than an honest abstention.
              </p>
            )}
          </div>

          {/* reveal */}
          {committed && (
            <div className="border-t border-[#EDEDEF] bg-[#FAFAFB] px-5 py-4">
              <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B616B]">
                What the others said
              </p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                <Arm
                  name="Model, units given"
                  value={cur.s.pred_gold}
                  note={cur.s.pred_gold ? "Sentence supplied pre-segmented." : undefined}
                  missing="Not yet run over this sentence."
                />
                <Arm
                  name="Model, self-segmented"
                  value={null}
                  missing="Condition built, not yet run. This is the one expected to fall."
                />
                <Arm
                  name="Annotator (gold)"
                  value={cur.s.gold}
                  missing="Awaiting Dorottya Egres. Without it nothing here can be scored."
                />
              </div>

              {agreeWithModel !== null && (
                <p className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] ${
                  agreeWithModel ? "bg-[#EDF6EF] text-[#1F6B41]" : "bg-[#FBEAE5] text-[#7A2A16]"
                }`}>
                  {agreeWithModel ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {agreeWithModel
                    ? "You and the model agree. That is not evidence either of you is right."
                    : "You and the model disagree. Which of you is correct is exactly what the gold standard settles."}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setI(Math.min(i + 1, pool.length - 1))}
                  disabled={i >= pool.length - 1}
                  className="rounded-lg bg-[#16181D] px-3.5 py-2 text-[13px] font-bold text-white disabled:opacity-40"
                >
                  Next sentence
                </button>
                <button
                  type="button"
                  onClick={() => setChoices(c => { const n = { ...c }; delete n[cur.s.uid]; return n })}
                  className="rounded-lg border border-[#DCDDE1] px-3.5 py-2 text-[13px] font-semibold text-[#3F434C] hover:border-[#16181D]/40"
                >
                  Change my label
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Arm({ name, value, note, missing }: { name: string; value: string | null; note?: string; missing: string }) {
  return (
    <div className="rounded-lg border border-[#DCDDE1] bg-white p-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#767C87]">{name}</p>
      {value ? (
        <>
          <p className="mt-1.5 font-mono text-[15px] font-bold" style={{ color: LABEL_COLOR[value] ?? "#16181D" }}>
            {value}
          </p>
          {note && <p className="mt-1 text-[11px] text-[#767C87]">{note}</p>}
        </>
      ) : (
        <p className="mt-1.5 inline-flex items-start gap-1.5 text-[11.5px] leading-snug text-[#8A8F98]">
          <Lock className="mt-[2px] h-3 w-3 flex-shrink-0" />
          {missing}
        </p>
      )}
    </div>
  )
}
