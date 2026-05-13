#!/usr/bin/env node
/**
 * Build dispatches-status-report.docx from the markdown source at
 * docs/reports/dispatches-status-report.md.
 *
 * Renders through docx-js v9 with the studio-voice styling:
 *
 *   - US Letter portrait, 1-inch margins
 *   - Georgia serif body, Menlo mono for code
 *   - Heading levels 1–4 with weighted spacing
 *   - Hairline tables with header-row shading
 *   - Checkbox markers (☐ / ☑) for GFM task lists
 *   - Page-number footer
 *
 * Usage:
 *
 *   npm run reports:status:docx
 *
 * The .md is the source of truth. Edit the .md; re-run the script;
 * commit both. Future sprints add content to the .md and re-render.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber,
} from "docx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..", "..")

// Resolve the input md path:
//   - default: docs/reports/dispatches-status-report.md (back-compat)
//   - or pass the md file as the first CLI arg
//     e.g. `node scripts/reports/build-status-docx.mjs docs/reports/sprint-3-uat-plan.md`
const arg = process.argv[2]
const MD_PATH = arg
  ? (path.isAbsolute(arg) ? arg : path.join(ROOT, arg))
  : path.join(ROOT, "docs", "reports", "dispatches-status-report.md")
const OUT_PATH = MD_PATH.replace(/\.md$/, ".docx")

// ─── Style constants ────────────────────────────────────────────────

const FONT_SERIF = "Georgia"
const FONT_DISPLAY = "Georgia"
const FONT_MONO = "Menlo"
const COLOR_INK = "0F172A"
const COLOR_MUTED = "64748B"
const COLOR_HAIRLINE = "CBD5E1"
const COLOR_GOLD = "B45309"
const COLOR_PANEL = "F8FAFC"
const PAGE_W = 12240
const MARGIN = 1440
const CONTENT_W = PAGE_W - MARGIN * 2

const hairline = { style: BorderStyle.SINGLE, size: 4, color: COLOR_HAIRLINE }
const cellBorder = { top: hairline, bottom: hairline, left: hairline, right: hairline }
const cellMargins = { top: 80, bottom: 80, left: 140, right: 140 }

// ─── Inline-markup parser ───────────────────────────────────────────
// Handles: `code`, **bold**, *italic*, _italic_, [text](url)

function parseInline(text) {
  const tokens = []
  let i = 0
  while (i < text.length) {
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1)
      if (end > i) {
        tokens.push({ type: "code", value: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i + 1)
      if (closeBracket > i && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2)
        if (closeParen > closeBracket) {
          tokens.push({
            type: "link",
            label: text.slice(i + 1, closeBracket),
            href: text.slice(closeBracket + 2, closeParen),
          })
          i = closeParen + 1
          continue
        }
      }
    }
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2)
      if (end > i) {
        tokens.push({ type: "bold", value: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }
    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1)
      if (end > i && text[end - 1] !== "*" && text[end + 1] !== "*") {
        tokens.push({ type: "italic", value: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    if (text[i] === "_" && (i === 0 || /\W/.test(text[i - 1]))) {
      const end = text.indexOf("_", i + 1)
      if (end > i && (end === text.length - 1 || /\W/.test(text[end + 1]))) {
        tokens.push({ type: "italic", value: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    let next = i + 1
    while (
      next < text.length &&
      text[next] !== "`" &&
      text[next] !== "[" &&
      text[next] !== "*" &&
      !(text[next] === "_" && /\W/.test(text[next - 1]))
    ) {
      next++
    }
    tokens.push({ type: "text", value: text.slice(i, next) })
    i = next
  }
  return tokens
}

function tokensToRuns(tokens, baseOpts = {}) {
  const out = []
  for (const tok of tokens) {
    if (tok.type === "link") {
      out.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: tok.label,
              font: FONT_SERIF,
              size: baseOpts.size ?? 22,
              color: "1D4ED8",
              underline: {},
            }),
          ],
          link: tok.href,
        }),
      )
      continue
    }
    out.push(
      new TextRun({
        text: tok.value,
        font: tok.type === "code" ? FONT_MONO : (baseOpts.font ?? FONT_SERIF),
        size: tok.type === "code" ? 20 : (baseOpts.size ?? 22),
        bold: tok.type === "bold" || baseOpts.bold,
        italics: tok.type === "italic" || baseOpts.italic,
        color: tok.type === "code" ? COLOR_GOLD : (baseOpts.color ?? COLOR_INK),
      }),
    )
  }
  return out
}

// ─── Block converters ───────────────────────────────────────────────

function makeHeading(level, text) {
  const headingLevel = [
    HeadingLevel.HEADING_1, HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3, HeadingLevel.HEADING_4,
  ][level - 1]
  const size = [40, 30, 26, 22][level - 1]
  const bold = level >= 2
  const before = [360, 320, 220, 180][level - 1]
  const after = [200, 160, 120, 80][level - 1]
  return new Paragraph({
    heading: headingLevel,
    spacing: { before, after },
    children: tokensToRuns(parseInline(text), { font: FONT_DISPLAY, size, bold, color: COLOR_INK }),
  })
}

function makeParagraph(text) {
  return new Paragraph({
    spacing: { after: 140, line: 320 },
    children: tokensToRuns(parseInline(text)),
  })
}

function makeBullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80, line: 300 },
    children: tokensToRuns(parseInline(text)),
  })
}

function makeNumbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 80, line: 300 },
    children: tokensToRuns(parseInline(text)),
  })
}

function makeChecklist(checked, text) {
  return new Paragraph({
    spacing: { after: 60, line: 280 },
    indent: { left: 360 },
    children: [
      new TextRun({
        text: checked ? "☑  " : "☐  ",
        font: FONT_MONO,
        size: 22,
        color: COLOR_INK,
      }),
      ...tokensToRuns(parseInline(text)),
    ],
  })
}

function makeHorizontalRule() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_HAIRLINE, space: 1 } },
    children: [new TextRun({ text: "" })],
  })
}

function makeCodeBlock(lines) {
  const children = []
  lines.forEach((line, i) => {
    if (i > 0) children.push(new TextRun({ text: "", break: 1 }))
    children.push(new TextRun({ text: line, font: FONT_MONO, size: 20, color: COLOR_INK }))
  })
  return new Paragraph({
    spacing: { before: 100, after: 140, line: 280 },
    indent: { left: 360 },
    shading: { fill: COLOR_PANEL, type: ShadingType.CLEAR },
    children,
  })
}

function distributeWidths(n, total) {
  if (n === 1) return [total]
  if (n === 2) return [Math.round(total * 0.42), total - Math.round(total * 0.42)]
  if (n === 3) {
    const first = Math.round(total * 0.36)
    const last = Math.round(total * 0.18)
    return [first, total - first - last, last]
  }
  if (n === 4) {
    const a = Math.round(total * 0.28)
    const b = Math.round(total * 0.30)
    const c = Math.round(total * 0.16)
    return [a, b, c, total - a - b - c]
  }
  const base = Math.floor(total / n)
  const out = Array(n).fill(base)
  out[0] += total - base * n
  return out
}

function makeTable(headers, rows) {
  const widths = distributeWidths(headers.length, CONTENT_W)
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            borders: cellBorder,
            margins: cellMargins,
            width: { size: widths[i], type: WidthType.DXA },
            shading: { fill: COLOR_PANEL, type: ShadingType.CLEAR },
            children: [new Paragraph({
              children: [new TextRun({ text: h, font: FONT_MONO, size: 18, bold: true, color: COLOR_INK })],
            })],
          })
        ),
      }),
      ...rows.map(row => new TableRow({
        children: row.map((cell, i) =>
          new TableCell({
            borders: cellBorder,
            margins: cellMargins,
            width: { size: widths[i], type: WidthType.DXA },
            children: [new Paragraph({ children: tokensToRuns(parseInline(cell), { size: 20 }) })],
          })
        ),
      })),
    ],
  })
}

// ─── Markdown parser ────────────────────────────────────────────────

function parseMarkdown(md) {
  const lines = md.split("\n")
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === "") { i++; continue }

    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ type: "hr" })
      i++
      continue
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() })
      i++
      continue
    }

    if (trimmed.startsWith("```")) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++
      blocks.push({ type: "code", lines: codeLines })
      continue
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const sep = lines[i + 1]?.trim() ?? ""
      if (/^\|[\s|:\-]+\|$/.test(sep)) {
        const headers = trimmed.slice(1, -1).split("|").map(c => c.trim())
        i += 2
        const rows = []
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          rows.push(lines[i].trim().slice(1, -1).split("|").map(c => c.trim()))
          i++
        }
        blocks.push({ type: "table", headers, rows })
        continue
      }
    }

    const checklist = trimmed.match(/^[-*]\s+\[(\s|x|X)\]\s+(.+)$/)
    if (checklist) {
      blocks.push({ type: "checklist", checked: /[xX]/.test(checklist[1]), text: checklist[2].trim() })
      i++
      continue
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      blocks.push({ type: "bullet", text: bullet[1].trim() })
      i++
      continue
    }

    const numbered = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (numbered) {
      blocks.push({ type: "numbered", text: numbered[2].trim() })
      i++
      continue
    }

    const paraLines = [line]
    i++
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("#")) {
      const peek = lines[i].trim()
      if (/^[-*]\s+/.test(peek)) break
      if (/^\d+\.\s+/.test(peek)) break
      if (peek.startsWith("|")) break
      if (peek.startsWith("```")) break
      if (/^-{3,}$/.test(peek)) break
      paraLines.push(lines[i])
      i++
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ").trim() })
  }

  return blocks
}

// ─── Render ─────────────────────────────────────────────────────────

function renderBlocks(blocks) {
  const out = []
  for (const b of blocks) {
    switch (b.type) {
      case "heading":   out.push(makeHeading(b.level, b.text)); break
      case "paragraph": out.push(makeParagraph(b.text)); break
      case "bullet":    out.push(makeBullet(b.text)); break
      case "numbered":  out.push(makeNumbered(b.text)); break
      case "checklist": out.push(makeChecklist(b.checked, b.text)); break
      case "hr":        out.push(makeHorizontalRule()); break
      case "code":      out.push(makeCodeBlock(b.lines)); break
      case "table":     out.push(makeTable(b.headers, b.rows)); break
    }
  }
  return out
}

// ─── Build ──────────────────────────────────────────────────────────

const md = fs.readFileSync(MD_PATH, "utf8")
const blocks = parseMarkdown(md)
const body = renderBlocks(blocks)

const doc = new Document({
  creator: "Tarry Singh · maintained by Claude Code",
  title: "tarrysingh.com — Dispatches launch status report",
  description: "Sprint-tracking report. Source of truth at docs/reports/dispatches-status-report.md.",
  styles: {
    default: { document: { run: { font: FONT_SERIF, size: 22, color: COLOR_INK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT_DISPLAY, size: 40, color: COLOR_INK },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT_DISPLAY, size: 30, bold: true, color: COLOR_INK },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT_DISPLAY, size: 26, bold: true, color: COLOR_INK },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 2 } },
      { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT_DISPLAY, size: 22, bold: true, color: COLOR_INK },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 3 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: 15840 },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "tarrysingh.com — Dispatches status report", font: FONT_MONO, size: 16, color: COLOR_MUTED })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: FONT_MONO, size: 16, color: COLOR_MUTED }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT_MONO, size: 16, color: COLOR_MUTED }),
            new TextRun({ text: " · ", font: FONT_MONO, size: 16, color: COLOR_MUTED }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_MONO, size: 16, color: COLOR_MUTED }),
          ],
        })],
      }),
    },
    children: body,
  }],
})

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT_PATH, buf)
  console.log(`wrote ${path.relative(ROOT, OUT_PATH)} (${buf.length} bytes, ${body.length} block elements)`)
}).catch(err => {
  console.error(err)
  process.exit(1)
})
