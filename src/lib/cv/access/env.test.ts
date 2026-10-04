import assert from "node:assert/strict"
import test from "node:test"
import {
  SESSION_COOKIE_DEV,
  SESSION_COOKIE_SECURE,
  accessEnabled,
  isDevPreview,
  readAccessConfig,
  readSessionSecret,
  sessionCookieBase,
  sessionCookieName,
} from "./env"

const LONG = "k".repeat(40)
const full = {
  CV_ACCESS_ENABLED: "true",
  CV_SESSION_SECRET: LONG,
  CV_CODE_PEPPER: "p".repeat(40),
  CV_IP_SALT: "i".repeat(40),
}

test("access is closed unless the kill switch is exactly 'true'", () => {
  for (const v of [undefined, "", "false", "TRUE", "1", "yes", " true"]) {
    assert.equal(accessEnabled({ CV_ACCESS_ENABLED: v }), false, String(v))
    assert.equal(readAccessConfig({ ...full, CV_ACCESS_ENABLED: v }), null, String(v))
    assert.equal(readSessionSecret({ ...full, CV_ACCESS_ENABLED: v }), null, String(v))
  }
  assert.equal(accessEnabled(full), true)
})

test("a missing or weak secret denies, one at a time", () => {
  assert.ok(readAccessConfig(full))
  for (const key of ["CV_SESSION_SECRET", "CV_CODE_PEPPER", "CV_IP_SALT"] as const) {
    assert.equal(readAccessConfig({ ...full, [key]: undefined }), null, `${key} missing`)
    assert.equal(readAccessConfig({ ...full, [key]: "" }), null, `${key} empty`)
    assert.equal(readAccessConfig({ ...full, [key]: "short" }), null, `${key} weak`)
  }
  assert.equal(readSessionSecret({ ...full, CV_SESSION_SECRET: undefined }), null)
  assert.equal(readSessionSecret(full), LONG)
  assert.equal(readSessionSecret({ CV_ACCESS_ENABLED: "true" }), null)
})

test("the storage bucket defaults to cv-private and can be overridden", () => {
  assert.equal(readAccessConfig(full)?.bucket, "cv-private")
  assert.equal(readAccessConfig({ ...full, CV_STORAGE_BUCKET: " other " })?.bucket, "other")
})

test("cookie name and flags: __Host- over https, plain name in local dev", () => {
  assert.equal(sessionCookieName({ NODE_ENV: "production" }), SESSION_COOKIE_SECURE)
  assert.equal(SESSION_COOKIE_SECURE, "__Host-cv_session")
  assert.equal(sessionCookieName({ NODE_ENV: "development" }), SESSION_COOKIE_DEV)
  assert.equal(sessionCookieName({}), SESSION_COOKIE_DEV)
  assert.deepEqual(sessionCookieBase({ NODE_ENV: "production" }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })
  assert.equal(sessionCookieBase({ NODE_ENV: "development" }).secure, false)
})

test("dev preview is allowed only for CV_DEV_PREVIEW=1 + development + no VERCEL", () => {
  const ok = { CV_DEV_PREVIEW: "1", NODE_ENV: "development" }
  assert.equal(isDevPreview(ok), true)
  assert.equal(isDevPreview({ ...ok, NODE_ENV: "production" }), false)
  assert.equal(isDevPreview({ ...ok, NODE_ENV: "test" }), false)
  assert.equal(isDevPreview({ ...ok, NODE_ENV: undefined }), false)
  assert.equal(isDevPreview({ ...ok, VERCEL: "1" }), false)
  assert.equal(isDevPreview({ ...ok, VERCEL: "0" }), false) // any value of VERCEL blocks it
  assert.equal(isDevPreview({ ...ok, CV_DEV_PREVIEW: undefined }), false)
  assert.equal(isDevPreview({ ...ok, CV_DEV_PREVIEW: "true" }), false)
  assert.equal(isDevPreview({ ...ok, CV_DEV_PREVIEW: "0" }), false)
  assert.equal(isDevPreview({}), false)
})
