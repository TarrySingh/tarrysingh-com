---
name: ship-deploy
description: Preflight checklist before pushing to production. Runs build, smoke tests, Lighthouse, OG-card check, and confirms DNS/HTTPS posture. Tags v-version and pushes.
---

You are running the launch checklist. Be exhaustive; this is the only step where being slow is the right move.

## Steps

1. **Confirm the user wants to ship.** A single sentence: *"Ready to ship vX.Y.Z to production? Branch: <branch>, commit: <sha>."* Wait for explicit yes.

2. **Local checks**
   - `pnpm typecheck` — zero errors.
   - `pnpm lint` — zero errors, warnings acknowledged.
   - `pnpm build` — completes; note the build size table.
   - `pnpm test` (Playwright smoke) — green.

3. **Run `/plate-verify` against each page.**
4. **Run `/content-audit`.**
5. **Run `/demo-rehearsal`** against the latest Vercel preview.

   Any FAIL in any of (3)–(5) aborts the ship.

6. **Open-Graph check**
   - Visit `/og/memphis` and `/og/symphony` directly. Both render visually correct.
   - Paste each canonical URL into the Twitter / X card validator and the LinkedIn post inspector. Cards render correctly.

7. **DNS / HTTPS posture**
   - `dig +short tarrysingh.com` → Vercel A record.
   - `curl -sI https://tarrysingh.com` → 200, HSTS header present, valid cert.
   - `curl -sI https://www.tarrysingh.com` → 301 to apex.

8. **Performance**
   - Run Lighthouse against `/`, `/memphis`, `/symphony` on desktop and mobile. All four scores ≥ 95.
   - If any score is < 95, surface to user before shipping.

9. **Final git hygiene**
   - All changes committed; working tree clean.
   - Commit message convention: `feat(scope): summary` (Conventional Commits).
   - Cut a tag: `git tag -a vX.Y.Z -m "Synaptic Cartography vX.Y.Z"`.
   - `git push --follow-tags origin main`.

10. **Post-ship**
    - Vercel deployment goes live; confirm with `curl -sI https://tarrysingh.com | grep -i x-vercel-id`.
    - Smoke-test the production URL one more time.
    - Notify Tarry with the production URL and a one-line summary of what shipped.

## Report format

```
SHIP PREFLIGHT — vX.Y.Z

Typecheck:     PASS
Lint:          PASS
Build:         PASS (X.X MB total, largest route Y KB)
Smoke test:    PASS

Plate verify:    PASS / blockers: N
Content audit:   PASS / hits: N
Demo rehearsal:  PASS / fails: N

OG cards:      PASS
DNS/HTTPS:     PASS  cert expires YYYY-MM-DD
Lighthouse:    /, /memphis, /symphony all ≥ 95

GIT: tagged vX.Y.Z, pushed to origin/main

VERDICT:  SHIPPED  /  HELD
```

If `HELD`, surface the blockers and stop. Do not push to production with red lights.
