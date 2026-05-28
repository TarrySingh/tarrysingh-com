# Dispatches v2 — Design Brief

> **Purpose:** a research-backed brief to hand to Claude Design (and then build in `tarrysingh-com`) for a radical visual reinvention of the Dispatches blog.
> **Mandate (Tarry, 2026-05-25):** **Bold reinvention** · study **all four editorial archetypes** · scope is the **full platform upgrade** (visual + reading experience + new features).
> **Author:** research + synthesis pass.
> **Status:** **design-direction locked 2026-05-28** (§10 decisions resolved; §2 audit + §7 roadmap verified against code). §9 prompt ready to hand to Claude Design. No code yet — this brief precedes design.

---

## 1. The one-paragraph vision

Dispatches today reads like a quietly confident printed plate: Gloock display, IBM Plex Serif body, mono micro-labels, gold accents, a calm single column. That voice is the asset — we protect it. But the blog is visually flat (zero images), structurally thin (a plain stack, no search, no TOC, no series), and its design tokens are fragmented across three near-identical navies. **v2 keeps the bookish soul and wraps it in a magazine-grade body** — an art-directed dark "Front" and feature layer for arrival and flagship pieces, a sacred bookish "Read" for the essays themselves, and a proper platform underneath (search, TOC, related, audio, scrollytelling, dynamic OG). Bold on the chrome, reverent on the read.

---

## 2. Current state — what we're starting from

*(Full audit: `/Users/tarrysingh/Documents/GitHub/tarrysingh-com`, App Router, Next 15.5.)*

**Stack:** Next.js 15.5, React 19, App Router. Posts are file-based MDX in `content/blog/` (~21 posts, 19 "Essays"), rendered via `next-mdx-remote/rsc` with `remark-gfm` + `rehype-slug` + `rehype-autolink-headings`. Tailwind 3.4 + `@tailwindcss/typography`. Shiki for code, Mermaid for diagrams. Fonts via `next/font`: Gloock (display), IBM Plex Serif (body), IBM Plex Mono (labels), Inter (UI default). No animation library.

**What's genuinely strong (protect these):**
- A *coherent, intentional* studio voice — Gloock + Plex pairing, mono uppercase micro-labels at `0.22em` tracking, gold category dots, the "Cartouche" credit line. Reads like print, not a template.
- Solid reading fundamentals — `max-w-3xl` (~768px) column, `1.05rem / 1.85` serif body, restrained accents, tasteful code/quote/`hr` treatments.
- A thoughtful engagement layer most personal blogs lack — highlight-to-share, reading-milestone nudge, quiet exit-intent, newsletter peeks, a mascot — all without an analytics SDK.

**What's holding it back (the v2 targets):**
1. **Visually flat & image-free.** No hero/cover images anywhere — list and post are type-on-white. The rich Synaptic-studio visual language never reaches the blog. The `hero` frontmatter field exists but is *only* emitted to OG meta, never rendered on-page; **zero posts set it.**
2. **No hierarchy.** The index is a flat `space-y-10` list — a flagship essay and a one-line note look identical.
3. **Thin platform.** No search, no TOC, no reading progress, no related/prev-next, no series/collections, no author bio, no archive/explore, no dynamic OG per post, no audio, light-only (dark mode is wired but only on `/jobs`).
4. **Fragmented tokens.** Three near-identical navies (`#0A1628` tailwind, `#0d1b3d` studio, `rgb(15,23,42)` prose) and two gold/copper defs across `tailwind.config.ts`, `design/tokens.css`, `.prose-tarry`. Styling is inline-`style={{}}` rather than tokenized utilities → any reskin is laborious. (Also: `" 2.tsx"` macOS copy cruft to delete.)
5. **Category skew.** 19/21 posts are "Essays"; the `studio` theme variant and `hero` field are built but effectively unused — capability without editorial structure.

---

## 3. North-star teardowns — what to steal from each

The four archetypes you picked, mapped to specific sites and the *one concrete thing* each teaches:

| Site | Archetype | Steal this |
|---|---|---|
| **Stripe Press** | Literary | Reverence for the object — 3D book showcases, parallax, obsessive type craft, oceanic whitespace. *Treat each essay as a designed object, not a row.* |
| **Increment** (Stripe) | Literary / editorial | Commissioned art direction *per article* + strong category identity. *Each essay/category gets a visual signature.* |
| **Craig Mod** (craigmod.com) | Literary minimalism | The single best reference for you — an essayist's bookish digital home: gorgeous measure, full-bleed photography between text, membership, "walk-and-word" long-form. *Photography as punctuation in long essays.* |
| **Every.to** | Modern editorial | Author-forward, multi-column "publications/series" structure, subscribe woven into the read. *Series/columns as first-class IA.* |
| **The Verge (2023 redesign)** | Modern editorial | Confident anti-template personality; a "stream" of short link-posts alongside big features. *Notes vs Essays as two visual registers in one feed.* |
| **Linear / Vercel blog** | Modern editorial | Dark-mode craft, restrained micro-motion, monospace accents. *You already have mono labels — push the dark, motion-light polish.* |
| **The Pudding** | Interactive / scrollytelling | Pinned visual + scrolling narrative; CSS-driven reveals. *Opt-in "feature" layout for deep-tech flagship pieces.* |
| **Gwern.net** | Radical minimalism (maximal depth) | Sidenotes in the margin, hover link-previews, transclusion, reading-depth tooling. *Margin sidenotes + link popovers for dense technical essays.* |
| **Paul Graham / Bear** | Radical minimalism | The discipline of the read — near-zero chrome, instant load, timeless. *The reading core must stay this pure.* |

**The 2026 craft signals worth adopting** (from current award galleries + CSS state-of-the-art):
- Type *is* the art: oversized fluid display via `clamp()` (e.g. `clamp(2.5rem, 8vw, 7rem)`), headlines that fill the viewport.
- Broken/asymmetric editorial grids; images that bleed; pull-quotes that break the measure.
- Scroll-driven animation + the **View Transitions API** — both shipped in browsers now, no JS lib needed.
- The reading measure stays sacred: 60–70ch, 1.5–1.6 line-height, even on the boldest sites.

---

## 4. The v2 system — three registers, one soul

The resolution of "bold reinvention" vs "protect the read" is **three registers** sharing one token system:

### Register A — "The Front" (art-directed, dark)
The `/blog` index stops being a list and becomes a **designed cover**.
- **Dark canvas** — deep ink near-black (`#0b1020`-ish), cream + rust as luminous accents. This is the "bold" — a dramatic dark arrival that the current light-only site has never had.
- A **flagship slot** — newest/pinned Essay gets a full-bleed art-directed hero (oversized Gloock title over imagery, mono kicker).
- **Editorial grid** below — Essays as large cards with imagery, Notes as a compact "stream" column (Verge-style two registers).
- Category lenses (Essays / Notes / Studio) as filter chips — finally exploit the category field.

### Register B — "The Read" (bookish, light, sacred)
Individual essays keep the cream-paper calm — elevated, not replaced.
- **65ch measure**, IBM Plex Serif, the existing 1.85 line-height — protected.
- **Elevated type scale**: Gloock h1 pushed architectural (`clamp`), refined h2/h3 rhythm, drop-cap option for flagship essays.
- **Tufte-style sidenotes** (margin notes on wide viewports, inline-collapsible on mobile) for the dense deep-tech asides.
- **Hover link-previews** (Gwern-style) for internal cross-links.
- **Reading ergonomics**: auto-TOC (from `rehype-slug` headings), slim reading-progress rail, footnotes-as-sidenotes.
- Hero image finally *rendered* on-page (the field already exists — just wire it).

### Register C — "The Set Piece" (scrollytelling, opt-in)
For flagship deep-tech essays: a per-post `layout: feature` that unlocks Pudding-style pinned visuals + scroll-driven reveals + full-bleed diagram sequences. Most posts never use it; the two or three tentpole pieces a year shine with it.

---

## 5. Design tokens — consolidate, then expand

**First, unify.** Verified against code 2026-05-28: the fragmentation is *worse* than "three navies + two golds." Navies: `#0A1628` (tailwind `navy.900`), `#0d1b3d` (`--ink` in `globals.css`), `rgb(15,23,42)` (prose). Accents: the full Tailwind `gold.*` 50–900 scale (`gold-700 #9A7740` is what components reference) **plus** `tokens.css` `--gold #b89256` + `--copper #c98e4f` **plus** `#b45309` rust hardcoded across 9 source files (MermaidDiagram, approval emails, studio chrome). **Canonical pick for v2: navy `#0d1b3d`, rust `#b45309` (already the most-used), one gold.** Single source of truth in `design/tokens.css`, consumed via Tailwind theme extension — kill the inline `style={{}}` reskin tax.

Proposed core palette (keeps the studio DNA, adds the dark register):

| Token | Light (Read) | Dark (Front/Feature) |
|---|---|---|
| `--paper` (bg) | `#fbf7ec` cream | `#0b1020` deep ink |
| `--ink` (text) | `#0d1b3d` navy | `#f6ead0` warm cream |
| `--rust` (accent) | `#b45309` | `#e8954a` (brightened for dark) |
| `--gold` (hairline/dots) | `#b8860b @ .22` | `#c9a96e @ .3` |
| `--muted` | `rgba(13,27,61,.55)` | `rgba(246,234,208,.55)` |

**Type roles (locked names, fluid scale):**
- `--font-display` — **Gloock**, `clamp(2.5rem, 6vw, 6.5rem)` for covers; `clamp(2rem, 4vw, 3.5rem)` for post h1.
- `--font-serif` — **IBM Plex Serif**, body `1.0625rem / 1.6`.
- `--font-mono` — **IBM Plex Mono**, the signature `0.22em` uppercase micro-labels. *Keep — it's a signature.*
- `--font-sans` — **IBM Plex Sans** (locked §10.3), replacing Inter. Completes the Plex family (serif body + mono labels + sans chrome); free via `next/font`; a tighter, more intentional system than a paid grotesque, and `--font-sans` keeps a future swap a one-line change.

---

## 6. Imagery & art direction — the biggest single lever

The blog is image-free; this is the #1 thing separating it from best-in-class. Options, in order of recommendation:
1. **Generative sumi-e / ink-wash plates** per category — extends the *exact* aesthetic of the studio approval emails + the weekly-dispatch header (brush, sun, ink). Cheap, on-brand, infinite, ownable. Could be deterministic from the slug (each post a unique-but-coherent plate).
2. **Abstract "Synaptic" generative art** — the visual language already exists at `/synaptic/*` but never reaches the blog. Bring it over as cover textures.
3. **Commissioned/AI hero per flagship** — only for tentpole essays; Increment-style per-piece art.

Decision needed from Tarry, but #1 is the strong default — it makes the blog and the emails feel like one studio.

---

## 7. Information architecture + feature roadmap

Phased so we ship visible wins fast, platform depth after.

### Phase 1 — Visual core (the "stunning" you can see in week one)
- Consolidate tokens (canonical navy `#0d1b3d` + rust `#b45309` + one gold); introduce dark "Front" register; swap UI sans Inter → IBM Plex Sans.
- **Build the slug-deterministic sumi-e plate generator first** — every card and hero depends on it (hash slug → seed → SVG/canvas ink-wash; build-time, no model cost).
- Redesign `/blog` index → flagship hero + editorial grid + Notes stream + category lenses.
- Redesign post header (architectural Gloock, rendered hero image, refined meta, `Part N of M · [Series]` breadcrumb).
- Dynamic OG image per post via `next/og` `ImageResponse` (Satori) — native on Next 15 / Vercel, no caveat. Big shareability win.

### Phase 2 — Reading experience
- Auto-TOC + reading-progress rail.
- Tufte sidenotes + footnotes-as-sidenotes.
- Hover link-previews.
- Related Dispatches + prev/next.
- **Series / Collections** (a frontmatter `series:` field → grouped reading; fixes the category skew by giving structure).
- View Transitions: list-card title → post title morph.

### Phase 3 — Platform
- **Search** — client-side **FlexSearch** over a build-time JSON index of the MDX (preferred over Pagefind for a ~21-post corpus: no built-HTML crawl step, fully under our control, less build wiring). No backend.
- **Scrollytelling `layout: feature`** for tentpole pieces.
- **Archive / Explore** view — by year, by series, by category.
- **Web mentions** + RSS/JSON-feed upgrade.

### v2.1 backlog (explicitly out of v2 — per §10 locks)
- **Audio versions** — TTS-generated narration per essay (ties to the "studio" identity). Heaviest pipeline: generation + storage + player + publish-flow hook + per-essay cost. Cleanly bolt-on-able later with zero rework.
- **Dark-toggle-on-read** — Front is dark by default and Read is light by default in v2; letting the reader flip the Read to dark needs an SSR-safe theme provider (avoid the flash-of-wrong-theme) and isn't load-bearing for the visual mandate.

---

## 8. Technical approach (for the build, post-design)

- **Token-first refactor** — move the inline `style={{}}` styling to Tailwind theme tokens; one palette source. This unblocks every later reskin.
- **Fluid type** via `clamp()` — no breakpoint soup.
- **View Transitions API** + **CSS scroll-driven animations** — native, zero-JS-lib motion; respects `prefers-reduced-motion`.
- **Keep MDX file-based** — it's working; add `series`, render `hero`, add `layout` to frontmatter.
- **FlexSearch** over a build-time JSON index for static search (chosen over Pagefind for this corpus size — see §7 Phase 3).
- Delete the `" 2.tsx"` copy cruft.
- Everything stays on the current Next 15 / Vercel stack — no migration.

---

## 9. Ready-to-paste Claude Design prompt *(tightened to the §10 locks, 2026-05-28)*

> Design **Dispatches v2** — a radical visual reinvention of a deep-tech essayist's blog (tarrysingh.com/blog). Protect the existing "studio voice" soul and reinvent boldly around it.
>
> **Type & colour core — one source of truth (the current build fragments three navies and 3+ gold/rust values; collapse to a single token set):**
> - Display **Gloock**, fluid `clamp()`. Body **IBM Plex Serif**. Micro-labels **IBM Plex Mono**, uppercase `0.22em` tracking (a signature — keep). UI chrome **IBM Plex Sans** (completes the Plex family; replaces Inter).
> - **Light "Read" palette:** paper cream `#fbf7ec`, ink navy `#0d1b3d`, **one** accent rust `#b45309`, **one** gold hairline. Retire the duplicate navies/golds.
> - **Dark "Front" palette:** deep ink `#0b1020`, warm cream text `#f6ead0`, brightened rust `#e8954a`, gold `#c9a96e`.
>
> **Deliver three registers sharing that system:**
> 1. **"The Front"** — a **dark**, art-directed `/blog` index. Full-bleed flagship-essay hero (oversized fluid Gloock title over imagery, mono kicker). An editorial grid of Essay cards, each carrying a **slug-deterministic generative cover plate in the studio's Synaptic-plate grammar fused with a sumi-e brush base**: a graded navy-ink field with a soft radial light-bloom, an instrument-grade foreground object (schematic / lattice / radar-planisphere register), a single warm gold-copper glow used as light, IBM Plex Mono uppercase micro-label kickers. **Reference the live plates at /synaptic/* for the exact world** — same canvas, type, glow, instrument-object discipline. A compact "Notes" stream column (Verge-style second register). Category filter chips (Essays / Notes / Studio).
> 2. **"The Read"** — a **light**, bookish essay page. Sacred 65ch serif measure, architectural Gloock h1, **rendered hero image** (the field exists, wire it), Tufte-style margin sidenotes, auto TOC, slim reading-progress rail, refined code/quote blocks, drop-cap option for flagship essays. Stripe-Press / Craig-Mod-grade calm. A `Part N of M · [Series] →` breadcrumb in the meta and a quiet "Continue this series" rail at the foot — **no loud series chips**.
> 3. **"The Set Piece"** — an opt-in scrollytelling feature layout (Pudding-style pinned visual + scroll-driven narrative + full-bleed diagram sequences) for tentpole deep-tech essays.
>
> **Series (a quiet second axis, ⟂ category):** Sovereign & Geopolitical AI · AI in the Enterprise *(verticals: financial services, healthcare, energy, manufacturing, education, mobility + emerging: humanoid robotics, robotaxis, multiomics)* · The Build · Workforce & Human Ingenuity · The Economics of AI.
>
> **North-stars:** Stripe Press, Craig Mod, Every.to, The Verge (2023), Linear blog, The Pudding, Gwern. **2026 craft:** fluid `clamp()` display that fills the viewport, broken/asymmetric editorial grids, images that bleed, pull-quotes that break the measure, restrained scroll-driven motion + View Transitions **as progressive enhancement** (must degrade to normal nav). The reading column stays pristine; the chrome gets bold.
>
> **Out of scope for v2 (do not design):** audio narration and dark-toggle-on-read — both v2.1.
>
> Show **light + dark, desktop + mobile, index + post + feature.**

---

## 10. Decisions — LOCKED (2026-05-28)

All five resolved with Tarry. These are constraints now, not options.

1. **Cover art — slug-deterministic FUSION: sumi-e brush base + Synaptic instrument-geometry foreground.** *(Revised 2026-05-28 after the Synaptic reference-pack review — see `refpack-synaptic.md`.)* Each post auto-derives a unique-but-coherent cover seeded from its slug: an ink-wash / brush **textural base** (the studio's sumi-e register, shared with the approval emails) carrying a foreground **instrument-object drawn in the Synaptic plate grammar** — graded navy-ink field with a soft radial light-bloom, a single warm gold/copper glow used as *light* (never fill), IBM Plex Mono uppercase micro-label kickers. **The Synaptic plates (`/synaptic/*`) are now the primary visual reference, not a secondary texture.** Zero per-post labour, scales to the daily cadence, unifies blog + approval emails + the Synaptic library into one studio. Commissioned/AI hero reserved for the 2–3 tentpole Set Pieces a year. **Highest-priority Phase 1 component — prototype the generator first; every card and hero depends on it.**
2. **Dark Front / light Read.** Dark art-directed index ("The Front"); essays stay cream-paper light ("The Read"). Dark-toggle-*on-read* deferred to v2.1. `darkMode:["class"]` is already wired in `tailwind.config.ts`.
3. **UI sans — IBM Plex Sans.** Completes the Plex family (serif body + mono labels + sans chrome) — a tighter system than Inter-the-default. `--font-sans` swaps Inter → `IBM_Plex_Sans` in `fonts.ts` + `layout.tsx` during the token refactor.
4. **Audio (TTS narration) — deferred to v2.1.** Out of v2 scope; struck from Phase 3 (see §7). Bolts on later with zero rework.
5. **Series taxonomy — five series, quiet grouping.**

   The five (series is a second axis ⟂ category — this is what fixes the 19/21 "Essays" skew):
   1. **Sovereign & Geopolitical AI** — EU AI Act, export controls, sovereign compute, BRICS+ alignment, talent flows.
   2. **AI in the Enterprise** — the vertical-industries series, ~10 verticals. **Established:** Financial Services · Healthcare · Energy · Manufacturing · Education · Transportation & Mobility. **Emerging:** Humanoid Robotics · RoboTaxis / Autonomous Mobility · MultiOmics & Computational Biology (+ headroom to add, e.g. Defense / Dual-Use, AgTech). *(Education here = AI deployed across the education industry; the human-capital/skills angle lives in series 4 — same word, two lenses.)*
   3. **The Build** — design patterns, HPC + AI infrastructure, agent architectures. The deep-technical register; natural home of the Set Pieces.
   4. **Workforce & Human Ingenuity** — reskilling, upskilling, productivity measurement, the AI-literacy thread.
   5. **The Economics of AI** — capex cycles, hyperscaler spend vs NPV, M&A, the debt stack (technical + AI-slop + cost overhang).

   **Grouping = quiet, but two touchpoints (the session-depth lever):**
   - **Top of post:** a small `Part N of M · [Series] →` breadcrumb in the meta line. This plants the "part of something bigger" hook *before* the reader finishes — empirically the stronger lever for continuation than a foot-only rail.
   - **Foot of post:** a "Continue this series" rail (next-in-series + related Dispatches), the quiet grouping Tarry asked for.
   - Series get **minimal landing pages** (reached from the breadcrumb; good for SEO + the binge-reader) but are **not** promoted as top-nav filter chips. Category chips (Essays / Notes / Studio) stay on the Front; series stays quiet.

§9 below is tightened to these locks and ready to hand to Claude Design.
