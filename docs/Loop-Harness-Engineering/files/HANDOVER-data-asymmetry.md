# Claude Code Handover — "The Data Asymmetry" interactive

**Deliverable:** a scroll-driven interactive web component ("data iceberg") that accompanies a new article on the frontier-model vs. enterprise-data asymmetry.
**Owner:** Tarry Singh · Real AI
**Target repos:** `tarrysingh.com` (Astro/MDX blog) primary · portable to `realai.eu`
**Handover date:** July 2026
**Companion assets in this drop:** `data-iceberg.svg` (visual north star), `data-iceberg-slide.pptx` (deck version), `data-iceberg.html` (static reference build).

---

## 0. TL;DR for the agent

Build a **self-contained, dependency-light React component** that renders a **data iceberg** and reveals it through **scroll**: the reader descends past the waterline, the submerged mass of enterprise data is progressively exposed, and a ratio counter climbs to `1 : 1,000,000,000`. It embeds as an Astro island in an MDX article and must also run standalone.

Five hard rules, in priority order:

1. **Numbers are frozen.** Every figure the UI shows comes from `iceberg-data.ts` (Section 4). Do not invent, round differently, or "improve" them. Each has a source.
2. **Copy is frozen.** Every on-screen string comes from the copy deck (Section 8). Do not generate marketing filler or paraphrase. Founder voice, sentence case, no em-dash soup, no "unlock/leverage/harness/dive in."
3. **Footer reads exactly:** `© Tarry Singh`. The string **"Data & AI Cosmos" must never appear** anywhere in this component.
4. **Motion is optional, never required.** `prefers-reduced-motion` and no-JS both resolve to a legible static end-state. The article must make sense with the component frozen.
5. **Mobile-first.** It is read on a phone first. Ship the small-screen layout before the desktop flourish.

If a decision isn't specified here, choose the **simpler, fewer-dependencies, more-accessible** option and leave a `// HANDOVER:` comment noting the choice.

---

## 1. Context & intent

The article argues a single thesis: **frontier LLMs were trained on a distilled sliver of public text; the world's enterprise data — proprietary, resident, and unseen — is the mass below the waterline, and that mass is the entire case for sovereign AI.** The component is the article's centrepiece — the moment the reader *feels* the asymmetry rather than reads a number.

- **Audience:** technical-but-mixed (founders, enterprise buyers, banking/energy decision-makers, some investors). Assume smart, skimming, on mobile, skeptical of hype.
- **Where it lives:** inline in an MDX post on the Astro blog, roughly one-third down, as the payoff to the setup. Reused later as a standalone hero on a `realai.eu` sovereign-AI page.
- **Job of the component:** in ~3 seconds convey "public models saw ~0%", and reward a scroll with the full breakdown and the `1 : 10⁹` kicker.

This is **explanatory, not decorative**. Every visual element must encode something true. No ambient particle noise for its own sake.

---

## 2. The thesis & the numbers — single source of truth

These are the canonical figures. They are defended in the source research (Section 15). Bind the UI to the constants file; never hard-code a number in JSX.

| Quantity | Value | Note |
|---|---|---|
| Curated training text (frontier run) | **≈ 44 TB · ~15T tokens** | FineWeb / Llama 3 anchor |
| Raw web filtered to produce it | **≈ 40 PB** | HF distilled ~38,000 TB → ~45 TB |
| Ceiling of all high-quality public text | **~100–200T tokens** | English ~40–90T; +non-English |
| All text that exists incl. private | **~2,000T tokens** | e.g. Gmail ~400T, FB posts ~140T |
| Global datasphere (annual flow, 2025) | **~175–200 ZB** | IDC; created + captured + **replicated** |
| Stored, retained enterprise data | **≈ 10–20 ZB = 10,000,000 PB** | installed StorageSphere; enterprises 80%+ of installed bytes |
| Training text : stored enterprise data | **≈ 1 : 1,000,000,000** | by raw volume |
| Enterprise corpus unseen by public models | **> 99.9999%** | and structurally out-of-distribution |

**The honest caveat the article makes (surface it in the component's closing copy, do not bury it):** the gap is *not* primarily a volume problem — much enterprise data is low-entropy (replicated backups, IoT streams, video). The real point is that the **high-value proprietary corpus is categorically outside every public model's training distribution**. That's the sovereign-AI wedge. The `RatioCounter` sells volume; the closing line must reframe it as *distribution*, not just size.

### `iceberg-data.ts` — implement exactly this shape

```ts
// iceberg-data.ts — the ONLY place figures and copy live. Treat as frozen.

export interface Figure {
  /** machine value for any computation (bytes where sensible) */
  raw: number;
  /** exactly what renders on screen */
  display: string;
  /** short source tag, keyed to SOURCES below */
  source: keyof typeof SOURCES;
}

export const SOURCES = {
  idc:      { label: "IDC Global DataSphere 2025", url: "https://my.idc.com/getdoc.jsp?containerId=US53363625" },
  fineweb:  { label: "Hugging Face FineWeb (2024)", url: "https://arxiv.org/abs/2406.17557" },
  llama3:   { label: "Meta Llama 3", url: "https://ai.meta.com/blog/meta-llama-3-1/" },
} as const;

export const ICEBERG = {
  tip: {
    eyebrow: "TRAINED ON",
    primary:   { raw: 44e12,  display: "≈ 44 TB curated text · 15T tokens", source: "fineweb" } as Figure,
    secondary: { raw: 40e15,  display: "distilled from ≈ 40 PB of raw web crawl", source: "fineweb" } as Figure,
  },
  mass: {
    eyebrow: "NEVER SEEN",
    primary:   { raw: 15e21,  display: "≈ 10–20 ZB stored enterprise data", source: "idc" } as Figure,
    secondary: { raw: 2000e12, display: "= 10,000,000 PB · ~2,000T tokens of all text ever", source: "idc" } as Figure,
    tertiary:  "your proprietary corpus — structurally out-of-distribution",
  },
  ratio: {
    label: "TRAINING TEXT   :   STORED ENTERPRISE DATA",
    // counter animates 1 -> target; render as "≈ 1 : {target}"
    target: 1_000_000_000,
    caption: "by raw volume · >99.9999% never seen by any public model",
  },
} as const;
```

If you must add a field, extend the interface — don't sneak string literals into components.

---

## 3. Scope

**In scope**
- One React component, `<DataIceberg />`, embeddable as an Astro island and runnable standalone.
- Scroll-driven reveal, ratio count-up, responsive layout, reduced-motion + no-JS fallback, a11y.
- Typed data/copy module, design tokens, minimal styles.

**Out of scope**
- Article prose (Tarry writes it). CMS wiring, analytics, A/B infra.
- Any backend, API call, or data fetch. The component is fully static/offline.
- A charting library, 3D, WebGL, or canvas. This is SVG + CSS transforms.

**Non-goals**
- No "AI-generated slick" excess: no floating gradient orbs, no parallax star-fields, no scroll-jacking that traps the reader. Scroll stays native and reversible.
- No new brand names or taglines. No `localStorage`/`sessionStorage`.

---

## 4. Tech stack & repo integration

- **Language:** TypeScript, `strict: true`.
- **Framework:** React 18 function components + hooks. Rendered in Astro via an island.
- **Styling:** Tailwind utility classes **for layout only**; a single `iceberg.module.css` holds the scene tokens, gradients, and keyframes. Do not depend on the host site's Tailwind config for colors — define the palette locally as CSS custom properties so the component is portable to `realai.eu` unchanged.
- **Motion:** prefer a custom `useScrollProgress` hook driving CSS custom properties (`--p`, 0→1). `framer-motion` is **allowed but optional** — if you pull it in, justify it in a `// HANDOVER:` note and keep total added JS small. No GSAP, no ScrollMagic.
- **No data libs, no icon packs.** Any glyph is inline SVG.

**Astro embed (primary target).** The blog is Astro/MDX. Usage in a post:

```mdx
import { DataIceberg } from "../../components/DataIceberg";

<DataIceberg client:visible />
```

- Use `client:visible` so the island hydrates only when scrolled near — keeps the article's TTI clean.
- The component must **render a complete, correct static frame on the server** (SSR) so that pre-hydration and reduced-motion users see the finished iceberg, not a blank box.

**Standalone target.** Provide a tiny Vite harness (`/standalone`) that mounts `<DataIceberg />` full-page for local dev and for the `realai.eu` reuse. No router.

---

## 5. Architecture & file structure

```
src/components/DataIceberg/
├── index.ts                 # barrel: export { DataIceberg }
├── DataIceberg.tsx          # scrollytelling wrapper: tall track + sticky scene, owns progress
├── IcebergScene.tsx         # the SVG scene; pure, driven by `progress` prop (0..1)
├── StatCallout.tsx          # reusable tip/mass callout (eyebrow + figures + source dot)
├── RatioCounter.tsx         # count-up 1 -> target, respects reduced motion
├── SourceTag.tsx            # tiny "i" affordance -> source label + link on hover/focus/tap
├── hooks/
│   ├── useScrollProgress.ts # rAF + getBoundingClientRect; returns 0..1 for the track
│   └── useReducedMotion.ts  # matchMedia('(prefers-reduced-motion: reduce)')
├── iceberg-data.ts          # Section 4 — frozen figures + copy
└── iceberg.module.css       # palette custom-props, gradients, keyframes, responsive rules
standalone/                  # Vite harness (dev + realai.eu reuse)
└── main.tsx
```

**Responsibilities**
- `DataIceberg.tsx` renders a `~300vh` **track**; inside it a `position: sticky; top: 0; height: 100vh` **stage**. `useScrollProgress` maps the track's scroll through the viewport to `progress ∈ [0,1]` and writes it to a CSS var on the stage plus passes it to `IcebergScene`.
- `IcebergScene.tsx` is **pure and deterministic** given `progress`: no internal timers. This makes SSR trivial (render at `progress = 1`, the finished frame) and testing easy.
- Everything visible is data-bound to `iceberg-data.ts`.

---

## 6. Interaction & motion spec

The scene is the `data-iceberg.svg` composition (viewBox `0 0 1280 720`), animated by `progress`.

**Progress phases** (tune the exact breakpoints; keep them monotonic and reversible):

| `progress` | What happens |
|---|---|
| `0.00 – 0.15` | Entry. Sky + ice **tip** and waterline visible; `TRAINED ON` callout fades/rises in. Gold mass sits just at/below the waterline, mostly clipped. |
| `0.15 – 0.55` | **Descent.** The camera pans down (translate the scene up) / the waterline rises through the frame, progressively exposing the gold **mass**. The mass's scale reads as *much* larger than the tip — that contrast is the whole point. |
| `0.45 – 0.70` | `NEVER SEEN` callout reveals as the mass dominates the frame. |
| `0.70 – 1.00` | `RatioCounter` runs `1 → 1,000,000,000`; caption + closing reframe line settle. Hold the final frame. |

**Camera vs. waterline:** either "descend past a fixed berg" (translateY the scene group) or "raise the waterline" reads correctly — pick one, comment it. Do **not** resize the SVG; animate a transform on a `<g>` and a clip on the mass.

**RatioCounter**
- Animate the integer with an eased curve; because the target is 10⁹, a **linear count is unreadable** — use a curve that spends most time in the visually meaningful low digits then accelerates, or step through order-of-magnitude checkpoints (`1 → 1K → 1M → 1B`) with the number morphing. Format with thousands separators via `Intl.NumberFormat`.
- Trigger once when it enters view (or when `progress` crosses ~0.7). Never re-trigger on every scroll tick.

**Micro-interactions (desktop) / tap (mobile)**
- Hovering/focusing a callout raises its `SourceTag`; tapping on mobile toggles it. Keyboard-reachable.
- Keep it to this. No hover effects that don't convey information.

**Reduced motion (`useReducedMotion` true) and no-JS**
- Render the **finished frame** (`progress = 1`): full iceberg, both callouts, ratio shown as the static string `≈ 1 : 1,000,000,000`. No count-up, no pinning, no transform. The track collapses to normal document flow (no `300vh` empty scroll). The reader gets the whole point instantly.

**Performance of motion:** transform/opacity only. No animating layout properties (width/height/top). `will-change: transform` on the moving group; remove it when idle. Target 60fps on a mid-range phone; no long tasks > 50ms during scroll.

---

## 7. Design system

The `data-iceberg.svg` in this drop is the **visual north star** — match its palette, proportions, and typographic feel. Define the palette locally (portability):

```css
/* iceberg.module.css */
.root {
  --navy:   #080b22;   /* stage background          */
  --sky-1:  #0c1236;   --sky-2: #0a0f2b;
  --water-1:#0a1130;   --water-2:#05081c;
  --royal:  #2040df;   /* brand accent · waterline   */
  --ice:    #eef2ff;   --ice-dim:#c7d2fe;
  --ink:    #e8ecff;   --muted:  #aeb6e0;  --faint:#5b6392;
  --gold:   #f4c04e;   --gold-lt:#f6d894;  --gold-dim:#cbb27a;
}
```

- **Motif:** ice = the seen (cold whites/blue); gold = the unseen value (treasure below the line). The **only** two accent colors that carry meaning are `--royal` (waterline) and `--gold` (the mass). Keep everything else quiet.
- **Typography:** display headline in **Georgia** (Tarry's brand serif), used with restraint and italic on the payoff line ("The value is underwater."). Body/labels/data in the **system sans stack** (`ui-sans-serif, -apple-system, "Segoe UI", Roboto, …`) with tabular figures for numbers (`font-variant-numeric: tabular-nums`). Do not load a web font — system stack + Georgia fallback keeps it fast and offline.
- **Type scale (desktop, scale down ~30% at ≤640px):** eyebrow 13/700/tracked; headline 52; subhead 16.5; callout figure 17–19; ratio 42; caption/source 10.5–13.
- **No decorative rules under titles. No edge accent bars.** The waterline is the one horizontal line and it is *content*, not decoration.
- **Spacing:** generous negative space around the berg; the emptiness of the water is intentional and premium.

---

## 8. Copy deck — verbatim strings

Use these exactly. This is the whole text surface.

- **Eyebrow:** `THE DATA ASYMMETRY`
- **Headline (three lines):**
  - `The training set`
  - `is the tip.`   *(the word "tip" in `--ice-dim`)*
  - `The value is underwater.`   *(Georgia italic, `--gold`)*
- **Subhead:** `Frontier LLMs are trained on a distilled sliver of public text. The world's enterprise data — proprietary, resident, unseen — is the mass below the line.`
- **Tip callout:** eyebrow `TRAINED ON` · `≈ 44 TB curated text · 15T tokens` · `distilled from ≈ 40 PB of raw web crawl`
- **Mass callout:** eyebrow `NEVER SEEN` · `≈ 10–20 ZB stored enterprise data` · `= 10,000,000 PB · ~2,000T tokens of all text ever` · `your proprietary corpus — structurally out-of-distribution`
- **Ratio:** label `TRAINING TEXT   :   STORED ENTERPRISE DATA` · value `≈ 1 : 1,000,000,000` · caption `by raw volume · >99.9999% never seen by any public model`
- **Waterline label:** `WATERLINE`
- **Closing reframe line** (shows at end; the article's actual point — keep it):
  `The gap isn't volume you can scrape. It's a distribution no public model can reach.`
- **Footer:** left `Real AI · Hominis sovereign models` · right `© Tarry Singh`
- **Sources microcopy:** `Scale anchors: IDC Global DataSphere 2025 · Hugging Face FineWeb · Meta Llama 3.`

**Banned in output:** "Data & AI Cosmos"; the verbs unlock / leverage / harness / supercharge / dive in / delve; exclamation marks; emoji.

---

## 9. Accessibility & performance

**A11y (WCAG 2.1 AA)**
- The scene is decorative-with-meaning: give the root SVG `role="img"` and an `<title>`+`<desc>` that state the thesis and the two figures, so screen readers get the point without the animation.
- All callout text and the ratio are **real DOM text**, not baked into the SVG image, and remain in the accessibility tree at all progress values (visually revealed via opacity/transform, never `display:none` until read).
- `SourceTag` toggles are real `<button>`s: keyboard-focusable, `aria-expanded`, visible focus ring (`--royal`), ≥44px tap target.
- Contrast: verify every text/background pair ≥ 4.5:1 (the faint sources line is the risk — it sits on `--navy`; confirm or lighten).
- Honor `prefers-reduced-motion` (Section 6).

**Performance budget**
- Added JS for the component **< 15KB gzipped** (excluding React, which the site already ships). If framer-motion would blow this, don't use it.
- **Zero CLS**: the sticky stage reserves its space; the static/SSR frame matches the hydrated first frame.
- No layout-triggering animation; scroll handler is rAF-throttled and passive.
- Works offline; no network at runtime.

---

## 10. Acceptance criteria — Definition of Done

Ship only when all are true. Self-verify against this list.

- [ ] `<DataIceberg client:visible />` renders inside an MDX post with no console errors and no hydration mismatch.
- [ ] Standalone Vite harness mounts the same component full-page.
- [ ] Every figure on screen matches `iceberg-data.ts` character-for-character; nothing is hard-coded in JSX.
- [ ] Every string matches the Section 8 copy deck; no added marketing language.
- [ ] Footer shows `© Tarry Singh`. A repo-wide search for `Data & AI Cosmos` returns **zero** results.
- [ ] Scroll reveals: tip → descent exposing mass → mass callout → ratio count-up → held final frame, and is fully **reversible** on scroll-up.
- [ ] `RatioCounter` reaches exactly `1,000,000,000`, formatted with separators, and triggers once.
- [ ] With `prefers-reduced-motion: reduce`: no pinning, no count-up, no `300vh` phantom scroll; the finished frame with the static ratio is shown.
- [ ] With JavaScript disabled: the SSR frame shows the complete iceberg + both callouts + static ratio.
- [ ] Mobile (≤390px) layout is legible: no overflow, no horizontal scroll, tap-to-reveal sources works, tap targets ≥44px.
- [ ] Keyboard: every interactive element reachable, visible focus, logical order.
- [ ] Lighthouse (mobile) on the standalone page: Performance ≥ 90, Accessibility ≥ 95, no CLS.
- [ ] Added component JS < 15KB gz; no runtime network requests.
- [ ] `IcebergScene` is pure (no internal timers/state); SSR renders it at `progress = 1`.

---

## 11. Build & run

```bash
# In tarrysingh.com (Astro)
npm install
npm run dev            # verify the MDX post renders the island
npm run build && npm run preview

# Standalone harness
cd standalone
npm install
npm run dev            # full-page component for local iteration / realai.eu reuse
```

**Dependencies:** React (host-provided), TypeScript, Tailwind (layout only). Optional: `framer-motion` (justify if added). Nothing else. Pin versions in the PR description.

---

## 12. Testing / QA

Manual matrix — run before opening the PR:

| Axis | Cases |
|---|---|
| Viewport | 320, 390, 768, 1024, 1440 |
| Motion | motion on · `reduce` on · JS disabled |
| Input | mouse hover · touch tap · keyboard only |
| Direction | scroll down then **up** (reversibility) |
| Embed | inside MDX article · standalone full-page |
| Perf | Lighthouse mobile on standalone; scroll at 4× CPU throttle stays smooth |

Optional automated: a unit test asserting the component renders every `display` string from `ICEBERG`, and a test asserting no occurrence of the banned strings.

---

## 13. Guardrails & conventions

- **Figures & copy are frozen** — changes come from Tarry, not the agent. If a number looks wrong, flag it in the PR; don't silently edit.
- **Footer `© Tarry Singh`; "Data & AI Cosmos" is forbidden.**
- **Founder voice, no LLM filler.** Match the tone of the frozen copy: plain, declarative, specific.
- **Portability:** local palette + system fonts; never assume the host's design tokens.
- **No storage APIs, no analytics, no network.**
- **Commits:** conventional style, present tense (`feat: scroll-driven mass reveal`, `fix: reduced-motion collapses track`). One focused PR. In the PR description include: dependencies added + versions, the Lighthouse numbers, and screenshots/gif of mobile + reduced-motion states.
- Leave `// HANDOVER:` comments anywhere you made a judgment call this doc didn't cover.

---

## 14. Kickoff prompts for Claude Code

Paste these to start. Prompt 1 scaffolds; Prompt 2 builds the interaction.

**Prompt 1 — scaffold**
> Read `HANDOVER.md` in full. Create the `src/components/DataIceberg/` structure from Section 5, plus the `standalone/` Vite harness. Implement `iceberg-data.ts` exactly as Section 4 specifies and `iceberg.module.css` with the Section 7 palette. Build `IcebergScene.tsx` as a **pure** component driven by a `progress: number` prop, reproducing the composition in `data-iceberg.svg` (I've placed it in the repo root as the visual reference). Render all callout text and the ratio as real DOM overlaid on the SVG, not baked into the image. Wire `DataIceberg.tsx` to render the scene statically at `progress = 1` for now (no scroll yet). Confirm it mounts in the Vite harness with zero console errors, then stop and show me the static frame.

**Prompt 2 — interaction**
> Now add the scroll behavior from Section 6: a ~300vh track with a sticky 100vh stage, a rAF-throttled `useScrollProgress` hook, and the phase timeline (tip → descent exposing the gold mass → mass callout → ratio count-up → hold). Implement `RatioCounter` climbing to 1,000,000,000 with an order-of-magnitude-aware curve and `Intl.NumberFormat`. Add `useReducedMotion`: when reduced or JS-off, collapse the track and show the finished frame with the static ratio. Then run the Section 10 checklist and the Section 12 matrix, fix what fails, and report the Lighthouse mobile numbers with a mobile + reduced-motion screenshot.

---

## 15. Appendix — sources & references

- **IDC Global DataSphere 2025** — annual data created/captured/**replicated** ~175–200 ZB; enterprises 80%+ of installed bytes; StorageSphere installed base underpins the ~10–20 ZB *stored* figure. https://my.idc.com/getdoc.jsp?containerId=US53363625
- **Hugging Face FineWeb (2024)** — ~15T-token, ~44–45 TB curated dataset distilled from ~38,000 TB (~40 PB) of Common Crawl; the training-text anchor. https://arxiv.org/abs/2406.17557
- **Meta Llama 3 / 3.1** — frontier open model trained on >15T tokens; corroborates the ~44 TB / 15T-token scale. https://ai.meta.com/blog/meta-llama-3-1/
- **Public-text ceiling & private-data estimates** — ~100–200T public tokens; ~2,000T tokens across all text incl. private stores (Gmail, social) — used for the "all text ever" and "unseen" framings.
- **Visual reference:** `data-iceberg.svg` (this drop) — canonical palette, proportions, and layout. `data-iceberg.html` — working static build. `data-iceberg-slide.pptx` — deck version of the same thesis.

*The article's argument is distribution, not volume: raw byte-count overstates the "knowledge gap" (much enterprise data is low-entropy), but the high-value proprietary corpus is structurally out-of-distribution for every public model — which is the sovereign-AI thesis the component exists to land.*
