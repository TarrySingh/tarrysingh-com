import assert from "node:assert/strict"
import test from "node:test"
import {
  generateCode,
  grantRef,
  hashCode,
  hashIp,
  normaliseCode,
  timingSafeEqual,
} from "./codes"

const PEPPER = "p".repeat(40)

test("generated codes have the TS-XXXX-XXXX-XXXX Crockford shape and are unique", () => {
  const seen = new Set<string>()
  for (let i = 0; i < 500; i++) {
    const code = generateCode()
    assert.match(code, /^TS-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/)
    seen.add(code)
  }
  assert.equal(seen.size, 500)
})

test("every generated code survives normalisation unchanged in meaning", () => {
  for (let i = 0; i < 200; i++) {
    const code = generateCode()
    const n = normaliseCode(code)
    assert.ok(n)
    assert.equal(n, code.slice(3).replace(/-/g, ""))
  }
})

test("normalisation tolerates case, spacing, separators, prefix and look-alikes", () => {
  const canonical = "7Q4M9XR2KD3F"
  for (const typed of [
    "TS-7Q4M-9XR2-KD3F",
    "ts-7q4m-9xr2-kd3f",
    "  TS 7Q4M 9XR2 KD3F ",
    "7Q4M9XR2KD3F",
    "TS_7Q4M_9XR2_KD3F",
    "TS.7Q4M.9XR2.KD3F",
  ]) {
    assert.equal(normaliseCode(typed), canonical, typed)
  }
  // O reads as 0, I and L read as 1.
  assert.equal(normaliseCode("TS-O1IL-0000-0000"), "011100000000")
})

test("normalisation refuses what cannot be a code", () => {
  for (const bad of [
    "",
    "TS-7Q4M-9XR2-K", // too short
    "TS-7Q4M-9XR2-KD3F-X",
    "TS-7Q4U-9XR2-KD3F", // U is not in the alphabet
    "TS-7Q4M-9XR2-KD3!",
    "<script>alert(1)</script>",
    "7Q4M9XR2KD3FZZ", // right length without the prefix, wrong prefix
    "x".repeat(500),
    undefined,
    null,
    42,
    { code: "TS-7Q4M-9XR2-KD3F" },
  ]) {
    assert.equal(normaliseCode(bad), null, String(bad))
  }
})

test("code hashing is deterministic, keyed and domain-separated", async () => {
  const a = await hashCode("7Q4M9XR2KD3F", PEPPER)
  assert.match(a, /^[0-9a-f]{64}$/)
  assert.equal(a, await hashCode("7Q4M9XR2KD3F", PEPPER))
  assert.notEqual(a, await hashCode("7Q4M9XR2KD3G", PEPPER))
  assert.notEqual(a, await hashCode("7Q4M9XR2KD3F", "q".repeat(40)))
  // The same key and message in the IP namespace must not collide.
  assert.notEqual(a, await hashIp("7Q4M9XR2KD3F", PEPPER))
  await assert.rejects(() => hashCode("7Q4M9XR2KD3F", ""))
})

test("ip hashing never returns the address and depends on the salt", async () => {
  const h = await hashIp("203.0.113.9", "x".repeat(40))
  assert.match(h, /^[0-9a-f]{64}$/)
  assert.ok(!h.includes("203"))
  assert.notEqual(h, await hashIp("203.0.113.9", "y".repeat(40)))
  assert.notEqual(h, await hashIp("203.0.113.10", "x".repeat(40)))
})

test("timingSafeEqual compares correctly", () => {
  assert.equal(timingSafeEqual("abc", "abc"), true)
  assert.equal(timingSafeEqual("abc", "abd"), false)
  assert.equal(timingSafeEqual("abc", "abcd"), false)
  assert.equal(timingSafeEqual("", ""), true)
})

test("grant references are short, stable and derived from the id", () => {
  assert.equal(grantRef("3f9a1c52-8e1b-4c7a-9d34-0b6f5a2e7c10"), "G-3F9A1C")
})
