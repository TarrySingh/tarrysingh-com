import TurndownService from "turndown"
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
