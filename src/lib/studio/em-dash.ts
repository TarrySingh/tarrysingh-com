/**
 * Em-dash detection and the excerpt/title scrub.
 *
 * House contract (§1): ZERO em-dashes anywhere a reader sees, title and
 * excerpt included. The slop scanner reports them; this module is what the
 * publish path uses to ENFORCE it, so the count must be exact and must see
 * every spelling that renders as a dash:
 *
 *   - the literal character U+2014
 *   - HTML entities, named and numeric, with or without the trailing
 *     semicolon and with zero padding (all render identically in MDX)
 *   - JS escapes inside an MDX expression, e.g. a JSX prop or {"..."} child
 *
 * Fenced code, inline code and URLs are ignored: they are not prose.
 */

const DASH_SPELLINGS =
  /\u2014|&mdash;?|&#0*8212;?|&#x0*2014;?|\\u2014|\\u\{0*2014\}/gi

function stripNonProse(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "")
    .replace(/https?:\/\/[^\s)\]"']+/g, "")
}

/** Number of em-dashes a reader would see, in any spelling. */
export function countEmDashes(text: string): number {
  return (stripNonProse(text).match(DASH_SPELLINGS) ?? []).length
}

/**
 * Deterministic em-dash removal for SHORT generated metadata (the excerpt and
 * the title), never for an article body. It runs before the draft is created,
 * so Tarry still reviews the result in the approval email and the editor.
 *
 * Contract §1 says to restore the mark the dash displaced, not to default to
 * a comma. In generated one-liners the dash displaces two things, and they can
 * be told apart mechanically:
 *
 *   - a PAIR of dashes inside one sentence brackets a parenthetical, which
 *     takes commas, or parentheses when the aside already holds a comma
 *     (otherwise "two figures, X, and Y, would" loses its structure);
 *   - a SINGLE dash introduces an elaboration or an appositive, which takes
 *     a colon.
 *
 * Anything subtler is left for a human, which is why bodies are gated, not
 * scrubbed.
 */
export function scrubEmDashes(text: string): string {
  // Normalise every spelling to the literal character first.
  const s = text.replace(DASH_SPELLINGS, "\u2014")
  if (!s.includes("\u2014")) return text

  // Work sentence by sentence so a pair never spans two sentences.
  const parts = s.split(/(?<=[.!?])(\s+)/)
  return parts
    .map((part) => {
      if (!part.includes("\u2014")) return part
      let out = part
      // Pairs first: " \u2014 x \u2014 " becomes ", x, " or " (x) ".
      out = out.replace(/\s*\u2014\s*([^\u2014]+?)\s*\u2014\s*/g, (_m, inner: string) =>
        inner.includes(",") ? ` (${inner}) ` : `, ${inner}, `,
      )
      out = out.replace(/\)\s+([.!?;:,])/g, ")$1")
      // A pair that closed at the sentence end leaves ", ." behind.
      out = out.replace(/,\s+([.!?;:])/g, "$1")
      // Any remaining single dash becomes a colon.
      out = out.replace(/\s*\u2014\s*/g, ": ")
      return out
    })
    .join("")
}
