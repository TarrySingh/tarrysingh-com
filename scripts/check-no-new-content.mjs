/**
 * NO-NEW-CONTENT-WORDS gate.
 *
 * The statistic-dump rewrite failed three times. The first two deleted figures.
 * The third, forbidden from deleting, INVENTED instead: ~117 new facts and
 * causal claims, e.g. "which is what puts each siting decision in front of a
 * state legislature rather than a single federal regulator" bolted onto a
 * sentence that had made no jurisdictional claim at all.
 *
 * An agent cannot add meaning it has no source for. So the next attempt is
 * SPLIT-ONLY: reorder and re-punctuate what is already on the page, adding
 * nothing but function words. That constraint is mechanically checkable, which
 * is the whole point: every CONTENT word in the new text must already appear in
 * the old text.
 *
 * Usage:  node no-new-content.mjs <fileA.mdx> [more...]   (compares to git HEAD)
 */
import fs from "node:fs"
import { execSync } from "node:child_process"

/** Words an editor may freely add while splitting a sentence. */
const FUNCTION_WORDS = new Set(`
a an the this that these those there here
and or but nor yet so then also
of in on at to for from by with without into onto over under across through
is are was were be been being am
has have had having do does did doing done will would can could shall should may might must
it its it's they them their theirs he she his her him hers we us our ours you your
who whom whose which what when where why how
not no nor only just even still already again more most less least
as than if while whereas though although because since until when
one two three four five six seven eight nine ten
first second third next last other another same such own
own each every both all any some many few several
own s t re ve ll d m
`.trim().split(/\s+/))

/** Everything the editor is NOT allowed to introduce: causal and evaluative glue. */
const BANNED_NEW = new Set([
  "because", "therefore", "thus", "hence", "consequently", "means", "meaning",
  "implies", "suggests", "shows", "proves", "explains", "why", "reason",
  "deliberately", "on purpose", "intentionally", "rather",
])

const norm = (s) =>
  s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^---[\s\S]*?\n---\n/, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // keep link TEXT, drop target
    .replace(/[*_`>#|]/g, " ")
    .toLowerCase()

const contentWords = (s) => {
  const out = new Map()
  // Trailing punctuation must NOT ride along inside a numeric token. Splitting
  // a sentence turns "2026," into "2026.", and the first version of this gate
  // reported that as a lost word plus a changed figure set on 4 of 5 pilot
  // files. That is the gate misreading a full stop, not the editor losing a
  // fact, and a gate that cries wolf gets switched off.
  for (const w0 of norm(s).match(/[a-z][a-z'-]*|\d[\d.,]*%?/g) ?? []) {
    const w = w0.replace(/[.,]+$/, "")
    if (!w) continue
    if (FUNCTION_WORDS.has(w)) continue
    out.set(w, (out.get(w) ?? 0) + 1)
  }
  return out
}

let bad = 0
for (const f of process.argv.slice(2)) {
  const now = fs.readFileSync(f, "utf8")
  const rel = f.replace(/^.*?(content\/blog\/)/, "$1")
  let head
  try {
    head = execSync(`git show HEAD:${rel}`, { encoding: "utf8", maxBuffer: 1 << 26 })
  } catch {
    console.log(`  SKIP ${rel} (not in HEAD)`)
    continue
  }
  const a = contentWords(head)
  const b = contentWords(now)

  const added = [...b.keys()].filter((w) => !a.has(w))
  const lost = [...a.keys()].filter((w) => !b.has(w))
  const bannedAdded = added.filter((w) => BANNED_NEW.has(w))

  // figures must survive exactly
  const figs = (s) =>
    (norm(s).match(/\d[\d.,]*\s?%|\d[\d.,]+|\d/g) ?? [])
      .map((x) => x.replace(/[.,]+$/, ""))
      .sort()
      .join(" ")
  const figsSame = figs(head) === figs(now)

  const ok = added.length === 0 && lost.length === 0 && figsSame
  if (!ok) bad++
  console.log(`${ok ? "  OK  " : "  FAIL"} ${rel.replace("content/blog/", "")}`)
  if (added.length) console.log(`        + new words (${added.length}): ${added.slice(0, 14).join(" ")}`)
  if (bannedAdded.length) console.log(`        !! CAUSAL GLUE ADDED: ${bannedAdded.join(" ")}`)
  if (lost.length) console.log(`        - lost words (${lost.length}): ${lost.slice(0, 14).join(" ")}`)
  if (!figsSame) console.log(`        !! FIGURE SET CHANGED`)
}
console.log(`\n${bad} file(s) failed the no-new-content gate`)
process.exit(bad ? 1 : 0)
