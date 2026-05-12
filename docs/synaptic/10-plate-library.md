# 10 · Plate library

Nine production-ready plates in the **Synaptic Cartography** visual language, finished, validated and saved at 300–600 DPI. Every plate has been embedded at least once in either a Word dossier or an interactive HTML mock-up; every plate is colour- and type-consistent with the rest of the series. They are the visual deliverable. Build the microsite *around* them — do not redesign them.

All plates live in `proposals/<PROJECT>/plates/*.png`.

## The Symphony series

| # | File | Dimensions | Aspect | Intended use on `/symphony` |
|---|---|---|---|---|
| Cover | `plate-II-cover-planisphere.png` | 2400 × 3000 | 4 : 5 portrait | The **hero** of `/symphony`. Full-bleed at top of page; can also be the OG image. |
| I | `plate-I-vision.png` | 4460 × 1560 | 2.85 : 1 panoramic | The **§1.1 long-term-vision banner**. Place at the top of the "vision" section, or use as the cover-page hero on `/` (the landing page). |
| II | `plate-II-substrate-x-scales.png` | 3210 × 2340 | 1.37 : 1 | The **§1.2 breakthrough figure** — four layers × four scales. Place in the "breakthrough" section, half-column width on desktop, full width on mobile. |
| III | `plate-III-consortium.png` | 1600 × 1200 | 4 : 3 | The **consortium plate** — Real AI · Newcastle · CREATE / PRISMA · UP Robotics. Open the consortium section with this. |
| IV | `plate-IV-comprehension-gap.png` | 1600 × 900 | 16 : 9 | The **urgency chart**: software complexity vs human comprehension capacity over 1970–2030. Use in the "why now" section. |
| V | `plate-V-statistical-ceiling.png` | 1600 × 900 | 16 : 9 | The **LLM ceiling chart**: SWE-bench headline scores vs filtered re-evaluation. Use directly before the breakthrough section. |
| VI | `plate-VI-hominis.png` | 3600 × 4800 | 3 : 4 portrait | The **Hominis cathedral**: foundation models for the real world, the three pillars, Leonardo / CINECA foundation. Embed inside the Real AI / Tarry partner spread. |
| VII | `plate-VII-ramaswamy-blue-brain.png` | 3600 × 4800 | 3 : 4 portrait | The **Newcastle / Sri Ramaswamy / Blue Brain heritage** plate — cortical-column anatomy, neuromodulator beams, pedigree timeline from 2005 to 2026. Embed inside the Newcastle partner spread. |
| VIII | `plate-VIII-siciliano-prisma.png` | 3600 × 4800 | 3 : 4 portrait | The **CREATE / Bruno Siciliano / PRISMA Lab** plate — seven-sector PRISMA rose, ERC grants, awards, "Keep the gradient" motto. Embed inside the CREATE partner spread. |

## The MEMPHIS series

| # | File | Dimensions | Aspect | Intended use on `/memphis` |
|---|---|---|---|---|
| I | `plate-I-chip.png` | 2400 × 3000 | 4 : 5 portrait | The **hero** of `/memphis` — hippocampal-memristive chip plate. Same role on its own page as the Symphony cover plate. |

## Recommended page layouts

### `/symphony`

```
Hero          plate-II-cover-planisphere.png      full bleed
Section ¶    "the long-term vision" italic copy
Vision banner plate-I-vision.png                  panoramic, edge-to-edge
Section ¶    "the science-to-technology breakthrough" copy
Charts row   plate-V-statistical-ceiling.png     half
             plate-IV-comprehension-gap.png      half
Breakthrough plate-II-substrate-x-scales.png      half-column figure
Section ¶    five objectives O1–O5 table
Consortium   plate-III-consortium.png             leading the section
Partner I    plate-VII-ramaswamy-blue-brain.png   side-by-side with prose
Partner II   plate-VIII-siciliano-prisma.png      side-by-side with prose
Partner III  plate-VI-hominis.png                 side-by-side with prose
Closing      italic "Same substrate. Different harmonies."
```

### `/memphis`

```
Hero          plate-I-chip.png                     full bleed
Section ¶    "a hippocampal · memristive · neuromorphic architecture"
Sections     the five §1.2.2 advances
Closing      italic "Memory and computation, co-localised."
```

### `/` (landing)

```
Series mark   "SYNAPTIC CARTOGRAPHY"
Hero         plate-I-vision.png                    panoramic banner
Cards        plate-II-cover-planisphere.png        (links to /symphony)
             plate-I-chip.png                      (links to /memphis)
Closing      attribution + tarrysingh.com link
```

## Technical guidance for embedding

- **Use `next/image`** for every plate. Set `priority` only on the hero plate of each route; all others should lazy-load.
- **`sizes` attribute** matters: the panoramic banner should advertise `sizes="(min-width: 1280px) 90vw, 100vw"`; portrait plates `sizes="(min-width: 1280px) 50vw, 100vw"`.
- **Preserve aspect ratio**: pass `width` and `height` (the native dimensions in the table above) — Next.js will compute the intrinsic ratio.
- **OG images**: generate per-route OG cards via `app/[project]/opengraph-image.tsx` that crop the relevant plate to 1200 × 630 with a small wordmark overlay. The plates are already designed to look good cropped (the title sits in the upper third).
- **Print CSS**: in `@media print`, swap interactive plates for their PNG fallback (paths are already in `proposals/<PROJECT>/plates/`).
- **Alt text** is non-trivial — these are information-rich plates. Use the descriptions in §"Intended use on `/symphony`" as a starting point and expand each to a full sentence describing the central object and the title.

## How to add a tenth plate

If you (or a successor) need to add a new plate to the series, run the `/plate-new` slash command in `.claude/commands/`. The command's prompt walks you through the colour-palette discipline, the geometry decision (don't repeat one already used), the title-block conventions, and the tympanum / footer chrome that holds every plate in the same series.

## Provenance

Every plate is original work generated by Python (Pillow) scripts in the Synaptic Cartography pipeline. There are no third-party stock images, no AI-generated imagery, and every glyph in every plate is set in Gloock, IBM Plex Serif, or IBM Plex Mono. If a reviewer asks "is this generated?" the truthful answer is: yes — by code written for this project, in a deliberate visual language, with named typefaces and named palettes. That answer is the strength, not the weakness.
