# Blog publishing scripts

Three small Node scripts that turn the publishing workflow from
"remember the YAML frontmatter and hope" into "type three commands
and ship."

## Usage

```bash
npm run blog:new <kebab-slug>      # scaffold a fresh draft
npm run blog:audit <kebab-slug>    # voice + style + frontmatter check
npm run blog:promote <kebab-slug>  # draft → live, build, print push hints
```

Drafts live in `content/blog/_drafts/<slug>.mdx`. They're
git-tracked but **not** read by `getAllPosts()` — only
`content/blog/*.mdx` (top-level) shows on the site.

## Audit rules

The audit script enforces:

- **Frontmatter:** title · date (ISO) · category (`Essays` | `Notes` | `Studio`) · excerpt (80–700 chars) are all required.
- **Voice:** forbidden SaaS / hedge / surveillance vocabulary
  (`leverage`, `seamless`, `synergy`, `thought leader`, …) errors out.
- **British English:** advisory warning when the body uses
  American spellings (-ize, -or, -er, color, center, etc.).
- **One italic close per page:** advisory warning if the final
  paragraph doesn't carry a `*…*` or `_…_` italic phrase.
- **Body length:** warning when body < 600 chars.
- **No double spaces.**

Run `npm run blog:audit -- <slug>` to see the full output. Errors
exit non-zero; warnings don't.

## Editorial calendar

Forthcoming Dispatches live in `docs/editorial/calendar.md`,
ordered by target ship date. Update whenever a piece moves from
"planned" → "drafting" → "audited" → "published".
