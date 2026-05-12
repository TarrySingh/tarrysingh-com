# EU portal text snippets — Symphony

This folder holds the verbatim text I (the previous session) wrote for the EU EIC Pathfinder portal's *Submission Form* fields. They are **not** copy for the website. They are the source of truth for what Tarry filed (or is about to file) with the European Commission, and they are kept here so the microsite never accidentally contradicts the submitted text.

Use these documents in two ways on the microsite:

1. As **canonical content** when a section of the page covers the same ground (abstract, ethics, security, AI Act). The voice and the specific numbers in these files have been tuned to portal review; the page can quote from them but should not rewrite them.
2. As **evidence of submission discipline** if a reviewer or VC asks to see the formal materials. Each file is portal-ready (under its character limit, in British English, with the EU-specific framings in place).

## Files in this folder

| File | Portal field | Character budget | Used at character count |
|---|---|---|---|
| `00-title-options.md` | *Title* | n/a | 3 options provided |
| `01-keywords.md` | *Keywords* | 200 | 192 |
| `02-abstract.md` | *Abstract* | 2,000 | 1,996 |
| `03-security-self-assessment.md` | *Security self-assessment* | 5,000 | 3,646 |
| `04-ethics-self-assessment.md` | *Ethics self-assessment* | 5,000 | 4,882 |
| `05-compliance-statement.md` | *Compliance with ethical principles and relevant legislations* | 5,000 | 4,864 |

## Rules

- Treat these texts as **frozen** unless Tarry says otherwise. If you need to evolve a phrase on the website, do so on the website — don't edit the portal snippet here without an explicit instruction.
- If the consortium changes (country, partner, or lead), the country-attribution line in `05-compliance-statement.md` is the canonical reference everywhere else on the site.
- The **forbidden-words list** in `docs/08-content-strategy.md` was derived from these texts. If a new portal text needs to be written, run `/content-audit` against the result before saving here.
