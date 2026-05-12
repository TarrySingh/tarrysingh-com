# 05 · Information architecture

A small site. Five top-level routes. Each is a self-contained reading experience.

```
/                       Cover
/memphis                MEMPHIS proposal
/symphony               SYMPHONY proposal
/consortium             Partners + credentials
/contact                mailto: + Calendly + IP statement

/og/[project]           Server-rendered OG images (private)
/print/[project]        Print-optimised view
```

No `/blog`. No `/portfolio`. No `/services`. No `/about` separate from `/consortium`. No `/news`. No `/jobs`.

---

## `/` — Cover

Single screen on a 13" laptop. Above-the-fold contains everything.

```
+-----------------------------------------------------------+
|  PLATE  ·  MMXXVI                              SERIES  I  |
|  ───────────────────────────────────────────────────────  |
|                                                           |
|              S Y N A P T I C                              |
|              C A R T O G R A P H Y                        |
|                                                           |
|   two plates from a studio that takes its time            |
|   · · ·                                                   |
|                                                           |
|  [    MEMPHIS plate-card    ] [   SYMPHONY plate-card   ] |
|                                                           |
|   Memory and computation,            Same substrate.      |
|   co-localised.                      Different harmonies. |
|                                                           |
|  ─────────────  T. Singh  ·  Anno 2026  ────────────────  |
+-----------------------------------------------------------+
```

- Plate-cards are clickable; the entire card is the link.
- The italic caption beneath each card is the project's signature line.
- A single hairline rule at the very bottom, mirroring the plates' top rule.

---

## `/memphis`

Page sections, in scroll order. Each section is one editorial "movement".

1. **Header.** Reproduces the plate's header bar: PLATE I, ANNO 2026, FIG. 1.2.2 / Core science → technology breakthrough.
2. **Hero.** The interactive `<ChipPlate />` at full width. Above it: the project name in Gloock, italic subtitle "a hippocampal · memristive · neuromorphic architecture", ornament line.
3. **The breakthrough.** Long-form prose from §1.2.2. Four paragraphs maximum, set in IBM Plex Serif at 17px.
4. **The five advances.** A horizontal scrollable strip (or stacked on mobile) showing the five §1.2.2 dimensions as numbered cards: Computational paradigm · Learning capability · Memory optimisation · Hardware substrate · System-level functionality.
5. **Decision milestones.** A small timeline component with M12, M18, M24, M30, M33 plotted. Hover a milestone → tooltip with the success threshold.
6. **Critical uncertainty.** A boxed callout naming what could fail. *"Whether memristive devices can be matched and stabilised at the precision required by the replay-driven dynamics."*
7. **Consortium card.** Mini-bios for Real AI, Newcastle, UNINA, UP Robotics. One line each.
8. **Closing italic.** *"Memory and computation, co-localised."*
9. **Page-bottom hairline + plate number footer.**

Scroll length: ≈ 4 to 5 screens on a 13" laptop. No tabs, no accordions, no "read more" toggles.

---

## `/symphony`

Mirror of `/memphis`, with the planispheric interactive and SYMPHONY's specific content.

1. **Header.** PLATE II, FIG. 1.2.
2. **Hero.** The interactive `<Planisphere />` at full width.
3. **The breakthrough.** §1.2 long-form: the structural ceiling of LLMs + structural-analysis tools; the biological principle being transposed.
4. **The three advances (i, ii, iii).** Multi-layer extraction · context-dependent activation · low-bandwidth task control.
5. **The five objectives.** Cards O1–O5 with success thresholds and decision milestones M12, M18, M24, M30, M33 — built so a reviewer can read each in 20 seconds.
6. **Critical uncertainty.** *"Whether multi-scale neuromodulation transfers from continuous perceptual / motor domains to discrete symbolic ones."*
7. **Preliminary evidence box.** Three converging lines — Mei/Muller/Ramaswamy 2022; Siciliano et al. (2018–2022); SWE-bench re-evaluation evidence (ICSE 2025, ICLR 2026). Each as a small card with citation.
8. **Consortium card.**
9. **Closing italic.** *"Same substrate. Different harmonies."*

---

## `/consortium`

A grid of partner cards. Four cards, equal weight. Each card has:

- Partner name (Gloock display).
- One-line role (italic serif).
- Lead investigator if applicable (mono small-caps).
- Up to three citations / track-record bullets.
- One link out (the partner's institutional page).

No company logos. No photos. The page is text-only by design — it reads like a published acknowledgement block, not a sales slide.

---

## `/contact`

Three blocks, stacked:

1. **Email.** `mailto:` link in Gloock, ~3rem. No form.
2. **Calendly.** Lazy-loaded iframe. 30-minute slot only.
3. **IP statement.** A small paragraph confirming proposal materials are © T. Singh and consortium partners, available under controlled disclosure to qualified reviewers.

No newsletter signup. No "follow me on X". No social-share row.

---

## Mobile

The site degrades to single-column on viewports < 768px. Plates become vertically-stacked, swipeable carousels. Sector labels in the SYMPHONY planisphere drop their abbreviations (so "DEPENDENCY TRACE" → "DEP. TRACE"). Long-form prose loses no content — it just stacks.

Don't ship a hamburger menu. There are four destinations; show them.

---

## URL hygiene

- All URLs lowercase, no trailing slash.
- Use `/og/memphis` (not `?project=memphis`) so OG cards work in messaging apps.
- Set `og:title`, `og:description`, `og:image`, `og:url`, plus `twitter:card=summary_large_image` on every route.
- One canonical domain. Redirect www → apex.
