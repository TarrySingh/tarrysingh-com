import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"

/**
 * Compile a full .mdx string (frontmatter + body) exactly the way the blog
 * [slug] page renders it (src/app/(main)/blog/[slug]/page.tsx), so a malformed
 * post is rejected AT PUBLISH TIME instead of failing `next build` — where a
 * single bad file fails the static prerender for the whole site and freezes
 * every production deploy (the IndiaAI incident, 2026-07-09 → 07-11).
 *
 * Math plugins are gated on a `$$` block exactly like the page, so currency
 * such as "$700 billion" is never parsed as math.
 */
export async function assertMdxCompiles(
  fullMdx: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const hasMath = fullMdx.includes("$$")
  try {
    await serialize(fullMdx, {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: hasMath ? [remarkGfm, remarkMath] : [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "append" }],
          ...(hasMath ? [rehypeKatex] : []),
        ],
      },
    })
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg.split("\n").slice(0, 3).join(" ").trim() }
  }
}
