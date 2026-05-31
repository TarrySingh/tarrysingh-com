import { Octokit } from "@octokit/rest"
import { getAdapter } from "./adapters"
import { getPlateEntry } from "../registry"
import { getPlateDraft, deletePlateDraft } from "../content-store"

/**
 * Sprint 8 — Publish a Synaptic plate's edited copy.
 *
 * Mirrors the Dispatch publish path (src/lib/studio/publish.ts): commit
 * straight to `main` via the GitHub Contents API; Vercel redeploys and the
 * live plate reflects the new copy in ~90 s. The plate components import their
 * content module directly, so regenerating that module IS the publish.
 *
 * Unlike a Dispatch, a plate's content file ALWAYS already exists — we only
 * ever update in place (sha required). The adapter's surgical serializer
 * guarantees only the editable exports change.
 *
 * Token: STUDIO_GITHUB_TOKEN (same fine-grained PAT as the Dispatch flow).
 */

const REPO_OWNER = "TarrySingh"
const REPO_NAME = "tarrysingh-com"
const BRANCH = "main"

export type PlatePublishResult =
  | {
      ok: true
      outcome: "updated" | "unchanged"
      plateId: string
      previewPath?: string
      commitSha?: string
      commitUrl?: string
    }
  | {
      ok: false
      error:
        | "github_unconfigured"
        | "not_editor_ready"
        | "unknown_plate"
        | "draft_not_found"
        | "content_missing"
        | "serialize_failed"
        | "github_api_error"
    }

function getOctokit(): Octokit | null {
  const token = process.env.STUDIO_GITHUB_TOKEN
  if (!token) return null
  return new Octokit({ auth: token })
}

export async function publishPlate(plateId: string): Promise<PlatePublishResult> {
  const adapter = getAdapter(plateId)
  if (!adapter) return { ok: false, error: "not_editor_ready" }

  const entry = getPlateEntry(plateId)
  if (!entry) return { ok: false, error: "unknown_plate" }

  const draft = await getPlateDraft(plateId)
  if (!draft) return { ok: false, error: "draft_not_found" }

  const octokit = getOctokit()
  if (!octokit) return { ok: false, error: "github_unconfigured" }

  const filePath = entry.contentPath

  // Fetch the current module source + its blob sha (the revision we replace).
  let currentSrc: string
  let sha: string
  try {
    const res = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      ref: BRANCH,
    })
    const data = res.data
    if (Array.isArray(data) || data.type !== "file") {
      return { ok: false, error: "content_missing" }
    }
    sha = data.sha
    // Node's base64 decoder ignores the newlines GitHub embeds in `content`.
    currentSrc = Buffer.from(data.content, "base64").toString("utf8")
  } catch (err) {
    const status = (err as { status?: number }).status
    console.error(
      JSON.stringify({
        tag: "synaptic.publish.get_content_error",
        plateId,
        filePath,
        status,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return { ok: false, error: status === 404 ? "content_missing" : "github_api_error" }
  }

  // Rewrite the editable exports. Throws if a named export is missing — fail
  // loudly rather than commit a no-op or a broken file.
  let newSrc: string
  try {
    newSrc = adapter.serialize(draft.content, currentSrc)
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "synaptic.publish.serialize_error",
        plateId,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return { ok: false, error: "serialize_failed" }
  }

  // Identical to the live file — nothing to publish. Clear the draft so the
  // editor stops showing pending edits, and report it.
  if (newSrc === currentSrc) {
    try {
      await deletePlateDraft(plateId)
    } catch {
      /* best-effort */
    }
    return { ok: true, outcome: "unchanged", plateId, previewPath: entry.previewPath }
  }

  const commitMessage = `content(synaptic): update ${plateId} copy\n\nEdited via /studio/synaptic.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

  try {
    const res = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(newSrc, "utf8").toString("base64"),
      branch: BRANCH,
      sha,
      committer: { name: "Tarry Singh", email: "tarry.singh@gmail.com" },
      author: { name: "Tarry Singh", email: "tarry.singh@gmail.com" },
    })
    const commit = res.data.commit

    // Best-effort: clear the draft now that it's live.
    try {
      await deletePlateDraft(plateId)
    } catch (err) {
      console.warn(
        JSON.stringify({
          tag: "synaptic.publish.draft_delete_failed",
          plateId,
          error: err instanceof Error ? err.message : String(err),
        }),
      )
    }

    return {
      ok: true,
      outcome: "updated",
      plateId,
      previewPath: entry.previewPath,
      commitSha: commit.sha ?? "",
      commitUrl:
        commit.html_url ??
        `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${commit.sha ?? ""}`,
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "synaptic.publish.put_content_error",
        plateId,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return { ok: false, error: "github_api_error" }
  }
}
