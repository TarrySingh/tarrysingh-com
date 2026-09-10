# Intelligence Without Permission: white paper

This is a separate print design of the complete Synaptic essay. It preserves
the 40,376-word narrative, all 38 numbered exhibits and the 61-source register.
The executive brief, reader guide, contents and colophon are additional
editorial apparatus and are excluded from the narrative count.

## Inputs

- The canonical manuscript remains in `content/synaptic/intelligence-without-permission`.
- `figures.json` is a snapshot of the published, default figure states, their
  captions, methods, SVG diagrams and comparison tables, captured on 9 September
  2026. Interactive choices are identified in the print notes, with links back
  to the corresponding live figure.
- `sources.json` preserves the release's source register, including the
  corrected 27 August 2026 date for source 09.
- `assets/` contains the ten previously reviewed scientific 3D views.
- The cover uses the existing article's conceptual editorial artwork.

## Build

Python dependencies: `reportlab`, `svglib`, `lxml`, `pypdf`, `pdfplumber`, `Pillow`.
The build was validated with ReportLab 4.4.9 and svglib 2.2.0.

Provide a font directory containing Noto Sans and Noto Serif regular, bold,
italic and bold-italic TrueType fonts, plus DejaVu Sans regular and bold for
mathematical symbols. The fonts are embedded and subset in the PDF. The build
does not depend on web fonts or network access.

```sh
python scripts/synaptic/pdf/build_whitepaper.py --font-dir /path/to/fonts
python scripts/synaptic/pdf/verify_whitepaper.py
pdftoppm -scale-to 700 -png output/pdf/intelligence-without-permission.pdf /tmp/whitepaper-page
```

The generator resolves contents and bookmark page numbers through repeated
layout passes. It writes the PDF and an audit record to `output/pdf/`.

Before release, inspect every page's rendering and magnify dense exhibits.
The verifier checks all 484 original narrative paragraphs, all exhibit captions,
61 external source URLs, 38 figure bookmarks, missing glyphs, page overflow and
the copyright notice. It does not replace visual review.

After validation, copy the PDF into the article's `public/synaptic/` directory
and update `src/lib/synaptic/intelligence-without-permission/whitepaper.json`
from the audit's page count, byte length and SHA-256. Publish these together.
