"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import type { DispatchDraft } from "@/lib/studio/types"

const CATEGORY_DOT: Record<DispatchDraft["frontmatter"]["category"], string> = {
  Essays: "bg-gold-500",
  Notes: "bg-blue-500",
  Studio: "bg-rose-500",
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface Props {
  draft: DispatchDraft
}

/**
 * One row in the /studio drafts list. The whole card is a Link to
 * the editor. A small trash button on the right deletes the draft
 * (with a confirm prompt) via DELETE /api/studio/save?slug=...
 *
 * The trash button is `<button>` not `<Link>` so its click doesn't
 * propagate into the surrounding Link.
 */
export function DraftListItem({ draft }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const title = draft.frontmatter.title || draft.slug
    if (!confirm(`Delete the draft "${title}"?\n\nThis is irreversible — the body and frontmatter both disappear from Supabase. Published Dispatches are untouched.`)) {
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/studio/save?slug=${encodeURIComponent(draft.slug)}`, {
          method: "DELETE",
        })
        const j = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          error?: string
        }
        if (!res.ok || !j.ok) {
          setError(j.error ?? `delete_failed_${res.status}`)
          return
        }
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "network_error")
      }
    })
  }

  return (
    <li className="relative">
      <Link
        href={`/studio/editor/${draft.slug}`}
        className="group block rounded-xl border border-navy-200/80 bg-white p-4 pr-[68px] sm:p-5 sm:pr-16 transition-all duration-200 hover:border-gold-400 hover:bg-white hover:shadow-[0_1px_0_rgba(15,23,42,0.04)]"
      >
        <div className="mb-2 flex items-center gap-3">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              CATEGORY_DOT[draft.frontmatter.category]
            }`}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy-400"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            {draft.frontmatter.category}
          </span>
          <span className="text-navy-200">·</span>
          <span
            className="text-[10px] tracking-wide text-navy-400"
            style={{
              fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            }}
          >
            last touched {formatDate(draft.updatedAt)}
          </span>
        </div>
        <h2
          className="text-xl text-navy-900 tracking-tight group-hover:text-gold-700 transition-colors"
          style={{
            fontFamily: "var(--font-display), 'Gloock', serif",
          }}
        >
          {draft.frontmatter.title || "(untitled)"}
        </h2>
        {draft.frontmatter.excerpt ? (
          <p
            className="mt-2 text-sm text-navy-600 leading-relaxed line-clamp-2"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            }}
          >
            {draft.frontmatter.excerpt}
          </p>
        ) : null}
        <p
          className="mt-2 text-[10px] uppercase tracking-[0.22em] text-navy-300"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          slug: {draft.slug}
        </p>
      </Link>

      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        aria-label={`Delete draft "${draft.frontmatter.title || draft.slug}"`}
        title="Delete draft"
        className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-200/70 bg-white text-navy-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed sm:right-4 sm:top-4"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {error ? (
        <p
          className="absolute right-3 top-[60px] rounded bg-rose-50 px-2 py-1 text-[10px] text-rose-700 sm:right-4 sm:top-16"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          {error}
        </p>
      ) : null}
    </li>
  )
}
