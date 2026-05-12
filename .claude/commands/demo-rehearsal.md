---
name: demo-rehearsal
description: Walk the live site (preview or production) as each of the three audience personas in docs/02-audience.md, score the kill-shots in docs/07-demo-killshots.md, and write a short readiness report.
---

You are performing a final-stage rehearsal of the site's effect on its intended audience. You play three roles in sequence.

## Steps

1. **Open the target URL** (ask the user; default to the most recent Vercel preview).

2. **Read `docs/02-audience.md` and `docs/07-demo-killshots.md`** before doing anything else.

3. **Walk the site as Persona A (Dr. Marta Brunetti, EIC panellist).**
   - Land on `/` from an email link.
   - 5-second test: what is the page about? What is the studio's voice? Is there any marketing tone?
   - Click `MEMPHIS`. Within 30 seconds, can you find the five §1.2.2 advances, the decision milestones, and the critical uncertainty?
   - Click `SYMPHONY`. Same test for O1–O5 and the §1.2 ceiling argument.
   - Score the "advocate / abstain / attack" decision Marta would make. Justify in one sentence.

4. **Walk the site as Persona B (Tom Reeves, deep-tech VC).**
   - Land on `/symphony` directly via a hypothetical Slack-paste.
   - 3-minute test: does the page articulate why current LLM-coding agents are *structurally* capped, with the SWE-bench re-evaluation visible?
   - Find the 30-minute Calendly link. How many clicks?
   - Score "email asking for meeting / close tab".

5. **Walk the site as Persona C (Dr. Anjali Rao, peer scientist).**
   - Land on `/symphony` from a Bluesky link.
   - Click every citation. Confirm primary sources resolve.
   - Inspect the planisphere. Is it shareable on its own as a screenshot?
   - Score "share with quote / scroll past".

6. **Run the four kill-shots from `docs/07-demo-killshots.md`:**
   - Kill-shot 1: Cover-in-stillness — screenshot at 300ms and 1500ms; differ only by hairlines + captions?
   - Kill-shot 2: SYMPHONY baton swing — does it transition over ~800ms with no jump?
   - Kill-shot 3: MEMPHIS phase toggle — does AWAKE → SLEEP take ~1s with the body copy crossfading?
   - Kill-shot 4: Print to PDF — does `⌘P` produce a clean 3-page brief?

## Report format

```
DEMO REHEARSAL — tarrysingh.com
URL: <target>
Date: YYYY-MM-DD

Persona A (Marta, EIC):     [advocate / abstain / attack]   notes: …
Persona B (Tom, VC):        [email / tab close]              notes: …
Persona C (Anjali, peer):   [share / scroll]                 notes: …

Kill-shot 1 (stillness):    PASS / FAIL    notes: …
Kill-shot 2 (baton swing):  PASS / FAIL    notes: …
Kill-shot 3 (phase toggle): PASS / FAIL    notes: …
Kill-shot 4 (print PDF):    PASS / FAIL    notes: …

LAUNCH READINESS:  SHIP  /  ITERATE  /  HOLD
```

Be brutal. The site exists for these three people. If it doesn't move them, it isn't done.
