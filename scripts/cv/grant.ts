/* ============================================================
   EXECUTIVE PROFILE · ACCESS GRANTS (local CLI)

   npm run cv:grant -- issue --name "Jane Doe" --firm "Example Search" \
                             [--email jane@example.com] [--scopes dossier,pdf:exec-cv | all] \
                             [--days 30] [--max 5] [--label "..."] [--note "..."] \
                             [--request <request-id>]
   npm run cv:grant -- revoke <grant-id | ref>
   npm run cv:grant -- list
   npm run cv:grant -- requests

   issue     creates a grant and prints its access code ONCE. Only
             HMAC-SHA256(code, CV_CODE_PEPPER) is stored; the code cannot
             be recovered later. Send it yourself. With --request, name,
             firm and email are taken from that access request (flags win)
             and the request is marked approved.
   revoke    ends a grant immediately (every request re-checks the grant).
   list      grants with status, redemptions, views and downloads.
   requests  access requests waiting for a decision.

   Reads SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and CV_CODE_PEPPER from
   .env.local. CV_CODE_PEPPER must be the SAME value as on the deployment
   the code is meant for, or the code will not redeem there.

   Exit codes: 0 ok · 1 failure · 2 usage.
   ============================================================ */

import { loadEnvConfig } from "@next/env"
import { parseArgs } from "node:util"
import { generateCode, grantRef, hashCode, normaliseCode, UUID_RE } from "../../src/lib/cv/access/codes"
import { KNOWN_SCOPES, MIN_SECRET_LENGTH } from "../../src/lib/cv/access/env"
import { createServiceClient } from "../../src/lib/supabase/server"

loadEnvConfig(process.cwd(), true)

const SITE = "https://tarrysingh.com/curriculumvitae/access"
const DAY_MS = 86_400_000

function usage(message?: string): never {
  if (message) console.error(`cv:grant · ${message}`)
  console.error(
    [
      "usage:",
      '  npm run cv:grant -- issue --name "Jane Doe" --firm "Example Search" [--email <e>] [--scopes <list|all>] [--days 30] [--max 5] [--label <t>] [--note <t>] [--request <id>]',
      "  npm run cv:grant -- revoke <grant-id | G-REF>",
      "  npm run cv:grant -- list",
      "  npm run cv:grant -- requests",
      `scopes: ${KNOWN_SCOPES.join(", ")}`,
    ].join("\n"),
  )
  process.exit(2)
}

function die(message: string): never {
  console.error(`cv:grant · ${message}`)
  process.exit(1)
}

function db() {
  try {
    return createServiceClient()
  } catch {
    return die("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
  }
}

function pepper(): string {
  const p = process.env.CV_CODE_PEPPER
  if (!p || p.length < MIN_SECRET_LENGTH) {
    die(
      `CV_CODE_PEPPER must be set in .env.local (at least ${MIN_SECRET_LENGTH} characters) ` +
        "and equal to the value on the deployment these codes are for",
    )
  }
  return p
}

function dateOf(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "-"
}

function pad(s: string | number | null | undefined, n: number): string {
  const text = String(s ?? "-")
  return text.length > n ? `${text.slice(0, n - 1)}~` : text.padEnd(n)
}

type GrantListRow = {
  id: string
  recruiter_name: string | null
  firm: string | null
  scopes: string[]
  max_redemptions: number
  redemptions: number
  expires_at: string
  revoked_at: string | null
  created_at: string
}

async function issue(argv: string[]) {
  const { values } = parseArgs({
    args: argv,
    options: {
      name: { type: "string" },
      firm: { type: "string" },
      email: { type: "string" },
      scopes: { type: "string" },
      days: { type: "string" },
      max: { type: "string" },
      label: { type: "string" },
      note: { type: "string" },
      request: { type: "string" },
    },
    strict: true,
    allowPositionals: false,
  })
  const client = db()
  const secret = pepper()

  let name = values.name?.trim()
  let firm = values.firm?.trim()
  let email = values.email?.trim()
  let note = values.note?.trim()
  const requestId = values.request?.trim()

  if (requestId) {
    if (!UUID_RE.test(requestId)) usage("--request must be a request id (uuid)")
    const { data, error } = await client
      .from("profile_access_requests")
      .select("name, email, firm, role_title, mandate_summary")
      .eq("id", requestId)
      .maybeSingle()
    if (error) die(`request lookup failed: ${error.message}`)
    if (!data) die("no access request with that id")
    name ||= data.name
    firm ||= data.firm ?? undefined
    email ||= data.email
    note ||= [data.role_title, data.mandate_summary].filter(Boolean).join(" · ").slice(0, 500) || undefined
  }

  if (!name) usage("--name is required")
  if (!firm) usage("--firm is required (it is printed on the PDF footer)")

  const days = values.days === undefined ? 30 : Number(values.days)
  if (!Number.isInteger(days) || days < 1 || days > 180) usage("--days must be a whole number from 1 to 180")
  const max = values.max === undefined ? 5 : Number(values.max)
  if (!Number.isInteger(max) || max < 1 || max > 50) usage("--max must be a whole number from 1 to 50")

  const scopes =
    !values.scopes || values.scopes === "all"
      ? [...KNOWN_SCOPES]
      : [...new Set(values.scopes.split(",").map((s) => s.trim()).filter(Boolean))]
  const unknown = scopes.filter((s) => !(KNOWN_SCOPES as readonly string[]).includes(s))
  if (unknown.length > 0) usage(`unknown scope: ${unknown.join(", ")}`)
  if (scopes.length === 0) usage("--scopes is empty")
  if (!scopes.includes("dossier")) {
    console.error("cv:grant · note: no 'dossier' scope, so this code opens downloads but not the dossier pages")
  }

  const expiresAt = new Date(Date.now() + days * DAY_MS).toISOString()

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode()
    const codeHash = await hashCode(normaliseCode(code) as string, secret)
    const { data, error } = await client
      .from("profile_grants")
      .insert({
        code_hash: codeHash,
        label: values.label?.trim() || null,
        recruiter_name: name,
        recruiter_email: email || null,
        firm,
        mandate_note: note || null,
        scopes,
        max_redemptions: max,
        expires_at: expiresAt,
        source_request_id: requestId || null,
      })
      .select("id")
      .single()
    if (error) {
      if (error.code === "23505" && attempt < 2) continue // code_hash collision: draw again
      die(`could not create the grant: ${error.message}`)
    }

    if (requestId) {
      await client.from("profile_access_requests").update({ status: "approved" }).eq("id", requestId)
    }

    console.log("")
    console.log("Access code (shown once; it cannot be recovered):")
    console.log("")
    console.log(`  ${code}`)
    console.log("")
    console.log(`Ref ${grantRef(data.id)} · ${name}, ${firm}`)
    console.log(`Expires ${dateOf(expiresAt)} (${days} days) · up to ${max} redemptions`)
    console.log(`Scopes: ${scopes.join(", ")}`)
    console.log(`Send the code yourself, with ${SITE}`)
    console.log("")
    return
  }
}

async function resolveGrant(arg: string): Promise<GrantListRow> {
  const client = db()
  const cols =
    "id, recruiter_name, firm, scopes, max_redemptions, redemptions, expires_at, revoked_at, created_at"
  if (UUID_RE.test(arg)) {
    const { data, error } = await client.from("profile_grants").select(cols).eq("id", arg).maybeSingle()
    if (error) die(`lookup failed: ${error.message}`)
    if (!data) die("no grant with that id")
    return data as GrantListRow
  }
  if (!/^G-[0-9A-Fa-f]{6}$/.test(arg)) usage("give a grant id (uuid) or a reference such as G-3F9A1C")
  const { data, error } = await client.from("profile_grants").select(cols)
  if (error) die(`lookup failed: ${error.message}`)
  const matches = ((data ?? []) as GrantListRow[]).filter(
    (g) => grantRef(g.id) === arg.toUpperCase(),
  )
  if (matches.length === 0) die(`no grant with reference ${arg}`)
  if (matches.length > 1) die(`reference ${arg} is ambiguous; use the full grant id`)
  return matches[0]
}

async function revoke(argv: string[]) {
  if (argv.length !== 1) usage("revoke takes one grant id or reference")
  const grant = await resolveGrant(argv[0])
  const label = `${grantRef(grant.id)} (${[grant.recruiter_name, grant.firm].filter(Boolean).join(", ") || "unnamed"})`
  if (grant.revoked_at) {
    console.log(`${label} was already revoked on ${dateOf(grant.revoked_at)}.`)
    return
  }
  const client = db()
  const { error } = await client
    .from("profile_grants")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", grant.id)
    .is("revoked_at", null)
  if (error) die(`could not revoke: ${error.message}`)
  await client.from("profile_events").insert({ grant_id: grant.id, kind: "revoke", path: "cli" })
  console.log(`Revoked ${label}. Open sessions end on their next request.`)
}

async function list() {
  const client = db()
  const { data: grants, error } = await client
    .from("profile_grants")
    .select("id, recruiter_name, firm, scopes, max_redemptions, redemptions, expires_at, revoked_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) die(`list failed: ${error.message}`)
  const { data: activity, error: aErr } = await client
    .from("profile_activity_v")
    .select("grant_id, views, downloads, last_activity_at")
  if (aErr) die(`activity failed: ${aErr.message}`)
  const byGrant = new Map(
    (activity ?? []).map((a) => [a.grant_id as string, a as { views: number; downloads: number; last_activity_at: string | null }]),
  )

  if (!grants || grants.length === 0) {
    console.log("No grants yet.")
    return
  }
  const now = Date.now()
  console.log(
    [pad("REF", 9), pad("NAME", 22), pad("FIRM", 22), pad("STATUS", 8), pad("EXPIRES", 11), pad("USED", 6), pad("VIEWS", 6), pad("DLS", 4), "LAST SEEN"].join(" "),
  )
  for (const g of grants as GrantListRow[]) {
    const a = byGrant.get(g.id)
    const status = g.revoked_at ? "revoked" : Date.parse(g.expires_at) <= now ? "expired" : "active"
    console.log(
      [
        pad(grantRef(g.id), 9),
        pad(g.recruiter_name, 22),
        pad(g.firm, 22),
        pad(status, 8),
        pad(dateOf(g.expires_at), 11),
        pad(`${g.redemptions}/${g.max_redemptions}`, 6),
        pad(a?.views ?? 0, 6),
        pad(a?.downloads ?? 0, 4),
        dateOf(a?.last_activity_at ?? null),
      ].join(" "),
    )
  }
}

async function requests() {
  const { data, error } = await db()
    .from("profile_access_requests")
    .select("id, created_at, name, firm, email, role_title")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(100)
  if (error) die(`list failed: ${error.message}`)
  if (!data || data.length === 0) {
    console.log("No new access requests.")
    return
  }
  for (const r of data) {
    console.log(
      `${dateOf(r.created_at)}  ${r.name}, ${r.firm ?? "-"}  <${r.email}>${r.role_title ? `  (${r.role_title})` : ""}`,
    )
    console.log(`            npm run cv:grant -- issue --request ${r.id} --days 30`)
  }
}

async function main() {
  const [command, ...rest] = process.argv.slice(2)
  switch (command) {
    case "issue":
      return issue(rest)
    case "revoke":
      return revoke(rest)
    case "list":
      return list()
    case "requests":
      return requests()
    default:
      return usage(command ? `unknown command "${command}"` : undefined)
  }
}

main().catch((err: unknown) => {
  console.error(`cv:grant · ${err instanceof Error ? err.message : "failed"}`)
  process.exit(1)
})
