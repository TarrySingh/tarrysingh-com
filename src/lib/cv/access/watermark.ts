/**
 * Executive profile · per-recipient PDF stamp (pdf-lib, no server-only).
 *
 * Adds one discreet footer line to every page:
 *   Prepared for <name>, <firm> · 4 Oct 2026 · Ref G-3F9A1C · Confidential
 * and writes the grant reference into the PDF Subject and Keywords. It
 * deters forwarding without a visible diagonal mark; it is not DRM.
 *
 * Font: the PDF-standard Courier (a monospace face every viewer has), so
 * the stamp needs no font asset at runtime. Text is reduced to what
 * WinAnsi can encode (accents folded, anything else becomes "?") so an
 * unusual name can never make the download fail.
 *
 * Contract with the master PDFs: leave at least 12 mm of clear space at the
 * foot of every page; the stamp sits 16 pt above the bottom edge.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib"

export type StampOptions = {
  recruiterName: string | null
  firm: string | null
  /** Grant reference, e.g. "G-3F9A1C". */
  ref: string
  date?: Date
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const FOLD: Record<string, string> = {
  "Ł": "L", "ł": "l", "Ø": "O", "ø": "o", "Đ": "D", "đ": "d", "Ħ": "H", "ħ": "h", "ı": "i", "ĸ": "k",
}

/** "4 Oct 2026" (UTC, locale-independent). */
export function formatStampDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function encodable(text: string, font: PDFFont): string {
  const allowed = new Set(font.getCharacterSet())
  const folded = text
    .replace(/[ŁłØøĐđĦħıĸ]/g, (c) => FOLD[c] ?? c)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
  let out = ""
  for (const ch of folded) {
    const cp = ch.codePointAt(0) as number
    if (cp < 0x20 || cp === 0x7f) out += " "
    else out += allowed.has(cp) ? ch : "?"
  }
  return out.replace(/\s+/g, " ").trim()
}

/** The words of the stamp, before font encoding. `whoMax` caps the name and firm. */
export function stampLine(o: StampOptions, whoMax = 112): string {
  let who = [o.recruiterName, o.firm]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .map((s, i) => (s.length > (i === 0 ? 48 : 64) ? `${s.slice(0, i === 0 ? 45 : 61)}...` : s))
    .join(", ")
  if (who.length > whoMax) who = `${who.slice(0, Math.max(0, whoMax - 3))}...`
  const date = formatStampDate(o.date ?? new Date())
  return `Prepared for ${who || "the named recipient"} · ${date} · Ref ${o.ref} · Confidential`
}

const MARGIN = 40
const BASELINE = 16
const MAX_SIZE = 6.5
const MIN_SIZE = 4.8

/** The longest line that fits `room` points: shrink the type, then the name. */
function fit(o: StampOptions, font: PDFFont, room: number): { text: string; size: number } {
  for (let whoMax = 112; ; whoMax -= 8) {
    const text = encodable(stampLine(o, whoMax), font)
    let size = MAX_SIZE
    while (size > MIN_SIZE && font.widthOfTextAtSize(text, size) > room) size -= 0.2
    if (font.widthOfTextAtSize(text, size) <= room || whoMax <= 16) return { text, size }
  }
}

/** Returns a new PDF: the master with the stamp on every page. */
export async function stampPdf(
  master: Uint8Array,
  options: StampOptions,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(master, { updateMetadata: false })
  const font = await pdf.embedFont(StandardFonts.Courier)
  const ref = encodable(options.ref, font)

  for (const page of pdf.getPages()) {
    const box = page.getCropBox()
    const { text, size } = fit(options, font, Math.max(40, box.width - 2 * MARGIN))
    page.drawText(text, {
      x: box.x + MARGIN,
      y: box.y + BASELINE,
      size,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
  }

  pdf.setSubject(`Ref ${ref}`)
  pdf.setKeywords([ref, "confidential"])
  pdf.setProducer("tarrysingh.com executive profile")
  pdf.setModificationDate(options.date ?? new Date())
  return pdf.save()
}
