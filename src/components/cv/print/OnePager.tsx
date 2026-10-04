/**
 * One-page summary: positioning, proof figures, mini meridian, three
 * achievements, and the seats and mandates of interest.
 */
import React from "react"
import type { View } from "./data"
import { Meridian } from "./Meridian"
import { Closing, Figures, Masthead, Section, Sheet, counter } from "./parts"

export const ONE_PAGER_PAGES = 1

export function OnePager({ view, now }: { view: View; now: Date }) {
  const next = counter()
  const label = `${view.name} · One-page summary · ${view.generatedLabel}`
  const three = view.signature.slice(0, 3)
  const hasMeridian = view.roles.length > 0
  const lanes = new Set(view.roles.map((r) => r.lane ?? "executive"))

  return (
    <Sheet page={1} pages={ONE_PAGER_PAGES} label={label}>
      <Masthead view={view} kicker={"Summary · One page"} compact />

      {view.figures.length ? (
        <section className="sec">
          <div className="figrow">
            <Figures view={view} />
          </div>
        </section>
      ) : null}

      {hasMeridian ? (
        <Section n={next()} title="Career meridian" aside={view.careerYears ? `${view.careerYears}+ years` : null}>
          <Meridian roles={view.roles} eras={view.eras} now={now} />
          <div className="mer-cap mono">
            {lanes.has("founder-ceo") ? (
              <span>
                <i style={{ background: "#c98e4f" }} />
                Founder or CEO
              </span>
            ) : null}
            {lanes.has("executive") ? (
              <span>
                <i style={{ background: "#1a1d24" }} />
                Executive
              </span>
            ) : null}
            {lanes.has("board-advisory") ? (
              <span>
                <i style={{ border: "0.3mm solid #3b404c" }} />
                Board or advisory
              </span>
            ) : null}
          </div>
        </Section>
      ) : null}

      {three.length ? (
        <Section n={next()} title="Three achievements">
          <div className="three">
            {three.map((o, i) => (
              <div className="a" key={o.id}>
                <div className="i">{String(i + 1).padStart(2, "0")}</div>
                <div className="tx">{o.metric && !/\d/.test(o.text) ? `${o.text} (${o.metric})` : o.text}</div>
                <div className="cx mono">{o.context}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {view.seats.length || view.mandate.length ? (
        <Section n={next()} title="Seats and mandates of interest">
          <div className="mand">
            {view.seats.length ? (
              <ul className="seats">
                {view.seats.map((s, i) => (
                  <li key={i}>
                    {s.title}
                    <small>{s.primary ? "Primary" : "Also considered"}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <div />
            )}
            {view.mandate.length ? (
              <dl className="dl">
                {view.mandate.map((m) => (
                  <React.Fragment key={m.label}>
                    <dt className="mono">{m.label}</dt>
                    <dd>{m.values.join(" · ")}</dd>
                  </React.Fragment>
                ))}
              </dl>
            ) : null}
          </div>
        </Section>
      ) : null}

      <Closing view={view} />
    </Sheet>
  )
}
