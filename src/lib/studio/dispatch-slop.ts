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
  // ── Tier 3: the 2026-08-15 source sweep ───────────────────────────────
  // Added after a deep pull across Wikipedia "Signs of AI writing", tropes.fyi,
  // Doherty's field guide, Peter Yang's /no-ai-slop, Momentic's 34-types, The
  // Conversation's linguistics of stylistic negation, and the HN/X discourse.
  // Each of these is a rhetorical MOVE rather than a vocabulary item, which is
  // why none of the word lists were catching them.
  {
    // tropes.fyi "Not X. Not Y. Just Z." — the dramatic countdown. A sibling of
    // negation-substitution that our existing rule cannot see because it
    // negates twice before landing.
    id: "dramatic-countdown",
    label: "'Not X. Not Y. Just Z.' countdown",
    severity: "hard",
    re: /\bNot\s+[^.?!]{2,40}\.\s+Not\s+[^.?!]{2,40}\.\s+(?:Just|Only|Simply)\b/g,
  },
  {
    // tropes.fyi "The X? A Y." — a question the writer asks themselves purely
    // to answer it. "The result? Devastating."
    id: "rhetorical-qa",
    label: "self-posed question answered immediately",
    severity: "hard",
    re: /(?:^|[.!?]\s)(?:The|Their|Its|His|Her|My|Our|Your)\s+\w+(?:\s+\w+){0,2}\?\s+[A-Z][^.?!]{2,50}\./gm,
  },
  {
    // Peter Yang's "colon reveal" — a short setup, a colon, a payoff. Reads as
    // a slide bullet rather than a sentence.
    id: "colon-reveal",
    label: "short colon reveal used as a punchline",
    severity: "soft",
    allow: 0,
    // Tight on BOTH halves, and the payoff may not contain a comma. A colon
    // introducing a real explanation ("That figure matches neither measure: the
    // US is about 26% nominal and ~15% PPP") is correct punctuation, not a
    // punchline, and an earlier looser pattern reported it.
    re: /(?:^|[.!?]\s)[A-Z][^.?!:,\n]{4,28}:\s+[a-z][^.?!,\n]{2,30}\./gm,
  },
  {
    // tropes.fyi "False Exclusivity" + Yang's "faux-insight setup". Claims a
    // secret in order to manufacture value, and adds nothing.
    id: "faux-insight",
    label: "claiming nobody says this, to manufacture value",
    severity: "hard",
    re: /\b(?:what )?(?:nobody|no one|few people|almost nobody) (?:talks about|is talking about|tells you|will tell you|mentions|wants to (?:say|admit))\b|\bthe part (?:everyone|nobody) (?:misses|gets wrong|talks about)\b|\bwhat they don'?t tell you\b/gi,
  },
  {
    // tropes.fyi "The Truth Is Simple" — asserting obviousness instead of
    // demonstrating it.
    id: "asserted-obviousness",
    label: "asserting the point is simple instead of proving it",
    severity: "hard",
    re: /\bthe (?:truth|reality|answer|maths?|math) (?:is|here is) (?:simple|simpler|straightforward|obvious)\b|\bit'?s (?:that|really that) simple\b/gi,
  },
  {
    // Wikipedia "outline-like conclusions" — the formula that raises problems
    // only to wave them away.
    id: "despite-challenges",
    label: "'despite these challenges' dismissal formula",
    severity: "hard",
    re: /\bdespite (?:these|its|the|those|such) (?:challenges|obstacles|limitations|concerns|headwinds|setbacks)\b/gi,
  },
  {
    // Momentic "manufactured vulnerability" — performed candour as a
    // credibility move.
    id: "performed-candour",
    label: "performed candour ('I'll be honest')",
    severity: "soft",
    allow: 0,
    re: /\b(?:I'?ll be honest|let me be honest|let'?s be honest|full disclosure|I'?ll admit it|if I'?m being honest)\b/gi,
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

/* ═══════════════════════════════════════════════════════════════════════════
 * THE SMELL CATCHER — cadence and structure, not vocabulary.
 *
 * WHY THIS EXISTS (Tarry, 2026-08-15: "we really really want our writing to
 * look human"). Every rule above this line matches a STRING. That is a losing
 * game on its own: the field has moved, and the 2026 detection research is
 * unanimous that structure beats vocabulary. StoryScope (UMD + DeepMind)
 * classifies AI prose at 93.2% accuracy using NO word analysis at all, and the
 * commercial detectors score "burstiness" — the standard deviation of sentence
 * length — as a primary feature. A draft can pass every word list we own and
 * still read as a machine wrote it, because the tell is the rhythm.
 *
 * The specimen that prompted this, from the live site
 * (/blog/the-agents-you-cannot-name):
 *
 *     "You approved a pilot. You are financing a liability."
 *
 * Two short sentences, same opening word, the second reframing the first as
 * worse. Note what it is NOT: it is not "it's not X, it's Y". Our
 * `negation-substitution` rule cannot see it, because nothing is negated. It is
 * the AFFIRMATIVE sibling of that construction, and it is currently the more
 * fashionable of the two precisely because writers have been trained to strip
 * the negated form. Catching only the negated half was leaving the front door
 * open.
 *
 * Thresholds below are calibrated against the 119-post corpus, not guessed.
 * Per the contract's §5b discipline: a noisy gate is a bypassed gate, so
 * anything that could not be driven to high precision ships `soft` (reports,
 * never blocks) or stays in the contract for human reading only.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Sentence-final abbreviations that must not end a sentence. */
const ABBREV =
  /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Inc|Ltd|Co|Corp|vs|etc|e\.g|i\.e|approx|Fig|No|Vol|Ch|Sec|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|U\.S|U\.K|E\.U)\.$/i

/**
 * Reduce MDX to plain prose paragraphs. Headings, lists, tables, blockquotes,
 * images and code are deliberately dropped: they have their own cadence and
 * would poison a sentence-length distribution. What remains is what a reader
 * experiences as running text.
 */
function proseParagraphs(text: string): string[] {
  const body = text
    .replace(/^---\n[\s\S]*?\n---\n/, "") // frontmatter
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // keep link text, drop target
    .replace(/<[^>]+>/g, "")
    .replace(/^\s*[#>|].*$/gm, "") // headings, quotes, tables
    .replace(/^\s*(?:[-*+]|\d+\.)\s+.*$/gm, "") // list items
    .replace(/\*\*|__|\*|_/g, "")

  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0)
}

/** Split a paragraph into sentences, respecting abbreviations. */
function sentences(paragraph: string): string[] {
  const parts = paragraph.split(/(?<=[.!?])\s+(?=["'(]?[A-Z0-9])/)
  const out: string[] = []
  for (const part of parts) {
    if (out.length > 0 && ABBREV.test(out[out.length - 1])) out[out.length - 1] += " " + part
    else out.push(part)
  }
  return out.map((s) => s.trim()).filter(Boolean)
}

const words = (s: string): number => (s.match(/[A-Za-z0-9$%][A-Za-z0-9'’.,$%-]*/g) ?? []).length
const firstWord = (s: string): string =>
  (s.match(/[A-Za-z']+/)?.[0] ?? "").toLowerCase()

/**
 * Openers that carry a subject. An anaphoric couplet is only a rhetorical move
 * when both sentences point at the same actor; two consecutive sentences that
 * merely both begin "The" are ordinary English and flagging them would bury the
 * real hits.
 */
const SUBJECT_OPENERS = new Set([
  "you", "we", "it", "that", "this", "they", "he", "she", "i", "your", "our", "their",
])

interface CadenceFinding {
  id: string
  label: string
  severity: "hard" | "soft"
  match: string
}

function cadenceFindings(text: string): CadenceFinding[] {
  const out: CadenceFinding[] = []
  const paras = proseParagraphs(text)
  const allSentences: string[] = []
  const lengths: number[] = []

  for (const p of paras) {
    const ss = sentences(p)
    for (const s of ss) {
      allSentences.push(s)
      lengths.push(words(s))
    }

    // ── Fragment as a standalone paragraph ─────────────────────────────────
    // "That's it. That's the whole thing." shipped as its own line. A one-line
    // paragraph under six words is a drum-roll, not a sentence.
    if (ss.length === 1 && words(ss[0]) > 0 && words(ss[0]) <= 5) {
      out.push({
        id: "fragment-paragraph",
        label: "one-line paragraph under 6 words used as a drum-roll",
        severity: "soft",
        match: ss[0].slice(0, 90),
      })
    }
  }

  // ── The anaphoric couplet (Tarry's specimen) ─────────────────────────────
  // Two ADJACENT short sentences sharing a subject opener. The second reframes
  // the first. Both must be short: the move only lands as a rhetorical snap
  // when neither sentence has room to carry an argument.
  for (let i = 0; i + 1 < allSentences.length; i++) {
    const a = allSentences[i]
    const b = allSentences[i + 1]
    const fa = firstWord(a)
    if (fa !== firstWord(b) || !SUBJECT_OPENERS.has(fa)) continue
    if (words(a) > 12 || words(b) > 12 || words(a) < 3 || words(b) < 3) continue
    out.push({
      id: "anaphoric-couplet",
      label:
        "two short sentences, same subject opener, second reframes the first (the affirmative 'it is not X, it is Y')",
      severity: "hard",
      match: `${a} ${b}`.slice(0, 130),
    })
  }

  // ── Anaphora run ─────────────────────────────────────────────────────────
  // Three or more consecutive sentences opening on the same SUBJECT word.
  // Restricted to the subject set for the same reason as the couplet: an
  // unrestricted version reported 233 runs across 93 of 119 files, almost all
  // of them three consecutive sentences beginning "The", which is ordinary
  // English and not a rhetorical move. A gate that fires on 78% of the corpus
  // teaches the writer to ignore it.
  let runStart = 0
  for (let i = 1; i <= allSentences.length; i++) {
    const same =
      i < allSentences.length &&
      firstWord(allSentences[i]) === firstWord(allSentences[runStart]) &&
      SUBJECT_OPENERS.has(firstWord(allSentences[i]))
    if (!same) {
      const len = i - runStart
      if (len >= 3) {
        out.push({
          id: "anaphora-run",
          label: `${len} consecutive sentences open on "${firstWord(allSentences[runStart])}"`,
          severity: "soft",
          match: allSentences.slice(runStart, i).join(" ").slice(0, 130),
        })
      }
      runStart = i
    }
  }

  // ── Staccato stack ───────────────────────────────────────────────────────
  // Doherty's "Staccato Stack": a run of punchy sentences stacked for rhythm.
  // Four consecutive sentences of eight words or fewer is not prose breathing,
  // it is a machine doing an impression of emphasis.
  let stac = 0
  for (let i = 0; i <= lengths.length; i++) {
    const short = i < lengths.length && lengths[i] <= 8 && lengths[i] > 0
    if (short) {
      stac++
    } else {
      if (stac >= 4) {
        out.push({
          id: "staccato-stack",
          label: `${stac} consecutive sentences of 8 words or fewer`,
          severity: "soft",
          match: allSentences.slice(i - stac, i).join(" ").slice(0, 130),
        })
      }
      stac = 0
    }
  }

  // ── Burstiness ───────────────────────────────────────────────────────────
  // The detectors' primary structural feature: the standard deviation of
  // sentence length in words. Human multi-paragraph prose sits well above 4;
  // below 4 is the uniform-cadence signature. Needs a real sample, so it only
  // runs on posts with 15+ sentences.
  if (lengths.length >= 15) {
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const sd = Math.sqrt(
      lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length,
    )
    if (sd < 4) {
      out.push({
        id: "uniform-cadence",
        label: `sentence-length spread is flat (sd ${sd.toFixed(1)} words, mean ${mean.toFixed(1)}) — vary the rhythm`,
        severity: "soft",
        match: `sd=${sd.toFixed(2)} over ${lengths.length} sentences`,
      })
    }
  }

  return out
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

  // The Smell Catcher runs against RAW text so it can strip frontmatter itself
  // and measure the body exactly as a reader meets it.
  for (const c of cadenceFindings(text)) {
    hits.push({ id: c.id, label: c.label, severity: c.severity, match: c.match })
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
