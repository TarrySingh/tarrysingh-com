# Repository and published-site baseline

Inspected 9 September 2026. Local checkout: branch `main`, commit `a412f43`, “feat(synaptic): inline subscribe bands through the Chokepoint Paradox flagship”.

## Scope of this audit

Inventoried all 764 tracked paths and scanned relevant text/source paths across `src`, `content`, `design`, `docs`, `scripts` and `proposals`. The directory inventory found 537 source text files, 73 content files, four design files, 185 documentation files, ten script files and fifteen proposal text files; these counts include untracked files under those roots and use the audit's selected text extensions.

Read the project contract, package manifest, README, design documentation, article composition, prose and chart primitives, lazy mounting, navigation and the plate-editing runbook. Studied the published Chokepoint article through its rendered text and a screenshot; read the live Synaptic catalogue and representative local article sources. This was an architectural and editorial audit. It was not a line-by-line security review of every file, a factual audit of every earlier article, or a production build.

The general web reader could not open the supplied site URLs. The browser could, and the live inspection used that route. No authentication or protected pages were involved.

## What the current articles do well

- Chokepoint opens with a concrete object, then moves from its scientific achievement to the institutional consequence.
- It alternates a narrow reading column with expansive interactive figures. The figures sit inside the argument rather than in a separate gallery.
- Chapter titles, a prologue, a constructive final turn and source lists make a book-length piece navigable.
- The published visual language is recognisable: dark blue ground, expressive serif title, tracked mono annotations and selective coloured ink.
- Software 3.0 already explores time, cost curves and linked scientific frontiers with a shared chart foundation.

The new commission should retain those strengths while improving source precision, reducing repeated rhetorical structures, exposing uncertainty and making spatial science genuinely explorable. Descriptions and word counts in existing metadata are editorial claims, not measurements validated in this pass.

## Important discoveries

1. **The live site and checkout differ.** The live Synaptic index contains five cartographies, including `/synaptic/loop-harness`. No corresponding route was present in this checkout's tracked route inventory. Local untracked handoff assets exist for Loop–Harness Engineering. Check the intended source branch and deployed revision before index integration or publication; do not overwrite the live catalogue from an older checkout.
2. **The working tree contains substantial unrelated changes.** They include package manifests, PANORAIMA files, middleware and untracked documents/assets. The planning work is isolated in this new folder. Implementation must preserve that work and compare any required shared edits carefully.
3. **Some design documents describe the original two-proposal site.** The running application now has more routes, articles and a different dependency set. Follow the installed project and the user's new commission when historical guidance describes a superseded scope.
4. **An earlier essay takes a sceptical position on AI discovery.** `content/blog/your-ai-doesn-t-discover-anything-here-s.mdx` is a relevant part of the author's record. The new article should explicitly examine the underlying distinctions and any changed evidence.
5. **Existing captions sometimes describe illustrative instruments.** The new article needs a consistent, visible distinction among data, mathematical illustrations and economic scenarios. Every significant result needs a direct traceable source rather than only an institution's name in a source list.

## Reusable implementation foundations

| Existing file / area | Relevant role |
|---|---|
| `src/app/synaptic/chokepoint-paradox/page.tsx` | Server-side composition of prologue and twelve chapter components interleaved with figures |
| `src/components/blog/chokepoint-prose.tsx` | 690px reading column, 19px prose, 21px leads, chapter markers and source lists |
| `src/components/blog/read-chart-kit.tsx` | Plate frame, palettes, scale helpers and reduced-motion hook |
| `src/components/blog/chokepoint-kit.tsx` | Shared semantic colour system and geometry helpers |
| `src/components/blog/ChokepointJumpNav.tsx` | Existing long-article chapter navigation |
| `src/components/synaptic/JumpNav.tsx` | General in-page navigation, currently desktop oriented |
| `src/components/synaptic/LazyMount.tsx` | Near-viewport mounting; needs a real static-content strategy for the new article |
| `src/app/fonts.ts`, `design/*`, `src/app/globals.css` | Typography, colour and common editorial styling |
| `src/lib/synaptic/registry.ts`, `editor/adapters.ts` | Existing plate editor registration; do not assume a new figure automatically becomes editor-ready |
| `docs/runbooks/synaptic-plate-editing.md` | Content/editor round-trip and publication behaviour |

Declared stack at inspection: Next.js `^15.5.13`, React `19.2.3`, TypeScript 5, Tailwind 3, npm, Node `22.x`; Three.js `^0.185.1`, Recharts, KaTeX and MDX tooling are already in the manifest. Those are declared ranges or versions, not an installed-runtime audit. The scan found a Three.js implementation in an unrelated untracked PANORAIMA lab component; do not import that feature or its data into the public essay.

## Release constraints

There is no `.openai/hosting.json` in this checkout. The site has an existing Vercel deployment contract for the DK AI Lab project. Preserve that destination; this commission does not call for migrating or duplicating hosting. A push to `main` can deploy production. The current work made no route edits, commits, pushes, deployments or subscription changes.

The Sites building and hosting guidance was read to assess the workflow. This deliverable is a local publication plan, so no Site registration or deployment was performed.

## Implementation risks to resolve

- Use server-rendered narrative with isolated client figures; avoid loading every renderer or dataset on first paint.
- Provide static scientific fallbacks before activation. Empty placeholders alone do not meet reading, accessibility or print needs.
- Inspect deep-link positioning as responsive figure heights change. The existing Software 3.0 source already documents sensitivity to deferred mounting and anchors.
- Make references and controls readable on mobile; several older metadata styles are too small to reuse for important information.
- Prevent 3D scenes from running continuously off-screen, and handle GPU context loss or unavailable WebGL without losing content.
- Use a real manuscript count and figure manifest. Existing metadata is not a substitute for either.
- Reconcile live/local source before updating series navigation, sitemap, metadata or launch visibility.

Only the plan files require validation now. Type checking, build, performance testing and article interaction checks belong to the implementation stages and have not been claimed as complete.
