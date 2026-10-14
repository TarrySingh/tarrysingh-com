import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

export const metadata: Metadata = {
  title: "Review archive · PANORAIMA",
  robots: { index: false, follow: false },
}

interface ArchiveEntry {
  code: string
  title: string
  track: string
  author: string
  coauthor: string
  verdict: string
  review_note?: string | null
  long_form: { heading: string; text: string; chars: number }[]
  action_summary: { posted: string; iso: string; talk_rev: number; text: string }
  talk_url: string
}

interface Archive {
  generated_at: string
  note: string
  count: number
  entries: ArchiveEntry[]
}

const VERDICT_STYLE: Record<string, string> = {
  "revision requested": "border-[#E8D3A8] bg-[#FBF1DC] text-[#8A5A00]",
  reviewed: "border-[#BFE2CC] bg-[#E7F4EC] text-[#1F6B41]",
  "early feedback": "border-[#BBD4DE] bg-[#EAF2F6] text-[#1C5A73]",
}

function loadArchive(): Archive | null {
  const file = path.join(process.cwd(), "src/lib/panoraima/wp4_review_archive.json")
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, "utf-8")) as Archive
}

export default function ReviewArchivePage() {
  const data = loadArchive()

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-[#16181D]">
        <p>The review archive has not been generated yet.</p>
      </main>
    )
  }

  const totalSections = data.entries.reduce((n, e) => n + e.long_form.length, 0)

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:py-14 text-[#16181D]">
      <Link
        href="/experiments/panoraima/wps/wp4"
        className="inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[#646B78] hover:text-[#16181D]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> WP4 dashboard
      </Link>

      <p className="mt-6 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#C0492B]">
        RealAI · admin only
      </p>
      <h1 className="mt-1 text-[28px] md:text-[34px] font-extrabold leading-tight">Review archive: Horizontal LEs</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#3A3E46]">{data.note}</p>
      <p className="mt-2 text-[14px] text-[#5B616B]">
        {data.count} Learning Events · {totalSections} long-form reviews · each entry shows the compact summary as
        posted, then the full text of our earlier review(s). Generated {data.generated_at.slice(0, 10)}.
      </p>

      <nav className="mt-6 flex flex-wrap gap-1.5" aria-label="Jump to a Learning Event">
        {data.entries.map((e) => (
          <a
            key={e.code}
            href={`#${e.code}`}
            className="rounded border border-[#D7D9DE] bg-[#F1F2F4] px-2 py-1 font-mono text-[12px] font-bold text-[#3A3E46] hover:border-[#16181D]/40"
          >
            {e.code}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-4">
        {data.entries.map((e) => (
          <details
            key={e.code}
            id={e.code}
            className="group rounded-xl border border-[#DCDDE1] bg-white p-5 shadow-[0_1px_3px_rgba(20,22,27,0.06)]"
          >
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[14px] font-bold">{e.code}</span>
                <span
                  className={`rounded border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] ${
                    VERDICT_STYLE[e.verdict] ?? "border-[#D7D9DE] bg-[#F1F2F4] text-[#3A3E46]"
                  }`}
                >
                  {e.verdict}
                </span>
                <span className="font-mono text-[12px] text-[#5B616B]">
                  summary posted {e.action_summary.posted} · rev {e.action_summary.talk_rev}
                </span>
              </div>
              <h2 className="mt-1.5 text-[16px] font-bold leading-snug">{e.title}</h2>
              <p className="mt-0.5 text-[13px] text-[#5B616B]">
                {e.author}
                {e.coauthor ? ` · ${e.coauthor}` : ""}
              </p>
            </summary>

            <div className="mt-4 border-t border-[#DCDDE1] pt-4">
              <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-[#1F6B41]">
                Compact summary as posted
              </h3>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#2A2D34]">
                {e.action_summary.text}
              </pre>

              {e.review_note && (
                <p className="mt-4 rounded bg-[#F1F2F4] px-3 py-2 text-[13px] leading-relaxed text-[#3A3E46]">
                  <span className="font-bold">Register note: </span>
                  {e.review_note}
                </p>
              )}

              {e.long_form.map((s) => (
                <details key={s.heading} className="mt-5 rounded-lg border border-[#DCDDE1] bg-[#FAFAFB] p-4">
                  <summary className="cursor-pointer text-[14px] font-bold">
                    Long-form: {s.heading}{" "}
                    <span className="font-mono text-[12px] font-normal text-[#5B616B]">
                      ({Math.round(s.chars / 5)} words)
                    </span>
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-[#2A2D34]">
                    {s.text}
                  </pre>
                </details>
              ))}

              <a
                href={e.talk_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2A5594] hover:underline"
              >
                Open the Discussion page on the wiki <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </details>
        ))}
      </div>
    </main>
  )
}
