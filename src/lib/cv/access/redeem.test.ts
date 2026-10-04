import assert from "node:assert/strict"
import test from "node:test"
import { generateCode, hashCode, normaliseCode } from "./codes"
import { MAX_SESSION_SECONDS } from "./env"
import { attemptRedeem, type GrantRow, type GrantStore } from "./redeem"
import { verifySession } from "./session"

const cfg = { codePepper: "p".repeat(40), sessionSecret: "s".repeat(40) }
const NOW = Date.parse("2026-10-06T09:00:00Z")
const DAY = 86_400_000

async function setup(over: Partial<GrantRow> = {}, bumpFailures = 0) {
  const code = generateCode()
  const hash = await hashCode(normaliseCode(code) as string, cfg.codePepper)
  const row: GrantRow = {
    id: "3f9a1c52-8e1b-4c7a-9d34-0b6f5a2e7c10",
    code_hash: hash,
    label: null,
    recruiter_name: "Jane Doe",
    recruiter_email: "jane@example.com",
    firm: "Example Search",
    scopes: ["dossier"],
    max_redemptions: 2,
    redemptions: 0,
    expires_at: new Date(NOW + 30 * DAY).toISOString(),
    revoked_at: null,
    ...over,
  }
  let failures = bumpFailures
  const store: GrantStore = {
    async findByCodeHash(h) {
      return h === row.code_hash ? { ...row } : null
    },
    async bumpRedemptions(id, expected) {
      if (failures > 0) {
        failures--
        return false
      }
      if (id !== row.id || row.redemptions !== expected || row.revoked_at) return false
      row.redemptions++
      return true
    },
  }
  return { code, row, store }
}

test("a valid code redeems, counts, and mints a verifiable session", async () => {
  const { code, row, store } = await setup()
  const out = await attemptRedeem(store, cfg, code, NOW)
  assert.ok(out.ok)
  if (!out.ok) return
  assert.equal(out.firstRedemption, true)
  assert.equal(row.redemptions, 1)
  const session = await verifySession(out.token, cfg.sessionSecret, Math.floor(NOW / 1000))
  assert.equal(session?.gid, row.id)
  // A 30-day grant is capped at the 7-day session lifetime.
  assert.equal(out.maxAgeSeconds, MAX_SESSION_SECONDS)
  assert.equal(session?.exp, Math.floor(NOW / 1000) + MAX_SESSION_SECONDS)
})

test("the session never outlives the grant", async () => {
  const { code, store } = await setup({ expires_at: new Date(NOW + 2 * DAY).toISOString() })
  const out = await attemptRedeem(store, cfg, code, NOW)
  assert.ok(out.ok)
  if (out.ok) assert.equal(out.maxAgeSeconds, 2 * 86_400)
})

test("a second redemption is not 'first'; the cap is enforced", async () => {
  const { code, store } = await setup()
  const first = await attemptRedeem(store, cfg, code, NOW)
  const second = await attemptRedeem(store, cfg, code.toLowerCase().replace(/-/g, " "), NOW)
  const third = await attemptRedeem(store, cfg, code, NOW)
  assert.ok(first.ok && second.ok)
  if (first.ok && second.ok) {
    assert.equal(first.firstRedemption, true)
    assert.equal(second.firstRedemption, false)
  }
  assert.deepEqual(
    third.ok ? null : { reason: third.reason },
    { reason: "exhausted" },
  )
})

test("malformed, unknown, revoked and expired codes all fail with a reason", async () => {
  const { code, row, store } = await setup()
  const bad = await attemptRedeem(store, cfg, "nonsense", NOW)
  assert.ok(!bad.ok && bad.reason === "malformed" && bad.grantId === null)

  const unknown = await attemptRedeem(store, cfg, generateCode(), NOW)
  assert.ok(!unknown.ok && unknown.reason === "unknown" && unknown.grantId === null)

  row.revoked_at = new Date(NOW - DAY).toISOString()
  const revoked = await attemptRedeem(store, cfg, code, NOW)
  assert.ok(!revoked.ok && revoked.reason === "revoked" && revoked.grantId === row.id)
  assert.equal(row.redemptions, 0)

  row.revoked_at = null
  const expired = await attemptRedeem(store, cfg, code, NOW + 31 * DAY)
  assert.ok(!expired.ok && expired.reason === "expired")
  assert.equal(row.redemptions, 0)
})

test("a lost race is retried, and gives up after three attempts", async () => {
  const racy = await setup({}, 1)
  assert.ok((await attemptRedeem(racy.store, cfg, racy.code, NOW)).ok)
  assert.equal(racy.row.redemptions, 1)

  const stuck = await setup({}, 99)
  const out = await attemptRedeem(stuck.store, cfg, stuck.code, NOW)
  assert.ok(!out.ok && out.reason === "contended")
  assert.equal(stuck.row.redemptions, 0)
})

test("a code hashed with another pepper does not redeem", async () => {
  const { code, store } = await setup()
  const out = await attemptRedeem(store, { ...cfg, codePepper: "q".repeat(40) }, code, NOW)
  assert.ok(!out.ok && out.reason === "unknown")
})
