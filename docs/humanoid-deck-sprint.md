# The Living Report — 375-slide native deck sprint

The "State of Humanoid Robotics" source deck (375 PNGs, ~120 MB, light-themed
Genspark export) rebuilt as **native interactive pages** at `/humanoid/deck`,
in the Humanoid Ascendancy design system. Kills the asset problem; makes the
deck searchable, responsive, on-brand, and *live*.

## Locked decisions (Tarry, June 2026)
- **Curated** (~280 richer pages): live instruments absorb redundant static
  chart clusters; every page carries `src:` traceability to the original.
- **Present-mode viewer**: one slide per screen, ←/→ keys, contents drawer,
  per-slide gating, `?s=N` deep links, print→PDF (Phase D).
- **June-2026 data** — consistent with the canvas (one source of truth).
- **Parallel extraction fleet** for Phase B (cost shown before launch).
- Source bundle stays gitignored (`docs/humanoid-robotics/`); the manifest is
  the only thing committed.

## Architecture
- `src/components/humanoid/deck/types.ts` — the slide manifest schema
  (9 archetypes; `{{...}}` = accent stat highlights; `locked` = workshop gate;
  `src` / `replaces` = traceability).
- `src/components/humanoid/deck/manifest.ts` — the curated slide array + TOC.
- `src/components/humanoid/deck/templates.tsx` — archetype renderers
  (title · divider · bullets · stats · twoPanel · case · table · timeline ·
  instrument). Reuses the canvas systems (.cf-*, .acs-*, .gate) and the 17
  live instruments via the instrument registry.
- `src/components/humanoid/deck/DeckViewer.tsx` — present-mode shell.
- `src/app/humanoid/deck/{page.tsx,deck.css}` — route (inherits the
  `.ha-root` layout + fonts) + the `.hd-*` styles.

## Phases
- **A · Foundation + vertical slice** ✅ this branch — templates, viewer,
  schema, 10 representative pages (one per archetype) for look-lock.
- **B · Extraction** — the parallel fleet reads all 375 PNGs from
  `docs/humanoid-robotics/full-deck/` → manifest entries (this schema).
  Classification: 315 free / 60 workshop (`scan/classify.md`); data ledger in
  `content-map.md`. Actualize to June 2026 against the canvas figures.
- **C · Assembly** — full manifest in; wire all instrument slides; bespoke-craft
  the ~15 hero pages (cover, dividers, closing); chapter TOC.
- **D · Viewer polish + QA** — native thumbnails, print→PDF, parity sweep
  vs the source PNGs, perf (the manifest is data, pages render lazily),
  a11y, un-hide from robots, wire the canvas #package section to /humanoid/deck.

## Phase-2 hooks (unchanged)
The 60 workshop pages gate on the same `HAEntitlement` seam as the canvas —
when Stripe lands, `demo:false` + server-verified `has()` lock them for real.
