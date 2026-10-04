import assert from "node:assert/strict"
import test, { before } from "node:test"
import { FULL_ENV, stubServerOnly, withEnv } from "./testkit"

stubServerOnly()

type ServerModule = typeof import("./server")
let server: ServerModule

before(async () => {
  server = await import("./server")
})

test("no configuration at all: access is denied", async () => {
  await withEnv({}, async () => {
    assert.equal(await server.getDossierAccess(), null)
  })
})

test("kill switch off: denied even with every secret set", async () => {
  await withEnv({ ...FULL_ENV, CV_ACCESS_ENABLED: "false" }, async () => {
    assert.equal(await server.getDossierAccess(), null)
  })
})

test("enabled but a secret is missing: denied", async () => {
  await withEnv({ CV_ACCESS_ENABLED: "true", CV_SESSION_SECRET: FULL_ENV.CV_SESSION_SECRET }, async () => {
    assert.equal(await server.getDossierAccess(), null)
  })
})

test("fully configured but no request or cookie in scope: denied, never throws", async () => {
  await withEnv(FULL_ENV, async () => {
    assert.equal(await server.getDossierAccess(), null)
  })
})

test("dev preview grants the fake reader in local development", async () => {
  await withEnv({ CV_DEV_PREVIEW: "1", NODE_ENV: "development" }, async () => {
    const access = await server.getDossierAccess()
    assert.ok(access)
    assert.equal(access.grantId, "dev")
    assert.equal(access.ref, "G-DEV0")
    assert.equal(access.label, "Local preview")
    assert.equal(access.recruiterName, "Preview Reader")
    assert.equal(access.firm, "Preview Search Partners")
    assert.deepEqual(access.scopes, ["dossier", "cases", "pdf:exec-cv", "pdf:one-pager", "pdf:board-bio"])
    const ttl = Date.parse(access.expiresAt) - Date.now()
    assert.ok(ttl > 55 * 60_000 && ttl <= 60 * 60_000, `ttl ${ttl}`)
    assert.equal(server.hasScope(access, "pdf:exec-cv"), true)
    assert.equal(server.hasScope(access, "pdf:long-bio"), false)
  })
})

test("dev preview is impossible in a production build", async () => {
  await withEnv({ CV_DEV_PREVIEW: "1", NODE_ENV: "production" }, async () => {
    assert.equal(await server.getDossierAccess(), null)
  })
})

test("dev preview is impossible on Vercel, even in development mode", async () => {
  await withEnv({ CV_DEV_PREVIEW: "1", NODE_ENV: "development", VERCEL: "1" }, async () => {
    assert.equal(await server.getDossierAccess(), null)
  })
})

test("dev preview needs the exact flag value", async () => {
  for (const v of ["true", "0", "", "yes"]) {
    await withEnv({ CV_DEV_PREVIEW: v, NODE_ENV: "development" }, async () => {
      assert.equal(await server.getDossierAccess(), null, v)
    })
  }
})

test("logEvent never throws, and ignores the preview grant", async () => {
  await withEnv(FULL_ENV, async () => {
    await server.logEvent("view", { grantId: "dev" })
    await server.logEvent("view", { grantId: "3f9a1c52-8e1b-4c7a-9d34-0b6f5a2e7c10" })
  })
  await withEnv({}, async () => {
    await server.logEvent("view")
  })
})
