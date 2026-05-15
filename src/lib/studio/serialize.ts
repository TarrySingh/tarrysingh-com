import TurndownService from "turndown"
import { marked } from "marked"
import type { DispatchFrontmatter } from "./types"

/**
 * Convert Tiptap-emitted HTML back to Markdown for persistence.
 *
 * Configured to produce GitHub-flavoured Markdown that the existing
 * MDX pipeline can ingest unchanged. Headings keep `#` form (no
 * Setext); links keep inline form; emphasis preserves `*` vs `_`
 * disambiguation; code fences use `` ``` `` with language tags.
 */
const td = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
})

// Preserve <code> inside <pre> with language hints.
td.addRule("fencedCodeWithLang", {
  filter: (node) =>
    node.nodeName === "PRE" &&
    node.firstChild !== null &&
    node.firstChild.nodeName === "CODE",
  replacement: (_content, node) => {
    const code = node.firstChild as HTMLElement
    const language = (code.getAttribute("class") ?? "")
      .split(" ")
      .find((c) => c.startsWith("language-"))
      ?.replace("language-", "") ?? ""
    return `\n\n\`\`\`${language}\n${code.textContent ?? ""}\n\`\`\`\n\n`
  },
})

export function htmlToMarkdown(html: string): string {
  return td.turndown(html)
}

/**
 * Lift solo `<img>` elements out of the `<p>` wrappers `marked` puts
 * around them. Tiptap's Image extension is configured `inline: false`
 * (block node) so an `<img>` nested inside a paragraph is rejected by
 * the ProseMirror schema and silently dropped on load. Standalone
 * markdown images (`![alt](url)` on their own line) emit `<p><img></p>`
 * by default — this unwraps them.
 *
 * Caught at Sprint 4.2 UAT (2026-05-15): image survived save, vanished
 * on refresh. Save side was fine (Turndown emitted `![alt](url)`
 * correctly); the load side dropped the node because of the schema
 * mismatch.
 */
export function unwrapStandaloneImages(html: string): string {
  return html.replace(
    /<p>\s*(<img\b[^>]*\/?>)\s*<\/p>/g,
    "$1",
  )
}

/**
 * Markdown → Tiptap-ready HTML. Wraps `marked.parse` + the standalone-
 * image unwrap fix above. Use this everywhere the editor needs HTML
 * from saved markdown (initial load, AI Continue output, AI Rewrite
 * output) so the round-trip preserves embedded images.
 */
export function markdownToEditorHtml(markdown: string): string {
  if (!markdown) return ""
  const raw = marked.parse(markdown, { async: false }) as string
  return unwrapStandaloneImages(raw)
}

/**
 * Build the full .mdx text from frontmatter + body, ready to commit
 * to `content/blog/<slug>.mdx`.
 */
export function buildMdx(fm: DispatchFrontmatter, body: string): string {
  const lines: string[] = ["---"]
  lines.push(`title: ${JSON.stringify(fm.title)}`)
  lines.push(`date: ${JSON.stringify(fm.date)}`)
  lines.push(`category: ${JSON.stringify(fm.category)}`)
  lines.push(`excerpt: ${JSON.stringify(fm.excerpt)}`)
  if (fm.hero) lines.push(`hero: ${JSON.stringify(fm.hero)}`)
  if (fm.theme && fm.theme !== "editorial")
    lines.push(`theme: ${JSON.stringify(fm.theme)}`)
  if (fm.linkedin_url) lines.push(`linkedin_url: ${JSON.stringify(fm.linkedin_url)}`)
  if (typeof fm.draft === "boolean") lines.push(`draft: ${fm.draft}`)
  if (fm.tags && fm.tags.length > 0) {
    lines.push(`tags: [${fm.tags.map((t) => JSON.stringify(t)).join(", ")}]`)
  }
  lines.push("---")
  lines.push("")
  lines.push(body.trim())
  lines.push("")
  return lines.join("\n")
}
