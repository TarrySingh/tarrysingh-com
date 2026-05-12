# CLAUDE.md — tarrysingh-com

**This file is the entry point for any Claude Code session in this repo.** Read it fully before doing anything else.

> **Tarry's preferred kickoff is `FIRST_PROMPT.md`**, which has a turnkey prompt that loads context in the right order. If a session opens with that prompt, follow its instructions verbatim.

---

## 1 · Who & why

This repo belongs to **Tarry Singh**. The goal of the codebase is to ship a single, exquisitely-crafted online demo site that presents two Horizon-Europe-style proposals — **MEMPHIS** and **SYMPHONY** — to two audiences at once:

- **EU programme reviewers** (EIC Pathfinder / ERC / Horizon Europe panellists). They will judge scientific rigour, novelty, structured objectives, decision milestones.
- **VCs and technical operators** evaluating Tarry and his consortium as a credible deep-tech bet.

The site is **not** a portfolio. It is a **proof-of-craft asset** that does the same work as a grant cover page and a Series-A teaser deck combined.

**Build order: Symphony first, MEMPHIS second.** Symphony is the live EU EIC Pathfinder 2026 submission; its microsite is the priority deliverable. MEMPHIS gets its own page once Symphony is shipped and stable.

The visual identity is already designed, proven, and shipped — **nine** plates in the Synaptic Cartography series. Honour them. Do not redesign them. They are catalogued in `docs/10-plate-library.md`.

---

## 2 · What's already done (don't redo)

### Plates (the visual deliverable)

| Plate | File | Use |
| --- | --- | --- |
| Symphony cover | `proposals/SYMPHONY/plates/plate-II-cover-planisphere.png` | Hero of `/symphony` |
| Vision banner (I) | `proposals/SYMPHONY/plates/plate-I-vision.png` | Panoramic banner; cover-page hero on `/` |
| Substrate × scales (II) | `proposals/SYMPHONY/plates/plate-II-substrate-x-scales.png` | §1.2 breakthrough figure |
| Consortium (III) | `proposals/SYMPHONY/plates/plate-III-consortium.png` | Opens consortium section |
| Comprehension gap (IV) | `proposals/SYMPHONY/plates/plate-IV-comprehension-gap.png` | "Why now" section |
| Statistical ceiling (V) | `proposals/SYMPHONY/plates/plate-V-statistical-ceiling.png` | Anchors the §1.2 ceiling argument |
| Hominis (VI) | `proposals/SYMPHONY/plates/plate-VI-hominis.png` | Real AI / Tarry partner spread |
| Ramaswamy / Blue Brain (VII) | `proposals/SYMPHONY/plates/plate-VII-ramaswamy-blue-brain.png` | Newcastle partner spread |
| Siciliano / PRISMA (VIII) | `proposals/SYMPHONY/plates/plate-VIII-siciliano-prisma.png` | CREATE partner spread |
| MEMPHIS chip (I) | `proposals/MEMPHIS/plates/plate-I-chip.png` | Hero of `/memphis` |

Full catalogue with intended page placements, aspect ratios and embedding guidance: **`docs/10-plate-library.md`** — read this before placing any plate.

### Reference interactives

`proposals/SYMPHONY/interactive.html` and `proposals/MEMPHIS/interactive.html` — self-contained React + Tailwind reference implementations. They define the studio voice. **Port the JSX to TSX components inside the Next.js app; don't ship them as-is and don't rewrite the visual grammar.**

### The 25-page Additional Information dossier

`proposals/SYMPHONY/dossier/Symphony-Additional-Information-Dossier.docx` — 25-page Word document already submitted (or being submitted) to the EU portal as supplementary material. The site's `/symphony` page should match the dossier in tone, claims, and structure. Treat the dossier as the *canonical narrative*: if a sentence on the website contradicts a sentence in the dossier, the dossier wins.

### EU-portal text snippets

`proposals/SYMPHONY/eu-portal/` — abstract, keywords, security self-assessment, ethics self-assessment, compliance statement, and three title options, each in its own file with character counts and rationale. These are **frozen** — they have been written for the EU portal at specific character budgets in British English. The website may quote from them; it should not rewrite them.

### Strategy stack

`docs/01-vision.md` through `docs/10-plate-library.md` — read these in order on first session.

### Design system

`design/tokens.css`, `design/tokens.ts`, `design/palette.md`, `design/fonts.md` — the visual language as code. Extend `tokens.css` into `tailwind.config.ts` rather than redefining colours inline.

### Slash commands

`.claude/commands/plate-new.md`, `plate-verify.md`, `content-audit.md`, `demo-rehearsal.md`, `ship-deploy.md`. Use them.

---

## 3 · The series identity

Both plates belong to the studio voice called **"Synaptic Cartography"**. It has three non-negotiable invariants:

1. **Editorial-scientific tone.** Think *Scientific American* meets a Wellcome Collection plate. No marketing gloss.
2. **Type palette**: Gloock display serif, IBM Plex Serif (body + italic), IBM Plex Mono (small-caps tracked labels).
3. **Colour palette** (in `design/tokens.css`): midnight indigo / cool-navy backgrounds; cream / amber / rose / teal inks; one signature accent per project (Symphony = lavender-violet for the task baton; MEMPHIS = warm amber bloom).

Never invent a colour outside `design/tokens.css`. Never substitute a typeface outside the three names above.

---

## 4 · Tech preferences (suggested)

Unless the existing `package.json` says otherwise, prefer Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion + MDX + Vercel + pnpm. Detail in `docs/03-tech-stack.md`. If the repo uses something else, adapt rather than rewrite.

---

## 5 · Build sequence

Symphony is the priority. Follow the four phases in `docs/06-roadmap.md`:

- **Phase 0** — repo audit (≤ 1 hour).
- **Phase 1** — foundation (design tokens, fonts, base components, landing cover).
- **Phase 2** — `/symphony` page, the full sweep. **This is the headline deliverable.**
- **Phase 3** — once `/symphony` is live, polish and pre-flight; only then start MEMPHIS.
- **Phase 4** — `/memphis`, consortium page, contact page, ship.

The user explicitly said: *"we will build Symphony and MEMPHIS microsite one by one with Claude Code"* — treat this as a strict sequencing rule.

---

## 6 · Editorial voice rules

- Lead with the claim, then evidence, then caveat.
- One idea per paragraph; two short sentences beat one long one.
- British English. *Programme, behaviour, co-localised, organisation.*
- No emojis, no exclamation marks, no marketing words. Forbidden-word list in `docs/08-content-strategy.md`.
- Each page ends with one italic line.
- Quote the EU-portal text directly when covering the same ground — don't paraphrase it.

---

## 7 · Working loop

1. Read `HANDOVER.md` (60 seconds).
2. Read the relevant `docs/0N-*.md` and `docs/10-plate-library.md` before touching code in that area.
3. Plan first — 3–5 bullet list, confirm with the user if scope is non-trivial.
4. Build minimal, ship visible. A single page that looks finished beats five pages at 60%.
5. QA against the plates — open the relevant `.png` next to what you've built. If they don't read as the same hand, you aren't done.
6. Update `docs/06-roadmap.md` when you finish a phase, so the next session knows where to pick up.

---

## 8 · Forbidden / careful zones

- Do **not** alter any of the nine plates without explicit instruction.
- Do **not** alter the EU-portal text in `proposals/SYMPHONY/eu-portal/` without explicit instruction.
- Do **not** rewrite the dossier `.docx` — link to it, don't regenerate it.
- Do **not** ship marketing-deck copy on the proposal pages.
- Do **not** use stock photography; every visual is original.
- Do **not** add cookie banners, popups, chat widgets, or anything that breaks the editorial tone.
- Do **not** commit `.env*` files.

---

## 9 · The success bar

> *Would I be embarrassed if Demis Hassabis, an EIC panel chair, and a Sequoia partner all opened this URL within the same week?*

If the answer is anything other than "no, I'd be proud", `/symphony` is not shipped.
