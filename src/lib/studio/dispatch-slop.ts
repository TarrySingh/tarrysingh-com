/**
 * Dispatch slop scanner — the enforcement half of the anti-LLM-smell contract.
 *
 * WHY THIS LIVES IN CODE AND NOT IN THE PROMPT
 * A corpus audit of 116 published Dispatches (2026-08-07) found that the
 * dominant tells were TAUGHT BY THE PROMPTS THEMSELVES. Both the backup-writer
 * system prompt and the Cowork runbook named their banned moves by quoting a
 * fluent example of each — and the model shipped the example:
 *
 *   prompt offered  "If I were on this board I would push for Y"  -> 64/116 files
 *   prompt offered  "Here's where it gets uncomfortable"          -> 20/116 files
 *   rotation text   "the honest measurement problem"              -> 26/116 files
 *
 * A negative instruction containing a fluent sentence is still a sentence in
 * context. So the rule is now: the PROMPT describes shapes to avoid and never
 * quotes one; the exact banned strings live HERE, where the model never reads
 * them and a regex can enforce them deterministically.
 *
 * Patterns below are the audit's confirmed findings, with the corpus counts
 * that justified each. High precision is the priority — a false positive on a
 * legitimate sentence is worse than a missed tell, because this runs on the
 * daily publish path.
 */

export interface SlopHit {
  /** Short id for logging/aggregation. */
  id: string
  /** What the writer did wrong, in one line. */
  label: string
  /** The offending text, trimmed for logs. */
  match: string
  /** Rough severity: 'hard' = never acceptable, 'soft' = allowed once. */
  severity: "hard" | "soft"
}

interface Rule {
  id: string
  label: string
  severity: "hard" | "soft"
  re: RegExp
  /** Allowed occurrences before it counts as a violation (soft rules). */
  allow?: number
}

const RULES: Rule[] = [
  // ── Tier 1: structural fingerprints ───────────────────────────────────
  {
    id: "counterfactual-seat",
    label: "counterfactual advisor frame (was 64/116 files)",
    severity: "hard",
    re: /\bif I (?:were|was|sat)\b[^.?!]{0,60}\b(?:on|in|at)\b[^.?!]{0,40}\b(?:board|committee|seat|table|chair)\b/gi,
  },
  {
    id: "wager-stake",
    label: "wager as the credibility move (was 63/116 files)",
    severity: "hard",
    re: /\b(?:I'?d|I would|I'?ll) (?:bet|wager|take the over)\b|\bbet against\b|\bmy stake (?:is|here)\b|\bthe calibrated bet\b/gi,
  },
  {
    id: "manufactured-suspense",
    label: "drum-roll pivot that withholds the point (was 73/116 files)",
    severity: "hard",
    re: /\bhere(?:'|’)?s (?:where|what|why|the thing|the catch|my)\b|\bhere is (?:where|what|why|the thing|the catch)\b|\bwhere it gets (?:uncomfortable|interesting|ugly|strange)\b/gi,
  },
  {
    id: "reader-imperative",
    label: "telling the reader to re-read or pause (was 54/116 files)",
    severity: "hard",
    re: /\bread (?:that|this|those|them) (?:again|twice|side by side|slowly)\b|\bsit with (?:that|this|it)\b|\blet (?:that|this) (?:sit|sink in|land)\b|\bline (?:them|those) up\b|\bstop and think about\b/gi,
  },
  {
    id: "verdict-heading",
    label: "section heading that announces your own verdict",
    severity: "hard",
    re: /^#{2,3}\s+(?:the stake|my stake|where I(?:'| w)|what I(?:'| w)|what I would|the verdict|my call|where I land)\b.*$/gim,
  },
  {
    // A deliberate Tarry-ism, so body use is allowed and rate-limited by the
    // runbook. What is NOT allowed is promoting it to a heading, which is how
    // it escaped its cap and reached 26 of 116 files.
    id: "signature-phrase-as-heading",
    label: "rate-limited signature phrase promoted to a heading",
    severity: "hard",
    re: /^#{2,3}\s+.*\b(?:the honest (?:measurement|reading|answer) problem|AI slop debt|geopatriation|centaur vs\.? autopilot)\b.*$/gim,
  },
  // ── Tier 2: rhythm tics ───────────────────────────────────────────────
  {
    id: "negation-substitution",
    label: "'it is not X. It is Y' rhythm (was 181 instances / 68 files)",
    severity: "soft",
    allow: 1,
    re: /\b(?:is|was|are|were|isn'?t|aren'?t)\s+not\s+[^.?!]{3,70}[.?!]\s+(?:It|They|That|This)\s+(?:is|are|was|were)\b/g,
  },
  {
    id: "announced-triad",
    label: "promising a count then enumerating it",
    severity: "soft",
    allow: 0,
    re: /\bthree things\b[^.?!]{0,50}\b(?:happened|matter|follow|stand out|are true)\b/gi,
  },
  {
    id: "watch-not",
    label: "'watch the X, not the Y' close",
    severity: "hard",
    re: /\bwatch the [^,.]{2,40}, not the\b/gi,
  },
  {
    id: "salt-ritual",
    label: "ritual vendor-discount clause",
    severity: "soft",
    allow: 0,
    re: /\b(?:pinch|grain|dose) of salt\b/gi,
  },
  // ── Numbers ───────────────────────────────────────────────────────────
  {
    // Only fires on an UNCITED decimal. A figure sitting next to a source link
    // must keep its precision: rounding "31.5%" to "about a third" beside a live
    // citation destroys the claim, which is exactly the damage a 2026-08-08
    // rewrite pass did before this carve-out existed. Precision next to a source
    // is correct writing, not a tell.
    id: "decimal-percent",
    label: "false-precision decimal percentage with no source attached",
    severity: "soft",
    allow: 0,
    re: /(?![^\n]*\]\(https?:)(?![^\n]*\bhttps?:\/\/)^[^\n]*?\b\d+\.\d+\s?%[^\n]*$/gm,
  },
  {
    id: "percent-chain",
    label: "three or more percentages in one sentence",
    severity: "soft",
    allow: 0,
    re: /[^.?!]*?\d+\s?%[^.?!]*?\d+\s?%[^.?!]*?\d+\s?%[^.?!]*[.?!]/g,
  },
  // ── Assistant register / paste artefacts (instant fail) ───────────────
  {
    id: "assistant-register",
    label: "assistant-register leak",
    severity: "hard",
    re: /\bI hope this helps\b|\bfeel free to reach out\b|\bas an AI\b|\bas of my last update\b|\[insert [^\]]+\]/gi,
  },
  {
    id: "paste-artifact",
    label: "chat paste artefact",
    severity: "hard",
    re: /contentReference|oai_citation|oaicite|turn\d+search\d+|grok_render|attributableIndex|【|】/g,
  },
]

/** Percent-style consistency is a document-level check, not a regex-per-hit. */
function percentStyleMixed(text: string): boolean {
  const styles = [/\d\s?%/.test(text), /\bper cent\b/i.test(text), /\bpercent\b/i.test(text)]
  return styles.filter(Boolean).length > 1
}

/**
 * Scan a finished Dispatch body. Returns every violation found.
 * Pure and side-effect free — callers decide whether to warn, repair, or block.
 */
export function scanDispatchSlop(text: string): SlopHit[] {
  const hits: SlopHit[] = []
  // Ignore fenced code (mermaid, yaml, shell) — diagram syntax is not prose.
  const prose = text.replace(/```[\s\S]*?```/g, "")

  for (const rule of RULES) {
    const found = prose.match(rule.re)
    if (!found) continue
    const allow = rule.allow ?? 0
    const over = found.slice(allow)
    for (const m of over) {
      hits.push({
        id: rule.id,
        label: rule.label,
        severity: rule.severity,
        match: m.replace(/\s+/g, " ").trim().slice(0, 120),
      })
    }
  }

  if (percentStyleMixed(prose)) {
    hits.push({
      id: "percent-style-mixed",
      label: "mixes %, 'per cent' and 'percent' in one piece (was 37/116 files)",
      severity: "soft",
      match: "document-level",
    })
  }

  // Em-dashes: ZERO, per the binding anti-slop contract (Tarry, 2026-08-07:
  // "we need to adhere to anti-slop"). This supersedes the runbook's old
  // one-per-150-words budget, which the corpus was running at double.
  // URLs legitimately contain "--" (e.g. a slug like ".../rubin--six-new-chips"),
  // so strip link targets before looking for a double-hyphen standing in for an
  // em-dash. Without this the gate reports false positives on correctly-cited
  // articles, and a noisy gate is a bypassed gate.
  const proseNoUrls = prose.replace(/https?:\/\/[^\s)\]]+/g, "")
  const dashes = (proseNoUrls.match(/—/g) ?? []).length
  const fauxDashes = (proseNoUrls.match(/(?<!-)--(?!-)/g) ?? []).length
  if (dashes + fauxDashes > 0) {
    hits.push({
      id: "em-dash",
      label: "em-dash present (contract requires zero; the #1 tell)",
      severity: "hard",
      match: `${dashes} em-dashes${fauxDashes ? ` + ${fauxDashes} double-hyphen` : ""}`,
    })
  }

  return hits
}

/** One-line summary for logs and the approval email. */
export function summariseSlop(hits: SlopHit[]): string {
  if (hits.length === 0) return "clean"
  const byId = new Map<string, number>()
  for (const h of hits) byId.set(h.id, (byId.get(h.id) ?? 0) + 1)
  return [...byId.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => `${id}×${n}`)
    .join(", ")
}
