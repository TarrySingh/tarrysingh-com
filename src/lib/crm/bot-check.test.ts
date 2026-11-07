/**
 * Bot-check forwarding tests. Run with `npm run crm:test`.
 *
 * Covers the site half of the signup bot check: the subscribe route
 * accepts { turnstileToken, hp, elapsedMs } from the browser, sanitises
 * the types, and forwards them as context.botCheck in the signed lead,
 * without ever rejecting on them. The unsubscribe route must carry no
 * bot check at all (the CRM exempts it).
 *
 * No network: global fetch is replaced by a recorder for every test.
 */

import assert from "node:assert/strict"
import test, { afterEach, beforeEach } from "node:test"
import { NextRequest } from "next/server"
import { HONEYPOT_MAX, TURNSTILE_TOKEN_MAX, readBotCheck } from "./bot-check"
import { signPayload } from "./sign"
import { makeUnsubscribeToken } from "./unsubscribe-token"
import type { LeadPayloadV1 } from "./types"
import { POST as subscribe } from "../../app/api/newsletter/subscribe/route"
import { POST as unsubscribe } from "../../app/api/newsletter/unsubscribe/route"

const ORIGIN = "http://localhost:3000"
const CRM_URL = "https://crm.test/api/webhooks/tarrysingh"
const SECRET = "test-webhook-secret"
const UNSUB_SECRET = "test-unsubscribe-secret"

const env = process.env as Record<string, string | undefined>
const MANAGED = ["CRM_WEBHOOK_URL", "CRM_WEBHOOK_SECRET", "CRM_UNSUBSCRIBE_TOKEN_SECRET"]

interface Sent {
  url: string
  headers: Headers
  raw: string
  payload: LeadPayloadV1
}

let sent: Sent[] = []
let savedEnv: Record<string, string | undefined> = {}
const realFetch = globalThis.fetch

beforeEach(() => {
  savedEnv = {}
  for (const k of MANAGED) savedEnv[k] = env[k]
  env.CRM_WEBHOOK_URL = CRM_URL
  env.CRM_WEBHOOK_SECRET = SECRET
  env.CRM_UNSUBSCRIBE_TOKEN_SECRET = UNSUB_SECRET
  sent = []
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const raw = String(init?.body ?? "")
    sent.push({
      url: String(input),
      headers: new Headers(init?.headers),
      raw,
      payload: JSON.parse(raw) as LeadPayloadV1,
    })
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = realFetch
  for (const k of MANAGED) {
    if (savedEnv[k] === undefined) delete env[k]
    else env[k] = savedEnv[k]
  }
})

function post(path: string, body: unknown): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

function onlySent(): Sent {
  assert.equal(sent.length, 1, "exactly one CRM post")
  return sent[0]
}

// ---- readBotCheck -------------------------------------------------------

test("readBotCheck keeps a well-formed envelope exactly as sent", () => {
  const input = { turnstileToken: "0.abc-DEF_123", hp: "", elapsedMs: 4321 }
  assert.deepEqual(readBotCheck(input), input)
})

const EMPTY = { turnstileToken: "", hp: "", elapsedMs: 0 }

test("readBotCheck turns a missing or non-object envelope into the empty one", () => {
  for (const v of [undefined, null, "token", 42, true, [], ["a", "b"]]) {
    assert.deepEqual(readBotCheck(v), EMPTY, JSON.stringify(v))
  }
})

test("readBotCheck turns wrong-typed fields into the empty signal", () => {
  assert.deepEqual(
    readBotCheck({ turnstileToken: 123, hp: { a: 1 }, elapsedMs: "5000" }),
    EMPTY,
  )
  assert.deepEqual(readBotCheck({}), EMPTY)
})

test("readBotCheck accepts only a finite, non-negative elapsedMs", () => {
  for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, null]) {
    assert.equal(readBotCheck({ elapsedMs: bad }).elapsedMs, 0, String(bad))
  }
  assert.equal(readBotCheck({ elapsedMs: 0 }).elapsedMs, 0)
  assert.equal(readBotCheck({ elapsedMs: 1999.5 }).elapsedMs, 1999.5)
})

test("readBotCheck caps string lengths and keeps a filled honeypot non-empty", () => {
  const out = readBotCheck({
    turnstileToken: "t".repeat(TURNSTILE_TOKEN_MAX + 500),
    hp: "x".repeat(HONEYPOT_MAX * 10),
    elapsedMs: 3000,
  })
  assert.equal(out.turnstileToken.length, TURNSTILE_TOKEN_MAX)
  assert.equal(out.hp.length, HONEYPOT_MAX)
})

test("readBotCheck never forwards unknown keys", () => {
  const out = readBotCheck({ turnstileToken: "", hp: "", elapsedMs: 3000, extra: "nope" })
  assert.deepEqual(Object.keys(out).sort(), ["elapsedMs", "hp", "turnstileToken"])
})

// ---- subscribe route ----------------------------------------------------

test("subscribe forwards botCheck unchanged as context.botCheck in a signed lead", async () => {
  const botCheck = { turnstileToken: "0.real-looking-token", hp: "", elapsedMs: 5234 }
  const res = await subscribe(post("/api/newsletter/subscribe", {
    email: "reader@example.com",
    source: "/blog/some-post",
    botCheck,
  }))
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.ok, true)
  assert.equal(json.outcome, "delivered")

  const s = onlySent()
  assert.equal(s.url, CRM_URL)
  assert.equal(s.headers.get("X-Tarrysingh-Signature"), `sha256=${signPayload(s.raw, SECRET)}`)
  assert.equal(s.payload.source, "newsletter")
  assert.equal(s.payload.lead.email, "reader@example.com")
  assert.deepEqual(s.payload.context?.botCheck, botCheck)
  assert.equal(s.payload.context?.page, "/blog/some-post")
})

test("subscribe sanitises bad botCheck types instead of rejecting", async () => {
  const res = await subscribe(post("/api/newsletter/subscribe", {
    email: "reader@example.com",
    botCheck: { turnstileToken: ["x"], hp: 7, elapsedMs: "fast" },
  }))
  assert.equal(res.status, 200)
  assert.deepEqual(onlySent().payload.context?.botCheck, EMPTY)
})

test("subscribe forwards the empty envelope when the browser sent none or a non-object", async () => {
  // Every form sends one, so a missing envelope is a hand-built request:
  // the CRM must still run its checks on it (elapsedMs 0 reads as
  // too_fast) rather than skip them, and the visitor still gets a 200.
  for (const botCheck of [undefined, null, "token", [1, 2]]) {
    sent = []
    const res = await subscribe(post("/api/newsletter/subscribe", {
      email: "reader@example.com",
      ...(botCheck === undefined ? {} : { botCheck }),
    }))
    assert.equal(res.status, 200, JSON.stringify(botCheck))
    assert.equal((await res.json()).ok, true)
    assert.deepEqual(onlySent().payload.context?.botCheck, EMPTY, JSON.stringify(botCheck))
  }
})

test("subscribe answers a tripped honeypot exactly like a clean signup", async () => {
  const clean = await subscribe(post("/api/newsletter/subscribe", {
    email: "reader@example.com",
    botCheck: { turnstileToken: "", hp: "", elapsedMs: 9000 },
  }))
  const tripped = await subscribe(post("/api/newsletter/subscribe", {
    email: "reader@example.com",
    botCheck: { turnstileToken: "", hp: "https://spam.example", elapsedMs: 12 },
  }))
  assert.equal(clean.status, tripped.status)
  const a = await clean.json()
  const b = await tripped.json()
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort())
  assert.equal(a.ok, b.ok)
  assert.equal(a.outcome, b.outcome)
  // The signal still reaches the CRM, which is where the decision is made.
  assert.equal(sent[1].payload.context?.botCheck?.hp, "https://spam.example")
  assert.equal(sent[1].payload.context?.botCheck?.elapsedMs, 12)
})

test("subscribe still rejects a malformed email before any CRM post", async () => {
  const res = await subscribe(post("/api/newsletter/subscribe", {
    email: "not-an-email",
    botCheck: { turnstileToken: "t", hp: "", elapsedMs: 5000 },
  }))
  assert.equal(res.status, 422)
  assert.equal(sent.length, 0)
})

test("log-only mode logs the token length, not the token", async () => {
  delete env.CRM_WEBHOOK_URL
  const lines: string[] = []
  const realLog = console.log
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "))
  }
  try {
    const res = await subscribe(post("/api/newsletter/subscribe", {
      email: "reader@example.com",
      botCheck: { turnstileToken: "secret-ish-token-value", hp: "", elapsedMs: 5000 },
    }))
    assert.equal(res.status, 200)
    assert.equal((await res.json()).outcome, "logged")
  } finally {
    console.log = realLog
  }
  assert.equal(sent.length, 0)
  const line = lines.find((l) => l.includes("crm.lead.unconfigured_log_only"))
  assert.ok(line, "log-only line written")
  assert.equal(line.includes("secret-ish-token-value"), false)
  const logged = JSON.parse(line) as { context: { botCheck: Record<string, unknown> } }
  assert.deepEqual(logged.context.botCheck, {
    hp: "",
    elapsedMs: 5000,
    turnstileToken: "<22 chars>",
  })
})

// ---- unsubscribe route --------------------------------------------------

test("unsubscribe carries no bot check, even when the request has one", async () => {
  const email = "leaver@example.com"
  const res = await unsubscribe(post("/api/newsletter/unsubscribe", {
    email,
    token: makeUnsubscribeToken(email, UNSUB_SECRET),
    botCheck: { turnstileToken: "t", hp: "filled", elapsedMs: 1 },
  }))
  assert.equal(res.status, 200)
  const s = onlySent()
  assert.equal(s.payload.source, "unsubscribe")
  assert.equal(s.payload.lead.email, email)
  assert.equal("botCheck" in (s.payload.context ?? {}), false)
})

test("unsubscribe needs no bot check to go through", async () => {
  const email = "leaver@example.com"
  const res = await unsubscribe(post("/api/newsletter/unsubscribe", {
    email,
    token: makeUnsubscribeToken(email, UNSUB_SECRET),
  }))
  assert.equal(res.status, 200)
  assert.equal(onlySent().payload.source, "unsubscribe")
})
