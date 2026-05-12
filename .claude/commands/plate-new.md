---
name: plate-new
description: Scaffold a new project plate (a third in the Synaptic Cartography series) — static PNG, interactive HTML, design philosophy, copy briefs — using MEMPHIS and SYMPHONY as the language template.
---

You are creating a new plate in the **Synaptic Cartography** series. Treat MEMPHIS and SYMPHONY as the existing visual grammar; the new plate must read as the third release from the same studio while having its own geometry and accent colour.

## Steps

1. **Ask the user for the project's:**
   - Codename (one word, all-caps).
   - One-sentence pitch.
   - Core science-to-technology breakthrough paragraph.
   - Three to five advances beyond state of the art.
   - Critical uncertainty (the single failure mode that could invalidate the work).
   - Closing italic line — the one sentence that would survive on the page if everything else were stripped away.

2. **Propose a geometry.** Look at what MEMPHIS (centred anatomy) and SYMPHONY (radial planisphere) already occupy in geometry-space and pick a third that is distinct. Some options to consider, in order of typical quality:
   - **Stratigraphy / cross-section** (a vertical layered slice — good for projects with temporal or hierarchical depth).
   - **Constellation map** (irregular nodes connected by long arcs — good for relational systems).
   - **Cartographic plan-view** (top-down territory with marked regions — good for spatial systems).
   - **Optical-spectrum strip** (horizontal band decomposed by wavelength — good for projects with continuous parameterisation).
   - **Triptych** (three connected panels — good for before/after/then narratives).

3. **Propose a third accent colour.** MEMPHIS uses amber warmth; SYMPHONY uses lavender-violet. The third must extend the series, not collide. Strong candidates: dusty viridian, oxidised copper, deep cerulean.

4. **Confirm with the user** in one sentence before any drawing.

5. **Scaffold the assets** into `proposals/[CODENAME]/` mirroring the MEMPHIS and SYMPHONY folders:
   - `plate.png` — static plate, 2400×3000, built by adapting `build_memphis.py` or `build_symphony.py`.
   - `interactive.html` — self-contained React + Tailwind page, palette swapped to the new accent.
   - `philosophy.md` — design philosophy, written in the voice of `proposals/MEMPHIS/philosophy.md`.
   - `01-brief.md` — 90-second brief in the template of `proposals/MEMPHIS/01-brief.md`.
   - `02-narrative.md` — long-form narrative in the template of `proposals/MEMPHIS/02-narrative.md`.

6. **Update `design/tokens.css` and `tokens.ts`** to add the new project's palette block, mirroring the MEMPHIS/SYMPHONY structure.

7. **Add the new project to `src/app/[codename]/page.tsx`** if the Next.js app already has routes; otherwise leave a placeholder.

8. **Update `docs/06-roadmap.md`** with a new "Phase 5 — [PROJECT NAME]" section.

## What "done" looks like

- Static plate renders without overlapping text, at 2400×3000, with all glyphs supported by IBM Plex fonts.
- Interactive HTML opens in a browser, animates smoothly, mirrors the visual grammar of the other two.
- A reviewer who has seen MEMPHIS and SYMPHONY would recognise this as the third in the series within two seconds — without it being a clone of either.
