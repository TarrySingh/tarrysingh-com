# Editorial calendar · Dispatches

The rolling queue of forthcoming Dispatches. Updated whenever a
piece moves status. **Target cadence: one post every three days.**

## Status legend

- **planned** — slug + working title only; no draft yet
- **drafting** — `content/blog/_drafts/<slug>.mdx` exists; body in progress
- **audited** — `npm run blog:audit <slug>` passes; ready to promote
- **published** — live at `https://www.tarrysingh.com/blog/<slug>`

## Q2 2026 queue

| Target ship | Status     | Slug                                          | Working title / shape | Category |
|-------------|-----------|-----------------------------------------------|------------------------|----------|
| 2026-05-12  | published  | `why-i-rebuilt-this-site-around-a-studio`      | Why I rebuilt this site around a studio — the framing piece on why tarrysingh.com is a studio not a CV. | Essays |
| 2026-05-08  | published  | `notes-on-drawing-a-chip-that-sleeps`          | Notes on drawing a chip that sleeps — eleven-draft walkthrough of MEMPHIS Plate I. | Studio |
| 2026-05-16  | planned    | `dispatches-launch-and-what-i-want-this-list-to-be` | Dispatches launch + the kind of letter I want this list to be. One italic close: *"Quietly written. Infrequent."* | Notes |
| 2026-05-19  | planned    | `the-cost-of-a-poster`                          | Why the first MEMPHIS plate looked beautiful and meant nothing — the line between marketing image and working drawing. | Studio |
| 2026-05-22  | planned    | `eight-experiments-in-one-tab`                  | The /experiments page as a working catalogue — what made the cut, what didn't. | Essays |
| 2026-05-25  | planned    | `i-stopped-using-emoji-in-prose`                | A short piece on the discipline of editorial type — Gloock, Plex Serif, no emoji, what changes. | Notes |
| 2026-05-28  | planned    | `the-symphony-reviewer`                         | What the first SYMPHONY technical reviewer caught that I didn't — to be written after the review actually happens. | Essays |
| 2026-05-31  | planned    | `the-eu-horizon-form-as-a-design-brief`         | What 25 pages of EU bureaucratic frontmatter taught me about constraint-driven design. | Studio |
| 2026-06-03  | planned    | `q2-2026-where-the-pace-is-now`                  | Three-month roundup of the AI capability frontier — Q2 update to the Insane Pace dashboard. | Essays |

## How to use this file

1. When you start a new draft: change its row status to `drafting`. Optionally add notes in parentheses next to the title.
2. When `npm run blog:audit` passes: change to `audited`.
3. When `npm run blog:promote` finishes and the commit lands on main: change to `published`. Add the canonical URL if it differs from the slug-default.
4. Reorder the table whenever your priorities shift.

## Conventions

- Slugs are kebab-case, lowercase, words separated by hyphens.
- Categories: `Essays`, `Notes`, `Studio`.
- Three-day gaps between ship dates by default. A piece that runs long bumps the next one out (don't compress).
- "Planned" rows can carry just a working title — they don't need a draft yet.
