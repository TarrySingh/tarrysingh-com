# White paper release verification

Final artifact: Intelligence Without Permission, Tarry Singh / Synaptic.

- 123 A4 pages; 4,448,966 bytes.
- Complete 40,376-word narrative across 18 sections.
- All 484 narrative paragraphs preserved against the source manuscript.
- All 38 exhibit captions preserved; 10 reviewed 3D views reproduced as static images.
- Vector 2D diagrams and re-typeset comparison tables.
- Executive brief, reader guide, clickable contents, PDF bookmarks, source register, exhibit index and edition notes.
- 61 source anchors and source URLs verified; every exhibit links to the live instrument.
- No missing glyphs, replacement characters or text outside page bounds.
- Every final page rendered and visually reviewed; dense figure layouts inspected.
- All final chapter endings checked; no near-empty terminal text pages.
- Copyright notice included.

SHA-256: `6373a81fd40a714f03622f5fd6cb0fd14f2cd9b1dc92b3862de7c292cb240fe6`

The download appears prominently in the article hero, with page count and file size, and again at the end of the article. The Markdown reading copy remains available.

Build and live deployment checks are recorded below as they complete.

## Website validation

- Next.js production build passed: 745 static pages generated; TypeScript checks passed.
- Scoped ESLint check passed for the article page.
- Desktop layout reviewed at 1280 × 1000; download card and cover display correctly.
- Mobile layout reviewed at 390 × 844; full-width download card fits without horizontal overflow.
- Hero and footer PDF links and secondary Markdown link verified in the rendered DOM.
- Public PDF bytes and SHA-256 match the verified output artifact and website metadata.
- Browser download-event waiting timed out; direct HTTP verification is used for the released file.
