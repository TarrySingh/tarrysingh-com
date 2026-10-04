import { txt } from "@/lib/cv/format"
import { matrixGrid, SEAT_LABELS } from "@/lib/cv/programmes"
import type { MatrixCellT, ProgrammeT } from "@/lib/cv/schema"
import { programmeAnchor, realProgrammes } from "./ProgrammeLedger"
import styles from "./cv.module.css"

const RATING_TEXT = {
  strong: "Strong",
  partial: "Partial",
} as const

function Mark({ rating, silent = false }: { rating: MatrixCellT["rating"]; silent?: boolean }) {
  return (
    <span className={styles.mxMark} data-rating={rating}>
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <circle cx="6" cy="6" r="5" className={styles.mxRing} />
        {rating === "strong" ? (
          <circle cx="6" cy="6" r="3.2" className={styles.mxFill} />
        ) : (
          <path d="M6 2.8 A3.2 3.2 0 0 0 6 9.2 Z" className={styles.mxFill} />
        )}
      </svg>
      {silent ? null : <span className={styles.srOnly}>{RATING_TEXT[rating]}: </span>}
    </span>
  )
}

/**
 * The leadership matrix: CEO, Chief AI Officer and CTO against People,
 * Process and Technology. A real table (explicit ARIA roles keep the
 * semantics when phones restack it into cards).
 *   public  competency, mark and the number of programmes evidencing it
 *   full    adds the proof line and links to the programmes in the ledger
 */
export function LeadershipMatrix({
  cells,
  programmes,
  variant,
}: {
  cells: readonly MatrixCellT[]
  programmes: readonly ProgrammeT[]
  variant: "public" | "full"
}) {
  const grid = matrixGrid(cells)
  if (grid.filled === 0) return null
  const full = variant === "full"
  const byId = new Map(programmes.map((p) => [p.id, p]))
  // Ledger numbers, in the ledger's own order, so "№ 03" means row 03.
  const ledgerNo = new Map(realProgrammes(programmes).map((p, i) => [p.id, i + 1]))

  return (
    <div className={styles.mx}>
      <table className={styles.mxTable} role="table">
        <caption className={styles.srOnly}>
          Leadership matrix: competencies by seat and pillar, each marked strong or
          partial, with the number of programmes that evidence it.
        </caption>
        <thead role="rowgroup">
          <tr role="row">
            <th role="columnheader" scope="col" className={styles.mxCorner}>
              <span className={styles.srOnly}>Seat</span>
            </th>
            {grid.pillars.map((pillar) => (
              <th key={pillar} role="columnheader" scope="col" className={styles.mxPillar}>
                {pillar}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {grid.seats.map((seat) => (
            <tr key={seat} role="row" className={styles.mxRow}>
              <th role="rowheader" scope="row" className={styles.mxSeat}>
                <span className={styles.mxSeatCode}>{seat}</span>
                <span className={styles.mxSeatName}>{SEAT_LABELS[seat]}</span>
              </th>
              {grid.pillars.map((pillar) => {
                const list = grid.cells[seat][pillar]
                return (
                  <td
                    key={pillar}
                    role="cell"
                    className={styles.mxCell}
                    data-pillar={pillar}
                  >
                    {list.length === 0 ? (
                      <span className={styles.mxEmpty} aria-label="None recorded">
                        ·
                      </span>
                    ) : (
                      <ul className={styles.mxList}>
                        {list.map((c) => {
                          const evidence = c.programmeIds
                            .map((id) => byId.get(id))
                            .filter((p): p is ProgrammeT => p != null && txt(p.title) != null)
                          const count = full ? evidence.length : c.programmeIds.length
                          return (
                            <li key={c.id} className={styles.mxItem}>
                              <p className={styles.mxCompetency}>
                                <Mark rating={c.rating} />
                                {txt(c.competency)}
                              </p>
                              {count > 0 ? (
                                <p className={styles.mxCount}>
                                  {count} {count === 1 ? "programme" : "programmes"}
                                </p>
                              ) : null}
                              {full && txt(c.proof) ? (
                                <p className={styles.mxProof}>{txt(c.proof)}</p>
                              ) : null}
                              {full && evidence.length > 0 ? (
                                <ul className={styles.mxLinks} aria-label="Evidence in the programme ledger">
                                  {evidence.map((p) => {
                                    const n = String(ledgerNo.get(p.id) ?? 0).padStart(2, "0")
                                    return (
                                      <li key={p.id}>
                                        <a
                                          href={`#${programmeAnchor(p)}`}
                                          className={styles.mxRef}
                                          title={txt(p.title) ?? undefined}
                                          aria-label={`Programme ${n}: ${txt(p.title)}`}
                                        >
                                          № {n}
                                        </a>
                                      </li>
                                    )
                                  })}
                                </ul>
                              ) : null}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {full ? (
        <p className={styles.mxRefNote}>№ refers to the numbered rows of the programme ledger.</p>
      ) : null}
      <dl className={styles.mxLegend}>
        <div>
          <dt>
            <Mark rating="strong" silent />
          </dt>
          <dd>Strong · led it, with evidence in the record</dd>
        </div>
        <div>
          <dt>
            <Mark rating="partial" silent />
          </dt>
          <dd>Partial · a material part of the remit</dd>
        </div>
      </dl>
    </div>
  )
}
