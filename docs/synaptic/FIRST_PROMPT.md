# FIRST_PROMPT

The single, optimal message to paste into a fresh Claude Code session inside `~/Github/tarrysingh-com` after the handover bundle has been installed at the repo root.

Tuned for:
- A new session with **no prior context**.
- An assistant capable of file I/O, shell execution, and web fetch.
- A user (Tarry) who values 10–20× productivity and dislikes ceremony.
- The agreed sequencing: **Symphony microsite first, MEMPHIS second.**

---

## ✦ Copy from here ✦

```
We are starting Session 1 of building tarrysingh.com — a single online site that
presents two Horizon-Europe-style deep-tech proposals (SYMPHONY first, MEMPHIS
second) to EU programme reviewers and deep-tech VCs. The handover bundle is
already installed at the repo root. Nine finished plates, a 25-page EU dossier,
the full EU-portal text snippets, design tokens, slash commands and a 9-folio
strategy stack are all in place.

DO THIS, IN ORDER, WITHOUT ASKING PERMISSION TO READ FILES:

1. Read these six files end-to-end:
     CLAUDE.md
     HANDOVER.md
     docs/01-vision.md
     docs/03-tech-stack.md
     docs/06-roadmap.md
     docs/10-plate-library.md

2. Mentally study these reference assets (do not modify them):
     proposals/SYMPHONY/interactive.html
     proposals/SYMPHONY/plates/plate-II-cover-planisphere.png   (the hero)
     proposals/SYMPHONY/plates/plate-I-vision.png               (vision banner)
     proposals/SYMPHONY/plates/plate-III-consortium.png         (consortium)
     proposals/SYMPHONY/dossier/Symphony-Additional-Information-Dossier.docx
       — the canonical narrative; what's on the page must agree with what's
         in this dossier.

3. Run the Phase 0 audit from docs/06-roadmap.md:
     - git status, git log --oneline -20
     - inspect package.json (or note its absence)
     - identify current framework, package manager, deployed state
     - if a dev server exists, attempt to start it and capture any errors

4. Reply to me with EXACTLY this structure, nothing more, nothing less:

     ── Current state ──
     One paragraph (≤ 4 sentences) on what this repo already contains.

     ── Stack decision ──
     One sentence: keep current stack, or adopt the recommended Next.js 14
     stack from docs/03-tech-stack.md, with the reason.

     ── First three commits I propose ──
     Numbered list of the first three commits I would make today, all
     targeting Phase 1 → Phase 2 (Symphony). Each line:
       <commit message> — <one-sentence rationale> — <est. minutes>

     ── Open question(s) ──
     ≤ 2 bullets, only if there is a genuine blocker. Otherwise: "None."

5. STOP and wait for me to confirm before writing any code or shipping any
   commit.

SEQUENCING (strict):
   - Phase 1 + Phase 2 deliver /symphony in its entirety, including all nine
     Symphony plates in their correct page positions per docs/10-plate-library.md.
   - MEMPHIS does not begin until /symphony is shipped on a Vercel preview
     and I have signed off on it. Do not scaffold /memphis routes early.

VOICE RULES (in force from this turn):
   - British English. Programme, behaviour, co-localised, organisation.
   - No emojis, no exclamation marks, no marketing words. Forbidden-word list
     in docs/08-content-strategy.md.
   - Lead with the claim, then evidence, then caveat.
   - Each page ends with one italic line.
   - When a page covers ground already in proposals/SYMPHONY/eu-portal/, quote
     the portal text — do not paraphrase it.

CONSTRAINTS:
   - Do not modify any of the nine plates in proposals/*/plates/, ever.
   - Do not regenerate the dossier .docx — link to it, do not rewrite it.
   - Do not edit any file in proposals/SYMPHONY/eu-portal/ without explicit
     instruction (they are EU-portal-frozen).
   - Do not commit any .env file.
   - Do not install dependencies until your stack decision is confirmed.

You have everything you need. Begin.
```

## ✦ End of copy ✦

---

## Why this prompt is shaped the way it is

Every line of the prompt does specific work:

1. **Frames the goal in one sentence** including the *Symphony-first, MEMPHIS-second* sequence so the model never starts MEMPHIS scaffolding speculatively.
2. **Bans permission-seeking on reads** so we don't lose three turns to "shall I open CLAUDE.md?".
3. **Specifies six files** (not five) for the first read — the new sixth is `docs/10-plate-library.md` because the plate inventory is now non-trivial.
4. **Names the five canonical reference assets** explicitly — interactive HTML + hero plate + vision banner + consortium plate + dossier — so the model has the studio voice locked in before its first code suggestion.
5. **Defers writing code** until step 4 in the locked four-section reply structure.
6. **Locks Phase 1 + Phase 2 to Symphony only**, and bars `/memphis` scaffolding until I sign off.
7. **Asserts the EU-portal texts as frozen** — this is the single biggest preventable defect (a Claude Code session paraphrasing the portal text into a "friendlier" website version), and it must be blocked at prompt time.
8. **Ends with "Begin"** — pure action trigger, no ceremony.

## Variants

If the repo is **empty**:

> Replace step 3 with: *"This is a fresh repo. Skip Phase 0; proceed to Phase 1 of `docs/06-roadmap.md`. Your first commit should scaffold the Next.js app per `docs/03-tech-stack.md` and import the design tokens. Reply with the proposed scaffold tree before running anything."*

If the repo **already serves a personal site**:

> Insert before step 4: *"The repo currently serves a personal site at the apex domain. Do not break it. Propose where the Synaptic Cartography content lives (subroute `/synaptic`, subdomain, or replacement) and wait for me to decide before writing code."*

If you want **everything Symphony shipped today in one session**:

> Append: *"Aggressive mode: assume the recommended stack, no audit, run all of Phase 1 and Phase 2 in this session, and only stop at the Vercel-preview URL for `/symphony`. MEMPHIS is still out of scope."*

## What the assistant should NEVER say in reply to the first prompt

- "Would you like me to start with the cover page or the proposal pages?"
- "I'll just verify the files exist first."
- "Let me know your preferred package manager."
- "Should I use a UI library?"
- "Shall I rewrite the abstract to be more web-friendly?"  ← always reject
- "Let me scaffold both `/symphony` and `/memphis` routes."  ← always reject
- Anything that defers the four-section reply structure specified in step 4.

If the assistant produces any of these, paste:

> *Re-read step 4 of my last message. Reply in the four-section structure. Nothing more.*

---

## A second-message template (use after the first reply lands)

After Claude Code has produced the four-section reply and you've reviewed it, send:

```
Approved. Proceed with commits 1–3 in order, all targeting /symphony.
After commit 3, run /plate-verify against whatever you've built and report
the result. Then stop and wait.
```

That establishes the working rhythm for the rest of the project: ship → verify → stop → instruct. Three of those loops gets you to a Vercel preview of `/symphony` with the cover plate, vision banner and one consortium spread visible. Six of them gets you to a complete `/symphony` page. Eight gets you to `/memphis`. Ten gets you to launch.
