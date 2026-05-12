# 06 · Roadmap

Five phases. **Symphony ships first, MEMPHIS second.** Each phase ends with something demonstrable. Ship visible, ship often.

---

## Phase 0 — Repo audit (≤ 1 hour)

Goal: know what's already there before adding anything.

- [ ] `git status` and `git log --oneline -20`.
- [ ] Inspect `package.json` for current framework/tooling.
- [ ] Read any existing `README.md` (merge thoughtfully with the new one).
- [ ] Run the existing dev server; note failures.
- [ ] Take a screenshot of the current production state (if deployed). Save to `docs/baseline.png`.
- [ ] Write a short note in `docs/handover-decisions.md` summarising existing stack and what to keep vs. replace.

**Exit criterion:** you can summarise the current repo in three sentences to Tarry.

---

## Phase 1 — Foundation (Day 1–2)

Goal: design system + routing skeleton + first page that looks finished.

- [ ] Install or confirm: Next.js 14 App Router, TypeScript, Tailwind, MDX, Framer Motion, KaTeX.
- [ ] Copy `design/tokens.css` into `src/styles/tokens.css` and import in `app/layout.tsx`.
- [ ] Configure `tailwind.config.ts` to consume the tokens as theme extensions.
- [ ] Set up `next/font` with Gloock, IBM Plex Serif, IBM Plex Mono. Variable fonts.
- [ ] Build the small editorial component set: `<Hairline />`, `<SmallCaps />`, `<ItalicCaption />`, `<NumberedDisk />`, `<Cartouche />`, `<PlateHeader />`.
- [ ] Build `/` (cover) with the two project plate-cards. Hero is `proposals/SYMPHONY/plates/plate-I-vision.png` (the panoramic banner). The two clickable plate-cards are the Symphony cover plate and the MEMPHIS chip plate.
- [ ] Deploy to Vercel preview. Show Tarry.

**Exit criterion:** the cover page on Vercel preview looks like it belongs in the same studio as the nine plates.

---

## Phase 2 — Symphony page (Day 3–7)  **← the headline deliverable**

Goal: deliver `/symphony` in full, embedding all nine Symphony plates per `docs/10-plate-library.md`.

Build sections in this order. Each section is a Git commit. Each section ends with a `/plate-verify` run.

- [ ] **Hero** — `plate-II-cover-planisphere.png` full-bleed at top with the project name and italic subtitle below.
- [ ] **Long-term vision** — `plate-I-vision.png` panoramic banner + the §1.1 long-form prose lifted from `proposals/SYMPHONY/02-narrative.md`.
- [ ] **The statistical ceiling** — `plate-V-statistical-ceiling.png` chart + commentary on why current approaches fail.
- [ ] **The comprehension gap** — `plate-IV-comprehension-gap.png` chart + the four sectoral pathways prose.
- [ ] **The science-to-technology breakthrough** — `plate-II-substrate-x-scales.png` figure + the three §1.2 advances (i, ii, iii) as bold-led paragraphs.
- [ ] **Port the interactive planisphere** — `proposals/SYMPHONY/interactive.html` → `<Planisphere />` TSX component. Remove the CDN React. Keep visual fidelity 100%.
- [ ] **Five objectives O1–O5** — the table from the dossier folio X reproduced as an HTML table with shaded cells in the design-token palette.
- [ ] **Consortium** — `plate-III-consortium.png` opens the section, followed by four partner spreads.
- [ ] **Partner spread: Newcastle / Ramaswamy** — `plate-VII-ramaswamy-blue-brain.png` side-by-side with the partner-narrative prose.
- [ ] **Partner spread: CREATE / Siciliano** — `plate-VIII-siciliano-prisma.png` side-by-side with the partner-narrative prose.
- [ ] **Partner spread: Real AI / Tarry / Hominis** — `plate-VI-hominis.png` side-by-side with the partner-narrative prose.
- [ ] **Partner spread: UP Robotics** — text-only (no plate yet; could be added in a Phase 5 if needed).
- [ ] **Critical uncertainty** card.
- [ ] **Closing italic** — *"Same substrate. Different harmonies."*
- [ ] **OG image** — `app/symphony/opengraph-image.tsx` derived from the Symphony cover plate.
- [ ] **Print CSS** — `/symphony` prints as a clean 3-page brief.
- [ ] **Link to the dossier** — a small button or link to download `Symphony-Additional-Information-Dossier.docx` from `proposals/SYMPHONY/dossier/`. Host the file under `public/` if needed.

**Exit criterion:** Tarry can email `https://[preview].vercel.app/symphony` to a named EIC reviewer or VC and not be embarrassed.

---

## Phase 3 — Symphony pre-flight (Day 8)

- [ ] Run `/plate-verify` against every section of `/symphony`.
- [ ] Run `/content-audit` across all copy on `/` and `/symphony`.
- [ ] Run `/demo-rehearsal` walking the site as each of the three personas in `docs/02-audience.md`.
- [ ] Lighthouse: confirm 95+ in all four scores on `/` and `/symphony`.
- [ ] Playwright smoke test green: `/` → `/symphony` → links work, dossier downloads.
- [ ] DNS / HTTPS check.
- [ ] Get Tarry's explicit sign-off on the Vercel preview URL.

**Exit criterion:** Tarry forwards the URL to at least one named EU reviewer or VC and is comfortable doing so. *Only at this point may Phase 4 begin.*

---

## Phase 4 — MEMPHIS page + consortium + contact + ship (Day 9–11)

- [ ] Port `proposals/MEMPHIS/interactive.html` → `<ChipPlate />` TSX.
- [ ] Build `/memphis` per `docs/05-information-architecture.md`. Hero is `plate-I-chip.png`.
- [ ] Build `<MilestoneTimeline />` for M12/M18/M24/M30/M33.
- [ ] Build `<AdvanceCard />` for the five §1.2.2 dimensions.
- [ ] Build `<CriticalUncertainty />` callout.
- [ ] OG image for `/memphis`.
- [ ] Print CSS for `/memphis`.
- [ ] Build `/consortium` — text-only grid.
- [ ] Build `/contact` — `mailto:` + Calendly + IP block.
- [ ] Run `/ship-deploy` preflight.
- [ ] Cut `v1.0.0`. Push.

**Exit criterion:** all four routes shipped; Tarry forwards the apex URL to a named list of reviewers and VCs.

---

## Phase 5+ — After launch (only if requested)

In rough priority order:

- A **`/notes`** page that becomes the home for future plates in the Synaptic Cartography series.
- A **dark-mode-only** statement: explicitly no light mode. Document why.
- **Hover-revealable footnotes** as a `<Footnote />` component.
- **Per-plate audio commentary** — a 90-second Tarry-recorded voice note explaining each plate.
- **A `/colophon` page** explaining the typography, palette, and method.

Do not start Phase 5 work until Phase 4 is shipped.

---

## How to update this file

When you finish a checkbox, mark it `[x]`. When you finish a phase, change its heading to `Phase N — ✅ shipped (YYYY-MM-DD)`. Future Claude Code sessions will pick up exactly where you left off.
