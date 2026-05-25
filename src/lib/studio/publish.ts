import { Octokit } from "@octokit/rest"
import type { DispatchFrontmatter } from "./types"
import { buildMdx } from "./serialize"

/**
 * Publishes a Dispatch by committing `content/blog/<slug>.mdx`
 * straight to the main branch via the GitHub Contents API. Vercel
 * picks up the push and auto-deploys; the post is live in ~90 s.
 *
 * Token: `STUDIO_GITHUB_TOKEN` — a fine-grained PAT scoped to
 * TarrySingh/tarrysingh-com with `Contents: read & write`. Mint at
 * github.com/settings/personal-access-tokens. Set on Vercel
 * (Production + Preview + Development).
 *
 * Fail-closed when the token isn't configured.
 */

const REPO_OWNER = "TarrySingh"
const REPO_NAME = "tarrysingh-com"
const BRANCH = "main"

export interface PublishInput {
  slug: string
  frontmatter: DispatchFrontmatter
  body: string
  commitMessage?: string
  /**
   * When true, an existing `content/blog/<slug>.mdx` is overwritten in
   * place (the studio "edit a published post" path). When false or
   * absent, an existing file errors out as `slug_already_exists`
   * (the original "new dispatch can't clash with a live one" guard).
   */
  allowOverwrite?: boolean
}

export type PublishOutcome =
  | {
      ok: true
      outcome: "published" | "updated"
      commitSha: string
      commitUrl: string
      contentUrl: string
      blogUrl: string
    }
  | {
      ok: false
      error:
        | "github_unconfigured"
        | "slug_already_exists"
        | "github_api_error"
        | "invalid_input"
    }

function getOctokit(): Octokit | null {
  const token = process.env.STUDIO_GITHUB_TOKEN
  if (!token) return null
  return new Octokit({ auth: token })
}

export async function publishDispatch(
  input: PublishInput,
): Promise<PublishOutcome> {
  const octokit = getOctokit()
  if (!octokit) return { ok: false, error: "github_unconfigured" }

  if (!input.slug || !input.frontmatter.title || !input.body) {
    return { ok: false, error: "invalid_input" }
  }

  const filePath = `content/blog/${input.slug}.mdx`

  // Check whether the file already exists on main. The branching:
  //   - file exists + allowOverwrite=true  → update path (need its sha)
  //   - file exists + allowOverwrite=false → reject as slug_already_exists
  //   - file missing                       → create path
  let existingSha: string | undefined
  try {
    const existing = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      ref: BRANCH,
    })
    if (!input.allowOverwrite) {
      return { ok: false, error: "slug_already_exists" }
    }
    // getContent for a file returns a single object with a `sha` we
    // pass back to createOrUpdateFileContents to identify the revision
    // we mean to replace. Array response would mean filePath was a
    // directory — shouldn't happen for a .mdx leaf, but guard anyway.
    const data = existing.data
    if (Array.isArray(data) || data.type !== "file") {
      return { ok: false, error: "github_api_error" }
    }
    existingSha = data.sha
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status !== 404) {
      console.error(
        JSON.stringify({
          tag: "studio.publish.get_content_error",
          slug: input.slug,
          status,
          error: err instanceof Error ? err.message : String(err),
        }),
      )
      return { ok: false, error: "github_api_error" }
    }
    // 404 = clean slot, proceed as create.
  }

  // Mark draft: false on publish, no matter what the editor sent.
  // Strip the editor-only `was_published` flag — it must never leak
  // into the committed .mdx (buildMdx is allowlist-based so this is
  // belt-and-braces, but explicit is safer than implicit).
  const fmForPublish: DispatchFrontmatter = {
    ...input.frontmatter,
    draft: false,
    date: input.frontmatter.date || new Date().toISOString().slice(0, 10),
  }
  delete fmForPublish.was_published
  const fullMdx = buildMdx(fmForPublish, input.body)
  const contentBase64 = Buffer.from(fullMdx, "utf8").toString("base64")

  const isUpdate = Boolean(existingSha)
  const commitMessage =
    input.commitMessage ||
    (isUpdate
      ? `feat(blog): update ${input.slug}\n\nEdited via Studio Editor.\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
      : `feat(blog): publish ${input.slug}\n\nPublished via Studio Editor.\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`)

  try {
    const res = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: commitMessage,
      content: contentBase64,
      branch: BRANCH,
      sha: existingSha, // passed only when we're updating; undefined for fresh creates
      committer: {
        name: "Tarry Singh",
        email: "tarry.singh@gmail.com",
      },
      author: {
        name: "Tarry Singh",
        email: "tarry.singh@gmail.com",
      },
    })
    const commit = res.data.commit
    const content = res.data.content
    return {
      ok: true,
      outcome: isUpdate ? "updated" : "published",
      commitSha: commit.sha ?? "",
      commitUrl: commit.html_url ?? `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${commit.sha ?? ""}`,
      contentUrl: content?.html_url ?? "",
      blogUrl: `https://www.tarrysingh.com/blog/${input.slug}`,
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        tag: "studio.publish.put_content_error",
        slug: input.slug,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return { ok: false, error: "github_api_error" }
  }
}
