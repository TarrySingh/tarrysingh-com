"use client"

import { useEffect, useState, type CSSProperties } from "react"

interface HistoryCommit {
  sha: string
  shortSha: string
  message: string
  authorName: string
  authorEmail: string
  date: string
  htmlUrl: string
}

interface Props {
  slug: string
  /** Called when the user clicks "Close" or completes a revert. */
  onClose: () => void
  /** Called after a successful revert so the parent can refetch the draft body. */
  onReverted?: (newCommitSha: string) => void
}

type ListStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; commits: HistoryCommit[] }
  | { kind: "error"; message: string; hint?: string }

type FileStatus =
  | { kind: "idle" }
  | { kind: "loading"; sha: string }
  | { kind: "ok"; sha: string; content: string }
  | { kind: "error"; sha: string; message: string }

type RevertStatus =
  | { kind: "idle" }
  | { kind: "running"; sha: string }
  | { kind: "ok"; newCommitSha: string; newCommitUrl: string }
  | { kind: "error"; message: string }

type DiffStatus =
  | { kind: "idle" }
  | { kind: "loading"; sha: string }
  | {
      kind: "ok"
      sha: string
      additions: number
      deletions: number
      status: string
      patch: string
    }
  | { kind: "error"; sha: string; message: string }

function formatDateRelative(iso: string): string {
  if (!iso) return "unknown date"
  try {
    const d = new Date(iso)
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

/**
 * Sprint 7 — version-history pane.
 *
 * Lists the last 20 commits touching content/blog/<slug>.mdx via
 * GET /api/studio/history. Clicking a commit fetches its file
 * contents via GET /api/studio/history/file and shows them in a
 * read-only pane. A "Revert to this version" button creates a NEW
 * commit on main that restores the older content via POST
 * /api/studio/revert.
 *
 * Surfaced as a full-screen overlay from the editor header. Renders
 * useful messages for the two common edge cases:
 *  - Dispatch hasn't been published yet → "No git history yet."
 *  - STUDIO_GITHUB_TOKEN unset → "Configure the PAT on Vercel."
 */
export function HistoryPane({ slug, onClose, onReverted }: Props) {
  const [listStatus, setListStatus] = useState<ListStatus>({ kind: "idle" })
  const [selectedSha, setSelectedSha] = useState<string | null>(null)
  const [fileStatus, setFileStatus] = useState<FileStatus>({ kind: "idle" })
  const [revertStatus, setRevertStatus] = useState<RevertStatus>({ kind: "idle" })
  const [diffStatus, setDiffStatus] = useState<DiffStatus>({ kind: "idle" })
  // Default to the diff ("what changed") — that's the granular view;
  // Snapshot (full file at that commit) is one toggle away.
  const [view, setView] = useState<"diff" | "snapshot">("diff")

  // Initial fetch — list commits.
  useEffect(() => {
    let cancelled = false
    setListStatus({ kind: "loading" })
    fetch(`/api/studio/history?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const j = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok || !j.ok) {
          let hint: string | undefined
          if (j.error === "not_found") {
            hint = "This Dispatch has no git history yet — publish it first to start tracking versions."
          } else if (j.error === "github_unconfigured") {
            hint = "Set STUDIO_GITHUB_TOKEN on the Vercel project (Settings → Environment Variables) and redeploy."
          }
          setListStatus({
            kind: "error",
            message: j.error ?? `history_failed_${res.status}`,
            hint,
          })
          return
        }
        setListStatus({ kind: "ok", commits: j.commits ?? [] })
      })
      .catch((err) => {
        if (cancelled) return
        setListStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "network_error",
        })
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  // Fetch file contents when a commit is selected.
  useEffect(() => {
    if (!selectedSha) return
    let cancelled = false
    setFileStatus({ kind: "loading", sha: selectedSha })
    fetch(
      `/api/studio/history/file?slug=${encodeURIComponent(slug)}&sha=${encodeURIComponent(selectedSha)}`,
    )
      .then(async (res) => {
        const j = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok || !j.ok) {
          setFileStatus({
            kind: "error",
            sha: selectedSha,
            message: j.error ?? `file_failed_${res.status}`,
          })
          return
        }
        setFileStatus({ kind: "ok", sha: selectedSha, content: j.content })
      })
      .catch((err) => {
        if (cancelled) return
        setFileStatus({
          kind: "error",
          sha: selectedSha,
          message: err instanceof Error ? err.message : "network_error",
        })
      })
    return () => {
      cancelled = true
    }
  }, [selectedSha, slug])

  // Fetch the diff — what this commit changed vs its parent — on select.
  useEffect(() => {
    if (!selectedSha) return
    let cancelled = false
    setDiffStatus({ kind: "loading", sha: selectedSha })
    fetch(
      `/api/studio/history/diff?slug=${encodeURIComponent(slug)}&sha=${encodeURIComponent(selectedSha)}`,
    )
      .then(async (res) => {
        const j = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok || !j.ok) {
          setDiffStatus({
            kind: "error",
            sha: selectedSha,
            message: j.error ?? `diff_failed_${res.status}`,
          })
          return
        }
        setDiffStatus({
          kind: "ok",
          sha: selectedSha,
          additions: j.additions ?? 0,
          deletions: j.deletions ?? 0,
          status: j.status ?? "modified",
          patch: j.patch ?? "",
        })
      })
      .catch((err) => {
        if (cancelled) return
        setDiffStatus({
          kind: "error",
          sha: selectedSha,
          message: err instanceof Error ? err.message : "network_error",
        })
      })
    return () => {
      cancelled = true
    }
  }, [selectedSha, slug])

  async function onRevert(sha: string, shortSha: string) {
    if (!confirm(
      `Revert "${slug}" to commit ${shortSha}?\n\nThis creates a new commit on main with the older content. Vercel auto-deploys in ~90 s. The original commits stay in history; nothing is rewritten.`,
    )) {
      return
    }
    setRevertStatus({ kind: "running", sha })
    try {
      const res = await fetch("/api/studio/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, sha }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok || !j.ok) {
        const hint =
          j.error === "no_change"
            ? "Revert would produce the same content as currently on main — already at this version."
            : undefined
        setRevertStatus({
          kind: "error",
          message: hint ?? j.error ?? `revert_failed_${res.status}`,
        })
        return
      }
      setRevertStatus({
        kind: "ok",
        newCommitSha: j.newCommitSha,
        newCommitUrl: j.newCommitUrl,
      })
      if (onReverted) onReverted(j.newCommitSha)
    } catch (err) {
      setRevertStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "network_error",
      })
    }
  }

  const mono = { fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" } as const
  const serif = { fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" } as const

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col bg-[#fbf7ec]"
      role="dialog"
      aria-label="Version history"
      aria-modal="true"
    >
      <header className="border-b border-navy-200/80 bg-[rgba(251,247,236,0.96)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-700"
            style={mono}
          >
            History · {slug}
          </span>
          <span className="hidden sm:inline-block h-4 w-px bg-navy-200/60" />
          <span
            className="hidden sm:inline-block text-[10px] uppercase tracking-[0.22em] text-navy-400"
            style={mono}
          >
            Last 20 commits on `content/blog/{slug}.mdx`
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-navy-200 bg-white px-4 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy-700 transition-colors hover:bg-navy-50"
            style={mono}
          >
            ✕ Close
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {revertStatus.kind === "ok" ? (
            <div
              className="mb-5 rounded-md border border-gold-300 bg-gold-50 p-4 text-xs text-navy-800"
              style={mono}
            >
              ✓ Reverted. New commit{" "}
              <a
                href={revertStatus.newCommitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-700 underline decoration-gold-400"
              >
                {revertStatus.newCommitSha.slice(0, 7)}
              </a>{" "}
              landed on main. Vercel will deploy in ~90 s. Refresh the editor to pull the reverted body into the draft.
            </div>
          ) : null}
          {revertStatus.kind === "error" ? (
            <div
              className="mb-5 rounded-md border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700"
              style={mono}
            >
              ✗ Revert failed: {revertStatus.message}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            {/* — commit list — */}
            <section>
              <h2
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-navy-400"
                style={mono}
              >
                Commits
              </h2>
              {listStatus.kind === "loading" ? (
                <p className="text-xs text-navy-500" style={mono}>
                  Loading commits…
                </p>
              ) : null}
              {listStatus.kind === "error" ? (
                <div
                  className="rounded-md border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700"
                  style={mono}
                >
                  <p className="font-semibold">{listStatus.message}</p>
                  {listStatus.hint ? (
                    <p
                      className="mt-2 text-rose-600 normal-case tracking-normal"
                      style={serif}
                    >
                      {listStatus.hint}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {listStatus.kind === "ok" && listStatus.commits.length === 0 ? (
                <p
                  className="text-xs italic text-navy-500"
                  style={serif}
                >
                  No commits found. The Dispatch may not be published yet.
                </p>
              ) : null}
              {listStatus.kind === "ok" && listStatus.commits.length > 0 ? (
                <ul className="space-y-2">
                  {listStatus.commits.map((c) => {
                    const isSelected = selectedSha === c.sha
                    const isReverting =
                      revertStatus.kind === "running" && revertStatus.sha === c.sha
                    return (
                      <li
                        key={c.sha}
                        className={[
                          "rounded-lg border bg-white p-3 transition-colors",
                          isSelected
                            ? "border-gold-400 ring-1 ring-gold-200"
                            : "border-navy-200/80 hover:border-gold-300",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedSha(c.sha)}
                          className="block w-full text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded-full bg-navy-50 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.18em] text-navy-600"
                              style={mono}
                            >
                              {c.shortSha}
                            </span>
                            <span
                              className="text-[9.5px] tracking-wide text-navy-400"
                              style={mono}
                            >
                              {formatDateRelative(c.date)}
                            </span>
                          </div>
                          <p
                            className="mt-2 text-sm text-navy-800 leading-snug line-clamp-2"
                            style={serif}
                          >
                            {c.message}
                          </p>
                          <p
                            className="mt-1 text-[10px] tracking-wide text-navy-400"
                            style={mono}
                          >
                            {c.authorName}
                          </p>
                        </button>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <a
                            href={c.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-navy-200 bg-white px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-navy-600 transition-colors hover:bg-navy-50"
                            style={mono}
                          >
                            View on GitHub ↗
                          </a>
                          <button
                            type="button"
                            onClick={() => void onRevert(c.sha, c.shortSha)}
                            disabled={isReverting || revertStatus.kind === "running"}
                            className="rounded-full border border-gold-300 bg-gold-50 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-gold-700 transition-colors hover:bg-gold-100 disabled:opacity-50"
                            style={mono}
                          >
                            {isReverting ? "Reverting…" : "Revert to here"}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </section>

            {/* — selected commit: diff (what changed) or full snapshot — */}
            <section>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2
                  className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy-400"
                  style={mono}
                >
                  {selectedSha ? "What changed" : "Detail"}
                </h2>
                {selectedSha ? (
                  <>
                    <div className="inline-flex overflow-hidden rounded-full border border-navy-200">
                      <button
                        type="button"
                        onClick={() => setView("diff")}
                        className={`px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] transition-colors ${view === "diff" ? "bg-navy-900 text-white" : "bg-white text-navy-600 hover:bg-navy-50"}`}
                        style={mono}
                      >
                        Diff
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("snapshot")}
                        className={`px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] transition-colors ${view === "snapshot" ? "bg-navy-900 text-white" : "bg-white text-navy-600 hover:bg-navy-50"}`}
                        style={mono}
                      >
                        Snapshot
                      </button>
                    </div>
                    {diffStatus.kind === "ok" ? (
                      <span className="text-[10px] tracking-wide" style={mono}>
                        <span className="text-emerald-600">+{diffStatus.additions}</span>
                        <span className="text-navy-300"> / </span>
                        <span className="text-rose-600">−{diffStatus.deletions}</span>
                        <span className="text-navy-300"> lines</span>
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>

              {!selectedSha ? (
                <div
                  className="rounded-lg border border-dashed border-navy-200 bg-white/40 p-6 text-center"
                  style={serif}
                >
                  <p className="text-sm italic text-navy-500">
                    Pick a commit on the left to see what changed — or
                    switch to Snapshot for the full Dispatch as it existed
                    then.
                  </p>
                </div>
              ) : null}

              {/* Diff view — what this commit added/removed */}
              {selectedSha && view === "diff" ? (
                <>
                  {diffStatus.kind === "loading" ? (
                    <p className="text-xs text-navy-500" style={mono}>
                      Loading diff for {diffStatus.sha.slice(0, 7)}…
                    </p>
                  ) : null}
                  {diffStatus.kind === "error" ? (
                    <div
                      className="rounded-md border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700"
                      style={mono}
                    >
                      ✗ {diffStatus.message}
                    </div>
                  ) : null}
                  {diffStatus.kind === "ok" ? (
                    diffStatus.patch ? (
                      <DiffBlock patch={diffStatus.patch} mono={mono} />
                    ) : (
                      <p className="text-xs italic text-navy-500" style={serif}>
                        No textual diff for this commit (it may be the
                        initial publish with no prior version, or a
                        non-content change).
                      </p>
                    )
                  ) : null}
                </>
              ) : null}

              {/* Snapshot view — full file as of this commit */}
              {selectedSha && view === "snapshot" ? (
                <>
                  {fileStatus.kind === "loading" ? (
                    <p className="text-xs text-navy-500" style={mono}>
                      Fetching {fileStatus.sha.slice(0, 7)}…
                    </p>
                  ) : null}
                  {fileStatus.kind === "error" ? (
                    <div
                      className="rounded-md border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700"
                      style={mono}
                    >
                      ✗ {fileStatus.message}
                    </div>
                  ) : null}
                  {fileStatus.kind === "ok" ? (
                    <pre
                      className="max-h-[calc(100vh-16rem)] overflow-auto rounded-lg border border-navy-200 bg-white p-4 text-[12px] leading-relaxed text-navy-800 whitespace-pre-wrap"
                      style={mono}
                    >
                      {fileStatus.content}
                    </pre>
                  ) : null}
                </>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Renders a unified-diff patch with GitHub-style line colouring:
 * added lines green, removed lines red, hunk headers gold, file
 * headers muted. Read-only — the actual revert happens via the
 * "Revert to here" button on each commit.
 */
function DiffBlock({ patch, mono }: { patch: string; mono: CSSProperties }) {
  const lines = patch.split("\n")
  return (
    <div
      className="max-h-[calc(100vh-16rem)] overflow-auto rounded-lg border border-navy-200 bg-white py-2 text-[12px] leading-relaxed"
      style={mono}
    >
      {lines.map((line, i) => {
        let cls = "text-navy-700"
        let bg = ""
        if (line.startsWith("@@")) {
          cls = "text-gold-700"
          bg = "bg-gold-50"
        } else if (
          line.startsWith("diff ") ||
          line.startsWith("index ") ||
          line.startsWith("+++") ||
          line.startsWith("---")
        ) {
          cls = "text-navy-400"
        } else if (line.startsWith("+")) {
          cls = "text-emerald-700"
          bg = "bg-emerald-50/60"
        } else if (line.startsWith("-")) {
          cls = "text-rose-700"
          bg = "bg-rose-50/60"
        }
        return (
          <div
            key={i}
            className={`whitespace-pre-wrap break-words px-4 ${cls} ${bg}`}
          >
            {line || " "}
          </div>
        )
      })}
    </div>
  )
}
