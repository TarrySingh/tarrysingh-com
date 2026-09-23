"use client"

import { Info } from "lucide-react"
import { RUST } from "./wp4constants"

/**
 * Footnotes for the WP4 views.
 *
 * WP4 track leads read these charts without knowing how the data is put
 * together, and one of them reasonably read the by-track bar as "material on
 * SharePoint". Every section therefore states what it counts, and just as
 * importantly what it does not.
 */
export function WP4Note({
  shows,
  notShows,
  source,
}: {
  shows: string
  notShows: string
  source?: string
}) {
  return (
    <div className="mt-5 rounded-lg border border-[#E7E7EA] bg-[#FAFAF9] px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <Info className="mt-[2px] h-3.5 w-3.5 flex-shrink-0" style={{ color: RUST }} aria-hidden />
        <div className="text-[12.5px] leading-relaxed text-[#444A55]">
          <p>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#16181D]">
              What this shows
            </span>{" "}
            {shows}
          </p>
          <p className="mt-1.5">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#16181D]">
              What it does not show
            </span>{" "}
            {notShows}
          </p>
          {source && (
            <p className="mt-1.5 text-[#5B616B]">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]">Source</span>{" "}
              {source}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Scope statement at the top of the dashboard: whose activity this is, and how
 * the three sources are reconciled.
 */
export function WP4ScopeBanner() {
  return (
    <section className="rounded-xl border border-[#DCDDE1] bg-white p-5 md:p-6 shadow-[0_1px_3px_rgba(20,22,27,0.06)]">
      <div className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: RUST }}>
        How to read this dashboard
      </div>

      <p className="text-[14px] leading-relaxed text-[#444A55]">
        This is <strong className="font-semibold text-[#16181D]">RealAI&apos;s working view of WP4</strong>:
        the Learning Events we author or review, and the state of the material behind them. It is not a
        progress report for the project as a whole, and it does not represent any other partner&apos;s
        review work. Counts for tracks we do not own are here as context, so our own work can be placed
        against the whole catalogue. A consortium-wide overview is planned separately.
      </p>

      <div className="mt-4 rounded-lg bg-[#F7F8FA] border border-[#E7E7EA] px-4 py-3.5">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#16181D] mb-2">
          Triangulation: three sources, reconciled on the Learning Event code
        </div>
        <ol className="space-y-1.5 text-[12.5px] leading-relaxed text-[#444A55] list-decimal pl-4">
          <li>
            <strong className="font-semibold text-[#16181D]">The wiki Master List</strong> (hcaim.bme.hu) is
            the authoritative register: which Learning Events exist, their duration and type, who authors
            and who reviews them, and the status the author set.
          </li>
          <li>
            <strong className="font-semibold text-[#16181D]">The WP4 SharePoint folders</strong> say what
            material actually exists: every file in a Learning Event&apos;s folder, with its date and size.
          </li>
          <li>
            <strong className="font-semibold text-[#16181D]">The Learning Event Discussion pages</strong> plus
            our own review register say what has been reviewed, what verdict was given and when it was posted.
          </li>
        </ol>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#5B616B]">
          The three disagree often, and the disagreement is the point: a finished deck sitting under a
          &ldquo;development&rdquo; status, a plan marked ready for review with no file behind it, or a
          Learning Event assigned to us on the wiki but never mentioned in the track spreadsheet. Anything
          the sources cannot settle is shown as a gap rather than smoothed over. Each refresh is timestamped
          in the history table at the bottom of this page, so you can see how current the reconciliation is.
        </p>
      </div>
    </section>
  )
}
