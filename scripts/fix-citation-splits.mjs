/**
 * Repair citation-split paragraphs in published Dispatches.
 *
 * Root cause (fixed forward in src/lib/studio/ai-backup-writer.ts): the writer
 * joined the model's response text blocks with "\n\n". With web_search +
 * citations, every cited span is its own text block — split MID-SENTENCE at the
 * citation boundary. So a blank line landed inside sentences, producing:
 *
 *     ...all 24 official EU languages in July 2026
 *
 *     . There are
 *
 * This script re-joins those fragments. Deliberately CONSERVATIVE — it only
 * merges when the signature is unambiguous, and never touches headings, lists,
 * block quotes, tables, fenced code (incl. mermaid), or frontmatter.
 *
 * Usage:
 *   node scripts/fix-citation-splits.mjs          # dry run, reports only
 *   node scripts/fix-citation-splits.mjs --write  # apply
 */
import fs from "node:fs"
import path from "node:path"

const WRITE = process.argv.includes("--write")
const DIR = path.join(process.cwd(), "content", "blog")

/** Block kinds we must never merge into or out of. */
function isStructural(block) {
  const t = block.trimStart()
  return (
    t.startsWith("#") || // heading
    t.startsWith(">") || // blockquote
    t.startsWith("- ") ||
    t.startsWith("* ") ||
    t.startsWith("+ ") ||
    /^\d+[.)]\s/.test(t) || // ordered list
    t.startsWith("|") || // table
    t.startsWith("---") || // hr / frontmatter fence
    t.startsWith("![") || // standalone image
    t.startsWith("<") // JSX/HTML component
  )
}

/** Does this block end a sentence properly? */
function endsClosed(block) {
  const s = block.trimEnd()
  // Terminal punctuation, optionally followed by a closing quote/bracket.
  return /[.!?:;”"’')\]]$/.test(s)
}

/** Continuation that should be glued with NO space (orphaned punctuation). */
function startsWithOrphanPunct(block) {
  return /^[.,;:)\]]/.test(block.trimStart())
}

/** Continuation that should be glued with a space. */
function startsLower(block) {
  return /^[a-z(“"'’]/.test(block.trimStart())
}

/**
 * A paragraph that ends mid-clause. Pass 1 only merged when the CONTINUATION
 * started lowercase, so a split landing before a capital letter survived, e.g.
 *
 *     For comparison,
 *     <blank>
 *     Microsoft's most recently reported WUE was 0.27 litres per kilowatt hour.
 *
 * A humanness audit found these all over the corpus (stranded quote lead-ins,
 * paragraphs ending on a dangling "and"), so match on the LEFT side instead:
 * prose paragraphs do not end in a comma, a semicolon, or a conjunction.
 */
function endsMidClause(block) {
  const s = block.trimEnd()
  if (/[,;:]$/.test(s)) return true
  return /\b(?:and|or|but|with|of|to|in|for|as|that|which|than|from|by|at|the|a|an|is|are|was|were)$/i.test(s)
}

function repairBody(body) {
  const lines = body.split("\n")
  // Mask fenced regions so we never merge across/inside them.
  const inFence = new Array(lines.length).fill(false)
  let fence = false
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) {
      inFence[i] = true // the fence line itself
      fence = !fence
      continue
    }
    inFence[i] = fence
  }

  // Group into blocks (index ranges) separated by blank lines, outside fences.
  const blocks = []
  let cur = null
  for (let i = 0; i < lines.length; i++) {
    const blank = lines[i].trim() === "" && !inFence[i]
    if (blank) {
      if (cur) {
        blocks.push(cur)
        cur = null
      }
      continue
    }
    if (!cur) cur = { start: i, end: i, fenced: inFence[i] }
    cur.end = i
    if (inFence[i]) cur.fenced = true
  }
  if (cur) blocks.push(cur)

  const textOf = (b) => lines.slice(b.start, b.end + 1).join("\n")

  const merges = []
  for (let i = 1; i < blocks.length; i++) {
    const A = blocks[i - 1]
    const B = blocks[i]
    if (A.fenced || B.fenced) continue
    const a = textOf(A)
    const b = textOf(B)
    if (isStructural(a) || isStructural(b)) continue

    if (startsWithOrphanPunct(b)) {
      merges.push({ a: i - 1, b: i, glue: "" })
    } else if (!endsClosed(a) && startsLower(b)) {
      merges.push({ a: i - 1, b: i, glue: " " })
    } else if (endsMidClause(a)) {
      // Left-side match: the previous paragraph ends mid-clause, so whatever
      // follows is its continuation regardless of how it starts.
      merges.push({ a: i - 1, b: i, glue: " " })
    }
  }

  if (merges.length === 0) return { changed: false, body, merges: [] }

  // Apply by rebuilding: chain consecutive merges together.
  const mergeInto = new Map() // block index -> glue for joining to previous
  for (const m of merges) mergeInto.set(m.b, m.glue)

  const out = []
  let pending = null
  const flush = () => {
    if (pending !== null) out.push(pending)
    pending = null
  }
  for (let i = 0; i < blocks.length; i++) {
    const txt = textOf(blocks[i])
    if (mergeInto.has(i) && pending !== null) {
      const glue = mergeInto.get(i)
      pending = pending.trimEnd() + glue + txt.trimStart()
    } else {
      flush()
      pending = txt
    }
  }
  flush()

  return { changed: true, body: out.join("\n\n") + "\n", merges }
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort()
let totalMerges = 0
let touched = 0
const report = []

for (const f of files) {
  const p = path.join(DIR, f)
  const raw = fs.readFileSync(p, "utf8")
  // Split frontmatter (--- ... ---) from body; never touch frontmatter.
  const fm = raw.match(/^---\n[\s\S]*?\n---\n/)
  const head = fm ? fm[0] : ""
  const body = fm ? raw.slice(head.length) : raw

  const res = repairBody(body)
  if (!res.changed) continue
  touched++
  totalMerges += res.merges.length
  report.push({ file: f, merges: res.merges.length })
  if (WRITE) fs.writeFileSync(p, head + res.body)
}

console.log(`${WRITE ? "REPAIRED" : "DRY RUN"} — scanned ${files.length} posts`)
console.log(`files with citation splits: ${touched}`)
console.log(`total paragraph re-joins:   ${totalMerges}\n`)
report
  .sort((a, b) => b.merges - a.merges)
  .forEach((r) => console.log(`  ${String(r.merges).padStart(3)}  ${r.file}`))
if (!WRITE && touched) console.log(`\nRe-run with --write to apply.`)
