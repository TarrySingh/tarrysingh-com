/**
 * Board biography: about 150 words in the third person, with a short
 * credentials column. One A4 page.
 */
import React from "react"
import type { BoardBioText as BioText, View } from "./data"
import { CareerBrief, Closing, Masthead, Section, Sheet, counter } from "./parts"

export const BOARD_BIO_PAGES = 1

export function BoardBio({ view, bio }: { view: View; bio: BioText }) {
  const next = counter()
  const label = `${view.name} · Board biography · ${view.generatedLabel}`
  const brief = view.roles.filter((r) => r.lane !== "board-advisory" || view.board.length === 0).slice(0, 8)
  const hasCred =
    view.education.length + view.credentials.length + view.board.length + view.languages.length + view.sectors.length > 0

  return (
    <Sheet page={1} pages={BOARD_BIO_PAGES} label={label}>
      <Masthead view={view} kicker={"Board biography · Third person"} compact />
      {bio.paragraphs.length ? (
        <Section n={next()} title="Biography">
          <div className={hasCred ? "bio" : "bio solo"} style={hasCred ? undefined : { gridTemplateColumns: "1fr" }}>
            <div className="prose">
              {bio.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {hasCred ? (
              <div className="cred">
                {view.education.length || view.credentials.length ? (
                  <div>
                    <h5 className="mono">Education and credentials</h5>
                    <ul>
                      {view.education.map((e, i) => (
                        <li key={`e${i}`}>
                          <b>{e.qualification}</b>
                          <small>
                            {e.institution}
                            {e.years ? ` · ${e.years}` : ""}
                          </small>
                        </li>
                      ))}
                      {view.credentials.map((c, i) => (
                        <li key={`c${i}`}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {view.board.length ? (
                  <div>
                    <h5 className="mono">Board and advisory</h5>
                    <ul>
                      {view.board.map((b, i) => (
                        <li key={i}>
                          <b>{b.title}</b>, {b.org}
                          <small>
                            {b.years}
                            {b.detail ? ` · ${b.detail}` : ""}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {view.sectors.length ? (
                  <div>
                    <h5 className="mono">Sectors</h5>
                    <ul>
                      <li>{view.sectors.join(" · ")}</li>
                    </ul>
                  </div>
                ) : null}
                {view.languages.length ? (
                  <div>
                    <h5 className="mono">Languages</h5>
                    <ul>
                      <li>{view.languages.join(" · ")}</li>
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}
      {brief.length ? (
        <Section n={next()} title="Career in brief" aside="Most recent first">
          <CareerBrief roles={brief} />
        </Section>
      ) : null}
      <Closing view={view} />
    </Sheet>
  )
}
