import { Octokit } from "@octokit/rest"

/**
 * Sprint 7 — version-history surface.
 *
 * Reads the git history of `content/blog/<slug>.mdx` via the GitHub
 * Contents + Commits APIs. Three helpers:
 *
 *   1. listHistory(slug)            — last N commits touching the file
 *   2. getFileAtCommit(slug, sha)   — file contents as of that commit
 *   3. revertToCommit(slug, sha)    — creates a NEW commit on main
 *                                     restoring the older content
 *
 * Uses the same STUDIO_GITHUB_TOKEN as publish.ts (single Octokit
 * client, single PAT, no new scopes required).
 */

const REPO_OWNER = "TarrySingh"
const REPO_NAME = "tarrysingh-com"
const BRANCH = "main"
const MAX_COMMITS = 20

export interface HistoryCommit {
  sha: string
  shortSha: string
  message: string
  authorName: string
  authorEmail: string
  date: string
  htmlUrl: string
}

export type HistoryListResult =
  | { ok: true; commits: HistoryCommit[] }
  | { ok: false; error: "github_unconfigured" | "github_api_error" | "not_found" }

export type HistoryFileResult =
  | { ok: true; sha: string; content: string; size: number }
  | { ok: false; error: "github_unconfigured" | "github_api_error" | "not_found" }

export type RevertResult =
  | {
      ok: true
      newCommitSha: string
      newCommitUrl: string
    }
  | {
      ok: false
      error:
        | "github_unconfigured"
        | "github_api_error"
        | "not_found"
        | "no_change"
    }

function getOctokit(): Octokit | null {
  const token = process.env.STUDIO_GITHUB_TOKEN
  if (!token) return null
  return new Octokit({ auth: token })
}

function pathFor(slug: string): string {
  return `content/blog/${slug}.mdx`
}

export async function listHistory(slug: string): Promise<HistoryListResult> {
  const octokit = getOctokit()
  if (!octokit) return { ok: false, error: "github_unconfigured" }

  try {
    const res = await octokit.repos.listCommits({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: pathFor(slug),
      sha: BRANCH,
      per_page: MAX_COMMITS,
    })
    if (!res.data || res.data.length === 0) {
      return { ok: false, error: "not_found" }
    }
    const commits: HistoryCommit[] = res.data.map((c) => ({
      sha: c.sha,
      shortSha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0],
      authorName: c.commit.author?.name ?? c.author?.login ?? "unknown",
      authorEmail: c.commit.author?.email ?? "",
      date: c.commit.author?.date ?? c.commit.committer?.date ?? "",
      htmlUrl: c.html_url,
    }))
    return { ok: true, commits }
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status === 404) return { ok: false, error: "not_found" }
    console.error(
      JSON.stringify({
        tag: "studio.history.list_error",
        slug,
        status,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return { ok: false, error: "github_api_error" }
  }
}

export async function getFileAtCommit(
  slug: string,
  sha: string,
): Promise<HistoryFileResult> {
  const octokit = getOctokit()
  if (!octokit) return { ok: false, error: "github_unconfigured" }

  try {
    const res = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: pathFor(slug),
      ref: sha,
    })
    const data = res.data as
      | { type?: string; content?: string; encoding?: string; size?: number; sha?: string }
      | Array<unknown>
    if (Array.isArray(data) || data.type !== "file" || !data.content) {
      return { ok: false, error: "not_found" }
    }
    const encoding = data.encoding === "base64" ? "base64" : "utf8"
    const content = Buffer.from(data.content, encoding as BufferEncoding).toString("utf8")
    return {
      ok: true,
      sha: data.sha ?? sha,
      content,
      size: data.size ?? content.length,
    }
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status === 404) return { ok: false, error: "not_found" }
    console.error(
      JSON.stringify({
        tag: "studio.history.file_error",
        slug,
        sha,
        status,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return { ok: false, error: "github_api_error" }
  }
}

export async function revertToCommit(
  slug: string,
  sha: string,
): Promise<RevertResult> {
  const octokit = getOctokit()
  if (!octokit) return { ok: false, error: "github_unconfigured" }

  // 1. Fetch the file as it existed at the chosen commit.
  const at = await getFileAtCommit(slug, sha)
  if (!at.ok) {
    return { ok: false, error: at.error === "not_found" ? "not_found" : "github_api_error" }
  }
  const oldContent = at.content

  // 2. Fetch the file's current state on main (for the file SHA we
  //    have to pass to createOrUpdateFileContents, plus to detect a
  //    no-op revert).
  let currentSha: string | undefined
  let currentContent = ""
  try {
    const cur = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: pathFor(slug),
      ref: BRANCH,
    })
    const data = cur.data as { type?: string; content?: string; encoding?: string; sha?: string }
    if (data && data.type === "file" && data.content) {
      currentSha = data.sha
      currentContent = Buffer.from(data.content, "base64").toString("utf8")
    }
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status !== 404) {
      console.error(
        JSON.stringify({
          tag: "studio.history.revert_get_current_error",
          slug,
          status,
          error: err instanceof Error ? err.message : String(err),
        }),
      )
      return { ok: false, error: "github_api_error" }
    }
    // 404 — file is currently absent on main; revert restores it.
  }

  if (currentContent === oldContent) {
    return { ok: false, error: "no_change" }
  }

  const message = `revert(blog): restore ${slug} to ${sha.slice(0, 7)}\n\nReverted via the Studio Editor's history pane.\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
  const contentBase64 = Buffer.from(oldContent, "utf8").toString("base64")

  try {
    const res = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: pathFor(slug),
      message,
      content: contentBase64,
      branch: BRANCH,
      sha: currentSha, // required when updating an existing file
      committer: { name: "Tarry Singh", email: "tarry.singh@gmail.com" },
      author: { name: "Tarry Singh", email: "tarry.singh@gmail.com" },
    })
    const commit = res.data.commit
    return {
      ok: true,
      newCommitSha: commit.sha ?? "",
      newCommitUrl:
        commit.html_url ??
        `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${commit.sha ?? ""}`,
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "studio.history.revert_put_error",
        slug,
        sha,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return { ok: false, error: "github_api_error" }
  }
}
