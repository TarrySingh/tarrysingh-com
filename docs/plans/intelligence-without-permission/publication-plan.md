# Intelligence Without Permission · publication plan

Prepared 9 September 2026 following the author's visual approval. This is the release plan; the article and cards remain local and unpublished.

## Publish as one release

- Article: `/synaptic/intelligence-without-permission`.
- Full-width cover card at the top of the homepage Studio selection, preserving the existing cards.
- The same cover card on the Synaptic index, preserving all existing articles.
- All manuscript files, 38 figures, scientific datasets, ten interactive 3D instruments, preview images, cover artwork and downloadable reading copy.
- Canonical metadata, social preview, search indexing and sitemap entry.

The shared `IntelligenceFeature` component is already integrated into `src/app/(main)/page.tsx` and `src/app/synaptic/page.tsx`. Its cover, premise and counts are implemented and have been reviewed on desktop and mobile. The narrative audit was rerun on 9 September: **40,376 words and 38 placements**.

## 1. Assemble the release against current production source

The working checkout is on `main` at `a412f43`. A read-only remote check on 9 September returned `origin/main` at `6f52f19933f36f293b7d498a395860d613dc3040`. Resolve the remote revision again when assembly begins.

Create an isolated branch named `codex/publish-intelligence-without-permission` from the current remote main. Transfer only the article's paths and the necessary shared integration changes:

- `content/synaptic/intelligence-without-permission/`
- `public/synaptic/intelligence-without-permission/`
- `src/app/synaptic/intelligence-without-permission/`
- `src/components/synaptic/intelligence-without-permission/`
- `src/lib/synaptic/intelligence-without-permission/`
- `src/components/synaptic/IntelligenceFeature.tsx` and its CSS module
- Article scripts and production documentation
- Small homepage, Synaptic index, sitemap and dependency changes

Apply the homepage and index insertions to their current versions. The older local homepage incorporates upstream cards for preview purposes; copying that whole file would risk reverting newer production work. Preserve Loop Harness and every current production route. Compare dependencies with upstream and carry only missing Three.js runtime/types requirements and the corresponding lockfile changes. Unrelated PANORAIMA, middleware, scratch files and other working changes are outside this release.

## 2. Complete publication metadata and evidence checks

- Recheck the exact Navier–Stokes announcement/formulation and formal artefact, Fermat formalisation, zeta result, scientific access claims and other time-sensitive statements against primary sources at release time. Preserve the distinctions between announcements, checked results and scenarios. Update the evidence cut-off only when that review is actually completed.
- Remove the article's draft `robots: { index: false, follow: false }` restriction for the production release.
- Add an explicit canonical article URL and matching Open Graph URL using the site's verified canonical host. Existing metadata uses `https://tarrysingh.com`; confirm production redirects before finalising it.
- Add the article to the current sitemap and verify robots permits indexing. Preserve all existing sitemap entries.
- Align visible edition/date wording, social metadata and the Markdown reading copy with the final release. Verify the cover URL is publicly fetchable and produces the intended large-image preview.

## 3. Verify the integrated release

Run the manuscript/figure audit, numerical/content tests, scoped lint, TypeScript checks and production build on the assembled branch. Test the production preview for the article, homepage card, Synaptic index, existing Studio destinations and representative existing routes.

Confirm all ten instruments launch; ordinary wheel zoom, keyboard controls, magnification limits and touch pinch behave correctly; shared links and downloads resolve; mobile framing remains readable; and the no-JavaScript and print alternatives remain available. Verify source/data/image URLs, canonical and social tags, sitemap inclusion and the absence of draft noindex on the production candidate. Measure initial page weight and representative loading behavior on the integrated build; previous local checks are not production field measurements.

## 4. Release through the existing hosting workflow

Use the existing repository and Vercel deployment destination. Confirm the current project/production-branch mapping and capture the deployment currently serving the domain. Once the release candidate passes, merge the scoped change through the repository's normal production flow and inspect the resulting deployment before treating the release as complete.

The article and both card placements must ship together so no newly advertised route is missing. A broad deployment of the stale working checkout is not part of this plan.

## 5. Verify the public result

Check the public article returns HTTP 200, both cards reach it, all ten 3D instruments and their assets load, the reading copy downloads, share metadata uses the correct article URL and cover, and the sitemap includes the article. Check that existing Studio destinations still work. Record the released commit and deployment URL in the production report.

If a release regression is found, restore the previously verified Vercel deployment while fixing the scoped change. Completion is the verified public article, homepage Studio card and Synaptic index card, with live links handed back to the author.
