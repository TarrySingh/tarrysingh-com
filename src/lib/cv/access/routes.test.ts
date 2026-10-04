import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test, { after, before } from "node:test"
import { NextRequest } from "next/server"
import { PDFArray, PDFDocument, PDFStream, StandardFonts, decodePDFRawStream, type PDFRawStream } from "pdf-lib"
import { FULL_ENV, stubServerOnly, withEnv } from "./testkit"

stubServerOnly()

type Handler = (request: NextRequest) => Promise<Response> | Response
type DownloadHandler = (
  request: NextRequest,
  context: { params: Promise<{ artefact: string }> },
) => Promise<Response>

let redeem: Handler
let requestAccess: Handler
let signout: Handler
let download: DownloadHandler
let workDir: string

const ORIGIN = "http://localhost:3000"

function post(path: string, body: unknown, extra: Record<string, string> = {}, form = false): NextRequest {
  const headers: Record<string, string> = {
    host: "localhost:3000",
    "content-type": form ? "application/x-www-form-urlencoded" : "application/json",
    ...extra,
  }
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers,
    body: form ? new URLSearchParams(body as Record<string, string>).toString() : JSON.stringify(body),
  })
}

const goodRequest = {
  name: "Jane Doe",
  email: "jane@example.com",
  firm: "Example Search",
  role: "Partner",
  consent: true,
}

before(async () => {
  redeem = (await import("../../../app/api/cv/redeem/route")).POST
  requestAccess = (await import("../../../app/api/cv/request-access/route")).POST
  signout = (await import("../../../app/api/cv/signout/route")).POST
  download = (await import("../../../app/api/cv/download/[artefact]/route")).GET as DownloadHandler

  // A throw-away private folder with one gated profile and one master PDF.
  workDir = mkdtempSync(join(tmpdir(), "cv-routes-"))
  mkdirSync(join(workDir, "build", "pdf"), { recursive: true })
  const artefact = (id: string, kind: string, scope: string, extra: Record<string, unknown> = {}) => ({
    id,
    visibility: "gated",
    kind,
    title: `Test ${kind}`,
    format: "pdf",
    requiredScope: scope,
    filename: `Test-${kind}.pdf`,
    storageKey: "pdf/master.pdf",
    ...extra,
  })
  writeFileSync(
    join(workDir, "build", "gated.json"),
    JSON.stringify({
      schemaVersion: 1,
      audience: "gated",
      profile: null,
      openness: null,
      sourceHash: `sha256:${"0".repeat(64)}`,
      generatedAt: new Date().toISOString(),
      artefacts: [
        artefact("artefact-01", "executive-cv", "pdf:exec-cv"),
        artefact("artefact-03", "long-bio", "pdf:long-bio"),
        artefact("artefact-04", "board-bio", "pdf:board-bio", { filename: "[PLACEHOLDER: filename.pdf]" }),
        artefact("artefact-05", "one-page-summary", "pdf:one-pager", { storageKey: "../escape.pdf" }),
      ],
    }),
  )
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  doc.addPage([595.28, 841.89]).drawText("Master", { x: 60, y: 760, size: 16, font })
  writeFileSync(join(workDir, "build", "pdf", "master.pdf"), await doc.save())
})

after(() => {
  if (workDir) rmSync(workDir, { recursive: true, force: true })
})

async function body(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>
}

test("redeem: closed when the kill switch is off (json and form)", async () => {
  await withEnv({}, async () => {
    const res = await redeem(post("/api/cv/redeem", { code: "TS-AAAA-BBBB-CCCC" }))
    assert.equal(res.status, 503)
    assert.deepEqual(await body(res), { ok: false, error: "closed" })
    assert.equal(res.headers.get("cache-control"), "private, no-store")

    const form = await redeem(post("/api/cv/redeem", { code: "x" }, {}, true))
    assert.equal(form.status, 303)
    assert.match(form.headers.get("location") ?? "", /\/curriculumvitae\/access\?e=closed$/)
  })
})

test("redeem: refuses a cross-origin post before anything else", async () => {
  await withEnv(FULL_ENV, async () => {
    const res = await redeem(post("/api/cv/redeem", { code: "x" }, { origin: "https://evil.example" }))
    assert.equal(res.status, 403)
    assert.deepEqual(await body(res), { ok: false, error: "invalid" })
  })
})

test("redeem: with no database it fails closed, never open", async () => {
  await withEnv(FULL_ENV, async () => {
    const res = await redeem(post("/api/cv/redeem", { code: "TS-AAAA-BBBB-CCCC" }))
    assert.equal(res.status, 503)
    assert.equal(res.headers.get("set-cookie"), null)
  })
})

test("redeem: GET is not allowed", async () => {
  const { GET } = await import("../../../app/api/cv/redeem/route")
  assert.equal(GET().status, 405)
})

test("request-access: closed when the kill switch is off", async () => {
  await withEnv({}, async () => {
    const res = await requestAccess(post("/api/cv/request-access", { ...goodRequest, t: 10_000 }))
    assert.equal(res.status, 503)
    assert.deepEqual(await body(res), { ok: false, error: "closed" })
  })
})

test("request-access: a filled honeypot looks like success and stores nothing", async () => {
  await withEnv(FULL_ENV, async () => {
    const res = await requestAccess(post("/api/cv/request-access", { ...goodRequest, website: "http://spam", t: 10_000 }))
    assert.equal(res.status, 200)
    assert.deepEqual(await body(res), { ok: true })

    const form = await requestAccess(post("/api/cv/request-access", { website: "x" }, {}, true))
    assert.equal(form.status, 303)
    assert.match(form.headers.get("location") ?? "", /\?requested=1$/)
  })
})

test("request-access: under three seconds, or no timer, is refused (both t styles)", async () => {
  await withEnv(FULL_ENV, async () => {
    for (const t of [undefined, "abc", 0, 1_500, Date.now() - 1_000, Date.now() + 60_000]) {
      const res = await requestAccess(post("/api/cv/request-access", { ...goodRequest, t }))
      assert.equal(res.status, 400, String(t))
      assert.deepEqual(await body(res), { ok: false, error: "fast" })
    }
  })
})

test("request-access: invalid input is refused with a generic error", async () => {
  await withEnv(FULL_ENV, async () => {
    const t = Date.now() - 20_000
    for (const bad of [
      { ...goodRequest, name: "J" },
      { ...goodRequest, email: "not-an-email" },
      { ...goodRequest, firm: "" },
      { ...goodRequest, consent: false },
      { ...goodRequest, consent: undefined },
      { ...goodRequest, message: "x".repeat(2_001) },
    ]) {
      const res = await requestAccess(post("/api/cv/request-access", { ...bad, t }))
      assert.equal(res.status, 400)
      assert.deepEqual(await body(res), { ok: false, error: "invalid" })
    }
    const form = await requestAccess(post("/api/cv/request-access", { name: "J", t: String(t) }, {}, true))
    assert.equal(form.status, 303)
    assert.match(form.headers.get("location") ?? "", /\?e=request_invalid$/)
  })
})

test("request-access: a good submission with no database fails closed", async () => {
  await withEnv(FULL_ENV, async () => {
    const res = await requestAccess(post("/api/cv/request-access", { ...goodRequest, t: Date.now() - 20_000 }))
    assert.equal(res.status, 503)
  })
})

test("request-access: refuses a cross-origin post", async () => {
  await withEnv(FULL_ENV, async () => {
    const res = await requestAccess(
      post("/api/cv/request-access", { ...goodRequest, t: 10_000 }, { origin: "https://evil.example" }),
    )
    assert.equal(res.status, 403)
  })
})

test("signout: clears the cookie; cross-site is refused", async () => {
  const res = await signout(post("/api/cv/signout", {}))
  assert.equal(res.status, 200)
  const cookie = res.headers.get("set-cookie") ?? ""
  assert.match(cookie, /cv_session=;/)
  assert.match(cookie, /Max-Age=0/i)
  assert.match(cookie, /HttpOnly/i)

  const cross = await signout(post("/api/cv/signout", {}, { origin: "https://evil.example" }))
  assert.equal(cross.status, 403)
  assert.equal(cross.headers.get("set-cookie"), null)
})

test("signout: a form post redirects to the teaser", async () => {
  const res = await signout(post("/api/cv/signout", {}, {}, true))
  assert.equal(res.status, 303)
  assert.match(res.headers.get("location") ?? "", /\/curriculumvitae$/)
})

const dl = (artefact: string) =>
  download(new NextRequest(`${ORIGIN}/api/cv/download/${artefact}`, { headers: { host: "localhost:3000" } }), {
    params: Promise.resolve({ artefact }),
  })

test("download: without a session it redirects to the access page", async () => {
  await withEnv(FULL_ENV, async () => {
    const res = await dl("executive-cv")
    assert.equal(res.status, 303)
    assert.match(res.headers.get("location") ?? "", /\/curriculumvitae\/access$/)
    assert.equal(res.headers.get("cache-control"), "private, no-store")
  })
})

function pageText(doc: PDFDocument): string {
  const contents = doc.getPage(0).node.Contents()
  const streams: PDFStream[] = []
  if (contents instanceof PDFArray) {
    for (let i = 0; i < contents.size(); i++) streams.push(contents.lookup(i, PDFStream))
  } else if (contents) {
    streams.push(contents as PDFStream)
  }
  const source = streams
    .map((s) => Buffer.from(decodePDFRawStream(s as PDFRawStream).decode()).toString("latin1"))
    .join("\n")
  return [...source.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)].map((m) => Buffer.from(m[1], "hex").toString("latin1")).join("\n")
}

test("download (dev preview): streams a stamped attachment with no-store headers", async () => {
  await withEnv({ CV_DEV_PREVIEW: "1", NODE_ENV: "development", CV_SOURCE_DIR: workDir }, async () => {
    // by kind, and by id
    for (const key of ["executive-cv", "artefact-01"]) {
      const res = await dl(key)
      assert.equal(res.status, 200, key)
      assert.equal(res.headers.get("content-type"), "application/pdf")
      assert.equal(res.headers.get("content-disposition"), 'attachment; filename="Test-executive-cv.pdf"')
      assert.equal(res.headers.get("cache-control"), "private, no-store")
      assert.match(res.headers.get("x-robots-tag") ?? "", /noindex/)
      assert.equal(res.headers.get("x-content-type-options"), "nosniff")
      const bytes = new Uint8Array(await res.arrayBuffer())
      assert.equal(Number(res.headers.get("content-length")), bytes.byteLength)
      const doc = await PDFDocument.load(bytes)
      assert.equal(doc.getSubject(), "Ref G-DEV0")
      const text = pageText(doc)
      assert.ok(text.includes("Prepared for Preview Reader, Preview Search Partners"), text)
      assert.ok(text.includes("Master"))
    }
  })
})

test("download (dev preview): scope, placeholder, traversal and unknown ids are refused", async () => {
  await withEnv({ CV_DEV_PREVIEW: "1", NODE_ENV: "development", CV_SOURCE_DIR: workDir }, async () => {
    assert.equal((await dl("long-bio")).status, 403) // preview grant lacks pdf:long-bio
    assert.equal((await dl("board-bio")).status, 503) // placeholder filename
    assert.equal((await dl("one-page-summary")).status, 503) // unacceptable storage key
    assert.equal((await dl("no-such-thing")).status, 404)
    assert.equal((await dl("..%2Fgated")).status, 404)
    assert.equal((await dl("UPPER")).status, 404)
  })
})

test("download: a missing gated profile is a 503, not a crash", async () => {
  await withEnv({ CV_DEV_PREVIEW: "1", NODE_ENV: "development", CV_SOURCE_DIR: join(workDir, "nowhere") }, async () => {
    assert.equal((await dl("executive-cv")).status, 503)
  })
})
