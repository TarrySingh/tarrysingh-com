import type { Metadata } from "next"
import Link from "next/link"
import { UnsubscribeForm } from "./UnsubscribeForm"

export const metadata: Metadata = {
  title: "Unsubscribe from Dispatches — Tarry Singh",
  description:
    "Step out of the Dispatches list. One click, no friction, no follow-up.",
  robots: { index: false, follow: false },
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>
}) {
  const params = await searchParams
  const email = (params.e ?? "").toLowerCase()
  const token = params.t ?? ""

  const hasParams = Boolean(email && token)

  return (
    <div className="bg-white min-h-[70vh]">
      <section className="relative bg-gradient-to-b from-navy-50/40 to-white pt-28 md:pt-36 pb-10 md:pb-14">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400 hover:text-navy-900 transition-colors mb-8"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            ← Dispatches
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-navy-400" />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400"
              style={{
                fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
              }}
            >
              Unsubscribe · one click
            </span>
          </div>

          <h1
            className="text-3xl md:text-5xl text-navy-900 tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
          >
            Stepping out of the list.
          </h1>

          <p
            className="text-lg text-navy-600 leading-relaxed italic"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          >
            One click and you&apos;re off. No retention pop-ups. No follow-up
            asking why. The plate stays on the wall whether or not you read
            it.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 lg:px-8 pb-16 md:pb-24">
        {hasParams ? (
          <UnsubscribeForm email={email} token={token} />
        ) : (
          <div
            className="rounded-2xl border border-navy-200/80 bg-white p-7 md:p-8"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          >
            <p className="text-navy-700 leading-relaxed">
              This page is normally reached from the unsubscribe link at the
              bottom of a Dispatches email — the link carries the parameters
              that confirm it&apos;s your address. If you arrived here directly
              and want to unsubscribe, reply to any Dispatches email with the
              word <em>stop</em> and we&apos;ll handle it by hand.
            </p>
          </div>
        )}

        <p
          className="mt-10 text-sm text-navy-500 italic"
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
          }}
        >
          Should you ever want to come back: the front door is still
          unlocked.{" "}
          <Link
            href="/blog"
            className="text-gold-700 underline decoration-gold-300 decoration-2 underline-offset-4 hover:decoration-gold-500"
          >
            Read the latest Dispatch
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
