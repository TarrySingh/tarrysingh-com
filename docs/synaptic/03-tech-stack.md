# 03 · Tech stack

## TL;DR

**Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · MDX · Vercel.**

That's the recommendation. If the existing repo already uses a different stack (e.g. Astro, Eleventy, plain Vite + React), adapt — don't migrate. The shipped artefact matters more than the tooling.

## Detailed stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 14 App Router** | App Router gives us per-route streaming, server components for the proposal long-form prose, and route handlers for OG-image generation. |
| Language | **TypeScript** strict mode | Non-negotiable for a codebase that other people might fork/audit. |
| Styling | **Tailwind CSS** + `design/tokens.css` extended into `tailwind.config.ts` | Tailwind keeps the visual system inspectable. The design tokens guarantee consistency with the two plates. |
| Components | **shadcn/ui** for primitives (Button, Dialog, Tabs), hand-rolled for everything custom | Don't import a UI kit's *design*. We have our own. |
| Motion | **Framer Motion** | Slow ease curves only. No bouncy springs. See §04. |
| Content | **MDX** via `@next/mdx` or `contentlayer2` | Proposals are long-form essays with embedded interactive React. MDX is the natural fit. |
| Math | **KaTeX** (via `rehype-katex`) | For ν, F1, ≥ 0.95, etc. Render the equations as ink, not text. |
| Diagrams | **Custom SVG components**, no third-party charting library | The two plates are SVG-native. Build a small library of `<Plate>`, `<Annotation>`, `<NumberedDisk>` components and grow from there. |
| Code highlight | **Shiki** (server-side) | Almost zero runtime cost; the proposals reference code only sparingly. |
| Type rendering | **Next/font** with Gloock + IBM Plex Serif + IBM Plex Mono | Variable fonts via Google Fonts. Pre-fetched. |
| Image opt | **`next/image`** for the static plate PNGs | Plates are 2400×3000 — they need responsive `sizes`. |
| OG images | **`@vercel/og`** + React templates that mirror the cover | Every proposal page gets its own OG image generated from the plate. |
| Analytics | **Vercel Analytics** (privacy-respecting, no cookie banner needed) or **Plausible** | EU audience — keep it GDPR-clean. |
| Hosting | **Vercel** | Preview deploys per PR. Edge runtime for OG generation. |
| Domain | `tarrysingh.com` or `synapticcartography.tarrysingh.com` | Decide before launch. The former for personal credibility, the latter for series identity. |
| Package manager | **pnpm** | Faster, leaner, and the lockfile is more diff-friendly than npm's. |
| CI | **GitHub Actions** for typecheck + lint + build-on-PR | Plus Vercel's preview deploys. |
| Testing | **Playwright** for one end-to-end smoke test that walks the cover → MEMPHIS → SYMPHONY path | Keep it small. We are not building Stripe Checkout. |
| Forms | **None.** | We do not collect emails or names. Contact is a `mailto:` link and a Calendly URL. |

## Recommended top-level structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, design tokens, footer
│   ├── page.tsx                # Cover
│   ├── memphis/
│   │   ├── page.tsx            # MEMPHIS proposal page (MDX-backed)
│   │   ├── opengraph-image.tsx # OG image generator
│   │   └── content.mdx
│   ├── symphony/
│   │   ├── page.tsx
│   │   ├── opengraph-image.tsx
│   │   └── content.mdx
│   ├── consortium/page.tsx     # Partners + one-line credentials
│   └── contact/page.tsx        # mailto: + Calendly URL
├── components/
│   ├── plate/
│   │   ├── ChipPlate.tsx       # MEMPHIS interactive, ported from proposals/MEMPHIS/interactive.html
│   │   ├── Planisphere.tsx     # SYMPHONY interactive, ported from proposals/SYMPHONY/interactive.html
│   │   ├── NumberedDisk.tsx
│   │   ├── Annotation.tsx
│   │   ├── Cartouche.tsx
│   │   ├── Waveform.tsx
│   │   └── Movement.tsx
│   ├── editorial/
│   │   ├── ItalicCaption.tsx
│   │   ├── ProseSection.tsx
│   │   ├── SmallCaps.tsx
│   │   ├── PlateNumber.tsx
│   │   └── Hairline.tsx
│   └── nav/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── content/                # MDX loaders, frontmatter typing
│   └── motion.ts               # Shared easing curves
├── styles/
│   ├── globals.css             # Imports design tokens
│   └── prose.css
└── content/
    ├── memphis/                # MDX, figures, footnotes
    └── symphony/
```

## Dependency floor (recommendation)

```jsonc
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "framer-motion": "^11",
    "@next/mdx": "^14",
    "@mdx-js/loader": "^3",
    "@mdx-js/react": "^3",
    "katex": "^0.16",
    "rehype-katex": "^7",
    "remark-math": "^6",
    "shiki": "^1",
    "@vercel/og": "^0.6",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "lucide-react": "^0.4"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "tailwindcss": "^3.4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "@types/react": "^18",
    "@types/node": "^20",
    "eslint-config-next": "^14",
    "playwright": "^1.44"
  }
}
```

## Performance budget

- **LCP < 1.5s** on a 4G connection from Frankfurt.
- **CLS < 0.01** site-wide.
- **JS payload per page < 120 KB gzipped** (the plates are SVG-text, not raster, so this is achievable).
- **No third-party iframes** except the contact-page Calendly embed, lazy-loaded.
- **Lighthouse: 95+ in all four scores.**

## What we will not use

Stripe, Sanity, Contentful, Algolia, Intercom, HubSpot, Tally, Typeform, Mailchimp, ConvertKit, Webflow, Framer, Hotjar, Mixpanel, Segment, any A/B test tool, any cookie consent tool (we don't set tracking cookies), any chatbot, any social-share floating-bar widget.
