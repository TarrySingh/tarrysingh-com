"use client"

import { useState } from "react"
import Link from "next/link"

type Status = "ready" | "loading" | "done" | "error"

interface Props {
  email: string
  token: string
}

export function UnsubscribeForm({ email, token }: Props) {
  const [status, setStatus] = useState<Status>("ready")
  const [message, setMessage] = useState("")

  async function onConfirm() {
    setStatus("loading")
    setMessage("")
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
      }
      if (res.ok && body.ok) {
        setStatus("done")
        setMessage(
          "Filed. Your address has been removed from the Dispatches list.",
        )
      } else if (body.error === "invalid_token") {
        setStatus("error")
        setMessage(
          "This unsubscribe link is no longer valid. Reply to any Dispatches email with the word stop and we'll handle it by hand.",
        )
      } else {
        setStatus("error")
        setMessage(
          "Something snagged on our end. Try again in a moment, or reply to any Dispatches email with the word stop.",
        )
      }
    } catch {
      setStatus("error")
      setMessage(
        "Network hiccup. Try again in a moment, or reply to any Dispatches email with the word stop.",
      )
    }
  }

  return (
    <div
      className="rounded-2xl border border-navy-200/80 bg-white p-7 md:p-8 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
      style={{
        fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
      }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-gold-700"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          Confirm
        </span>
        <span className="h-px flex-1 bg-navy-100" />
      </div>

      <p className="text-navy-700 leading-relaxed mb-3">
        We&apos;ll remove the following address from the Dispatches list. It
        takes effect immediately, no further emails will be sent.
      </p>

      <p
        className="text-base text-navy-900 mb-7 font-mono px-3 py-2 inline-block rounded bg-navy-50 border border-navy-100"
        style={{
          fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
        }}
      >
        {email}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onConfirm}
          disabled={status === "loading" || status === "done"}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-[11px] font-semibold uppercase tracking-[0.22em] hover:bg-rose-100 hover:border-rose-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          {status === "loading"
            ? "Filing…"
            : status === "done"
            ? "Filed"
            : "Confirm unsubscribe"}
        </button>

        <Link
          href="/blog"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-navy-200 bg-white text-navy-700 text-[11px] font-semibold uppercase tracking-[0.22em] hover:bg-navy-50 transition-colors"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          Keep me on the list
        </Link>
      </div>

      <div className="min-h-[1.25rem] mt-5" aria-live="polite">
        {message ? (
          <p
            className={`text-sm leading-relaxed ${
              status === "done" ? "text-gold-700" : "text-rose-600"
            }`}
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
