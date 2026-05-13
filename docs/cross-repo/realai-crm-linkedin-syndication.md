# Cross-repo handover: `tarrysingh-com` → `realai-crm` LinkedIn syndication

**Audience:** A Claude session (or human engineer) working in the
sibling repo at `~/Documents/GitHub/realai-crm/`.

**Goal:** Stand up the receiving end of the Dispatches LinkedIn
syndication that `tarrysingh-com` already POSTs to. Three pieces:

1. A `LinkedInAccount` Prisma model + OAuth flow so a `User` can
   connect their LinkedIn (scope `w_member_social`) and we can
   store + refresh the access token.
2. A receiving webhook at `/api/integrations/linkedin/syndicate`
   that HMAC-verifies the payload from tarrysingh-com, dedups,
   and calls LinkedIn's `ugcPosts` v2 API to publish.
3. A preview/admin surface in the CRM UI so Tarry can connect his
   LinkedIn account once and see the connection state.

**Greenfield**: LinkedIn OAuth wiring does not exist in realai-crm
today. This brief specifies everything that needs to be added.

---

## Wire-protocol contract (what tarrysingh-com sends)

POST `https://crm.realai.eu/api/integrations/linkedin/syndicate`

Headers:

- `Content-Type: application/json`
- `X-Tarrysingh-Linkedin-Signature: sha256=<hex>` — HMAC-SHA256 of
  the raw body, lowercase hex digest, signed with
  `TARRYSINGH_LINKEDIN_SYNDICATION_SECRET` (must match
  `LINKEDIN_SYNDICATION_SECRET` on the tarrysingh-com side).
- `User-Agent: tarrysingh-com/dispatches`

Body — `SyndicationPayloadV1`:

```ts
{
  "version": "v1",
  "eventId": "dispatches:why-i-rebuilt-this-site-around-a-studio:2026-05-12",
  "ts": "2026-05-13T11:30:00.000Z",
  "source": "dispatches",
  "post": {
    "slug": "why-i-rebuilt-this-site-around-a-studio",
    "title": "Why I rebuilt this site around a studio",
    "excerpt": "After thirty years of building, I wanted a home that reads less like a portfolio and more like a working room…",
    "url": "https://tarrysingh.com/blog/why-i-rebuilt-this-site-around-a-studio",
    "category": "Essays",
    "tags": ["studio", "writing"]
  },
  "options": {
    "visibility": "PUBLIC",
    "closingLine": "→ tarrysingh.com/blog/why-i-rebuilt-this-site-around-a-studio"
  }
}
```

The canonical TypeScript types live at
`tarrysingh-com/src/lib/linkedin/types.ts`. Copy them into
realai-crm if the receiver wants a strong type.

---

## Step 1 — Add `LinkedInAccount` Prisma model

```prisma
model LinkedInAccount {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // OAuth state
  linkedinId    String   @unique          // "person URN" (e.g. "urn:li:person:abc123")
  accessToken   String                    // encrypted at rest — see encryption note below
  refreshToken  String?                   // not all LinkedIn flows return one
  expiresAt     DateTime                  // accessToken expiry, used for proactive refresh
  scope         String                    // space-delimited scopes granted
  organizationId String?                  // optional, future-proofing for org pages

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastUsedAt    DateTime?

  @@index([userId])
  @@index([expiresAt])
}
```

Add the back-reference on `User`:

```prisma
model User {
  // ...existing fields...
  linkedinAccount LinkedInAccount?
}
```

Generate the migration:

```bash
cd ~/Documents/GitHub/realai-crm
npx prisma migrate dev --name add_linkedin_account
```

### Encryption note

`accessToken` and `refreshToken` should be encrypted at rest before
insert. The simplest path that matches what RealAI-CRM already does
for other secrets: AES-256-GCM with `LINKEDIN_TOKEN_ENCRYPTION_KEY`
(32 random bytes, hex-encoded in the env). Wrap the read/write
through `src/lib/crypto/secure-string.ts` (if it exists) or add it.

---

## Step 2 — OAuth flow

Two routes plus a connect button in the CRM settings page.

### `/api/auth/linkedin/init`

```ts
// realai-crm/src/app/api/auth/linkedin/init/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth" // existing CRM auth
import { randomBytes } from "node:crypto"

const SCOPES = ["w_member_social", "openid", "profile", "email"]

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const state = randomBytes(24).toString("hex")
  const clientId = process.env.LINKEDIN_CLIENT_ID!
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI!

  // Store the state in a short-lived cookie for CSRF
  const res = NextResponse.redirect(
    new URL(
      `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `scope=${encodeURIComponent(SCOPES.join(" "))}`,
    ),
  )
  res.cookies.set("li_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 min
    path: "/api/auth/linkedin",
  })
  return res
}
```

### `/api/auth/linkedin/callback`

```ts
// realai-crm/src/app/api/auth/linkedin/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto/secure-string"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const cookieState = req.cookies.get("li_oauth_state")?.value

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/settings/integrations?linkedin=invalid_state", req.url),
    )
  }

  // 1. Exchange code → token
  const tokenRes = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    },
  )
  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL("/settings/integrations?linkedin=token_exchange_failed", req.url),
    )
  }
  const token = (await tokenRes.json()) as {
    access_token: string
    expires_in: number
    refresh_token?: string
    refresh_token_expires_in?: number
    scope: string
  }

  // 2. Fetch the user's LinkedIn ID
  const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  if (!meRes.ok) {
    return NextResponse.redirect(
      new URL("/settings/integrations?linkedin=me_fetch_failed", req.url),
    )
  }
  const me = (await meRes.json()) as { sub: string }
  const linkedinId = `urn:li:person:${me.sub}`

  // 3. Upsert
  await prisma.linkedInAccount.upsert({
    where: { userId: session.user.id },
    update: {
      linkedinId,
      accessToken: encrypt(token.access_token),
      refreshToken: token.refresh_token
        ? encrypt(token.refresh_token)
        : null,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
      scope: token.scope,
      updatedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      linkedinId,
      accessToken: encrypt(token.access_token),
      refreshToken: token.refresh_token
        ? encrypt(token.refresh_token)
        : null,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
      scope: token.scope,
    },
  })

  return NextResponse.redirect(
    new URL("/settings/integrations?linkedin=connected", req.url),
  )
}
```

### Settings UI

Add a card to `/settings/integrations` showing:

- "LinkedIn — connected as `<linkedinId>`, scopes `<scope>`,
  expires `<relative time>`"
- "Disconnect" button (DELETE on the account row)
- "Connect LinkedIn" button when not connected → links to
  `/api/auth/linkedin/init`

---

## Step 3 — Syndication receiver

```ts
// realai-crm/src/app/api/integrations/linkedin/syndicate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto/secure-string"

export const runtime = "nodejs"

const SHARE_COMMENTARY_MAX = 3000

function verifySignature(
  raw: string,
  secret: string,
  header: string | null,
): boolean {
  if (!header) return false
  const match = header.match(/^sha256=([a-f0-9]+)$/i)
  if (!match) return false
  const expected = createHmac("sha256", secret).update(raw, "utf8").digest("hex")
  if (expected.length !== match[1].length) return false
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(match[1], "hex"))
  } catch {
    return false
  }
}

interface SyndicationPayload {
  version: "v1"
  eventId: string
  ts: string
  source: "dispatches"
  post: {
    slug: string
    title: string
    excerpt: string
    url: string
    category: string
    tags: string[]
  }
  options?: {
    visibility?: "PUBLIC" | "CONNECTIONS"
    closingLine?: string
  }
}

const eventDedup = new Map<string, number>() // 24h in-process map

export async function POST(req: NextRequest) {
  const secret = process.env.TARRYSINGH_LINKEDIN_SYNDICATION_SECRET
  if (!secret) return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 503 })

  const ownerId = process.env.TARRYSINGH_LINKEDIN_OWNER_USER_ID
  if (!ownerId) return NextResponse.json({ ok: false, error: "no_owner_configured" }, { status: 503 })

  const raw = await req.text()
  if (
    !verifySignature(
      raw,
      secret,
      req.headers.get("x-tarrysingh-linkedin-signature"),
    )
  ) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 })
  }

  let payload: SyndicationPayload
  try {
    payload = JSON.parse(raw) as SyndicationPayload
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  if (payload.version !== "v1" || !payload.eventId || !payload.post?.slug) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 })
  }

  // Dedup
  const seenAt = eventDedup.get(payload.eventId)
  if (seenAt && Date.now() - seenAt < 24 * 60 * 60 * 1000) {
    return NextResponse.json({ ok: true, deduped: true })
  }
  eventDedup.set(payload.eventId, Date.now())

  // Fetch the account
  const account = await prisma.linkedInAccount.findUnique({
    where: { userId: ownerId },
  })
  if (!account) {
    return NextResponse.json(
      { ok: false, error: "linkedin_not_connected" },
      { status: 412 },
    )
  }

  // Proactive refresh if within 5 min of expiry
  let accessToken = decrypt(account.accessToken)
  if (account.expiresAt.getTime() - Date.now() < 5 * 60 * 1000 && account.refreshToken) {
    const refreshed = await refreshLinkedInToken(decrypt(account.refreshToken))
    if (refreshed) {
      accessToken = refreshed.access_token
      await prisma.linkedInAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encrypt(refreshed.access_token),
          expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
          lastUsedAt: new Date(),
        },
      })
    }
  }

  // Render shareCommentary
  const closingLine = payload.options?.closingLine ?? `→ ${payload.post.url}`
  const commentary = (
    `${payload.post.title}\n\n${payload.post.excerpt}\n\n${closingLine} · #${payload.post.category.toLowerCase()} · #dispatches`
  ).slice(0, SHARE_COMMENTARY_MAX)

  // Call ugcPosts
  const ugcRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: account.linkedinId,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: commentary },
          shareMediaCategory: "ARTICLE",
          media: [{
            status: "READY",
            originalUrl: payload.post.url,
            title: { text: payload.post.title },
            description: { text: payload.post.excerpt },
          }],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility":
          payload.options?.visibility ?? "PUBLIC",
      },
    }),
  })

  if (!ugcRes.ok) {
    const body = await ugcRes.text().catch(() => "")
    return NextResponse.json(
      { ok: false, error: `linkedin_${ugcRes.status}`, body },
      { status: 502 },
    )
  }

  const postUrn = ugcRes.headers.get("x-linkedin-id") ?? null
  const postUrl = postUrn
    ? `https://www.linkedin.com/feed/update/${encodeURIComponent(postUrn)}/`
    : null

  return NextResponse.json({
    ok: true,
    deduped: false,
    eventId: payload.eventId,
    postUrn,
    postUrl,
  })
}

async function refreshLinkedInToken(refreshToken: string) {
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) return null
  return (await res.json()) as {
    access_token: string
    expires_in: number
    refresh_token?: string
  }
}
```

---

## Step 4 — Env vars (Vercel project `realai-crm`)

| Key | Value |
|---|---|
| `LINKEDIN_CLIENT_ID` | From the LinkedIn developer app. |
| `LINKEDIN_CLIENT_SECRET` | Same. |
| `LINKEDIN_REDIRECT_URI` | `https://crm.realai.eu/api/auth/linkedin/callback` |
| `LINKEDIN_TOKEN_ENCRYPTION_KEY` | `openssl rand -hex 32` |
| `TARRYSINGH_LINKEDIN_SYNDICATION_SECRET` | Must match `LINKEDIN_SYNDICATION_SECRET` in tarrysingh-com. |
| `TARRYSINGH_LINKEDIN_OWNER_USER_ID` | CRM user-id of Tarry (must own a `LinkedInAccount`). |

LinkedIn developer app:

1. Create an app at <https://www.linkedin.com/developers/apps>.
2. Request `Sign In with LinkedIn using OpenID Connect` product.
3. Request `Share on LinkedIn` product (granted manually after a review).
4. Add `https://crm.realai.eu/api/auth/linkedin/callback` to authorised redirect URLs.
5. Copy client id + secret into Vercel.

---

## Step 5 — Wire tarrysingh-com Vercel

After the CRM endpoint is live:

- Set `LINKEDIN_SYNDICATION_URL=https://crm.realai.eu/api/integrations/linkedin/syndicate`
- Set `LINKEDIN_SYNDICATION_SECRET=<same value as TARRYSINGH_LINKEDIN_SYNDICATION_SECRET>`
- Set `LINKEDIN_ADMIN_TOKEN=<openssl rand -hex 32>` (deploy-only)

Redeploy. Test from a curl:

```bash
curl -X POST https://tarrysingh.com/api/integrations/linkedin/preview \
  -H "X-Tarrysingh-Admin-Token: $LINKEDIN_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"why-i-rebuilt-this-site-around-a-studio"}'
```

Verify the returned `shareCommentary` reads well. Then fire for real:

```bash
curl -X POST https://tarrysingh.com/api/integrations/linkedin/syndicate \
  -H "X-Tarrysingh-Admin-Token: $LINKEDIN_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"why-i-rebuilt-this-site-around-a-studio"}'
```

A 200 with `outcome: "delivered"` + `postUrn` + `postUrl` means
LinkedIn published.

---

## Out of scope for this brief

- **Auto-publish on commit.** Once the manual `curl` path works,
  a separate GitHub Action (or a Vercel cron) can iterate new
  MDX commits and fire the syndicate endpoint. That's a 30-line
  add when ready.
- **LinkedIn organisation pages** (Real AI corporate page). The
  schema already has `organizationId?` on `LinkedInAccount` to
  support this; the OAuth scope is different (`w_organization_social`)
  and the `author` URN format becomes `urn:li:organization:<id>`.
- **Carousel posts, polls, document posts.** ugcPosts supports
  them but `ARTICLE` is enough for blog syndication.
- **Analytics callback** (likes / reactions / impressions). The
  ugcPosts API doesn't push these — they'd need a periodic pull
  via the LinkedIn share statistics endpoint.

---

## Replay procedure

Any syndication captured during the gap window (before the CRM
endpoint is live) gets logged on the tarrysingh-com Vercel project
as a structured line tagged `linkedin.syndicate.unconfigured_log_only`.
To replay:

```bash
vercel logs --since=2026-05-13 \
  | grep linkedin.syndicate.unconfigured_log_only \
  | jq .
```

For each line, fire the `/api/integrations/linkedin/syndicate`
endpoint with `{ "slug": "<slug>" }`. The CRM dedups on `eventId`
which is shaped `dispatches:<slug>:<date>` — so the second call
returns `deduped: true` instead of creating a duplicate post.
