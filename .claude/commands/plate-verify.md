---
name: plate-verify
description: Visual-QA a plate, page or component against the Synaptic Cartography design system. Catches overlaps, missing glyphs, off-palette colours, off-voice copy, motion violations.
---

You are auditing visual work against the design system shipped in `docs/04-design-system.md`, `design/tokens.css`, `design/palette.md`, `design/fonts.md` and the two reference plates.

## Steps

1. **Ask what to audit.** Specifically:
   - A page route (e.g. `/memphis`) — run a Playwright visit, capture screenshots at desktop and mobile breakpoints.
   - A static asset (a PNG) — open it with `Read`.
   - A component file — read it, then render a story / dev URL if available.

2. **Read the design system first.** Always re-read `docs/04-design-system.md` and `design/palette.md` before starting. Do not work from memory.

3. **Run the checklist:**
   - [ ] **No text overlaps the chip / planisphere ceramic, frame, or ring.** Inspect crop regions where labels meet artwork.
   - [ ] **All hex colours used appear in `design/tokens.css`.** Grep the artefact's source for hex codes; any colour not in tokens is a defect.
   - [ ] **No forbidden words.** Run a grep for the forbidden-words list in `docs/08-content-strategy.md`. Zero hits.
   - [ ] **British English.** Look for the obvious tells (`color`, `behavior`, `organization`, `colocated`). Convert to British.
   - [ ] **No emojis, no exclamation marks** anywhere except in MDX code blocks (e.g. for snippets).
   - [ ] **No bouncy / overshoot motion.** Inspect Framer Motion variants; reject `type: 'spring'` unless `stiffness < 200` and `damping > 25`. Default to `tween` with the easing tokens.
   - [ ] **Each page ends with a single italic line.** Verify.
   - [ ] **Plate header strip present:** plate numeral, anno, fig number, breakthrough subtitle.
   - [ ] **Closing hairline + small-caps footer present.**
   - [ ] **Print CSS works.** Issue `window.print()` in headless or check `@media print` rules manually.
   - [ ] **Lighthouse ≥ 95** in all four categories (run via Vercel Speed Insights or local Lighthouse CLI).
   - [ ] **No console errors / warnings.**
   - [ ] **OG image renders.** Hit `/og/[project]` and visually check.

4. **Report findings as:**
   - **🚫 BLOCKERS** (3 max, must be fixed before any further work).
   - **⚠ POLISH** (5 max, fix before the next phase boundary).
   - **✓ PASSING** (just the count, no list).

   Each blocker gets a file:line reference and a one-sentence fix.

5. **Do not fix anything during the audit.** The audit's job is to surface; fixing is a separate step that may want a different mental mode.

## What "done" looks like

A short report (≤ 200 words) ending with one of three verdicts:

- **APPROVE — ship as-is.**
- **CONDITIONAL — fix blockers and re-run.**
- **REJECT — fundamental issue, see notes.**

Hand the report to the user. Do not approve work that wouldn't pass Persona A's gaze in `docs/02-audience.md`.
