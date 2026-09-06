"use client"

import type { MC102Graph } from "@/lib/panoraima/types"
import s from "./lab.module.css"

/**
 * The fallback is not a consolation prize. Where the 3-D view shows the gap the
 * arcs have to cross, this shows the same fact as a table: for each theme, how many
 * claims each camp made and how many of them actually met. A theme with claims on
 * one side and nothing on the other is the finding, so it is flagged rather than
 * dropped for being empty.
 */
export default function ConflictMap2D({ graph }: { graph: MC102Graph }) {
  const max = Math.max(...graph.themeStats.map(t => Math.max(t.gov, t.ngo)), 1)
  return (
    <table className={s.ledger}>
      <thead>
        <tr>
          <th scope="col">Theme</th>
          <th scope="col" style={{ textAlign: "right" }}>Government</th>
          <th scope="col" style={{ textAlign: "right" }}>Opposition</th>
          <th scope="col" style={{ textAlign: "right" }}>Met</th>
          <th scope="col">Engagement</th>
        </tr>
      </thead>
      <tbody>
        {graph.themeStats.map(t => {
          const stranded = t.cross === 0
          return (
            <tr key={t.theme} className={stranded ? s.rowMuted : undefined}>
              <td>{t.theme}</td>
              <td className={s.num}>{t.gov}</td>
              <td className={s.num}>{t.ngo}</td>
              <td className={s.num}>{t.cross}</td>
              <td>
                {stranded ? (
                  <span className={s.flag}>
                    {t.gov === 0 || t.ngo === 0 ? "one side only" : "no engagement"}
                  </span>
                ) : (
                  <span
                    aria-label={`${t.cross} oppositions`}
                    style={{
                      display: "inline-block", height: "0.55rem",
                      width: `${(t.cross / max) * 100}%`, minWidth: "4px",
                      background: "#d4574e", borderRadius: "2px",
                    }}
                  />
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
