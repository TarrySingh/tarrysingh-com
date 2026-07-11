/**
 * Compile every content/blog/*.mdx exactly the way the blog [slug] page does,
 * so a malformed post is caught BEFORE it reaches `next build` (where a single
 * bad file fails the whole production build and freezes the site).
 *
 * Mirrors src/app/(main)/blog/[slug]/page.tsx: next-mdx-remote + remark-gfm
 * (+ remark-math when the post uses $$), rehype-slug / autolink / katex.
 *
 * Usage:  node scripts/verify-blog-mdx.mjs
 * Exits 1 (with the offending file + parser message) if any post fails.
 */
import fs from "node:fs"
import path from "node:path"
import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"

const DIR = path.join(process.cwd(), "content", "blog")
const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".mdx"))
  .sort()

const failed = []
for (const f of files) {
  const raw = fs.readFileSync(path.join(DIR, f), "utf8")
  const hasMath = raw.includes("$$")
  try {
    await serialize(raw, {
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
  } catch (e) {
    const msg = (e && e.message ? e.message : String(e))
      .split("\n")
      .slice(0, 4)
      .join("\n     ")
    failed.push({ f, msg })
  }
}

console.log(`checked ${files.length} posts`)
if (failed.length) {
  console.log(`\n✗ ${failed.length} post(s) FAILED to compile:\n`)
  for (const x of failed) console.log(`  ${x.f}\n     ${x.msg}\n`)
  process.exit(1)
}
console.log("✓ all posts compile clean")
