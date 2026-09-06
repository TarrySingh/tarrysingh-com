"use client"

import { useMemo, useState } from "react"
import type { MC102Article, MC102Sentence } from "@/lib/panoraima/types"
import s from "./mc102.module.css"

const LABELS = ["CLAIM", "PREMISE", "NON-ARG", "UNCLEAR"] as const
type Label = (typeof LABELS)[number]

const HELP: Record<Label, string> = {
  CLAIM: "A position advanced as needing acceptance.",
  PREMISE: "Offered as a reason for a claim.",
  "NON-ARG": "Reporting, procedure or background. No argumentative force.",
  UNCLEAR: "Undecidable from the text given.",
}
const COLOUR: Record<string, string> = {
  CLAIM: "#8a4b12", PREMISE: "#0f5c66", "NON-ARG": "#5a656e", UNCLEAR: "#6b5a1f",
}

/**
 * Choose before you look. The label is committed first and only then does the
 * panel open, because a reader who has already found the call difficult reads
 * the model's answer differently from one who has not.
 */
export default function MC102Console({ articles }: { articles: MC102Article[] }) {
  const pool = useMemo(() => {
    const out: { sent: MC102Sentence; art: MC102Article }[] = []
    for (const art of articles) for (const x of art.sentences) if (x.in_sample) out.push({ sent: x, art })
    return out
  }, [articles])

  const [i, setI] = useState(0)
  const [choices, setChoices] = useState<Record<string, Label>>({})
  const cur = pool[i]
  const mine = cur ? choices[cur.sent.uid] : undefined
  const committed = !!mine
  const decided = Object.keys(choices).length

  if (!cur) return <p className={s.small}>No sampled sentences in this corpus.</p>

  const agrees = committed && cur.sent.pred_gold ? mine === cur.sent.pred_gold : null

  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0,1fr)" }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "260px minmax(0,1fr)" }}
           className={s.consoleGrid}>
        <nav className={s.rail} aria-label="Sampled sentences">
          <div className={s.railHead}>
            <span>{decided} of {pool.length} labelled</span>
            {decided > 0 && (
              <button type="button" className={s.chip} onClick={() => setChoices({})}
                      style={{ padding: "0.1rem 0.35rem" }}>
                reset
              </button>
            )}
          </div>
          {pool.map((p, k) => {
            const done = choices[p.sent.uid]
            return (
              <button
                key={p.sent.uid} type="button" className={s.railBtn}
                aria-current={k === i ? "true" : undefined}
                onClick={() => setI(k)}
                aria-label={`Sentence ${k + 1}${done ? `, you labelled it ${done}` : ", not yet labelled"}${p.sent.iaa ? ", in the double-coded subset" : ""}`}
              >
                <span className={s.railNum}>{String(k + 1).padStart(3, "0")}</span>
                <span className={s.railTxt}>{p.sent.text.slice(0, 40)}</span>
                {done && <span className={s.dot} style={{ background: COLOUR[done] }} aria-hidden />}
              </button>
            )
          })}
        </nav>

        <div className={s.instrument}>
          <div className={s.instrumentHead}>
            <h3 className={s.instrumentTitle}>{cur.art.community}</h3>
            <span className={s.small}>{cur.art.date}</span>
            {cur.sent.iaa && <span className={s.instrumentNote}>double-coded</span>}
          </div>

          <div style={{ padding: "0.9rem" }}>
            <p className={s.small} style={{ margin: 0 }}>{cur.art.headline}</p>
            <p className={s.unit}>{cur.sent.text}</p>
          </div>

          <div style={{ padding: "0.9rem", borderTop: "1px solid var(--rule)" }}>
            <p className={s.controlLabel} style={{ marginBottom: "0.45rem" }}>
              {committed ? "You labelled it" : "Label it before you look"}
            </p>
            <div className={s.actionSet}>
              {LABELS.map(l => (
                <button
                  key={l} type="button" className={s.action}
                  aria-pressed={mine === l} disabled={committed} title={HELP[l]}
                  onClick={() => setChoices(c => ({ ...c, [cur.sent.uid]: l }))}
                >
                  {l}
                </button>
              ))}
            </div>
            {!committed && (
              <p className={s.controlNote} style={{ marginTop: "0.5rem" }}>
                {HELP.UNCLEAR} Use it freely: a forced label is worse than an honest abstention.
              </p>
            )}
          </div>

          {committed && (
            <div style={{ padding: "0.9rem", borderTop: "1px solid var(--rule)", background: "var(--ground)" }}>
              <p className={s.controlLabel} style={{ marginBottom: "0.5rem" }}>What the others said</p>
              <div className={s.armGrid}>
                <Arm name="Model, units given" value={cur.sent.pred_gold}
                     missing="Not yet run over this sentence." />
                <Arm name="Model, self-segmented" value={null}
                     missing="The model finds 1.44x more units than our sentence split. Per-unit comparison needs the annotator's own boundaries." />
                <Arm name="Annotator (gold)" value={cur.sent.gold}
                     missing="Awaiting Dorottya Egres. Without it nothing here can be scored." />
              </div>
              {agrees !== null && (
                <p className={`${s.verdict} ${agrees ? s.verdictAgree : s.verdictDiffer}`}>
                  {agrees
                    ? "You and the model agree. That is not evidence either of you is right."
                    : "You and the model disagree. Which of you is correct is exactly what the gold standard settles."}
                </p>
              )}
              <div className={s.actionSet} style={{ marginTop: "0.8rem" }}>
                <button type="button" className={s.action} aria-pressed
                        disabled={i >= pool.length - 1}
                        onClick={() => setI(Math.min(i + 1, pool.length - 1))}>
                  Next sentence
                </button>
                <button type="button" className={s.action}
                        onClick={() => setChoices(c => { const n = { ...c }; delete n[cur.sent.uid]; return n })}>
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

function Arm({ name, value, missing }: { name: string; value: string | null; missing: string }) {
  return (
    <div className={s.armCard}>
      <p className={s.armName}>{name}</p>
      {value
        ? <p className={s.armValue} style={{ color: COLOUR[value] ?? "var(--ink)" }}>{value}</p>
        : <p className={s.armMissing}>{missing}</p>}
    </div>
  )
}
