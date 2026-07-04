#!/usr/bin/env node
/**
 * Anti-LLM-smell scanner. Single source of truth for the pre-commit gate AND the
 * weekly watch cron. Enforces the contract in
 *   ~/.claude/.../memory/feedback_anti_llm_smell_contract.md
 *
 * Usage:
 *   node scripts/check-llm-smell.mjs <file...>      # scan specific files (gate)
 *   node scripts/check-llm-smell.mjs --all          # scan all content/insights/*.mdx
 *   node scripts/check-llm-smell.mjs --full <file>  # also flag the softer tells (report)
 *
 * Exit 0 = clean, 1 = violations found (so a git hook can block the commit).
 *
 * Two tiers on purpose: HARD = high-confidence AI-only tells that almost never
 * appear in good human prose (used by the blocking gate, low false-positive).
 * SOFT = adds the borderline filler words (used by --full reporting only).
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const full = args.includes("--full");
const all = args.includes("--all");
let files = args.filter((a) => !a.startsWith("--"));

if (all) {
  // tarrysingh-com port: the Engine Room (Plate V) is the gated surface.
  // Upstream (single source of truth): realai-v2/scripts/check-llm-smell.mjs.
  const dirs = ["src/components/loop", "src/app/synaptic/loop-harness", "content/loop-harness"];
  files = dirs.flatMap((rel) => {
    const dir = path.join(process.cwd(), rel);
    return fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => (f.endsWith(".mdx") || f.endsWith(".tsx") || f.endsWith(".ts")) && !f.startsWith("_")).map((f) => path.join(rel, f))
      : [];
  });
}

if (files.length === 0) {
  console.log("check-llm-smell: nothing to scan. Pass files, or --all.");
  process.exit(0);
}

// HARD tells — block on these. Word-boundary, case-insensitive.
const HARD_WORDS = [
  "delve", "delving", "tapestry", "testament", "leverage", "leveraging", "robust",
  "seamless", "seamlessly", "bedrock", "backbone", "cornerstone", "paradigm",
  "holistic", "synergy", "multifaceted", "underscore", "underscores", "underscoring",
  "showcase", "showcasing", "foster", "facilitate", "utilize", "pivotal", "beacon",
  "ever-evolving", "deceptively", "unpack", "ascertain", "intricate", "meticulous",
  "meticulously", "mosaic", "labyrinth", "cacophony", "kaleidoscope", "odyssey",
];
// SOFT tells — report only (too common to safely block).
const SOFT_WORDS = [
  "realm", "landscape", "navigate", "navigating", "unlock", "unleash", "harness",
  "empower", "elevate", "crucial", "vital", "essential", "myriad", "plethora",
  "fast-paced", "increasingly", "notably", "importantly", "crucially",
  "fundamentally", "ultimately", "moreover", "furthermore", "garner", "boasts",
  "bolstered", "vibrant", "interplay", "core", "modern", "cutting-edge", "world-class",
];
// Phrase patterns (regex). Negative lookbehind keeps "where is the" out of "here is the".
const PHRASES = [
  /it['’]s not just[^.?!]{0,40}it['’]s/i,
  /isn['’]t about[^.?!]{0,40}it['’]s/i,
  /here['’]s the\b/i,
  /(?<![a-z])here is the\b/i,
  /the uncomfortable (truth|inversion)/i,
  /make no mistake/i,
  /in conclusion/i, /to sum up/i, /at the end of the day/i, /that said,/i,
  /it['’]s worth noting/i, /needless to say/i,
  /anything but easy/i,
];

const wordRe = (list) => new RegExp(`\\b(${list.join("|")})\\b`, "i");
const hardRe = wordRe(HARD_WORDS);
const softRe = wordRe(SOFT_WORDS);

let total = 0;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  // Prose files (.mdx) get the full word/phrase contract. Code files (.tsx/.ts)
  // are gated on the em-dash character only — an em-dash never belongs in our
  // rendered component text, but the word list would false-positive on code.
  const isProse = file.endsWith(".mdx");
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const hits = [];
  lines.forEach((line, i) => {
    const n = i + 1;
    if (line.trim() === "---" || line.trim() === "***") return; // frontmatter / HR
    if (line.includes("—")) hits.push([n, "em-dash —"]);
    if (!isProse) return; // code files: em-dash check only
    if (/\s--\s/.test(line)) hits.push([n, "double-hyphen --"]);
    const hw = line.match(hardRe);
    if (hw) hits.push([n, `word "${hw[1]}"`]);
    for (const p of PHRASES) { const m = line.match(p); if (m) hits.push([n, `phrase "${m[0].trim()}"`]); }
    if (full) { const sw = line.match(softRe); if (sw) hits.push([n, `soft "${sw[1]}"`]); }
  });
  if (hits.length) {
    total += hits.length;
    console.log(`\n✖ ${file}  (${hits.length})`);
    for (const [n, what] of hits) console.log(`    ${String(n).padStart(4)}: ${what}`);
  }
}

if (total) {
  console.log(`\nLLM-smell: ${total} violation(s) across ${files.length} file(s).`);
  console.log("Rewrite the lines (do not blind-replace). Contract: feedback_anti_llm_smell_contract.md");
  console.log("Override for a deliberate exception: git commit --no-verify");
  process.exit(1);
}
console.log(`LLM-smell: clean across ${files.length} file(s).`);
process.exit(0);
