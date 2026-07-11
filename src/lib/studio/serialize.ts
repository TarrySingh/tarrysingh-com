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
    const text = code.textContent ?? ""
    // Math blocks round-trip back to $$…$$. The editor holds them as a
    // ```math fenced code block so marked (load) and Turndown (save) treat
    // the LaTeX as literal text and never mangle underscores/backslashes.
    if (language === "math") return `\n\n$$\n${text.trim()}\n$$\n\n`
    return `\n\n\`\`\`${language}\n${text}\n\`\`\`\n\n`
  },
})

// Inline math is held in the editor as `$…$` inside a <code> mark; emit it
// back as bare $…$ (no backticks) so KaTeX renders it on the published post.
td.addRule("inlineMath", {
  filter: (node) =>
    node.nodeName === "CODE" &&
    node.parentNode?.nodeName !== "PRE" &&
    /^\$[^$]+\$$/.test(node.textContent ?? ""),
  replacement: (_content, node) => node.textContent ?? "",
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
/**
 * Protect LaTeX math from marked/Turndown mangling on the editor round-trip.
 * Block `$$…$$` becomes a ```math fenced code block (literal, unparsed); inline
 * `$…$` that actually contains LaTeX is wrapped in a `code` mark keeping its `$`
 * delimiters. Gated on the presence of a block `$$` so ordinary posts (incl.
 * ones that mention currency like "$5") are completely untouched. The reverse
 * mapping lives in the Turndown rules above (fencedCodeWithLang + inlineMath).
 */
export function protectMathForEditor(markdown: string): string {
  if (!markdown.includes("$$")) return markdown
  let out = markdown.replace(
    /\$\$([\s\S]+?)\$\$/g,
    (_m, tex: string) => `\n\n\`\`\`math\n${tex.trim()}\n\`\`\`\n\n`,
  )
  // Inside a math post (it has `$$`), treat $…$ as math when it looks like
  // LaTeX or is a short symbol like $A$, $x$, $R^2$ — but leave longer plain
  // spans (e.g. a stray "$5 to $") alone.
  out = out.replace(/\$([^$\n]+?)\$/g, (m, tex: string) =>
    /[\\^_{}]/.test(tex) || tex.length <= 3 ? `\`$${tex}$\`` : m,
  )
  return out
}

export function markdownToEditorHtml(markdown: string): string {
  if (!markdown) return ""
  const raw = marked.parse(protectMathForEditor(markdown), { async: false }) as string
  return unwrapStandaloneImages(raw)
}

/**
 * A whole line that is nothing but an agent tool-call scaffolding tag.
 * LLM article writers occasionally leak their function-call wrapper into
 * the article body — the observed failure was a trailing `</textContent>`
 * + `</invoke>` on the IndiaAI dispatch (2026-07-09), which is invalid MDX
 * and failed the static prerender for the WHOLE site, freezing every
 * production deploy for ~2 weeks. These tags are never legitimate prose.
 */
const SCAFFOLD_LINE =
  /^\s*<\/?(?:antml:)?(?:invoke|parameter|textcontent|function_calls|function_results|tool_use|tool_result|tool_use_error|antthinking|thinking)\b[^>]*>\s*$/i

/**
 * Trim leaked tool-call scaffolding lines from the START and END of a body.
 * Deliberately edge-only (tolerating blank lines between the tag and the
 * content edge) so a genuine mid-body ```xml example that shows `<invoke>`
 * is never touched — the real leak is always dangling closers at the tail.
 */
export function stripAgentScaffolding(body: string): string {
  const lines = body.split("\n")
  const isBlank = (l: string) => l.trim() === ""
  const isScaffold = (l: string) => SCAFFOLD_LINE.test(l)

  let end = lines.length
  while (end > 0) {
    let i = end - 1
    while (i >= 0 && isBlank(lines[i])) i--
    if (i >= 0 && isScaffold(lines[i])) end = i
    else {
      end = i + 1 // trim blank lines exposed above the last real content
      break
    }
  }
  let start = 0
  while (start < end) {
    let i = start
    while (i < end && isBlank(lines[i])) i++
    if (i < end && isScaffold(lines[i])) start = i + 1
    else {
      start = i // trim blank lines exposed below the first real content
      break
    }
  }
  return lines.slice(start, end).join("\n")
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
  if (fm.cover) lines.push(`cover: ${JSON.stringify(fm.cover)}`)
  if (fm.series) {
    const s = fm.series
    const parts = [`key: ${JSON.stringify(s.key)}`, `part: ${s.part}`]
    if (typeof s.total === "number") parts.push(`total: ${s.total}`)
    lines.push(`series: { ${parts.join(", ")} }`)
  }
  lines.push("---")
  lines.push("")
  lines.push(stripAgentScaffolding(body).trim())
  lines.push("")
  return lines.join("\n")
}
