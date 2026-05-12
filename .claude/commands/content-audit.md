---
name: content-audit
description: Sweep all site copy for voice consistency, British English, forbidden-words list, citation hygiene, and "one italic close per page" rule.
---

You are running a copy QA across the entire site. This is the literary equivalent of `lint`.

## Steps

1. **Identify all copy surfaces:**
   - `src/app/**/page.tsx`
   - `src/content/**/*.mdx`
   - `src/components/**/*.tsx` (anything with literal strings)
   - `proposals/**/*.md` (source-of-truth files — voice anchor)

2. **Run the British-English sweep.** Grep for: `color` (→ `colour`), `behavior` (→ `behaviour`), `organization` (→ `organisation`), `optimization` (→ `optimisation`), `colocated` (→ `co-localised`), `analyze` (→ `analyse`), `recognize` (→ `recognise`), `realize` (→ `realise`), `center` (→ `centre`), `program` (→ `programme`), `defense` (→ `defence`), `licence`/`license` (use `licence` as noun, `license` as verb in BrE).

3. **Run the forbidden-words sweep.** Grep case-insensitive for each item in `docs/08-content-strategy.md` § Forbidden words. Each hit must be either rewritten or have an inline justification comment `// ALLOW: <reason>`.

4. **Check "one italic close per page".** For each route, confirm the bottom-most prose element is a centred italic line. There must be exactly one per page.

5. **Citation hygiene.** For each `<Footnote>` or footnote-equivalent component:
   - Confirm the cited claim contains a number, a year, a venue, or a name.
   - Confirm the URL resolves (HEAD request) — if a DOI, that the DOI resolver returns 200/302.
   - Confirm the citation appears at the page bottom in expanded form.

6. **Check the italic-vs-bold rule.** Grep for `<strong>` and `font-bold` in prose contexts. Either justify (navigation, button) or downgrade to italic.

7. **Length sanity.** No paragraph longer than 4 sentences in body prose. Anything longer must be split or restructured as a list.

8. **Check the "lead with the claim" rule.** First sentence of each paragraph should land the claim. Pick five paragraphs at random; verify.

## Report format

```
COPY AUDIT — tarrysingh.com
Date: YYYY-MM-DD
Scope: <route list>

British English:           N hits across F files
Forbidden words:           N hits across F files
Missing italic close:      N routes
Citation gaps:             N footnotes
Bold-in-prose:             N hits
Over-long paragraphs:      N hits
"Claim-first" violations:  N paragraphs

VERDICT:  CLEAR  /  CONDITIONAL  /  REWRITE NEEDED
```

If verdict is anything other than `CLEAR`, list the top 10 fixes by file:line.

Do not silently fix during the audit. Surface, then fix in a follow-up.
