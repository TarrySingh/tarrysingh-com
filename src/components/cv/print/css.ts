/**
 * Executive profile · print stylesheet (a plain string, inlined into the
 * HTML document that Chromium prints to PDF). No CSS modules, no imports.
 *
 * Page: A4 portrait, 210 x 297 mm. Every .sheet is exactly one printed page.
 *   - side margins 17 mm, top 16 mm
 *   - the running footer sits 12 mm above the bottom edge
 *   - the bottom 10 mm of every page is left clear for the per-recruiter
 *     watermark that the download route stamps on afterwards
 *
 * Palette: paper-white page, ink #1a1d24, and ONE accent, the copper from
 * design/tokens.css (#c98e4f). Small accent text uses the same copper
 * darkened toward ink so it still reads at 6 pt.
 *
 * Every size is multiplied by --k, the density dial the fitter turns to make
 * the executive CV land on exactly two pages without shrinking below 8 pt.
 */

export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Gloock&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&display=block"

/** The font families the document must have loaded before it is printed. */
export const REQUIRED_FONTS = [
  "400 12px Gloock",
  "400 12px 'IBM Plex Serif'",
  "600 12px 'IBM Plex Serif'",
  "italic 400 12px 'IBM Plex Serif'",
  "400 12px 'IBM Plex Mono'",
  "500 12px 'IBM Plex Mono'",
] as const

export const printCss = /* css */ `
@page { size: A4; margin: 0; }

:root {
  --k: 1;
  --paper: #fdfcfa;
  --ink: #1a1d24;
  --ink-2: #3b404c;
  --ink-3: #666b79;
  --rule: rgba(26, 29, 36, 0.16);
  --rule-2: rgba(26, 29, 36, 0.42);
  --accent: #c98e4f;
  --accent-ink: color-mix(in srgb, #c98e4f 64%, #1a1d24);
  --tint: rgba(201, 142, 79, 0.1);
  --f-display: 'Gloock', 'Playfair Display', Georgia, 'Times New Roman', serif;
  --f-text: 'IBM Plex Serif', Georgia, 'Times New Roman', serif;
  --f-mono: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: #e7e5e0;
  color: var(--ink);
  font-family: var(--f-text);
  font-size: calc(9pt * var(--k));
  line-height: 1.38;
  font-kerning: normal;
  font-variant-ligatures: common-ligatures;
  text-rendering: geometricPrecision;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  -webkit-font-smoothing: antialiased;
}
@media print { body { background: var(--paper); } }

/* ── The sheet ─────────────────────────────────────────────────────────── */
.sheet {
  position: relative;
  width: 210mm;
  height: 297mm;
  padding: 16mm 17mm 0 17mm;
  background: var(--paper);
  overflow: hidden;
  break-after: page;
  page-break-after: always;
}
.sheet:last-child { break-after: auto; page-break-after: auto; }
@media screen { .sheet { margin: 8mm auto; box-shadow: 0 1px 14px rgba(0, 0, 0, 0.18); } }

/* usable height: 297 - 16 top - 20 bottom (12 footer offset + 4 footer + 4 gap) */
.body { position: relative; height: 261mm; overflow: hidden; display: flex; flex-direction: column; }

.foot {
  position: absolute;
  left: 17mm; right: 17mm; bottom: 12mm;
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; column-gap: 4mm; white-space: nowrap;
  padding-top: 2mm;
  border-top: 0.3pt solid var(--rule-2);
  font-family: var(--f-mono); font-size: 5.7pt; line-height: 1;
  letter-spacing: 0.13em; text-transform: uppercase; color: var(--ink-3);
}
.foot .mid { text-align: center; }
.foot .end { text-align: right; }

/* ── Labels ────────────────────────────────────────────────────────────── */
.mono {
  font-family: var(--f-mono);
  font-size: calc(6.1pt * var(--k));
  line-height: 1.5;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  font-weight: 400;
}

.sec { margin-top: calc(5.4mm * var(--k)); }
.sec:first-child { margin-top: 0; }
.sh { display: flex; align-items: center; gap: 3mm; margin: 0 0 calc(3.2mm * var(--k)); }
.sh .n { color: var(--accent-ink); font-weight: 500; }
.sh .t { color: var(--ink); font-weight: 500; }
.sh::after { content: ""; flex: 1; border-top: 0.3pt solid var(--rule-2); }
.sh::after { order: 1; }
.sh .aside { order: 2; color: var(--ink-3); }

/* ── Masthead ──────────────────────────────────────────────────────────── */
.mast { display: grid; grid-template-columns: 1fr auto; align-items: end; column-gap: 8mm; padding-bottom: calc(4.2mm * var(--k)); border-bottom: 0.6pt solid var(--ink); }
.kicker { display: flex; align-items: center; gap: 2.6mm; color: var(--accent-ink); font-weight: 500; }
.kicker::before { content: ""; width: 9mm; height: 0.75mm; background: var(--accent); }
.name {
  margin: calc(2.8mm * var(--k)) 0 calc(2.2mm * var(--k));
  font-family: var(--f-display); font-weight: 400;
  font-size: calc(35pt * var(--k)); line-height: 1.02; letter-spacing: -0.012em;
}
.pos { margin: 0; max-width: 124mm; font-style: italic; font-size: calc(11pt * var(--k)); line-height: 1.38; color: var(--ink-2); text-wrap: pretty; }
.pos.long { font-size: calc(9.8pt * var(--k)); line-height: 1.4; max-width: 128mm; }
.contact { text-align: right; color: var(--ink-2); display: flex; flex-direction: column; gap: 1.5mm; padding-bottom: 0.6mm; }
.contact .k { color: var(--ink-3); display: block; font-size: calc(5.4pt * var(--k)); }
.contact .v { color: var(--ink); letter-spacing: 0.06em; text-transform: none; font-size: calc(6.5pt * var(--k)); }

.mast.sm { padding-bottom: calc(4mm * var(--k)); }
.mast.sm .name { font-size: calc(29pt * var(--k)); margin-top: calc(2.6mm * var(--k)); }

/* ── Running head (page 2 onwards) ─────────────────────────────────────── */
.runhead { display: flex; justify-content: space-between; align-items: center; padding-bottom: 2.2mm; margin-bottom: calc(5.4mm * var(--k)); border-bottom: 0.3pt solid var(--rule-2); color: var(--ink-3); }
.runhead b { color: var(--ink); font-weight: 500; }
.runhead + .sec { margin-top: 0; }

/* ── Prose ─────────────────────────────────────────────────────────────── */
.lede { display: grid; grid-template-columns: 1fr 43mm; column-gap: 9mm; align-items: start; }
.lede.solo { grid-template-columns: 1fr; }
.prose p { margin: 0 0 calc(2.1mm * var(--k)); text-wrap: pretty; hyphens: manual; }
.prose p:last-child { margin-bottom: 0; }
.prose.lead p:first-child { font-size: calc(10pt * var(--k)); line-height: 1.42; color: var(--ink); }
.prose p { color: var(--ink-2); }
.solo .prose { max-width: 140mm; }

.figs { border-left: 0.3pt solid var(--rule-2); padding-left: 5mm; display: flex; flex-direction: column; gap: calc(3.3mm * var(--k)); }
.fig .v { font-family: var(--f-display); font-size: calc(19pt * var(--k)); line-height: 1; letter-spacing: -0.005em; }
.fig .v { white-space: nowrap; }
.fig .v .cur { font-family: var(--f-mono); font-size: 0.32em; letter-spacing: 0.14em; color: var(--ink-3); margin-right: 1.6mm; vertical-align: 0.95em; }
.fig .l { margin-top: 1.1mm; color: var(--ink-3); font-size: calc(5.5pt * var(--k)); line-height: 1.45; }

/* ── Signature achievements ────────────────────────────────────────────── */
.ach { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; column-gap: 9mm; row-gap: calc(2.7mm * var(--k)); }
.ach li { display: grid; grid-template-columns: 7.5mm 1fr; align-items: start; break-inside: avoid; border-top: 0.3pt solid var(--rule); padding-top: calc(1.6mm * var(--k)); }
.ach .i { font-family: var(--f-display); font-size: calc(14pt * var(--k)); line-height: 0.95; color: var(--accent); }
.ach .tx { font-size: calc(8.8pt * var(--k)); line-height: 1.36; color: var(--ink); text-wrap: pretty; }
.ach .tx em { font-style: normal; font-weight: 600; }
.ach .cx { margin-top: 1mm; color: var(--ink-3); font-size: calc(5.4pt * var(--k)); }

/* ── Leadership matrix strip ───────────────────────────────────────────── */
.mx { display: grid; grid-template-columns: 17mm repeat(3, 1fr); border-top: 0.6pt solid var(--ink); }
.mx > div { padding: calc(1.35mm * var(--k)) 2.2mm calc(1.35mm * var(--k)) 0; border-bottom: 0.3pt solid var(--rule); }
.mx .h { color: var(--ink); font-weight: 500; font-size: calc(5.8pt * var(--k)); border-bottom: 0.3pt solid var(--rule-2); padding-left: 0; }
.mx .r { color: var(--ink-3); font-size: calc(5.6pt * var(--k)); padding-top: calc(1.8mm * var(--k)); }
.mx .c { display: grid; grid-template-columns: 3mm 1fr; column-gap: 1mm; font-size: calc(7.7pt * var(--k)); line-height: 1.3; color: var(--ink-2); }
.mx .c.none { color: var(--ink-3); }
.dot { display: inline-block; width: 1.9mm; height: 1.9mm; margin-top: 0.55mm; border-radius: 50%; border: 0.5pt solid var(--accent); background: var(--accent); }
.dot.partial { background: linear-gradient(90deg, var(--accent) 50%, transparent 50%); }
.key { display: inline-flex; align-items: center; gap: 1.2mm; color: var(--ink-3); }
.key .dot { margin: 0 1.2mm 0 2.2mm; width: 1.4mm; height: 1.4mm; }
.key .dot:first-child { margin-left: 0; }

/* ── Career history ────────────────────────────────────────────────────── */
.career { display: flex; flex-direction: column; gap: calc(3.5mm * var(--k)); }
.role { display: grid; grid-template-columns: 30mm 1fr; column-gap: 6mm; break-inside: avoid; }
.role .d { color: var(--ink-3); padding-top: 0.5mm; font-size: calc(5.9pt * var(--k)); letter-spacing: 0.08em; }
.role .d b { display: block; color: var(--ink); font-weight: 500; }
.role h3 { margin: 0; font-size: calc(9.6pt * var(--k)); font-weight: 600; line-height: 1.26; }
.role h3 span { font-weight: 400; color: var(--ink-2); }
.role .sc { margin: 0.7mm 0 0; color: var(--accent-ink); font-size: calc(5.7pt * var(--k)); letter-spacing: 0.04em; text-transform: none; }
.role .md { margin: 0.9mm 0 0; color: var(--ink-2); font-size: calc(8.3pt * var(--k)); line-height: 1.34; text-wrap: pretty; }
.role ul { margin: calc(1.1mm * var(--k)) 0 0; padding: 0; list-style: none; }
.role li { position: relative; padding-left: 3.6mm; margin: 0 0 calc(0.75mm * var(--k)); font-size: calc(8.4pt * var(--k)); line-height: 1.33; text-wrap: pretty; }
.role li::before { content: ""; position: absolute; left: 0; top: 0.62em; width: 1.7mm; border-top: 0.7pt solid var(--accent); }
.role .see { margin: 0.6mm 0 0; color: var(--accent-ink); font-size: calc(5.4pt * var(--k)); }

.early { display: grid; grid-template-columns: 30mm 1fr; column-gap: 6mm; margin-top: calc(4mm * var(--k)); padding-top: calc(2.4mm * var(--k)); border-top: 0.3pt solid var(--rule); }
.early .d { color: var(--ink-3); font-size: calc(5.9pt * var(--k)); padding-top: 0.5mm; }
.early ul { list-style: none; margin: 0; padding: 0; columns: 2; column-gap: 7mm; }
.early li { break-inside: avoid; margin: 0 0 calc(1mm * var(--k)); font-size: calc(8pt * var(--k)); line-height: 1.3; }
.early li b { display: block; font-family: var(--f-mono); font-weight: 400; font-size: calc(5.5pt * var(--k)); letter-spacing: 0.08em; color: var(--ink-3); }

/* ── Programmes ────────────────────────────────────────────────────────── */
.prog { display: grid; grid-template-columns: 1fr 1fr; column-gap: 9mm; row-gap: calc(2.4mm * var(--k)); }
.prog article { break-inside: avoid; border-top: 0.3pt solid var(--rule); padding-top: calc(1.6mm * var(--k)); }
.prog h4 { margin: 0; font-size: calc(8.6pt * var(--k)); font-weight: 600; line-height: 1.25; }
.prog .m { margin: 0.5mm 0 0; color: var(--ink-3); font-size: calc(5.4pt * var(--k)); }
.prog p { margin: 0.7mm 0 0; font-size: calc(8pt * var(--k)); line-height: 1.32; color: var(--ink-2); text-wrap: pretty; }

/* ── Education, board, languages ───────────────────────────────────────── */
.trio { display: grid; grid-template-columns: 1.3fr 1.15fr 0.85fr; column-gap: 8mm; }
.trio h5, .cred h5 { margin: 0 0 calc(1.6mm * var(--k)); color: var(--accent-ink); font-weight: 500; }
.trio ul, .cred ul { margin: 0; padding: 0; list-style: none; }
.trio li, .cred li { margin: 0 0 calc(1.3mm * var(--k)); font-size: calc(7.9pt * var(--k)); line-height: 1.32; }
.trio li small, .cred li small { display: block; color: var(--ink-3); font-family: var(--f-mono); font-size: calc(5.4pt * var(--k)); letter-spacing: 0.08em; text-transform: uppercase; }
.trio li b, .cred li b { font-weight: 600; }

.close { margin-top: auto; padding-top: calc(4mm * var(--k)); font-style: italic; font-size: calc(9.4pt * var(--k)); line-height: 1.4; color: var(--ink-2); text-wrap: balance; }
.close::before { content: ""; display: block; width: 9mm; height: 0.75mm; background: var(--accent); margin-bottom: 2.2mm; }

/* ── One-page summary ──────────────────────────────────────────────────── */
.figrow { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; border-top: 0.6pt solid var(--ink); border-bottom: 0.3pt solid var(--rule-2); }
.figrow .fig { padding: calc(3.4mm * var(--k)) 4mm calc(3.2mm * var(--k)) 4mm; border-left: 0.3pt solid var(--rule); }
.figrow .fig:first-child { border-left: 0; padding-left: 0; }
.figrow .fig .v { font-size: calc(25pt * var(--k)); }

.mer { width: 100%; display: block; }
.mer text { font-family: var(--f-mono); }
.mer .era-t { font-family: var(--f-text); font-style: italic; }
.mer-cap { margin-top: 1.4mm; color: var(--ink-3); font-size: calc(5.3pt * var(--k)); display: flex; gap: 5mm; align-items: center; }
.mer-cap i { display: inline-block; width: 4mm; height: 1.7mm; margin-right: 1.4mm; vertical-align: -0.2mm; }

.three { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 7mm; }
.three .a { border-top: 0.3pt solid var(--rule-2); padding-top: calc(2.4mm * var(--k)); }
.three .i { font-family: var(--f-display); font-size: calc(21pt * var(--k)); line-height: 1; color: var(--accent); }
.three .tx { margin-top: 1.6mm; font-size: calc(9pt * var(--k)); line-height: 1.38; text-wrap: pretty; }
.three .cx { margin-top: 1.4mm; color: var(--ink-3); font-size: calc(5.4pt * var(--k)); }

.mand { display: grid; grid-template-columns: 64mm 1fr; column-gap: 9mm; }
.seats { list-style: none; margin: 0; padding: 0; }
.seats li { padding: calc(1.7mm * var(--k)) 0; border-bottom: 0.3pt solid var(--rule); font-size: calc(9.6pt * var(--k)); line-height: 1.28; }
.seats li:first-child { padding-top: 0; }
.seats li small { display: block; margin-top: 0.7mm; color: var(--accent-ink); font-family: var(--f-mono); font-size: calc(5.3pt * var(--k)); letter-spacing: 0.13em; text-transform: uppercase; }
.dl { display: grid; grid-template-columns: 24mm 1fr; row-gap: calc(1.7mm * var(--k)); column-gap: 3mm; margin: 0; }
.dl dt { color: var(--ink-3); padding-top: 0.5mm; font-size: calc(5.6pt * var(--k)); }
.dl dd { margin: 0; font-size: calc(8.4pt * var(--k)); line-height: 1.34; color: var(--ink-2); }

/* ── Board biography ───────────────────────────────────────────────────── */
.bio { display: grid; grid-template-columns: 1fr 56mm; column-gap: 11mm; align-items: start; }
.bio .prose p { font-size: calc(11.2pt * var(--k)); line-height: 1.58; color: var(--ink); margin-bottom: calc(3.2mm * var(--k)); }
.cred { border-left: 0.3pt solid var(--rule-2); padding-left: 6mm; display: flex; flex-direction: column; gap: calc(4.4mm * var(--k)); }
.bio-foot { margin-top: calc(7mm * var(--k)); }
.bio-foot .trio { grid-template-columns: 1fr 1fr 1fr; }

.brief ul { list-style: none; margin: 0; padding: 0; columns: 2; column-gap: 9mm; }
.brief li { break-inside: avoid; margin: 0 0 calc(2.1mm * var(--k)); padding-top: calc(1.5mm * var(--k)); border-top: 0.3pt solid var(--rule); font-size: calc(8.6pt * var(--k)); line-height: 1.3; }
.brief li b { display: block; font-family: var(--f-mono); font-weight: 400; font-size: calc(5.6pt * var(--k)); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 0.5mm; }
.brief li strong { font-weight: 600; }
`
