# Cross-repo handover: `tarrysingh-com` → `realai-crm` webhook bridge

**Audience:** A Claude session (or human engineer) working in the
sibling repo at `~/Documents/GitHub/realai-crm/`.

**Goal:** Stand up the receiving end of the Dispatches newsletter
bridge that `tarrysingh-com` already POSTs to. Two artifacts:

1. A new webhook route at `/api/webhooks/tarrysingh`, cloned verbatim
   from the existing `/api/webhooks/earthscan` route, with three
   token substitutions.
2. A new published `Cadence` named **Tarrysingh Welcome**, 3 steps
   over 14 days, queued automatically on every newsletter signup.

When both land, `tarrysingh-com`'s subscribe form moves from
log-only mode to live CRM enrolment.

---

## Wire-protocol contract (what tarrysingh-com sends)

POST `https://crm.realai.eu/api/webhooks/tarrysingh`

Headers:

- `Content-Type: application/json`
- `X-Tarrysingh-Signature: sha256=<hex>` — HMAC-SHA256 of the raw
  body, lowercase hex digest, signed with `TARRYSINGH_WEBHOOK_SECRET`
  (must match `CRM_WEBHOOK_SECRET` on the tarrysingh-com side).
- `User-Agent: tarrysingh-com/dispatches`

Body — `LeadPayloadV1` (identical shape to earthscan's contract):

```ts
{
  "version": "v1",
  "eventId": "<uuid-v4>",
  "ts": "<ISO 8601>",
  "source": "newsletter" | "unsubscribe",
  "lead": {
    "email": "string"   // required
  },
  "context": {
    "consent": true,
    "referrer": "string?",
    "tags": ["dispatches", "tarrysingh-com"],
    "utm": { "source", "medium", "campaign", "term", "content" },
    "page": "/blog | /",
    "ip": "string?",
    "userAgent": "string?"
  }
}
```

The canonical TypeScript types live at
`tarrysingh-com/src/lib/crm/types.ts` — copy them into realai-crm if
the receiver wants a strong type. The earthscan handler already
parses the same shape (it pre-dates this contract), so the existing
validation works unchanged.

Source values the receiver must handle:

- `newsletter` — enrol into the **Tarrysingh Welcome** cadence.
- `unsubscribe` — call `addGlobalUnsubscribe(emailAddress)` and
  short-circuit; do not enrol.

---

## Step 1 — Clone the earthscan route

File to copy:

`realai-crm/src/app/api/webhooks/earthscan/route.ts`
→ `realai-crm/src/app/api/webhooks/tarrysingh/route.ts`

Then `git mv` is fine; or just `cp` and edit. Required text
substitutions (every occurrence, case-sensitive):

| Old token | New token |
|---|---|
| `earthscan` | `tarrysingh` |
| `Earthscan` | `Tarrysingh` |
| `EARTHSCAN` | `TARRYSINGH` |
| `X-Earthscan-Signature` | `X-Tarrysingh-Signature` |

A single `sed` invocation handles it:

```bash
sed -i '' \
  -e 's/earthscan/tarrysingh/g' \
  -e 's/Earthscan/Tarrysingh/g' \
  -e 's/EARTHSCAN/TARRYSINGH/g' \
  realai-crm/src/app/api/webhooks/tarrysingh/route.ts
```

That should produce a file that:

- Reads `process.env.TARRYSINGH_WEBHOOK_SECRET` for HMAC.
- Reads `X-Tarrysingh-Signature` header.
- Reads `process.env.TARRYSINGH_WEBHOOK_OWNER_USER_ID` for the owner
  fallback.
- Reads `process.env.TARRYSINGH_AUTO_ENROLL_CADENCE_ID` for the
  newsletter auto-enrol.

No other code changes needed — the rest of the contract (LeadPayload
shape, dedupe, contact upsert, unsubscribe path) is identical.

### Verification

Hit the new route with a hand-crafted POST and verify:

- Bad sig → 401 `invalid_signature`.
- Missing sig header → 401 `missing_signature`.
- Empty body → 400 `invalid_json`.
- `{ "version": "v1", "eventId": "test-1", "source": "newsletter", "lead": { "email": "you@example.com" } }` signed with the test secret →
  - First call: 200 `{ ok: true, deduped: false, contactId: "...", created: true, autoEnroll: { enrolled: true, ... } }`.
  - Second call with same `eventId`: 200 `{ ok: true, deduped: true }`.
  - Third call with new `eventId` but same email: 200 `{ ok: true, deduped: false, created: false, autoEnroll: { enrolled: false, reason: "already_enrolled" } }`.
- Same payload with `"source": "unsubscribe"`: 200 with `unsubscribe.applied: true`.

---

## Step 2 — Env vars (Vercel project `realai-crm`)

Add to **Development**, **Preview**, and **Production**:

| Key | Value |
|---|---|
| `TARRYSINGH_WEBHOOK_SECRET` | Generate via `openssl rand -hex 32`. Must match `CRM_WEBHOOK_SECRET` on tarrysingh-com's Vercel project (`tarrysingh-com-zdmb` under the `dkailab` team). |
| `TARRYSINGH_WEBHOOK_OWNER_USER_ID` | Tarry's user id in the CRM (`prisma.user.findFirst({ where: { email: "tarry.singh@gmail.com" }})`). |
| `TARRYSINGH_AUTO_ENROLL_CADENCE_ID` | Filled in **after** Step 3 (the cadence doesn't exist yet). |

Rotate the secret only by setting it on both Vercel projects
simultaneously — there is no in-flight signature window.

---

## Step 3 — Build the "Tarrysingh Welcome" cadence

In the CRM UI (or via direct Prisma insert if you prefer). Three
steps, all owned by Tarry, organisation `RealAI`, published, active.
Subject lines and bodies below; voice is the studio's — calm, no
emojis, no SaaS gloss, one italic close per email.

### Step 1 — Day 0 (sent within ~5 minutes of signup)

Subject: `Welcome to Dispatches`

Body (Plex Serif for body, no signature image, signed simply "T."):

```
Hello,

You just added your address to the Dispatches list at tarrysingh.com
— quietly written, infrequent.

A reasonable expectation: you'll hear from me once every few weeks
when something on the wall changes. A new plate goes up, a proposal
ships, a piece of work resolves into something I can write about
honestly. No funnel sequences, no "did you see my last email?",
no upsells.

What's currently in the studio:

— MEMPHIS and SYMPHONY, two Horizon Europe deep-tech proposals on
  hippocampal-memristive computation and neuromimetic software
  systems. The plate library is at tarrysingh.com/synaptic.
— Eight live experimental dashboards under tarrysingh.com/experiments,
  including the Q1 2026 Insane Pace of AI executive terminal and the
  PANORAIMA consortium tracker.
— Whatever I'm reading and arguing about on LinkedIn — the
  Dispatches will pull from that pile when something is worth
  putting on paper.

If at any point this isn't useful to you, the unsubscribe link at
the foot of every email removes you in one click. No retention
pop-ups, no follow-up. The plate stays on the wall whether or not
you read it.

— T.
```

### Step 2 — Day 5

Subject: `Plate I — the chip that sleeps`

Body:

```
A short note while you're new to the list.

Plate I of the Synaptic Cartography series is a memristive chip
that learns by sleeping. The energy story is real — about four
orders of magnitude below a GPU per inference, projected. The
sleep dynamics are a hypothesis. Everything italic on the plate
is a claim, not a fact, which is the whole point of using italic.

If you want to see it move:

tarrysingh.com/synaptic/memphis

Eleven drafts to get from "this is a beautiful poster" to "this is
a working drawing that a reviewer can argue with honestly". The
shortest summary of what changed is in the Dispatch I wrote about
the process:

tarrysingh.com/blog/notes-on-drawing-a-chip-that-sleeps

— T.
```

### Step 3 — Day 14

Subject: `What the studio does next`

Body:

```
A fortnight in, and I owe you a short orientation on what to expect
from this list over the next few months.

Three series of writing are in rotation:

— Plates. New entries in the Synaptic Cartography sequence as
  proposals graduate from sketches to working drawings. SYMPHONY
  goes through its first technical review next month; the response
  will produce a Dispatch on what the reviewers caught that I
  didn't.
— Notes. Short pieces on the craft itself — drawing things that
  don't exist yet, working with editorial type instead of UI type,
  the discipline of one italic close per page. The first of these
  is on the wall now:
  tarrysingh.com/blog/why-i-rebuilt-this-site-around-a-studio
— Strategy. A handful of long-form essays I owe the field on AI
  strategy, market structure, and the geopolitics of compute. Less
  frequent, longer half-life.

If a particular thread is more useful to you than the others, reply
to any Dispatch and tell me. I read every response. The list is
small enough to stay personal — and the intent is to keep it that
way.

— T.
```

### After the cadence is published

1. Copy its `id` (UUID in the URL bar, or `prisma.cadence.findFirst({ where: { name: "Tarrysingh Welcome" }})`).
2. Set `TARRYSINGH_AUTO_ENROLL_CADENCE_ID` to that id on all three
   Vercel environments.
3. Redeploy `realai-crm` so the env change takes effect.

---

## Step 4 — Wire the tarrysingh-com Vercel project

In Vercel `tarrysingh-com-zdmb` (under team `dkailab`):

- Set `CRM_WEBHOOK_URL=https://crm.realai.eu/api/webhooks/tarrysingh`.
- Set `CRM_WEBHOOK_SECRET=<same value as TARRYSINGH_WEBHOOK_SECRET>`.
- Set `CRM_UNSUBSCRIBE_TOKEN_SECRET=<openssl rand -hex 32; a different value>`.

Redeploy main. The structured-log fallback in
`tarrysingh-com/src/app/api/newsletter/subscribe/route.ts` switches
off automatically once `CRM_WEBHOOK_URL` is set.

---

## Replaying the gap

Between the moment tarrysingh-com goes live with the Dispatches form
and the moment this CRM endpoint is alive, any subscribe events get
written to Vercel runtime logs as structured JSON tagged
`crm.lead.unconfigured_log_only`. To replay them by hand:

```bash
# In the tarrysingh-com Vercel project
vercel logs --since=2026-05-13 | grep crm.lead.unconfigured_log_only | jq .
```

For each line, build a `LeadPayloadV1` with the same `email`,
`source: "newsletter"`, the original `context.utm` / `referrer`,
and a fresh `eventId`. POST it (HMAC-signed) to the new
`/api/webhooks/tarrysingh` endpoint. The CRM dedups on `eventId`,
so re-running the replay script twice is safe.

---

## Out of scope for this brief

- LinkedIn auto-syndication (P4) — separate work, separate brief.
- Double opt-in — current contract is single-confirmation; if it
  ever needs to be DOI, the change is contained to the CRM side
  (the receiver replies with an unconfirmed-pending state and
  fires a confirmation email; the tarrysingh-com side doesn't
  change).
- Rate limiting — earthscan doesn't have any beyond the in-process
  dedup map. If Dispatches becomes a target, add Upstash-backed
  IP throttling at the CRM edge.
