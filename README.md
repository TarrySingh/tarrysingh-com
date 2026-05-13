# tarrysingh.com

The personal site of Tarry Singh — entrepreneur, technologist, and AI
strategist — built as a **studio**, not a portfolio: an unfinished,
opinionated working room where the plates on the wall stay up while
the work is still being made.

Live at **[tarrysingh.com](https://tarrysingh.com)**. Source of truth
for the AI strategy work, the Synaptic Cartography proposal series
(EU Horizon · MEMPHIS + SYMPHONY), eight interactive experiment
dashboards, and the Dispatches newsletter.

---

## Quick start

Node **22.x** required (matches the Vercel project pin — do not run
on 24.x without bumping `package.json` first).

```bash
git clone https://github.com/TarrySingh/tarrysingh-com.git
cd tarrysingh-com
cp .env.example .env.local      # then fill the keys you need
npm install
npm run dev                     # → http://localhost:3000
```

The dev server boots in <2 s. Most surfaces work without any env
vars set; the ones that require keys (Stripe checkout, Mapbox tiles,
the PANORAIMA route, the CRM newsletter bridge) fail closed and
fall back to log-only mode or 503 — never crash.

### Build commands

| Command          | What it does                                          |
|------------------|-------------------------------------------------------|
| `npm run dev`    | Next dev server with HMR                              |
| `npm run build`  | Production build (typecheck, optimise, emit lambdas)  |
| `npm run start`  | Serve the production build locally                    |
| `npm run lint`   | ESLint (flat config, eslint-config-next 15.x)         |

`npm run build` runs through TypeScript strict-mode checking and
must pass before any push. Vercel does the same on every deploy.
Lint is currently `ignoreDuringBuilds: true` while a backlog of
~14 pre-existing errors in legacy experiment pages is being worked
through; new code should still lint clean.

---

## Stack

| Layer            | Choice                          | Notes |
|------------------|---------------------------------|-------|
| Framework        | **Next.js 15.5** App Router     | RSC-native; static + dynamic + edge mixed per-route. |
| Runtime          | **React 19.2**                  | Concurrent rendering, server components, async params. |
| Language         | **TypeScript 5** (strict)       | `noEmit`-checked on every build; no `any` in fresh code. |
| Styling          | **Tailwind 3.4** + `@tailwindcss/typography` + `tailwindcss-animate` | Editorial typography + Radix primitives + bespoke studio CSS in `src/app/globals.css`. |
| Fonts (editorial) | **Gloock** (display), **IBM Plex Serif** (body), **IBM Plex Mono** (small-caps cartouche) — via `next/font/google` | The Synaptic Cartography studio voice. |
| Fonts (UI)       | **Inter**, **Instrument Serif**, **Geist / Geist Mono** — case-by-case per experiment | Each experiment dashboard sets its own font stack. |
| Content          | **MDX** via `next-mdx-remote` v6 (RSC `/rsc` subpath)               | Blog posts live under `content/blog/*.mdx`. |
| Code blocks      | **Shiki** (compile-time)        | 0 KB client JS for syntax highlighting; github-light theme. |
| Frontmatter      | `gray-matter` + `reading-time`  | Schema in `src/lib/blog/posts.ts`. |
| Headings         | `rehype-slug` + `rehype-autolink-headings` | `§` anchor that fades in on `h2`/`h3` hover. |
| Markdown         | `remark-gfm`                    | Tables, strikethrough, autolinks. |
| Charts           | **Recharts**                    | Used by financing, risk-return, strategic, agent-and-me. |
| Maps             | **Mapbox GL JS**                | `/jobs`, `/experiments/panoraima`. |
| Animation        | **Framer Motion** + hand-rolled `requestAnimationFrame` clocks for the Synaptic plates | The 9 plates under `/synaptic/*` are not Lottie or libraries — they are hand-coded SVG + RAF. |
| Forms            | **React Hook Form** + Zod resolvers (where needed) | Most forms are tiny (newsletter, unsubscribe) and skip Zod. |
| Persistence      | **Supabase** (`@supabase/supabase-js`) | Used by the simulation API; the rest of the site is static + lambdas. |
| Payments         | **Stripe** (`stripe` server SDK + `@stripe/stripe-js` client) | Token-purchase experiment at `/api/stripe/*`. |
| Transactional email | **Resend** — *via* RealAI-CRM (this repo never calls Resend directly) | Newsletter sends are dispatched by the cadence engine in `realai-crm`. See `docs/cross-repo/realai-crm-tarrysingh-webhook.md`. |
| Crypto           | Node `crypto` — HMAC-SHA256 for the CRM webhook signature; HMAC-SHA256 for unsubscribe tokens | All in `src/lib/crm/`. |
| Package manager  | **npm** (lockfile in repo)      | Do not run `pnpm` or `yarn`; the Vercel build assumes npm. |

---

## Route map

### Public

| Path                                       | Type    | What it is |
|--------------------------------------------|---------|------------|
| `/`                                        | Static  | Studio cover. Hero, three stats, Synaptic Cartography section (interactive vision banner + Symphony/MEMPHIS cards), experiments grid, Dispatches CTA, Let's-Connect banner. |
| `/about`                                   | Static  | Bio. |
| `/experiments`                             | Static  | The catalogue. 10 experiments, newest first. |
| `/experiments/agent-and-me`                | Static  | Agentic AI verticals hub (10 industries). Sub-paths for BFSI: `/bfsi`, `/bfsi/commercial-credit-analyst`, `/bfsi/consumer-lending-analyst`, `/bfsi/credit-risk-modeler`, `/bfsi/mortgage-specialist`. |
| `/experiments/disruption`                  | Static  | Winner-take-all scatter (interactive bubbles). |
| `/experiments/financing`                   | Static  | Startup cash-flow curve (seed → IPO). |
| `/experiments/insane-pace-of-ai`           | Static  | 75-section Q1 2026 executive dashboard. The site's heaviest single page. |
| `/experiments/risk-return`                 | Static  | Generative-AI venture risk-return plot (draggable bubbles). |
| `/experiments/strategic`                   | Static  | Strategic positioning (Arthur D. Little 2×2). |
| `/synaptic`                                | Static  | Series home for the Synaptic Cartography proposal microsites. Interactive `VisionHorizon` banner, MEMPHIS + SYMPHONY plate cards, four partner cards, deep-dive nav. |
| `/synaptic/symphony`                       | Static  | Plate II — *the planisphere*. Full proposal microsite. |
| `/synaptic/symphony/proposal`              | Static  | 12-section proposal deep-dive (V5 dossier). |
| `/synaptic/symphony/ramaswamy`             | Static  | Newcastle partner spread (`RamaswamyCortexHero` interactive plate). |
| `/synaptic/symphony/siciliano`             | Static  | CREATE-PRISMA partner spread (`SicilianoArmHero`). |
| `/synaptic/symphony/tarry`                 | Static  | Real AI / coordinator spread (`HominisHero`). |
| `/synaptic/symphony/uprobotics`            | Static  | Industrial demonstrator (`UpRoboticsFactoryHero`). |
| `/synaptic/memphis`                        | Static  | Plate I — *the chip*. Microsite with 5 interactive plates: `ChipPlate` (RAF-animated awake/sleep), `Ca3Ca1Circuit`, `StdpWindow`, `TwoPhaseDynamics`, `EnergyGradient`. |
| `/synaptic/memphis/proposal`               | Static  | 9-section proposal deep-dive (V5X dossier). |
| `/blog`                                    | Static  | **Dispatches** index. Editorial; quietly written. |
| `/blog/[slug]`                             | SSG     | MDX article page. Heading anchors, Shiki code, captioned figures, cartouche footer. |
| `/blog/rss.xml`                            | Static (1 h ISR) | RSS 2.0 feed of all posts. |
| `/blog/unsubscribe`                        | SSR     | One-click unsubscribe confirmation. Reads `?e=<email>&t=<token>`. |
| `/jobs`                                    | Static  | European AI Exposure microsite (its own dark/light theme system). |
| `/jobs/{about,agentic,compare,industry}`   | Static  | Sub-routes of the jobs microsite. |
| `/jobs/country/[code]`                     | SSR     | Per-country drilldown. |
| `/jobs/occupation/[isco]`                  | SSR     | Per-occupation drilldown. |
| `/mklaar` *(rewritten)*                    | Rewrite | Proxies to `https://mklaar.vercel.app/mklaar/*` — Dutch real-estate venture, kept on its own deploy. |
| `/sitemap.xml`                             | Static  | All public paths + blog posts. |
| `/robots.txt`                              | Static  | Allow everything except `/experiments/panoraima` and `/api/*`. |

### Protected

| Path                                       | Auth                              | What it is |
|--------------------------------------------|-----------------------------------|------------|
| `/experiments/panoraima`                   | HTTP Basic (`PANORAIMA_USER`/`PASS`) via `src/middleware.ts` | EU Horizon consortium dashboard. Fails closed: missing env vars → 401. `X-Robots-Tag: noindex, nofollow` on all responses. |
| `/experiments/panoraima/wps`               | same                              | Work-package overview. |
| `/experiments/panoraima/wps/[wp]`          | same                              | WP detail. |
| `/experiments/panoraima/wps/[wp]/[task]`   | same                              | Task detail (e.g. WP2 / T2.3). |

### Redirects (permanent · 308)

| From                       | To                                  |
|----------------------------|-------------------------------------|
| `/symphony`                | `/synaptic/symphony`                |
| `/symphony/:path*`         | `/synaptic/symphony/:path*`         |
| `/memphis`                 | `/synaptic/memphis`                 |
| `/memphis/:path*`          | `/synaptic/memphis/:path*`          |

Sub-paths preserved. Configured in `next.config.ts`.

### API

| Path                                  | Method | What it does |
|---------------------------------------|--------|--------------|
| `/api/newsletter/subscribe`           | POST   | Validates email shape, builds a `LeadPayloadV1`, HMAC-signs with `CRM_WEBHOOK_SECRET`, POSTs to RealAI-CRM's `/api/webhooks/tarrysingh`. Falls back to log-only mode (still returns 200) when `CRM_WEBHOOK_URL` is unset. |
| `/api/newsletter/unsubscribe`         | POST/GET | One-click unsubscribe. Verifies the HMAC `?t=` token against `CRM_UNSUBSCRIBE_TOKEN_SECRET`, forwards a `source: "unsubscribe"` event to the CRM. Fail-closed: 503 if secret unset, 403 if token mismatch. |
| `/api/simulation`                     | POST   | Supabase-backed simulation experiment. |
| `/api/stripe/checkout`                | POST   | Stripe Checkout session creator. |
| `/api/stripe/webhook`                 | POST   | Stripe webhook receiver. |
| `/api/tokens`                         | GET    | Tokens-purchased experiment. |

### Custom 404s

| File                            | Variant         | What it is |
|---------------------------------|-----------------|------------|
| `src/app/not-found.tsx`         | Cream paper, editorial McKinsey | "*This plate has wandered.*" — four bordered doors back to Studio / Synaptic / Experiments / Dispatches. Triggered for any unmatched URL outside `/synaptic/*`. |
| `src/app/synaptic/not-found.tsx` | Midnight indigo, studio palette | "*This plate is not currently hung.*" — four doors back into the series. Triggered for unmatched `/synaptic/*` URLs via the `[...catchAll]/page.tsx` route that calls `notFound()`. |

---

## Content authoring

### Adding a blog post

1. Create `content/blog/<kebab-slug>.mdx`.
2. Frontmatter (YAML, required keys marked):

   ```yaml
   ---
   title: "Why I rebuilt this site around a studio"          # required
   date: "2026-05-12"                                          # required, ISO date
   category: "Essays"                                          # required, one of: Essays | Notes | Studio
   excerpt: "After thirty years..."                            # required, 1–2 sentences
   hero: "/blog/hero-image.png"                                # optional
   theme: "editorial"                                          # optional: editorial (default) | studio
   linkedin_url: "https://linkedin.com/posts/..."              # optional, surfaces a "Discuss on LinkedIn" pill
   draft: false                                                # optional, hidden in production when true
   tags: ["studio", "writing"]                                 # optional
   ---
   ```

3. Body is plain MDX. Custom components are wired in `src/lib/blog/mdx-components.tsx`:
   - Headings render in Gloock; bodies in Plex Serif at 1.85 line-height.
   - Code fences (` ```ts `) compile through Shiki at build time. Zero client-side JS.
   - Images use `next/image` automatically, with alt-text as the caption.
   - Blockquotes get a copper hairline border.
   - Heading anchors (`§`) fade in on hover.

4. `npm run build` will pick up the file. The blog index, the post page, the RSS feed, and the sitemap all refresh from the same `getAllPosts()` reader in `src/lib/blog/posts.ts`.

The two seed posts in `content/blog/` are the reference for tone and structure.

### Adding a plate to the Synaptic Cartography series

Plates are not stock illustrations — they are hand-coded interactive SVG components living in `src/components/synaptic/`. The series style guide is in `proposals/SYMPHONY/` and `proposals/MEMPHIS/` (interactive HTML references) and `design/tokens.css` (palette, hairlines, panel surfaces).

Process for a new plate:

1. Decide its identity: PLATE marker (`PLATE VI` etc.), date in roman numerals (`MMXXVI`), figure number (`FIG. 2.1`), title, side-panel headline.
2. Sketch the SVG in code at `viewBox="0 0 1400 820"` (or similar — keep aspect 16:10 ish so it fits the page rhythm).
3. Header rows always:
   - Row 1 at `y=42` — `PLATE N · MMXXVI · FIG. X.Y` (left) + side-panel headline (right), both Plex Mono 12 pt uppercase tracking-wide.
   - Hairline at `y=58`.
   - Row 2 at `y=108` — title in Gloock 42 pt.
   - This is the `PAD_TOP = 168` convention.
4. Side panel always:
   - Right-side rounded rect, `width = PAD_RIGHT = 380`, inner padding 32 viewBox units.
   - Title in `foreignObject` so it wraps cleanly. Body too — never bare `<text>` for paragraph copy.
   - `wordWrap: break-word; overflowWrap: anywhere` so em-dashed compound terms break.
5. Cartouche (bottom right): plate name + date + author "T. Singh" + the word "PROJECTIONS" if any italic figure on the plate is a projected (not measured) value. The cartouche is what gives the plate permission to be honest.
6. Animation rules:
   - Use `requestAnimationFrame` with a `let last = performance.now()` clock — not CSS keyframes for anything functional. CSS keyframes are fine for "this colour pulses".
   - Honour `prefers-reduced-motion: reduce`.
   - Two-phase plates (awake/sleep, on/off) should make the phase transition legible. The reader must be able to tell which phase they're in within 2 seconds of looking.
7. Embed the new plate in `src/app/synaptic/<project>/page.tsx` with a section number and a JumpNav anchor. Update `proposals/<PROJECT>/design-philosophy.md` and `docs/synaptic/10-plate-library.md` if the studio rules need a new entry.

One italic close per page. (See `docs/synaptic/02-voice.md` for the voice rules — McKinsey-cold + scientific-illustration-honest, never both clinical and dry, never SaaS-cute.)

---

## Newsletter pipeline (Dispatches)

The newsletter is a two-repo dance.

### Subscribe path

```
visitor → NewsletterCard / NewsletterPeek (client component)
     │
     ▼ POST /api/newsletter/subscribe { email, source, utm_* }
     │
     ▼ src/lib/crm/post-lead.ts
     │   builds LeadPayloadV1 { version, eventId (UUID), ts, source: "newsletter", lead, context }
     │   HMAC-SHA256 over raw JSON with CRM_WEBHOOK_SECRET
     ▼
RealAI-CRM /api/webhooks/tarrysingh (sibling repo, see docs/cross-repo/)
     │   verifies X-Tarrysingh-Signature
     │   upserts CrmContact (idempotent on email)
     │   enrols in "Tarrysingh Welcome" cadence (3 emails over 14 days)
     ▼
Resend dispatches email N at scheduled time
```

### Failover

When `CRM_WEBHOOK_URL` is unset on the Vercel project (e.g. the CRM
side hasn't been built yet, or the receiver is down), the handler
**falls back to log-only mode**: still returns `{ ok: true, outcome: "logged" }`
to the visitor, but writes a structured JSON line tagged
`crm.lead.unconfigured_log_only` to Vercel runtime logs. Subscribers
captured during a gap window get replayed by hand once the CRM is
live:

```bash
vercel logs --since=2026-05-01 \
  | grep crm.lead.unconfigured_log_only \
  | jq .
```

For each line, rebuild a `LeadPayloadV1` and POST it to the CRM
endpoint (HMAC-signed) with a fresh `eventId`.

### Surfaces

| Surface                              | Static `<NewsletterCard>` (wide) | Peek (slide-up, 60% scroll) |
|--------------------------------------|----------------------------------|------------------------------|
| `/`                                  | ✅ between experiments and CTA   | ✅                           |
| `/about`                             | —                                | ✅                           |
| `/experiments` + 7 subpages          | ✅ at page foot                  | ✅                           |
| `/experiments/panoraima/*`           | — (auth-gated audience)          | ✅                           |
| `/blog`                              | ✅ below post list               | ✅                           |
| `/blog/[slug]`                       | ✅ compact, under cartouche      | ✅                           |
| `/jobs`                              | ✅ at page foot                  | ✅                           |
| `/synaptic/*`                        | — (kept reverent)                | — (studio palette)           |

### Unsubscribe path

The `List-Unsubscribe` header on every Dispatches email points at
`/blog/unsubscribe?e=<email>&t=<hmac>`. The token is HMAC-SHA256 of
the lowercase email keyed by `CRM_UNSUBSCRIBE_TOKEN_SECRET`,
truncated to 16 bytes / 128 bits, URL-safe base64. The receiver:

1. Verifies the token (constant-time hex compare).
2. POSTs a `source: "unsubscribe"` event to the CRM.
3. CRM upserts `CadenceUnsubscribe` (idempotent on email). All
   current and future cadence sends for that address halt.

Tokens have no TTL by design — old List-Unsubscribe links should
still work. The window is bounded by the lifetime of the secret;
rotating it invalidates every old token at once.

---

## Sibling repos

The site is the surface; the data and side-channels live elsewhere.

| Repo at `~/Documents/GitHub/`   | Role                                                                 | Used by |
|---------------------------------|----------------------------------------------------------------------|---------|
| `realai-crm`                    | CRM + cadence engine + Resend dispatch. Receives the Dispatches subscribe + unsubscribe events; enrols leads in cadences; sends transactional email. | Newsletter pipeline; future LinkedIn syndication. |
| `panoraima`                     | EU Horizon project data pipeline. Regenerates `src/lib/panoraima/timeline_data.json` via `scripts/refresh-panoraima.sh` and commits it here. | `/experiments/panoraima/*`. |
| `mklaar`                        | Dutch real-estate AI venture (separate Next app, separate Vercel project). | `/mklaar` rewrites here forward to `https://mklaar.vercel.app/mklaar/*`. |

Cross-repo handover briefs live in `docs/cross-repo/`. Each brief
is self-contained: a fresh engineering session (human or Claude) can
follow it without context from this repo.

---

## Deploy contract

**This repo must ONLY deploy to the DK AI Lab (`dkailab`) Pro team
on Vercel.** A previous `dev-loks-projects/tarrysingh-com` hobby
duplicate was deleted on 2026-04-17 because it was mirroring every
push. **Do not recreate it.**

| Setting            | Value                                       |
|--------------------|---------------------------------------------|
| Vercel team slug   | `dkailab`                                   |
| Vercel team ID     | `team_vNY634Hu3FvyCbrZDNxWywUt`             |
| Project slug       | `tarrysingh-com-zdmb`                       |
| Project ID         | `prj_tj12Oa33L58ZXFPw51NukG5lP2Ht`          |
| Custom domain      | `tarrysingh.com` / `www.tarrysingh.com`     |
| Production branch  | `main`                                      |
| Node version       | `22.x` (matches `package.json` engines)     |

Before any `vercel` CLI call, verify:

```bash
cat .vercel/project.json   # orgId must be team_vNY634Hu3FvyCbrZDNxWywUt
vercel whoami              # must be logged into an account with DKAILab access
```

If `projectId=prj_5fU8LBpPxxaGlXyhlNJiFaPPtPSl` appears anywhere,
**stop** — that was the old hobby project.

### Workflow

Production deploys automatically on every push to `main`. Tarry's
working preference is **many small atomic commits straight to main**
(or a short-lived PR that's rebased onto main), rather than long
feature branches with a big PR at the end. The Synaptic Cartography
microsite and the Dispatches launch both shipped this way:

- Each conceptually atomic change → its own commit.
- Each commit has a verb-prefixed subject (`feat(...)`, `fix(...)`,
  `chore(...)`, `docs(...)`).
- Commit body explains the *why*, not the *what*.

Vercel debounces — pushing N commits in one `git push` triggers one
build on the new `HEAD`, not N.

### Env vars

Set on the DK AI Lab Vercel project across **Development**,
**Preview**, and **Production**. `.env.example` documents the keys
only — values live in Vercel.

| Key                                  | Required by                                   |
|--------------------------------------|-----------------------------------------------|
| `ANTHROPIC_API_KEY`                  | Simulation API.                               |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Simulation API. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `/api/stripe/*`. |
| `NEXT_PUBLIC_SITE_URL`               | Stripe redirect URLs. Set to `https://tarrysingh.com`. |
| `PANORAIMA_USER`, `PANORAIMA_PASS`   | `/experiments/panoraima/*` Basic Auth. Middleware fails closed (401) when either is missing. |
| `CRM_WEBHOOK_URL`                    | Newsletter subscribe → CRM. Unset = log-only fallback. |
| `CRM_WEBHOOK_SECRET`                 | HMAC shared with `TARRYSINGH_WEBHOOK_SECRET` in `realai-crm`. |
| `CRM_UNSUBSCRIBE_TOKEN_SECRET`       | `?t=` token signing for the unsubscribe link. Fail-closed at 503 when unset. |

---

## AI-agent contract

This repo is partly written and maintained by AI agents (Claude
Code, Claude Agent SDK sessions). Conventions for those agents:

- **Read `CLAUDE.md` first.** It sets the deploy-target rules,
  middleware contract, and Node version pin in language that
  matters when Vercel is touched.
- **Memory** at `/Users/tarrysingh/.claude/projects/<...>/memory/MEMORY.md`
  carries Tarry's standing preferences (micro-commits to main;
  plates must be interactive, not PNGs; etc.).
- **Skills** surfaced via the Claude Code skills system —
  `plate-new`, `plate-verify`, `content-audit`, `demo-rehearsal`,
  `ship-deploy` — are the maintained tools for working on this
  site. Use them when the user invokes them or when they're
  obviously the right move.
- **Cross-repo work** goes via a self-contained brief filed under
  `docs/cross-repo/`. Never modify `realai-crm`, `panoraima`, or
  `mklaar` from this repo's session — file the brief, spawn a
  separate session rooted at the sibling repo, or hand the brief
  to a human.
- **The "300 micro commits" workflow** is real — when a feature
  spans many files, ship many small commits, not one. Each one
  should pass typecheck + build on its own.

---

## Glossary — where to find things

| If you need…                              | Look in                                                                  |
|-------------------------------------------|--------------------------------------------------------------------------|
| Design tokens (palette, hairlines, panels) | `design/tokens.css`                                                      |
| Editorial fonts                           | `src/app/fonts.ts`                                                       |
| The studio backdrop (radial indigo + starfield + grain) | `src/app/globals.css` — search for `.syn-root`                          |
| Synaptic plates (the 9 interactive ones)  | `src/components/synaptic/`                                               |
| Blog reader + MDX components + Shiki      | `src/lib/blog/`                                                          |
| Blog page templates                       | `src/app/(main)/blog/`                                                   |
| CRM client (HMAC, post-lead, unsubscribe token) | `src/lib/crm/`                                                       |
| Newsletter UI (card, peek, footer wrapper) | `src/components/blog/`                                                  |
| Main layout (Navbar + Footer + Peek)      | `src/app/(main)/layout.tsx`                                              |
| Synaptic layout (back-pill + catch-all)   | `src/app/synaptic/layout.tsx`, `src/app/synaptic/[...catchAll]/page.tsx` |
| Sitemap / robots                          | `src/app/sitemap.ts`, `src/app/robots.ts`                                |
| Redirects                                 | `next.config.ts`                                                         |
| PANORAIMA middleware                      | `src/middleware.ts`                                                      |
| Proposal source dossiers                  | `proposals/SYMPHONY/`, `proposals/MEMPHIS/`                              |
| Plate library specification               | `docs/synaptic/10-plate-library.md`                                      |
| Cross-repo handover briefs                | `docs/cross-repo/`                                                       |

---

## License

Source code under MIT (see `LICENSE` if present, else assume MIT).
Studio assets — plates, proposal text, dossiers, photographs — are
**not** MIT-licensed and remain the work of Tarry Singh & the
Synaptic Cartography contributors. Reuse of those assets requires
written permission.

## Contact

LinkedIn — [linkedin.com/in/tarrysingh](https://linkedin.com/in/tarrysingh).
The site's footer puts that link two clicks from every page.

— *the studio*
