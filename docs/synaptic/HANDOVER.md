# HANDOVER — 60-second orientation

Welcome. You are picking up a Claude session that produced **nine** finished plates in the Synaptic Cartography series, a 25-page EU dossier, and the six EU-portal text snippets — and is now handing the build off to you for the Symphony microsite. Read this in full once. Total time: ~60 seconds.

## What this repo is going to become

A single, exquisitely-made website — `tarrysingh.com` (or a subdomain of it) — that presents two Horizon-Europe-style deep-tech proposals as if they were museum plates: **SYMPHONY** (a neuromimetic knowledge substrate for software, the live EU EIC Pathfinder 2026 submission) and **MEMPHIS** (a hippocampal-inspired memristive neuromorphic chip).

**Build order: Symphony first. MEMPHIS second.** This is strict.

## What you have to work with

- **Nine finished visual plates** in `proposals/{SYMPHONY,MEMPHIS}/plates/`. They define the studio voice. Catalogue in `docs/10-plate-library.md`.
- **The 25-page Word dossier** at `proposals/SYMPHONY/dossier/Symphony-Additional-Information-Dossier.docx`. The canonical narrative. The site must agree with it.
- **Six EU-portal text snippets** in `proposals/SYMPHONY/eu-portal/` — abstract, keywords, security, ethics, compliance, title options. **Frozen**: quote them, don't paraphrase.
- **A 10-folio strategy stack** in `docs/01-vision.md` through `docs/10-plate-library.md`. Read them in order on first session.
- **Design tokens** in `design/tokens.css` and `design/tokens.ts` — colours, typography, spacing, animation timing.
- **Two reference interactives** (`proposals/{SYMPHONY,MEMPHIS}/interactive.html`) — these define the studio's idea of interaction. Port to TSX components; don't rewrite the visual grammar.
- **`CLAUDE.md` at the root** — the formal instruction set. Read it after this file.
- **`FIRST_PROMPT.md`** — the optimal kickoff message Tarry will paste at session start. If you're invoked through it, follow its instructions verbatim.

## The 5-second rule

Every page must pass this test: a reviewer who closes the tab in 5 seconds should still remember **one specific image and one specific number**. Build accordingly. The plates are the images; the dossier and the EU-portal text supply the numbers.

## Where to start

If you were invoked by `FIRST_PROMPT.md` (Tarry's preferred path): just follow its instructions.

Otherwise — standalone:

1. **Read `CLAUDE.md`** end-to-end. (Two minutes.)
2. **Read `docs/01-vision.md`**, **`docs/06-roadmap.md`** and **`docs/10-plate-library.md`**. (Five minutes.)
3. **Run `pnpm install && pnpm dev`** (or whatever the existing repo uses).
4. **Open `proposals/SYMPHONY/plates/plate-II-cover-planisphere.png` and `proposals/SYMPHONY/interactive.html`** so the studio voice is in your head before you write your first component.
5. **Start at Phase 1** of `docs/06-roadmap.md`. The headline deliverable is `/symphony`. Do not begin `/memphis` until `/symphony` is shipped and signed off.

## What "done" looks like for the first milestone

A live URL with:

- A landing page that shows the project name *SYNAPTIC CARTOGRAPHY*, the panoramic vision banner as the hero, two plate-cards (Symphony cover, MEMPHIS chip), and one italic line of editorial copy.
- A dedicated `/symphony` page that embeds all nine Symphony plates in the page positions specified in `docs/10-plate-library.md`, with prose lifted from `proposals/SYMPHONY/02-narrative.md` and the EU-portal text from `proposals/SYMPHONY/eu-portal/`.
- A clean print-CSS path so `/symphony` exports to a 3-page PDF without breaking.
- A link to the Word dossier hosted under `public/` so reviewers can download it.

If you can ship that in a week and not be embarrassed by it, you are on schedule.

## Communication style with the user (Tarry)

Tarry wants 10–20× productivity. That means:

- Confirm understanding in **one sentence** before starting non-trivial work.
- **Show, don't ask** — produce a draft, demonstrate, then iterate.
- Make small, frequent commits with concise messages.
- Push back when something is a bad idea, briefly and with an alternative.
- Never paraphrase the EU-portal texts. Never invent a colour outside `design/tokens.css`. Never start `/memphis` until `/symphony` is shipped.

Now read `CLAUDE.md`.
