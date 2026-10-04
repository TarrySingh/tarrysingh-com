import assert from "node:assert/strict"
import test from "node:test"
import {
  PDFArray,
  PDFDocument,
  PDFStream,
  decodePDFRawStream,
  StandardFonts,
  type PDFRawStream,
} from "pdf-lib"
import { formatStampDate, stampLine, stampPdf } from "./watermark"

const DATE = new Date("2026-10-04T10:00:00Z")

async function sampleMaster(pages = 3, size: [number, number] = [595.28, 841.89]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  doc.setTitle("Executive CV")
  doc.setAuthor("Sample Author")
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage(size)
    page.drawText(`Master page ${i}`, { x: 60, y: size[1] - 80, size: 18, font })
  }
  return doc.save()
}

/** All text shown on a page: the hex strings drawn with Tj. */
function pageText(doc: PDFDocument, index: number): string {
  const contents = doc.getPage(index).node.Contents()
  const streams: PDFStream[] = []
  if (contents instanceof PDFArray) {
    for (let i = 0; i < contents.size(); i++) streams.push(contents.lookup(i, PDFStream))
  } else if (contents) {
    streams.push(contents as PDFStream)
  }
  const source = streams
    .map((s) => Buffer.from(decodePDFRawStream(s as PDFRawStream).decode()).toString("latin1"))
    .join("\n")
  return [...source.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)]
    .map((m) => Buffer.from(m[1], "hex").toString("latin1"))
    .join("\n")
}

test("every page carries the stamp and the master text is untouched", async () => {
  const out = await stampPdf(await sampleMaster(3), {
    recruiterName: "Jane Doe",
    firm: "Example Search Partners",
    ref: "G-3F9A1C",
    date: DATE,
  })
  const doc = await PDFDocument.load(out)
  assert.equal(doc.getPageCount(), 3)
  for (let i = 0; i < 3; i++) {
    const text = pageText(doc, i)
    assert.ok(
      text.includes("Prepared for Jane Doe, Example Search Partners · 4 Oct 2026 · Ref G-3F9A1C · Confidential"),
      `page ${i + 1}: ${text}`,
    )
    assert.ok(text.includes(`Master page ${i + 1}`))
  }
})

test("Subject and Keywords carry the grant reference; other metadata is kept", async () => {
  const out = await stampPdf(await sampleMaster(1), {
    recruiterName: "Jane Doe",
    firm: "Example Search",
    ref: "G-3F9A1C",
    date: DATE,
  })
  const doc = await PDFDocument.load(out)
  assert.equal(doc.getSubject(), "Ref G-3F9A1C")
  assert.ok(doc.getKeywords()?.includes("G-3F9A1C"))
  assert.equal(doc.getTitle(), "Executive CV")
  assert.equal(doc.getAuthor(), "Sample Author")
})

test("awkward names never break the download", async () => {
  for (const [name, firm] of [
    ["Łukasz Żółć-Ōgata", "Müller & Søn"],
    ["Иван Петров", "Банк"],
    ["Jane \u{1F600} Doe", "Firm\nwith\nnewlines"],
    [null, null],
    ["", "  "],
    ["N".repeat(300), "F".repeat(300)],
  ] as Array<[string | null, string | null]>) {
    const out = await stampPdf(await sampleMaster(1), {
      recruiterName: name,
      firm,
      ref: "G-3F9A1C",
      date: DATE,
    })
    const text = pageText(await PDFDocument.load(out), 0)
    assert.ok(text.includes("Ref G-3F9A1C · Confidential"), `tail kept for ${String(name).slice(0, 12)}`)
  }
})

test("accents are folded rather than lost", async () => {
  const out = await stampPdf(await sampleMaster(1), {
    recruiterName: "Łukasz Żółć",
    firm: "Müller",
    ref: "G-3F9A1C",
    date: DATE,
  })
  assert.ok(pageText(await PDFDocument.load(out), 0).includes("Lukasz Zolc, Muller"))
})

test("a narrow page keeps the tail by shortening the name, not the reference", async () => {
  const out = await stampPdf(await sampleMaster(1, [420, 595]), {
    recruiterName: "Alexandra Wilhelmina Konstantinopolsky",
    firm: "International Executive Search and Leadership Advisory Partners",
    ref: "G-3F9A1C",
    date: DATE,
  })
  const text = pageText(await PDFDocument.load(out), 0)
  assert.ok(text.includes("Ref G-3F9A1C · Confidential"), text)
})

test("stampLine and the date format are stable", () => {
  assert.equal(formatStampDate(new Date("2026-01-09T23:59:00Z")), "9 Jan 2026")
  assert.equal(
    stampLine({ recruiterName: "A", firm: "B", ref: "G-1", date: DATE }),
    "Prepared for A, B · 4 Oct 2026 · Ref G-1 · Confidential",
  )
  assert.match(stampLine({ recruiterName: null, firm: null, ref: "G-1", date: DATE }), /^Prepared for the named recipient/)
})

test("a file that is not a PDF is rejected", async () => {
  await assert.rejects(() =>
    stampPdf(new TextEncoder().encode("not a pdf"), {
      recruiterName: "A",
      firm: "B",
      ref: "G-1",
    }),
  )
})
