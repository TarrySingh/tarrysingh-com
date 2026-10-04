import assert from "node:assert/strict"
import test from "node:test"
import { SESSION_VERSION } from "./env"
import { signSession, verifySession } from "./session"

const SECRET = "s".repeat(40)
const GID = "3f9a1c52-8e1b-4c7a-9d34-0b6f5a2e7c10"
const NOW = 1_800_000_000

const payload = (over: Partial<{ gid: string; exp: number; v: number }> = {}) => ({
  gid: GID,
  exp: NOW + 3600,
  v: SESSION_VERSION,
  ...over,
})

function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url")
}

test("a signed token verifies and returns the payload", async () => {
  const token = await signSession(payload(), SECRET)
  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  assert.deepEqual(await verifySession(token, SECRET, NOW), payload())
})

test("a tampered payload is rejected (privilege swap, expiry bump)", async () => {
  const token = await signSession(payload(), SECRET)
  const [, sig] = token.split(".")
  const other = b64url(JSON.stringify(payload({ gid: "00000000-0000-4000-8000-000000000000" })))
  assert.equal(await verifySession(`${other}.${sig}`, SECRET, NOW), null)
  const longer = b64url(JSON.stringify(payload({ exp: NOW + 10 * 365 * 86400 })))
  assert.equal(await verifySession(`${longer}.${sig}`, SECRET, NOW), null)
})

test("a tampered signature is rejected", async () => {
  const token = await signSession(payload(), SECRET)
  const [body, sig] = token.split(".")
  const flipped = (sig[0] === "A" ? "B" : "A") + sig.slice(1)
  assert.equal(await verifySession(`${body}.${flipped}`, SECRET, NOW), null)
  assert.equal(await verifySession(`${body}.`, SECRET, NOW), null)
  assert.equal(await verifySession(`${body}.${sig}.x`, SECRET, NOW), null)
})

test("the wrong secret is rejected", async () => {
  const token = await signSession(payload(), SECRET)
  assert.equal(await verifySession(token, "t".repeat(40), NOW), null)
})

test("an expired token is rejected, including at the exact second", async () => {
  const token = await signSession(payload({ exp: NOW }), SECRET)
  assert.equal(await verifySession(token, SECRET, NOW - 1) !== null, true)
  assert.equal(await verifySession(token, SECRET, NOW), null)
  assert.equal(await verifySession(token, SECRET, NOW + 1), null)
})

test("a token of another version is rejected", async () => {
  const token = await signSession(payload({ v: SESSION_VERSION + 1 }), SECRET)
  assert.equal(await verifySession(token, SECRET, NOW), null)
})

test("missing, empty and malformed input is rejected without throwing", async () => {
  for (const bad of [undefined, null, "", "x", "a.b", ".", "..", "a.b.c", "!!!.???", "x".repeat(2000)]) {
    assert.equal(await verifySession(bad, SECRET, NOW), null)
  }
  const token = await signSession(payload(), SECRET)
  assert.equal(await verifySession(token, "", NOW), null)
  assert.equal(await verifySession(token, undefined, NOW), null)
})

test("signing without a secret throws", async () => {
  await assert.rejects(() => signSession(payload(), ""))
})
