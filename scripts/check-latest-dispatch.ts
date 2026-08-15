/**
 * Check the newest Dispatch, in the source AND on the live page.
 *
 * Written after a run of regressions that the source alone could not have
 * caught. Between 2026-08-13 and 2026-08-15 the corpus reported clean four
 * separate times while production disagreed:
 *
 *   - HTML entities (`&#8212;`) render as an em-dash and hide from a search
 *     for the character
 *   - a comment mask swallowed 6,441 characters of a component, so the sweep
 *     declared the file clean
 *   - `git grep -E` silently ignores a (?!...) lookahead and returns nothing
 *   - a CDN `x-vercel-cache: HIT` served a half-updated page
 *
 * So this checks both sides and says which one it is looking at. The excerpt
 * matters most: it is the /blog card, the meta description and the social
 * image, and five consecutive Dispatches shipped an em-dash there while the
 * body stayed clean.
 *
 * Usage:
 *   npm run blog:today            # newest post by frontmatter date
 *   npm run blog:today -- <slug>  # a specific one
 */
import fs from "node:fs"
import path from "node:path"
import { scanDispatchSlop } from "../src/lib/studio/dispatch-slop"

const DIR = "content/blog"
const SITE = "https://www.tarrysingh.com"

const arg = process.argv[2]

function newest(): string {
  const rows = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const src = fs.readFileSync(path.join(DIR, f), "utf8")
      const d = /^date:\s*"?([0-9-]+)"?/m.exec(src)?.[1] ?? ""
      const draft = /^draft:\s*true/m.test(src)
      return { f, d, draft }
    })
    .filter((r) => r.d && !r.draft)
    .sort((a, b) => (a.d < b.d ? 1 : -1))
  return rows[0].f
}

const file = arg ? (arg.endsWith(".mdx") ? arg : `${arg}.mdx`) : newest()
const slug = file.replace(/\.mdx$/, "")
const src = fs.readFileSync(path.join(DIR, file), "utf8")
const date = /^date:\s*"?([0-9-]+)"?/m.exec(src)?.[1] ?? "?"
const excerpt = /^excerpt:\s*"([\s\S]*?)"\s*$/m.exec(src)?.[1] ?? ""
const words = src.replace(/^---[\s\S]*?\n---\n/, "").split(/\s+/).filter(Boolean).length

console.log(`\n${slug}\n  date ${date}   ${words} words\n`)

// ── SOURCE ───────────────────────────────────────────────────────────────
/**
 * Rules that measure CADENCE rather than a contract breach. These are counted
 * and shown, but they do not fail the post.
 *
 * `anaphoric-couplet` is denser in Tarry's hand-written cohort (0.37 per 1000
 * words) than in the auto-writer's (0.23), so it reads as his house style, not
 * a pipeline artefact. `statistic-dump` fires on any paragraph with four or
 * more figures, and most of those are ordinary analytical prose. Failing a post
 * on either would mean every post fails, and a gate that always fails is a gate
 * nobody reads.
 */
const HOUSE_STYLE = new Set([
  "anaphoric-couplet", "statistic-dump", "negation-substitution",
  "fragment-paragraph", "staccato-stack", "anaphora-run", "colon-reveal",
  "decimal-percent", "percent-chain", "uniform-cadence",
])

const hits = scanDispatchSlop(src)
const breaches = hits.filter((h) => h.severity === "hard" && !HOUSE_STYLE.has(h.id))
const cadence = hits.filter((h) => HOUSE_STYLE.has(h.id))

console.log("SOURCE")
if (!breaches.length) console.log("  no contract breaches")
for (const h of breaches) console.log(`  BREACH  ${h.id.padEnd(22)} ${h.match.slice(0, 60)}`)
if (cadence.length) {
  const by = new Map<string, number>()
  for (const h of cadence) by.set(h.id, (by.get(h.id) ?? 0) + 1)
  console.log(`  cadence (informational): ${[...by].map(([k, n]) => `${k}×${n}`).join(", ")}`)
}

// The excerpt is checked on its own because the body scan strips frontmatter,
// which is exactly how five excerpt em-dashes reached production unnoticed.
const exDash = (excerpt.match(/—|&mdash;|&#8212;/g) ?? []).length
const exPct = (excerpt.match(/\d[\s-]*per ?cent(?!age|ile)/gi) ?? []).length
console.log(`\nEXCERPT  ${exDash === 0 && exPct === 0 ? "clean" : `em-dash=${exDash} spelled-percent=${exPct}`}`)
console.log(`  "${excerpt.slice(0, 150)}${excerpt.length > 150 ? "…" : ""}"`)

async function main() {
  // ── LIVE ─────────────────────────────────────────────────────────────────
  const url = `${SITE}/blog/${slug}?v=${Date.now()}`
  let live = ""
  let cache = "?"
  try {
    const res = await fetch(url, { headers: { "cache-control": "no-cache" } })
    cache = res.headers.get("x-vercel-cache") ?? "?"
    live = await res.text()
  } catch (err) {
    console.log(`\nLIVE  fetch failed: ${(err as Error).message}`)
  }

  if (live) {
    const text = live
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
    const em = (text.match(/—/g) ?? []).length
    const pct = (text.match(/(?:\d[\d.,]*|\bone|two|three|four|five|ten|twenty|thirty|forty|fifty|hundred)[\s-]*per ?cent(?!age|ile)/gi) ?? []).length
    const cur = (text.match(/\d[\d.,]*\s+(?:hundred|thousand|million|billion|trillion)?\s*(?:dollars|euros|pounds)\b/gi) ?? []).length
    const ok = em === 0 && pct === 0 && cur === 0
    console.log(`\nLIVE  (x-vercel-cache: ${cache})`)
    console.log(`  ${ok ? "clean" : "VIOLATIONS"}  em-dash=${em}  spelled-percent=${pct}  currency-as-word=${cur}`)
    if (em) for (const m of text.match(/.{50}—.{40}/g)?.slice(0, 3) ?? []) console.log(`    ${m.trim()}`)
    // A source/live disagreement almost always means a stale deploy, not a
    // content bug. Say so rather than reporting a false regression.
    const srcDash = (src.replace(/```[\s\S]*?```/g, "").match(/—/g) ?? []).length
    if (em !== srcDash) {
      console.log(`  NOTE source has ${srcDash} em-dash(es) but the page shows ${em}.`)
      console.log(`       Deploy is probably still building. Re-run in a few minutes.`)
    }
  }

  // The verdict turns on contract breaches and the excerpt only. Cadence is
  // reported for the record, never used to fail the post.
  const pass = breaches.length === 0 && exDash === 0 && exPct === 0
  console.log(`\n${pass ? "PASS" : "NEEDS A LOOK"}   ${breaches.length} breach(es), ${cadence.length} cadence hit(s)\n`)
  process.exit(pass ? 0 : 1)
}

main()
