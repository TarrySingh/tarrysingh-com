import assert from "node:assert/strict"
import test from "node:test"
import { pdfFileName } from "./keys"
import { clientIp, countryOf, isSameOrigin, uaShort } from "./request-meta"

const h = (o: Record<string, string>) => new Headers(o)

test("clientIp prefers the platform header and refuses junk", () => {
  assert.equal(clientIp(h({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "198.51.100.1" })), "203.0.113.9")
  assert.equal(clientIp(h({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" })), "198.51.100.1")
  assert.equal(clientIp(h({ "x-forwarded-for": "2001:db8::1" })), "2001:db8::1")
  assert.equal(clientIp(h({ "x-real-ip": "<script>" })), "unknown")
  assert.equal(clientIp(h({})), "unknown")
})

test("countryOf accepts only a two-letter code", () => {
  assert.equal(countryOf(h({ "x-vercel-ip-country": "nl" })), "NL")
  assert.equal(countryOf(h({ "x-vercel-ip-country": "NLD" })), null)
  assert.equal(countryOf(h({})), null)
})

test("uaShort truncates and strips control characters", () => {
  assert.equal(uaShort(h({})), null)
  const out = uaShort(h({ "user-agent": "Mozilla/5.0 " + "x".repeat(400) }))
  assert.ok(out && out.length === 120)
})

test("isSameOrigin: same host passes, other host and null origin fail", () => {
  assert.equal(isSameOrigin(h({ origin: "https://www.tarrysingh.com", host: "www.tarrysingh.com" })), true)
  assert.equal(isSameOrigin(h({ origin: "https://evil.example", host: "www.tarrysingh.com" })), false)
  assert.equal(isSameOrigin(h({ origin: "null", host: "www.tarrysingh.com" })), false)
  assert.equal(isSameOrigin(h({ origin: "https://a.example", "x-forwarded-host": "a.example", host: "internal" })), true)
  assert.equal(isSameOrigin(h({ origin: "not a url", host: "a.example" })), false)
})

test("isSameOrigin: without Origin, Sec-Fetch-Site decides; neither means a script", () => {
  assert.equal(isSameOrigin(h({ "sec-fetch-site": "same-origin" })), true)
  assert.equal(isSameOrigin(h({ "sec-fetch-site": "none" })), true)
  assert.equal(isSameOrigin(h({ "sec-fetch-site": "cross-site" })), false)
  assert.equal(isSameOrigin(h({ "sec-fetch-site": "same-site" })), false)
  assert.equal(isSameOrigin(h({})), true)
})

test("pdfFileName accepts plain names and refuses traversal", () => {
  assert.equal(pdfFileName("pdf/executive-cv.pdf"), "executive-cv.pdf")
  assert.equal(pdfFileName("executive-cv.pdf"), "executive-cv.pdf")
  for (const bad of [
    "pdf/../gated.json",
    "../executive-cv.pdf",
    "pdf/sub/dir.pdf",
    "a/b.pdf",
    "pdf/.hidden.pdf",
    "a..b.pdf",
    "x.pdf.exe",
    "",
    null,
    undefined,
    7,
  ]) {
    assert.equal(pdfFileName(bad), null, String(bad))
  }
})
