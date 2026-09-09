# Intelligence Without Permission · production record

Research edition, 9 September 2026. The manuscript and all 38 figures are implemented. The expanded ten-instrument system has passed desktop interaction, mobile, touch, scroll, export and static-print checks, followed by visual inspection. Nothing has been published or pushed.

## Deliverable

- **40,376 narrative words** across 18 chapter files. Headings, source notes, captions, navigation, code and bibliography are excluded.
- **38 distinct figures**: 28 in 2D and 10 interactive Three.js instruments.
- **61 numbered primary-source entries**, with additional coordinate and asset provenance.
- Five industry futures: oil and gas; pharmaceuticals and biotech; manufacturing and industrial design; energy and utilities; software and technical services.
- ASML, IBM, Google and Dyson examined through their actual research activity, possible challengers and remaining advantages.
- Server-rendered chapters, navigation, reading progress, optional local resume, citations and a complete Markdown reading copy.
- A full-width editorial feature in the homepage Studio section and Synaptic index, a new article cover, a ten-instrument directory, and a separate index linking all 38 figures.

[Local article preview](http://127.0.0.1:3027/synaptic/intelligence-without-permission) · [Open laboratory](http://127.0.0.1:3027/synaptic/intelligence-without-permission#iwp-laboratory) · [All illustrations](http://127.0.0.1:3027/synaptic/intelligence-without-permission#iwp-visual-index).

Reading copy: `public/synaptic/intelligence-without-permission/intelligence-without-permission.md`.

## Evidence decisions

The Navier–Stokes discussion identifies the announced formulation and separates the released paper and formal artefact from further scrutiny and any Clay decision. Fermat formalisation is distinguished from Wiles’s historical proof. The zeta result is a reported lower-bound improvement, not a solution of the Riemann hypothesis. Protein prediction, binding, analytical chemistry and clinical benefit retain separate meanings and denominators.

Internal research systems are not presented as identical to retail products. Millions of research agents are a scenario, not a million independently competent human scientists or a claimed affordable public capability. Country listings establish one condition of access, not affordability or universal practical availability.

The essay revisits the author’s earlier “Your AI Doesn’t Discover Anything” argument explicitly. It preserves the importance of representational change while rejecting an overly categorical interpretation that would conflict with demonstrated research contributions.

Company-specific allegations of complacency have not been invented. Conditional competitive analysis examines which contributions could become contestable and which facilities, observations, integration capabilities and customer relationships could remain valuable.

## Scientific and numerical verification

- Zeta: mpmath 1.3.0 at 35 decimal digits; 4,961 grid samples and 1,201 critical-line samples. Three known-zero residuals and ζ(2)=π²/6 verified during generation. The finite plot does not establish the hypothesis.
- Lysozyme: experimental 1LYZ chain A and AlphaFold P00698 mature segment, 129 sequence-identical Cα residues. Proper-rotation alignment; RMSD approximately 0.539 Å. Familiar-protein illustration, not a held-out model evaluation. Coordinates, source hashes, licences and units retained.
- Binding: experimental 1STP streptavidin–biotin; a 4 Å proximity threshold. No AI-designed molecule or affinity claim.
- Diamond: COD 9008564 revision 291735, source symmetry expanded into eight periodic sites and 18 boundary-inclusive display sites. Cell 3.56679 Å. Established experimental structure, not a GNoME prediction.
- AlphaEvolve: all 4,096 entries of the published rank-48 complex matrix-multiplication identity checked from literal coefficients. Downloaded notebook code was never executed. Identity verification is distinct from conditioning or hardware speed.
- Natural Earth: public-domain land geometry, source SHA-256 pinned, 127 polygon paths including interior rings. Six sampled countries; grey regions mean unassessed.
- Fifteen automated tests cover the word floor and identifiers, agent budget and checking bottleneck, correlation limits, price accounting, candidate conservation, elapsed-time limits, synthetic geology, coordinate RMSD, molecular distance thresholds, crystal periodicity, metrology residuals, display/data independence and shared-state sanitisation.

The large Lean repositories were inspected as source artefacts, not independently rebuilt. No independent certification of their complete proofs is claimed.

## The revised 3D instruments

The peer review and design rationale are in [visual-research.md](visual-research.md). Primary references include Ciechanowski, Mol*, VTK.js, MathBox, Distill, Three.js and the user’s OpenAI reference. No claim of objective superiority over mature scientific software or guaranteed audience traction is made.

Every instrument now has a question, meaningful inputs, three guided starting states, linked measurements or engineering obligations, four readouts, and a nearby explanation. There are 47 scientific controls and 30 guided states across the set. Camera controls are additional.

| Instrument | Implemented investigation |
|---|---|
| Research atlas | Select a stage, expose paths and separate the four stages. Geometry is conceptual. |
| Vortex | Twist, radial contraction, section position, filament density and spectral colour. The profile reports the stated curve equation, not a fluid solution. |
| Zeta | Choose a sampled real coordinate and imaginary interval, expose the mesh and change height exaggeration. The chart retains untransformed magnitude. |
| Protein | Inspect 129 residues, superimpose or separate the aligned structures, select confidence/displacement/sequence colour, and show tubes, atoms or displacement connectors. |
| Binding | Select 16 ligand atoms, adjust the 2–4 Å proximity threshold and inspect stored neighbours. Distance is not affinity. |
| Crystal | Repeat up to 3×3×3 conventional cells, reveal a partial block and inspect neighbours and two carbon sublattices. |
| Agent laboratory | Change population, distinctness, checking capacity and acceptance assumptions; inspect the plateau and queue. |
| Metrology | Adjust synthetic translation, rotation and distortion; compare the initial and residual fields with RMS over the same sample grid. |
| Motor | Separate the assembly, rotate its rotor and toggle housing, cutaway and copper windings. No performance prediction is implied. |
| Geological section | Move the section and well, blend two hypothetical geometries, adjust vertical exaggeration and switch between horizons and a solid sedimentary block. |

All ten share **50–200% magnification**, dedicated +/− buttons and a slider, named front/top/isometric views, keyboard rotation, touch pinch, optional labels, lighting, expanded inspection, reset, a pinned-readout comparison, a share link and JSON/PNG exports. Ordinary mouse-wheel scrolling over an active canvas magnifies the scene without a modifier key; scrolling outside the canvas moves through the essay. Shared links restore scientific controls; the method explicitly states that the camera returns to its standard view.

Colour scales identify their variable. Vortex colour represents a geometric coordinate or filament family; zeta colour represents transformed magnitude; protein colour can represent confidence, aligned displacement or chain position; metrology colour represents synthetic displacement. Neither a colour treatment nor a camera change alters the numerical data.

The geology is a closed block with procedural grain and bedding, four horizon traces and a well intersection. Sandstone, shale and limestone appearances are illustrative materials. The article has no field location, borehole log or seismic volume from which to claim real subsurface geology. Cesium terrain would add a surface context, not supply those missing strata.

## Reading, rendering and accessibility

The essential reading path remains HTML and SVG. Three.js and its rendering effects load on request. Only one 3D instrument stays active; selecting another disposes the previous renderer. Scientific control changes retain the active renderer and camera while replacing scene geometry. Repeated primitives use instancing; replaced geometries and materials are explicitly disposed. Rendering happens on interaction and resize, with no perpetual animation loop.

Source-derived WebP previews provide the default views without allocating ten GPU renderers. Preview URLs use content revisions to avoid stale cached illustrations. The cover is separately identified conceptual artwork; its brief, hashes and provenance are in [artwork-provenance.json](artwork-provenance.json).

Native labelled inputs and named view buttons support keyboard interaction. Linked plots respond to the available width while keeping readable axis text and a 204-pixel chart height. Expanded instruments support Escape and focus containment. Readers can open the static 2D explanation; printing exposes that explanation and removes controls. WebGL failure preserves the source links, caption and static alternative.

The complete narrative is readable without JavaScript. Wide standalone 2D diagrams can scroll horizontally on small screens instead of shrinking labels beyond legibility. Every figure includes a caption and method/evidence disclosure. The reading copy preserves narrative and numbered source notes, with figure position markers.

## Verification record

The 40,376-word audit, 38 unique placements, 18 sections, numerical/content suite, article-scoped ESLint and production TypeScript validation pass. The existing workspace’s unrelated changes were preserved.

The first complete Chrome acceptance run passed all ten instruments: 47 scientific controls, 30 guided states, renderer persistence, a single active WebGL canvas, finite readouts, comparison/reset, named camera controls, labels, lighting, expansion/Escape, and all zoom buttons, limits and resets. Shared settings restored the selected instrument. JSON included method and readouts; the downloaded PNG contained rendered geometry. Five representative mobile instruments fit 390-pixel layouts. The homepage Studio feature linked to the article. **Zero page errors and zero console errors** were recorded.

The initial final checks passed: ordinary wheel scrolling, Ctrl + wheel zoom, two-finger pinch, readable mobile plots, responsive camera framing, static alternatives for all ten instruments, and corrected print contrast. All 38 figures were captured and visually reviewed. Every illustration-index link resolves, all IDs are unique, and the no-JavaScript reading path renders all 18 chapters and 38 figures with native static-view disclosure. The machine-readable record is [browser-review.json](browser-review.json). Browser captures are local review evidence, not measured field performance.

A subsequent author-requested update enables ordinary mouse-wheel zoom without a modifier. A fresh browser pass on all ten scenes verified both directions, 50–200% limits, reset, a stationary article while zooming inside the canvas and normal article scrolling outside it. No page or console errors were recorded; scoped lint passed. This interaction amendment is recorded separately in the browser review.

The production build passes with Next.js 15.5.13 and Node 22 in an isolated copy, preserving the running development preview. All 400 pages generate; the article is statically prerendered. The current build reports 63.1 kB route JavaScript and 172 kB first-load JavaScript. These are build sizes, not Core Web Vitals. Existing Browserslist, Tailwind ambiguity and edge-runtime notices are unrelated to this article.

Print verification covers static alternatives and representative contrast; a complete paginated book proof was not produced. No physical-device or cross-browser certification is claimed. LCP, INP and CLS targets in the initial plan remain unmeasured. Software-rendered Chrome acceptance establishes behavior in that environment; it is not a claim about frame rate on every phone. The full Lean proof repositories were not rebuilt.

## Publication state

This is an unpublished local research edition with draft `noindex` retained. The homepage and Synaptic feature cards are integrated locally. The existing four-card Studio selection from current upstream was preserved alongside the new feature.

The local checkout predates parts of the live site, including the Loop Harness route. It also contains substantial unrelated working changes. Publication should apply this article and its card integration to the current release branch, then recheck the rapidly developing scientific claims against the release date and remove the draft indexing restriction. The entire stale working checkout must not be deployed as a replacement for current production.

The scoped release sequence is recorded in [publication-plan.md](publication-plan.md), including current-branch integration, final evidence checks, indexing, deployment and public verification.

## Reproduction

Use Node 22, matching the repository engine requirement.

```sh
node scripts/synaptic/audit-intelligence.mjs
node --import tsx --test scripts/synaptic/intelligence.test.ts
node --import tsx scripts/synaptic/export-intelligence.ts
node node_modules/typescript/bin/tsc --noEmit --pretty false
node node_modules/eslint/bin/eslint.js src/app/synaptic/intelligence-without-permission src/components/synaptic/intelligence-without-permission src/lib/synaptic/intelligence-without-permission
```

For browser acceptance, install/use Playwright with Chrome and set `PLAYWRIGHT_MODULE` to its module if it is outside the project. Set `REVIEW_BASE_URL` to the local production preview and run `node scripts/synaptic/browser-review.cjs`. `REVIEW_REFRESH_PREVIEWS=1` regenerates scene previews and their content revisions. `REVIEW_OUTPUT` selects the local capture/report directory. `REVIEW_ONLY_WHEEL=1` checks plain-wheel zoom, limits and reset on all ten scenes, plus article scrolling outside the canvas. The script does not publish or send anything externally.

Scientific data generators live in `scripts/synaptic/`. They preserve source identifiers and hashes. mpmath 1.3.0 is required for zeta and molecular alignment. Algebraic identity verification is separate from rebuilding the released formal proof repositories.
