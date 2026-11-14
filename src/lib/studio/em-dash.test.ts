import { test } from "node:test"
import assert from "node:assert/strict"
import { countEmDashes, scrubEmDashes } from "./em-dash"

test("counts every rendered spelling", () => {
  const t = "a \u2014 b &mdash; c &#8212; d &#x2014; e &#08212 f {\"\\u2014\"} g \\u{2014}"
  assert.equal(countEmDashes(t), 7)
})

test("ignores code and URLs", () => {
  const t = "```\na \u2014 b\n```\n`x \u2014 y` https://example.org/a\u2014b plain"
  assert.equal(countEmDashes(t), 0)
})

test("en dashes and hyphens are not em-dashes", () => {
  assert.equal(countEmDashes("30\u201350% and a well-known fact"), 0)
})

test("a single dash becomes a colon", () => {
  assert.equal(
    scrubEmDashes("Sunday Essay \u2014 The Case File"),
    "Sunday Essay: The Case File",
  )
})

test("a pair inside a sentence becomes commas", () => {
  assert.equal(
    scrubEmDashes("For government inference \u2014 confined to provincial networks \u2014 that distinction matters."),
    "For government inference, confined to provincial networks, that distinction matters.",
  )
})

test("pairs never span sentences", () => {
  assert.equal(
    scrubEmDashes("One \u2014 two. Three \u2014 four."),
    "One: two. Three: four.",
  )
})

test("entities are scrubbed too, and clean text is returned unchanged", () => {
  assert.equal(scrubEmDashes("A &mdash; B"), "A: B")
  const clean = "Nothing to see, here."
  assert.equal(scrubEmDashes(clean), clean)
})

test("an aside that already holds a comma takes parentheses", () => {
  assert.equal(
    scrubEmDashes("Two figures per pool \u2014 the largest model, and peak-hour latency \u2014 would resolve it."),
    "Two figures per pool (the largest model, and peak-hour latency) would resolve it.",
  )
})
