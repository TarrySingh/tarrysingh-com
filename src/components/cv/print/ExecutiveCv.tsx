/**
 * Executive CV: exactly two A4 pages.
 *   page 1: masthead, executive summary with proof figures, signature
 *           achievements, leadership matrix
 *   page 2: career history (earlier career compressed), selected
 *           programmes, education, board, languages
 */
import React from "react"
import type { FitLevel, View } from "./data"
import {
  Closing,
  EarlyCareer,
  Figures,
  MatrixKey,
  MatrixStrip,
  Masthead,
  ProgrammeGrid,
  RunningHead,
  RoleEntry,
  Section,
  Sheet,
  SignatureList,
  Trio,
  counter,
} from "./parts"

export const EXEC_PAGES = 2

export function ExecutiveCv({ view, level, now }: { view: View; level: FitLevel; now: Date }) {
  const next = counter()
  const label = `${view.name} · Executive CV · ${view.generatedLabel}`
  const nowY = now.getUTCFullYear()

  const signature = view.signature.slice(0, level.signature)
  const signatureIndex = new Map(signature.map((o, i) => [o.id, i + 1]))

  // Board and advisory roles live in their own column when that data exists.
  const history = view.roles.filter((r) => r.lane !== "board-advisory" || view.board.length === 0)
  const isFull = (i: number, startYear: number, hasContent: boolean) =>
    i < level.fullRoles && hasContent && (i < 2 || startYear >= nowY - 16)
  const full = history.filter((r, i) => isFull(i, r.start.y, r.outcomes.length > 0 || r.mandate !== null))
  const early = history.filter((r) => !full.includes(r))

  const hasFigures = view.figures.length > 0
  const hasSummary = view.summary.length > 0
  const hasTrio = view.education.length + view.credentials.length + view.board.length + view.languages.length > 0

  const matrixSection = () => (
    <Section n={next()} title="Leadership matrix" aside={MatrixKey}>
      <MatrixStrip view={view} />
    </Section>
  )

  return (
    <>
      <Sheet page={1} pages={EXEC_PAGES} label={label}>
        <Masthead view={view} kicker={"Curriculum Vitae · Executive profile"} />
        {hasSummary ? (
          <Section n={next()} title="Executive summary">
            <div className={hasFigures ? "lede" : "lede solo"}>
              <div className="prose lead">
                {view.summary.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {hasFigures ? (
                <div className="figs">
                  <Figures view={view} />
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}
        {signature.length ? (
          <Section n={next()} title="Signature achievements">
            <SignatureList items={signature} />
          </Section>
        ) : null}
        {view.hasMatrix && level.matrixPage === 1 ? matrixSection() : null}
      </Sheet>

      <Sheet page={2} pages={EXEC_PAGES} label={label}>
        <RunningHead view={view} doc={"Curriculum Vitae \u00b7 continued"} />
        {full.length || early.length ? (
          <Section n={next()} title="Career history" aside="Most recent first">
            <div className="career">
              {full.map((r) => (
                <RoleEntry key={r.id} role={r} perRole={level.perRole} signatureIndex={signatureIndex} />
              ))}
            </div>
            <EarlyCareer roles={early} />
          </Section>
        ) : null}
        {view.programmes.length ? (
          <Section n={next()} title="Selected programmes" aside="Clients anonymised">
            <ProgrammeGrid items={view.programmes.slice(0, level.programmes)} detail={level.programmeDetail} />
          </Section>
        ) : null}
        {view.hasMatrix && level.matrixPage === 2 ? matrixSection() : null}
        {hasTrio ? (
          <Section n={next()} title="Education, board and languages">
            <Trio view={view} credentialLimit={level.credentials} />
          </Section>
        ) : null}
        <Closing view={view} />
      </Sheet>
    </>
  )
}
