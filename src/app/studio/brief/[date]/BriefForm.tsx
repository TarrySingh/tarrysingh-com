"use client"

import { useState } from "react"

type Status = "idle" | "saving" | "saved" | "error"

interface Props {
  forDate: string
  token: string
  initial: string
}

export function BriefForm({ forDate, token, initial }: Props) {
  const [text, setText] = useState(initial)
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed.length < 4) {
      setStatus("error")
      setMessage("A line or two is enough, but it can't be empty.")
      return
    }
    setStatus("saving")
    setMessage("")
    try {
      const res = await fetch("/api/studio/brief/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, brief: trimmed }),
      })
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        driveMirror?: "ok" | "failed"
      }
      if (!res.ok || !j.ok) {
        setStatus("error")
        setMessage(j.error ?? `save_failed_${res.status}`)
        return
      }
      setStatus("saved")
      // The brief is in Supabase either way, but Cowork reads it from the
      // Drive mirror. When that write fails the piece can still be missed, so
      // say so rather than reporting a clean save. Reporting "Filed" on a
      // half-save is how the 2026-08-25 SDLC brief was lost without anyone
      // noticing for two days.
      setMessage(
        j.driveMirror === "failed"
          ? "Filed to the studio, but the Drive copy failed. The backup writer will still pick it up; if an article is written before it does, the brief rolls to the next day."
          : "Filed. Tomorrow's article will fold this in.",
      )
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "network_error")
    }
  }

  async function onDecline() {
    setStatus("saving")
    setMessage("")
    try {
      const res = await fetch("/api/studio/brief/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
      }
      if (!res.ok || !j.ok) {
        setStatus("error")
        setMessage(j.error ?? `decline_failed_${res.status}`)
        return
      }
      setStatus("saved")
      setMessage("Declined. The rotation will run as scheduled.")
      setText("")
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "network_error")
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p
        className="text-sm italic text-navy-600"
        style={{
          fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
        }}
      >
        Drop links, paragraphs, half-sentences, whatever you'd want tomorrow
        morning to take seriously. The article gets written for{" "}
        <code className="font-mono text-[12.5px]">{forDate}</code>.
      </p>
      <textarea
        rows={10}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          if (status === "error") {
            setStatus("idle")
            setMessage("")
          }
        }}
        disabled={status === "saving" || status === "saved"}
        placeholder={`e.g.\n— https://techreport.example/agent-rollout\n— Watch the Atlan hallucination survey; 47% number\n— Frame around energy economics, not capability theatre.`}
        className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-navy-900 placeholder:text-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-300 disabled:opacity-60"
        style={{
          fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
          minHeight: "240px",
        }}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "saving" || status === "saved"}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-gold-400 bg-navy-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-navy-800 hover:border-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          {status === "saving"
            ? "Filing…"
            : status === "saved"
              ? "Filed"
              : "File the brief"}
        </button>
        <button
          type="button"
          onClick={onDecline}
          disabled={status === "saving" || status === "saved"}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-navy-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          Skip, use the default
        </button>
      </div>
      <div
        className="min-h-[1.25rem] text-[11.5px]"
        aria-live="polite"
        style={{
          fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          letterSpacing: "0.04em",
        }}
      >
        {message ? (
          <p
            className={
              status === "saved" ? "text-gold-700" : "text-rose-600"
            }
          >
            {message}
          </p>
        ) : (
          <p className="text-navy-400">
            Stored only for the next morning's run. You can refile by re-opening
            the email link.
          </p>
        )}
      </div>
    </form>
  )
}
