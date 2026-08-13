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

/**
 * The STATISTIC DUMP: several figures stacked with nothing between them, each
 * sentence shaped [number][verb][outcome], source dropped in afterwards. Tarry
 * flagged it 2026-08-09 ("really bad") and it is the most common way the blog
 * stops sounding human. Two document-level signals, because it is a property of
 * a paragraph rather than of any single phrase.
 */
const PCT =
  /\d[\d.,]*\s?(?:per cent|%)|(?:one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[a-z-]*\s(?:per cent|%)/gi

/**
 * Any HARD FIGURE: a percentage, a currency amount, a multiplier, or a number
 * carrying a scale word, a unit, or a thousands separator.
 *
 * This rule used to count PERCENTAGES ONLY, and so it was measuring the wrong
 * thing. Tarry pointed at /blog/kilometre-between-certificate-payroll on
 * 2026-08-13 as an example of the disease; the gate had never flagged it,
 * because its worst paragraph stacks eleven figures of which exactly one is a
 * percentage (1.87 million registrations, 774 local government areas, 135,000
 * fellows, 99.6%, 9,000 trained, a target of 7,000, 86,000 engagements,
 * NGN 150,000/month, 3,000 fellows, 3,000 more placements).
 *
 * Bare small integers are deliberately NOT counted. "three cohorts" and "six
 * colleges" are ordinary English, not statistics, and counting them would make
 * the gate noisy enough to be ignored.
 */
const HARD_FIGURE =
  /\d[\d.,]*\s?%|[$€£₩¥₦]\s?\d[\d.,]*(?:\s?(?:million|billion|trillion|thousand))?|\d[\d.,]*\s?x\b|\d[\d.,]*\s?(?:million|billion|trillion|thousand)\b|\b\d{1,3}(?:,\d{3})+\b|\d[\d.,]*\s?(?:GW|MW|kW|TWh|GB|TB|PB|percentage points?|megawatts?|gigawatts?|kilowatts?|tokens?|parameters?|hours?|minutes?|seconds?)\b/gi

function statDumpParagraphs(text: string): number {
  return text
    .split(/\n\s*\n/)
    .filter((p) => {
      const t = p.trim()
      if (t.length < 120 || /^[#>|\-*!]/.test(t)) return false
      // Either signal counts: four hard figures of any kind, or three
      // percentages (which reads as a dump even in a shorter paragraph).
      return (t.match(HARD_FIGURE) ?? []).length >= 4 || (t.match(PCT) ?? []).length >= 3
    }).length
}

/**
 * NUMERIC NOTATION (Tarry, 2026-08-13: "when we speak of numbers, signs,
 * currency, percentages, they should be written in their mathematical form,
 * not prose"). Scanned against RAW text so the title and excerpt are in scope,
 * which is where the worst offender lived: "Forty Per Cent Escalated to the
 * Board" shipped as a headline.
 *
 * NOTE ON A RULE THAT WAS DELETED HERE. This file used to carry a hard
 * `number-opens-sentence` check. It was wrong: it flagged "40% of the
 * escalations reached the board", which is the form Tarry names as correct.
 * Worse, the same ban in the writer prompt is what CAUSED the disease, since a
 * model forbidden from opening on a numeral spells the numeral out to comply.
 * Stacking is still caught, by `statistic-dump`, which is the real defect.
 */
const NUMWORD =
  "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|" +
  "fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety"

/** Vague quantifiers legitimately precede a scale word: "a few thousand engineers". */
const VAGUE = "(?:a |an )?(?:few|couple of|couple|several|many|dozens? of|tens of|hundreds of|thousands of|millions of|billions of) $"

const NUMERIC_RULES: { id: string; label: string; re: RegExp; guard?: RegExp }[] = [
  {
    id: "spelled-quantity",
    label: "quantity spelled out with a scale word (house style is digits: 20,000 GPUs, $80 billion)",
    re: new RegExp(`\\b(?:${NUMWORD})(?:[- ](?:and[- ])?(?:${NUMWORD}))*\\s+(?:hundred|thousand|million|billion|trillion)\\b`, "gi"),
    guard: new RegExp(VAGUE, "i"),
  },
  {
    id: "spelled-unit",
    label: "numeral spelled out next to a measured unit (house style is digits: 42 megawatts, 40 percentage points)",
    re: new RegExp(
      `\\b(?:${NUMWORD})(?:[- ](?:and[- ])?(?:${NUMWORD}))*\\s+` +
        `(?:percentage points?|gigawatts?|megawatts?|kilowatts?|terawatt-hours?|GW|MW|kW|TWh|` +
        `gigabytes?|terabytes?|petabytes?|GB|TB|PB|kilometres?|kilometers?|metres?|meters?|miles?|` +
        `kilograms?|tonnes?|seconds?|minutes?|hours?|milliseconds?|parameters?|tokens?|GPUs?)\\b`,
      "gi",
    ),
    guard: new RegExp(VAGUE, "i"),
  },
  {
    id: "currency-as-word",
    label: "currency written as a word after the numeral (house style is the symbol: $2.7 billion)",
    // `\d[\d.,]*` and not `[\d.,]+`: the looser class matches a bare comma, so
    // "the contract, won by Samsung" was reported as a currency violation.
    re: /\b\d[\d.,]*\s+(?:hundred|thousand|million|billion|trillion\s+)?\s*(?:dollars|euros|pounds|yen|won)\b/gi,
  },
  {
    id: "spelled-multiplier",
    label: "multiplier spelled out (house style is Nx: 2.5x, 15x)",
    re: new RegExp(`\\b(?:${NUMWORD})(?:[- ](?:and[- ])?(?:${NUMWORD}))*\\s+times\\s+(?:more|less|faster|slower|higher|lower|bigger|larger|smaller|the\\b)`, "gi"),
  },
  {
    id: "us-date-order",
    label: "US date order (house style is 27 May 2026: day, month, year, no comma)",
    re: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4}\b/g,
  },
]

/**
 * The EXCERPT is the most-read sentence on the site: it is the /blog card, the
 * meta description and the social image. It sits in frontmatter, which the body
 * scan strips, so a statistic-led excerpt survived every earlier pass and was
 * caught by Tarry reading the live page. Scan it explicitly.
 * Only a SURVEY STATISTIC counts here: a count of concrete things ("Four US
 * banks...", "Two energy curves...") is legitimate and often the better opening.
 */
const EXCERPT_OPENS_ON_STAT =
  /^excerpt:\s*"(?:\d[\d.,]*|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Twenty|Thirty|Forty|Fifty|Sixty|Seventy|Eighty|Ninety)[a-z-]*\s?(?:per cent|%)/im

/**
 * House style is the % SYMBOL, always (Tarry, 2026-08-10, with examples:
 * "62 per cent of organisations" BAD, "62% of organisations" GOOD; the same for
 * titles). So this is no longer a consistency check: the spelled-out forms are
 * simply wrong, wherever they appear, including frontmatter.
 */
function spelledOutPercent(text: string): number {
  const scannable = text
    // A Gartner URL slug reads ".../predicts-40-percent-of-enterprise-apps".
    // Hyphens are word boundaries, so the naive pattern reported every cited
    // source as a style violation. Link targets are not prose.
    .replace(/https?:\/\/[^\s)\]]+/g, "")
    .replace(/`[^`\n]*`/g, "")
  // Only flag the word when a FIGURE is attached, which is the banned form.
  // Bare "percent" and "percentage" are ordinary nouns with no numeral to
  // convert: "a few percent", "what percentage of spend", "tens of percent".
  // "percentage point" and "percentile" are different units and stay as words.
  const attached =
    /(?:\d[\d.,]*|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[- ](?:and[- ])?(?:one|two|three|four|five|six|seven|eight|nine|ten))*)[\s-]*per\s?cent(?!age|ile)\b/gi
  return (scannable.match(attached) ?? []).length
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

  const dumps = statDumpParagraphs(prose)
  if (dumps > 0) {
    hits.push({
      id: "statistic-dump",
      label: `${dumps} paragraph(s) stack 4+ hard figures, lead with the meaning, one figure per sentence`,
      severity: "hard",
      match: `${dumps} paragraphs`,
    })
  }
  // Numeric notation, scanned against RAW text so the title and excerpt are in
  // scope. Frontmatter is where the headline offender lived and where the body
  // scan cannot reach.
  for (const rule of NUMERIC_RULES) {
    for (const m of text.match(rule.re) ?? []) {
      // A vague quantifier ahead of the match makes it legitimate English:
      // "a few thousand engineers" is not a spelled-out quantity.
      const at = text.indexOf(m)
      if (rule.guard && at > 0 && rule.guard.test(text.slice(Math.max(0, at - 24), at))) continue
      // A Title Case run running into another capitalised word is a NAME, not
      // a figure. Nigeria's "Three Million Technical Talent programme" is what
      // the programme is called; reporting it as a style violation invites the
      // next sweep to rename an institution, which is a factual error.
      if (at >= 0 && /^[A-Z]/.test(m) && /^\s+[A-Z]/.test(text.slice(at + m.length, at + m.length + 3))) continue
      hits.push({
        id: rule.id,
        label: rule.label,
        severity: "hard",
        match: m.replace(/\s+/g, " ").trim().slice(0, 70),
      })
    }
  }

  // Checked against the RAW text so the title and excerpt are in scope.
  const spelled = spelledOutPercent(text)
  if (spelled > 0) {
    hits.push({
      id: "spelled-out-percent",
      label: `"per cent" written out ${spelled}x — house style is the % symbol everywhere, including title and excerpt`,
      severity: "hard",
      match: `${spelled} occurrences`,
    })
  }

  // Em-dashes: ZERO, per the binding anti-slop contract (Tarry, 2026-08-07:
  // "we need to adhere to anti-slop"). This supersedes the runbook's old
  // one-per-150-words budget, which the corpus was running at double.
  // URLs legitimately contain "--" (e.g. a slug like ".../rubin--six-new-chips"),
  // so strip link targets before looking for a double-hyphen standing in for an
  // em-dash. Without this the gate reports false positives on correctly-cited
  // articles, and a noisy gate is a bypassed gate.
  const proseNoUrls = prose
    .replace(/https?:\/\/[^\s)\]]+/g, "")
    // Indented (4-space) code blocks are not caught by the fence strip above,
    // and shell examples legitimately contain long flags such as "-- --run" or
    // "--model_args". A CLI flag is not an em-dash substitute.
    .replace(/^ {4,}.*$/gm, "")
    .replace(/`[^`\n]*`/g, "")
    .replace(/--(?=[A-Za-z])/g, "")
  const dashes = (proseNoUrls.match(/—/g) ?? []).length
  const fauxDashes = (proseNoUrls.match(/(?<!-)--(?!-)/g) ?? []).length
  // HTML-ENTITY em-dashes render exactly like the literal character but were
  // invisible to every pass, because the sweep and this gate both searched for
  // the character itself. Found on 2026-08-13 by scanning the LIVE pages rather
  // than the source: /blog/your-ai-doesn-t-discover-anything-here-s showed a
  // dash the file scan swore was not there. It was `&#8212;` in an instrument
  // caption. A repo-wide count then turned up 580 more.
  const entityDashes = (proseNoUrls.match(/&mdash;|&#8212;|&#x2014;/gi) ?? []).length
  if (dashes + fauxDashes + entityDashes > 0) {
    hits.push({
      id: "em-dash",
      label: "em-dash present (contract requires zero; the #1 tell)",
      severity: "hard",
      match: `${dashes} em-dashes${fauxDashes ? ` + ${fauxDashes} double-hyphen` : ""}${entityDashes ? ` + ${entityDashes} HTML-entity` : ""}`,
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
